import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

/**
 * Encargada de la creación de nuevos usuarios. Incluye validaciones de seguridad,
 * gestión de contraseñas y aceptación de términos legales.
 */
export default function RegisterPage() {
  const navigate = useNavigate();

  // Estados locales para capturar los datos del nuevo usuario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rgpd, setRgpd] = useState(false); // Estado para el Checkbox legal
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Lógica principal de registro con validaciones previas a la llamada de API.
   */
  const handleRegister = async () => {
    setError(null);

    // 1. Validación de seguridad: Longitud de contraseña (estándar moderno)
    if (password.length < 12) {
      setError("La contraseña debe tener al menos 12 caracteres");
      return;
    }

    // 2. Validación de integridad: Coincidencia de campos
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // 3. Validación Legal: Obligatorio para cumplimiento de RGPD en apps de salud
    if (!rgpd) {
      setError("Debes aceptar la política de privacidad para continuar");
      return;
    }

    setLoading(true);

    /**
     * Comunicación con Supabase Auth:
     * Crea el usuario en la tabla 'auth.users'.
     */
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      // Manejo de error de duplicados para no dar pistas a atacantes pero informar al usuario
      setError(
        signUpError.message.includes("already registered")
          ? "Este correo ya está en uso"
          : signUpError.message,
      );
      setLoading(false);
      return;
    }

    /**
     * Tras el registro, enviamos al usuario a completar su perfil.
     */
    navigate("/profile", { replace: true });
  };

  /**
   * Clases reutilizables de Tailwind para mantener la estética limpia,
   * y así evitar meter todo abajo de golpe
   */
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

  return (
    <div className="min-h-screen flex bg-dark-fw font-barlow">
      {/* PANEL IZQUIERDO (Branding) */}
      <div className="hidden lg:flex flex-1 bg-black-fw flex-col justify-between p-12 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="Fitwell" className="w-9 h-9" />
          <span className="text-lime-fw font-barlow font-extrabold text-xl tracking-widest uppercase">
            FITWELL
          </span>
        </div>

        <div>
          <p className="text-white/40 text-[13px] tracking-[0.25em] uppercase mb-4 font-barlow">
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

      {/* PANEL DERECHO (Formulario de Registro) */}
      <div className="w-full lg:max-w-120 bg-card-fw flex flex-col justify-center px-10 py-12">
        <div className="mb-10">
          <p className="text-lime-fw font-barlow font-bold text-[11px] tracking-[0.25em] uppercase mb-2">
            NUEVO USUARIO
          </p>
          <h1 className="text-white font-barlow font-extrabold text-4xl uppercase tracking-tight leading-none">
            CREAR CUENTA
          </h1>
        </div>

        {/* FEEDBACK de errores */}
        {error && (
          <div className="bg-lime-fw/5 border border-lime-fw/30 text-lime-fw text-[13px] font-barlow-body px-4 py-3 mb-6 tracking-wide">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className={labelClass}>CORREO ELECTRÓNICO</label>
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>

          {/* Password con indicador de requisitos */}
          <div>
            <label className={labelClass}>
              CONTRASEÑA{" "}
              <span className="text-white/40 normal-case font-normal tracking-normal">
                — mín. 12 caracteres
              </span>
            </label>
            <input
              className={inputClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />
          </div>

          {/* Confirmar la password */}
          <div>
            <label className={labelClass}>CONFIRMAR CONTRASEÑA</label>
            <input
              className={inputClass}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
            />
          </div>

          {/* CUMPLIMIENTO RGPD */}
          <div className="flex items-start gap-3 mt-1">
            <input
              type="checkbox"
              id="rgpd"
              checked={rgpd}
              onChange={(e) => setRgpd(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-lime-fw cursor-pointer shrink-0"
            />
            <label
              htmlFor="rgpd"
              className="text-white/40 font-barlow-body text-xs leading-relaxed cursor-pointer"
            >
              He leído y acepto la{" "}
              <Link
                to="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lime-fw hover:text-lime-fw/80 transition-colors"
              >
                política de privacidad
              </Link>{" "}
              y el tratamiento de mis datos de salud conforme al RGPD
            </label>
          </div>

          {/* Botón de envío */}
          <button
            onClick={handleRegister}
            disabled={loading}
            className="
              w-full mt-2 bg-lime-fw text-black-fw
              font-barlow font-extrabold text-[15px] tracking-[0.15em] uppercase
              py-4 transition-all duration-200
              hover:bg-lime-fw/85 active:scale-[0.99]
              disabled:bg-lime-fw/20 disabled:text-white/40 disabled:cursor-not-allowed
            "
          >
            {loading ? "CREANDO CUENTA..." : "CREAR CUENTA →"}
          </button>
        </div>

        <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent my-8" />

        {/* Link para volver a login */}
        <p className="text-center text-white/40 font-barlow-body text-sm">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="text-lime-fw font-barlow font-bold tracking-[0.08em] uppercase no-underline hover:text-lime-fw/80 transition-colors"
          >
            INICIAR SESIÓN
          </Link>
        </p>
      </div>
    </div>
  );
}
