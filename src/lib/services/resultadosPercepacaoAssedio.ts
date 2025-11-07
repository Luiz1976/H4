// Serviço para gerenciar resultados do teste de Percepção de Assédio Moral e Sexual
import { 
  calcularResultadoPercepacaoAssedio, 
  configPercepacaoAssedio,
  type ResultadoPercepacaoAssedio 
} from '../testes/percepcao-assedio';
import { resultadosService } from '../database';
import { sessionService } from './session-service';
import type { Resultado, AnaliseResultado } from '../types';

export class ResultadosPercepacaoAssedioService {
  
  /**
   * Salva uma resposta individual do teste
   */
  async salvarRespostaPercepacaoAssedio(
    perguntaId: number,
    resposta: number,
    sessionId?: string
  ): Promise<void> {
    try {
      console.log('💾 [PAS-RESULTADOS] Salvando resposta individual:', { perguntaId, resposta });
      
      const session = sessionId || sessionService.getSessionId();
      
      // Aqui você pode implementar salvamento de respostas individuais se necessário
      // Por enquanto, apenas logamos para debug
      console.log('💾 [PAS-RESULTADOS] Resposta salva para sessão:', session);
      
    } catch (error) {
      console.error('❌ [PAS-RESULTADOS] Erro ao salvar resposta individual:', error);
      throw error;
    }
  }

