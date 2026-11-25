import { loadDB, saveDB, sanitizeUser } from '../db.js';
import { sendJson, parseBody, getAuthUser } from '../utils.js';

function isCreatorAdvantage(user) {
  if (!user) return false;
  const u = user.username?.toLowerCase() || '';
  return (
    user.role === 'admin' ||
    u === 'satyam' ||
    u === 'vyro_admin'
  );
}

function hydrateUserSummary(user) {
  if (!user) return null;
  const isAdvantage = isCreatorAdvantage(user);
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    isVerified: isAdvantage ? true : Boolean(user.isVerified),
    isPro: isAdvantage ? true : Boolean(user.isPro),
    proBadge: isAdvantage ? (user.proBadge || 'Founder') : (user.proBadge || ''),
    role: isAdvantage ? 'admin' : (user.role || 'user'),
  };
}

function hydratePost(db, post, viewerId) {
  const author = db.users.find((u) => u.id === post.userId);
  if (!author) return null;
  const isAdvantage = isCreatorAdvantage(author);

  const realLikes = db.likes.filter((l) => l.postId === post.id).length;
  const realComments = db.comments.filter((c) => c.postId === post.id).length;

  // Creator advantage: 12.4M base likes and 4,820 base comments for admin without fake users in DB
  const likesCount = isAdvantage ? (12480000 + realLikes) : realLikes;
  const commentsCount = isAdvantage ? (4820 + realComments) : realComments;

  const isLiked = viewerId ? db.likes.some((l) => l.postId === post.id && l.userId === viewerId) : false;
  const isSaved = viewerId ? db.saves.some((s) => s.postId === post.id && s.userId === viewerId) : false;

  return {
    ...post,
    user: hydrateUserSummary(author),
    likesCount,
    commentsCount,
    isLiked,
    isSaved,
  };
}

function sanitizePublicUser(user) {
  const safe = sanitizeUser(user);
  if (!safe) return null;
  const { email, ...pub } = safe;
  void email;
  if (isCreatorAdvantage(pub)) {
    pub.followersCount = Math.max(pub.followersCount || 0, 1000000000); // 1 Billion!
    pub.role = 'admin';
    pub.isVerified = true;
    pub.isPro = true;
    pub.proBadge = pub.proBadge || 'Founder';
  }
  return pub;
}

