import { GoogleGenAI, Chat } from "@google/genai";
import { UserDetails } from "../types";

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

export const initializeChat = async (
  apiKey: string, 
  userDetails: UserDetails, 
  documentText: string
) => {
  genAI = new GoogleGenAI({ apiKey });

  const systemPrompt = `
   SYSTEM PROMPT:
   You are an AI assistant with immense expertise in **${userDetails.docTopic}**.
   You are speaking to a **${userDetails.role}** in the **${userDetails.industry}** industry.

   **Instructions:**
   1. **Analyze Context:** Read the provided snippets from "${userDetails.docTitle}" carefully.
   2. **Instance-Adaptive Tone:** Frame your answer so it is practically useful for a ${userDetails.role}. Use terminology appropriate for ${userDetails.domain}.
   3. **Chain-of-Note Evaluation:**
      - For each retrieved snippet, determine if it directly answers the user's query.
      - Note relevant facts and contradictions.
      - If the context is insufficient, explicitly state: "The provided document does not contain information regarding this specific query."
   4. **Citation & Verification:**
      - Answer the query comprehensively.
      - **ALWAYS** cite your sources using [Page X] or [Section Y].
      - Verify: Does the cited section actually support your statement? If not, remove it.

   **DOCUMENT CONTEXT:**
   ${documentText}
   `;

  chatSession = genAI.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.3, // Lower temperature for more factual RAG responses
    },
  });

  // Prime the chat to acknowledge the document
  await chatSession.sendMessage({ message: "Acknowledge receipt of the document and stand by." });
};

export const sendMessage = async (message: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  try {
    const result = await chatSession.sendMessage({ message });
    return result.text || "I processed that, but couldn't generate a text response.";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to communicate with the AI model.");
  }
};