/**
 * Este archivo centraliza la configuración y conexión con el Backend (Supabase).
 */
import { createClient } from "@supabase/supabase-js";

/**
 * VARIABLES DE ENTORNO:
 * Utilizamos 'import.meta.env' (propio de Vite) para leer las credenciales y no harcodearlas.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * INICIALIZACIÓN DEL CLIENTE:
 * 'createClient' crea el objeto que nos permite interactuar con:
 * - Auth: Registro y Login de usuarios.
 * - Database: Consultas, inserts y filtros en las tablas.
 * - Storage: Subida de imágenes o documentos si se necesitara.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
