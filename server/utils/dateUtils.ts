// Utilitários de data seguros e simples
// - Aceita string, Date ou null/undefined
// - Retorna Date válido ou null se inválido
// - Usa new Date() e valida com getTime()

/**
 * Verifica se um objeto Date é válido.
 * Retorna true quando `date.getTime()` não é NaN.
 */
export function isValidDate(date: Date | null | undefined): boolean {
  if (!date) return false;
  return !isNaN(date.getTime());
}

/**
 * Faz o parsing seguro de uma entrada (string, Date, null/undefined) para Date.
 * - Strings vazias ou inválidas retornam null
 * - Objetos Date inválidos retornam null
 * - Em caso de erro, retorna null
 */
export function parseDateSeguro(input: string | Date | null | undefined): Date | null {
  try {
    if (input == null) return null;

    if (input instanceof Date) {
      return isValidDate(input) ? input : null;
    }

    if (typeof input === 'string') {
      const trimmed = input.trim();
      if (!trimmed) return null;
      const parsed = new Date(trimmed);
      return isValidDate(parsed) ? parsed : null;
    }

    // Tipo inesperado: por segurança, retorne null
    return null;
  } catch {
    return null;
  }
}