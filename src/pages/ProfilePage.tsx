import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";

/**
 * En esta interfaz se define la estructura de los datos del usuario.
 */
interface Profile {
  full_name: string;
  birth_date: string;
  gender: string;
  height: string;
  weight_initial: string;
  activity_level: string;
  goal: string;
}

/**
 * El perfil vacío por defecto, sobre todo al registrarte por primera vez
 */
const EMPTY_PROFILE: Profile = {
  full_name: "",
  birth_date: "",
  gender: "",
  height: "",
  weight_initial: "",
  activity_level: "",
  goal: "",
};

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ESTADOS DE GESTIÓN
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true); // Carga inicial desde DB
  const [saving, setSaving] = useState(false); // Estado de la petición de guardado
  const [success, setSuccess] = useState(false); // Feedback visual de éxito
  const [error, setError] = useState<string | null>(null);

  /**
   * EFECTO: Recuperación de datos
   * Al montar el componente, consultamos la tabla 'profiles' para pre-rellenar el formulario.
   */
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle(); // maybeSingle() devuelve null sin lanzar error si no existe la fila (si no, aparecen errores 406 todo el rato)

      if (data) {
        setProfile({
          full_name: data.full_name ?? "",
          birth_date: data.birth_date ?? "",
          gender: data.gender ?? "",
          height: data.height?.toString() ?? "",
          weight_initial: data.weight_initial?.toString() ?? "",
          activity_level: data.activity_level ?? "",
          goal: data.goal ?? "",
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  /**
   * LÓGICA: Guardado y Validación
   * Realiza un 'upsert' en Supabase (inserta si no existe, actualiza si existe).
   */
  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    const {
      full_name,
      birth_date,
      gender,
      height,
      weight_initial,
      activity_level,
      goal,
    } = profile;

    // Validaciones básicas de cliente (UX)
    if (
      !full_name.trim() ||
      !birth_date ||
      !gender ||
      !height ||
      !weight_initial ||
      !activity_level ||
      !goal
    ) {
      setError("Todos los campos son obligatorios para poder continuar");
      return;
    }

    // Validaciones numéricas adicionales
    if (Number(height) <= 0 || Number(weight_initial) <= 0) {
      setError("La altura y el peso deben ser valores positivos");
      return;
    }

    setSaving(true);

    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: user!.id, // Clave primaria vinculada a Auth
      full_name: profile.full_name.trim(),
      birth_date: profile.birth_date || null,
      gender: profile.gender || null,
      height: profile.height ? Number(profile.height) : null,
      weight_initial: profile.weight_initial
        ? Number(profile.weight_initial)
        : null,
      activity_level: profile.activity_level || null,
      goal: profile.goal || null,
    });

    if (upsertError) {
      setError("Error al guardar. Inténtalo de nuevo.");
    } else {
      setSuccess(true);
      // Redirigir 2 segundos
      setTimeout(() => navigate("/dashboard"), 1000);
    }
  };

  // Avatar dinámico basado en el nombre o email
  const initial =
    profile.full_name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "?";

  // CLASES TAILWIND REUTILIZABLES (Limpieza de código)
  const inputClass = `w-full bg-input-fw border border-white/10 text-white px-4 py-3.5 text-sm font-barlow-body outline-none focus:border-lime-fw transition-colors duration-200 placeholder:text-white/40`;
  const labelClass = `block font-barlow font-bold text-[11px] tracking-[0.2em] uppercase text-white/40 mb-2`;
  const selectClass = `${inputClass} appearance-none cursor-pointer`;

  // Render condicional mientras se obtienen los datos
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-fw flex items-center justify-center">
        <p className="text-white/40 font-barlow tracking-[0.2em] uppercase text-sm animate-pulse">
          CARGANDO...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-fw font-barlow">
      {/* NAVBAR */}
      <nav className="bg-black-fw border-b border-white/5 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="Fitwell" className="w-8 h-8" />
          <span className="text-lime-fw font-barlow font-extrabold text-lg tracking-widest uppercase">
            FITWELL
          </span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* HEADER DE PERFIL */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-16 h-16 bg-lime-fw text-black-fw font-barlow font-extrabold text-2xl flex items-center justify-center shrink-0">
            {initial}
          </div>
          <div>
            <p className="text-lime-fw font-barlow font-bold text-[11px] tracking-[0.25em] uppercase mb-1">
              MI CUENTA
            </p>
            <h1 className="text-white font-barlow font-extrabold text-3xl uppercase tracking-tight leading-none">
              {profile.full_name || "MI PERFIL"}
            </h1>
            <p className="text-white/40 font-barlow-body text-xs mt-1">
              {user?.email}
            </p>
          </div>
        </div>

        {/* MENSAJES DE FEEDBACK AL USUARIO */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-[13px] font-barlow-body px-4 py-3 mb-6 animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-lime-fw/10 border border-lime-fw/40 text-lime-fw text-[13px] font-barlow-body px-4 py-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            ✓ PERFIL GUARDADO CORRECTAMENTE
          </div>
        )}

        {/* FORMULARIO DIVIDIDO POR SECCIONES SEMÁNTICAS */}
        <div className="space-y-8">
          {/* SECCIÓN 1 — DATOS PERSONALES */}
          <section>
            <h2 className="text-white/40 font-barlow font-bold text-[11px] tracking-[0.25em] uppercase mb-4">
              DATOS PERSONALES
            </h2>
            <div className="bg-black-fw border border-white/5 p-6 flex flex-col gap-4">
              <div>
                <label className={labelClass}>NOMBRE COMPLETO</label>
                <input
                  className={inputClass}
                  type="text"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, full_name: e.target.value }))
                  }
                  placeholder="Tu nombre"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>FECHA DE NACIMIENTO</label>
                  <input
                    className={inputClass}
                    type="date"
                    value={profile.birth_date}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, birth_date: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>GÉNERO</label>
                  <select
                    className={selectClass}
                    value={profile.gender}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, gender: e.target.value }))
                    }
                  >
                    <option value="">— Seleccionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2 — MÉTRICAS FÍSICAS (Datos para cálculos de salud e IA) */}
          <section>
            <h2 className="text-white/40 font-barlow font-bold text-[11px] tracking-[0.25em] uppercase mb-4">
              MÉTRICAS FÍSICAS
            </h2>
            <div className="bg-black-fw border border-white/5 p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>ALTURA (cm)</label>
                  <input
                    className={inputClass}
                    type="number"
                    value={profile.height}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, height: e.target.value }))
                    }
                    placeholder="175"
                  />
                </div>
                <div>
                  <label className={labelClass}>PESO INICIAL (kg)</label>
                  <input
                    className={inputClass}
                    type="number"
                    value={profile.weight_initial}
                    onChange={(e) =>
                      setProfile((p) => ({
                        ...p,
                        weight_initial: e.target.value,
                      }))
                    }
                    placeholder="70"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>NIVEL DE ACTIVIDAD</label>
                <select
                  className={selectClass}
                  value={profile.activity_level}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      activity_level: e.target.value,
                    }))
                  }
                >
                  <option value="">— Seleccionar</option>
                  <option value="sedentary">
                    Sedentario (poco o ningún ejercicio)
                  </option>
                  <option value="light">Ligero (1–3 días/semana)</option>
                  <option value="moderate">Moderado (3–5 días/semana)</option>
                  <option value="active">Activo (6–7 días/semana)</option>
                  <option value="very_active">
                    Muy activo (ejercicio intenso diario)
                  </option>
                </select>
              </div>
              <div>
                <label className={labelClass}>OBJETIVO PRINCIPAL</label>
                <select
                  className={selectClass}
                  value={profile.goal}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, goal: e.target.value }))
                  }
                >
                  <option value="">— Seleccionar</option>
                  <option value="lose_weight">Perder peso</option>
                  <option value="gain_muscle">Ganar músculo</option>
                  <option value="maintain">Mantener peso</option>
                  <option value="improve_fitness">Mejorar forma física</option>
                  <option value="improve_health">Mejorar salud general</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* ACCIÓN PRINCIPAL */}
        <div className="mt-10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-lime-fw text-black-fw font-barlow font-extrabold text-[15px] tracking-[0.15em] uppercase py-4 transition-all duration-200 hover:bg-lime-fw/85 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {success
              ? "GUARDADO. VOLVIENDO A INICIO..."
              : saving
                ? "GUARDANDO PERFIL..."
                : "GUARDAR PERFIL Y VOLVER A INICIO →"}
          </button>
        </div>
      </div>
    </div>
  );
}
