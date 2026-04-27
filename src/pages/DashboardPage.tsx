import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";

/**
 * Definimos el acceso a las herramientas principales.
 * El flag 'accent' permite destacar visualmente el módulo estrella (Workout).
 */
const modules = [
  {
    id: "workout",
    icon: "⚡",
    title: "GENERACIÓN DE RUTINAS",
    description:
      "Entrenamientos personalizados adaptados a tus objetivos y nivel.",
    href: "/workout",
    accent: true,
  },
  {
    id: "nutrition",
    icon: "🥗",
    title: "ANÁLISIS DE ALIMENTOS CON IA",
    description:
      "Escanea y analiza tus comidas para un control nutricional inteligente.",
    href: "/nutrition",
    accent: false,
  },
  {
    id: "health",
    icon: "📊",
    title: "CALCULADORAS DE SUEÑO Y SALUD",
    description:
      "Herramientas precisas para monitorear tus constantes vitales y descanso.",
    href: "/health",
    accent: false,
  },
  {
    id: "mental",
    icon: "🧠",
    title: "SALUD MENTAL",
    description:
      "Recursos y seguimiento para mantener un equilibrio mental saludable.",
    href: "/mental",
    accent: false,
  },
];

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Estados para UI y lógica de salida
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);

  /**
   * Consultamos la tabla 'profiles' de Supabase para obtener el nombre real del usuario.
   */
  useEffect(() => {
    const fetchName = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (data?.full_name) setProfileName(data.full_name);
    };
    fetchName();
  }, [user]);

  /**
   * Cerrar Sesión:
   * Limpia el estado global de autenticación y redirige a la Landing.
   */
  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    navigate("/");
  };

  // Inicial para el Avatar
  const initial =
    profileName?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "?";

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

        {/* PROFILE DROPDOWN: Gestión del perfil */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 bg-lime-fw text-black-fw font-barlow font-extrabold text-sm flex items-center justify-center transition-opacity group-hover:opacity-80">
              {initial}
            </div>
            <span className="hidden lg:block text-white/40 font-barlow-body text-sm max-w-45 truncate group-hover:text-white/60 transition-colors">
              {user?.email}
            </span>
            <span
              className={`text-white/40 text-xs transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-56 bg-card-fw border border-white/10 z-50 shadow-2xl">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-white/40 font-barlow text-[10px] tracking-[0.2em] uppercase mb-0.5">
                  SESIÓN ACTIVA
                </p>
                <p className="text-white/60 font-barlow-body text-xs truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/profile");
                }}
                className="w-full text-left px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 font-barlow font-semibold text-[13px] tracking-widest uppercase transition-colors flex items-center gap-3"
              >
                <span>👤</span> MI PERFIL
              </button>
              <div className="h-px bg-white/5" />
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full text-left px-4 py-3 text-lime-fw/70 hover:text-lime-fw hover:bg-lime-fw/5 font-barlow font-semibold text-[13px] tracking-widest uppercase transition-colors flex items-center gap-3 disabled:opacity-40"
              >
                <span>→</span> {signingOut ? "CERRANDO..." : "CERRAR SESIÓN"}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* OVERLAY: Cierra el menú al hacer scroll o click fuera */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* HEADER DE BIENVENIDA */}
      <div className="px-6 lg:px-12 pt-12 pb-8 border-b border-white/5">
        <p className="text-lime-fw font-barlow font-bold text-[11px] tracking-[0.25em] uppercase mb-3">
          PANEL PRINCIPAL
        </p>
        <h1 className="text-white font-barlow font-extrabold text-4xl lg:text-5xl uppercase tracking-tight leading-none">
          HOLA, <span className="text-lime-fw">{profileName || "USUARIO"}</span>
        </h1>
        <p className="text-white/40 font-barlow-body text-sm mt-3">
          ¿Qué trabajamos hoy?
        </p>
      </div>

      {/* MÓDULOS: Renderizado dinámico de tarjetas funcionales */}
      <div className="px-6 lg:px-12 py-10">
        <h2 className="text-white/40 font-barlow font-bold text-[11px] tracking-[0.25em] uppercase mb-6">
          FUNCIONALIDADES
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => navigate(mod.href)}
              className={`
                group text-left p-6 border transition-all duration-200
                ${
                  mod.accent
                    ? "bg-lime-fw border-lime-fw hover:bg-lime-fw/90"
                    : "bg-black-fw border-white/5 hover:border-lime-fw/40 hover:bg-white/2"
                }
              `}
            >
              <span className="text-2xl mb-4 block">{mod.icon}</span>
              <h3
                className={`font-barlow font-extrabold text-[15px] tracking-[0.08em] uppercase mb-2 ${mod.accent ? "text-black-fw" : "text-white"}`}
              >
                {mod.title}
              </h3>
              <p
                className={`font-barlow-body text-sm leading-relaxed ${mod.accent ? "text-black-fw/60" : "text-white/40"}`}
              >
                {mod.description}
              </p>
              <div
                className={`mt-5 flex items-center gap-2 font-barlow font-bold text-[11px] tracking-[0.2em] uppercase transition-transform duration-200 group-hover:translate-x-1 ${mod.accent ? "text-black-fw/50" : "text-lime-fw/60 group-hover:text-lime-fw"}`}
              >
                ACCEDER →
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="px-6 lg:px-12 py-6 border-t border-white/5 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="w-5 h-5 opacity-30" />
          <span className="text-white/40 font-barlow text-[11px] tracking-[0.15em] uppercase">
            FITWELL © 2026
          </span>
        </div>
        <div className="flex gap-6">
          <Link
            to="/terms"
            className="text-white/40 hover:text-white/40 font-barlow text-[11px] tracking-[0.12em] uppercase transition-colors"
          >
            TÉRMINOS
          </Link>
          <Link
            to="/privacy"
            className="text-white/40 hover:text-white/40 font-barlow text-[11px] tracking-[0.12em] uppercase transition-colors"
          >
            PRIVACIDAD
          </Link>
        </div>
      </footer>
    </div>
  );
}
