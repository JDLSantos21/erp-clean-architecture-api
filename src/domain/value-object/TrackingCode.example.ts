import { TrackingCode } from "../value-object";

/**
 * Ejemplo de uso del Value Object TrackingCode
 * Formato: PD-{6 dígitos aleatorios}-{año}-{checksum de 2 dígitos}
 */

// ============================================
// 1. Generar un nuevo código de seguimiento
// ============================================

console.log("=== Generar Tracking Code ===");

// Generar con año actual
const trackingCode1 = TrackingCode.generate();
console.log("Código generado (año actual):", trackingCode1.value);
// Ejemplo output: PD-857933-2025-44

// Generar con año específico
const trackingCode2 = TrackingCode.generate(2026);
console.log("Código generado (2026):", trackingCode2.value);
// Ejemplo output: PD-234567-2026-32

// ============================================
// 2. Validar un código de seguimiento existente
// ============================================

console.log("\n=== Validar Tracking Code ===");

try {
  const validCode = TrackingCode.create("PD-123456-2025-30");
  console.log("✓ Código válido:", validCode.value);
} catch (error) {
  console.error("✗ Error:", error);
}

// Validar sin crear instancia
const isValid = TrackingCode.isValid("PD-123456-2025-30");
console.log("¿Es válido?", isValid); // true

const isInvalid = TrackingCode.isValid("PD-123456-2025-99"); // checksum incorrecto
console.log("¿Es válido?", isInvalid); // false

// ============================================
// 3. Extraer información del código
// ============================================

console.log("\n=== Extraer Información ===");

const trackingCode = TrackingCode.create("PD-857933-2025-44");

console.log("Año:", trackingCode.getYear()); // 2025
console.log("Número aleatorio:", trackingCode.getRandomNumber()); // 857933
console.log("Checksum:", trackingCode.getChecksum()); // 44
console.log("¿Es del año actual?", trackingCode.isCurrentYear()); // true/false
console.log("Formato:", trackingCode.format()); // PD-857933-2025-44

// ============================================
// 4. Manejo de errores
// ============================================

console.log("\n=== Manejo de Errores ===");

const invalidCodes = [
  "PD-12345-2025-30", // Solo 5 dígitos
  "PD-123456-25-30", // Año con 2 dígitos
  "PD-123456-2025-1", // Checksum de 1 dígito
  "XX-123456-2025-30", // Prefijo incorrecto
  "PD-123456-2025-99", // Checksum incorrecto
  "", // Vacío
];

invalidCodes.forEach((code) => {
  try {
    TrackingCode.create(code);
    console.log(`✓ "${code}" es válido`);
  } catch (error: any) {
    console.log(`✗ "${code}" - ${error.message}`);
  }
});

// ============================================
// 5. Comparación de Value Objects
// ============================================

console.log("\n=== Comparación ===");

const code1 = TrackingCode.create("PD-123456-2025-30");
const code2 = TrackingCode.create("PD-123456-2025-30");
const code3 = TrackingCode.create("PD-654321-2025-25");

console.log("code1 equals code2:", code1.equals(code2)); // true (mismo valor)
console.log("code1 equals code3:", code1.equals(code3)); // false (diferente valor)

// ============================================
// 6. Uso en Entidades (Order)
// ============================================

console.log("\n=== Uso en Order Entity ===");

interface OrderData {
  id: number;
  trackingCode: TrackingCode;
  customerId: string;
  orderDate: Date;
}

// Crear una orden con tracking code
const newOrder: OrderData = {
  id: 1,
  trackingCode: TrackingCode.generate(),
  customerId: "customer-123",
  orderDate: new Date(),
};

console.log("Orden creada:");
console.log("  ID:", newOrder.id);
console.log("  Tracking Code:", newOrder.trackingCode.value);
console.log("  Cliente:", newOrder.customerId);

// Buscar orden por tracking code (simulado)
const searchCode = newOrder.trackingCode.value;
console.log(`\nBuscando orden con código: ${searchCode}`);
// En un caso real, buscarías en la base de datos

// ============================================
// 7. Normalización automática
// ============================================

console.log("\n=== Normalización ===");

// El VO normaliza automáticamente a mayúsculas
const lowercaseInput = "pd-123456-2025-30";
const normalized = TrackingCode.create(lowercaseInput);
console.log("Input:", lowercaseInput);
console.log("Normalizado:", normalized.value); // PD-123456-2025-30

// Elimina espacios en blanco
const withSpaces = "  PD-123456-2025-30  ";
const trimmed = TrackingCode.create(withSpaces);
console.log("Input con espacios:", `"${withSpaces}"`);
console.log("Sin espacios:", trimmed.value); // PD-123456-2025-30

// ============================================
// 8. Cálculo de Checksum (explicación)
// ============================================

console.log("\n=== Cómo se calcula el Checksum ===");

function explainChecksum(randomNumber: string, year: string) {
  const combined = randomNumber + year;
  console.log(`Número aleatorio: ${randomNumber}`);
  console.log(`Año: ${year}`);
  console.log(`Combinado: ${combined}`);

  const digits = combined.split("").map((d) => parseInt(d, 10));
  console.log(`Dígitos: ${digits.join(" + ")}`);

  const sum = digits.reduce((acc, d) => acc + d, 0);
  console.log(`Suma: ${sum}`);

  const checksum = sum % 100;
  const checksumFormatted = checksum.toString().padStart(2, "0");
  console.log(`Checksum (últimos 2 dígitos): ${checksumFormatted}`);

  return checksumFormatted;
}

const example = "857933";
const year = "2025";
const calculatedChecksum = explainChecksum(example, year);
console.log(`\nCódigo completo: PD-${example}-${year}-${calculatedChecksum}`);
