import { GoogleGenAI, Type } from "@google/genai";

export async function analyzeTaskPrompt(prompt: string) {
  try {
    // Inicialização direta conforme diretriz técnica
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise a seguinte tarefa e sugira uma prioridade (Baixa, Média, Alta) e um rótulo curto adequado em português. Tarefa: "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedPriority: { type: Type.STRING, description: "Baixa, Média ou Alta" },
            suggestedLabel: { type: Type.STRING, description: "Uma categoria curta" },
            estimatedMinutes: { type: Type.NUMBER, description: "Tempo estimado em minutos" }
          },
          required: ["suggestedPriority", "suggestedLabel"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro ao analisar tarefa com Gemini:", error);
    return null;
  }
}