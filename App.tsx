
import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Player, GameState, SubBoardWinner } from './types';
import SubBoard from './components/SubBoard';
import Logo from './components/Logo';
import PlayerSymbol from './components/PlayerSymbol';
import { checkWinner, getAvailableMoves } from './services/gameLogic';
import { BOARD_INDICES, PLAYER_COLORS, UI_COLORS, PLAYER_SYMBOLS } from './constants';
import { getGeminiMove, Difficulty } from './services/geminiService';

const INITIAL_STATE: GameState = {
  boards: Array(9).fill(null).map(() => Array(9).fill(null)),
  subBoardWinners: Array(9).fill(null),
  currentPlayer: 'X',
  nextBoardIndex: null,
  gameWinner: null,
  history: ["Ready for link-up."],
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [useAi, setUseAi] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === null ? true : saved === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (gameState.gameWinner && gameState.gameWinner !== 'DRAW') {
      const winnerColor = gameState.gameWinner === 'X' ? UI_COLORS.X_LIGHT : UI_COLORS.O_LIGHT;
      const count = 250;
      const defaults = { origin: { y: 0.6 }, colors: [winnerColor, '#ffffff'], zIndex: 1000 };
      const fire = (particleRatio: number, opts: any) => confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }
  }, [gameState.gameWinner]);

  const handleMove = useCallback((boardIdx: number, cellIdx: number) => {
    if (gameState.gameWinner) return false;
    if (gameState.nextBoardIndex !== null && boardIdx !== gameState.nextBoardIndex) return false;
    if (gameState.boards[boardIdx][cellIdx]) return false;
    if (gameState.subBoardWinners[boardIdx]) return false;

    const newBoards = [...gameState.boards.map(b => [...b])];
    newBoards[boardIdx][cellIdx] = gameState.currentPlayer;
    const newSubBoardWinners = [...gameState.subBoardWinners];
    newSubBoardWinners[boardIdx] = checkWinner(newBoards[boardIdx]);
    const gameWinner = checkWinner(newSubBoardWinners);

    let nextIdx: number | null = cellIdx;
    if (newSubBoardWinners[nextIdx] !== null) nextIdx = null;

    setGameState(prev => ({
      ...prev,
      boards: newBoards,
      subBoardWinners: newSubBoardWinners,
      currentPlayer: prev.currentPlayer === 'X' ? 'O' : 'X',
      nextBoardIndex: nextIdx,
      gameWinner: gameWinner as (Player | 'DRAW' | null),
      history: [`${prev.currentPlayer} @ S${boardIdx + 1}.${cellIdx + 1}`, ...prev.history.slice(0, 5)]
    }));
    return true;
  }, [gameState]);

  useEffect(() => {
    if (useAi && gameState.currentPlayer === 'O' && !gameState.gameWinner) {
      const timer = setTimeout(async () => {
        setIsAiThinking(true);
        let move = await getGeminiMove(gameState, difficulty);
        const validMoves = getAvailableMoves(gameState.boards, gameState.subBoardWinners, gameState.nextBoardIndex);
        const isMoveValid = move && validMoves.some(m => m.boardIdx === move!.boardIdx && m.cellIdx === move!.cellIdx);
        setIsAiThinking(false);

        if (isMoveValid && move) {
          handleMove(move.boardIdx, move.cellIdx);
        } else if (validMoves.length > 0) {
          const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
          handleMove(randomMove.boardIdx, randomMove.cellIdx);
        }
      }, 50); 
      return () => clearTimeout(timer);
    }
  }, [useAi, gameState, handleMove, difficulty]);

  const resetGame = () => setGameState(INITIAL_STATE);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8 relative transition-colors duration-500 overflow-x-hidden">
      <header className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-between gap-8 mb-12 sm:mb-16">
        <Logo />
        
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className={`
              px-8 py-3 rounded-full text-lg sm:text-xl font-black border transition-all duration-500 flex items-center gap-4 shadow-xl backdrop-blur-md
              ${gameState.gameWinner ? 'bg-stone-800 text-white dark:bg-white dark:text-black' : 'bg-white/80 dark:bg-white/5 border-stone-300 dark:border-white/10'}
            `}>
              {gameState.gameWinner ? (
                <span className="uppercase tracking-tighter flex items-center gap-3">
                  {gameState.gameWinner === 'DRAW' ? "NEURAL DEADLOCK" : "SYNC_COMPLETE"}
                  {gameState.gameWinner !== 'DRAW' && <PlayerSymbol player={gameState.gameWinner as Player} size="sm" />}
                </span>
              ) : (
                <div className="flex items-center gap-3">
                  <PlayerSymbol player={gameState.currentPlayer} size="sm" className={gameState.currentPlayer === 'X' ? 'animate-pulse' : 'animate-bounce'} />
                  <span className="tracking-widest text-[10px] font-bold opacity-70">
                    {gameState.currentPlayer === 'X' ? 'BLAZE_ACTIVE' : 'FROST_ACTIVE'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={toggleTheme} 
                className="p-3 bg-white/80 dark:bg-white/5 border border-stone-300 dark:border-white/10 rounded-full transition-all shadow-sm hover:border-amber-500/50 group"
                title="Toggle Interface Brightness"
              >
                {isDarkMode ? (
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-500 fill-none stroke-current stroke-[2] transition-transform duration-500 group-hover:rotate-45" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-stone-600 fill-none stroke-current stroke-[2] transition-transform duration-500 group-hover:-rotate-12" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    <circle cx="12" cy="12" r="10" className="opacity-10" />
                  </svg>
                )}
              </button>

              <button 
                onClick={resetGame} 
                className="p-3 bg-white/80 dark:bg-white/5 border border-stone-300 dark:border-white/10 rounded-full transition-all shadow-sm hover:border-amber-500/50 group"
                title="Initiate Vector Reboot"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-stone-600 dark:text-zinc-400 fill-none stroke-current stroke-[2] transition-transform duration-700 group-hover:rotate-180" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>

              <button 
                onClick={() => setUseAi(!useAi)} 
                className={`px-6 py-3 rounded-full font-black text-[10px] transition-all border flex items-center gap-3 shadow-lg tracking-widest uppercase ${useAi ? 'bg-amber-500 border-amber-400 text-black' : 'bg-stone-200 dark:bg-black border-stone-300 dark:border-white/10 text-stone-600 dark:text-white/40'}`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[2.5]" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 16a6 6 0 1 1 6-6 6 6 0 0 1-6 6z" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" className={useAi ? 'animate-pulse' : ''} />
                </svg>
                {useAi ? 'AI_ON' : 'PVP'}
              </button>
            </div>
          </div>

          {useAi && (
            <div className="flex items-center bg-white/40 dark:bg-black/40 p-1 rounded-2xl border border-stone-200 dark:border-white/5 shadow-inner">
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300 ${
                    difficulty === level 
                    ? 'bg-amber-500 text-black shadow-lg scale-105' 
                    : 'text-stone-400 dark:text-zinc-600 hover:text-stone-600 dark:hover:text-zinc-400'
                  }`}
                >
                  {level === 'Easy' ? 'EASY_VECT' : level === 'Medium' ? 'MED_CORE' : 'HARD_SYNC'}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="flex flex-col xl:flex-row gap-12 items-center xl:items-start justify-center w-full max-w-[1600px] mb-20 relative">
        <div className="relative p-6 sm:p-10 bg-white/60 dark:bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] border border-stone-300 dark:border-white/5 shadow-2xl transition-all duration-700">
          <div className={`grid grid-cols-3 gap-4 sm:gap-8 transition-all duration-1000 ${gameState.gameWinner ? 'blur-xl scale-[0.98] grayscale-[0.5]' : ''}`}>
            {BOARD_INDICES.map((boardIdx) => (
              <SubBoard
                key={boardIdx}
                boardIdx={boardIdx}
                cells={gameState.boards[boardIdx]}
                winner={gameState.subBoardWinners[boardIdx]}
                isActive={!gameState.gameWinner && (gameState.nextBoardIndex === null || gameState.nextBoardIndex === boardIdx)}
                disabled={!!gameState.gameWinner || (gameState.nextBoardIndex !== null && gameState.nextBoardIndex !== boardIdx) || (isAiThinking && gameState.currentPlayer === 'O')}
                onCellClick={(cellIdx) => handleMove(boardIdx, cellIdx)}
              />
            ))}
          </div>

          {gameState.gameWinner && (
            <div className="absolute inset-0 z-[50] flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-700">
              <div className="flex flex-col items-center gap-6 text-center">
                <div className={`p-12 rounded-[3rem] border-4 transition-all duration-1000 transform scale-125 ${gameState.gameWinner === 'X' ? 'bg-amber-500/10 border-amber-500' : gameState.gameWinner === 'O' ? 'bg-cyan-400/10 border-cyan-400' : 'bg-zinc-800/20 border-zinc-500'}`}>
                  {gameState.gameWinner !== 'DRAW' ? (
                    <div className="flex flex-col items-center gap-8">
                      <PlayerSymbol player={gameState.gameWinner as Player} size="xl" className="w-32 h-32 md:w-48 md:h-48 drop-shadow-xl" />
                      <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase dark:text-white text-stone-900">
                        {gameState.gameWinner === 'X' ? 'BLAZE_DOMINANCE' : 'FROST_ABSOLUTE'}
                      </h2>
                    </div>
                  ) : <h2 className="text-5xl font-black text-white">DEADLOCK</h2>}
                </div>
                <button onClick={resetGame} className="mt-8 px-10 py-4 bg-stone-900 dark:bg-white text-white dark:text-black rounded-full font-black text-xs tracking-[0.3em] uppercase hover:scale-110 active:scale-95 transition-all shadow-2xl">
                  Initiate Soft Reboot
                </button>
              </div>
            </div>
          )}

          {isAiThinking && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-[100]">
              <div className="flex items-center gap-3 text-white dark:text-black font-black bg-stone-900 dark:bg-white px-8 py-3 rounded-full shadow-2xl text-[10px] tracking-widest uppercase border border-amber-500/30">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                {difficulty === 'Hard' ? 'OPTIMIZING_LOGIC...' : 'ANALYZING_VECTORS...'}
              </div>
            </div>
          )}
        </div>

        <div className={`w-full max-w-sm flex flex-col gap-6 transition-all duration-700 ${gameState.gameWinner ? 'opacity-30 blur-sm scale-95' : ''}`}>
          <div className="p-8 bg-white/90 dark:bg-white/5 border border-stone-200 dark:border-white/5 rounded-[2rem] shadow-xl">
            <h3 className="text-sm font-black mb-6 text-stone-500 dark:text-zinc-300 tracking-[0.2em] uppercase">:: HIVE_STATUS</h3>
            <div className="space-y-4 text-[10px] text-stone-600 dark:text-zinc-500 font-bold uppercase">
               <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-2">
                  <span>AI_PROTOCOL</span>
                  <span className={useAi ? "text-emerald-500" : "text-rose-500"}>{useAi ? "LINKED" : "OFFLINE"}</span>
               </div>
               <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-2">
                  <span>VECT_DEPTH</span>
                  <span className="text-amber-500">{difficulty === 'Easy' ? 'FAST' : difficulty === 'Medium' ? 'FAST' : 'MAX_SPD'}</span>
               </div>
               <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-2">
                  <span>NEXT_VECTOR</span>
                  <span className="text-cyan-400">{gameState.nextBoardIndex !== null ? `S${gameState.nextBoardIndex + 1}` : "FREE_JUMP"}</span>
               </div>
            </div>
          </div>

          <div className="p-8 bg-stone-200/50 dark:bg-black/40 border border-stone-300 dark:border-white/5 rounded-[2rem] shadow-xl flex-grow max-h-[250px] flex flex-col">
            <h3 className="text-[10px] font-black mb-6 text-stone-500 dark:text-zinc-600 tracking-[0.4em] uppercase">Telemetry_Logs</h3>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-grow">
              {gameState.history.map((log, i) => (
                <div key={i} className={`flex items-start gap-4 text-[10px] tracking-widest transition-all duration-300 uppercase ${i === 0 ? 'text-stone-900 dark:text-white font-black' : 'text-stone-500 dark:text-zinc-700 opacity-60'}`}>
                  <span className="font-mono">[{gameState.history.length - i}]</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
