<div align="center">

<img src="public/favicon.svg" alt="Fitwell Logo" width="80"/>

# FITWELL

### Bienestar total a tu alcance

🌐 https://fitwell-phi.vercel.app/

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-2-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel)](https://vercel.com)
[![Bun](https://img.shields.io/badge/Bun-1.2+-FBF0DF?style=flat-square&logo=bun)](https://bun.sh)
[![Gemini](https://img.shields.io/badge/Gemini_AI-1.5_Flash-8E75FF?style=flat-square&logo=google-gemini&logoColor=white)](https://ai.google.dev/)

</div>

---

## ¿Qué es Fitwell?

**Fitwell** es una plataforma web integral de gestión de salud personal, con integración directa de **Inteligencia Artificial** desarrollada como proyecto final del Ciclo Formativo de Grado Superior en **Desarrollo de Aplicaciones Web**.

El objetivo de Fitwell es unificar en un único ecosistema los cuatro pilares del bienestar:

| Pilar               | Descripción                                                           |
| ------------------- | --------------------------------------------------------------------- |
| 🏋️ **Deporte**      | Generación de rutinas personalizadas asistidas por IA                 |
| 🥗 **Nutrición**    | Análisis nutricional de alimentos mediante reconocimiento de imágenes |
| 💤 **Sueño**        | Calculadora de ciclos de descanso óptimos                             |
| 🧠 **Salud mental** | Seguimiento del estado de ánimo y recursos de bienestar               |

---

## ✨ Funcionalidades actuales

- 🔐 **Autenticación segura** — Registro, login y logout con Supabase Auth y JWT
- 👤 **Perfil de usuario** — Gestión de datos personales y métricas físicas (peso, altura, edad, nivel de actividad, objetivo)
- 📊 **Calculadora TMB** — Cálculo de Tasa Metabólica Basal y gasto energético diario (TDEE) con la fórmula Harris-Benedict
- 💤 **Calculadora de sueño** — Horarios óptimos de despertar basados en ciclos de 90 minutos
- 🌐 **Landing page** — Página de presentación pública con propuesta de valor
- 📄 **Páginas legales** — Términos de uso y política de privacidad (RGPD)
- 📱 **Diseño responsive** — Adaptado a móvil y escritorio
- ⚡ **Generación de rutinas deportivas con IA (Google Gemini)** - Diseñadas de manera completamente personalizada a las necesidades del usuario
- 🥗 **Análisis nutricional por foto (visión multimodal)** - Subida de fotos de platos con comida, para su posterior análisis

### 🔜 Próximamente

- 😊 Monitor de estado de ánimo diario
- 💬 Frases motivadoras generadas por IA

---

## 🛠️ Stack tecnológico

### 🎨 Frontend

| Tecnología                                   | Versión |
| -------------------------------------------- | ------- |
| [React](https://react.dev)                   | 19      |
| [TypeScript](https://www.typescriptlang.org) | 5.7     |
| [Tailwind CSS](https://tailwindcss.com)      | 4       |
| [Vite](https://vite.dev)                     | 8       |

### ⚙️ Backend & Infraestructura

| Tecnología                               | Versión |
| ---------------------------------------- | ------- |
| [Supabase](https://supabase.com)         | SDK v2  |
| [PostgreSQL](https://www.postgresql.org) | —       |
| [Vercel](https://vercel.com)             | —       |

## 🗃️ Estructura de directorios

```
fitwell/
├── api/                        # Vercel Serverless Functions (backend)
│   └── generate-routine.ts     # Endpoints y promp para la generación de rutinas (devolución de JSON)
│   └── analyze-food.ts         # Endpoints y promp para el análisis de comidas (devolución de JSON)
│
├── public/
│   └── favicon.svg             # Logo de la aplicación
│
├── src/
│   ├── components/
│   │   └── ProtectedRoute.tsx  # Protección para las rutas
│   │
│   ├── context/
│   │   └── AuthContext.tsx     # Contexto global de autenticación
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx     # Página pública de presentación
│   │   ├── LoginPage.tsx       # Inicio de sesión
│   │   ├── RegisterPage.tsx    # Registro de usuario
│   │   ├── DashboardPage.tsx   # Panel principal autenticado
│   │   ├── ProfilePage.tsx     # Gestión de perfil y métricas
│   │   ├── HealthPage.tsx      # Calculadoras TMB y sueño
│   │   ├── NutritionPage.tsx   # Análisis IA de platos con comida
│   │   ├── WorkoutPage.tsx     # Chat de generación de rutinas deportidas con IA
│   │   ├── TermsPage.tsx       # Términos de uso
│   │   └── PrivacyPage.tsx     # Política de privacidad (RGPD)
│   │
│   ├── services/
│   │   └── supabaseClient.ts   # Configuración del cliente de Supabase
│   │
│   ├── App.tsx                 # Enrutador principal
│   ├── main.tsx                # Punto de entrada
│   └── index.css               # Tailwind + tema personalizado (@theme)
│
├── .gitignore
├── vercel.json                 # Configuración de rutas para Vercel
├── vite.config.ts              # Configuración de Vite + Tailwind
├── tsconfig.json
└── package.json
```

---

## 🚀 Instalación y despliegue en local

### Requisitos previos

- [Bun](https://bun.sh) v1.2 o superior
- [Git](https://git-scm.com)

### 1. Clonar el repositorio

```bash
git clone https://github.com/guillefraile/Fitwell.git
cd Fitwell
```

### 2. Instalar dependencias

```bash
bun install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### 4. Arrancar el servidor de desarrollo

```bash
bun run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## ⚖️ Cumplimiento legal

- **WCAG 2.1 Nivel AA** — Contraste suficiente, semántica HTML5 y navegación por teclado.
- **Licencias Open Source** — React (MIT), Tailwind CSS (MIT), Supabase (Apache 2.0), TypeScript (Apache 2.0), Bun (MIT).

Esta obra está bajo una licencia Reconocimiento-Compartir bajo la misma licencia 3.0 España de Creative Commons.
Para ver una copia de esta licencia, visite http://creativecommons.org/licenses/by-sa/3.0/es/.
