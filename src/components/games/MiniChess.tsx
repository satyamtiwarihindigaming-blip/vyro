import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { soundEngine } from '../../lib/soundEngine';

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
      soundEngine.playPop();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([15, 25]);
      }
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
        soundEngine.playHapticClick();
        setSelectedCell([r, c]);
      }
    }
  };

  const resetGame = () => {
    soundEngine.playHapticClick();
    setBoard(INITIAL_BOARD);
    setSelectedCell(null);
    setTurn('white');
    setCaptured([]);
  };

  return (
    <div className="flex flex-col items-center p-3 select-none liquid-glass-inner rounded-3xl border border-white/10 shadow-xl">
      <div className="flex items-center justify-between w-full max-w-[280px] mb-2 text-xs">
        <span className="font-semibold text-white capitalize flex items-center gap-1.5">
          <span>Turn:</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${turn === 'white' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
            {turn}
          </span>
        </span>
        <button
          onClick={resetGame}
          className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* 8x8 Chessboard Grid */}
      <div className="grid grid-cols-8 border border-white/15 rounded-2xl overflow-hidden shadow-2xl">
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
                    ? 'bg-cyan-500/50 text-white shadow-inner'
                    : isDark
                    ? 'bg-black/70 text-white/80'
                    : 'bg-white/10 text-white'
                } hover:bg-cyan-500/20`}
              >
                {cell}
              </button>
            );
          })
        )}
      </div>

      {captured.length > 0 && (
        <div className="mt-2 text-xs text-white/50 truncate max-w-[280px]">
          Captured: {captured.join(' ')}
        </div>
      )}
    </div>
  );
};
