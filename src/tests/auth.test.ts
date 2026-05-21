// VALIDACIONES
// Valida los datos del formulario de registro
// - email: debe contener un '@' para considerarse válido
// - password: debe tener al menos 12 caracteres
// - confirm: debe coincidir con password
// - rgpd: debe ser true (aceptación de política de privacidad)
// Devuelve un mensaje de error si algo falla, o null si todo es correcto

function validateRegister(
  email: string,
  password: string,
  confirm: string,
  rgpd: boolean,
) {
  if (!email.includes("@")) return "Email inválido";
  if (password.length < 12)
    return "La contraseña debe tener al menos 12 caracteres";
  if (password !== confirm) return "Las contraseñas no coinciden";
  if (!rgpd) return "Debes aceptar la política de privacidad para continuar";
  return null;
}

// Valida los datos del formulario de inicio de sesión
// Tanto email como password deben estar presentes (no vacíos)
function validateLogin(email: string, password: string) {
  if (!email || !password) return "Por favor, introduce tu email y contraseña";
  return null;
}


// Tests: Validaciones del registro

describe("Registro — validaciones", () => {
  // Un email sin el símbolo @ debe ser rechazado como inválido
  test("falla con email sin @", () => {
    expect(
      validateRegister("invalido", "contraseña12345", "contraseña12345", true),
    ).toBe("Email inválido");
  });

  // Una contraseña con menos de 12 caracteres debe ser rechazada
  test("falla con contraseña corta", () => {
    expect(validateRegister("u@t.com", "corta", "corta", true)).toBe(
      "La contraseña debe tener al menos 12 caracteres",
    );
  });

  // Si la contraseña y su confirmación no coinciden, debe devolver error
  test("falla si contraseñas no coinciden", () => {
    expect(
      validateRegister("u@t.com", "contraseña12345", "diferente12345", true),
    ).toBe("Las contraseñas no coinciden");
  });

  // Si el usuario no acepta el RGPD (política de privacidad), debe rechazarse el registro
  test("falla sin aceptar RGPD", () => {
    expect(
      validateRegister("u@t.com", "contraseña12345", "contraseña12345", false),
    ).toBe("Debes aceptar la política de privacidad para continuar");
  });

  // Con todos los datos correctos, la validación debe pasar (retornar null)
  test("pasa con datos válidos", () => {
    expect(
      validateRegister("u@t.com", "contraseña12345", "contraseña12345", true),
    ).toBeNull();
  });
});


// Tests: Validaciones del inicio de sesión

describe("Login — validaciones", () => {
  // Si el email está vacío, debe devolver error indicando que faltan credenciales
  test("falla sin email", () => {
    expect(validateLogin("", "contraseña12345")).toBe(
      "Por favor, introduce tu email y contraseña",
    );
  });

  // Si la contraseña está vacía, debe devolver el mismo error
  test("falla sin contraseña", () => {
    expect(validateLogin("u@t.com", "")).toBe(
      "Por favor, introduce tu email y contraseña",
    );
  });

  // Con email y contraseña presentes, la validación debe pasar (retornar null)
  test("pasa con datos válidos", () => {
    expect(validateLogin("u@t.com", "contraseña12345")).toBeNull();
  });
});
