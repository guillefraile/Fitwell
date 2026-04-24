import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Función: Aquí se protegen las rutas privadas de la aplicación.
 * Actúa como un intermediario de navegación en el lado del cliente
 */
export default function ProtectedRoute({
  children, // Representa el componente que queremos proteger (ej: Dashboard)
}: {
  children: React.ReactNode;
}) {
  // Extraemos el estado de autenticación:
  // - session: Si existe, el usuario está validado por Supabase.
  // - loading: Indica si Supabase aún está recuperando la sesión del almacenamiento.
  const { session, loading } = useAuth();

  /**
   * ESCENARIO 1: CARGA INICIAL
   * Mientras Supabase verifica si hay un token válido en el LocalStorage,
   * se muestra una pantalla de carga para evitar un "parpadeo" donde se vea
   * el dashboard por un milisegundo antes de redirigir.
   */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 font-barlow uppercase tracking-widest">
          Cargando...
        </p>
      </div>
    );
  }

  /**
   * ESCENARIO 2: USUARIO NO AUTENTICADO
   * Si la carga terminó y 'session' es nulo, significa que no hay sesión activa.
   * Usamos <Navigate /> para redirigir forzosamente al usuario al login.
   * El 'replace' es crucial, ya que impide que la ruta protegida se guarde en el historial,
   * evitando que el usuario vuelva a ella al pulsar el botón "atrás" del navegador.
   */
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  /**
   * ESCENARIO 3: ACCESO PERMITIDO
   * Si hay sesión, el componente simplemente renderiza sus hijos (children).
   * En App.tsx, esto significa que el usuario verá lo que pongamos dentro de las etiquetas <ProtectedRoute>.
   */
  return <>{children}</>;
}
