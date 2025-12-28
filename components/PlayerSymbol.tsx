
import React from 'react';
import { Player } from '../types';

interface PlayerSymbolProps {
  player: Player;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const PlayerSymbol: React.FC<PlayerSymbolProps> = ({ player, className = "", size = "md" }) => {
  const isX = player === 'X';
  
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  if (isX) {
    // "The Blaze Bolt" - A sharp hexagonal 'X'
    return (
      <svg 
        viewBox="0 0 100 100" 
        className={`${sizeMap[size]} ${className} drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]`}
        fill="none" 
        stroke="currentColor" 
        strokeWidth="10" 
        strokeLinecap="round"
      >
        <path d="M20 20 L50 50 L80 20" />
        <path d="M20 80 L50 50 L80 80" />
        <path d="M50 10 L50 90" strokeWidth="4" strokeDasharray="10 10" opacity="0.3" />
        <path d="M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z" strokeWidth="2" opacity="0.4" />
      </svg>
    );
  }

  // "The Frost Core" - A nested concentric hexagonal 'O'
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`${sizeMap[size]} ${className} drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]`}
      fill="none" 
      stroke="currentColor" 
      strokeWidth="10"
    >
      <path d="M50 20 L76 35 L76 65 L50 80 L24 65 L24 35 Z" />
      <circle cx="50" cy="50" r="10" fill="currentColor" className="animate-pulse" />
      <path d="M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z" strokeWidth="2" opacity="0.4" />
    </svg>
  );
};

export default PlayerSymbol;
