import { 
  calcularResultadoHumaniQInsight, 
  ResultadoHumaniQInsight,
  dimensoesHumaniQInsight,
  classificacaoMedia
} from '@/lib/testes/humaniq-insight';
import { resultadosService } from '@/lib/resultadosServiceNew';
import { sessionService } from './session-service';

export interface Resultado {
  id: string;
  teste_id: string | null;
  usuario_id: string | null;
  session_id: string;
  pontuacao_total: number;
  tempo_gasto: number;
  status: string;
  metadados: any;
  data_realizacao: Date;
}

class HumaniQInsightService {
  
  /**
   * Processa as respostas do teste e salva no banco de dados
   */
  async processarResultado(
    respostas: Record<number, number>,
    usuarioNome?: string,
    usuarioEmail?: string,
    tempoGasto: number = 0,
    testeId?: string // Adicionar o parâmetro testeId
  ): Promise<{ resultado: Resultado; analise: ResultadoHumaniQInsight }> {
    
    try {
      console.log('🔍 [HUMANIQ-INSIGHT-SERVICE] Iniciando processamento do resultado');
      console.log('🔍 [HUMANIQ-INSIGHT-SERVICE] Teste ID recebido:', testeId);
      console.log('🔍 [HUMANIQ-INSIGHT-SERVICE] Respostas recebidas:', respostas);
      console.log('🔍 [HUMANIQ-INSIGHT-SERVICE] Número de respostas:', Object.keys(respostas).length);
      
      // Calcular resultado usando a função específica do teste
      console.log('🔍 [HUMANIQ-INSIGHT-SERVICE] Calculando resultado...');
      const analiseHumaniQInsight = calcularResultadoHumaniQInsight(respostas);
      console.log('🔍 [HUMANIQ-INSIGHT-SERVICE] Análise calculada:', analiseHumaniQInsight);
      
      // Converter para o formato do banco de dados (compatível com agregação do backend)
      console.log('🔍 [HUMANIQ-INSIGHT-SERVICE] Convertendo pontuações das dimensões...');
      const pontuacoesDimensoes: Record<string, number> = {};
      const dimensoesParaBackend: Record<string, { percentual: number; media: number; pontuacao: number }> = {};
      
      Object.entries(analiseHumaniQInsight.dimensoes).forEach(([dimensaoId, dados]) => {
        pontuacoesDimensoes[dimensaoId] = dados.media;
        
        // Formato para agregação do backend (percentual de 0-100)
        dimensoesParaBackend[dimensaoId] = {
          percentual: (dados.media / 5) * 100, // Converter escala 1-5 para 0-100
          media: dados.media,
          pontuacao: dados.pontuacaoTotal
        };
      });
      console.log('🔍 [HUMANIQ-INSIGHT-SERVICE] Pontuações das dimensões:', pontuacoesDimensoes);
      console.log('🔍 [HUMANIQ-INSIGHT-SERVICE] Dimensões formatadas para backend:', dimensoesParaBackend);
      
      // Gerar interpretação textual
      console.log('🔍 [HUMANIQ-INSIGHT-SERVICE] Gerando interpretação...');
      const interpretacao = this.gerarInterpretacao(analiseHumaniQInsight);
      console.log('🔍 [HUMANIQ-INSIGHT-SERVICE] Interpretação gerada:', interpretacao.substring(0, 100) + '...');
      
      // Gerar recomendações
      console.log('🔍 [HUMANIQ-INSIGHT-SERVICE] Gerando recomendações...');
      const recomendacoes = this.gerarRecomendacoes(analiseHumaniQInsight);
      console.log('🔍 [HUMANIQ-INSIGHT-SERVICE] Recomendações geradas:', recomendacoes.length, 'itens');
      
      // Gerar alertas críticos baseados nas dimensões problemáticas
      const alertasCriticos: string[] = [];
      Object.entries(analiseHumaniQInsight.dimensoes).forEach(([dimensaoId, dados]) => {
        if (dados.nivel === 'problematico') {
          const dimensaoInfo = dimensoesHumaniQInsight.find(d => d.id === dimensaoId);
          if (dimensaoInfo) {
            alertasCriticos.push(`${dimensaoInfo.nome}: Nível crítico (${dados.media.toFixed(2)}/5.00)`);
          }
        }
      });
      console.log('🔍 [HUMANIQ-INSIGHT-SERVICE] Alertas críticos gerados:', alertasCriticos.length, 'itens');
      
      // Obter session_id para persistência
      const sessionId = sessionService.getSessionId();
      console.log('🔍 [HUMANIQ-INSIGHT-SERVICE] Session ID obtido:', sessionId);
      
      // Preparar dados para salvar no banco
      const dadosResultado = {
        teste_id: testeId || null, // Usar o testeId passado ou null
        usuario_id: usuarioEmail ? crypto.randomUUID() : null,
        session_id: sessionId,
        pontuacao_total: analiseHumaniQInsight.pontuacaoGeral,
        tempo_gasto: tempoGasto,
        status: 'concluido',
        user_email: usuarioEmail,
        metadados: {
          teste_nome: 'HumaniQ Insight',
          tipo_teste: 'humaniq-insight',
          usuario_nome: usuarioNome,
          usuario_email: usuarioEmail,
          pontuacoes_dimensoes: pontuacoesDimensoes,
          // Formato compatível com agregação do backend (estado-psicossocial e PRG)
          analise_completa: {
            ...analiseHumaniQInsight,
            dimensoes: dimensoesParaBackend // Dimensões no formato esperado pelo backend
          },
          interpretacao: interpretacao,
          recomendacoes: recomendacoes,
          alertas_criticos: alertasCriticos, // Alertas para serem agregados
          versao_teste: '1.0',
          data_calculo: new Date().toISOString()
        }
      };
      
      console.log('🔍 [HUMANIQ-INSIGHT-SERVICE] Dados preparados para salvamento:', {
        session_id: dadosResultado.session_id,
        pontuacao_total: dadosResultado.pontuacao_total,
        status: dadosResultado.status,
        metadados_keys: Object.keys(dadosResultado.metadados)
      });
      
      // Salvar no banco de dados
      console.log('🔍 [HUMANIQ-INSIGHT-SERVICE] Salvando resultado no banco...');
      const resultadoSalvo = await resultadosService.salvarResultado(dadosResultado);
      console.log('✅ [HUMANIQ-INSIGHT-SERVICE] Resultado salvo com sucesso:', resultadoSalvo);
      
      return {
        resultado: resultadoSalvo as unknown as Resultado,
        analise: analiseHumaniQInsight
      };
      
    } catch (error) {
      console.error('❌ [HUMANIQ-INSIGHT-SERVICE] Erro no processamento:', error);
      console.error('❌ [HUMANIQ-INSIGHT-SERVICE] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }
  
  /**
   * Gera interpretação textual do resultado
   */
  private gerarInterpretacao(analise: ResultadoHumaniQInsight): string {
    const { mediaGeral, nivelGeral, dimensoes } = analise;
    
    let interpretacao = `## Análise HumaniQ Insight\n\n`;
    interpretacao += `**Pontuação Geral:** ${mediaGeral.toFixed(2)}/5.00\n`;
    interpretacao += `**Classificação:** ${classificacaoMedia[nivelGeral].label}\n\n`;
    
    interpretacao += `### Visão Geral\n\n`;
    
    if (nivelGeral === 'saudavel') {
      interpretacao += `Sua organização apresenta um clima organizacional **positivo e saudável**. `;
      interpretacao += `O ambiente de trabalho demonstra bons níveis de segurança psicológica, comunicação, pertencimento e justiça organizacional. `;
      interpretacao += `Isso favorece o bem-estar, a motivação e o engajamento dos colaboradores.\n\n`;
    } else if (nivelGeral === 'moderado') {
      interpretacao += `Sua organização apresenta um clima organizacional **moderado**. `;
      interpretacao += `Existem aspectos positivos, mas também oportunidades significativas de melhoria em áreas como segurança psicológica, `;
      interpretacao += `comunicação interna, pertencimento e justiça organizacional.\n\n`;
    } else {
      interpretacao += `Sua organização apresenta um clima organizacional **problemático** que requer atenção urgente. `;
      interpretacao += `Os resultados indicam desafios significativos que podem estar impactando negativamente o bem-estar, `;
      interpretacao += `a motivação e o engajamento dos colaboradores.\n\n`;
    }
    
    interpretacao += `### Análise por Dimensão\n\n`;
    
    Object.entries(dimensoes).forEach(([dimensaoId, dados]) => {
      const dimensaoInfo = dimensoesHumaniQInsight.find(d => d.id === dimensaoId);
      if (dimensaoInfo) {
        interpretacao += `**${dimensaoInfo.nome}:** ${dados.media.toFixed(2)}/5.00 - ${dados.classificacao}\n`;
        interpretacao += `*${dimensaoInfo.descricao}*\n\n`;
      }
    });
    
    return interpretacao;
  }
  
  /**
   * Gera recomendações específicas baseadas no resultado
   */
  private gerarRecomendacoes(analise: ResultadoHumaniQInsight): string[] {
    const recomendacoes: string[] = [];
    const { dimensoes } = analise;
    
    // Recomendações por dimensão
    Object.entries(dimensoes).forEach(([dimensaoId, dados]) => {
      const dimensaoInfo = dimensoesHumaniQInsight.find(d => d.id === dimensaoId);
      
      if (dimensaoInfo && dados.nivel === 'problematico') {
        if (dimensaoId === 'seguranca-psicologica') {
          recomendacoes.push('Promover treinamentos sobre segurança psicológica para líderes e equipes');
          recomendacoes.push('Criar canais seguros e anônimos para compartilhamento de ideias e preocupações');
          recomendacoes.push('Estabelecer cultura de aprendizado com erros, sem punições');
        } else if (dimensaoId === 'comunicacao-interna') {
          recomendacoes.push('Implementar canais de comunicação mais claros e acessíveis');
          recomendacoes.push('Estabelecer reuniões regulares de feedback e alinhamento');
          recomendacoes.push('Treinar lideranças em comunicação empática e transparente');
        } else if (dimensaoId === 'pertencimento') {
          recomendacoes.push('Desenvolver programas de integração e valorização da diversidade');
          recomendacoes.push('Promover eventos e atividades que fortaleçam o espírito de equipe');
          recomendacoes.push('Criar práticas de reconhecimento e celebração de conquistas');
        } else if (dimensaoId === 'justica-organizacional') {
          recomendacoes.push('Revisar e comunicar claramente políticas e procedimentos organizacionais');
          recomendacoes.push('Implementar processos transparentes de avaliação e reconhecimento');
          recomendacoes.push('Estabelecer mecanismos justos e eficazes de resolução de conflitos');
        }
      }
    });
    
    // Recomendações gerais
    if (analise.nivelGeral === 'problematico') {
      recomendacoes.push('Realizar diagnóstico detalhado com grupos focais e entrevistas');
      recomendacoes.push('Desenvolver plano de ação prioritário com metas mensuráveis');
      recomendacoes.push('Considerar apoio de consultoria especializada em clima organizacional');
    } else if (analise.nivelGeral === 'moderado') {
      recomendacoes.push('Focar nas dimensões com menor pontuação para melhorias direcionadas');
      recomendacoes.push('Manter ações preventivas nas áreas já positivas');
      recomendacoes.push('Estabelecer indicadores de acompanhamento contínuo');
    } else {
      recomendacoes.push('Manter práticas que sustentam o clima positivo');
      recomendacoes.push('Compartilhar boas práticas com outras áreas ou unidades');
      recomendacoes.push('Realizar avaliações periódicas para monitoramento contínuo');
    }
    
    return recomendacoes;
  }
}

export const humaniQInsightService = new HumaniQInsightService();
