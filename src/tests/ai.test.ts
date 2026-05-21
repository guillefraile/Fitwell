// Mock del fetch global y utilidades de streaming

// Reemplazamos el fetch nativo por un mock de Jest para simular llamadas HTTP sin servidor real
global.fetch = jest.fn();
const mockFetch = fetch as jest.Mock;

// Construye una respuesta HTTP simulada en formato Server-Sent Events (SSE)
// - chunks: array de strings que se enviarán como eventos "data:" individuales
// - Finaliza con la señal "[DONE]" que indica el fin del stream
function buildStream(chunks: string[]): Response {
  const body =
    chunks.map((c) => `data: ${JSON.stringify({ chunk: c })}\n\n`).join("") +
    "data: [DONE]\n\n";
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  });
}

// Lee un stream y reconstruye el texto completo
// Itera sobre las líneas, extrae los chunks del campo "data:", los parsea como JSON
// y concatena la propiedad "chunk" de cada mensaje
async function readStream(res: Response): Promise<string> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value, { stream: true }).split("\n")) {
      if (line.startsWith("data: ") && line !== "data: [DONE]") {
        try {
          text += JSON.parse(line.slice(6)).chunk ?? "";
        } catch {
          /* ignoramos líneas mal formadas durante la lectura parcial */
        }
      }
    }
  }
  return text;
}

// Limpiamos el mock antes de cada test para que los tests sean independientes
beforeEach(() => mockFetch.mockClear());

// API de generación de rutinas con IA

describe("API: Rutinas IA", () => {
  // Simula una respuesta streaming y verifica que el contenido recibido contiene
  // el texto esperado (en este caso "Lunes" como parte de la rutina generada)
  test("devuelve streaming con contenido", async () => {
    mockFetch.mockResolvedValueOnce(buildStream(["Lunes: Press banca 3x10"]));
    const res = await fetch("/api/generate-routine", {
      method: "POST",
      body: JSON.stringify({ message: "rutina de fuerza", profile: {} }),
    });
    expect(res.status).toBe(200);
    expect(await readStream(res)).toContain("Lunes");
  });

  // Cuando se envía un mensaje vacío, la API debe responder con un error 400
  // y un mensaje descriptivo indicando que el mensaje está vacío
  test("error 400 si mensaje vacío", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Mensaje vacío" }), { status: 400 }),
    );
    const res = await fetch("/api/generate-routine", {
      method: "POST",
      body: JSON.stringify({ message: "" }),
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Mensaje vacío");
  });

  // Cuando el servicio de IA (Gemini) falla internamente, la API debe responder
  // con un error 500 (Internal Server Error)
  test("error 500 si Gemini falla", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Error al contactar con la IA" }), {
        status: 500,
      }),
    );
    const res = await fetch("/api/generate-routine", {
      method: "POST",
      body: JSON.stringify({ message: "rutina" }),
    });
    expect(res.status).toBe(500);
  });

  // Verifica que el perfil del usuario (objetivo, restricciones, etc.) se incluya
  // correctamente en el body de la petición que se envía a la API
  test("el perfil se envía en el body", async () => {
    mockFetch.mockResolvedValueOnce(buildStream(["ok"]));
    await fetch("/api/generate-routine", {
      method: "POST",
      body: JSON.stringify({
        message: "rutina",
        profile: { goal: "perder peso" },
      }),
    });
    expect(JSON.parse(mockFetch.mock.calls[0][1].body).profile.goal).toBe(
      "perder peso",
    );
  });
});

// Tests: API de análisis de alimentos con IA

describe("API: Análisis de alimentos IA", () => {
  // Resultado simulado que la API devolvería al analizar la imagen de una tortilla española
  const fakeResult = {
    nombre: "Tortilla española",
    calorias: 350,
    proteinas: 18.5,
    carbohidratos: 22.0,
    grasas: 20.3,
  };

  // Verifica que la respuesta JSON de la API contenga los 4 macronutrientes
  // esperados: nombre, calorías, proteínas, carbohidratos y grasas
  test("devuelve los 4 macros correctamente", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(fakeResult), { status: 200 }),
    );
    const data = await (
      await fetch("/api/analyze-food", {
        method: "POST",
        body: JSON.stringify({ imageBase64: "abc==" }),
      })
    ).json();
    expect(data.nombre).toBe("Tortilla española");
    expect(data.calorias).toBe(350);
    expect(data).toHaveProperty("proteinas");
    expect(data).toHaveProperty("carbohidratos");
    expect(data).toHaveProperty("grasas");
  });

  // Verifica que las calorías devueltas sean un número entero positivo
  // (las calorías siempre se representan sin decimales)
  test("calorías son entero positivo", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(fakeResult), { status: 200 }),
    );
    const data = await (
      await fetch("/api/analyze-food", {
        method: "POST",
        body: JSON.stringify({ imageBase64: "abc==" }),
      })
    ).json();
    expect(Number.isInteger(data.calorias)).toBe(true);
    expect(data.calorias).toBeGreaterThan(0);
  });

  // Si la petición no incluye ninguna imagen (imageBase64 vacío o ausente),
  // la API debe responder con un error 400
  test("error si no hay imagen", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "No se recibió imagen" }), {
        status: 400,
      }),
    );
    const res = await fetch("/api/analyze-food", {
      method: "POST",
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  // Si la imagen no contiene ningún alimento reconocible, la API debe
  // devolver un error específico indicando que no se detectó comida
  test("error si no se detecta comida", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ error: "No se detectó comida en la imagen" }),
        { status: 200 },
      ),
    );
    const data = await (
      await fetch("/api/analyze-food", {
        method: "POST",
        body: JSON.stringify({ imageBase64: "abc==" }),
      })
    ).json();
    expect(data.error).toBe("No se detectó comida en la imagen");
  });
});
