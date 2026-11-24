import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Mail, Lock, User, AtSign, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'signup',
}) => {
  const { login, signup, checkUsernameAvailable } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(defaultMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validate username format and availability
  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/\s+/g, '');
    setUsername(clean);

    if (clean.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    const validRegex = /^[a-z0-9_.]{3,30}$/;
    if (!validRegex.test(clean)) {
      setUsernameStatus('invalid');
      return;
    }

    const isAvail = checkUsernameAvailable(clean);
    setUsernameStatus(isAvail ? 'available' : 'taken');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    setIsLoading(true);

    if (mode === 'signup') {
      if (usernameStatus !== 'available') {
        setIsLoading(false);
        setErrorMsg('Please select a valid, unique username.');
        return;
      }
      if (password.length < 6) {
        setIsLoading(false);
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }

      const res = await signup({
        username,
        email,
        displayName: displayName || username,
        pass: password,
      });

      setIsLoading(false);
      if (res.success) {
        setSuccessMsg(`Welcome to VYRO, @${username}! Account created.`);
        setTimeout(() => onClose(), 1200);
      } else {
        setErrorMsg(res.error || 'Failed to create account.');
      }
    } else if (mode === 'login') {
      const res = await login(email, password);
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg('Successfully signed in.');
        setTimeout(() => onClose(), 800);
      } else {
        setErrorMsg(res.error || 'Invalid credentials.');
      }
    } else {
      setIsLoading(false);
      setSuccessMsg('Password reset instructions sent to your email.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'signup'
          ? 'Join the VYRO Universe'
          : mode === 'login'
          ? 'Welcome Back to VYRO'
          : 'Reset Password'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {mode === 'signup' && (
          <>
            <div>
              <Input
                label="Unique Username"
                placeholder="e.g. nova_zen"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                icon={<AtSign className="w-4 h-4" />}
                required
              />
              <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                {usernameStatus === 'checking' && (
                  <span className="text-slate-400">Checking availability...</span>
                )}
                {usernameStatus === 'available' && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> @{username} is available!
                  </span>
                )}
                {usernameStatus === 'taken' && (
                  <span className="text-rose-400">@{username} is already taken or reserved.</span>
                )}
                {usernameStatus === 'invalid' && (
                  <span className="text-amber-400">Letters, numbers, underscores, dots (3-30 chars).</span>
                )}
              </div>
            </div>

            <Input
              label="Display Name"
              placeholder="e.g. Nova Vance"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />
          </>
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        {mode !== 'forgot' && (
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />
        )}

        <Button
          type="submit"
          variant="gradient"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          {mode === 'signup' ? 'Create Account' : mode === 'login' ? 'Sign In' : 'Send Reset Link'}
        </Button>

        <div className="pt-2 text-center text-xs text-slate-400 space-y-1">
          {mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-vyro-primary font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : mode === 'login' ? (
            <>
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-vyro-primary font-bold hover:underline"
                >
                  Create One
                </button>
              </p>
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-slate-500 hover:text-slate-300 text-[11px]"
              >
                Forgot your password?
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-vyro-primary font-bold hover:underline"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};
