import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";

// Tipado para los distintos niveles de actividad física (para indicar que solo se podrá usar una de las opciones de dentro)
type ActivityKey =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

// Multiplicadores según la fórmula de Harris-Benedict revisada para calcular el TDEE
// Se usa Record <Clave, Valor>, para indicar que la Clave será el ActivityKey y el valor el Number
const ACTIVITY_MULTIPLIERS: Record<ActivityKey, number> = {
  sedentary: 1.2, // Poco o nada de ejercicio
  light: 1.375, // 1-3 días/semana
  moderate: 1.55, // 3-5 días/semana
  active: 1.725, // 6-7 días/semana
  very_active: 1.9, // Entrenamiento intenso diario o trabajo físico bastante intenso
};

/**
 * Calcula la Tasa Metabólica Basal (TMB) usando la fórmula de Harris-Benedict
 * @returns Calorías que el cuerpo quema en reposo total
 */
function calcTMB(
  weight: number,
  height: number,
  age: number,
  gender: string,
): number {
  if (gender === "female") {
    return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }
  // Valor por defecto/masculino
  return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
}

/**
 * Calcula la edad exacta basándose en una cadena de fecha (YYYY-MM-DD)
 */
function calcAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  // Ajuste si aún no ha cumplido años en el mes actual
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/**
 * Calcula las horas óptimas de despertar basadas en ciclos de 90 minutos
 * Recibe la hora de acostarse y los ciclos de sueño deseados
 */
function calcSleepCycles(bedtime: string, cycles: number): string[] {
  if (!bedtime) {
    return []; // Si no hay hora, devuelve array vacío
  }
  const [h, m] = bedtime.split(":").map(Number); // Separa "23:00" en horas (23) y minutos (0), y los pasamos a números
  const base = new Date();
  base.setHours(h, m, 0, 0); // Crea una fecha de hoy a la hora que el usuario dice que se acuesta

  // La ciencia sugiere que tardamos una media de 14 min en dormirnos
  base.setMinutes(base.getMinutes() + 14);

  // Generamos una lista de tiempos de despertar (uno por cada ciclo)
  return Array.from({ length: cycles }, (_, i) => {
    //Esto crea un array vacío, con X posiciones (donde X es e número de ciclos)
    //El "_" es para ignorar el valor actual (ya que está vacío), y la i es el índice, donde empieza
    const wake = new Date(base.getTime() + (i + 1) * 90 * 60 * 1000); // Hora base + (Número de ciclo * 90 minutos)
    return wake.toLocaleTimeString("es-ES", {
      // Formateamos la fecha a un string legible en español (HH:mm)
      hour: "2-digit",
      minute: "2-digit",
    });
  });
}

