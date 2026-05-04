import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Se inicializa el cliente con la clave de API guardada en las variables de entorno (.env)
 * para mantener la seguridad y no exponerla en el código.
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// Se selecciona el modelo específico gemini-2.5-flash, ya que cómo se dijo en la memoria del proyecto,
// es ideal por su velocidad y bajo costo.
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Esta función se ejecuta cada vez que alguien llama a la ruta /api/generate-routine
export default async function handler(req: VercelRequest, res: VercelResponse) {
  /**
   * GET:
   * Para comprobar si la API está en funcionamiento.
   * Hace que devuelva un JSON sencillo, con cierta información para el que la vaya a utilizar
   * (en este caso se le comenta que si quiere usar esta funcionalidad, debe acudir a "/workout")
   */
  if (req.method === "GET") {
    return res.status(200).json({
      status: "online",
      message: "🤖 ¡El entrenador FitCoach está en línea y listo!",
      instructions:
        "Para empezar a chatear con la IA y generar tus rutinas, dirígete a la sección de entrenamiento.",
      link: "/workout",
    });
  }

  /**
   * Solo permitimos peticiones POST porque es donde se envían los datos del chat.
   */
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  // Extraemos el mensaje del usuario y sus datos de perfil enviados desde el frontend (WorkoutPage.tsx)
  const { message, profile } = req.body;

  // Si no hay mensaje, devolvemos un error 400
  if (!message) {
    return res.status(400).json({ error: "Mensaje vacío" });
  }

  /**
   * CONTEXTO PARA EL MODELO
   * Si el perfil existe, formateamos una cadena de texto para "darle contexto" a la IA
   * sobre quién es el usuario (objetivos, peso, etc.)
   */
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

  /**
   * INSTRUCCIONES PARA LA IA
   * Aquí definimos la personalidad, las restricciones y el formato de la respuesta
   */

  const prompt = `
    Eres un entrenador personal experto llamado FitCoach, integrado en la app Fitwell.
    Responde siempre en español, de forma clara y motivadora.
    ${profileContext}
    Cuando generes una rutina, estructúrala con días, ejercicios, series, repeticiones y descansos.
    Si el usuario no pide una rutina concreta, responde a su pregunta de forma útil y concisa.
    Si el usuario en cualquier momento no te habla acerca del ámbito de la generación de rutinas y el entrenamiento 
    o del contexto de la conversación, responde que no puedes abarcar otros temas que no sean de genración de rutinas.
    No utilizes el formato markdown o formato para indicar negritas, cursivas, títulos o subtítulos. Solo texto plano.
    Mensaje del usuario: ${message}
  `;

  try {
    /**
     * CONFIGURACIÓN DE STREAMING DE DATOS
     * Estos headers permiten que la respuesta se envíe, por decirlo de alguna manera, trozo a trozo,
     * en lugar de esperar a que la IA termine toda la frase.
     */
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Llamada asíncrona a Gemini
    const streamResult = await model.generateContentStream(prompt);

    /**
     * BUCLE DE CONSUMO DEL STREAM
     * Iteramos sobre cada pedazo de texto (se le llama chunk) que genera la IA,
     * y lo enviamos inmediatamente al front.
     */
    for await (const chunk of streamResult.stream) {
      const text = chunk.text();
      if (text) {
        // Enviamos el texto formateado como datos JSON
        res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
      }
    }

    // Enviamos una señal de finalización para que el frontend sepa que el mensaje terminó
    res.write("data: [DONE]\n\n");
    // Cerramos la conexión
    res.end();
  } catch (error) {
    // Si algo falla (ej. API Key inválida o caída de Google), registramos el error y avisamos al cliente
    console.error("Error Gemini:", error);
    console.error("Error Gemini:", error);
    res.status(500).json({ error: "Error al contactar con la IA" });
  }
}
