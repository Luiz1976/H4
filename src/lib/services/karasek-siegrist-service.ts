// Serviço para integração do teste Karasek-Siegrist com o sistema
import { 
  calcularResultadoKarasekSiegrist, 
  dimensoesKarasekSiegrist,
  obterTodasPerguntasKS,
  infoTesteKarasekSiegrist,
  type ResultadoKarasekSiegrist 
} from '../testes/karasek-siegrist';
import { resultadosService } from '../database';
import { sessionService } from './session-service';
import type { Resultado, AnaliseResultado } from '../types';

export class KarasekSiegristService {
  /**
   * Processa as respostas do teste e salva no banco
   */
  async processarRespostas(
    usuarioId: string, 
    respostas: Record<number, number>,
    tempoGasto: number = 0
  ): Promise<{ resultado: Resultado; analise: AnaliseResultado }> {
    
    // Calcular resultado usando a função específica do teste
    const analiseKS = calcularResultadoKarasekSiegrist(respostas);
    
    // Obter session_id para persistência
    const sessionId = sessionService.getSessionId();
    
    // Preparar dados para salvar no banco (compatível com schema)
    const dadosResultado = {
      teste_id: infoTesteKarasekSiegrist.id,
      usuario_id: usuarioId || null,
      session_id: sessionId,
      pontuacao_total: analiseKS.riscoGeral.percentual,
      tempo_gasto: tempoGasto,
      data_realizacao: new Date().toISOString(),
      status: 'concluido' as const,
      metadados: {
        tipo_teste: 'karasek-siegrist',
        teste_nome: infoTesteKarasekSiegrist.nome,
        pontuacoes_dimensoes: this.formatarPontuacoesDimensoes(analiseKS),
        interpretacao: this.gerarInterpretacao(analiseKS),
        recomendacoes: this.gerarRecomendacoes(analiseKS),
        analise_completa: analiseKS,
        versao_teste: '1.0',
        timestamp_processamento: new Date().toISOString()
      }
    };
    
    // Salvar no banco
    const resultadoSalvo = await resultadosService.salvarResultado(dadosResultado);
    
    // Converter para formato de análise
    const analise = this.converterParaAnaliseResultado(analiseKS);
    
    return { resultado: resultadoSalvo, analise };
  }

  /**
   * Formatar pontuações das dimensões para o banco
   */
  private formatarPontuacoesDimensoes(analise: ResultadoKarasekSiegrist): Record<string, number> {
    const pontuacoes: Record<string, number> = {};
    
    Object.entries(analise.dimensoes).forEach(([dimensaoId, dados]) => {
      pontuacoes[dimensaoId] = dados.percentual;
    });
    
    return pontuacoes;
  }

  /**
   * Gera interpretação textual do resultado
   */
  private gerarInterpretacao(analise: ResultadoKarasekSiegrist): string {
    const { riscoGeral, hipercomprometimento } = analise;
    
    let interpretacao = `Seu resultado geral de Risco Psicossocial foi de ${riscoGeral.percentual}% ${riscoGeral.cor}, classificado como "${riscoGeral.classificacao}". `;
    
    // Análise por nível de risco geral
    switch (riscoGeral.nivel) {
      case 'baixo':
        interpretacao += "Parabéns! Você apresenta baixo risco psicossocial, indicando um ambiente de trabalho equilibrado e saudável.";
        break;
      case 'moderado':
        interpretacao += "Você apresenta risco psicossocial moderado, sugerindo alguns aspectos que merecem atenção para prevenção de problemas futuros.";
        break;
      case 'alto':
        interpretacao += "Você apresenta alto risco psicossocial, indicando condições de trabalho que podem estar impactando significativamente sua saúde e bem-estar.";
        break;
    }
    
    // Análise do hipercomprometimento
    interpretacao += ` Quanto ao hipercomprometimento, você apresenta ${hipercomprometimento.percentual}% ${hipercomprometimento.cor}`;
    
    if (hipercomprometimento.nivel === 'alto') {
      interpretacao += ", indicando sinais claros de desgaste ocupacional e vulnerabilidade ao burnout.";
    } else if (hipercomprometimento.nivel === 'moderado') {
      interpretacao += ", sugerindo necessidade de maior equilíbrio entre trabalho e vida pessoal.";
    } else {
      interpretacao += ", indicando bom equilíbrio entre comprometimento e bem-estar pessoal.";
    }
    
    // Destacar dimensões mais críticas
    const dimensoesCriticas = Object.entries(analise.dimensoes)
      .filter(([_, dados]) => dados.nivel === 'alto')
      .map(([dimensaoId, _]) => {
        const dimensao = dimensoesKarasekSiegrist.find(d => d.id === dimensaoId);
        return dimensao?.nome || dimensaoId;
      });
    
    if (dimensoesCriticas.length > 0) {
      interpretacao += ` As dimensões que requerem maior atenção são: ${dimensoesCriticas.join(', ')}.`;
    }
    
    return interpretacao;
  }

