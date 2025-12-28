
import React from 'react';
import { Player } from '../types';
import { UI_COLORS } from '../constants';
import PlayerSymbol from './PlayerSymbol';

interface CellProps {
  value: Player | null;
  onClick: () => void;
  isActive: boolean;
  disabled: boolean;
}

const Cell: React.FC<CellProps> = ({ value, onClick, isActive, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        aspect-square w-full
        flex items-center justify-center
        rounded-md transition-all duration-300 transform
        ${!value && !disabled ? 'hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer active:scale-90' : 'cursor-default'}
        ${isActive ? 'bg-stone-100 dark:bg-[#1a1a1f] border border-black/5 dark:border-white/10' : 'bg-stone-50/50 dark:bg-[#0f0f12]'}
        ${disabled && !value ? 'opacity-20' : 'opacity-100'}
        ${value === 'X' ? UI_COLORS.X : UI_COLORS.O}
        ${value ? 'scale-100' : 'scale-95'}
      `}
    >
      {value && (
        <PlayerSymbol 
          player={value} 
          size="md" 
          className="transition-all duration-500 scale-100" 
        />
      )}
    </button>
  );
};

export default Cell;
