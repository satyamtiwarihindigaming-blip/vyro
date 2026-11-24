import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

type Piece = string | null;

const INITIAL_BOARD: Piece[][] = [
  ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
  ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
  ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
];

export const MiniChess: React.FC = () => {
  const [board, setBoard] = useState<Piece[][]>(INITIAL_BOARD);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<'white' | 'black'>('white');
  const [captured, setCaptured] = useState<string[]>([]);

  const handleCellClick = (r: number, c: number) => {
    if (selectedCell) {
      const [fromR, fromC] = selectedCell;
      if (fromR === r && fromC === c) {
        setSelectedCell(null);
        return;
      }

      const targetPiece = board[r][c];
      const sourcePiece = board[fromR][fromC];

      // Execute move
      const newBoard = board.map((row) => [...row]);
      newBoard[r][c] = sourcePiece;
      newBoard[fromR][fromC] = null;

      if (targetPiece) {
        setCaptured((prev) => [...prev, targetPiece]);
      }

      setBoard(newBoard);
      setSelectedCell(null);
      setTurn(turn === 'white' ? 'black' : 'white');
    } else {
      if (board[r][c]) {
        setSelectedCell([r, c]);
      }
    }
  };

  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setSelectedCell(null);
    setTurn('white');
    setCaptured([]);
  };

  return (
    <div className="flex flex-col items-center p-3 select-none">
      <div className="flex items-center justify-between w-full max-w-[280px] mb-2 text-xs">
        <span className="font-bold text-white capitalize">
          Turn: <span className={turn === 'white' ? 'text-vyro-cyan' : 'text-vyro-accent'}>{turn}</span>
        </span>
        <button
          onClick={resetGame}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* 8x8 Chessboard Grid */}
      <div className="grid grid-cols-8 border-2 border-vyro-border rounded-xl overflow-hidden shadow-2xl">
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isDark = (r + c) % 2 === 1;
            const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-base sm:text-lg font-bold transition-colors ${
                  isSelected
                    ? 'bg-vyro-primary text-white shadow-inner'
                    : isDark
                    ? 'bg-slate-900 text-slate-200'
                    : 'bg-slate-800 text-slate-100'
                } hover:bg-vyro-primary/40`}
              >
                {cell}
              </button>
            );
          })
        )}
      </div>

      {captured.length > 0 && (
        <div className="mt-2 text-xs text-slate-400 truncate max-w-[280px]">
          Captured: {captured.join(' ')}
        </div>
      )}
    </div>
  );
};
