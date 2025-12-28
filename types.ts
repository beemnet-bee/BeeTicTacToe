
export type Player = 'X' | 'O';
export type SubBoardWinner = Player | 'DRAW' | null;

export interface GameState {
  // 9 sub-boards, each with 9 cells
  boards: (Player | null)[][];
  // Winners for each of the 9 sub-boards
  subBoardWinners: SubBoardWinner[];
  currentPlayer: Player;
  // Index of the sub-board the player must play in. null means free move.
  nextBoardIndex: number | null;
  gameWinner: Player | 'DRAW' | null;
  history: string[];
}
