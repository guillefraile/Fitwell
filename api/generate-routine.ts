import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { message, profile } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Mensaje vacío" });
  }

  const profileContext = profile
    ? `
    Datos del usuario:
    - Nombre: ${profile.full_name || "No especificado"}
    - Género: ${profile.gender || "No especificado"}
    - Altura: ${profile.height ? profile.height + " cm" : "No especificada"}
    - Peso inicial: ${profile.weight_initial ? profile.weight_initial + " kg" : "No especificado"}
    - Nivel de actividad: ${profile.activity_level || "No especificado"}
    - Objetivo principal: ${profile.goal || "No especificado"}
  `
    : "";

  const prompt = `
    Eres un entrenador personal experto llamado FitCoach, integrado en la app Fitwell.
    Responde siempre en español, de forma clara y motivadora.
    ${profileContext}
    Cuando generes una rutina, estructúrala con días, ejercicios, series, repeticiones y descansos.
    Mensaje del usuario: ${message}
  `;

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const streamResult = await model.generateContentStream(prompt);

    for await (const chunk of streamResult.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Error Gemini:", error);
    res.status(500).json({ error: "Error al contactar con la IA" });
  }
}
