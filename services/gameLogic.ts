
import { WINNING_COMBINATIONS, BOARD_INDICES } from '../constants';
import { Player, SubBoardWinner } from '../types';

export const checkWinner = (cells: (Player | null)[]): SubBoardWinner => {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
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
