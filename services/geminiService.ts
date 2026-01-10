
import { GoogleGenAI, Type } from "@google/genai";
import { GameState } from "../types";

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export const getGeminiMove = async (
  state: GameState, 
  difficulty: Difficulty = 'Medium'
): Promise<{ boardIdx: number, cellIdx: number } | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Use gemini-3-flash-preview for ALL levels to ensure maximum speed.
  const model = 'gemini-3-flash-preview';
  
  // High-intensity instructions for Flash to maintain difficulty tiers
  const systemInstructions = {
    'Easy': "Play Ultimate Tic-Tac-Toe very casually. Do not think ahead. Make moves that are legal but not necessarily smart. Prioritize filling sub-boards randomly over blocking the opponent.",
    'Medium': "Play Ultimate Tic-Tac-Toe strategically. Try to win sub-boards and block the opponent if they are about to win a sub-board. Maintain a balanced approach to the main board.",
    'Hard': "Play like a Grandmaster. You are a highly efficient neural processor. Calculate the best move to win the overall 3x3 game. Prioritize controlling the center and corners of the main board. Always block the opponent's winning moves on both sub-boards and the main board. Be aggressive and play optimally."
  };

  try {
    const prompt = `
      System: ${systemInstructions[difficulty]}
      
      Current Game State:
      - Active Player: ${state.currentPlayer}
      - Target Sub-Board (0-8): ${state.nextBoardIndex === null ? 'Any (Free move)' : state.nextBoardIndex}
      - Sub-Board Completion Status: ${JSON.stringify(state.subBoardWinners)}
      - Full Board Grid: ${JSON.stringify(state.boards)}
      
      Rules:
      1. You MUST play in the sub-board index equal to the cell index of the player's last move.
      2. If that board is captured or full, play anywhere.
      
      Output ONLY a JSON object with boardIdx and cellIdx.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        // Disable thinking budget completely for near-zero latency
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            boardIdx: { type: Type.INTEGER, description: "Index of the 3x3 sub-board (0-8)" },
            cellIdx: { type: Type.INTEGER, description: "Index of the cell within that sub-board (0-8)" },
          },
          required: ['boardIdx', 'cellIdx'],
        },
      },
    });

    let text = response.text || '';
    text = text.replace(/^```json/, '').replace(/```$/, '').trim();
    
    try {
      const result = JSON.parse(text);
      if (typeof result.boardIdx === 'number' && typeof result.cellIdx === 'number') {
        return { boardIdx: result.boardIdx, cellIdx: result.cellIdx };
      }
    } catch (e) {
      console.warn("AI parsing error, falling back to logic", text);
    }
    
    return null;
  } catch (error) {
    console.error("Gemini AI performance error:", error);
    return null;
  }
};
