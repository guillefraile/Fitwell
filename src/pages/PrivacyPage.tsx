import { useNavigate } from "react-router-dom";

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-fw font-barlow">
      {/* NAVBAR */}
      <nav className="bg-black-fw border-b border-white/5 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/isotipo.png" alt="Fitwell" className="w-8 h-8" />
          <span className="text-lime-fw font-barlow font-extrabold text-lg tracking-widest uppercase">
            FITWELL
          </span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-white/30 hover:text-white font-barlow font-bold text-[12px] tracking-[0.15em] uppercase transition-colors"
        >
          ← VOLVER
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-lime-fw font-barlow font-bold text-[11px] tracking-[0.25em] uppercase mb-3">
          LEGAL
        </p>
        <h1 className="text-white font-barlow font-extrabold text-4xl uppercase tracking-tight leading-none mb-10">
          POLÍTICA DE PRIVACIDAD
        </h1>

        <div className="flex flex-col gap-8 font-barlow-body text-white/50 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-barlow font-bold text-[13px] tracking-[0.15em] uppercase mb-3">
              1. RESPONSABLE DEL TRATAMIENTO
            </h2>
            <p>
              Fitwell es un proyecto académico desarrollado en el marco de un
              ciclo formativo de Desarrollo de Aplicaciones Web. Los datos
              recogidos se tratan exclusivamente con fines demostrativos y
              académicos.
            </p>
          </section>

          <div className="h-px bg-white/5" />

          <section>
            <h2 className="text-white font-barlow font-bold text-[13px] tracking-[0.15em] uppercase mb-3">
              2. DATOS QUE RECOGEMOS
            </h2>
            <p>
              Fitwell recoge los siguientes datos personales: dirección de
              correo electrónico, nombre completo, fecha de nacimiento, género,
              métricas físicas (altura y peso), nivel de actividad, objetivo de
              salud, registros de estado de ánimo y datos nutricionales
              introducidos por el usuario.
            </p>
          </section>

          <div className="h-px bg-white/5" />

          <section>
            <h2 className="text-white font-barlow font-bold text-[13px] tracking-[0.15em] uppercase mb-3">
              3. FINALIDAD DEL TRATAMIENTO
            </h2>
            <p>
              Los datos se utilizan exclusivamente para personalizar las
              funcionalidades de la aplicación: generación de rutinas, análisis
              nutricional, cálculo de métricas de salud y seguimiento del estado
              de ánimo. No se ceden a terceros ni se utilizan con fines
              comerciales.
            </p>
          </section>

          <div className="h-px bg-white/5" />

          <section>
            <h2 className="text-white font-barlow font-bold text-[13px] tracking-[0.15em] uppercase mb-3">
              4. BASE LEGAL — RGPD
            </h2>
            <p>
              El tratamiento de tus datos se basa en el consentimiento explícito
              otorgado durante el registro, conforme al Reglamento (UE) 2016/679
              (RGPD). Los datos de salud se consideran categoría especial y solo
              se tratan con consentimiento explícito del usuario.
            </p>
          </section>

          <div className="h-px bg-white/5" />

          <section>
            <h2 className="text-white font-barlow font-bold text-[13px] tracking-[0.15em] uppercase mb-3">
              5. TUS DERECHOS
            </h2>
            <p>
              Puedes ejercer en cualquier momento tus derechos de acceso,
              rectificación, limitación y portabilidad de tus datos, así como
              retirar el consentimiento otorgado.
            </p>
          </section>

          <div className="h-px bg-white/5" />

          <section>
            <h2 className="text-white font-barlow font-bold text-[13px] tracking-[0.15em] uppercase mb-3">
              6. ALMACENAMIENTO Y SEGURIDAD
            </h2>
            <p>
              Los datos se almacenan en Supabase, con servidores ubicados en la
              región West EU (Irlanda), dentro del territorio de la Unión
              Europea. La comunicación se realiza mediante HTTPS y los datos
              están protegidos mediante Row Level Security (RLS).
            </p>
          </section>

          <div className="h-px bg-white/5" />

          <p className="text-white/20 text-xs">
            Última actualización: abril de 2026
          </p>
        </div>
      </div>
    </div>
  );
}
