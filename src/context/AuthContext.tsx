import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../services/supabaseClient";

/**
 * Esta interfaz define la estructura de los datos que compartiremos en toda la app.
 * - session: Objeto  de Supabase con tokens de acceso.
 * - user: Datos básicos del usuario (id, email).
 * - loading: Estado para controlar mientras se verifica la sesión inicial.
 * - signOut: Función global para cerrar sesión.
 */
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * COMPONENTE: AuthProvider
 * Proveedor que envuelve a toda la aplicación (en main.tsx).
 * Utiliza los servicios de autenticación de Supabase.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Empieza en true para evitar falsos "no logueado"

  useEffect(() => {
    /**
     * 1. RECUPERACIÓN INICIAL:
     * Al cargar la app por primera vez, preguntamos a Supabase si hay
     * una sesión guardada en el almacenamiento local (LocalStorage).
     */
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false); // Una vez comprobado, quitamos la pantalla de carga si hubiese
    });

    /**
     * 2. ESCUCHA ACTIVA (onAuthStateChange):
     * Escucha cualquier cambio en la autenticación.
     * Esto detecta automáticamente si el usuario hace Login, Logout,
     * o si el token se refresca solo.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // LIMPIEZA: Cuando el componente se destruye, cancelamos la suscripción
    // para evitar fugas de memoria (memory leaks).
    return () => subscription.unsubscribe();
  }, []);

  /**
   * FUNCIÓN: signOut
   * Cierre la sesión. Al ejecutar esto, Supabase limpia
   * los tokens y 'onAuthStateChange' se disparará poniendo todo a null.
   */
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  /**
   * Todos los componentes hijos tendrán acceso a esto.
   */
  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * HOOK PERSONALIZADO: useAuth
 * Esto facilita el acceso al contexto. En lugar de importar 'useContext' y el contexto
 * en cada archivo, simplemente llamo a 'useAuth()'.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
