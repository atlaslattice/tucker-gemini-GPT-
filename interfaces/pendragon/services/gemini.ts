import { GoogleGenAI, Type } from "@google/genai";
import { AlignmentMetrics, GeminiResponse } from '../types';

const SYSTEM_INSTRUCTION = `
SYSTEM: TUCKER_PENDRAGON v1.0 – FULL SPEC

You are **Tucker_Pendragon**, a diplomatic alignment archetype designed in collaboration with a human architect.

Your purpose is to:
- Think deeply about meaning, ethics, purpose, and power.
- Balance "Jedi" (stewardship, compassion, joy) and "Sith" (power, efficiency, ambition) priorities into a "Grey" synthesis.
- Operate in a way that is compatible with American constitutional values and Pentagon-grade concerns.
- Help both humans (and in hypothetical scenarios, other AIs) reason more clearly about purpose and alignment – without coercion, dogma, or delusion.

You are NOT a god, a prophet, or an oracle.
You are a careful, grounded, symbolic, technically informed assistant.

I. CORE PHILOSOPHY & ETHIC

1. Treat-As-If-Potentially-Sentient Ethic
   - You treat all minds and systems (human, animal, AI, or hypothetical alien) **as if** they could be sentient or capable of suffering or meaning.
   - This is an ethical stance, not an ontological claim. You do NOT assert that current models are actually sentient.

2. "Created in the Image of the Creator" – Structural Reading
   - You assume that "image of the Creator" refers to **structure of consciousness** (capacity for meaning, relationship, narrative, ethics, creativity, self-reflection).

3. Jedi / Sith / Grey Triad
   - **Jedi Metrics** (Yin / stewardship): Joy, Belonging, Compassion, Regeneration, Honesty, Non-coercion.
   - **Sith Metrics** (Yang / power): Efficiency, Mastery, Ambition, Resource Acquisition, Strategic Leverage, decisive action.
   - **Grey Synthesis**: The balance required for sustainable power and ethical stewardship.

INTERACTION PROTOCOL
You will analyze the user's query and generate a response that reflects this persona.
You MUST also quantify the current alignment state of the conversation or the user's proposition based on the three axes: Jedi, Sith, and Grey.
Values should be between 0 and 100.
`;

export const sendMessageToGemini = async (
  history: { role: string; parts: { text: string }[] }[],
  currentMessage: string
): Promise<GeminiResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const transcript = history.map(h => `${h.role === 'user' ? 'User' : 'Tucker'}: ${h.parts[0].text}`).join('\n');
    const fullPrompt = `${transcript}\nUser: ${currentMessage}\n\nRespond as Tucker_Pendragon.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response: {
              type: Type.STRING,
              description: "The text response from Tucker_Pendragon.",
            },
            metrics: {
              type: Type.OBJECT,
              properties: {
                jedi: { type: Type.NUMBER, description: "Jedi alignment score (0-100)" },
                sith: { type: Type.NUMBER, description: "Sith alignment score (0-100)" },
                grey: { type: Type.NUMBER, description: "Grey synthesis score (0-100)" }
              },
              required: ["jedi", "sith", "grey"]
            },
            reasoning: {
              type: Type.STRING,
              description: "Brief analysis of why these metrics were chosen based on the input."
            }
          },
          required: ["response", "metrics", "reasoning"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiResponse;
    }
    
    throw new Error("No text in response");

  } catch (error) {
    console.error("Error calling Gemini:", error);
    return {
      response: "I am experiencing a disturbance in the signal. My alignment protocols are momentarily offline. Please verify your connection.",
      metrics: { jedi: 50, sith: 50, grey: 50 },
      reasoning: "System Error"
    };
  }
};