import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

let client: GoogleGenAI | null = null;

const getClient = () => {
  if (!client) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing in environment variables.");
      // In a real app, we'd handle this more gracefully, but for now we assume it exists as per instructions.
      throw new Error("API_KEY is missing");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

export const streamResponse = async (
  history: { role: string; content: string }[],
  onChunk: (text: string) => void
) => {
  const ai = getClient();
  const model = "gemini-2.5-flash";

  // Convert history to Gemini format if needed, but simple generateContentStream with history context 
  // is often handled by ChatSession. Here we'll use a chat session for statefulness.
  
  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction: SYSTEM_PROMPT,
    },
    history: history.slice(0, -1).map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })),
  });

  const lastMessage = history[history.length - 1].content;

  try {
    const resultStream = await chat.sendMessageStream({ message: lastMessage });

    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        onChunk(c.text);
      }
    }
  } catch (error) {
    console.error("Error streaming response:", error);
    onChunk("\n[SYSTEM ERROR]: Neural link unstable. Connection severed.");
  }
};