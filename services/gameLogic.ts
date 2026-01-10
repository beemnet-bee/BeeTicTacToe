
import { WINNING_COMBINATIONS, BOARD_INDICES } from '../constants';
import { Player, SubBoardWinner } from '../types';

// Updated to accept SubBoardWinner[] (Player | 'DRAW' | null)[] to fix type errors 
// when checking the main game board winners array in App.tsx.
export const checkWinner = (cells: SubBoardWinner[]): SubBoardWinner => {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    // Only check for Player wins ('X' or 'O'). 'DRAW' is not a win condition for 3-in-a-row.
    if (cells[a] && cells[a] !== 'DRAW' && cells[a] === cells[b] && cells[a] === cells[c]) {
      return cells[a] as Player;
    }
  }
  if (cells.every(cell => cell !== null)) {
    return 'DRAW';
  }
  return null;
};

export const getAvailableMoves = (
  boards: (Player | null)[][],
  subBoardWinners: SubBoardWinner[],
  nextBoardIndex: number | null
): { boardIdx: number, cellIdx: number }[] => {
  const moves: { boardIdx: number, cellIdx: number }[] = [];
  
  const targetBoards = nextBoardIndex === null 
    ? BOARD_INDICES.filter(i => subBoardWinners[i] === null)
    : [nextBoardIndex];

  targetBoards.forEach(boardIdx => {
    boards[boardIdx].forEach((cell, cellIdx) => {
      if (cell === null) {
        moves.push({ boardIdx, cellIdx });
      }
    });
  });

  return moves;
};
