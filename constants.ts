
export const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export const BOARD_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8];

// Symbols are now component-based, these keys act as identifiers
export const PLAYER_SYMBOLS = {
  X: 'X',
  O: 'O'
};

export const UI_COLORS = {
  X: 'text-amber-500',
  O: 'text-cyan-400',
  X_LIGHT: '#fbbf24',
  O_LIGHT: '#22d3ee',
  X_GLOW: 'shadow-[0_0_25px_rgba(245,158,11,0.4)]',
  O_GLOW: 'shadow-[0_0_25px_rgba(34,211,238,0.4)]',
  X_BORDER: 'border-amber-500/50',
  O_BORDER: 'border-cyan-400/50',
  BG_DARK: 'bg-[#0a0a0c]',
  PANEL: 'bg-[#121215]',
};

export const PLAYER_COLORS = {
  X: UI_COLORS.X,
  O: UI_COLORS.O,
  X_BG: 'bg-amber-600/10',
  O_BG: 'bg-cyan-600/10',
  X_BORDER: UI_COLORS.X_BORDER,
  O_BORDER: UI_COLORS.O_BORDER,
  X_GLOW: UI_COLORS.X_GLOW,
  O_GLOW: UI_COLORS.O_GLOW,
};
