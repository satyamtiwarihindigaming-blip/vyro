import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const TEST_PORT = '3099';
const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'vyro-test-'));
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

async function req(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function waitForHealth() {
  for (let i = 0; i < 20; i++) {
    try {
      const r = await req('/api/health');
      if (r.status === 200) return r.data;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw new Error('Server did not start in time');
}

async function runTests() {
  const serverProc = spawn('node', ['server.js'], {
    env: { ...process.env, PORT: TEST_PORT, VYRO_DATA_DIR: TEST_DATA_DIR },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  serverProc.stderr.on('data', (d) => console.error('SERVER ERR:', d.toString()));

  try {
    const health = await waitForHealth();
    assert.equal(health.status, 'ok');
    assert.ok(health.usersCount <= 2, 'Only founder admin users should exist (no fake profiles)');
    assert.equal(health.postsCount, 0, 'No fake posts should exist');
    console.log('✅ 1. Fresh DB check passed (0 fake profiles, 0 fake posts)');

    // 2. Admin login (both satyam and vyro_admin)
    const satyamLogin = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail: 'satyam', pass: 'satyam123' }),
    });
    assert.equal(satyamLogin.status, 200);
    assert.equal(satyamLogin.data.user.role, 'admin');

    const adminLogin = await req('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail: 'vyro_admin', pass: 'VyroAdmin@2026' }),
    });
    assert.equal(adminLogin.status, 200);
    assert.equal(adminLogin.data.user.role, 'admin');
    assert.equal(adminLogin.data.user.isVerified, true);
    assert.equal(adminLogin.data.user.isPro, true);
    assert.ok(adminLogin.data.token);
    const adminToken = adminLogin.data.token;
    console.log('✅ 2. Admin login, Blue Tick & Pro tier verified');

    // 3. Real User signup & duplicate username protection
    const signupRes = await req('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        username: 'satyam_dev',
        displayName: 'Satyam Creator',
        email: 'satyam@example.com',
        pass: 'secure123',
      }),
    });
    assert.equal(signupRes.status, 201);
    assert.equal(signupRes.data.user.avatarUrl, '', 'No fake stock portrait URL');
    assert.equal(signupRes.data.user.isVerified, false);
    assert.equal(signupRes.data.user.isPro, false);
    const userToken = signupRes.data.token;
    const userId = signupRes.data.user.id;

    const dupCheck = await req('/api/auth/check-username?username=SATYAM_DEV');
    assert.equal(dupCheck.data.available, false, 'Case-insensitive duplicate check');
    console.log('✅ 3. User signup, zero fake photo & unique username check passed');

    // 4. Security check: Regular user blocked from Admin routes
    const unauthAdmin = await req('/api/admin/overview', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(unauthAdmin.status, 403, 'Non-admin must get 403 Forbidden');
    console.log('✅ 4. Admin route access control verified (403 Forbidden to non-admin)');

    // 5. Admin grants Blue Tick and Pro Features to user
    const verifyRes = await req(`/api/admin/users/${userId}/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(verifyRes.status, 200);
    assert.equal(verifyRes.data.user.isVerified, true);

    const proRes = await req(`/api/admin/users/${userId}/pro`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ proBadge: 'VIP' }),
    });
    assert.equal(proRes.status, 200);
    assert.equal(proRes.data.user.isPro, true);
    console.log('✅ 5. Admin Blue Tick & Pro unlock passed');

    // 6. Fast search user by username & email privacy check
    const searchRes = await req('/api/users/search?q=satyam_dev');
    assert.equal(searchRes.status, 200);
    assert.equal(searchRes.data.users.length, 1);
    assert.equal(searchRes.data.users[0].username, 'satyam_dev');
    assert.equal(searchRes.data.users[0].email, undefined, 'Email must not leak in public search');
    console.log('✅ 6. Fast username search & email privacy passed');

    // 7. Real Post, Like, Comment & Messaging
    const postRes = await req('/api/posts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ caption: 'Hello VYRO #launch', postType: 'photo', media: [] }),
    });
    assert.equal(postRes.status, 201);

    const msgRes = await req('/api/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ receiverId: adminLogin.data.user.id, content: 'Hi Admin!' }),
    });
    assert.equal(msgRes.status, 201);
    console.log('✅ 7. Post publishing & Direct messaging passed');

    // 8. Real WebRTC Call Signaling
    const callInit = await req('/api/calls/initiate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        receiverId: adminLogin.data.user.id,
        callType: 'video',
        offer: { type: 'offer', sdp: 'fake-sdp-offer-for-test' },
      }),
    });
    assert.equal(callInit.status, 201);
    const callId = callInit.data.call.id;

    const incomingRes = await req('/api/calls/incoming', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(incomingRes.status, 200);
    assert.equal(incomingRes.data.call.id, callId);

    const answerRes = await req(`/api/calls/${callId}/answer`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ answer: { type: 'answer', sdp: 'fake-sdp-answer' } }),
    });
    assert.equal(answerRes.status, 200);
    assert.equal(answerRes.data.call.status, 'connected');

    const iceRes = await req(`/api/calls/${callId}/ice`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({ candidate: { candidate: 'candidate:1', sdpMid: '0' } }),
    });
    assert.equal(iceRes.status, 200);

    const endRes = await req(`/api/calls/${callId}/end`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(endRes.status, 200);
    assert.equal(endRes.data.call.status, 'ended');
    console.log('✅ 8. WebRTC Voice/Video signaling flow passed');

    console.log('\n🎉 ALL INTEGRATION TESTS PASSED!');
  } finally {
    serverProc.kill();
    fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
