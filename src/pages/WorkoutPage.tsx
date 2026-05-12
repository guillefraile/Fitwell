import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";

interface Message {
  role: "user" | "assistant"; // Solo permite estos dos valores para identificar quién habla
  content: string; // El contenido del mensaje
}

interface WorkoutRecord {
  id: string;
  title: string;
  created_at: string;
  routine_data: { content: string }; // Estructura JSON que devuelve Supabase para la rutina
}

interface Profile {
  full_name: string;
  gender: string;
  height: number;
  weight_initial: number;
  activity_level: string;
  goal: string;
}

export default function WorkoutPage() {
  // HOOKS DE NAVEGACIÓN Y AUTENTICACIÓN
  // user: Obtenemos el ID y sesión del usuario logueado.
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mensajes que se verán en pantalla - El estado inicial es el saludo del asistente.
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "¡Hola! 👋 Soy FitCoach 🤖 Dime qué tipo de rutina necesitas o hazme cualquier pregunta sobre entrenamiento. Usaré los datos de tu perfil para personalizar la respuesta .",
    },
  ]);
  const [input, setInput] = useState(""); // Input del chat
  const [loading, setLoading] = useState(false); // Bandera para deshabilitar botones mientras el chat está en funcionamiento (mientras la IA habla)
  const [profile, setProfile] = useState<Profile | null>(null); // Almacena los datos del prefil del usuario
  const [history, setHistory] = useState<WorkoutRecord[]>([]); // Lista de las últimas rutinas generadas, guardadas en la BBDD
  const [selectedRecord, setSelectedRecord] = useState<WorkoutRecord | null>(
    null,
  ); // Controla qué rutina del historial se muestra en la vista previa

  /**
   * Se ejecuta nada más mostrar el chat.
   * Consulta a Supabase los datos del usuario y su historial previo de rutinas.
   */
  useEffect(() => {
    if (!user) {
      return;
    } // Si no hay usuario, no hacemos nada
    const load = async () => {
      // Obtenemos datos del perfil para que la IA nos dé respuestas personalizadas
      const { data: profileData } = await supabase
        .from("profiles")
        .select(
          "full_name, gender, height, weight_initial, activity_level, goal",
        )
        .eq("id", user.id)
        .single();
      if (profileData) setProfile(profileData);

      // Cargamos las últimas 20 rutinas de la tabla WORKOUTS de la BBDD, ordenadas por fecha
      const { data: workoutData } = await supabase
        .from("workouts")
        .select("id, title, created_at, routine_data")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (workoutData) setHistory(workoutData);
    };
    load();
  }, [user]);

  /**
   * LÓGICA DE COMUNICACIÓN CON LA IA (Streaming)
   * Envía el mensaje al backend (a la serverless function) y procesa
   * la respuesta que llega, por decirlo, a "trozos" para mostrarla en tiempo real.
   */
  const handleSend = async () => {
    // No enviar si está vacío o si ya estamos esperando una respuesta
    if (!input.trim() || loading) {
      return;
    }

    const userMessage = input.trim();
    setInput(""); // Limpiamos el campo de texto
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]); // Pintamos el mensaje del usuario
    setLoading(true);

    let fullResponse = ""; // Acumulador para la respuesta completa de la IA

    // Creamos un mensaje vacío del asistente que iremos "rellenando" con el stream
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      // Petición POST a nuestra API de Vercel (Serverless Function)
      const response = await fetch("/api/generate-routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, profile }), // Pasamos el contexto del perfil
      });

      if (!response.ok) {
        throw new Error("Error en el servidor");
      }

      // PROCESAMIENTO DEL STREAM
      // Usamos el reader para leer los paquetes de datos conforme van llegando
      const reader = response.body!.getReader();
      const decoder = new TextDecoder(); // Decodificador para pasar, ya que llega en binario, a texto UTF-8

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break; // El stream ha terminado
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n"); // El protocolo SSE (Server-Sent Events) envía líneas que empiezan por "data: "

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.replace("data: ", "").trim();
            if (data === "[DONE]") {
              break;
            } // Palabra clave que definimos en el backend para cerrar

            try {
              const parsed = JSON.parse(data); // Parseamos el trozo de JSON
              if (parsed.chunk) {
                fullResponse += parsed.chunk; // Acumulamos el trozo de texto

                // Buscamos el último mensaje de la lista (el del asistente que creamos vacío)
                // y le actualizamos el contenido con lo acumulado hasta ahora.
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: fullResponse,
                  };
                  return updated;
                });
              }
            } catch {
              // Si el JSON llega incompleto (chunk parcial), ignoramos el error y esperamos al siguiente
            }
          }
        }
      }

      /**
       * Analizamos la respuesta de la IA. Si contiene palabras típicas de una rutina,
       * la guardamos automáticamente en la base de datos de Supabase, para evitar guardar chats que no tienen nada que ver.
       */
      const isRoutine =
        /rutina|día|lunes|martes|miércoles|series|repeticiones/i.test(
          fullResponse,
        );
      if (isRoutine && user) {
        // El título de la rutina será el mensaje del usuario (recortado)
        const title =
          userMessage.length > 50
            ? userMessage.substring(0, 50) + "..."
            : userMessage;

        const { data: saved } = await supabase
          .from("workouts")
          .insert({
            user_id: user.id,
            title,
            routine_data: { content: fullResponse }, // Guardamos como objeto JSON
          })
          .select("id, title, created_at, routine_data")
          .single();

        // Si se guardó correctamente, actualizamos el historial en el lateral
        if (saved) {
          setHistory((prev) => [saved, ...prev]);
        }
      }
    } catch {
      // Manejo de errores de conexión o servidor
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Lo siento, no pude conectar con la IA. Inténtalo de nuevo.",
        };
        return updated;
      });
    } finally {
      setLoading(false); // Reactivamos el input y botones
    }
  };

  /**
   * Permite enviar el mensaje al pulsar Enter, pero permite saltos de línea con Shift+Enter.
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-dark-fw font-barlow flex flex-col">
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <nav className="bg-black-fw border-b border-white/5 px-6 lg:px-12 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="Fitwell" className="w-8 h-8" />
          <span className="text-lime-fw font-barlow font-extrabold text-lg tracking-widest uppercase">
            FITWELL
          </span>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-white/30 hover:text-white font-barlow font-bold text-[12px] tracking-[0.15em] uppercase transition-colors"
        >
          ← VOLVER
        </button>
      </nav>

      {/* CUERPO PRINCIPAL (Split de Chat e Historial) */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── COLUMNA IZQUIERDA: ÁREA DE CHAT ── */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Cabecera del Chat */}
          <div className="px-6 py-5 border-b border-white/5 bg-dark-fw shrink-0">
            <p className="text-lime-fw font-barlow font-bold text-[11px] tracking-[0.25em] uppercase mb-1">
              ENTRENADOR VIRTUAL
            </p>
            <h1 className="text-white font-barlow font-extrabold text-2xl uppercase tracking-tight leading-none">
              FITCOACH IA
            </h1>
          </div>

          {/* LISTA DE MENSAJES (Se puede hacer scroll) */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                  max-w-[85%] px-4 py-3 text-sm font-barlow-body leading-relaxed whitespace-pre-wrap
                  ${
                    msg.role === "user"
                      ? "bg-lime-fw text-black-fw font-medium" // Estilo para el usuario
                      : "bg-black-fw border border-white/5 text-white/80" // Estilo para la IA
                  }
                `}
                >
                  {msg.content}
                  {/* EFECTO VISUAL: Cursor parpadeante que indica que la IA está escribiendo */}
                  {loading &&
                    i === messages.length - 1 &&
                    msg.role === "assistant" && (
                      <span className="inline-block w-1.5 h-3.5 bg-lime-fw ml-1 animate-pulse" />
                    )}
                </div>
              </div>
            ))}
          </div>

          {/* INPUT DEL CHAT (Textarea y Botón enviar) */}
          <div className="px-6 py-4 border-t border-white/5 bg-dark-fw shrink-0">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder="Pídeme una rutina o hazme una pregunta... (Enter para enviar)"
                rows={2}
                className="
                  flex-1 bg-black-fw border border-white/10 text-white
                  px-4 py-3 text-sm font-barlow-body outline-none resize-none
                  focus:border-lime-fw transition-colors duration-200
                  placeholder:text-white/20 disabled:opacity-40
                "
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="
                  px-5 bg-lime-fw text-black-fw font-barlow font-extrabold
                  text-[13px] tracking-widest uppercase shrink-0
                  hover:bg-lime-fw/85 transition-colors
                  disabled:bg-lime-fw/20 disabled:text-white/20 disabled:cursor-not-allowed
                "
              >
                {loading ? "..." : "→"}
              </button>
            </div>
            <p className="text-white/15 font-barlow text-[10px] tracking-widest uppercase mt-2">
              SHIFT + ENTER PARA SALTO DE LÍNEA
            </p>
          </div>
        </div>

        {/* ── COLUMNA DERECHA: SIDEBAR DE HISTORIAL (Oculto en móvil) ── */}
        <div className="hidden lg:flex flex-col w-72 shrink-0 border-l border-white/5 bg-black-fw">
          <div className="px-5 py-5 border-b border-white/5 shrink-0">
            <p className="text-white/40 font-barlow font-bold text-[11px] tracking-[0.25em] uppercase">
              RUTINAS GUARDADAS
            </p>
          </div>

          {/* LISTADO DE RUTINAS DEL HISTORIAL */}
          <div className="flex-1 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-white/20 font-barlow-body text-xs px-5 py-6 leading-relaxed">
                Las rutinas generadas aparecerán aquí automáticamente.
              </p>
            ) : (
              history.map((record) => (
                <button
                  key={record.id}
                  onClick={() =>
                    setSelectedRecord(
                      selectedRecord?.id === record.id ? null : record,
                    )
                  }
                  className={`
                    w-full text-left px-5 py-4 border-b border-white/5
                    transition-colors duration-150
                    ${
                      selectedRecord?.id === record.id
                        ? "bg-lime-fw/10 border-l-2 border-l-lime-fw" // Resaltado si está seleccionada
                        : "hover:bg-white/3"
                    }
                  `}
                >
                  <p
                    className={`
                    font-barlow font-bold text-[12px] tracking-[0.05em] uppercase leading-snug mb-1
                    ${selectedRecord?.id === record.id ? "text-lime-fw" : "text-white/60"}
                  `}
                  >
                    {record.title}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* VISTA PREVIA: Muestra el contenido de la rutina guardada seleccionada */}
          {selectedRecord && (
            <div className="border-t border-white/5 p-5 max-h-64 overflow-y-auto shrink-0">
              <p className="text-white/25 font-barlow text-[10px] tracking-[0.2em] uppercase mb-3">
                VISTA PREVIA
              </p>
              <p className="text-white/50 font-barlow-body text-xs leading-relaxed whitespace-pre-wrap">
                {selectedRecord.routine_data.content}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
