
import { GoogleGenAI } from "@google/genai";
import { GameState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getGeminiMove = async (state: GameState): Promise<{ boardIdx: number, cellIdx: number } | null> => {
  try {
    const prompt = `
      I am playing Ultimate Tic-Tac-Toe. 
      Current Player: ${state.currentPlayer}
      Next Required Sub-Board: ${state.nextBoardIndex === null ? 'Any (Free move)' : state.nextBoardIndex}
      
      Board State: ${JSON.stringify(state.boards)}
      Sub-Board Winners: ${JSON.stringify(state.subBoardWinners)}
      
      Rules Recap:
      1. A player must play in the sub-board corresponding to the cell index of the previous move.
      2. If that sub-board is already won or full, it's a "Free Move" in any open sub-board.
      3. Winning 3 sub-boards in a row wins the game.
      
      Analyze the board and suggest the best move for ${state.currentPlayer}.
      Respond ONLY with a JSON object in this format: {"boardIdx": 0-8, "cellIdx": 0-8, "reasoning": "brief explanation"}.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const result = JSON.parse(response.text || '{}');
    if (typeof result.boardIdx === 'number' && typeof result.cellIdx === 'number') {
      return { boardIdx: result.boardIdx, cellIdx: result.cellIdx };
    }
    return null;
  } catch (error) {
    console.error("Gemini failed to suggest a move:", error);
    return null;
  }
};
