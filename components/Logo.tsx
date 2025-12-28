
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-5 select-none group cursor-default">
      <div className="relative w-14 h-14 flex items-center justify-center">
        {/* Hexagonal Outer Frame */}
        <svg viewBox="0 0 100 100" className="w-full h-full absolute transition-transform duration-700 group-hover:rotate-30">
          <path 
            d="M50 5 L89 27.5 L89 72.5 L50 95 L11 72.5 L11 27.5 Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            className="opacity-10 dark:opacity-20"
          />
          {/* Cyan Glow Wing Left */}
          <path 
            d="M50 50 L15 35 L15 65 Z" 
            fill="currentColor" 
            className="text-cyan-500 opacity-10 dark:opacity-20 group-hover:opacity-40 transition-opacity" 
          />
          {/* Amber Glow Wing Right */}
          <path 
            d="M50 50 L85 35 L85 65 Z" 
            fill="currentColor" 
            className="text-amber-500 opacity-10 dark:opacity-20 group-hover:opacity-40 transition-opacity" 
          />
        </svg>

        {/* Central Bee Body - Cyber Stylized */}
        <div className="relative z-10 w-4 h-8 flex flex-col items-center gap-1">
          {/* Head */}
          <div className="w-3 h-3 bg-stone-800 dark:bg-white rounded-sm rotate-45 shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_white]"></div>
          {/* Thorax/Body segments */}
          <div className="w-4 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_#f59e0b]"></div>
          <div className="w-4 h-2 bg-stone-300 dark:bg-zinc-800 rounded-full"></div>
          <div className="w-4 h-3 bg-amber-500 rounded-t-sm rounded-b-xl shadow-[0_0_12px_#f59e0b]"></div>
        </div>

        {/* Floating Circuit Accents */}
        <div className="absolute inset-0 animate-[spin_10s_linear_infinite] opacity-30">
           <div className="absolute top-0 left-1/2 w-1 h-1 bg-cyan-400 rounded-full"></div>
           <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-amber-400 rounded-full"></div>
        </div>
      </div>

      <div className="flex flex-col">
        <h1 className="text-4xl font-black tracking-tighter leading-none flex items-baseline">
          <span className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">BEE</span>
          <span className="text-stone-800 dark:text-white ml-1.5 transition-colors duration-500">TIC-TAC-TOE</span>
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-[1px] w-4 bg-amber-500/30"></div>
          <span className="text-[9px] tracking-[0.5em] font-black text-stone-400 dark:text-zinc-500 uppercase transition-colors duration-500">Neural Hive Interface</span>
          <div className="h-[1px] w-4 bg-cyan-500/30"></div>
        </div>
      </div>
    </div>
  );
};

export default Logo;
