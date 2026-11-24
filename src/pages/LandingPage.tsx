import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Music,
  Video,
  Gamepad2,
  ShieldCheck,
  AtSign,
  Lock,
  Mail,
  User,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Logo } from '../components/layout/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC<{ defaultMode?: 'login' | 'signup' }> = ({
  defaultMode = 'login',
}) => {
  const navigate = useNavigate();
  const { currentUser, isAuthLoading, login, signup, checkUsernameAvailable } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(defaultMode);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthLoading && currentUser) {
      navigate('/feed');
    }
  }, [currentUser, isAuthLoading, navigate]);

  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/\s+/g, '');
    setUsername(clean);
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);

    if (clean.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    if (!/^[a-z0-9_.]{3,30}$/.test(clean)) {
      setUsernameStatus('invalid');
      return;
    }
    setUsernameStatus('checking');
    checkTimerRef.current = setTimeout(async () => {
      const res = await checkUsernameAvailable(clean);
      setUsernameStatus(res.available ? 'available' : 'taken');
    }, 250);
  };

  const switchMode = (next: 'login' | 'signup' | 'forgot') => {
    setMode(next);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    if (mode === 'login') {
      const res = await login(loginIdentifier, password);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg('Signed in! Loading your feed...');
        navigate('/feed');
      } else {
        setErrorMsg(res.error || 'Incorrect username/email or password.');
      }
      return;
    }

    if (mode === 'signup') {
      if (usernameStatus !== 'available') {
        setIsSubmitting(false);
        setErrorMsg('Please choose a valid, available username.');
        return;
      }
      if (password.length < 6) {
        setIsSubmitting(false);
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
      const res = await signup({
        username,
        email,
        displayName: displayName.trim() || username,
        pass: password,
      });
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg(`Welcome to VYRO, @${username}!`);
        navigate('/feed');
      } else {
        setErrorMsg(res.error || 'Could not create account.');
      }
      return;
    }

    setIsSubmitting(false);
    setSuccessMsg('If this email is registered, recovery instructions have been queued.');
  };

  return (
    <div className="min-h-screen bg-vyro-bg text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Animated Kinetic Ambient Backdrop */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-vyro-primary/25 rounded-full blur-[130px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-40 -right-32 w-[520px] h-[520px] bg-vyro-accent/20 rounded-full blur-[140px] pointer-events-none"
      />

      {/* Main Centered Split Showcase + Auth Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left Column: Kinetic Motion Graphics Phone Preview (Zero Fake Photos) */}
          <div className="hidden lg:flex flex-col items-center justify-center relative">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="relative w-80 h-[520px] rounded-[44px] p-3 glass-panel border-2 border-vyro-border shadow-2xl"
            >
              {/* Inner Mobile UI Preview */}
              <div className="w-full h-full rounded-[34px] bg-slate-950/90 border border-white/5 p-5 flex flex-col justify-between overflow-hidden relative">
                {/* Animated Top Gradient Orb */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-tr from-vyro-primary/40 via-vyro-accent/30 to-vyro-cyan/40 rounded-full blur-2xl"
                />

                <div className="flex items-center justify-between relative z-10">
                  <span className="text-sm font-extrabold gradient-text-primary tracking-wider">
                    VYRO
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    LIVE P2P
                  </span>
                </div>

                {/* Motion Graphic Feature Stack */}
                <div className="space-y-3 relative z-10">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="p-3.5 rounded-2xl glass-card border border-vyro-primary/40 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-vyro-primary to-vyro-accent flex items-center justify-center text-white">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">HD Camera & Reels</p>
                      <p className="text-[10px] text-slate-400">Live filters, stickers & WebP</p>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                    className="p-3.5 rounded-2xl glass-card border border-vyro-cyan/40 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-vyro-cyan to-blue-600 flex items-center justify-center text-white">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">WebRTC Voice & Video</p>
                      <p className="text-[10px] text-slate-400">Encrypted direct peer calls</p>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                    className="p-3.5 rounded-2xl glass-card border border-vyro-accent/40 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white">
                      <Music className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">CC0 Audio Visualizer</p>
                      {/* Animated Equalizer Bars */}
                      <div className="flex items-end gap-1 h-3 mt-1">
                        {[0.6, 1, 0.4, 0.9, 0.5, 0.8].map((h, i) => (
                          <motion.span
                            key={i}
                            animate={{ height: ['30%', `${h * 100}%`, '30%'] }}
                            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
                            className="w-1 bg-vyro-accent rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                    className="p-3.5 rounded-2xl glass-card border border-emerald-500/40 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">In-Chat Arcade</p>
                      <p className="text-[10px] text-slate-400">Chess, Tic-Tac-Toe & Trivia</p>
                    </div>
                  </motion.div>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 relative z-10">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>100% Real Profiles • Zero Bots</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Clean Instagram-Style Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-sm mx-auto space-y-4"
          >
            {/* Primary Auth Card */}
            <div className="glass-panel rounded-3xl p-7 border border-vyro-border shadow-2xl space-y-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Logo size="lg" />
                <p className="text-xs text-slate-400">
                  {mode === 'login'
                    ? 'Sign in to connect, create, and call.'
                    : mode === 'signup'
                    ? 'Sign up to see photos, reels, and messages from real people.'
                    : 'Enter your email to recover your account.'}
                </p>
              </div>

              <AnimatePresence mode="wait">
                <motion.form
                  key={mode}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                  onSubmit={handleSubmit}
                  className="space-y-3.5"
                >
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                      <Check className="w-4 h-4 flex-shrink-0" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {mode === 'login' ? (
                    <Input
                      placeholder="Username or email"
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      icon={<AtSign className="w-4 h-4" />}
                      required
                    />
                  ) : mode === 'signup' ? (
                    <>
                      <div>
                        <Input
                          placeholder="Username (unique)"
                          value={username}
                          onChange={(e) => handleUsernameChange(e.target.value)}
                          icon={<AtSign className="w-4 h-4" />}
                          required
                        />
                        {usernameStatus !== 'idle' && (
                          <div className="mt-1 text-[11px] flex items-center gap-1">
                            {usernameStatus === 'checking' && (
                              <span className="text-slate-400">Checking...</span>
                            )}
                            {usernameStatus === 'available' && (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <Check className="w-3 h-3" /> @{username} available
                              </span>
                            )}
                            {usernameStatus === 'taken' && (
                              <span className="text-rose-400">Username taken or reserved</span>
                            )}
                            {usernameStatus === 'invalid' && (
                              <span className="text-amber-400">Use 3-30 letters, numbers, . or _</span>
                            )}
                          </div>
                        )}
                      </div>

                      <Input
                        placeholder="Full Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        icon={<User className="w-4 h-4" />}
                        required
                      />

                      <Input
                        placeholder="Email address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={<Mail className="w-4 h-4" />}
                        required
                      />
                    </>
                  ) : (
                    <Input
                      placeholder="Email address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      icon={<Mail className="w-4 h-4" />}
                      required
                    />
                  )}

                  {mode !== 'forgot' && (
                    <Input
                      placeholder="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      icon={<Lock className="w-4 h-4" />}
                      required
                    />
                  )}

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full py-2.5 font-bold"
                    isLoading={isSubmitting}
                  >
                    {mode === 'login' ? 'Log In' : mode === 'signup' ? 'Sign Up' : 'Send Recovery Link'}
                  </Button>
                </motion.form>
              </AnimatePresence>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-vyro-border" />
                <span className="text-[10px] font-bold uppercase text-slate-500">OR</span>
                <div className="h-px flex-1 bg-vyro-border" />
              </div>

              <div className="text-center space-y-2">
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </button>
                )}

                <div>
                  <Link
                    to="/feed"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-vyro-cyan hover:underline"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Browse Public Feed</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Switch Card (Classic Clean Instagram Pattern) */}
            <div className="glass-card rounded-2xl p-4 border border-vyro-border text-center text-xs text-slate-300">
              {mode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="text-vyro-primary font-extrabold hover:underline"
                  >
                    Sign up
                  </button>
                </span>
              ) : (
                <span>
                  Have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-vyro-primary font-extrabold hover:underline"
                  >
                    Log in
                  </button>
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="py-6 px-4 text-center text-[11px] text-slate-500 flex flex-wrap items-center justify-center gap-5 relative z-10">
        <span>© 2026 VYRO</span>
        <Link to="/legal/privacy" className="hover:text-slate-300">Privacy</Link>
        <Link to="/legal/terms" className="hover:text-slate-300">Terms</Link>
        <Link to="/feed" className="hover:text-slate-300">Explore</Link>
      </footer>
    </div>
  );
};
