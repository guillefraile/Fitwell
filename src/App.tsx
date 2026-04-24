import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import PrivacyPage from "./pages/PrivacyPage";

/**
 * Define el sistema de enrutamiento de la aplicación Fitwell.
 */
export default function App() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS: Accesibles para cualquier usuario */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* RUTA PROTEGIDAS: si no hay sesión, ProtectedRoute redirigirá al Login.*/}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* MANEJO DE RUTAS NO EXISTENTES: 
        Si un usario cambia la url o intenta ir a una ruta que no existe,
        lo redirigimos a la raíz para mantener al usuario dentro del flujo.*/}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
