import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Trophy, Sparkles, User, Bot, Volume2, VolumeX } from 'lucide-react';

export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

interface Token {
  id: number; // 0..3
  color: PlayerColor;
  step: number; // -1: in yard, 0..51: on track, 52..56: home lane, 57: finished home
}

const PLAYER_CONFIG: Record<PlayerColor, { name: string; hex: string; bgHex: string; startTrackIdx: number; homeEntryIdx: number }> = {
  red: { name: 'Red', hex: '#EF4444', bgHex: 'bg-red-500', startTrackIdx: 0, homeEntryIdx: 50 },
  green: { name: 'Green', hex: '#10B981', bgHex: 'bg-emerald-500', startTrackIdx: 13, homeEntryIdx: 11 },
  yellow: { name: 'Yellow', hex: '#F59E0B', bgHex: 'bg-amber-500', startTrackIdx: 26, homeEntryIdx: 24 },
  blue: { name: 'Blue', hex: '#3B82F6', bgHex: 'bg-blue-500', startTrackIdx: 39, homeEntryIdx: 37 },
};

// Safe squares on the 52-cell track
const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

export const LudoGame: React.FC<{ inChat?: boolean; onGameAction?: (text: string) => void }> = ({
  inChat = false,
  onGameAction,
}) => {
  const [playerCount, setPlayerCount] = useState<2 | 4>(2);
  const [playVsBot, setPlayVsBot] = useState(true);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0); // 0: red, 1: green (or yellow/blue)
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [canRoll, setCanRoll] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [statusMsg, setStatusMsg] = useState('Roll the dice to start!');

  const activeColors: PlayerColor[] = playerCount === 2 ? ['red', 'green'] : ['red', 'green', 'yellow', 'blue'];
  const currentColor = activeColors[activePlayerIndex];

  // Initialize tokens: 4 tokens per player
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

  const audioContextRef = useRef<AudioContext | null>(null);

  const playClickSound = (type: 'dice' | 'move' | 'kill' | 'win') => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'dice') {
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'move') {
        osc.frequency.setValueAtTime(580, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'kill') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // Audio context ignored if not supported
    }
  };

  const passTurn = (isBonus = false) => {
    if (isBonus) {
      setCanRoll(true);
      setStatusMsg(`${PLAYER_CONFIG[currentColor].name} rolled a 6! Roll again! 🎲`);
      return;
    }
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
    playClickSound('dice');

    let rollCount = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 7) {
        clearInterval(interval);
        const finalVal = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalVal);
        setIsRolling(false);
        checkMovableTokens(finalVal);
      }
    }, 50);
  };

  const checkMovableTokens = (val: number) => {
    const playerTokens = tokens.filter((t) => t.color === currentColor);
    const movable = playerTokens.filter((t) => {
      if (t.step === 57) return false;
      if (t.step === -1) return val === 6;
      return t.step + val <= 57;
    });

    if (movable.length === 0) {
      setStatusMsg(`No valid moves with ${val}. Next turn.`);
      setTimeout(() => passTurn(val === 6), 900);
    } else if (movable.length === 1 && (playVsBot && currentColor !== 'red')) {
      // Auto-move for bot or single choice
      setTimeout(() => moveToken(movable[0], val), 600);
    } else {
      setStatusMsg(`Select a token to move ${val} step${val > 1 ? 's' : ''}!`);
    }
  };

  // Bot Auto Roll & Play
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
    if (token.step === 57) return;

    let newStep = token.step;
    if (token.step === -1) {
      if (val === 6) {
        newStep = 0; // Starts at track entry
      } else {
        return;
      }
    } else {
      if (token.step + val > 57) return;
      newStep = token.step + val;
    }

    playClickSound('move');

    // Calculate real track index (0..51) for collision check
    const startIdx = PLAYER_CONFIG[token.color].startTrackIdx;
    let didCapture = false;

    // Check collisions if on open track (0..50)
    let globalTrackIdx = -1;
    if (newStep >= 0 && newStep <= 50) {
      globalTrackIdx = (startIdx + newStep) % 52;
    }

    const updated = tokens.map((t) => {
      if (t.color === token.color && t.id === token.id) {
        return { ...t, step: newStep };
      }
      // Check if opponent token is on same cell and cell is not safe
      if (globalTrackIdx >= 0 && !SAFE_SQUARES.includes(globalTrackIdx) && t.color !== token.color && t.step >= 0 && t.step <= 50) {
        const oppTrackIdx = (PLAYER_CONFIG[t.color].startTrackIdx + t.step) % 52;
        if (oppTrackIdx === globalTrackIdx) {
          didCapture = true;
          return { ...t, step: -1 }; // Sent back to base!
        }
      }
      return t;
    });

    if (didCapture) {
      playClickSound('kill');
      const captureMsg = `🎯 ${PLAYER_CONFIG[currentColor].name} captured an opponent's token in Ludo!`;
      setStatusMsg(captureMsg);
      onGameAction?.(captureMsg);
    }

    setTokens(updated);

    // Check Win Condition (Tokens finished)
    const finishedCount = updated.filter((t) => t.color === currentColor && t.step === 57).length;
    // In fast mode, 2 tokens home is a win!
    if (finishedCount >= 2) {
      setWinner(currentColor);
      playClickSound('win');
      const winMsg = `🏆 ${PLAYER_CONFIG[currentColor].name} Wins the Ludo Match! 🎉`;
      setStatusMsg(winMsg);
      onGameAction?.(winMsg);
      return;
    }

    // Pass turn or give bonus roll on 6 or capture
    const bonus = val === 6 || didCapture;
    setTimeout(() => passTurn(bonus), 400);
  };

  const handleResetGame = () => {
    setTokens((prev) => prev.map((t) => ({ ...t, step: -1 })));
    setActivePlayerIndex(0);
    setDiceValue(null);
    setCanRoll(true);
    setWinner(null);
    setStatusMsg('Game reset! Red rolls first.');
  };

  return (
    <div className={`w-full max-w-lg mx-auto flex flex-col items-center ${inChat ? 'p-2' : 'p-4'} select-none`}>
      {/* Header & Controls */}
      <div className="w-full flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPlayerCount((p) => (p === 2 ? 4 : 2));
              handleResetGame();
            }}
            className="px-2.5 py-1 rounded-lg bg-vyro-card border border-vyro-border text-slate-300 hover:text-white font-bold"
          >
            {playerCount} Players
          </button>
          <button
            onClick={() => {
              setPlayVsBot(!playVsBot);
              handleResetGame();
            }}
            className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1 ${
              playVsBot ? 'bg-vyro-primary/20 border-vyro-primary text-vyro-primary' : 'bg-vyro-card border-vyro-border text-slate-400'
            }`}
          >
            {playVsBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            <span>{playVsBot ? 'Vs AI' : 'Pass & Play'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-vyro-card border border-vyro-border text-slate-400 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
          </button>
          <button
            onClick={handleResetGame}
            className="p-1.5 rounded-lg bg-vyro-card border border-vyro-border text-slate-400 hover:text-white"
            title="Reset Game"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-vyro-card/80 border border-vyro-border mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full animate-pulse shadow-glow-sm"
            style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
          />
          <span className="text-xs font-bold text-white">{statusMsg}</span>
        </div>
        {winner && (
          <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> Champion!
          </span>
        )}
      </div>

      {/* SVG Interactive Board */}
      <div className="relative w-full aspect-square max-w-[340px] sm:max-w-[380px] rounded-2xl overflow-hidden shadow-2xl border-2 border-vyro-border bg-slate-950">
        <svg viewBox="0 0 300 300" className="w-full h-full">
          {/* Base Backgrounds */}
          {/* Red Base (Top-Left) */}
          <rect x="0" y="0" width="120" height="120" fill="#EF4444" opacity="0.25" />
          <rect x="18" y="18" width="84" height="84" rx="16" fill="#18181B" stroke="#EF4444" strokeWidth="2.5" />

          {/* Green Base (Top-Right) */}
          <rect x="180" y="0" width="120" height="120" fill="#10B981" opacity="0.25" />
          <rect x="198" y="18" width="84" height="84" rx="16" fill="#18181B" stroke="#10B981" strokeWidth="2.5" />

          {/* Blue Base (Bottom-Left) */}
          <rect x="0" y="180" width="120" height="120" fill="#3B82F6" opacity="0.25" />
          <rect x="18" y="198" width="84" height="84" rx="16" fill="#18181B" stroke="#3B82F6" strokeWidth="2.5" />

          {/* Yellow Base (Bottom-Right) */}
          <rect x="180" y="180" width="120" height="120" fill="#F59E0B" opacity="0.25" />
          <rect x="198" y="198" width="84" height="84" rx="16" fill="#18181B" stroke="#F59E0B" strokeWidth="2.5" />

          {/* Center Home Triangle */}
          <polygon points="120,120 180,120 150,150" fill="#10B981" />
          <polygon points="180,120 180,180 150,150" fill="#F59E0B" />
          <polygon points="120,180 180,180 150,150" fill="#3B82F6" />
          <polygon points="120,120 120,180 150,150" fill="#EF4444" />
          <circle cx="150" cy="150" r="14" fill="#09090B" stroke="#E4E4E7" strokeWidth="2" />
          <text x="150" y="154" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">★</text>

          {/* Track Grid Lines & Safe Spots */}
          {/* Red Home Lane (Horizontal from left) */}
          <rect x="20" y="130" width="100" height="40" fill="#EF4444" opacity="0.4" />
          {/* Green Home Lane (Vertical from top) */}
          <rect x="130" y="20" width="40" height="100" fill="#10B981" opacity="0.4" />
          {/* Yellow Home Lane (Horizontal from right) */}
          <rect x="180" y="130" width="100" height="40" fill="#F59E0B" opacity="0.4" />
          {/* Blue Home Lane (Vertical from bottom) */}
          <rect x="130" y="180" width="40" height="100" fill="#3B82F6" opacity="0.4" />

          {/* Red Start Spot */}
          <rect x="20" y="120" width="20" height="20" fill="#EF4444" rx="4" />
          <text x="30" y="134" textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="bold">★</text>

          {/* Green Start Spot */}
          <rect x="160" y="20" width="20" height="20" fill="#10B981" rx="4" />
          <text x="170" y="34" textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="bold">★</text>

          {/* Yellow Start Spot */}
          <rect x="260" y="160" width="20" height="20" fill="#F59E0B" rx="4" />
          <text x="270" y="174" textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="bold">★</text>

          {/* Blue Start Spot */}
          <rect x="120" y="260" width="20" height="20" fill="#3B82F6" rx="4" />
          <text x="130" y="274" textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="bold">★</text>

          {/* Render Tokens in Base Yard */}
          {tokens.map((t) => {
            const isTurn = t.color === currentColor;
            const canMove = isTurn && diceValue !== null && (t.step === -1 ? diceValue === 6 : t.step + diceValue <= 57);

            // Compute SVG coordinates (cx, cy)
            let cx = 150;
            let cy = 150;

            if (t.step === -1) {
              // In Yard Base
              const offsets = [
                { dx: 38, dy: 38 },
                { dx: 82, dy: 38 },
                { dx: 38, dy: 82 },
                { dx: 82, dy: 82 },
              ];
              const off = offsets[t.id];
              if (t.color === 'red') {
                cx = off.dx;
                cy = off.dy;
              } else if (t.color === 'green') {
                cx = 180 + off.dx;
                cy = off.dy;
              } else if (t.color === 'blue') {
                cx = off.dx;
                cy = 180 + off.dy;
              } else if (t.color === 'yellow') {
                cx = 180 + off.dx;
                cy = 180 + off.dy;
              }
            } else if (t.step >= 57) {
              // Finished Home
              cx = 150;
              cy = 150;
            } else if (t.step >= 51) {
              // Home Lane
              const laneStep = t.step - 51; // 0..5
              if (t.color === 'red') {
                cx = 30 + laneStep * 18;
                cy = 150;
              } else if (t.color === 'green') {
                cx = 150;
                cy = 30 + laneStep * 18;
              } else if (t.color === 'yellow') {
                cx = 270 - laneStep * 18;
                cy = 150;
              } else if (t.color === 'blue') {
                cx = 150;
                cy = 270 - laneStep * 18;
              }
            } else {
              // Track coordinate mapping (approximate clockwise perimeter ring)
              const startIdx = PLAYER_CONFIG[t.color].startTrackIdx;
              const trackPos = (startIdx + t.step) % 52;
              const angle = (trackPos / 52) * Math.PI * 2 - Math.PI / 2;
              cx = 150 + Math.cos(angle) * 110;
              cy = 150 + Math.sin(angle) * 110;
            }

            return (
              <g
                key={`${t.color}_${t.id}`}
                onClick={() => canMove && diceValue && moveToken(t, diceValue)}
                className={`transition-all duration-300 ${canMove ? 'cursor-pointer hover:scale-125' : ''}`}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              >
                {/* Glow ring if movable */}
                {canMove && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="14"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    className="animate-spin"
                  />
                )}
                {/* Token Body */}
                <circle
                  cx={cx}
                  cy={cy}
                  r="9.5"
                  fill={PLAYER_CONFIG[t.color].hex}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))"
                />
                <circle cx={cx} cy={cy} r="4" fill="#FFFFFF" opacity="0.8" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dice & Action Area */}
      <div className="w-full mt-4 flex items-center justify-around glass-panel p-3.5 rounded-2xl border border-vyro-border">
        {/* Active Player Tag */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-md"
            style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }}
          >
            {PLAYER_CONFIG[currentColor].name[0]}
          </div>
          <div>
            <p className="text-xs font-bold text-white">{PLAYER_CONFIG[currentColor].name}'s Turn</p>
            <p className="text-[10px] text-slate-400">
              {playVsBot && currentColor !== 'red' ? 'AI Playing...' : 'Tap Dice to Roll'}
            </p>
          </div>
        </div>

        {/* 3D Dice Button */}
        <button
          onClick={handleRollDice}
          disabled={!canRoll || isRolling || !!winner || (playVsBot && currentColor !== 'red')}
          className={`relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border-2 flex items-center justify-center shadow-2xl transition-all active:scale-90 ${
            canRoll && !isRolling && !winner
              ? 'border-white hover:border-vyro-primary cursor-pointer shadow-glow-purple animate-bounce'
              : 'border-vyro-border opacity-70 cursor-not-allowed'
          }`}
          style={{ borderColor: canRoll ? PLAYER_CONFIG[currentColor].hex : undefined }}
        >
          {isRolling ? (
            <span className="text-2xl animate-spin">🎲</span>
          ) : diceValue !== null ? (
            <div className="w-9 h-9 rounded-xl bg-black/60 border border-white/20 p-1 flex items-center justify-center">
              {diceValue === 1 && (
                <span className="w-3.5 h-3.5 rounded-full shadow-glow-sm" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
              )}
              {diceValue === 2 && (
                <div className="w-full h-full flex justify-between p-0.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2.5 h-2.5 rounded-full self-end" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                </div>
              )}
              {diceValue === 3 && (
                <div className="w-full h-full flex justify-between p-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2 h-2 rounded-full self-center" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2 h-2 rounded-full self-end" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                </div>
              )}
              {diceValue === 4 && (
                <div className="grid grid-cols-2 gap-1.5 p-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                </div>
              )}
              {diceValue === 5 && (
                <div className="relative w-full h-full p-0.5 grid grid-cols-2 gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2 h-2 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                </div>
              )}
              {diceValue === 6 && (
                <div className="grid grid-cols-2 gap-1 p-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PLAYER_CONFIG[currentColor].hex }} />
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs font-bold text-slate-400">ROLL</span>
          )}
        </button>

        {/* Home Counter */}
        <div className="text-right">
          <p className="text-xs font-bold text-white flex items-center justify-end gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {tokens.filter((t) => t.color === currentColor && t.step === 57).length} / 2 Home
            </span>
          </p>
          <p className="text-[10px] text-slate-400">Fast Mode (2 to win)</p>
        </div>
      </div>
    </div>
  );
};
