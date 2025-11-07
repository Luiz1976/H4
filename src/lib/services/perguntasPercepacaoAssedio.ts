// Serviço para obter perguntas do teste de Percepção de Assédio Moral e Sexual
import { configPercepacaoAssedio } from '../testes/percepcao-assedio';
import type { PerguntaTeste } from '../types';

/**
 * Obtém todas as perguntas do teste de Percepção de Assédio
 */
export function obterPerguntasPercepacaoAssedio(): PerguntaTeste[] {
  console.log('📋 [PERGUNTAS-PAS] Obtendo perguntas do teste de Percepção de Assédio');
  console.log('📋 [PERGUNTAS-PAS] Total de perguntas disponíveis:', configPercepacaoAssedio.perguntas.length);
  
  return configPercepacaoAssedio.perguntas;
}

/**
 * Obtém uma pergunta específica por ID
 */
export function obterPerguntaPorId(id: number): PerguntaTeste | undefined {
  return configPercepacaoAssedio.perguntas.find(pergunta => pergunta.id === id);
}

/**
 * Obtém perguntas de uma dimensão específica
 */
export function obterPerguntasPorDimensao(dimensaoId: string): PerguntaTeste[] {
  const dimensao = configPercepacaoAssedio.dimensoes.find(d => d.id === dimensaoId);
  if (!dimensao) return [];
  
  return configPercepacaoAssedio.perguntas.filter(pergunta => 
    dimensao.perguntasIds.includes(pergunta.id)
  );
}

/**
 * Obtém informações sobre as dimensões do teste
 */
export function obterDimensoesPercepacaoAssedio() {
  return configPercepacaoAssedio.dimensoes;
}

/**
 * Obtém configurações gerais do teste
 */
export function obterConfigPercepacaoAssedio() {
  return {
    id: configPercepacaoAssedio.id,
    nome: configPercepacaoAssedio.nome,
    descricao: configPercepacaoAssedio.descricao,
    categoria: configPercepacaoAssedio.categoria,
    tempoEstimado: configPercepacaoAssedio.tempoEstimado,
    totalPerguntas: configPercepacaoAssedio.perguntas.length,
    dimensoes: configPercepacaoAssedio.dimensoes.length
  };
}