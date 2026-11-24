import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Camera,
  Music,
  Video,
  Gamepad2,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Play,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { Logo } from '../components/layout/Logo';
import { Button } from '../components/ui/Button';
import { AuthModal } from '../components/auth/AuthModal';

export const LandingPage: React.FC = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const featurePillars = [
    {
      icon: Camera,
      title: 'Studio Viewfinder',
      description: 'Capture high-speed photos & vertical videos directly in your browser with real-time canvas filters and WebP compression.',
      accent: 'from-purple-500 to-indigo-600',
    },
    {
      icon: Video,
      title: 'WebRTC P2P Calling',
      description: 'Crystal-clear encrypted voice and video rooms with friends. Zero lag, zero phone number requirements.',
      accent: 'from-pink-500 to-rose-600',
    },
    {
      icon: Music,
      title: 'Legal Audio Hub',
      description: '100% copyright-safe music. Drop original creator audio or pick from curated CC0 royalty-free soundscapes.',
      accent: 'from-cyan-500 to-blue-600',
    },
    {
      icon: Gamepad2,
      title: 'In-Chat Arcade',
      description: 'Challenge friends to Chess, Tic-Tac-Toe, and Trivia directly inside your active direct message streams.',
      accent: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <div className="min-h-screen bg-vyro-bg text-slate-100 flex flex-col selection:bg-vyro-primary selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-vyro-border/60 px-6 py-4 flex items-center justify-between">
        <Logo size="md" />

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/feed"
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Explore Feed
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openAuth('login')}
            className="hidden sm:inline-flex"
          >
            Sign In
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => openAuth('signup')}
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 overflow-hidden flex flex-col items-center text-center">
        {/* Ambient Backlight Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-vyro-primary/25 via-vyro-accent/20 to-vyro-cyan/25 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vyro-card border border-vyro-primary/40 shadow-glow-purple/20 text-xs font-semibold text-slate-200 mb-6 animate-pulse-slow">
          <Sparkles className="w-4 h-4 text-vyro-accent" />
          <span>The Next Evolution in Social Expression</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1]">
          Where Creation Beats <br />
          <span className="gradient-text-primary">Algorithmic Noise.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
          VYRO fuses short vertical reels, aesthetic visual drops, WebRTC calls, CC0 creator music, and real-time multiplayer games into one unified, lightning-fast progressive web app.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button
            variant="gradient"
            size="lg"
            onClick={() => openAuth('signup')}
            className="w-full sm:w-auto font-bold px-8 shadow-glow-pink"
          >
            <span>Launch VYRO Web</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Link
            to="/feed"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl border border-vyro-border bg-vyro-card/80 hover:bg-vyro-cardHover text-slate-200 text-base font-semibold transition-all"
          >
            <Play className="w-4 h-4 mr-2 text-vyro-cyan fill-vyro-cyan" />
            <span>Interactive Demo</span>
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-vyro-primary" />
            <span>100% PWA Compatible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-vyro-accent" />
            <span>Sub-100ms Interactions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Strict Privacy & RLS</span>
          </div>
        </div>

        {/* Interactive Device Preview Card */}
        <div className="mt-14 w-full max-w-5xl rounded-3xl p-3 sm:p-5 glass-panel border border-vyro-border shadow-2xl relative">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[16/9] sm:aspect-[21/9] border border-white/5 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80"
              alt="VYRO interface preview"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-vyro-bg via-transparent to-black/40" />

            {/* Floating Live Interaction Cards */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="glass-card rounded-2xl p-4 border border-white/10 text-left flex items-center gap-3.5 max-w-sm">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vyro-primary to-vyro-accent flex items-center justify-center text-white">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Ethical Chronological Feed</p>
                  <p className="text-[11px] text-slate-300">You control what you see. Zero dopamine traps.</p>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-4 border border-white/10 text-left flex items-center gap-3.5 max-w-sm">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vyro-cyan to-blue-600 flex items-center justify-center text-white">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Original Audio Sync</p>
                  <p className="text-[11px] text-slate-300">Share or reuse creator beats with zero copyright strikes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Built for Modern Creators. <br />
            <span className="gradient-text-primary">Engineered for Performance.</span>
          </h2>
          <p className="mt-3 text-slate-400 text-sm max-w-xl mx-auto">
            Everything you love about modern social networks, rebuilt from the ground up without bloat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featurePillars.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="glass-card rounded-2xl p-6 border border-vyro-border hover:border-vyro-primary/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.accent} flex items-center justify-center text-white mb-5 shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-bold text-vyro-primary">
                  <span>Explore Feature</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-vyro-border/70 py-10 px-6 bg-vyro-card/40">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span>© 2026 VYRO Platform. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/feed" className="hover:text-white transition-colors">Web App</Link>
            <button onClick={() => openAuth('signup')} className="text-vyro-primary hover:underline">
              Create Account
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultMode={authMode}
      />
    </div>
  );
};
