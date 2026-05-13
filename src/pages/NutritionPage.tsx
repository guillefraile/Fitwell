import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";

// NutritionResult: Lo que esperamos recibir de nuestra API.
interface NutritionResult {
  nombre: string;
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
}

// Estructura de la tabla 'nutrition_logs' en Supabase.
interface NutritionRecord {
  id: string;
  food_name: string;
  image_url: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  created_at: string;
}

export default function NutritionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // fileRef nos permite disparar el selector de archivos nativo de Windows/móvil
  // mediante un clic en un botón personalizado (el cuadro con el icono de cámara).
  const fileRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null); // URL local para previsualizar la foto
  const [imageBase64, setImageBase64] = useState<string | null>(null); // La imagen convertida a texto para la IA
  const [mimeType, setMimeType] = useState("image/jpeg"); // Tipo de imagen (jpg, png...)
  const [result, setResult] = useState<NutritionResult | null>(null); // Datos devueltos por la IA
  const [loading, setLoading] = useState(false); // Estado de carga (spinner/animación)
  const [error, setError] = useState<string | null>(null); // Errores de análisis o conexión
  const [history, setHistory] = useState<NutritionRecord[]>([]); // Historial de comidas del usuario
  const [selectedRecord, setSelectedRecord] = useState<NutritionRecord | null>(
    null,
  ); // Registro seleccionado en el sidebar lateral

  /**
   * Obtiene los últimos registros de nutrición de Supabase.
   * Se ejecuta cuando el componente se monta y el usuario existe.
   */
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("nutrition_logs")
        .select(
          "id, food_name, image_url, calories, protein, carbs, fats, created_at",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setHistory(data);
    };
    load();
  }, [user]);

  /**
   * Convierte la imagen seleccionada por el usuario en dos formatos:
   * 1. URL de objeto (blob) para mostrarla en el navegador instantáneamente.
   * 2. String Base64 para poder enviarla en el cuerpo del JSON a la API.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResult(null); // Limpiamos resultados anteriores
    setError(null);
    setMimeType(file.type);

    // Creamos una URL temporal para la etiqueta <img> de previsualización
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Lector de archivos para convertir a Base64
    const reader = new FileReader();
    reader.onload = () => {
      // Extraemos solo la parte de datos del string Base64 (quitando el prefijo "data:image/...")
      const base64 = (reader.result as string).split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Se comunica con nuestro backend (Vercel API) que a su vez llama a Gemini.
   */
  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Llamada a la Serverless Function
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mimeType }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setResult(data); // Mostramos los macros en pantalla

      // PERSISTENCIA: Si la IA identifica comida, la guardamos en el perfil del usuario.
      if (user) {
        const { data: saved } = await supabase
          .from("nutrition_logs")
          .insert({
            user_id: user.id,
            food_name: data.nombre,
            image_url: null, // He decido no mostrar la imagen en el historial, pero como en supabase está esa columna, la rellenamos con un "null"
            calories: data.calorias,
            protein: data.proteinas,
            carbs: data.carbohidratos,
            fats: data.grasas,
          })
          .select(
            "id, food_name, image_url, calories, protein, carbs, fats, created_at",
          )
          .single();

        // Actualizamos el historial del lateral sin necesidad de recargar la página
        if (saved) setHistory((prev) => [saved, ...prev]);
      }
    } catch {
      setError("Error al analizar la imagen. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpia el estado para permitir un nuevo análisis.
   */
  const handleReset = () => {
    setPreview(null);
    setImageBase64(null);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // Formateador de fechas para que el historial sea legible (ej: 12 may 2026)
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  /**
   * Pequeña abstracción para no repetir el código HTML de las tarjetas de calorías y macronutrientes
   * (por no escribir todo el rato lo mismo).
   */
  const MacroBar = ({
    label,
    value,
    unit,
    color,
  }: {
    label: string;
    value: number;
    unit: string;
    color: string;
  }) => (
    <div className="bg-dark-fw border border-white/5 p-4 text-center">
      <p className={`font-barlow font-extrabold text-2xl ${color}`}>
        {value}
        <span className="text-sm ml-1">{unit}</span>
      </p>
      <p className="text-white/30 font-barlow text-[10px] tracking-[0.2em] uppercase mt-1">
        {label}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-fw font-barlow flex flex-col">
      {/* NAVBAR: Navegación simple */}
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

      <div className="flex flex-1 overflow-hidden">
        {/* ── COLUMNA IZQUIERDA: ANALIZADOR IA ── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
          <div className="px-6 py-5 border-b border-white/5 shrink-0">
            <p className="text-lime-fw font-barlow font-bold text-[11px] tracking-[0.25em] uppercase mb-1">
              NUTRICIÓN
            </p>
            <h1 className="text-white font-barlow font-extrabold text-2xl uppercase tracking-tight leading-none">
              ANÁLISIS DE ALIMENTOS
            </h1>
          </div>

          <div className="px-6 py-8 flex flex-col gap-6 max-w-xl">
            {/* ZONA DE SUBIDA: Solo se muestra si no hay una imagen cargada */}
            {!preview ? (
              <button
                onClick={() => fileRef.current?.click()}
                className="
                  w-full border-2 border-dashed border-white/10 hover:border-lime-fw/40
                  bg-black-fw py-16 flex flex-col items-center gap-3
                  transition-colors duration-200 cursor-pointer group
                "
              >
                <span className="text-4xl">📷</span>
                <p className="text-white/40 group-hover:text-white/60 font-barlow font-bold text-[12px] tracking-[0.2em] uppercase transition-colors">
                  SUBIR FOTO DEL PLATO
                </p>
                <p className="text-white/20 font-barlow-body text-xs">
                  JPG, PNG o WEBP
                </p>
              </button>
            ) : (
              <div className="flex flex-col gap-4">
                {/* PREVISUALIZACIÓN DE IMAGEN CARGADA */}
                <div className="relative">
                  <img
                    src={preview}
                    alt="Plato a analizar"
                    className="w-full max-h-64 object-cover border border-white/10"
                  />
                  <button
                    onClick={handleReset}
                    className="absolute top-3 right-3 bg-black-fw border border-white/20 text-white/50 hover:text-white font-barlow font-bold text-[11px] tracking-widest uppercase px-3 py-1.5 transition-colors"
                  >
                    ✕ CAMBIAR
                  </button>
                </div>

                {/* BOTÓN DE ACCIÓN: Dispara la llamada a la IA */}
                {!result && (
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="
                      w-full bg-lime-fw text-black-fw
                      font-barlow font-extrabold text-[15px] tracking-[0.15em] uppercase
                      py-4 transition-all duration-200
                      hover:bg-lime-fw/85 active:scale-[0.99]
                      disabled:bg-lime-fw/20 disabled:text-white/20 disabled:cursor-not-allowed
                    "
                  >
                    {loading ? "ANALIZANDO..." : "ANALIZAR CON IA →"}
                  </button>
                )}
              </div>
            )}

            {/* MANEJO DE ERRORES VISUALES */}
            {error && (
              <div className="bg-lime-fw/5 border border-lime-fw/30 text-lime-fw text-[13px] font-barlow-body px-4 py-3 tracking-wide">
                {error}
              </div>
            )}

            {/* CARGANDO: Animación de puntos rebotando (CSS animate-bounce) */}
            {loading && (
              <div className="flex items-center gap-3">
                <span
                  className="w-1.5 h-1.5 bg-lime-fw rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-lime-fw rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 bg-lime-fw rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
                <span className="text-white/30 font-barlow text-[11px] tracking-[0.2em] uppercase">
                  IDENTIFICANDO ALIMENTOS...
                </span>
              </div>
            )}

            {/* MOSTRAR RESULTADOS: Aparece solo cuando la IA devuelve el JSON */}
            {result && (
              <div className="flex flex-col gap-4">
                <div className="bg-black-fw border border-lime-fw/20 px-5 py-4">
                  <p className="text-lime-fw font-barlow font-bold text-[10px] tracking-[0.25em] uppercase mb-1">
                    PLATO IDENTIFICADO
                  </p>
                  <p className="text-white font-barlow font-extrabold text-xl uppercase tracking-tight">
                    {result.nombre}
                  </p>
                </div>

                {/* GRID DE MACRONUTRIENTES */}
                <div className="grid grid-cols-2 gap-3">
                  <MacroBar
                    label="CALORÍAS"
                    value={result.calorias}
                    unit="kcal"
                    color="text-lime-fw"
                  />
                  <MacroBar
                    label="PROTEÍNAS"
                    value={result.proteinas}
                    unit="g"
                    color="text-white"
                  />
                  <MacroBar
                    label="CARBOHIDRATOS"
                    value={result.carbohidratos}
                    unit="g"
                    color="text-white"
                  />
                  <MacroBar
                    label="GRASAS"
                    value={result.grasas}
                    unit="g"
                    color="text-white"
                  />
                </div>

                <p className="text-white/20 font-barlow-body text-xs leading-relaxed">
                  Valores estimados por IA. Pueden variar según la preparación y
                  las porciones exactas.
                </p>

                <button
                  onClick={handleReset}
                  className="w-full border border-white/10 text-white/40 hover:border-lime-fw/40 hover:text-white/60 font-barlow font-bold text-[13px] tracking-[0.15em] uppercase py-4 transition-all duration-200"
                >
                  ← ANALIZAR OTRO PLATO
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── COLUMNA DERECHA: HISTORIAL DE COMIDAS ── */}
        <div className="hidden lg:flex flex-col w-72 shrink-0 border-l border-white/5 bg-black-fw">
          <div className="px-5 py-5 border-b border-white/5 shrink-0">
            <p className="text-white/40 font-barlow font-bold text-[11px] tracking-[0.25em] uppercase">
              REGISTROS GUARDADOS
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-white/20 font-barlow-body text-xs px-5 py-6 leading-relaxed">
                Los análisis aparecerán aquí automáticamente.
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
                        ? "bg-lime-fw/10 border-l-2 border-l-lime-fw"
                        : "hover:bg-white/3"
                    }
                  `}
                >
                  <p
                    className={`
                    font-barlow font-bold text-[12px] tracking-[0.05em] uppercase leading-snug mb-1 truncate
                    ${selectedRecord?.id === record.id ? "text-lime-fw" : "text-white/60"}
                  `}
                  >
                    {record.food_name}
                  </p>
                  <p className="text-white/25 font-barlow text-[10px] tracking-widest uppercase">
                    {formatDate(record.created_at)}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* VISTA PREVIA DETALLADA DE UN REGISTRO DEL HISTORIAL */}
          {selectedRecord && (
            <div className="border-t border-white/5 p-5 shrink-0">
              <p className="text-white/25 font-barlow text-[10px] tracking-[0.2em] uppercase mb-3">
                DETALLE
              </p>
              <p className="text-white font-barlow font-extrabold text-base uppercase mb-3">
                {selectedRecord.food_name}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "KCAL", value: selectedRecord.calories },
                  { label: "PROT", value: `${selectedRecord.protein}g` },
                  { label: "CARBS", value: `${selectedRecord.carbs}g` },
                  { label: "GRASAS", value: `${selectedRecord.fats}g` },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="bg-dark-fw border border-white/5 px-3 py-2 text-center"
                  >
                    <p className="text-lime-fw font-barlow font-extrabold text-sm">
                      {m.value}
                    </p>
                    <p className="text-white/25 font-barlow text-[9px] tracking-[0.15em] uppercase">
                      {m.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* INPUT FILE OCULTO: 
          Es la parte que abre los archivos para luego sub irlos
      */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
