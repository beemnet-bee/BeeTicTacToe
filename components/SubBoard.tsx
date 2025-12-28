
import React from 'react';
import Cell from './Cell';
import PlayerSymbol from './PlayerSymbol';
import { Player, SubBoardWinner } from '../types';
import { PLAYER_COLORS, UI_COLORS } from '../constants';

interface SubBoardProps {
  boardIdx: number;
  cells: (Player | null)[];
  winner: SubBoardWinner;
  isActive: boolean;
  disabled: boolean;
  onCellClick: (cellIdx: number) => void;
}

const SubBoard: React.FC<SubBoardProps> = ({ boardIdx, cells, winner, isActive, disabled, onCellClick }) => {
  const isWonByX = winner === 'X';
  const isWonByO = winner === 'O';

  return (
    <div className={`
      relative p-2 rounded-xl transition-all duration-500 border
      ${isActive ? 'active-pulse bg-[#16161b] border-amber-500/40 z-10' : 'bg-[#0a0a0d] border-white/5'}
      ${winner ? 'opacity-100 scale-100' : ''}
    `}>
      <div className="grid grid-cols-3 gap-1.5 w-[90px] sm:w-[120px] md:w-[150px]">
        {cells.map((cell, cellIdx) => (
          <Cell
            key={`${boardIdx}-${cellIdx}`}
            value={cell}
            isActive={isActive}
            disabled={disabled || winner !== null}
            onClick={() => onCellClick(cellIdx)}
          />
        ))}
      </div>

      {/* Capture Overlay */}
      {winner && (winner !== 'DRAW') && (
        <div className={`
          absolute inset-0 flex items-center justify-center rounded-xl z-20
          backdrop-blur-[2px] border-2 animate-in fade-in zoom-in duration-500
          ${isWonByX ? `${PLAYER_COLORS.X_BG} ${UI_COLORS.X_BORDER} ${UI_COLORS.X_GLOW}` : ''}
          ${isWonByO ? `${PLAYER_COLORS.O_BG} ${UI_COLORS.O_BORDER} ${UI_COLORS.O_GLOW}` : ''}
        `}>
          <PlayerSymbol 
            player={winner as Player} 
            size="xl" 
            className={`transform transition-transform duration-700 ${isWonByX ? 'rotate-[-5deg]' : 'rotate-[5deg]'}`}
          />
        </div>
      )}

      {winner === 'DRAW' && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl z-20 backdrop-blur-[4px] bg-black/60 border-2 border-zinc-700 animate-in fade-in duration-300">
           <span className="text-4xl opacity-50 font-black text-white">DRAW</span>
        </div>
      )}
    </div>
  );
};

export default SubBoard;
