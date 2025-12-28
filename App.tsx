
import React, { useState, useEffect, useCallback } from 'react';
import { Player, GameState, SubBoardWinner } from './types';
import SubBoard from './components/SubBoard';
import Logo from './components/Logo';
import PlayerSymbol from './components/PlayerSymbol';
import { checkWinner, getAvailableMoves } from './services/gameLogic';
import { BOARD_INDICES, PLAYER_COLORS, UI_COLORS } from './constants';
import { getGeminiMove } from './services/geminiService';

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
  const [useAi, setUseAi] = useState(false);

  const handleMove = useCallback((boardIdx: number, cellIdx: number) => {
    if (gameState.gameWinner) return;
    if (gameState.nextBoardIndex !== null && boardIdx !== gameState.nextBoardIndex) return;
    if (gameState.boards[boardIdx][cellIdx]) return;
    if (gameState.subBoardWinners[boardIdx]) return;

    const newBoards = [...gameState.boards.map(b => [...b])];
    newBoards[boardIdx][cellIdx] = gameState.currentPlayer;

    const newSubBoardWinners = [...gameState.subBoardWinners];
    const newSubWinner = checkWinner(newBoards[boardIdx]);
    newSubBoardWinners[boardIdx] = newSubWinner;

    const gameWinner = checkWinner(newSubBoardWinners);

    let nextIdx: number | null = cellIdx;
    if (newSubBoardWinners[nextIdx] !== null) {
      nextIdx = null;
    }

    const nextPlayer: Player = gameState.currentPlayer === 'X' ? 'O' : 'X';
    
    setGameState(prev => ({
      ...prev,
      boards: newBoards,
      subBoardWinners: newSubBoardWinners,
      currentPlayer: nextPlayer,
      nextBoardIndex: nextIdx,
      gameWinner: gameWinner as (Player | 'DRAW' | null),
      history: [
        `${gameState.currentPlayer} sector linked at S${boardIdx + 1}`,
        ...prev.history.slice(0, 5)
      ]
    }));
  }, [gameState]);

  useEffect(() => {
    if (useAi && gameState.currentPlayer === 'O' && !gameState.gameWinner) {
      const timer = setTimeout(async () => {
        setIsAiThinking(true);
        const move = await getGeminiMove(gameState);
        setIsAiThinking(false);
        if (move) {
          handleMove(move.boardIdx, move.cellIdx);
        } else {
          const moves = getAvailableMoves(gameState.boards, gameState.subBoardWinners, gameState.nextBoardIndex);
          if (moves.length > 0) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            handleMove(randomMove.boardIdx, randomMove.cellIdx);
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [useAi, gameState, handleMove]);

  const resetGame = () => {
    setGameState(INITIAL_STATE);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8 relative">
      <header className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-between gap-8 mb-12 sm:mb-16">
        <Logo />
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className={`
            px-8 py-3 rounded-full text-lg sm:text-xl font-black border transition-all duration-300 flex items-center gap-4 shadow-xl backdrop-blur-md
            ${gameState.gameWinner ? 'bg-white border-white text-black' : 'bg-white/5 border-white/10'}
            ${!gameState.gameWinner && gameState.currentPlayer === 'X' ? UI_COLORS.X_BORDER : ''}
            ${!gameState.gameWinner && gameState.currentPlayer === 'O' ? UI_COLORS.O_BORDER : ''}
          `}>
            {gameState.gameWinner ? (
              <span className="uppercase tracking-tighter flex items-center gap-3">
                {gameState.gameWinner === 'DRAW' ? "NEURAL DEADLOCK" : (
                  <>
                    DOMAIN CAPTURED BY 
                    <PlayerSymbol player={gameState.gameWinner as Player} size="sm" className="inline" />
                  </>
                )}
              </span>
            ) : (
              <div className="flex items-center gap-3">
                <PlayerSymbol 
                  player={gameState.currentPlayer} 
                  size="sm" 
                  className={gameState.currentPlayer === 'X' ? 'animate-pulse' : 'animate-bounce'} 
                />
                <span className="tracking-widest text-[10px] font-bold text-white/60">
                  {gameState.currentPlayer === 'X' ? 'BLAZE_VECT_ACT' : 'FROST_CORE_ACT'}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={resetGame}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all active:scale-90"
              title="Soft Reboot"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button 
              onClick={() => setUseAi(!useAi)}
              className={`px-6 py-3 rounded-full font-black text-[10px] transition-all border flex items-center gap-3 shadow-lg active:scale-95 tracking-widest uppercase
                ${useAi ? 'bg-amber-500 border-amber-400 text-black' : 'bg-black border-white/10 text-white/40 hover:text-white'}
              `}
            >
              <span className="text-sm">🧠</span>
              NEURAL_AI
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-col xl:flex-row gap-12 items-center xl:items-start justify-center w-full max-w-[1600px] mb-20">
        
        <div className="relative p-6 sm:p-10 bg-white/[0.02] backdrop-blur-2xl rounded-[3rem] border border-white/5 shadow-2xl">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
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

          {isAiThinking && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-[100]">
              <div className="flex items-center gap-3 text-black font-black bg-white px-8 py-3 rounded-full shadow-2xl text-[10px] tracking-widest uppercase">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                Analyzing Vectors...
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-sm flex flex-col gap-6">
          <div className="p-8 bg-white/5 border border-white/5 rounded-[2rem] shadow-xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-3xl rounded-full"></div>
            <h3 className="text-sm font-black mb-6 text-zinc-300 flex items-center gap-3 tracking-[0.2em] uppercase">
              <span className="text-amber-500">::</span> HIVE_PROTOCOL
            </h3>
            <div className="space-y-4 text-xs text-zinc-500 font-bold leading-relaxed uppercase">
              <div className="flex gap-4">
                <span className="text-amber-500/50">01</span>
                <p>Sync 3 sectors to secure the domain.</p>
              </div>
              <div className="flex gap-4">
                <span className="text-amber-500/50">02</span>
                <p>Move index determines opponent's target vector.</p>
              </div>
              <div className="flex gap-4">
                <span className="text-amber-500/50">03</span>
                <p>Quantum jump enabled if target is locked.</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-black/40 border border-white/5 rounded-[2rem] shadow-xl flex-grow max-h-[250px] flex flex-col">
            <h3 className="text-[10px] font-black mb-6 text-zinc-600 tracking-[0.4em] uppercase flex justify-between">
              <span>Telemetry_Logs</span>
              <span className="text-emerald-500 animate-pulse">Synced</span>
            </h3>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-grow">
              {gameState.history.map((log, i) => (
                <div key={i} className={`flex items-start gap-4 text-[10px] tracking-widest transition-all duration-300 uppercase ${i === 0 ? 'text-white font-black' : 'text-zinc-700 opacity-30'}`}>
                  <span className="text-zinc-800 font-mono">[{5 - i}]</span>
                  <div className="flex items-center gap-2">
                    {log}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto text-zinc-800 text-[10px] flex flex-col items-center gap-6 py-10 w-full border-t border-white/5">
        <div className="flex gap-8 items-center bg-white/5 px-10 py-3 rounded-full border border-white/10 shadow-lg">
          <span className="flex items-center gap-3 font-black text-amber-500 tracking-tighter uppercase">
            <PlayerSymbol player="X" size="sm" /> BLAZE
          </span>
          <div className="h-4 w-[1px] bg-white/10"></div>
          <span className="flex items-center gap-3 font-black text-cyan-400 tracking-tighter uppercase">
            <PlayerSymbol player="O" size="sm" /> FROST
          </span>
        </div>
        <p className="font-bold tracking-[0.5em] opacity-30 uppercase text-white/50">Kernel 0.9.25 | Bee_Tic-Tac-Toe_Standard</p>
      </footer>
    </div>
  );
};

export default App;
