import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";

/**
 * Gestiona el acceso de usuarios, validaciones de formulario
 * y redirecciones automáticas basadas en el estado de la sesión.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { session } = useAuth(); // Consumimos la sesión global del contexto

  // Estados locales para el formulario y control de la interfaz
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Redirección automática
   * Si el usuario ya tiene una sesión activa (ej: al recargar la página),
   * no debe poder ver el Login, por lo que lo enviamos al Dashboard.
   */
  useEffect(() => {
    if (session) {
      navigate("/dashboard", { replace: true });
    }
  }, [session, navigate]);

  /**
   * Gestiona la comunicación con Supabase Auth para iniciar sesión.
   */
  const handleLogin = async () => {
    setError(null);

    // Validación básica de campos vacíos
    if (!email || !password) {
      setError("Por favor, introduce tu email y contraseña");
      return;
    }

    setLoading(true);

    // Llamada al servicio de autenticación de Supabase
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // Manejo de errores específicos para mejorar la experiencia de usuario
      if (signInError.message.includes("Invalid login credentials")) {
        setError("Email o contraseña incorrectos");
      } else if (signInError.message.includes("Email not confirmed")) {
        setError("Confirma tu email antes de iniciar sesión");
      } else {
        setError(signInError.message);
      }
      setLoading(false);
      return;
    }

    // Si el login es exitoso, navegamos al área privada, en este caso el Dashboard
    navigate("/dashboard");
  };

  /**
   * Permitir login al pulsar 'Enter'
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  /**
   * Clases reutilizables de Tailwind para mantener la estética limpia,
   * y así evitar meter todo abajo de golpe
   */

  const inputClass = `
    w-full bg-input-fw border border-white/10 text-white
    px-4 py-3.5 text-sm font-barlow-body outline-none
    focus:border-lime-fw transition-colors duration-200
    placeholder:text-white/20
  `;

  const labelClass = `
    block font-barlow font-bold text-[11px] tracking-[0.2em]
    uppercase text-white/40 mb-2
  `;

  return (
    <div className="min-h-screen flex bg-dark-fw font-barlow">
      {/* PANEL IZQUIERDO (Branding & Marketing)
          Visible solo en pantallas grandes para reforzar la marca. */}
      <div className="hidden lg:flex flex-1 bg-black-fw flex-col justify-between p-12 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="Fitwell" className="w-9 h-9" />
          <span className="text-lime-fw font-barlow font-extrabold text-xl tracking-widest uppercase">
            FITWELL
          </span>
        </div>

        <div>
          <p className="text-white/25 text-[13px] tracking-[0.25em] uppercase mb-4 font-barlow">
            POWERED BY GEMINI AI ® SERVICES
          </p>
          <h2 className="text-white font-barlow font-extrabold text-7xl uppercase leading-[1.05] tracking-tight">
            BIENESTAR
            <br />
            TOTAL A<br />
            <span className="text-lime-fw">TU ALCANCE</span>
          </h2>
        </div>
      </div>

      {/* PANEL DERECHO (Formulario de Acceso) */}
      <div className="w-full lg:max-w-120 bg-card-fw flex flex-col justify-center px-10 py-12">
        <div className="mb-10">
          <p className="text-lime-fw font-barlow font-bold text-[11px] tracking-[0.25em] uppercase mb-2">
            ACCESO
          </p>
          <h1 className="text-white font-barlow font-extrabold text-4xl uppercase tracking-tight leading-none">
            INICIAR SESIÓN
          </h1>
        </div>

        {/* FEEDBACK: Mensajes de error visuales */}
        {error && (
          <div className="bg-lime-fw/5 border border-lime-fw/30 text-lime-fw text-[13px] font-barlow-body px-4 py-3 mb-6 tracking-wide">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4" onKeyDown={handleKeyDown}>
          {/* Email Input */}
          <div>
            <label className={labelClass}>CORREO ELECTRÓNICO</label>
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass}>CONTRASEÑA</label>
            </div>
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
            />
          </div>

          {/* Botón de Acción con estado de carga */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="
              w-full mt-2 bg-lime-fw text-black-fw
              font-barlow font-extrabold text-[15px] tracking-[0.15em] uppercase
              py-4 transition-all duration-200
              hover:bg-lime-fw/85 active:scale-[0.99]
              disabled:bg-lime-fw/20 disabled:text-white/20 disabled:cursor-not-allowed
            "
          >
            {loading ? "ACCEDIENDO..." : "ENTRAR →"}
          </button>
        </div>

        {/* Decoración visual y Link a Registro */}
        <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent my-8" />

        <p className="text-center text-white/35 font-barlow-body text-sm">
          ¿Aún no tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-lime-fw font-barlow font-bold tracking-[0.08em] uppercase no-underline hover:text-lime-fw/80 transition-colors"
          >
            CREAR CUENTA
          </Link>
        </p>
      </div>
    </div>
  );
}
