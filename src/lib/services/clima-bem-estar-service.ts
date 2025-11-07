// Serviço para integração do teste HumaniQ Insight – Clima Organizacional e Bem-Estar Psicológico
import { 
  calcularResultadoClimaBemEstar, 
  dimensoesClimaBemEstar,
  obterTodasPerguntasInsight,
  infoTesteClimaBemEstar,
  type ResultadoClimaBemEstar 
} from '../testes/clima-bem-estar';
import { resultadosService } from '../database';
import { sessionService } from './session-service';
import type { Resultado, AnaliseResultado } from '../types';

export class ClimaBemEstarService {
  /**
   * Salva uma resposta individual no banco de dados
   */
  async salvarRespostaIndividual(
    usuarioId: string,
    perguntaId: number,
    resposta: number,
    sessionId?: string
  ): Promise<void> {
    try {
      console.log(`[ClimaBemEstar] Salvando resposta individual - Pergunta: ${perguntaId}, Resposta: ${resposta}`);
      
      // Garantir que o session_id seja sempre um UUID v4 válido
      const candidate = sessionId || sessionService.getSessionId();
      const isValidUUIDv4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidate);
      const session = isValidUUIDv4 ? candidate : sessionService.getSessionId();
      console.log('[ClimaBemEstar] session_id usado para salvar resposta:', session);
      
      await resultadosService.salvarResposta({
        teste_id: infoTesteClimaBemEstar.id,
        usuario_id: usuarioId || null,
        session_id: session,
        pergunta_id: perguntaId,
        resposta: resposta,
        timestamp: new Date().toISOString()
      });
      
      console.log(`[ClimaBemEstar] Resposta individual salva com sucesso`);
    } catch (error) {
      console.error(`[ClimaBemEstar] Erro ao salvar resposta individual:`, error);
      throw new Error(`Falha ao salvar resposta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Processa o resultado completo do teste e salva no banco
   */
  async processarResultadoCompleto(
    usuarioId: string, 
    respostas: Record<number, number>,
    tempoGasto: number = 0,
    sessionId?: string
  ): Promise<{ resultado: Resultado; analise: AnaliseResultado }> {
    try {
      console.log(`[ClimaBemEstar] Iniciando processamento do resultado completo`);
      console.log(`[ClimaBemEstar] Total de respostas recebidas: ${Object.keys(respostas).length}`);
      
      // Calcular resultado usando a função específica do teste
      const analiseClima = calcularResultadoClimaBemEstar(respostas);
      console.log(`[ClimaBemEstar] Análise calculada:`, {
        pontuacaoGeral: analiseClima.pontuacaoGeral,
        nivelGeral: analiseClima.nivelGeral,
        classificacaoGeral: analiseClima.classificacaoGeral,
        totalDimensoes: Object.keys(analiseClima.dimensoes).length
      });
      
      // Obter session_id para persistência
      // Garantir que o session_id seja sempre um UUID v4 válido
      const candidate = sessionId || sessionService.getSessionId();
      const isValidUUIDv4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidate);
      const session = isValidUUIDv4 ? candidate : sessionService.getSessionId();
      console.log('[ClimaBemEstar] session_id usado para salvar resultado:', session);
      
      // Preparar dados para salvar no banco (compatível com schema)
      const dadosResultado = {
        teste_id: infoTesteClimaBemEstar.id,
        usuario_id: usuarioId || null,
        session_id: session,
        pontuacao_total: analiseClima.pontuacaoGeral,
        tempo_gasto: tempoGasto,
        data_realizacao: new Date().toISOString(),
        status: 'concluido' as const,
        metadados: {
          tipo_teste: infoTesteClimaBemEstar.id, // Usar UUID do teste
          teste_nome: infoTesteClimaBemEstar.nome,
          pontuacoes_dimensoes: this.formatarPontuacoesDimensoes(analiseClima),
          interpretacao: this.gerarInterpretacao(analiseClima),
          recomendacoes: this.gerarRecomendacoes(analiseClima),
          analise_completa: analiseClima,
          versao_teste: '1.0',
          timestamp_processamento: new Date().toISOString()
        }
      };
      
      console.log(`[ClimaBemEstar] Salvando resultado no banco de dados`);
      
      // Salvar no banco
      const resultadoSalvo = await resultadosService.salvarResultado(dadosResultado);
      
      console.log(`[ClimaBemEstar] Resultado salvo com ID: ${resultadoSalvo.id}`);
      
      // Converter para formato de análise
      const analise = this.converterParaAnaliseResultado(analiseClima);
      
      console.log(`[ClimaBemEstar] Processamento completo finalizado com sucesso`);
      
      return { resultado: resultadoSalvo, analise };
    } catch (error) {
      console.error(`[ClimaBemEstar] Erro no processamento do resultado completo:`, error);
      throw new Error(`Falha no processamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Formatar pontuações das dimensões para o banco
   */
  private formatarPontuacoesDimensoes(analise: ResultadoClimaBemEstar): Record<string, number> {
    const pontuacoes: Record<string, number> = {};
    
    Object.entries(analise.dimensoes).forEach(([dimensaoId, dados]) => {
      pontuacoes[dimensaoId] = dados.pontuacao;
    });
    
    return pontuacoes;
  }

  /**
   * Gera interpretação textual do resultado
   */
  private gerarInterpretacao(analise: ResultadoClimaBemEstar): string {
    let interpretacao = `Seu resultado geral de Clima Organizacional e Bem-Estar Psicológico foi de ${analise.pontuacaoGeral.toFixed(2)} pontos, classificado como "${analise.classificacaoGeral}". `;
    
    // Análise por nível geral
    switch (analise.nivelGeral) {
      case 'problematico':
        interpretacao += "Este resultado indica que há aspectos significativos do clima organizacional que podem estar impactando negativamente seu bem-estar psicológico no trabalho.";
        break;
      case 'neutro':
        interpretacao += "Você apresenta uma percepção moderada do clima organizacional, com alguns aspectos positivos e outros que podem ser melhorados.";
        break;
      case 'saudavel':
        interpretacao += "Excelente! Você percebe o clima organizacional como saudável e favorável ao seu bem-estar psicológico.";
        break;
    }
    
    // Destacar dimensões mais fortes e mais fracas
    const dimensoesOrdenadas = Object.entries(analise.dimensoes)
      .sort(([,a], [,b]) => b.pontuacao - a.pontuacao);
    
    if (dimensoesOrdenadas.length > 0) {
      const melhorDimensao = dimensoesOrdenadas[0];
      const piorDimensao = dimensoesOrdenadas[dimensoesOrdenadas.length - 1];
      
      const nomeMelhor = dimensoesClimaBemEstar.find(d => d.id === melhorDimensao[0])?.nome;
      const nomePior = dimensoesClimaBemEstar.find(d => d.id === piorDimensao[0])?.nome;
      
      interpretacao += ` Sua área mais forte é "${nomeMelhor}" (${melhorDimensao[1].pontuacao.toFixed(2)} pontos), enquanto "${nomePior}" apresenta maior necessidade de atenção (${piorDimensao[1].pontuacao.toFixed(2)} pontos).`;
    }
    
    return interpretacao;
  }

  /**
   * Gera recomendações baseadas no resultado
   */
  private gerarRecomendacoes(analise: ResultadoClimaBemEstar): string[] {
    const recomendacoes: string[] = [];
    
    // Recomendações baseadas no nível geral
    switch (analise.nivelGeral) {
      case 'saudavel':
        recomendacoes.push("Continue contribuindo para manter o clima organizacional positivo");
        recomendacoes.push("Compartilhe suas experiências positivas com colegas");
        recomendacoes.push("Mantenha práticas de bem-estar e autocuidado");
        break;
      case 'neutro':
        recomendacoes.push("Identifique oportunidades de melhoria no ambiente de trabalho");
        recomendacoes.push("Participe ativamente de iniciativas de melhoria organizacional");
        recomendacoes.push("Busque feedback regular sobre seu desempenho e bem-estar");
        break;
      case 'problematico':
        recomendacoes.push("Converse com RH ou liderança sobre suas preocupações");
        recomendacoes.push("Busque apoio de colegas e supervisores");
        recomendacoes.push("Considere estratégias de enfrentamento e autocuidado");
        break;
    }
    
    // Recomendações específicas por dimensão
    Object.entries(analise.dimensoes).forEach(([dimensaoId, dados]) => {
      if (dados.nivel === 'problematico') {
        switch (dimensaoId) {
          case 'seguranca-psicologica':
            recomendacoes.push("Busque criar um ambiente onde se sinta seguro para expressar opiniões");
            recomendacoes.push("Dialogue com liderança sobre a importância da segurança psicológica");
            break;
          case 'comunicacao-interna':
            recomendacoes.push("Participe ativamente de canais de comunicação da empresa");
            recomendacoes.push("Sugira melhorias nos processos de comunicação interna");
            break;
          case 'pertencimento-inclusao':
            recomendacoes.push("Envolva-se em atividades e grupos de trabalho");
            recomendacoes.push("Busque mentoria e oportunidades de networking interno");
            break;
          case 'justica-organizacional':
            recomendacoes.push("Documente situações que considera injustas");
            recomendacoes.push("Utilize canais formais para reportar preocupações sobre equidade");
            break;
        }
      }
    });
    
    // Garantir que sempre há pelo menos algumas recomendações
    if (recomendacoes.length === 0) {
      recomendacoes.push("Mantenha monitoramento regular do clima organizacional");
      recomendacoes.push("Pratique autocuidado e técnicas de bem-estar no trabalho");
      recomendacoes.push("Busque equilíbrio entre demandas profissionais e pessoais");
    }
    
    return recomendacoes.slice(0, 8); // Limitar a 8 recomendações
  }

  /**
   * Converte resultado do clima organizacional para AnaliseResultado (compatibilidade)
   */
  private converterParaAnaliseResultado(analise: ResultadoClimaBemEstar): AnaliseResultado {
    const dimensoes: Record<string, { pontuacao: number; percentil: number; interpretacao: string }> = {};
    
    Object.entries(analise.dimensoes).forEach(([dimensaoId, dados]) => {
      const dimensao = dimensoesClimaBemEstar.find(d => d.id === dimensaoId);
      dimensoes[dimensaoId] = {
        pontuacao: dados.pontuacao,
        percentil: Math.round((dados.pontuacao / 5) * 100),
        interpretacao: `${dimensao?.nome}: ${dados.classificacao}`
      };
    });
    
    return {
      dimensoes,
      pontuacao_geral: analise.pontuacaoGeral,
      nivel: this.converterNivelParaAnalise(analise.nivelGeral),
      pontos_fortes: this.identificarPontosFortes(analise),
      areas_desenvolvimento: this.identificarAreasDesenvolvimento(analise)
    };
  }

  private converterNivelParaAnalise(nivel: string): 'baixo' | 'medio' | 'alto' {
    switch (nivel) {
      case 'problematico':
        return 'baixo';
      case 'neutro':
        return 'medio';
      case 'saudavel':
        return 'alto';
      default:
        return 'medio';
    }
  }

  private identificarPontosFortes(analise: ResultadoClimaBemEstar): string[] {
    const pontosFortes: string[] = [];
    
    Object.entries(analise.dimensoes).forEach(([dimensaoId, dados]) => {
      const dimensao = dimensoesClimaBemEstar.find(d => d.id === dimensaoId);
      
      if (dados.nivel === 'saudavel') {
        pontosFortes.push(dimensao?.nome || dimensaoId);
      }
    });
    
    return pontosFortes.slice(0, 3);
  }

  private identificarAreasDesenvolvimento(analise: ResultadoClimaBemEstar): string[] {
    const areasDesenvolvimento: string[] = [];
    
    Object.entries(analise.dimensoes).forEach(([dimensaoId, dados]) => {
      const dimensao = dimensoesClimaBemEstar.find(d => d.id === dimensaoId);
      
      if (dados.nivel === 'problematico') {
        areasDesenvolvimento.push(dimensao?.nome || dimensaoId);
      }
    });
    
    return areasDesenvolvimento.slice(0, 3);
  }
}

// Instância singleton do serviço
export const climaBemEstarService = new ClimaBemEstarService();