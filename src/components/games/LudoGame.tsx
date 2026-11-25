import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  RotateCcw,
  Trophy,
  Sparkles,
  User,
  Bot,
  Volume2,
  VolumeX,
  Share2,
  Clock,
  Swords,
  Flame,
} from 'lucide-react';

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export interface Token {
  id: number; // 0..3
  color: PlayerColor;
  step: number; // -1: in yard, 0..50: open track, 51..55: home lane, 56: finished in center goal
}

export interface PlayerConfig {
  name: string;
  hex: string;
  darkHex: string;
  lightHex: string;
  glowHex: string;
  startTrackIdx: number;
  homeEntryIdx: number;
  docks: [number, number][]; // row, col
  goalOffset: [number, number]; // x, y
}

export const PLAYER_CONFIG: Record<PlayerColor, PlayerConfig> = {
  red: {
    name: 'Red',
    hex: '#EF4444',
    darkHex: '#991B1B',
    lightHex: '#FCA5A5',
    glowHex: 'rgba(239, 68, 68, 0.6)',
    startTrackIdx: 0,
    homeEntryIdx: 50,
    docks: [
      [1.8, 1.8],
      [1.8, 4.2],
      [4.2, 1.8],
      [4.2, 4.2],
    ],
    goalOffset: [-14, -14],
  },
  green: {
    name: 'Green',
    hex: '#10B981',
    darkHex: '#065F46',
    lightHex: '#6EE7B7',
    glowHex: 'rgba(16, 185, 129, 0.6)',
    startTrackIdx: 13,
    homeEntryIdx: 11,
    docks: [
      [1.8, 10.8],
      [1.8, 13.2],
      [4.2, 10.8],
      [4.2, 13.2],
    ],
    goalOffset: [14, -14],
  },
  yellow: {
    name: 'Yellow',
    hex: '#F59E0B',
    darkHex: '#92400E',
    lightHex: '#FDE68A',
    glowHex: 'rgba(245, 158, 11, 0.6)',
    startTrackIdx: 26,
    homeEntryIdx: 24,
    docks: [
      [10.8, 10.8],
      [10.8, 13.2],
      [13.2, 10.8],
      [13.2, 13.2],
    ],
    goalOffset: [14, 14],
  },
  blue: {
    name: 'Blue',
    hex: '#3B82F6',
    darkHex: '#1E40AF',
    lightHex: '#93C5FD',
    glowHex: 'rgba(59, 130, 246, 0.6)',
    startTrackIdx: 39,
    homeEntryIdx: 37,
    docks: [
      [10.8, 1.8],
      [10.8, 4.2],
      [13.2, 1.8],
      [13.2, 4.2],
    ],
    goalOffset: [-14, 14],
  },
};

// True 52-cell outer track coordinates in a 15x15 matrix (row: 0..14, col: 0..14)
const TRACK_COORDS: [number, number][] = [
  // 0..4 (Left arm top row -> right)
  [6, 1],
  [6, 2],
  [6, 3],
  [6, 4],
  [6, 5],
  // 5..10 (Top arm left col -> up)
  [5, 6],
  [4, 6],
  [3, 6],
  [2, 6],
  [1, 6],
  [0, 6],
  // 11..12 (Top arm top cells -> right)
  [0, 7],
  [0, 8],
  // 13..17 (Top arm right col -> down)
  [1, 8],
  [2, 8],
  [3, 8],
  [4, 8],
  [5, 8],
  // 18..23 (Right arm top row -> right)
  [6, 9],
  [6, 10],
  [6, 11],
  [6, 12],
  [6, 13],
  [6, 14],
  // 24..25 (Right arm right cells -> down)
  [7, 14],
  [8, 14],
  // 26..30 (Right arm bottom row -> left)
  [8, 13],
  [8, 12],
  [8, 11],
  [8, 10],
  [8, 9],
  // 31..36 (Bottom arm right col -> down)
  [9, 8],
  [10, 8],
  [11, 8],
  [12, 8],
  [13, 8],
  [14, 8],
  // 37..38 (Bottom arm bottom cells -> left)
  [14, 7],
  [14, 6],
  // 39..43 (Bottom arm left col -> up)
  [13, 6],
  [12, 6],
  [11, 6],
  [10, 6],
  [9, 6],
  // 44..49 (Left arm bottom row -> left)
  [8, 5],
  [8, 4],
  [8, 3],
  [8, 2],
  [8, 1],
  [8, 0],
  // 50..51 (Left arm left cells -> up)
  [7, 0],
  [6, 0],
];

