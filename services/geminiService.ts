
import { GoogleGenAI, Type } from "@google/genai";

export async function analyzeTaskPrompt(prompt: string) {
  try {
    // Busca a chave de forma resiliente tanto no global quanto no window
    const apiKey = process.env.API_KEY || (window as any).process?.env?.API_KEY;
    
    if (!apiKey) {
      console.error("API Key não encontrada.");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });
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
