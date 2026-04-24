import { useNavigate } from "react-router-dom";

/**
 * Define el marco de uso de la aplicación Fitwell.
 */
export default function TermsPage() {
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
        {/* Navegación histórica: permite al usuario volver exactamente a donde estaba antes */}
        <button
          onClick={() => navigate(-1)}
          className="text-white/30 hover:text-white font-barlow font-bold text-[12px] tracking-[0.15em] uppercase transition-colors"
        >
          ← VOLVER
        </button>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-lime-fw font-barlow font-bold text-[11px] tracking-[0.25em] uppercase mb-3">
          LEGAL
        </p>
        <h1 className="text-white font-barlow font-extrabold text-4xl uppercase tracking-tight leading-none mb-10">
          TÉRMINOS DE USO
        </h1>

        <div className="flex flex-col gap-8 font-barlow-body text-white/50 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-barlow font-bold text-[13px] tracking-[0.15em] uppercase mb-3">
              1. OBJETO Y ÁMBITO DE APLICACIÓN
            </h2>
            <p>
              Los presentes términos y condiciones regulan el acceso y uso de la
              aplicación Fitwell, desarrollada como proyecto académico. El uso
              de la aplicación implica la aceptación plena de estas condiciones.
            </p>
          </section>

          <div className="h-px bg-white/5" />

          <section>
            <h2 className="text-white font-barlow font-bold text-[13px] tracking-[0.15em] uppercase mb-3">
              2. USO PERMITIDO
            </h2>
            <p>
              Fitwell está destinada exclusivamente a uso personal y no
              comercial. El usuario se compromete a hacer un uso responsable de
              la plataforma, absteniéndose de introducir datos falsos o utilizar
              la aplicación con fines distintos a los previstos.
            </p>
          </section>

          <div className="h-px bg-white/5" />

          <section>
            <h2 className="text-white font-barlow font-bold text-[13px] tracking-[0.15em] uppercase mb-3">
              3. NATURALEZA DE LOS CONTENIDOS GENERADOS POR IA
            </h2>
            <p>
              Las rutinas de entrenamiento, análisis nutricionales y
              recomendaciones generadas por la inteligencia artificial de
              Fitwell tienen carácter meramente orientativo. No constituyen
              asesoramiento médico, dietético ni deportivo profesional. Ante
              cualquier duda sobre salud, el usuario debe consultar a un
              profesional cualificado.
            </p>
          </section>

          <div className="h-px bg-white/5" />

          <section>
            <h2 className="text-white font-barlow font-bold text-[13px] tracking-[0.15em] uppercase mb-3">
              4. LIMITACIÓN DE RESPONSABILIDAD
            </h2>
            <p>
              Fitwell no se responsabiliza de los daños o perjuicios derivados
              del uso de la información proporcionada por la aplicación. El
              usuario asume la responsabilidad de su uso y de las decisiones que
              adopte basándose en los datos ofrecidos.
            </p>
          </section>

          <div className="h-px bg-white/5" />

          <section>
            <h2 className="text-white font-barlow font-bold text-[13px] tracking-[0.15em] uppercase mb-3">
              5. MODIFICACIONES
            </h2>
            <p>
              Fitwell se reserva el derecho a modificar estos términos en
              cualquier momento. Las modificaciones serán notificadas a través
              de la propia plataforma y entrarán en vigor desde su publicación.
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
