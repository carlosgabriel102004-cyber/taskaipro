
import { GoogleGenAI, Type } from "@google/genai";

// Analyze task prompt using Gemini AI to suggest priority and label
export async function analyzeTaskPrompt(prompt: string) {
  try {
    // Fixed: Initialize GoogleGenAI with the required configuration and direct environment variable access
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise a seguinte tarefa e sugira uma prioridade (Baixa, Média, Alta) e um rótulo adequado. Tarefa: "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedPriority: { type: Type.STRING, description: "Baixa, Média ou Alta" },
            suggestedLabel: { type: Type.STRING, description: "Uma categoria curta como Trabalho, Casa, Saúde, etc." },
            estimatedMinutes: { type: Type.NUMBER, description: "Tempo estimado em minutos" }
          },
          required: ["suggestedPriority", "suggestedLabel"]
        }
      }
    });

    // Fixed: Access the text property directly without calling it as a method
    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error("Erro ao analisar tarefa com Gemini:", error);
    return null;
  }
}
