import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converte um número (1-5) para sua letra correspondente (A-E)
 * @param numero - Número de 1 a 5
 * @returns Letra correspondente (A, B, C, D, E)
 */
export function numeroParaLetra(numero: number): string {
  const mapeamento: { [key: number]: string } = {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
    5: 'E'
  };
  
  return mapeamento[numero] || numero.toString();
}
