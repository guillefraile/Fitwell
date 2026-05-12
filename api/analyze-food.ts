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

// Esta función se ejecuta cada vez que alguien llama a la ruta /api/analyze-food
export default async function handler(req: VercelRequest, res: VercelResponse) {
  /**
   * GET:
   * Para comprobar si la API está en funcionamiento.
   * Hace que devuelva un JSON sencillo, con cierta información para el que la vaya a utilizar
   * (en este caso se le comenta que si quiere usar esta funcionalidad, debe acudir a "/nutrition")
   */
  if (req.method === "GET") {
    return res.status(200).json({
      status: "online",
      message: "🍴 ¡El analizador de alimentos está listo para usarse!",
      instructions:
        "Para poder analizar tus platos, dirígete a la sección de nutrición.",
      link: "/nutrition",
    });
  }

  /**
   * Solo permitimos peticiones POST
   */
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  // Obtenemos la imagen en base64 y su tipo (jpeg, png, etc.)
  const { imageBase64, mimeType } = req.body;

  // Si no hay imagen, cortamos la ejecución para ahorrar llamadas innecesarias a la IA.
  if (!imageBase64) {
    return res.status(400).json({ error: "No se recibió imagen" });
  }

  /**
   * Definimos instrucciones muy estrictas para que la IA actúe como un analizador nutricional.
   * Le obligamos a devolver UNICAMENTE un JSON para que el sistema pueda procesarlo automáticamente.
   */
  const prompt = `
    Analiza esta imagen de comida y responde ÚNICAMENTE con un objeto JSON válido.
    Sin texto adicional, sin bloques markdown, solo el JSON.

    Estructura exacta:
    {
      "nombre": "nombre del plato o alimento identificado",
      "calorias": número entero estimado,
      "proteinas": número decimal con un decimal,
      "carbohidratos": número decimal con un decimal,
      "grasas": número decimal con un decimal
    }

    Si no puedes identificar comida en la imagen responde:
    { "error": "No se detectó comida en la imagen" }
  `;

  try {
    /**
     * Enviamos a Gemini tanto el texto (instrucciones) como los datos binarios de la imagen.
     */
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: imageBase64, // La imagen viaja como un string en formato base64
        },
      },
    ]);

    const text = result.response.text();

    /**
     * A veces los modelos de IA envuelven el JSON en bloques de código markdown.
     * Estas líneas eliminan esos envoltorios para dejar el string limpio y que JSON.parse no falle.
     */
    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Transformamos el texto limpio en un objeto real de TypeScript.
    const parsed = JSON.parse(clean);

    // Devolvemos los datos nutricionales al frontend con éxito.
    return res.status(200).json(parsed);
  } catch (error) {
    // Si hay un fallo en la API de Google o en el parseo del JSON, capturamos el error.
    console.error("Error Gemini:", error);
    return res.status(500).json({ error: "Error al analizar la imagen" });
  }
}