  /**
   * Gera recomendações baseadas no resultado
   */
  private gerarRecomendacoes(analise: ResultadoKarasekSiegrist): string[] {
    const recomendacoes: string[] = [];
    const { dimensoes, riscoGeral, hipercomprometimento } = analise;
    
    // Recomendações baseadas no risco geral
    if (riscoGeral.nivel === 'alto') {
      recomendacoes.push("Intervenção urgente com foco em redistribuição de carga, reconhecimento profissional e suporte emocional.");
      recomendacoes.push("Considere buscar apoio de profissionais de saúde ocupacional ou psicólogos organizacionais.");
    } else if (riscoGeral.nivel === 'moderado') {
      recomendacoes.push("Implemente estratégias preventivas para evitar o agravamento dos fatores de risco identificados.");
      recomendacoes.push("Monitore regularmente os indicadores de bem-estar no trabalho.");
    }
    
    // Recomendações específicas por dimensão
    Object.entries(dimensoes).forEach(([dimensaoId, dados]) => {
      if (dados.nivel === 'alto') {
        switch (dimensaoId) {
          case 'demanda-psicologica':
            recomendacoes.push("Reavalie a carga de trabalho e implemente estratégias de gestão do tempo e priorização de tarefas.");
            break;
          case 'controle-autonomia':
            recomendacoes.push("Busque maior participação nas decisões do trabalho e oportunidades de desenvolvimento de habilidades.");
            break;
          case 'apoio-social':
            recomendacoes.push("Fortaleça relacionamentos no trabalho e busque suporte da liderança e colegas.");
            break;
          case 'esforco-exigido':
            recomendacoes.push("Implemente técnicas de gestão do estresse e estabeleça limites claros entre trabalho e vida pessoal.");
            break;
          case 'recompensas-recebidas':
            recomendacoes.push("Dialogue com a gestão sobre reconhecimento, perspectivas de carreira e adequação salarial.");
            break;
          case 'hipercomprometimento':
            recomendacoes.push("Desenvolva estratégias de desconexão do trabalho e pratique técnicas de relaxamento e mindfulness.");
            break;
        }
      }
    });
    
    // Recomendações para hipercomprometimento
    if (hipercomprometimento.nivel === 'alto') {
      recomendacoes.push("Estabeleça limites claros entre trabalho e vida pessoal, evitando levar preocupações profissionais para casa.");
      recomendacoes.push("Pratique técnicas de relaxamento e desconexão, como meditação, exercícios físicos ou hobbies.");
    }
    
    // Recomendações gerais
    recomendacoes.push("Mantenha comunicação aberta com a liderança sobre condições de trabalho e bem-estar.");
    recomendacoes.push("Participe de programas de qualidade de vida no trabalho oferecidos pela organização.");
    
    return recomendacoes;
  }

  /**
   * Converte resultado KS para formato AnaliseResultado
   */
  private converterParaAnaliseResultado(analise: ResultadoKarasekSiegrist): AnaliseResultado {
    // Converter dimensões
    const dimensoesAnalise = Object.entries(analise.dimensoes).map(([dimensaoId, dados]) => {
      const dimensaoInfo = dimensoesKarasekSiegrist.find(d => d.id === dimensaoId);
      return {
        nome: dimensaoInfo?.nome || dimensaoId,
        pontuacao: dados.percentual,
        nivel: dados.nivel,
        descricao: dimensaoInfo?.descricao || '',
        interpretacao: `${dados.classificacao} (${dados.percentual}%) ${dados.cor}`
      };
    });
    
    return {
      pontuacao_geral: analise.riscoGeral.percentual,
      nivel: analise.riscoGeral.nivel,
      interpretacao: this.gerarInterpretacao(analise),
      recomendacoes: this.gerarRecomendacoes(analise),
      dimensoes: dimensoesAnalise,
      detalhes_adicionais: {
        risco_geral: analise.riscoGeral,
        hipercomprometimento: analise.hipercomprometimento,
        modelo_cientifico: "Karasek-Siegrist",
        data_avaliacao: new Date().toISOString()
      }
    };
  }

  /**
   * Salva uma resposta individual durante o teste
   */
  async salvarRespostaIndividual(perguntaId: number, valor: number): Promise<boolean> {
    try {
      // Obter session_id para identificar a sessão atual
      const sessionId = sessionService.getSessionId();
      
      console.log('🔍 [KARASEK-SERVICE] Salvando resposta individual:', { perguntaId, valor, sessionId });
      
      // Salvar no localStorage como backup (para desenvolvimento)
      const chaveStorage = `karasek_resposta_${sessionId}_${perguntaId}`;
      const respostaData = {
        pergunta_id: perguntaId,
        valor: valor,
        teste_id: infoTesteKarasekSiegrist.id,
        session_id: sessionId,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(chaveStorage, JSON.stringify(respostaData));
      
      // TODO: Implementar salvamento real no banco de dados
      // Por enquanto, apenas simular sucesso para não bloquear o fluxo
      // As respostas serão salvas quando o teste for finalizado
      
      console.log('✅ [KARASEK-SERVICE] Resposta salva localmente (banco será atualizado na finalização)');
      return true;
      
    } catch (error) {
      console.error('❌ [KARASEK-SERVICE] Erro ao salvar resposta individual:', error);
      return false;
    }
  }

  /**
   * Busca resultado específico do teste KS
   */
  async buscarResultado(resultadoId: string): Promise<AnaliseResultado | null> {
    try {
      const resultado = await resultadosService.buscarResultadoPorId(resultadoId);
      
      if (!resultado || resultado.teste_id !== infoTesteKarasekSiegrist.id) {
        return null;
      }
      
      // Reconstruir respostas
      const respostas: Record<number, number> = {};
      resultado.respostas.forEach(resposta => {
        respostas[resposta.pergunta_id] = resposta.valor;
      });
      
      // Recalcular análise
      const analiseKS = calcularResultadoKarasekSiegrist(respostas);
      return this.converterParaAnaliseResultado(analiseKS);
      
    } catch (error) {
      console.error('Erro ao buscar resultado KS:', error);
      return null;
    }
  }
}

// Instância singleton do serviço
export const karasekSiegristService = new KarasekSiegristService();