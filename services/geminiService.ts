
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GKK_INFO } from '../constants';

let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.API_KEY;
  if (apiKey && apiKey !== 'undefined') {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (error) {
  console.warn("Failed to initialize GoogleGenAI:", error);
}

// Store the chat session instance
let chatSession: Chat | null = null;

export const getGKKChatResponse = async (userMessage: string): Promise<string> => {
  try {
    /* Fixed: Accessing process.env.API_KEY directly for verification */
    if (!process.env.API_KEY) {
      return "I'm sorry, the AI service is currently unavailable (Missing API Key).";
    }

    if (!chatSession) {
      chatSession = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `You are the official AI Assistant for the 14th Gawad Kaligtasan at Kalusugan (GKK) Awards. 
          Your tone should be professional, encouraging, and formal, yet accessible—reflecting the prestige of a national award.
          
          Use the following context to answer questions:
          ${GKK_INFO}
          
          If you don't know the specific answer (e.g., exact deadlines not listed), suggest contacting the OSHC directly or checking the official website.
          Do not make up specific dates if they aren't provided in the context.
          
          Keep answers concise (under 3 paragraphs) unless asked for details.`,
        },
      });
    }

    const result: GenerateContentResponse = await chatSession.sendMessage({ message: userMessage });
    /* Accessing .text property directly (not a method) as per extraction guidelines */
    return result.text || "I apologize, I couldn't generate a response at this time.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the GKK information server right now. Please try again later.";
  }
};