// Safe squares on the 52-cell track where pawns cannot be eliminated
export const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

// Home run paths (5 cells each leading into the center goal)
const HOME_LANE_COORDS: Record<PlayerColor, [number, number][]> = {
  red: [
    [7, 1],
    [7, 2],
    [7, 3],
    [7, 4],
    [7, 5],
  ],
  green: [
    [1, 7],
    [2, 7],
    [3, 7],
    [4, 7],
    [5, 7],
  ],
  yellow: [
    [7, 13],
    [7, 12],
    [7, 11],
    [7, 10],
    [7, 9],
  ],
  blue: [
    [13, 7],
    [12, 7],
    [11, 7],
    [10, 7],
    [9, 7],
  ],
};

const CELL_SIZE = 40; // 15 x 40 = 600px board dimension

interface LudoGameProps {
  inChat?: boolean;
  onGameAction?: (actionText: string) => void;
}

export const LudoGame: React.FC<LudoGameProps> = ({ inChat = false, onGameAction }) => {
  const [playerCount, setPlayerCount] = useState<2 | 4>(2);
  const [playVsBot, setPlayVsBot] = useState(true);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [canRoll, setCanRoll] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [statusMsg, setStatusMsg] = useState('Tap 3D Dice to roll & start!');
  const [turnTimeLeft, setTurnTimeLeft] = useState(15);
  const [bonusStreak, setBonusStreak] = useState(0);
  const [lastKillEffect, setLastKillEffect] = useState<{ x: number; y: number } | null>(null);

  const activeColors: PlayerColor[] = useMemo(
    () => (playerCount === 2 ? ['red', 'green'] : ['red', 'green', 'yellow', 'blue']),
    [playerCount]
  );
  const currentColor = activeColors[activePlayerIndex];

  // 4 Tokens per player
  const [tokens, setTokens] = useState<Token[]>(() => {
    const list: Token[] = [];
    const colors: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
    colors.forEach((col) => {
      for (let i = 0; i < 4; i++) {
        list.push({ id: i, color: col, step: -1 });
      }
    });
    return list;
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Procedural Web Audio Sound Synthesizer
  const playSfx = (type: 'shake' | 'roll' | 'hop' | 'star' | 'capture' | 'six' | 'victory') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const t0 = ctx.currentTime;

      if (type === 'shake') {
        // Wooden dice cup shake noise burst
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, t0);
        filter.Q.setValueAtTime(3, t0);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2, t0);
        gain.gain.exponentialRampToValueAtTime(0.01, t0 + 0.08);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(t0);
      } else if (type === 'roll') {
        // Tumbling dice bounce
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(380, t0);
        osc.frequency.exponentialRampToValueAtTime(110, t0 + 0.14);
        gain.gain.setValueAtTime(0.3, t0);
        gain.gain.exponentialRampToValueAtTime(0.01, t0 + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.14);
      } else if (type === 'hop') {
        // High-Q tactile pawn tap
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(740, t0);
        osc.frequency.exponentialRampToValueAtTime(180, t0 + 0.07);
        gain.gain.setValueAtTime(0.35, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.07);
      } else if (type === 'star') {
        // Safe square major third chime
        [523.25, 659.25].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t0 + idx * 0.05);
          gain.gain.setValueAtTime(0.25, t0 + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, t0 + idx * 0.05 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t0 + idx * 0.05);
          osc.stop(t0 + idx * 0.05 + 0.25);
        });
      } else if (type === 'capture') {
        // Electric strike + shatter
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(480, t0);
        osc.frequency.exponentialRampToValueAtTime(60, t0 + 0.28);
        gain.gain.setValueAtTime(0.45, t0);
        gain.gain.exponentialRampToValueAtTime(0.01, t0 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.28);
      } else if (type === 'six') {
        // Triumphant brass note
        [440, 554.37, 659.25].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t0);
          gain.gain.setValueAtTime(0.2, t0);
          gain.gain.exponentialRampToValueAtTime(0.01, t0 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t0);
          osc.stop(t0 + 0.35);
        });
      } else if (type === 'victory') {
        // Royal fanfare sequence
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t0 + i * 0.12);
          gain.gain.setValueAtTime(0.3, t0 + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.01, t0 + i * 0.12 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t0 + i * 0.12);
          osc.stop(t0 + i * 0.12 + 0.4);
        });
      }
    } catch {
      // Audio context ignored if not permitted
    }
  };

  // Turn Countdown Timer (15 seconds like Ludo King)
  useEffect(() => {
    if (winner || isRolling) return;
    setTurnTimeLeft(15);
    const interval = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer expired: auto-roll or pass turn
          if (canRoll) {
            handleRollDice();
          } else {
            passTurn(false);
          }
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentColor, canRoll, isRolling, winner]);

  const passTurn = (isBonus = false) => {
    if (isBonus) {
      setCanRoll(true);
      setBonusStreak((prev) => prev + 1);
      const msg = `⚡ ${PLAYER_CONFIG[currentColor].name} rolled a 6 / captured! Roll again! 🎲`;
      setStatusMsg(msg);
      return;
    }
    setBonusStreak(0);
    const nextIdx = (activePlayerIndex + 1) % activeColors.length;
    setActivePlayerIndex(nextIdx);
    setDiceValue(null);
    setCanRoll(true);
    setStatusMsg(`${PLAYER_CONFIG[activeColors[nextIdx]].name}'s Turn`);
  };

  const handleRollDice = () => {
    if (!canRoll || isRolling || winner) return;

    setIsRolling(true);
    setCanRoll(false);
    playSfx('shake');

    let rollCount = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      playSfx('roll');
      rollCount++;
      if (rollCount > 7) {
        clearInterval(interval);
        // Triple-6 penalty protection: max 2 consecutive 6s
        let finalVal = Math.floor(Math.random() * 6) + 1;
        if (finalVal === 6 && bonusStreak >= 2) {
          finalVal = Math.floor(Math.random() * 5) + 1;
        }

        setDiceValue(finalVal);
        setIsRolling(false);

        if (finalVal === 6) {
          playSfx('six');
        }

        evaluateMoves(finalVal);
      }
    }, 45);
  };

  const evaluateMoves = (val: number) => {
    const playerTokens = tokens.filter((t) => t.color === currentColor);
    const movable = playerTokens.filter((t) => {
      if (t.step === 56) return false;
      if (t.step === -1) return val === 6;
      return t.step + val <= 56;
    });

    if (movable.length === 0) {
      setStatusMsg(`No moves possible with ${val}. Turn passes.`);
      setTimeout(() => passTurn(false), 800);
    } else if (movable.length === 1 && playVsBot && currentColor !== 'red') {
      // Auto move for single choice
      setTimeout(() => moveToken(movable[0], val), 500);
    } else if (playVsBot && currentColor !== 'red') {
      // Smart Heuristic AI Decision
      const best = pickSmartAiMove(movable, val);
      setTimeout(() => moveToken(best, val), 600);
    } else {
      setStatusMsg(`Choose a token to advance ${val} step${val > 1 ? 's' : ''}!`);
    }
  };

  // Ludo King AI Tactical Heuristic Engine
  const pickSmartAiMove = (movable: Token[], val: number): Token => {
    let bestToken = movable[0];
    let maxScore = -9999;

    movable.forEach((token) => {
      let score = 0;
      const targetStep = token.step === -1 ? 0 : token.step + val;

      // 1. Goal move
      if (targetStep === 56) score += 1000;

      // 2. Capture opponent token
      if (targetStep >= 0 && targetStep <= 50) {
        const startIdx = PLAYER_CONFIG[token.color].startTrackIdx;
        const targetTrackIdx = (startIdx + targetStep) % 52;

        if (!SAFE_SQUARES.includes(targetTrackIdx)) {
          const opponents = tokens.filter(
            (t) =>
              t.color !== token.color &&
              t.step >= 0 &&
              t.step <= 50 &&
              (PLAYER_CONFIG[t.color].startTrackIdx + t.step) % 52 === targetTrackIdx
          );
          if (opponents.length > 0) score += 600;
        }

        // 3. Enter Safe Star
        if (SAFE_SQUARES.includes(targetTrackIdx)) score += 350;
      }

      // 4. Spawn from base on 6
      if (token.step === -1 && val === 6) score += 250;

      // 5. Enter protected Home Lane
      if (targetStep >= 51 && targetStep <= 55) score += 180;

      // 6. Advance tokens further ahead
      score += targetStep * 2;

      if (score > maxScore) {
        maxScore = score;
        bestToken = token;
      }
    });

    return bestToken;
  };

  // Bot Auto Roll Trigger
  useEffect(() => {
    if (winner) return;
    if (playVsBot && currentColor !== 'red' && canRoll && !isRolling) {
      const timer = setTimeout(() => {
        handleRollDice();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentColor, canRoll, playVsBot, winner]);

  const moveToken = (token: Token, val: number) => {
    if (token.color !== currentColor) return;
    if (token.step === 56) return;

    let nextStep = token.step;
    if (token.step === -1) {
      if (val === 6) {
        nextStep = 0;
      } else {
        return;
      }
    } else {
      if (token.step + val > 56) return;
      nextStep = token.step + val;
    }

    playSfx('hop');

    const startIdx = PLAYER_CONFIG[token.color].startTrackIdx;
    let didCapture = false;
    let globalTrackIdx = -1;

    if (nextStep >= 0 && nextStep <= 50) {
      globalTrackIdx = (startIdx + nextStep) % 52;
    }

    const updated = tokens.map((t) => {
      if (t.color === token.color && t.id === token.id) {
        return { ...t, step: nextStep };
      }

      // Collision capture check if cell is not safe
      if (
        globalTrackIdx >= 0 &&
        !SAFE_SQUARES.includes(globalTrackIdx) &&
        t.color !== token.color &&
        t.step >= 0 &&
        t.step <= 50
      ) {
        const oppTrackIdx = (PLAYER_CONFIG[t.color].startTrackIdx + t.step) % 52;
        if (oppTrackIdx === globalTrackIdx) {
          didCapture = true;
          return { ...t, step: -1 }; // Banished back to base!
        }
      }
      return t;
    });

    if (didCapture) {
      playSfx('capture');
      const coords = TRACK_COORDS[globalTrackIdx];
      setLastKillEffect({ x: coords[1] * CELL_SIZE + 20, y: coords[0] * CELL_SIZE + 20 });
      setTimeout(() => setLastKillEffect(null), 1200);

      const captureMsg = `💥 ${PLAYER_CONFIG[currentColor].name} banished an opponent's pawn back to base! 🎯`;
      setStatusMsg(captureMsg);
      onGameAction?.(captureMsg);
    } else if (globalTrackIdx >= 0 && SAFE_SQUARES.includes(globalTrackIdx)) {
      playSfx('star');
    }

    setTokens(updated);

    // Win condition check (2 pawns in home goal = victory in Fast Mode)
    const finishedCount = updated.filter((t) => t.color === currentColor && t.step === 56).length;
    if (finishedCount >= 2) {
      setWinner(currentColor);
      playSfx('victory');
      const winMsg = `👑 ${PLAYER_CONFIG[currentColor].name} is the Supreme Ludo King! 🏆`;
      setStatusMsg(winMsg);
      onGameAction?.(winMsg);
      return;
    }

    // Bonus roll on 6 or capture
    const hasBonus = val === 6 || didCapture;
    setTimeout(() => passTurn(hasBonus), 450);
  };

  const handleResetGame = () => {
    setTokens((prev) => prev.map((t) => ({ ...t, step: -1 })));
    setActivePlayerIndex(0);
    setDiceValue(null);
    setCanRoll(true);
    setWinner(null);
    setBonusStreak(0);
    setStatusMsg('Game reset! Red rolls first.');
  };

  // Group tokens per cell to handle visual stacking gracefully
  const tokenClusters = useMemo(() => {
    const map = new Map<string, Token[]>();
    tokens.forEach((t) => {
      let key = '';
      if (t.step === -1) {
        key = `yard_${t.color}_${t.id}`;
      } else if (t.step === 56) {
        key = `goal_${t.color}`;
      } else if (t.step >= 51) {
        key = `home_${t.color}_${t.step}`;
      } else {
        const startIdx = PLAYER_CONFIG[t.color].startTrackIdx;
        const trackIdx = (startIdx + t.step) % 52;
        key = `track_${trackIdx}`;
      }

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return map;
  }, [tokens]);

  return (
    <div
      className={`w-full max-w-lg mx-auto flex flex-col items-center ${
        inChat ? 'p-1.5' : 'p-4'
      } select-none`}
    >
      {/* Top HUD Controls & Modes */}
      <div className="w-full flex items-center justify-between mb-2 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setPlayerCount((p) => (p === 2 ? 4 : 2));
              handleResetGame();
            }}
            className="px-2.5 py-1 rounded-xl bg-vyro-card border border-vyro-border text-slate-200 hover:text-white font-bold transition flex items-center gap-1 shadow-sm"
          >
            <Swords className="w-3.5 h-3.5 text-vyro-accent" />
            <span>{playerCount}P Match</span>
          </button>
          <button
            onClick={() => {
              setPlayVsBot(!playVsBot);
              handleResetGame();
            }}
            className={`px-2.5 py-1 rounded-xl border font-bold flex items-center gap-1 transition shadow-sm ${
              playVsBot
                ? 'bg-vyro-primary/20 border-vyro-primary text-vyro-primary'
                : 'bg-vyro-card border-vyro-border text-slate-400'
            }`}
          >
            {playVsBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            <span>{playVsBot ? 'Smart AI' : 'Pass & Play'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-xl bg-vyro-card border border-vyro-border text-slate-400 hover:text-white transition"
            title="Toggle Sound FX"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>
          <button
            onClick={handleResetGame}
            className="p-1.5 rounded-xl bg-vyro-card border border-vyro-border text-slate-400 hover:text-white transition"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Status Ribbon with Countdown Timer */}
      <div className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl bg-gradient-to-r from-vyro-card/90 via-slate-900 to-vyro-card/90 border border-vyro-border mb-2.5 shadow-lg">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-3.5 h-3.5 rounded-full shadow-glow-sm shrink-0 animate-pulse"
            style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
          />
          <span className="text-xs font-bold text-white truncate">{statusMsg}</span>
        </div>

        {/* Turn Timer Circle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path
                className="text-slate-800"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeWidth="4"
                strokeDasharray={`${(turnTimeLeft / 15) * 100}, 100`}
                strokeLinecap="round"
                stroke={turnTimeLeft < 4 ? '#EF4444' : PLAYER_CONFIG[currentColor].hex}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[9px] font-black font-mono text-white">
              {turnTimeLeft}
            </span>
          </div>

          {winner && (
            <span className="text-xs font-black text-amber-400 flex items-center gap-1 animate-bounce">
              <Trophy className="w-4 h-4 text-amber-400" /> Winner!
            </span>
          )}
        </div>
      </div>

      {/* Master 15x15 Ludo King SVG Board */}
      <div className="relative w-full aspect-square max-w-[340px] sm:max-w-[420px] rounded-3xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.8)] border-4 border-slate-800/90 bg-[#090d16]">
        <svg viewBox="0 0 600 600" className="w-full h-full">
          <defs>
            {/* Gradients for authentic 3D Ludo King pawns */}
            {activeColors.map((color) => {
              const cfg = PLAYER_CONFIG[color];
              return (
                <g key={color}>
                  <radialGradient id={`pawnGrad_${color}`} cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                    <stop offset="40%" stopColor={cfg.lightHex} />
                    <stop offset="85%" stopColor={cfg.hex} />
                    <stop offset="100%" stopColor={cfg.darkHex} />
                  </radialGradient>
                  <filter id={`shadow_${color}`} x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.7" />
                  </filter>
                </g>
              );
            })}
            <linearGradient id="goldStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <radialGradient id="boardGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1E293B" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#090D16" stopOpacity="0.9" />
            </radialGradient>
          </defs>

          {/* Board Backdrop */}
          <rect x="0" y="0" width="600" height="600" fill="url(#boardGlow)" />

          {/* 1. Base Yards (6x6 cells = 240x240 px each) */}
          {/* Red Base (Top-Left) */}
          <rect x="0" y="0" width="240" height="240" fill="#EF4444" fillOpacity="0.18" />
          <rect
            x="24"
            y="24"
            width="192"
            height="192"
            rx="28"
            fill="#111827"
            stroke="#EF4444"
            strokeWidth="3.5"
            filter="drop-shadow(0 4px 10px rgba(239,68,68,0.3))"
          />
          {PLAYER_CONFIG.red.docks.map(([r, c], i) => (
            <circle
              key={i}
              cx={c * CELL_SIZE}
              cy={r * CELL_SIZE}
              r="22"
              fill="#1F2937"
              stroke="#EF4444"
              strokeWidth="2.5"
            />
          ))}

          {/* Green Base (Top-Right) */}
          <rect x="360" y="0" width="240" height="240" fill="#10B981" fillOpacity="0.18" />
          <rect
            x="384"
            y="24"
            width="192"
            height="192"
            rx="28"
            fill="#111827"
            stroke="#10B981"
            strokeWidth="3.5"
            filter="drop-shadow(0 4px 10px rgba(16,185,129,0.3))"
          />
          {PLAYER_CONFIG.green.docks.map(([r, c], i) => (
            <circle
              key={i}
              cx={c * CELL_SIZE}
              cy={r * CELL_SIZE}
              r="22"
              fill="#1F2937"
              stroke="#10B981"
              strokeWidth="2.5"
            />
          ))}

          {/* Yellow Base (Bottom-Right) */}
          <rect x="360" y="360" width="240" height="240" fill="#F59E0B" fillOpacity="0.18" />
          <rect
            x="384"
            y="384"
            width="192"
            height="192"
            rx="28"
            fill="#111827"
            stroke="#F59E0B"
            strokeWidth="3.5"
            filter="drop-shadow(0 4px 10px rgba(245,158,11,0.3))"
          />
          {PLAYER_CONFIG.yellow.docks.map(([r, c], i) => (
            <circle
              key={i}
              cx={c * CELL_SIZE}
              cy={r * CELL_SIZE}
              r="22"
              fill="#1F2937"
              stroke="#F59E0B"
              strokeWidth="2.5"
            />
          ))}

          {/* Blue Base (Bottom-Left) */}
          <rect x="0" y="360" width="240" height="240" fill="#3B82F6" fillOpacity="0.18" />
          <rect
            x="24"
            y="384"
            width="192"
            height="192"
            rx="28"
            fill="#111827"
            stroke="#3B82F6"
            strokeWidth="3.5"
            filter="drop-shadow(0 4px 10px rgba(59,130,246,0.3))"
          />
          {PLAYER_CONFIG.blue.docks.map(([r, c], i) => (
            <circle
              key={i}
              cx={c * CELL_SIZE}
              cy={r * CELL_SIZE}
              r="22"
              fill="#1F2937"
              stroke="#3B82F6"
              strokeWidth="2.5"
            />
          ))}

          {/* 2. Track Cells (52 cells) */}
          {TRACK_COORDS.map(([r, c], idx) => {
            const isSafe = SAFE_SQUARES.includes(idx);
            const isRedStart = idx === 0;
            const isGreenStart = idx === 13;
            const isYellowStart = idx === 26;
            const isBlueStart = idx === 39;

            let cellFill = '#111827';
            if (isRedStart) cellFill = '#7F1D1D';
            if (isGreenStart) cellFill = '#064E3B';
            if (isYellowStart) cellFill = '#78350F';
            if (isBlueStart) cellFill = '#1E3A8A';

            return (
              <g key={`track_${idx}`}>
                <rect
                  x={c * CELL_SIZE + 1}
                  y={r * CELL_SIZE + 1}
                  width={CELL_SIZE - 2}
                  height={CELL_SIZE - 2}
                  rx="6"
                  fill={cellFill}
                  stroke="#1F2937"
                  strokeWidth="1.2"
                />
                {isSafe && (
                  <text
                    x={c * CELL_SIZE + 20}
                    y={r * CELL_SIZE + 27}
                    textAnchor="middle"
                    fill="url(#goldStarGrad)"
                    fontSize="18"
                    fontWeight="black"
                    className="select-none pointer-events-none drop-shadow"
                  >
                    ★
                  </text>
                )}
              </g>
            );
          })}

          {/* 3. Home Run Lanes (5 colored cells leading to goal) */}
          {HOME_LANE_COORDS.red.map(([r, c], i) => (
            <rect
              key={`home_red_${i}`}
              x={c * CELL_SIZE + 1}
              y={r * CELL_SIZE + 1}
              width={CELL_SIZE - 2}
              height={CELL_SIZE - 2}
              rx="6"
              fill="#EF4444"
              fillOpacity={0.6 + i * 0.08}
              stroke="#B91C1C"
              strokeWidth="1.5"
            />
          ))}
          {HOME_LANE_COORDS.green.map(([r, c], i) => (
            <rect
              key={`home_green_${i}`}
              x={c * CELL_SIZE + 1}
              y={r * CELL_SIZE + 1}
              width={CELL_SIZE - 2}
              height={CELL_SIZE - 2}
              rx="6"
              fill="#10B981"
              fillOpacity={0.6 + i * 0.08}
              stroke="#047857"
              strokeWidth="1.5"
            />
          ))}
          {HOME_LANE_COORDS.yellow.map(([r, c], i) => (
            <rect
              key={`home_yellow_${i}`}
              x={c * CELL_SIZE + 1}
              y={r * CELL_SIZE + 1}
              width={CELL_SIZE - 2}
              height={CELL_SIZE - 2}
              rx="6"
              fill="#F59E0B"
              fillOpacity={0.6 + i * 0.08}
              stroke="#B45309"
              strokeWidth="1.5"
            />
          ))}
          {HOME_LANE_COORDS.blue.map(([r, c], i) => (
            <rect
              key={`home_blue_${i}`}
              x={c * CELL_SIZE + 1}
              y={r * CELL_SIZE + 1}
              width={CELL_SIZE - 2}
              height={CELL_SIZE - 2}
              rx="6"
              fill="#3B82F6"
              fillOpacity={0.6 + i * 0.08}
              stroke="#1D4ED8"
              strokeWidth="1.5"
            />
          ))}

          {/* 4. Center Home Goal Triangle (Cells 6..8, 6..8 = 240..360 px) */}
          <g>
            <polygon points="240,240 360,240 300,300" fill="#10B981" fillOpacity="0.85" />
            <polygon points="360,240 360,360 300,300" fill="#F59E0B" fillOpacity="0.85" />
            <polygon points="240,360 360,360 300,300" fill="#3B82F6" fillOpacity="0.85" />
            <polygon points="240,240 240,360 300,300" fill="#EF4444" fillOpacity="0.85" />

            <circle
              cx="300"
              cy="300"
              r="26"
              fill="#0F172A"
              stroke="url(#goldStarGrad)"
              strokeWidth="3.5"
              filter="drop-shadow(0 0 12px rgba(245,158,11,0.5))"
            />
            <text
              x="300"
              y="306"
              textAnchor="middle"
              fontSize="16"
              fill="#FDE68A"
              fontWeight="bold"
            >
              🏆
            </text>
          </g>

          {/* 5. Render 3D Pawns with specular highlights and stacking physics */}
          {Array.from(tokenClusters.entries()).map(([clusterKey, clusterTokens]) => {
            return clusterTokens.map((t, idx) => {
              const isTurn = t.color === currentColor;
              const canMove =
                isTurn &&
                diceValue !== null &&
                (t.step === -1 ? diceValue === 6 : t.step + diceValue <= 56);

              let baseX = 300;
              let baseY = 300;

              if (t.step === -1) {
                // Yard base dock position
                const dock = PLAYER_CONFIG[t.color].docks[t.id];
                baseX = dock[1] * CELL_SIZE;
                baseY = dock[0] * CELL_SIZE;
              } else if (t.step === 56) {
                // Goal center position
                baseX = 300 + PLAYER_CONFIG[t.color].goalOffset[0];
                baseY = 300 + PLAYER_CONFIG[t.color].goalOffset[1];
              } else if (t.step >= 51) {
                // Home lane position
                const laneIdx = t.step - 51;
                const coords = HOME_LANE_COORDS[t.color][laneIdx];
                baseX = coords[1] * CELL_SIZE + 20;
                baseY = coords[0] * CELL_SIZE + 20;
              } else {
                // Outer track position
                const startIdx = PLAYER_CONFIG[t.color].startTrackIdx;
                const trackIdx = (startIdx + t.step) % 52;
                const coords = TRACK_COORDS[trackIdx];
                baseX = coords[1] * CELL_SIZE + 20;
                baseY = coords[0] * CELL_SIZE + 20;
              }

              // Apply cluster micro-offsets if multiple tokens occupy the cell
              let offsetX = 0;
              let offsetY = 0;
              if (clusterTokens.length > 1 && t.step !== -1) {
                const angle = (idx / clusterTokens.length) * 2 * Math.PI;
                const radius = Math.min(8, 14 / clusterTokens.length);
                offsetX = Math.cos(angle) * radius;
                offsetY = Math.sin(angle) * radius;
              }

              const px = baseX + offsetX;
              const py = baseY + offsetY;

              return (
                <g
                  key={`${t.color}_${t.id}`}
                  onClick={() => canMove && moveToken(t, diceValue!)}
                  className={canMove ? 'cursor-pointer' : 'pointer-events-none'}
                >
                  {/* Active turn bouncing glow */}
                  {canMove && (
                    <circle
                      cx={px}
                      cy={py}
                      r="19"
                      fill="none"
                      stroke="#FDE68A"
                      strokeWidth="2.5"
                      strokeDasharray="5 3"
                      className="animate-spin"
                    />
                  )}

                  {/* 3D Pawn Base Skirt */}
                  <ellipse
                    cx={px}
                    cy={py + 5}
                    rx="14"
                    ry="6"
                    fill="#000000"
                    opacity="0.6"
                    filter="blur(1px)"
                  />
                  <path
                    d={`M ${px - 11} ${py + 4} Q ${px} ${py + 7} ${px + 11} ${py + 4} L ${px + 8} ${py - 3} L ${px - 8} ${py - 3} Z`}
                    fill={`url(#pawnGrad_${t.color})`}
                    stroke="#FFFFFF"
                    strokeWidth="1.2"
                  />

                  {/* 3D Pawn Collar Ring */}
                  <ellipse
                    cx={px}
                    cy={py - 3}
                    rx="8"
                    ry="3"
                    fill="#FFFFFF"
                    opacity="0.9"
                  />

                  {/* 3D Pawn Head Spherical Cap */}
                  <circle
                    cx={px}
                    cy={py - 9}
                    r="8.5"
                    fill={`url(#pawnGrad_${t.color})`}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    filter={`url(#shadow_${t.color})`}
                  />

                  {/* Specular Highlight on Head */}
                  <circle cx={px - 2.5} cy={py - 11.5} r="2.5" fill="#FFFFFF" opacity="0.8" />
                </g>
              );
            });
          })}

          {/* Last Kill Explosion Burst Indicator */}
          {lastKillEffect && (
            <g className="animate-ping">
              <circle
                cx={lastKillEffect.x}
                cy={lastKillEffect.y}
                r="25"
                fill="none"
                stroke="#EF4444"
                strokeWidth="4"
              />
              <text
                x={lastKillEffect.x}
                y={lastKillEffect.y + 6}
                textAnchor="middle"
                fontSize="18"
              >
                💥
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* 3D Tumbling Dice & Action Bar */}
      <div className="w-full mt-3 flex items-center justify-between glass-panel p-3.5 rounded-2xl border border-vyro-border shadow-xl">
        {/* Active Player Status Tag */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-md transition-all"
            style={{
              backgroundColor: PLAYER_CONFIG[currentColor].hex,
              boxShadow: `0 0 16px ${PLAYER_CONFIG[currentColor].glowHex}`,
            }}
          >
            {PLAYER_CONFIG[currentColor].name[0]}
          </div>
          <div>
            <p className="text-xs font-black text-white flex items-center gap-1.5">
              <span>{PLAYER_CONFIG[currentColor].name}'s Turn</span>
              {bonusStreak > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-black flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5" /> +1 ROLL
                </span>
              )}
            </p>
            <p className="text-[10px] text-slate-400">
              {playVsBot && currentColor !== 'red' ? 'AI Thinking...' : 'Tap 3D Dice to roll'}
            </p>
          </div>
        </div>

        {/* Realistic 3D Tumbling Dice Button */}
        <button
          onClick={handleRollDice}
          disabled={!canRoll || isRolling || !!winner || (playVsBot && currentColor !== 'red')}
          className={`relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 border-2 flex items-center justify-center shadow-2xl transition-all active:scale-95 ${
            canRoll && !isRolling && !winner
              ? 'border-white hover:border-amber-400 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-bounce'
              : 'border-vyro-border opacity-70 cursor-not-allowed'
          }`}
          style={{ borderColor: canRoll ? PLAYER_CONFIG[currentColor].hex : undefined }}
        >
          {isRolling ? (
            <div className="relative w-10 h-10 flex items-center justify-center animate-spin">
              <span className="text-3xl">🎲</span>
            </div>
          ) : diceValue !== null ? (
            <div
              className="w-12 h-12 rounded-xl bg-black/80 border border-white/20 p-1.5 flex items-center justify-center shadow-inner transition-transform"
              style={{ boxShadow: `inset 0 0 12px ${PLAYER_CONFIG[currentColor].glowHex}` }}
            >
              {diceValue === 1 && (
                <span
                  className="w-4 h-4 rounded-full shadow-md"
                  style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                />
              )}
              {diceValue === 2 && (
                <div className="w-full h-full flex justify-between p-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                  <span
                    className="w-3 h-3 rounded-full self-end"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                </div>
              )}
              {diceValue === 3 && (
                <div className="w-full h-full flex justify-between p-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full self-center"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full self-end"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                </div>
              )}
              {diceValue === 4 && (
                <div className="grid grid-cols-2 gap-2 p-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                </div>
              )}
              {diceValue === 5 && (
                <div className="relative w-full h-full p-1 grid grid-cols-2 gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                </div>
              )}
              {diceValue === 6 && (
                <div className="grid grid-cols-2 gap-1.5 p-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs font-black tracking-wider text-slate-300">ROLL</span>
          )}
        </button>

        {/* Goal Score Progress */}
        <div className="text-right space-y-0.5">
          <p className="text-xs font-black text-white flex items-center justify-end gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {tokens.filter((t) => t.color === currentColor && t.step === 56).length} / 2 Goal
            </span>
          </p>
          <p className="text-[10px] text-slate-400">Fast Mode (2 to win)</p>
          {onGameAction && (
            <button
              onClick={() =>
                onGameAction(`🎲 Match update: ${PLAYER_CONFIG[currentColor].name} is rolling!`)
              }
              className="text-[10px] text-vyro-primary hover:text-white font-bold transition flex items-center gap-1 justify-end ml-auto"
            >
              <Share2 className="w-2.5 h-2.5" /> Share in Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