export default function HealthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- ESTADOS: CALCULADORA TMB ---
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [activity, setActivity] = useState<ActivityKey>("moderate");
  const [tmb, setTmb] = useState<number | null>(null); // Resultado TMB
  const [tdee, setTdee] = useState<number | null>(null); // Resultado Gasto Total

  // --- ESTADOS: CALCULADORA DE SUEÑO ---
  const [bedtime, setBedtime] = useState("23:00");
  const [cycles, setCycles] = useState(5);
  const [wakeOptions, setWakeOptions] = useState<string[]>([]);

  /**
   * Esto recupera los datos del perfil de Supabase del usuario
   * Si el usuario ya rellenó su perfil, cargamos sus datos automáticamente
   * para que no tenga que escribirlos de nuevo en la calculadora, aunque puede escribir
   * otros datos, si así lo desea.
   */
  useEffect(() => {
    const load = async () => {
      if (!user) {
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("weight_initial, height, birth_date, gender, activity_level")
        .eq("id", user.id)
        .single();

      if (!data) {
        return;
      }

      // Actualizamos los estados con los datos de la DB (si existen)
      if (data.weight_initial) {
        setWeight(data.weight_initial.toString());
      }
      if (data.height) {
        setHeight(data.height.toString());
      }
      if (data.birth_date) {
        setAge(calcAge(data.birth_date).toString());
      }
      if (data.gender) {
        setGender(data.gender);
      }
      if (data.activity_level && data.activity_level in ACTIVITY_MULTIPLIERS) {
        setActivity(data.activity_level as ActivityKey);
      }
    };
    load();
  }, [user]);

  /**
   * Ejecutar cálculo de metabolismo
   */
  const handleCalcTMB = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);

    // Validación básica de números positivos
    if (!w || !h || !a || w <= 0 || h <= 0 || a <= 0) return;

    const base = calcTMB(w, h, a, gender);
    setTmb(Math.round(base));
    setTdee(Math.round(base * ACTIVITY_MULTIPLIERS[activity]));
  };

  /**
   * ACCIÓN: Ejecutar cálculo de ciclos de sueño
   */
  const handleCalcSleep = () => {
    setWakeOptions(calcSleepCycles(bedtime, cycles));
  };

  // --- CLASES DE ESTILO (Tailwind Reutilizable) ---
  const inputClass = `
        w-full bg-input-fw border border-white/10 text-white
        px-4 py-3.5 text-sm font-barlow-body outline-none
        focus:border-lime-fw transition-colors duration-200
        placeholder:text-white/40
    `;
  const labelClass = `
        block font-barlow font-bold text-[11px] tracking-[0.2em]
        uppercase text-white/40 mb-2
    `;
  const selectClass = `
        w-full bg-input-fw border border-white/10 text-white
        px-4 py-3.5 text-sm font-barlow-body outline-none
        focus:border-lime-fw transition-colors duration-200
        appearance-none cursor-pointer
    `;

  return (
    <div className="min-h-screen bg-dark-fw font-barlow">
      {/* NAVBAR: Navegación superior con botón de retorno */}
      <nav className="bg-black-fw border-b border-white/5 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="Fitwell" className="w-8 h-8" />
          <span className="text-lime-fw font-barlow font-extrabold text-lg tracking-widest uppercase">
            FITWELL
          </span>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-white/60 hover:text-white font-barlow font-bold text-[12px] tracking-[0.15em] uppercase transition-colors"
        >
          ← VOLVER
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* TÍTULOS DE SECCIÓN */}
        <div className="mb-10">
          <p className="text-lime-fw font-barlow font-bold text-[11px] tracking-[0.25em] uppercase mb-2">
            MÓDULO DE SALUD
          </p>
          <h1 className="text-white font-barlow font-extrabold text-4xl uppercase tracking-tight leading-none">
            CALCULADORAS
          </h1>
        </div>

        {/* ── SECCIÓN 1: CALCULADORA TMB ── */}
        <div className="mb-10">
          <h2 className="text-white/40 font-barlow font-bold text-[14px] tracking-[0.25em] uppercase mb-4">
            TASA METABÓLICA BASAL
          </h2>

          <div className="bg-black-fw border border-white/5 p-6 flex flex-col gap-4">
            {/* Inputs de Peso y Altura */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>PESO (kg)</label>
                <input
                  className={inputClass}
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                  min="0"
                />
              </div>
              <div>
                <label className={labelClass}>ALTURA (cm)</label>
                <input
                  className={inputClass}
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="175"
                  min="0"
                />
              </div>
            </div>

            {/* Inputs de Edad y Género */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>EDAD (años)</label>
                <input
                  className={inputClass}
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  min="0"
                />
              </div>
              <div>
                <label className={labelClass}>GÉNERO</label>
                <select
                  className={selectClass}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                </select>
              </div>
            </div>

            {/* Selector de Nivel de Actividad */}
            <div>
              <label className={labelClass}>NIVEL DE ACTIVIDAD</label>
              <select
                className={selectClass}
                value={activity}
                onChange={(e) => setActivity(e.target.value as ActivityKey)}
              >
                <option value="sedentary">Sedentario</option>
                <option value="light">Ligero</option>
                <option value="moderate">Moderado</option>
                <option value="active">Activo</option>
                <option value="very_active">Muy activo</option>
              </select>
            </div>

            <button
              onClick={handleCalcTMB}
              className="w-full bg-lime-fw text-black-fw font-barlow font-extrabold text-[14px] tracking-[0.15em] uppercase py-4 hover:bg-lime-fw/85 active:scale-[0.99] transition-all duration-200"
            >
              CALCULAR →
            </button>

            {/* VISUALIZACIÓN DE RESULTADOS TMB/TDEE */}
            {tmb !== null && tdee !== null && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-dark-fw border border-white/5 p-4 text-center">
                  <p className="text-white/40 font-barlow text-[10px] tracking-[0.2em] uppercase mb-2">
                    TMB — CALORÍAS EN REPOSO
                  </p>
                  <p className="text-lime-fw font-barlow font-extrabold text-3xl">
                    {tmb}
                  </p>
                  <p className="text-white/40 font-barlow text-[10px] tracking-widest uppercase mt-1">
                    kcal/día
                  </p>
                </div>
                <div className="bg-dark-fw border border-white/5 p-4 text-center">
                  <p className="text-white/40 font-barlow text-[10px] tracking-[0.2em] uppercase mb-2">
                    TDEE — GASTO TOTAL DIARIO
                  </p>
                  <p className="text-lime-fw font-barlow font-extrabold text-3xl">
                    {tdee}
                  </p>
                  <p className="text-white/40 font-barlow text-[10px] tracking-widest uppercase mt-1">
                    kcal/día
                  </p>
                </div>
              </div>
            )}
          </div>

          <p className="text-white/40 font-barlow-body text-xs mt-3 leading-relaxed">
            Fórmula Harris-Benedict revisada. El TDEE incluye el factor de
            actividad seleccionado. Estos valores son orientativos, y usted
            debería consultar a un profesional de la salud para datos más
            concisos.
          </p>
        </div>

        {/* ── SECCIÓN 2: CALCULADORA DE SUEÑO ── */}
        <div>
          <h2 className="text-white/40 font-barlow font-bold text-[14px] tracking-[0.25em] uppercase mb-4">
            CICLOS DE SUEÑO
          </h2>

          <div className="bg-black-fw border border-white/5 p-6 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>ME ACUESTO A LAS</label>
                <input
                  className={inputClass}
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>NÚMERO DE CICLOS</label>
                <select
                  className={selectClass}
                  value={cycles}
                  onChange={(e) => setCycles(Number(e.target.value))}
                >
                  <option value={4}>4 ciclos — 6h de sueño</option>
                  <option value={5}>5 ciclos — 7.5h de sueño</option>
                  <option value={6}>6 ciclos — 9h de sueño</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCalcSleep}
              className="w-full bg-lime-fw text-black-fw font-barlow font-extrabold text-[14px] tracking-[0.15em] uppercase py-4 hover:bg-lime-fw/85 active:scale-[0.99] transition-all duration-200"
            >
              CALCULAR →
            </button>

            {/* VISUALIZACIÓN DE RESULTADOS DE SUEÑO (Horarios de despertar) */}
            {wakeOptions.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                <p className="text-white/40 font-barlow text-[10px] tracking-[0.2em] uppercase mb-1">
                  DESPIÉRTATE A LAS
                </p>
                {wakeOptions.map((time, i) => (
                  <div
                    key={time}
                    className={`
                        flex items-center justify-between px-4 py-3 border
                        ${
                          // Resaltamos el último ciclo (el objetivo seleccionado)
                          i === wakeOptions.length - 1
                            ? "bg-lime-fw/10 border-lime-fw/40"
                            : "bg-dark-fw border-white/5"
                        }
                        `}
                  >
                    <span className="text-white/40 font-barlow text-[11px] tracking-[0.15em] uppercase">
                      {i + 1} ciclo{i > 0 ? "s" : ""} — {(i + 1) * 1.5}h
                    </span>
                    <span
                      className={`font-barlow font-extrabold text-xl ${i === wakeOptions.length - 1 ? "text-lime-fw" : "text-white"}`}
                    >
                      {time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-white/40 font-barlow-body text-xs mt-3 leading-relaxed">
            Los ciclos de sueño son secuencias repetitivas de fases (ligero,
            profundo y REM) que duran aproximadamente 90 minutos cada uno. Un
            adulto debería de completar entre 4 a 6 ciclos por noche para un
            correcto descanso. El sueño profundo predomina al inicio de la
            noche, mientras que el REM aumenta hacia la madrugada.Cada ciclo
            dura 90 minutos. Se añaden 14 minutos de demora, ya que es
            aproximadamente lo que demora un adulto para conciliar el sueño. La
            opción resaltada corresponde al número de ciclos seleccionado (el
            más óptimo).
          </p>
        </div>
      </div>
    </div>
  );
}
