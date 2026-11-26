import React, { useState } from 'react';
import { Gamepad2, Trophy, RotateCcw, Dices } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { LudoGame } from '../components/games/LudoGame';

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
        setTriviaStep(99); // Finished
      }
    }, 900);
  };

  const winner = checkWinner(board);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-amber-400" />
            <span>VYRO Social Arcade</span>
          </h2>
          <p className="text-xs text-slate-400">Casual multiplayer in-chat games with official Ludo King rules.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedGame('ludo')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedGame === 'ludo'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'bg-vyro-card text-slate-400 hover:text-white border border-vyro-border'
            }`}
          >
            <Dices className="w-4 h-4 text-amber-300" />
            <span>Cyber Ludo</span>
          </button>
          <button
            onClick={() => setSelectedGame('tictactoe')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedGame === 'tictactoe'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'bg-vyro-card text-slate-400 hover:text-white border border-vyro-border'
            }`}
          >
            Tic-Tac-Toe
          </button>
          <button
            onClick={() => setSelectedGame('trivia')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedGame === 'trivia'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'bg-vyro-card text-slate-400 hover:text-white border border-vyro-border'
            }`}
          >
            Tech Trivia
          </button>
        </div>
      </div>

      {selectedGame === 'ludo' ? (
        <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-vyro-border flex flex-col items-center">
          <div className="text-center mb-2">
            <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
              <Dices className="w-5 h-5 text-amber-400" />
              <span>Cyber Ludo Arena</span>
            </h3>
            <p className="text-xs text-slate-400">Play with friends or challenge the smart bot!</p>
          </div>
          <LudoGame />
        </div>
      ) : selectedGame === 'tictactoe' ? (
        <div className="glass-panel rounded-3xl p-6 border border-vyro-border flex flex-col items-center">
          <div className="text-center mb-4">
            <h3 className="text-base font-bold text-white">Cyber Tic-Tac-Toe</h3>
            <p className="text-xs text-slate-400">
              {winner ? `Winner: Player ${winner}! 🎉` : `Turn: Player ${isXNext ? 'X' : 'O'}`}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-64 h-64">
            {board.map((cell, idx) => (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                className="w-full h-full rounded-2xl bg-vyro-bg border border-vyro-border hover:border-vyro-primary text-2xl font-bold flex items-center justify-center transition-all select-none"
              >
                {cell === 'X' ? (
                  <span className="text-vyro-primary animate-scaleUp">X</span>
                ) : cell === 'O' ? (
                  <span className="text-vyro-accent animate-scaleUp">O</span>
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
            className="mt-6 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-vyro-card border border-vyro-border text-xs text-slate-300 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Board</span>
          </button>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-6 border border-vyro-border max-w-xl mx-auto">
          {triviaStep < triviaQuestions.length ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Question {triviaStep + 1} of {triviaQuestions.length}</span>
                <span className="font-bold text-vyro-cyan">Score: {triviaScore} pts</span>
              </div>

              <h3 className="text-sm font-bold text-white">
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
                      className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all ${
                        isChosen
                          ? isCorrect
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-vyro-card border-vyro-border hover:border-vyro-primary text-slate-200'
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
              <Trophy className="w-12 h-12 text-vyro-gold mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white">Trivia Complete!</h3>
              <p className="text-xs text-slate-300">You scored {triviaScore} points.</p>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => {
                  setTriviaStep(0);
                  setTriviaScore(0);
                }}
              >
                Play Again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
