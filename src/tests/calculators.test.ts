// Definiciones de tipos y datos auxiliares

// Niveles de actividad física disponibles para el cálculo del gasto calórico total
type ActivityKey =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

// Factores multiplicadores del metabolismo basal según el nivel de actividad (TDEE)
const MULTIPLIERS: Record<ActivityKey, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Calcula la Tasa Metabólica Basal (TMB) usando la ecuación de Harris-Benedict
// - w: peso en kg, h: altura en cm, age: edad en años
// - gender: "male" (masculino) o "female" (femenino)
// - La fórmula difiere según el sexo biológico
function calcTMB(w: number, h: number, age: number, gender: string) {
  return gender === "female"
    ? 447.593 + 9.247 * w + 3.098 * h - 4.33 * age
    : 88.362 + 13.397 * w + 4.799 * h - 5.677 * age;
}

// Calcula el Gasto Calórico Diario Total (TDEE) multiplicando la TMB por el factor de actividad
function calcTDEE(tmb: number, activity: ActivityKey) {
  return Math.round(tmb * MULTIPLIERS[activity]);
}

// Calcula las horas de despertar según los ciclos de sueño (~90 min cada ciclo)
// - bedtime: hora de acostarse en formato "HH:MM"
// - cycles: número de ciclos completos de sueño (90 min por ciclo)
// - Devuelve un array con las horas de despertar en formato HH:MM (locale es-ES)
function calcSleepCycles(bedtime: string, cycles: number): string[] {
  if (!bedtime) return [];
  const [h, m] = bedtime.split(":").map(Number);
  const base = new Date();
  base.setHours(h, m + 14, 0, 0);
  return Array.from({ length: cycles }, (_, i) => {
    const wake = new Date(base.getTime() + (i + 1) * 90 * 60 * 1000);
    return wake.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  });
}

// Valida que las métricas corporales estén dentro de rangos razonables
// Devuelve un mensaje de error si algún valor está fuera de rango, o null si todo es correcto
function validateMetrics(w: number, h: number, age: number) {
  if (w < 20 || w > 300) return "El peso debe estar entre 20 y 300 kg";
  if (h < 50 || h > 250) return "La altura debe estar entre 50 y 250 cm";
  if (age < 10 || age > 120) return "La edad debe estar entre 10 y 120 años";
  return null;
}

// Tests: Tasa Metabólica Basal (Harris-Benedict)
describe("TMB — Harris-Benedict", () => {
  // Verifica que el cálculo devuelva 1724 kcal para un hombre de 70 kg, 175 cm y 25 años
  // (resultado conocido de la fórmula de Harris-Benedict)
  test("hombre 70kg 175cm 25 años → 1724 kcal", () => {
    expect(Math.round(calcTMB(70, 175, 25, "male"))).toBe(1724);
  });

  // Comprueba que, con los mismos datos antropométricos,
  // un hombre tenga una TMB superior a la de una mujer
  test("hombre tiene más TMB que mujer con mismos datos", () => {
    expect(calcTMB(70, 175, 25, "male")).toBeGreaterThan(
      calcTMB(70, 175, 25, "female"),
    );
  });

  // Verifica que a mayor peso corporal, mayor sea la TMB (relación directa)
  test("más peso → más TMB", () => {
    expect(calcTMB(90, 175, 25, "male")).toBeGreaterThan(
      calcTMB(70, 175, 25, "male"),
    );
  });

  // Verifica que a mayor edad, menor sea la TMB (relación inversa)
  test("más edad → menos TMB", () => {
    expect(calcTMB(70, 175, 50, "male")).toBeLessThan(
      calcTMB(70, 175, 25, "male"),
    );
  });
});

// Gasto Calórico Diario Total (TDEE)

describe("TDEE", () => {
  const tmb = calcTMB(70, 175, 25, "male");

  // Para actividad sedentaria, el TDEE debe ser exactamente TMB × 1.2
  test("sedentario = TMB × 1.2", () => {
    expect(calcTDEE(tmb, "sedentary")).toBe(Math.round(tmb * 1.2));
  });

  // El TDEE de una persona muy activa debe ser mayor que el de una sedentaria
  test("muy activo > sedentario", () => {
    expect(calcTDEE(tmb, "very_active")).toBeGreaterThan(
      calcTDEE(tmb, "sedentary"),
    );
  });
});

// ─────────────────────────────────────────────
// Tests: Validación de métricas corporales
// ─────────────────────────────────────────────

describe("Validación métricas", () => {
  // Peso negativo debe ser rechazado con el mensaje correspondiente
  test("rechaza peso negativo", () => {
    expect(validateMetrics(-5, 175, 25)).toBe(
      "El peso debe estar entre 20 y 300 kg",
    );
  });

  // Altura negativa debe ser rechazada con el mensaje correspondiente
  test("rechaza altura negativa", () => {
    expect(validateMetrics(70, -20, 25)).toBe(
      "La altura debe estar entre 50 y 250 cm",
    );
  });

  // Edad de 2025 años (valor absurdo) debe ser rechazada
  test("rechaza edad 2025", () => {
    expect(validateMetrics(70, 175, 2025)).toBe(
      "La edad debe estar entre 10 y 120 años",
    );
  });

  // Valores dentro del rango válido deben pasar la validación (retornar null)
  test("acepta valores correctos", () => {
    expect(validateMetrics(70, 175, 25)).toBeNull();
  });
});

//  Ciclos de sueño

describe("Ciclos de sueño", () => {
  // Al pedir 5 ciclos desde las 23:00, deben devolverse 5 horarios de despertar
  test("devuelve n horarios según ciclos pedidos", () => {
    expect(calcSleepCycles("23:00", 5)).toHaveLength(5);
  });

  // Si no se proporciona hora de acostarse, debe devolver un array vacío
  test("devuelve array vacío sin hora", () => {
    expect(calcSleepCycles("", 5)).toHaveLength(0);
  });

  // Cada hora de despertar debe tener el formato HH:MM (dos dígitos para hora y minutos)
  test("formato HH:MM", () => {
    calcSleepCycles("23:00", 3).forEach((t) =>
      expect(t).toMatch(/^\d{2}:\d{2}$/),
    );
  });

  // La diferencia entre dos horas de despertar consecutivas debe ser exactamente 90 minutos
  // (un ciclo completo de sueño REM)
  test("diferencia entre ciclos es 90 min", () => {
    const [t1, t2] = calcSleepCycles("23:00", 2).map((t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    });
    expect((t2 - t1 + 1440) % 1440).toBe(90);
  });
});
