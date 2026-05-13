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
GEMINI_API_KEY=tu_clave_de_google_ai_studio
```

### 4. Arrancar el servidor de desarrollo

```bash
bun run dev
```

La aplicación estará disponible en `http://localhost:5173`.

⚠️ ATENCIÓN: Las funciones de Inteligencia Artificial NO FUNCIONARÁN EN LOCAL, ya que para ello, se precisa de tener instalado la librería de vercel (que genera una carpeta `.vercel` y un archivo `.env.local`) y levantar el proyecto con:

```bash
vercel dev
```

---

## 🛠️ Documentación API

La lógica de Inteligencia Artificial se ejecuta en el lado del servidor mediante **Vercel Serverless Functions**. Los endpoints están disponibles bajo la ruta `/api/`.

---

### 1. Analizador de Alimentos (`/api/analyze-food`)

Este endpoint utiliza visión artificial para identificar platos de comida y estimar sus valores nutricionales.

#### **GET** - Verificar estado

Útil para comprobar si el servicio de análisis está activo.

- **Respuesta:** `200 OK`
- **Cuerpo:**
  ```json
  {
    "status": "online",
    "message": "🍴 ¡El analizador de alimentos está listo para usarse!",
    "instructions": "Para poder analizar tus platos, dirígete a la sección de nutrición.",
    "link": "/nutrition"
  }
  ```

#### **POST** - Analizar imagen

Recibe una imagen en formato Base64 y devuelve el desglose de macronutrientes.

- **Cuerpo (JSON):**

  ```json
  {
    "imageBase64": "string (datos binarios de la imagen)",
    "mimeType": "image/jpeg"
  }
  ```

- **Respuesta de éxito:**

  ```json
  {
    "nombre": "Pollo a la plancha con arroz",
    "calorias": 450,
    "proteinas": 35.0,
    "carbohidratos": 40.5,
    "grasas": 8.2
  }
  ```

---

### 2. Generador de Rutinas (`/api/generate-routine`)

Este endpoint actúa como un entrenador personal (FitCoach) que genera rutinas personalizadas mediante procesamiento de lenguaje natural.

#### **GET** - Verificar estado

Comprueba la disponibilidad del modelo de lenguaje.

- **Respuesta:** `200 OK`

- **Cuerpo:**

  ````json
  {
  "status": "online",
  "message": "🤖 ¡El entrenador FitCoach está en línea y listo!",
  "instructions": "Para empezar a chatear con la IA y generar tus rutinas, dirígete a la sección de entrenamiento.",
  "link": "/workout"
  }

  ```
  ````

#### **POST** - Chat con IA (Streaming)

Envía un mensaje al entrenador y recibe una respuesta en tiempo real (Server-Sent Events).

- **Cuerpo (JSON):**

  ```json
  {
    "message": "Hola, genera una rutina de pierna para nivel principiante."
  }
  ```

- **Respuesta:** Flujo de datos continuo (Stream).
  - Cada evento envía un fragmento de texto: `data: {"chunk": "Texto parcial..."}`.

  - El flujo termina con el mensaje: `data: [DONE]`.

---

## ⚖️ Cumplimiento legal

- **WCAG 2.1 Nivel AA** — Contraste suficiente, semántica HTML5 y navegación por teclado.
- **Licencias Open Source** — React (MIT), Tailwind CSS (MIT), Supabase (Apache 2.0), TypeScript (Apache 2.0), Bun (MIT).

Esta obra está bajo una licencia Reconocimiento-Compartir bajo la misma licencia 3.0 España de Creative Commons.
Para ver una copia de esta licencia, visite http://creativecommons.org/licenses/by-sa/3.0/es/.
