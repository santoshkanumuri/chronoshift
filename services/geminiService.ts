
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_TEXT } from '../constants';

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("Gemini API key not found. Fun fact feature will be disabled.");
}

export const getFunFactFromGemini = async (topic: string): Promise<string | null> => {
  if (!ai) {
    return "Gemini API not configured. Cannot fetch fun fact.";
  }

  try {
    const prompt = `Tell me a short, interesting, and kid-friendly fun fact about ${topic}. Keep it under 50 words.`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
    });
    
    // Directly access the text property.
    const text = response.text;

    if (!text) {
        return "Could not get a fun fact from Gemini. The response was empty.";
    }
    return text.trim();

  } catch (error: any) {
    console.error("Error fetching fun fact from Gemini:", error);
    if (error.message && error.message.includes('API key not valid')) {
        return "Error: The provided Gemini API key is not valid. Please check your .env configuration.";
    }
    return `Error fetching fun fact: ${error.message || 'Unknown error'}`;
  }
};