// Contacto de quien publica: un celular colombiano. Se guarda sin el indicativo
// (10 dígitos que empiezan por 3) y el país se agrega al armar el enlace.

export const COLOMBIA_DIAL_CODE = "57";
export const CONTACT_PHONE_MESSAGE =
  "Escribe un celular colombiano de 10 dígitos que empiece por 3";

const COLOMBIAN_MOBILE = /^3\d{9}$/;

/**
 * Normaliza lo que escribe la persona ("300 123 4567", "+57 3001234567"…)
 * y devuelve los 10 dígitos, o null si no es un celular colombiano.
 */
export function toColombianMobile(value: string): string | null {
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith(COLOMBIA_DIAL_CODE)) digits = digits.slice(2);
  return COLOMBIAN_MOBILE.test(digits) ? digits : null;
}
