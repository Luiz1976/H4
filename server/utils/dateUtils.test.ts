import { describe, it, expect } from 'vitest';
import { parseDateSeguro, isValidDate } from './dateUtils';

describe('dateUtils.parseDateSeguro', () => {
  it('retorna Date válido para string ISO válida', () => {
    const input = '2024-10-15T12:30:00Z';
    const result = parseDateSeguro(input);
    expect(result).not.toBeNull();
    expect(isValidDate(result!)).toBe(true);
  });

  it('retorna null para string inválida', () => {
    const input = 'not-a-date';
    const result = parseDateSeguro(input);
    expect(result).toBeNull();
  });

  it('retorna o próprio Date se válido', () => {
    const input = new Date('2024-01-01T00:00:00Z');
    const result = parseDateSeguro(input);
    expect(result).not.toBeNull();
    expect(result!.toISOString()).toBe(input.toISOString());
  });

  it('retorna null para null', () => {
    const result = parseDateSeguro(null);
    expect(result).toBeNull();
  });

  it('retorna null para undefined', () => {
    const result = parseDateSeguro(undefined);
    expect(result).toBeNull();
  });

  it('retorna null para timestamp numérico', () => {
    const input = Date.now();
    const result = parseDateSeguro((input as unknown) as any);
    expect(result).toBeNull();
  });

  it('retorna null para string vazia ou espaços', () => {
    expect(parseDateSeguro('')).toBeNull();
    expect(parseDateSeguro('   ')).toBeNull();
  });
});