  /**
   * Finaliza o teste e processa o resultado completo
   */
  async finalizarTestePercepacaoAssedio(
    respostas: Record<number, number>,
    usuarioNome?: string,
    usuarioEmail?: string,
    tempoGasto: number = 0
  ): Promise<{ resultado: Resultado; analise: ResultadoPercepacaoAssedio }> {
    
    try {
      console.log('🔍 [PAS-RESULTADOS] Iniciando processamento do resultado');
      console.log('🔍 [PAS-RESULTADOS] Respostas recebidas:', respostas);
      console.log('🔍 [PAS-RESULTADOS] Número de respostas:', Object.keys(respostas).length);
      
      // Calcular resultado usando a função específica do teste
      console.log('🔍 [PAS-RESULTADOS] Calculando resultado...');
      const analisePAS = calcularResultadoPercepacaoAssedio(respostas);
      console.log('🔍 [PAS-RESULTADOS] Análise calculada:', analisePAS);
      
      // Converter para o formato do banco de dados
      console.log('🔍 [PAS-RESULTADOS] Convertendo pontuações das dimensões...');
      const pontuacoesDimensoes: Record<string, number> = {};
      analisePAS.dimensoes.forEach(dimensao => {
        pontuacoesDimensoes[dimensao.nome] = dimensao.pontuacao;
      });
      console.log('🔍 [PAS-RESULTADOS] Pontuações das dimensões:', pontuacoesDimensoes);
      
      // Gerar interpretação textual
      console.log('🔍 [PAS-RESULTADOS] Gerando interpretação...');
      const interpretacao = this.gerarInterpretacao(analisePAS);
      console.log('🔍 [PAS-RESULTADOS] Interpretação gerada:', interpretacao.substring(0, 100) + '...');
      
      // Gerar recomendações
      console.log('🔍 [PAS-RESULTADOS] Gerando recomendações...');
      const recomendacoes = this.gerarRecomendacoes(analisePAS);
      console.log('🔍 [PAS-RESULTADOS] Recomendações geradas:', recomendacoes.length, 'itens');
      
      // Obter session_id para persistência
      const sessionId = sessionService.getSessionId();
      console.log('🔍 [PAS-RESULTADOS] Session ID obtido:', sessionId);
      
      // Preparar dados para salvar no banco (compatível com schema)
      const dadosResultado = {
        teste_id: null, // NULL para testes que não estão na tabela testes
        usuario_id: usuarioEmail ? crypto.randomUUID() : null, // NULL para anônimos
        session_id: sessionId,
        pontuacao_total: Math.round(analisePAS.percentualGeral), // Usar percentual geral como pontuação total
        tempo_gasto: tempoGasto,
        status: 'concluido' as const,
        metadados: {
          tipo_teste: 'percepcao-assedio',
          teste_nome: configPercepacaoAssedio.nome,
          usuario_nome: usuarioNome || 'Anônimo',
          usuario_email: usuarioEmail || null,
          pontuacoes_dimensoes: pontuacoesDimensoes,
          interpretacao,
          recomendacoes,
          analise_completa: analisePAS,
          versao_teste: '1.0',
          timestamp_processamento: new Date().toISOString()
        }
      };
      
      console.log('🔍 [PAS-RESULTADOS] Dados preparados para salvar:', dadosResultado);
      console.log('🔍 [PAS-RESULTADOS] Chamando resultadosService.salvarResultado...');
      
      try {
        // Salvar no banco de dados
        console.log('🔍 [PAS-RESULTADOS] Tentando salvar resultado...');
        const resultadoSalvo = await resultadosService.salvarResultado(dadosResultado);
        console.log('🔍 [PAS-RESULTADOS] Resultado salvo com sucesso:', resultadoSalvo);
        console.log('🔍 [PAS-RESULTADOS] ID do resultado salvo:', resultadoSalvo.id);
        
        return {
          resultado: resultadoSalvo,
          analise: analisePAS
        };
        
      } catch (saveError) {
        console.error('❌ [PAS-RESULTADOS] Erro específico ao salvar:', saveError);
        console.error('❌ [PAS-RESULTADOS] Tipo do erro de salvamento:', typeof saveError);
        console.error('❌ [PAS-RESULTADOS] Nome do erro de salvamento:', saveError instanceof Error ? saveError.name : 'Unknown');
        console.error('❌ [PAS-RESULTADOS] Mensagem do erro de salvamento:', saveError instanceof Error ? saveError.message : String(saveError));
        console.error('❌ [PAS-RESULTADOS] Stack trace do salvamento:', saveError instanceof Error ? saveError.stack : 'No stack trace');
        throw saveError;
      }
      
    } catch (error) {
      console.error('❌ [PAS-RESULTADOS] Erro no processamento:', error);
      console.error('❌ [PAS-RESULTADOS] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }
  
  /**
   * Gera interpretação textual do resultado
   */
  private gerarInterpretacao(analise: ResultadoPercepacaoAssedio): string {
    const { percentualGeral, nivelRiscoGeral, classificacaoGeral } = analise;
    
    let interpretacao = `Seu resultado no teste de Percepção de Assédio foi de ${percentualGeral.toFixed(1)}%, classificado como "${classificacaoGeral}". `;
    
    // Análise por nível de risco
    switch (nivelRiscoGeral) {
      case 'Baixo Risco':
        interpretacao += "Excelente! Você percebe um ambiente de trabalho seguro e respeitoso, com baixos níveis de condutas abusivas.";
        break;
      case 'Risco Moderado':
        interpretacao += "Você percebe alguns sinais de condutas inadequadas no ambiente de trabalho que merecem atenção.";
        break;
      case 'Alto Risco':
        interpretacao += "Você está percebendo níveis preocupantes de condutas abusivas que podem estar impactando o bem-estar no trabalho.";
        break;
      case 'Risco Crítico':
        interpretacao += "Atenção! Você está percebendo níveis críticos de assédio que requerem intervenção imediata.";
        break;
    }
    
    // Destacar dimensões mais críticas
    const dimensoesCriticas = analise.dimensoes.filter(d => d.alertaCritico);
    if (dimensoesCriticas.length > 0) {
      interpretacao += ` As áreas que requerem maior atenção são: ${dimensoesCriticas.map(d => d.nome).join(', ')}.`;
    }
    
    return interpretacao;
  }
  
  /**
   * Gera recomendações baseadas no resultado
   */
  private gerarRecomendacoes(analise: ResultadoPercepacaoAssedio): string[] {
    const recomendacoes: string[] = [];
    
    // Recomendações gerais baseadas no nível de risco
    switch (analise.nivelRiscoGeral) {
      case 'Baixo Risco':
        recomendacoes.push('Mantenha as boas práticas de ambiente respeitoso');
        recomendacoes.push('Continue promovendo a cultura de respeito e inclusão');
        break;
      case 'Risco Moderado':
        recomendacoes.push('Reforce os canais de comunicação e denúncia');
        recomendacoes.push('Implemente treinamentos preventivos regulares');
        break;
      case 'Alto Risco':
        recomendacoes.push('Busque apoio dos canais de denúncia disponíveis');
        recomendacoes.push('Documente situações inadequadas quando possível');
        break;
      case 'Risco Crítico':
        recomendacoes.push('Procure apoio imediato através dos canais oficiais');
        recomendacoes.push('Considere buscar suporte psicológico especializado');
        break;
    }
    
    // Recomendações específicas por dimensão
    analise.dimensoes.forEach(dimensao => {
      if (dimensao.alertaCritico) {
        recomendacoes.push(...dimensao.recomendacoes);
      }
    });
    
    // Adicionar recomendações educativas e disciplinares do resultado
    recomendacoes.push(...analise.recomendacoesEducativas);
    if (analise.nivelRiscoGeral === 'Alto Risco' || analise.nivelRiscoGeral === 'Risco Crítico') {
      recomendacoes.push(...analise.recomendacoesDisciplinares);
    }
    
    return [...new Set(recomendacoes)]; // Remove duplicatas
  }
}

// Instância singleton do serviço
export const resultadosPercepacaoAssedioService = new ResultadosPercepacaoAssedioService();

// Funções exportadas para compatibilidade com imports existentes
export const salvarRespostaPercepacaoAssedio = (
  perguntaId: number,
  resposta: number,
  sessionId?: string
) => resultadosPercepacaoAssedioService.salvarRespostaPercepacaoAssedio(perguntaId, resposta, sessionId);

export const finalizarTestePercepacaoAssedio = (
  respostas: Record<number, number>,
  usuarioNome?: string,
  usuarioEmail?: string,
  tempoGasto?: number
) => resultadosPercepacaoAssedioService.finalizarTestePercepacaoAssedio(respostas, usuarioNome, usuarioEmail, tempoGasto);