export async function handleSocialRoutes(req, res, pathname, urlObj) {
  const db = loadDB();
  const authUser = getAuthUser(req);
  const viewerId = authUser?.id || null;

  // Fast search users by username or display name
  if (req.method === 'GET' && pathname === '/api/users/search') {
    const q = (urlObj?.searchParams.get('q') || '').trim().toLowerCase().replace(/^@/, '');
    const results = db.users
      .filter((u) => {
        if (!q) return true;
        return (
          u.username.toLowerCase().includes(q) ||
          u.displayName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (!q) return 0;
        const aExact = a.username.toLowerCase() === q ? 2 : a.username.toLowerCase().startsWith(q) ? 1 : 0;
        const bExact = b.username.toLowerCase() === q ? 2 : b.username.toLowerCase().startsWith(q) ? 1 : 0;
        return bExact - aExact;
      })
      .slice(0, 20)
      .map((u) => {
        const pub = sanitizePublicUser(u);
        pub.isFollowing = viewerId
          ? db.follows.some((f) => f.followerId === viewerId && f.followingId === u.id)
          : false;
        return pub;
      });
    return sendJson(res, 200, { users: results });
  }

  // List real registered users
  if (req.method === 'GET' && pathname === '/api/users') {
    const users = db.users.map((u) => {
      const safe = sanitizePublicUser(u);
      safe.isFollowing = viewerId
        ? db.follows.some((f) => f.followerId === viewerId && f.followingId === u.id)
        : false;
      return safe;
    });
    return sendJson(res, 200, { users });
  }

  // Get single user by username
  if (req.method === 'GET' && pathname.startsWith('/api/users/') && !pathname.endsWith('/follow')) {
    const username = decodeURIComponent(pathname.replace('/api/users/', '')).trim().toLowerCase();
    const user = db.users.find((u) => u.username.toLowerCase() === username);
    if (!user) return sendJson(res, 404, { error: 'User not found' });

    const safe = sanitizePublicUser(user);
    safe.isFollowing = viewerId
      ? db.follows.some((f) => f.followerId === viewerId && f.followingId === user.id)
      : false;
    return sendJson(res, 200, { user: safe });
  }

  // Follow / Unfollow a real user
  if (req.method === 'POST' && pathname.startsWith('/api/users/') && pathname.endsWith('/follow')) {
    if (!authUser) return sendJson(res, 401, { error: 'Please sign in to follow users.' });
    const targetId = pathname.replace('/api/users/', '').replace('/follow', '');
    if (targetId === authUser.id) return sendJson(res, 400, { error: 'Cannot follow yourself.' });

    const targetUser = db.users.find((u) => u.id === targetId);
    if (!targetUser) return sendJson(res, 404, { error: 'User not found.' });

    const existingIdx = db.follows.findIndex(
      (f) => f.followerId === authUser.id && f.followingId === targetId
    );

    let isFollowing = false;
    if (existingIdx >= 0) {
      db.follows.splice(existingIdx, 1);
      isFollowing = false;
    } else {
      db.follows.push({ followerId: authUser.id, followingId: targetId, createdAt: new Date().toISOString() });
      isFollowing = true;
    }

    const realFollowers = db.follows.filter((f) => f.followingId === targetId).length;
    targetUser.followersCount = isCreatorAdvantage(targetUser) ? (1000000000 + realFollowers) : realFollowers;
    authUser.followingCount = db.follows.filter((f) => f.followerId === authUser.id).length;
    saveDB();

    return sendJson(res, 200, {
      isFollowing,
      followersCount: targetUser.followersCount,
      followingCount: authUser.followingCount,
    });
  }

  // List visible real posts
  if (req.method === 'GET' && pathname === '/api/posts') {
    const posts = db.posts
      .filter((p) => {
        const author = db.users.find((u) => u.id === p.userId);
        if (!author) return false;
        if (!author.isPrivate) return true;
        if (!viewerId) return false;
        if (viewerId === author.id || authUser?.role === 'admin') return true;
        return db.follows.some((f) => f.followerId === viewerId && f.followingId === author.id);
      })
      .map((p) => hydratePost(db, p, viewerId))
      .filter(Boolean);

    return sendJson(res, 200, { posts });
  }

  // Create real post
  if (req.method === 'POST' && pathname === '/api/posts') {
    if (!authUser) return sendJson(res, 401, { error: 'Please sign in to publish posts.' });
    const body = await parseBody(req);
    const caption = String(body.caption || '').trim().slice(0, 2000);
    const postType = ['photo', 'video', 'reel', 'carousel'].includes(body.postType) ? body.postType : 'photo';
    const media = Array.isArray(body.media) ? body.media : [];

    if (media.length === 0 && !caption) {
      return sendJson(res, 400, { error: 'Post requires media or caption.' });
    }

    const newPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: authUser.id,
      caption,
      postType,
      media,
      location: body.location ? String(body.location).slice(0, 100) : undefined,
      musicTrack: body.musicTrack || undefined,
      sharesCount: 0,
      createdAt: new Date().toISOString(),
    };

    db.posts.unshift(newPost);
    authUser.postsCount = db.posts.filter((p) => p.userId === authUser.id).length;
    saveDB();

    return sendJson(res, 201, { post: hydratePost(db, newPost, authUser.id) });
  }

  // Toggle Like
  if (req.method === 'POST' && pathname.startsWith('/api/posts/') && pathname.endsWith('/like')) {
    if (!authUser) return sendJson(res, 401, { error: 'Please sign in to like posts.' });
    const postId = pathname.replace('/api/posts/', '').replace('/like', '');
    const post = db.posts.find((p) => p.id === postId);
    if (!post) return sendJson(res, 404, { error: 'Post not found.' });

    const idx = db.likes.findIndex((l) => l.postId === postId && l.userId === authUser.id);
    if (idx >= 0) db.likes.splice(idx, 1);
    else db.likes.push({ postId, userId: authUser.id });

    saveDB();

    const author = db.users.find((u) => u.id === post.userId);
    const isAdvantage = isCreatorAdvantage(author);
    const realLikes = db.likes.filter((l) => l.postId === postId).length;
    const likesCount = isAdvantage ? (12480000 + realLikes) : realLikes;

    return sendJson(res, 200, {
      isLiked: idx < 0,
      likesCount,
    });
  }

  // Toggle Save
  if (req.method === 'POST' && pathname.startsWith('/api/posts/') && pathname.endsWith('/save')) {
    if (!authUser) return sendJson(res, 401, { error: 'Please sign in to save posts.' });
    const postId = pathname.replace('/api/posts/', '').replace('/save', '');
    const post = db.posts.find((p) => p.id === postId);
    if (!post) return sendJson(res, 404, { error: 'Post not found.' });

    const idx = db.saves.findIndex((s) => s.postId === postId && s.userId === authUser.id);
    if (idx >= 0) db.saves.splice(idx, 1);
    else db.saves.push({ postId, userId: authUser.id });

    saveDB();
    return sendJson(res, 200, { isSaved: idx < 0 });
  }

  // Comments GET / POST
  if (pathname.startsWith('/api/posts/') && pathname.endsWith('/comments')) {
    const postId = pathname.replace('/api/posts/', '').replace('/comments', '');
    const post = db.posts.find((p) => p.id === postId);
    if (!post) return sendJson(res, 404, { error: 'Post not found.' });

    if (req.method === 'GET') {
      const author = db.users.find((u) => u.id === post.userId);
      const isAdvantage = isCreatorAdvantage(author);

      const realComments = db.comments
        .filter((c) => c.postId === postId)
        .map((c) => {
          const u = db.users.find((usr) => usr.id === c.userId);
          return {
            id: c.id,
            postId: c.postId,
            text: c.text,
            createdAt: c.createdAt,
            user: hydrateUserSummary(u) || { id: c.userId, username: 'deleted', displayName: 'Deleted User', avatarUrl: '', isVerified: false, isPro: false },
          };
        })
        .reverse();

      // For admin posts, provide high-energy fan comments on the fly WITHOUT creating fake database users
      let comments = realComments;
      if (isAdvantage) {
        const dynamicFanComments = [
          {
            id: `dyn_1_${post.id}`,
            postId,
            text: '🔥 Legendary content! Keep crushing it.',
            createdAt: post.createdAt,
            user: { id: 'fan_1', username: 'leo_vibe', displayName: 'Leo', avatarUrl: '', isVerified: true, isPro: false },
          },
          {
            id: `dyn_2_${post.id}`,
            postId,
            text: '1B club on VYRO let\'s gooo! 👑',
            createdAt: post.createdAt,
            user: { id: 'fan_2', username: 'priya_m', displayName: 'Priya', avatarUrl: '', isVerified: false, isPro: true, proBadge: 'Creator' },
          },
          {
            id: `dyn_3_${post.id}`,
            postId,
            text: 'Best reel quality on the platform ⚡',
            createdAt: post.createdAt,
            user: { id: 'fan_3', username: 'aryan_k', displayName: 'Aryan', avatarUrl: '', isVerified: true, isPro: false },
          },
          {
            id: `dyn_4_${post.id}`,
            postId,
            text: 'Pure visual masterpiece ✨',
            createdAt: post.createdAt,
            user: { id: 'fan_4', username: 'sam_tech', displayName: 'Sam', avatarUrl: '', isVerified: false, isPro: false },
          },
        ];
        comments = [...realComments, ...dynamicFanComments];
      }

      return sendJson(res, 200, { comments });
    }

    if (req.method === 'POST') {
      if (!authUser) return sendJson(res, 401, { error: 'Please sign in to comment.' });
      const body = await parseBody(req);
      const text = String(body.text || '').trim().slice(0, 500);
      if (!text) return sendJson(res, 400, { error: 'Comment text is required.' });

      const comment = {
        id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        postId,
        userId: authUser.id,
        text,
        createdAt: new Date().toISOString(),
      };
      db.comments.push(comment);
      saveDB();

      const author = db.users.find((u) => u.id === post.userId);
      const isAdvantage = isCreatorAdvantage(author);
      const realComments = db.comments.filter((c) => c.postId === postId).length;
      const commentsCount = isAdvantage ? (4820 + realComments) : realComments;

      return sendJson(res, 201, {
        comment: {
          ...comment,
          user: hydrateUserSummary(authUser),
        },
        commentsCount,
      });
    }
  }

  // Delete own post (or admin)
  if (req.method === 'DELETE' && pathname.startsWith('/api/posts/')) {
    if (!authUser) return sendJson(res, 401, { error: 'Unauthorized' });
    const postId = pathname.replace('/api/posts/', '');
    const post = db.posts.find((p) => p.id === postId);
    if (!post) return sendJson(res, 404, { error: 'Post not found.' });
    if (post.userId !== authUser.id && authUser.role !== 'admin') {
      return sendJson(res, 403, { error: 'Forbidden' });
    }

    db.posts = db.posts.filter((p) => p.id !== postId);
    db.comments = db.comments.filter((c) => c.postId !== postId);
    db.likes = db.likes.filter((l) => l.postId !== postId);
    db.saves = db.saves.filter((s) => s.postId !== postId);
    const author = db.users.find((u) => u.id === post.userId);
    if (author) author.postsCount = db.posts.filter((p) => p.userId === author.id).length;
    saveDB();
    return sendJson(res, 200, { success: true });
  }

  // Stories GET / POST
  if (pathname === '/api/stories') {
    const nowMs = Date.now();
    // Clean expired stories
    db.stories = db.stories.filter((s) => new Date(s.expiresAt).getTime() > nowMs);

    if (req.method === 'GET') {
      const stories = db.stories
        .map((s) => {
          const author = db.users.find((u) => u.id === s.userId);
          if (!author) return null;
          const isAdvantage = isCreatorAdvantage(author);
          return {
            ...s,
            user: hydrateUserSummary(author),
            viewsCount: isAdvantage ? (14200000 + (s.viewsCount || 0)) : (s.viewsCount || 1),
          };
        })
        .filter(Boolean);
      return sendJson(res, 200, { stories });
    }

    if (req.method === 'POST') {
      if (!authUser) return sendJson(res, 401, { error: 'Please sign in to add a story.' });
      const body = await parseBody(req);
      if (!body.mediaUrl) return sendJson(res, 400, { error: 'Media is required for a story.' });

      const story = {
        id: `st_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        userId: authUser.id,
        mediaUrl: String(body.mediaUrl),
        mediaType: body.mediaType === 'video' ? 'video' : 'image',
        location: body.location ? String(body.location).slice(0, 100) : undefined,
        musicTrack: body.musicTrack || undefined,
        duration: 5,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      db.stories.unshift(story);
      saveDB();
      return sendJson(res, 201, { story: { ...story, user: hydrateUserSummary(authUser) } });
    }
  }

  // Reports POST
  if (req.method === 'POST' && pathname === '/api/reports') {
    if (!authUser) return sendJson(res, 401, { error: 'Please sign in to submit a report.' });
    const body = await parseBody(req);
    const report = {
      id: `rep_${Date.now()}`,
      reporterId: authUser.id,
      targetType: String(body.targetType || 'post'),
      targetId: String(body.targetId || ''),
      reason: String(body.reason || 'Inappropriate content').slice(0, 300),
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    db.reports.unshift(report);
    saveDB();
    return sendJson(res, 201, { report });
  }

  return false;
}
