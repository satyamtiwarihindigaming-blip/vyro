import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Logo } from '../components/layout/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { soundEngine } from '../lib/soundEngine';

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
    soundEngine.playHapticClick();
    setMode(next);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playPop();
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
        displayName: displayName || username,
        pass: password,
      });
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg('Account created successfully! Taking you to feed...');
        navigate('/feed');
      } else {
        setErrorMsg(res.error || 'Signup failed. Please try again.');
      }
      return;
    }

    if (mode === 'forgot') {
      setIsSubmitting(false);
      setSuccessMsg('If an account matches that email, a password reset link has been dispatched.');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 select-none overflow-hidden">
      {/* Living Silk Mesh Canvas */}
      <div className="living-silk-mesh" aria-hidden="true">
        <div className="silk-orb-indigo" />
        <div className="silk-orb-violet" />
        <div className="silk-orb-rose" />
        <div className="silk-orb-cyan" />
      </div>
      <div className="silk-grain-overlay" aria-hidden="true" />

      {/* Centered Pure Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10 py-6"
      >
        <div className="liquid-glass-elevated rounded-[32px] p-6 sm:p-8 shadow-2xl border border-white/20">
          {/* Logo & Headline */}
          <div className="flex flex-col items-center justify-center mb-6 text-center">
            <Logo size="lg" />
            <p className="text-xs text-white/50 mt-2 font-medium tracking-wide">
              Create, Connect, Express
            </p>
          </div>

          {/* Segmented Sliding Tabs */}
          <div className="relative flex p-1 rounded-full bg-white/[0.08] border border-white/15 mb-6">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`relative flex-1 py-2.5 text-xs font-semibold transition-colors z-10 ${
                mode === 'login' ? 'text-slate-950 font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              {mode === 'login' && (
                <motion.div
                  layoutId="authTabPill"
                  className="absolute inset-0 rounded-full bg-white shadow-md -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`relative flex-1 py-2.5 text-xs font-semibold transition-colors z-10 ${
                mode === 'signup' ? 'text-slate-950 font-bold' : 'text-white/60 hover:text-white'
              }`}
            >
              {mode === 'signup' && (
                <motion.div
                  layoutId="authTabPill"
                  className="absolute inset-0 rounded-full bg-white shadow-md -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <span>Create Account</span>
            </button>
          </div>

            {/* Alert Banners */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2"
                >
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <>
                  <div className="space-y-1">
                    <Input
                      label="Unique Handle"
                      placeholder="username (e.g. satyam)"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      required
                      autoComplete="username"
                    />
                    <div className="flex items-center justify-between px-1 text-[11px]">
                      <span className="text-white/40">Lowercase, digits, dots or underscores</span>
                      {usernameStatus === 'checking' && (
                        <span className="text-amber-400 font-medium">Checking...</span>
                      )}
                      {usernameStatus === 'available' && (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Available
                        </span>
                      )}
                      {usernameStatus === 'taken' && (
                        <span className="text-rose-400 font-semibold">Already Taken</span>
                      )}
                      {usernameStatus === 'invalid' && (
                        <span className="text-rose-400 font-semibold">Invalid Format</span>
                      )}
                    </div>
                  </div>

                  <Input
                    label="Display Name"
                    placeholder="Your Full Name or Alias"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </>
              )}

              {mode === 'login' && (
                <Input
                  label="Username or Email"
                  placeholder="e.g. satyam or admin@vyro.world"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                />
              )}

              {mode !== 'forgot' && (
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full mt-4 font-semibold text-sm"
              >
                <span>
                  {mode === 'login'
                    ? 'Enter VYRO Platform'
                    : mode === 'signup'
                    ? 'Create Creator Account'
                    : 'Send Password Reset'}
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>

            {/* Quick Helper Links */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
              <Link to="/legal/privacy" className="hover:text-white transition">
                Privacy
              </Link>
              <Link to="/legal/terms" className="hover:text-white transition">
                Terms
              </Link>
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="text-white hover:underline font-medium"
              >
                {mode === 'login' ? 'Need an account? Register' : 'Already have account? Sign in'}
              </button>
            </div>
          </div>
        </motion.div>
    </div>
  );
};
