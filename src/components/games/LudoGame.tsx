import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Trophy,
  Sparkles,
  User,
  Bot,
  Volume2,
  VolumeX,
  Share2,
  Swords,
  Flame,
  Shield,
  Zap,
} from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export interface Token {
  id: number; // 0..3
  color: PlayerColor;
  step: number; // -1: in yard base, 0..50: open track, 51..55: home lane, 56: finished in center goal
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
    hex: '#DC2626',
    darkHex: '#991B1B',
    lightHex: '#F87171',
    glowHex: 'rgba(220, 38, 38, 0.65)',
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
    hex: '#059669',
    darkHex: '#065F46',
    lightHex: '#34D399',
    glowHex: 'rgba(5, 150, 105, 0.65)',
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
    hex: '#FACC15', // Official Ludo King Bright True Yellow (Never Orange)
    darkHex: '#CA8A04',
    lightHex: '#FEF08A',
    glowHex: 'rgba(250, 204, 21, 0.65)',
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
    hex: '#2563EB',
    darkHex: '#1E40AF',
    lightHex: '#60A5FA',
    glowHex: 'rgba(37, 99, 235, 0.65)',
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

// 52-cell Outer Track in 15x15 Matrix
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

// Official Safe Star Squares on 52-cell track
export const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

// Home Run Lanes (5 cells each leading into center triangle)
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
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [gameMode, setGameMode] = useState<'fast' | 'classic'>('fast'); // 2 pawns to win vs 4 pawns to win
  const [playVsBot, setPlayVsBot] = useState(true);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [canRoll, setCanRoll] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [statusMsg, setStatusMsg] = useState('Red rolls first! Tap 3D Dice 🎲');
  const [turnTimeLeft, setTurnTimeLeft] = useState(15);
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);
  const [lastKillEffect, setLastKillEffect] = useState<{ x: number; y: number } | null>(null);
  const [rankings, setRankings] = useState<PlayerColor[]>([]);

  // 2-Player Mode: Red vs Yellow seated in opposite corners (Top-Left vs Bottom-Right)
  const activeColors: PlayerColor[] = useMemo(() => {
    if (playerCount === 2) return ['red', 'yellow'];
    if (playerCount === 3) return ['red', 'green', 'yellow'];
    return ['red', 'green', 'yellow', 'blue'];
  }, [playerCount]);

  const currentColor = activeColors[activePlayerIndex];
  const requiredTokensToWin = gameMode === 'fast' ? 2 : 4;

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
  const playSfx = (type: 'shake' | 'roll' | 'hop' | 'star' | 'capture' | 'six' | 'penalty' | 'victory') => {
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
        const bufferSize = ctx.sampleRate * 0.08;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
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
        [440, 554.37, 659.25].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t0);
          gain.gain.setValueAtTime(0.25, t0);
          gain.gain.exponentialRampToValueAtTime(0.01, t0 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t0);
          osc.stop(t0 + 0.35);
        });
      } else if (type === 'penalty') {
        // Triple-6 Penalty Error Buzzer
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t0);
        osc.frequency.setValueAtTime(110, t0 + 0.15);
        gain.gain.setValueAtTime(0.3, t0);
        gain.gain.exponentialRampToValueAtTime(0.01, t0 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.35);
      } else if (type === 'victory') {
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
      // Audio context ignore
    }
  };

  // Turn Countdown Timer (15s like Ludo King)
  useEffect(() => {
    if (winner || isRolling) return;
    setTurnTimeLeft(15);
    const interval = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
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
      const msg = `⚡ ${PLAYER_CONFIG[currentColor].name} rolled a 6 / captured! Bonus turn 🎲`;
      setStatusMsg(msg);
      return;
    }
    setConsecutiveSixes(0);
    const nextIdx = (activePlayerIndex + 1) % activeColors.length;
    setActivePlayerIndex(nextIdx);
    setDiceValue(null);
    setCanRoll(true);
    setStatusMsg(`${PLAYER_CONFIG[activeColors[nextIdx]].name}'s Turn`);
  };

  // Fair Random Cryptographic Roll (1 to 6) without cheats
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

        // Fair cryptographic roll 1..6
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        const finalVal = (array[0] % 6) + 1;

        setDiceValue(finalVal);
        setIsRolling(false);

        // Official Ludo King Rule: Three 6s in a row forfeits the turn
        if (finalVal === 6) {
          if (consecutiveSixes >= 2) {
            playSfx('penalty');
            const penaltyMsg = `⚠️ 3 Consecutive Sixes! ${PLAYER_CONFIG[currentColor].name}'s turn is forfeited!`;
            setStatusMsg(penaltyMsg);
            onGameAction?.(penaltyMsg);
            setConsecutiveSixes(0);
            setTimeout(() => passTurn(false), 1200);
            return;
          } else {
            playSfx('six');
            setConsecutiveSixes((prev) => prev + 1);
          }
        } else {
          setConsecutiveSixes(0);
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
      return t.step + val <= 56; // Exact roll to finish
    });

    if (movable.length === 0) {
      setStatusMsg(`No moves possible with ${val}. Turn passes.`);
      setTimeout(() => passTurn(false), 800);
    } else if (movable.length === 1 && playVsBot && currentColor !== 'red') {
      setTimeout(() => moveToken(movable[0], val), 500);
    } else if (playVsBot && currentColor !== 'red') {
      const best = pickSmartAiMove(movable, val);
      setTimeout(() => moveToken(best, val), 600);
    } else {
      setStatusMsg(`Advance a token by ${val} step${val > 1 ? 's' : ''}!`);
    }
  };

  // Smart Heuristic AI Decision Engine
  const pickSmartAiMove = (movable: Token[], val: number): Token => {
    let bestToken = movable[0];
    let maxScore = -9999;

    movable.forEach((token) => {
      let score = 0;
      const targetStep = token.step === -1 ? 0 : token.step + val;

      // 1. Goal victory move
      if (targetStep === 56) score += 1200;

      // 2. Capture opponent token
      if (targetStep >= 0 && targetStep <= 50) {
        const startIdx = PLAYER_CONFIG[token.color].startTrackIdx;
        const targetTrackIdx = (startIdx + targetStep) % 52;

        if (!SAFE_SQUARES.includes(targetTrackIdx)) {
          const opponents = tokens.filter(
            (t) =>
              activeColors.includes(t.color) &&
              t.color !== token.color &&
              t.step >= 0 &&
              t.step <= 50 &&
              (PLAYER_CONFIG[t.color].startTrackIdx + t.step) % 52 === targetTrackIdx
          );
          if (opponents.length > 0) score += 700;
        }

        // 3. Enter Safe Star
        if (SAFE_SQUARES.includes(targetTrackIdx)) score += 400;
      }

      // 4. Release token from base on 6
      if (token.step === -1 && val === 6) score += 300;

      // 5. Enter protected Home Lane
      if (targetStep >= 51 && targetStep <= 55) score += 200;

      // 6. Distance advance
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
      if (token.step + val > 56) return; // Exact roll needed
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
        activeColors.includes(t.color) &&
        t.color !== token.color &&
        t.step >= 0 &&
        t.step <= 50
      ) {
        const oppTrackIdx = (PLAYER_CONFIG[t.color].startTrackIdx + t.step) % 52;
        if (oppTrackIdx === globalTrackIdx) {
          didCapture = true;
          return { ...t, step: -1 }; // Banished back to base dock
        }
      }
      return t;
    });

    if (didCapture) {
      playSfx('capture');
      const coords = TRACK_COORDS[globalTrackIdx];
      setLastKillEffect({ x: coords[1] * CELL_SIZE + 20, y: coords[0] * CELL_SIZE + 20 });
      setTimeout(() => setLastKillEffect(null), 1200);

      const captureMsg = `💥 ${PLAYER_CONFIG[currentColor].name} captured an opponent's pawn back to base! 🎯`;
      setStatusMsg(captureMsg);
      onGameAction?.(captureMsg);
    } else if (globalTrackIdx >= 0 && SAFE_SQUARES.includes(globalTrackIdx)) {
      playSfx('star');
    }

    setTokens(updated);

    // Win condition check
    const finishedCount = updated.filter((t) => t.color === currentColor && t.step === 56).length;
    if (finishedCount >= requiredTokensToWin) {
      setWinner(currentColor);
      setRankings((prev) => (prev.includes(currentColor) ? prev : [...prev, currentColor]));
      playSfx('victory');
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FACC15', '#DC2626', '#059669', '#2563EB', '#F59E0B'],
        });
      } catch {}
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
    setConsecutiveSixes(0);
    setRankings([]);
    setStatusMsg('Game reset! Red rolls first.');
  };

  // Group ONLY active tokens per cell for clean rendering
  const tokenClusters = useMemo(() => {
    const map = new Map<string, Token[]>();
    tokens
      .filter((t) => activeColors.includes(t.color))
      .forEach((t) => {
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
  }, [tokens, activeColors]);

  return (
    <div className={`w-full max-w-lg mx-auto flex flex-col items-center ${inChat ? 'p-1' : 'p-3'} select-none`}>
      {/* Top HUD Controls & Mode Toggles */}
      <div className="w-full flex items-center justify-between mb-2 text-xs flex-wrap gap-1.5">
        <div className="flex items-center gap-1.5">
          {/* Player Count Toggle */}
          <button
            onClick={() => {
              soundEngine.playPop();
              setPlayerCount((p) => (p === 2 ? 4 : 2));
              handleResetGame();
            }}
            className="px-2.5 py-1 rounded-xl bg-[#0F172A] border border-white/10 hover:border-amber-400 text-slate-200 font-extrabold transition flex items-center gap-1 shadow-sm"
          >
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            <span>{playerCount}P Match</span>
          </button>

          {/* AI / Pass & Play Toggle */}
          <button
            onClick={() => {
              soundEngine.playPop();
              setPlayVsBot(!playVsBot);
              handleResetGame();
            }}
            className={`px-2.5 py-1 rounded-xl border font-bold flex items-center gap-1 transition shadow-sm ${
              playVsBot
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                : 'bg-[#0F172A] border-white/10 text-slate-400'
            }`}
          >
            {playVsBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            <span>{playVsBot ? 'Smart AI' : 'Pass & Play'}</span>
          </button>

          {/* Fast Rush vs Classic Mode Toggle */}
          <button
            onClick={() => {
              soundEngine.playPop();
              setGameMode((m) => (m === 'fast' ? 'classic' : 'fast'));
              handleResetGame();
            }}
            className="px-2 py-1 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-slate-300 text-[11px] font-bold transition flex items-center gap-1"
            title="Toggle Fast Mode (2 to win) vs Classic (4 to win)"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>{gameMode === 'fast' ? 'Fast (2 Win)' : 'Classic (4 Win)'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-xl bg-[#0F172A] border border-white/10 text-slate-400 hover:text-white transition"
            title="Toggle Audio FX"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>
          <button
            onClick={handleResetGame}
            className="p-1.5 rounded-xl bg-[#0F172A] border border-white/10 text-slate-400 hover:text-white transition"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Status Banner with Turn Timer */}
      <div className="w-full flex items-center justify-between px-4 py-2 rounded-2xl liquid-glass-inner border border-white/10 mb-2.5 shadow-lg">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-3.5 h-3.5 rounded-full shadow-md shrink-0 animate-pulse"
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
                stroke={turnTimeLeft < 4 ? '#DC2626' : PLAYER_CONFIG[currentColor].hex}
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

      {/* Handcrafted Tactile 15x15 Ludo Board SVG */}
      <div className="relative w-full aspect-square max-w-[340px] sm:max-w-[420px] rounded-[28px] overflow-hidden shadow-2xl border-2 border-white/15 bg-[#060911]">
        <svg viewBox="0 0 600 600" className="w-full h-full">
          <defs>
            {/* 3D Pawn Radial Gradients */}
            {activeColors.map((color) => {
              const cfg = PLAYER_CONFIG[color];
              return (
                <g key={color}>
                  <radialGradient id={`pawnGrad_${color}`} cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                    <stop offset="38%" stopColor={cfg.lightHex} />
                    <stop offset="85%" stopColor={cfg.hex} />
                    <stop offset="100%" stopColor={cfg.darkHex} />
                  </radialGradient>
                  <filter id={`shadow_${color}`} x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.75" />
                  </filter>
                </g>
              );
            })}
            <linearGradient id="goldStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
            <radialGradient id="boardGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0F172A" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#060911" stopOpacity="0.95" />
            </radialGradient>
          </defs>

          {/* Board Background */}
          <rect x="0" y="0" width="600" height="600" fill="url(#boardGlow)" />

          {/* 1. Base Yards */}
          {/* Red Yard (Top-Left) */}
          <rect x="0" y="0" width="240" height="240" fill="#DC2626" fillOpacity="0.2" />
          <rect
            x="24"
            y="24"
            width="192"
            height="192"
            rx="28"
            fill="#0F172A"
            stroke="#DC2626"
            strokeWidth="3.5"
            filter="drop-shadow(0 4px 12px rgba(220,38,38,0.35))"
          />
          {PLAYER_CONFIG.red.docks.map(([r, c], i) => (
            <circle
              key={i}
              cx={c * CELL_SIZE}
              cy={r * CELL_SIZE}
              r="22"
              fill="#1E293B"
              stroke="#DC2626"
              strokeWidth="2.5"
            />
          ))}

          {/* Green Yard (Top-Right) — Dimmed in 2P mode */}
          <rect
            x="360"
            y="0"
            width="240"
            height="240"
            fill="#059669"
            fillOpacity={playerCount === 2 ? 0.05 : 0.2}
          />
          <rect
            x="384"
            y="24"
            width="192"
            height="192"
            rx="28"
            fill="#0F172A"
            stroke="#059669"
            strokeWidth={playerCount === 2 ? '1.5' : '3.5'}
            strokeOpacity={playerCount === 2 ? 0.35 : 1}
            filter={playerCount === 2 ? '' : 'drop-shadow(0 4px 12px rgba(5,150,105,0.35))'}
          />
          {PLAYER_CONFIG.green.docks.map(([r, c], i) => (
            <circle
              key={i}
              cx={c * CELL_SIZE}
              cy={r * CELL_SIZE}
              r="22"
              fill="#1E293B"
              stroke="#059669"
              strokeWidth="2.5"
              strokeOpacity={playerCount === 2 ? 0.35 : 1}
            />
          ))}

          {/* Yellow Yard (Bottom-Right) — True Bright Yellow (#FACC15) */}
          <rect x="360" y="360" width="240" height="240" fill="#FACC15" fillOpacity="0.2" />
          <rect
            x="384"
            y="384"
            width="192"
            height="192"
            rx="28"
            fill="#0F172A"
            stroke="#FACC15"
            strokeWidth="3.5"
            filter="drop-shadow(0 4px 12px rgba(250,204,21,0.35))"
          />
          {PLAYER_CONFIG.yellow.docks.map(([r, c], i) => (
            <circle
              key={i}
              cx={c * CELL_SIZE}
              cy={r * CELL_SIZE}
              r="22"
              fill="#1E293B"
              stroke="#FACC15"
              strokeWidth="2.5"
            />
          ))}

          {/* Blue Yard (Bottom-Left) — Dimmed in 2P & 3P modes */}
          <rect
            x="0"
            y="360"
            width="240"
            height="240"
            fill="#2563EB"
            fillOpacity={playerCount < 4 ? 0.05 : 0.2}
          />
          <rect
            x="24"
            y="384"
            width="192"
            height="192"
            rx="28"
            fill="#0F172A"
            stroke="#2563EB"
            strokeWidth={playerCount < 4 ? '1.5' : '3.5'}
            strokeOpacity={playerCount < 4 ? 0.35 : 1}
            filter={playerCount < 4 ? '' : 'drop-shadow(0 4px 12px rgba(37,99,235,0.35))'}
          />
          {PLAYER_CONFIG.blue.docks.map(([r, c], i) => (
            <circle
              key={i}
              cx={c * CELL_SIZE}
              cy={r * CELL_SIZE}
              r="22"
              fill="#1E293B"
              stroke="#2563EB"
              strokeWidth="2.5"
              strokeOpacity={playerCount < 4 ? 0.35 : 1}
            />
          ))}

          {/* 2. Track Cells (52 cells) */}
          {TRACK_COORDS.map(([r, c], idx) => {
            const isSafe = SAFE_SQUARES.includes(idx);
            const isRedStart = idx === 0;
            const isGreenStart = idx === 13;
            const isYellowStart = idx === 26;
            const isBlueStart = idx === 39;

            let cellFill = '#0F172A';
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
                  stroke="#1E293B"
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

          {/* 3. Home Run Lanes */}
          {HOME_LANE_COORDS.red.map(([r, c], i) => (
            <rect
              key={`home_red_${i}`}
              x={c * CELL_SIZE + 1}
              y={r * CELL_SIZE + 1}
              width={CELL_SIZE - 2}
              height={CELL_SIZE - 2}
              rx="6"
              fill="#DC2626"
              fillOpacity={0.65 + i * 0.07}
              stroke="#991B1B"
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
              fill="#059669"
              fillOpacity={0.65 + i * 0.07}
              stroke="#065F46"
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
              fill="#FACC15"
              fillOpacity={0.65 + i * 0.07}
              stroke="#CA8A04"
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
              fill="#2563EB"
              fillOpacity={0.65 + i * 0.07}
              stroke="#1E40AF"
              strokeWidth="1.5"
            />
          ))}

          {/* 4. Center Home Goal Triangles */}
          <g>
            <polygon points="240,240 360,240 300,300" fill="#059669" fillOpacity="0.9" />
            <polygon points="360,240 360,360 300,300" fill="#FACC15" fillOpacity="0.9" />
            <polygon points="240,360 360,360 300,300" fill="#2563EB" fillOpacity="0.9" />
            <polygon points="240,240 240,360 300,300" fill="#DC2626" fillOpacity="0.9" />

            <circle
              cx="300"
              cy="300"
              r="26"
              fill="#060911"
              stroke="url(#goldStarGrad)"
              strokeWidth="3.5"
              filter="drop-shadow(0 0 14px rgba(250,204,21,0.5))"
            />
            <text x="300" y="306" textAnchor="middle" fontSize="16" fill="#FEF08A" fontWeight="bold">
              🏆
            </text>
          </g>

          {/* 5. 3D Pawns with Specular Head Highlights & Cluster Offsets */}
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
                const dock = PLAYER_CONFIG[t.color].docks[t.id];
                baseX = dock[1] * CELL_SIZE;
                baseY = dock[0] * CELL_SIZE;
              } else if (t.step === 56) {
                baseX = 300 + PLAYER_CONFIG[t.color].goalOffset[0];
                baseY = 300 + PLAYER_CONFIG[t.color].goalOffset[1];
              } else if (t.step >= 51) {
                const laneIdx = t.step - 51;
                const coords = HOME_LANE_COORDS[t.color][laneIdx];
                baseX = coords[1] * CELL_SIZE + 20;
                baseY = coords[0] * CELL_SIZE + 20;
              } else {
                const startIdx = PLAYER_CONFIG[t.color].startTrackIdx;
                const trackIdx = (startIdx + t.step) % 52;
                const coords = TRACK_COORDS[trackIdx];
                baseX = coords[1] * CELL_SIZE + 20;
                baseY = coords[0] * CELL_SIZE + 20;
              }

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
                  {/* Bouncing Gold Ring Indicator when token is eligible to move */}
                  {canMove && (
                    <circle
                      cx={px}
                      cy={py}
                      r="20"
                      fill="none"
                      stroke="#FACC15"
                      strokeWidth="2.8"
                      strokeDasharray="5 3"
                      className="animate-spin"
                    />
                  )}

                  {/* 3D Pawn Base Skirt */}
                  <ellipse cx={px} cy={py + 5} rx="14" ry="6" fill="#000000" opacity="0.65" filter="blur(1px)" />
                  <path
                    d={`M ${px - 11} ${py + 4} Q ${px} ${py + 7} ${px + 11} ${py + 4} L ${px + 8} ${py - 3} L ${px - 8} ${py - 3} Z`}
                    fill={`url(#pawnGrad_${t.color})`}
                    stroke="#FFFFFF"
                    strokeWidth="1.2"
                  />

                  {/* 3D Pawn Collar Ring */}
                  <ellipse cx={px} cy={py - 3} rx="8" ry="3" fill="#FFFFFF" opacity="0.9" />

                  {/* 3D Pawn Spherical Head */}
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
                  <circle cx={px - 2.5} cy={py - 11.5} r="2.5" fill="#FFFFFF" opacity="0.85" />
                </g>
              );
            });
          })}

          {/* Kill Explosion Burst */}
          {lastKillEffect && (
            <g className="animate-ping">
              <circle cx={lastKillEffect.x} cy={lastKillEffect.y} r="26" fill="none" stroke="#DC2626" strokeWidth="4" />
              <text x={lastKillEffect.x} y={lastKillEffect.y + 6} textAnchor="middle" fontSize="18">
                💥
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* 3D Tumbling Dice & Action Bar */}
      <div className="w-full mt-3 flex items-center justify-between liquid-glass-elevated p-3.5 rounded-2xl border border-white/15 shadow-2xl">
        {/* Active Player Status Tag */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-slate-950 text-sm shadow-md transition-all"
            style={{
              backgroundColor: PLAYER_CONFIG[currentColor].hex,
              boxShadow: `0 0 18px ${PLAYER_CONFIG[currentColor].glowHex}`,
              color: currentColor === 'yellow' ? '#0F172A' : '#FFFFFF',
            }}
          >
            {PLAYER_CONFIG[currentColor].name[0]}
          </div>
          <div>
            <p className="text-xs font-black text-white flex items-center gap-1.5">
              <span>{PLAYER_CONFIG[currentColor].name}'s Turn</span>
              {consecutiveSixes > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] font-black flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5" /> +1 ROLL
                </span>
              )}
            </p>
            <p className="text-[10px] text-slate-400">
              {playVsBot && currentColor !== 'red' ? 'AI Deciding...' : 'Tap 3D Dice to roll'}
            </p>
          </div>
        </div>

        {/* Realistic 3D Tumbling White Acrylic Dice */}
        <button
          onClick={handleRollDice}
          disabled={!canRoll || isRolling || !!winner || (playVsBot && currentColor !== 'red')}
          className={`relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-100 via-white to-slate-200 border-2 flex items-center justify-center shadow-2xl transition-all active:scale-95 ${
            canRoll && !isRolling && !winner
              ? 'hover:scale-105 cursor-pointer shadow-[0_0_22px_rgba(250,204,21,0.5)] animate-bounce'
              : 'opacity-70 cursor-not-allowed'
          }`}
          style={{ borderColor: canRoll ? PLAYER_CONFIG[currentColor].hex : 'rgba(255,255,255,0.2)' }}
        >
          {isRolling ? (
            <div className="relative w-10 h-10 flex items-center justify-center animate-spin">
              <span className="text-3xl">🎲</span>
            </div>
          ) : diceValue !== null ? (
            <div className="w-12 h-12 rounded-xl p-1 flex items-center justify-center">
              {diceValue === 1 && (
                <span className="w-4 h-4 rounded-full shadow-md" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
              )}
              {diceValue === 2 && (
                <div className="w-full h-full flex justify-between p-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-3 h-3 rounded-full self-end" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                </div>
              )}
              {diceValue === 3 && (
                <div className="w-full h-full flex justify-between p-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2.5 h-2.5 rounded-full self-center" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2.5 h-2.5 rounded-full self-end" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                </div>
              )}
              {diceValue === 4 && (
                <div className="grid grid-cols-2 gap-2 p-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                </div>
              )}
              {diceValue === 5 && (
                <div className="relative w-full h-full p-1 grid grid-cols-2 gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span
                    className="w-2.5 h-2.5 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
                  />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                </div>
              )}
              {diceValue === 6 && (
                <div className="grid grid-cols-2 gap-1.5 p-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs font-black tracking-wider text-slate-900">ROLL</span>
          )}
        </button>

        {/* Goal Score Progress */}
        <div className="text-right space-y-0.5">
          <p className="text-xs font-black text-white flex items-center justify-end gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {tokens.filter((t) => t.color === currentColor && t.step === 56).length} / {requiredTokensToWin} Goal
            </span>
          </p>
          <p className="text-[10px] text-slate-400">
            {gameMode === 'fast' ? 'Fast Mode (2 to win)' : 'Classic (4 to win)'}
          </p>
          {onGameAction && (
            <button
              onClick={() => {
                soundEngine.playPop();
                onGameAction(`🎲 Match update: ${PLAYER_CONFIG[currentColor].name} rolled a ${diceValue || 6}!`);
              }}
              className="text-[10px] text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1 justify-end ml-auto"
            >
              <Share2 className="w-2.5 h-2.5" /> Share in Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
