
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuestions = async (topic: string, count: number = 5): Promise<Question[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate ${count} high-quality quiz questions about: ${topic}. Each question must have exactly 4 options and one correct answer.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "The quiz question text." },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of exactly 4 options."
            },
            correctAnswer: { 
              type: Type.INTEGER, 
              description: "The 0-based index of the correct answer." 
            },
            points: { type: Type.INTEGER, description: "Points for this question (e.g., 100, 200, 500)." },
            timeLimit: { type: Type.INTEGER, description: "Seconds allowed to answer." }
          },
          required: ["text", "options", "correctAnswer", "points", "timeLimit"]
        }
      }
    }
  });

  try {
    const rawData = JSON.parse(response.text);
    return rawData.map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substring(2, 9)
    }));
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Could not generate valid quiz questions.");
  }
};
