import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Definimos las funcionalidades de forma estática fuera del componente.
 * Esto mejora el rendimiento */
const features = [
  {
    icon: "⚡",
    title: "GENERACIÓN DE RUTINAS",
    description:
      "Entrenamientos personalizados adaptados a tus objetivos y nivel.",
  },
  {
    icon: "🥗",
    title: "ANÁLISIS DE ALIMENTOS CON IA",
    description:
      "Escanea y analiza tus comidas para un control nutricional inteligente.",
  },
  {
    icon: "📊",
    title: "CALCULADORAS DE SUEÑO Y SALUD",
    description:
      "Herramientas precisas para monitorear tus constantes vitales y descanso.",
  },
  {
    icon: "🧠",
    title: "SALUD MENTAL",
    description:
      "Recursos y seguimiento para mantener un equilibrio mental saludable.",
  },
];

/**
 * Componente principal de presentación.
 */
export default function LandingPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  /**
   * Si un usuario que ya está logueado entra en la landing, lo redirigimos
   * automáticamente al Dashboard para mejorar la experiencia de usuario.
   */
  useEffect(() => {
    if (session) {
      navigate("/dashboard", { replace: true });
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-dark-fw font-barlow flex flex-col">
      {/* NAVBAR */}
      <nav className="bg-black-fw border-b border-white/5 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="Fitwell" className="w-8 h-8" />
          <span className="text-lime-fw font-barlow font-extrabold text-lg tracking-widest uppercase">
            FITWELL
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="text-white/50 hover:text-white font-barlow font-bold text-[10px] tracking-[0.15em] uppercase transition-colors border border-white/10 hover:border-white/30 px-5 py-2"
          >
            INICIAR SESIÓN
          </Link>
          <Link
            to="/register"
            className="bg-lime-fw text-black-fw font-barlow font-extrabold text-[12px] tracking-[0.15em] uppercase px-5 py-2 hover:bg-lime-fw/85 transition-colors"
          >
            REGISTRO
          </Link>
        </div>
      </nav>

      {/* HERO SECTION: El mensaje principal de la aplicación.
          Está diseñado para ser impactante mediante tipografías en gran escala. */}
      <section className="px-6 lg:px-12 py-14 border-b border-white/5">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div>
              <img
                src="/favicon.svg"
                alt="Fitwell"
                className="w-16 h-16 lg:w-20 lg:h-20"
              />
            </div>
            <div>
              <h1 className="text-white font-barlow font-extrabold text-5xl lg:text-6xl uppercase tracking-widest leading-none">
                FITWELL
              </h1>
              <p className="text-white/40 font-barlow font-semibold text-sm lg:text-base tracking-[0.2em] uppercase mt-1">
                BIENESTAR TOTAL A TU ALCANCE
              </p>
            </div>
          </div>

          {/* CTA (Call To Action) - Solo escritorio */}
          <div className="hidden lg:flex flex-col items-end gap-2 shrink-0">
            <Link
              to="/register"
              className="bg-lime-fw text-black-fw font-barlow font-extrabold text-[14px] tracking-[0.15em] uppercase px-8 py-4 hover:bg-lime-fw/85 transition-colors"
            >
              EMPEZAR AHORA
            </Link>
            <p className="text-white/40 font-barlow text-[10px] tracking-[0.2em] uppercase">
              POWERED BY GEMINI ®
            </p>
          </div>
        </div>

        {/* CTA (Call To Action) - Móvil */}
        <div className="lg:hidden mt-8 flex flex-col items-start gap-2">
          <Link
            to="/register"
            className="bg-lime-fw text-black-fw font-barlow font-extrabold text-[14px] tracking-[0.15em] uppercase px-8 py-4 hover:bg-lime-fw/85 transition-colors"
          >
            EMPEZAR AHORA
          </Link>
          <p className="text-white/40 font-barlow text-[10px] tracking-[0.2em] uppercase">
            POWERED BY GEMINI ®
          </p>
        </div>
      </section>

      {/* SECCIÓN FUNCIONALIDADES: Grid responsivo.
          Mapeamos el array 'features' para renderizar las tarjetas, 
          aplicando estilos condicionales basados en el índice. */}
      <section className="px-6 lg:px-12 py-12 flex-1">
        <h2 className="text-white/40 font-barlow font-bold text-[11px] tracking-[0.25em] uppercase mb-6">
          FUNCIONALIDADES
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`
                p-6 border border-white/5 transition-colors duration-200
                ${i === 0 ? "bg-black-fw hover:border-lime-fw/30" : "bg-black-fw hover:border-lime-fw/20"}
              `}
            >
              <span className="text-2xl mb-4 block">{f.icon}</span>
              <h3 className="text-white font-barlow font-extrabold text-[14px] tracking-[0.08em] uppercase mb-2">
                {f.title}
              </h3>
              <p className="text-white/40 font-barlow-body text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER: Información y enlaces legales. */}
      <footer className="px-6 lg:px-12 py-6 border-t border-white/5 bg-black-fw flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="w-5 h-5 opacity-80" />
          <span className="text-white/40 font-barlow text-[11px] tracking-widest uppercase">
            FITWELL © 2026
          </span>
        </div>
        <div className="flex gap-6">
          <Link
            to="/terms"
            className="text-white/40 hover:text-white/60 font-barlow text-[11px] tracking-[0.12em] uppercase transition-colors"
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
