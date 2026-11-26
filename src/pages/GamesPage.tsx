import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Trophy, RotateCcw, Dices } from 'lucide-react';
import { LudoGame } from '../components/games/LudoGame';
import { SPRING_SNAPPY } from '../lib/motion';

export const GamesPage: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<'ludo' | 'tictactoe' | 'trivia'>('ludo');
  const [triviaStep, setTriviaStep] = useState(0);
  const [triviaScore, setTriviaScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Tic Tac Toe State
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const triviaQuestions = [
    {
      q: 'Which video protocol provides encrypted, sub-second peer-to-peer audio and video calling?',
      options: ['WebRTC', 'FTP', 'RTSP', 'SMTP'],
      correct: 0,
    },
    {
      q: 'What is the modern standard format for high-compression, web-optimized photography?',
      options: ['BMP', 'WebP', 'TIFF', 'GIF'],
      correct: 1,
    },
    {
      q: 'In database architecture, what does RLS stand for?',
      options: ['Realtime Link Server', 'Row-Level Security', 'Remote Logic Storage', 'Rapid Log Stream'],
      correct: 1,
    },
  ];

  const handleCellClick = (index: number) => {
    if (board[index] || checkWinner(board)) return;
    const nextBoard = [...board];
    nextBoard[index] = isXNext ? 'X' : 'O';
    setBoard(nextBoard);
    setIsXNext(!isXNext);
  };

  const checkWinner = (sq: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) return sq[a];
    }
    return null;
  };

  const handleTriviaAnswer = (index: number) => {
    setSelectedAnswer(index);
    if (index === triviaQuestions[triviaStep].correct) {
      setTriviaScore((prev) => prev + 100);
    }
    setTimeout(() => {
      setSelectedAnswer(null);
      if (triviaStep < triviaQuestions.length - 1) {
        setTriviaStep((prev) => prev + 1);
      } else {
        setTriviaStep(99);
      }
    }, 900);
  };

  const winner = checkWinner(board);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2 tracking-tight">
            <Gamepad2 className="w-6 h-6 text-amber-300" />
            <span>VYRO Social Arcade</span>
          </h2>
          <p className="text-xs text-white/60">Casual multiplayer in-chat games with official Ludo King rules.</p>
        </div>

        <div className="relative flex items-center p-1 rounded-full liquid-glass-inner">
          {(
            [
              { id: 'ludo', label: 'Cyber Ludo', icon: Dices },
              { id: 'tictactoe', label: 'Tic-Tac-Toe', icon: null },
              { id: 'trivia', label: 'Tech Trivia', icon: null },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedGame === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedGame(tab.id)}
                className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isActive ? 'text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="gamesTabPill"
                    className="absolute inset-0 rounded-full bg-white/20 border border-white/25 shadow-sm"
                    transition={SPRING_SNAPPY}
                  />
                )}
                {Icon && <Icon className="w-3.5 h-3.5 relative z-10 text-amber-300" />}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedGame === 'ludo' ? (
        <div className="liquid-glass rounded-[32px] p-4 sm:p-6 flex flex-col items-center">
          <div className="text-center mb-2">
            <h3 className="text-base font-semibold text-white flex items-center justify-center gap-2 tracking-tight">
              <Dices className="w-5 h-5 text-amber-300" />
              <span>Cyber Ludo Arena</span>
            </h3>
            <p className="text-xs text-white/50">Play with friends or challenge the smart bot!</p>
          </div>
          <LudoGame />
        </div>
      ) : selectedGame === 'tictactoe' ? (
        <div className="liquid-glass rounded-[32px] p-6 flex flex-col items-center">
          <div className="text-center mb-4">
            <h3 className="text-base font-semibold text-white tracking-tight">Cyber Tic-Tac-Toe</h3>
            <p className="text-xs text-white/60">
              {winner ? `Winner: Player ${winner}! 🎉` : `Turn: Player ${isXNext ? 'X' : 'O'}`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-64 h-64">
            {board.map((cell, idx) => (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                className="w-full h-full rounded-2xl liquid-glass-inner hover:border-white/30 text-2xl font-bold flex items-center justify-center transition-all select-none"
              >
                {cell === 'X' ? (
                  <span className="text-cyan-300">X</span>
                ) : cell === 'O' ? (
                  <span className="text-rose-400">O</span>
                ) : (
                  ''
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setBoard(Array(9).fill(null));
              setIsXNext(true);
            }}
            className="mt-6 flex items-center gap-1.5 px-4 py-2 rounded-full liquid-glass-inner text-xs text-white/70 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Board</span>
          </button>
        </div>
      ) : (
        <div className="liquid-glass rounded-[32px] p-6 max-w-xl mx-auto space-y-4">
          {triviaStep < triviaQuestions.length ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-white/60">
                <span>Question {triviaStep + 1} of {triviaQuestions.length}</span>
                <span className="font-semibold text-cyan-300">Score: {triviaScore} pts</span>
              </div>

              <h3 className="text-sm font-semibold text-white tracking-tight">
                {triviaQuestions[triviaStep].q}
              </h3>

              <div className="space-y-2 pt-2">
                {triviaQuestions[triviaStep].options.map((opt, i) => {
                  const isChosen = selectedAnswer === i;
                  const isCorrect = i === triviaQuestions[triviaStep].correct;
                  return (
                    <button
                      key={i}
                      disabled={selectedAnswer !== null}
                      onClick={() => handleTriviaAnswer(i)}
                      className={`w-full text-left p-3.5 rounded-2xl border text-xs font-semibold transition-all ${
                        isChosen
                          ? isCorrect
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                            : 'bg-rose-500/20 border-rose-500 text-rose-200'
                          : 'liquid-glass-inner text-white/80 hover:text-white hover:bg-white/15'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <Trophy className="w-12 h-12 text-amber-300 mx-auto animate-bounce" />
              <h3 className="text-lg font-semibold text-white">Trivia Complete!</h3>
              <p className="text-xs text-white/60">You scored {triviaScore} points.</p>
              <button
                onClick={() => {
                  setTriviaStep(0);
                  setTriviaScore(0);
                }}
                className="px-6 py-2.5 rounded-full liquid-pill-cta text-xs font-semibold text-white shadow-lg"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
