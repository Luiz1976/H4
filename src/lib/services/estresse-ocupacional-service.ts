// Serviço para integração do teste de Estresse Ocupacional com o sistema
import { 
  calcularResultadoEstresseOcupacional, 
  dimensoesEstresseOcupacional,
  obterTodasPerguntasEO,
  infoTesteEstresseOcupacional,
  type ResultadoEstresseOcupacional 
} from '../testes/estresse-ocupacional';
import { resultadosService } from '../database';
import { sessionService } from './session-service';
import type { Resultado, AnaliseResultado } from '../types';

export class EstresseOcupacionalService {
  
  /**
   * Processa as respostas do teste e salva no banco de dados
   */
  async processarResultado(
    respostas: Record<number, number>,
    usuarioNome?: string,
    usuarioEmail?: string,
    tempoGasto: number = 0
  ): Promise<{ resultado: Resultado; analise: ResultadoEstresseOcupacional }> {
    
    try {
      console.log('🔍 [ESTRESSE-SERVICE] Iniciando processamento do resultado');
      console.log('🔍 [ESTRESSE-SERVICE] Respostas recebidas:', respostas);
      console.log('🔍 [ESTRESSE-SERVICE] Número de respostas:', Object.keys(respostas).length);
      
      // Calcular resultado usando a função específica do teste
      console.log('🔍 [ESTRESSE-SERVICE] Calculando resultado...');
      const analiseEstresse = calcularResultadoEstresseOcupacional(respostas);
      console.log('🔍 [ESTRESSE-SERVICE] Análise calculada:', analiseEstresse);
      
      // Converter para o formato do banco de dados
      console.log('🔍 [ESTRESSE-SERVICE] Convertendo pontuações das dimensões...');
      const pontuacoesDimensoes: Record<string, number> = {};
      Object.entries(analiseEstresse.dimensoes).forEach(([dimensaoId, dados]) => {
        pontuacoesDimensoes[dimensaoId] = dados.media;
      });
      console.log('🔍 [ESTRESSE-SERVICE] Pontuações das dimensões:', pontuacoesDimensoes);
      
      // Gerar interpretação textual
      console.log('🔍 [ESTRESSE-SERVICE] Gerando interpretação...');
      const interpretacao = this.gerarInterpretacao(analiseEstresse);
      console.log('🔍 [ESTRESSE-SERVICE] Interpretação gerada:', interpretacao.substring(0, 100) + '...');
      
      // Gerar recomendações
      console.log('🔍 [ESTRESSE-SERVICE] Gerando recomendações...');
      const recomendacoes = this.gerarRecomendacoes(analiseEstresse);
      console.log('🔍 [ESTRESSE-SERVICE] Recomendações geradas:', recomendacoes.length, 'itens');
      
      // Obter session_id para persistência
      const sessionId = sessionService.getSessionId();
      console.log('🔍 [ESTRESSE-SERVICE] Session ID obtido:', sessionId);
      
      // Preparar dados para salvar no banco (compatível com schema)
      const dadosResultado = {
        teste_id: null, // NULL para testes que não estão na tabela testes (como estresse-ocupacional)
        usuario_id: usuarioEmail ? crypto.randomUUID() : null, // NULL para anônimos conforme schema
        session_id: sessionId, // Incluir session_id para persistência
        pontuacao_total: Math.round(analiseEstresse.indiceVulnerabilidade), // Usar índice de vulnerabilidade como pontuação total
        tempo_gasto: tempoGasto, // Campo correto conforme schema
        status: 'concluido' as const,
        metadados: {
          tipo_teste: 'estresse-ocupacional', // Identificar o tipo no metadados
          teste_nome: infoTesteEstresseOcupacional.nome,
          usuario_nome: usuarioNome || 'Anônimo',
          usuario_email: usuarioEmail || null,
          pontuacoes_dimensoes: pontuacoesDimensoes,
          interpretacao,
          recomendacoes,
          analise_completa: analiseEstresse,
          versao_teste: '1.0',
          timestamp_processamento: new Date().toISOString()
        }
      };
      
      console.log('🔍 [ESTRESSE-SERVICE] Dados preparados para salvar:', dadosResultado);
      console.log('🔍 [ESTRESSE-SERVICE] Chamando resultadosService.salvarResultado...');
      
      try {
        // Salvar no banco de dados
        console.log('🔍 [ESTRESSE-SERVICE] Tentando salvar resultado...');
        const resultadoSalvo = await resultadosService.salvarResultado(dadosResultado);
        console.log('🔍 [ESTRESSE-SERVICE] Resultado salvo com sucesso:', resultadoSalvo);
        console.log('🔍 [ESTRESSE-SERVICE] ID do resultado salvo:', resultadoSalvo.id);
        
        return {
          resultado: resultadoSalvo,
          analise: analiseEstresse
        };
        
      } catch (saveError) {
        console.error('❌ [ESTRESSE-SERVICE] Erro específico ao salvar:', saveError);
        console.error('❌ [ESTRESSE-SERVICE] Tipo do erro de salvamento:', typeof saveError);
        console.error('❌ [ESTRESSE-SERVICE] Nome do erro de salvamento:', saveError instanceof Error ? saveError.name : 'Unknown');
        console.error('❌ [ESTRESSE-SERVICE] Mensagem do erro de salvamento:', saveError instanceof Error ? saveError.message : String(saveError));
        console.error('❌ [ESTRESSE-SERVICE] Stack trace do salvamento:', saveError instanceof Error ? saveError.stack : 'No stack trace');
        throw saveError;
      }
      
    } catch (error) {
      console.error('❌ [ESTRESSE-SERVICE] Erro no processamento:', error);
      console.error('❌ [ESTRESSE-SERVICE] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }
  
  /**
   * Gera interpretação textual do resultado
   */
  private gerarInterpretacao(analise: ResultadoEstresseOcupacional): string {
    const { indiceVulnerabilidade, classificacaoGeral, nivelGeral } = analise;
    
    let interpretacao = `Seu Índice de Vulnerabilidade ao Estresse Ocupacional foi de ${indiceVulnerabilidade.toFixed(1)} pontos, classificado como "${classificacaoGeral}". `;
    
    // Análise por nível
    switch (nivelGeral) {
      case 'baixo':
        interpretacao += "Excelente! Você demonstra boa capacidade de lidar com o estresse ocupacional, com níveis baixos de burnout e boa resiliência.";
        break;
      case 'moderado':
        interpretacao += "Você apresenta níveis moderados de estresse ocupacional. É importante manter atenção aos sinais e implementar estratégias preventivas.";
        break;
      case 'alto':
        interpretacao += "Você está apresentando níveis elevados de estresse ocupacional que podem estar impactando seu bem-estar e desempenho.";
        break;
      case 'muito_alto':
        interpretacao += "Atenção! Seus níveis de estresse ocupacional estão muito elevados e requerem intervenção imediata para preservar sua saúde mental.";
        break;
    }
    
    // Destacar dimensões mais fortes e mais fracas
    const dimensoesOrdenadas = Object.entries(analise.dimensoes)
      .sort(([,a], [,b]) => {
        // Para estresse e burnout, menor é melhor; para resiliência e suporte, maior é melhor
        const dimensaoA = dimensoesEstresseOcupacional.find(d => d.id === a.dimensaoId);
        const dimensaoB = dimensoesEstresseOcupacional.find(d => d.id === b.dimensaoId);
        
        const isPositiveA = dimensaoA?.id === 'resiliencia' || dimensaoA?.id === 'suporte_social';
        const isPositiveB = dimensaoB?.id === 'resiliencia' || dimensaoB?.id === 'suporte_social';
        
        if (isPositiveA && !isPositiveB) return b.media - a.media;
        if (!isPositiveA && isPositiveB) return a.media - b.media;
        if (isPositiveA && isPositiveB) return b.media - a.media;
        return a.media - b.media;
      });
    
    if (dimensoesOrdenadas.length > 0) {
      const melhorDimensao = dimensoesOrdenadas[0];
      const piorDimensao = dimensoesOrdenadas[dimensoesOrdenadas.length - 1];
      
      const nomeMelhor = dimensoesEstresseOcupacional.find(d => d.id === melhorDimensao[0])?.nome;
      const nomePior = dimensoesEstresseOcupacional.find(d => d.id === piorDimensao[0])?.nome;
      
      interpretacao += ` Sua área mais forte é "${nomeMelhor}" (${melhorDimensao[1].media.toFixed(2)} pontos), enquanto "${nomePior}" apresenta maior necessidade de atenção (${piorDimensao[1].media.toFixed(2)} pontos).`;
    }
    
    return interpretacao;
  }
  
  /**
   * Gera recomendações baseadas no resultado
   */
  private gerarRecomendacoes(analise: ResultadoEstresseOcupacional): string[] {
    const recomendacoes: string[] = [];
    
    // Recomendações baseadas no nível geral
    switch (analise.nivelGeral) {
      case 'baixo':
        recomendacoes.push("Continue mantendo suas estratégias atuais de gerenciamento do estresse");
        recomendacoes.push("Considere compartilhar suas técnicas de bem-estar com colegas");
        recomendacoes.push("Mantenha práticas regulares de autocuidado e prevenção");
        break;
      case 'moderado':
        recomendacoes.push("Implemente técnicas de relaxamento e mindfulness no dia a dia");
        recomendacoes.push("Estabeleça limites claros entre trabalho e vida pessoal");
        recomendacoes.push("Busque atividades físicas regulares para reduzir o estresse");
        break;
      case 'alto':
        recomendacoes.push("Considere buscar apoio profissional de um psicólogo ou coach");
        recomendacoes.push("Reavalie sua carga de trabalho e prioridades profissionais");
        recomendacoes.push("Implemente pausas regulares durante o dia de trabalho");
        break;
      case 'muito_alto':
        recomendacoes.push("Procure ajuda profissional imediatamente - psicólogo ou psiquiatra");
        recomendacoes.push("Converse com RH sobre possíveis ajustes na função ou carga de trabalho");
        recomendacoes.push("Considere afastamento temporário se necessário para recuperação");
        break;
    }
    
    // Recomendações específicas por dimensão
    Object.entries(analise.dimensoes).forEach(([dimensaoId, dados]) => {
      switch (dimensaoId) {
        case 'estresse':
          if (dados.nivel === 'alto' || dados.nivel === 'muito_alto') {
            recomendacoes.push("Pratique técnicas de respiração e relaxamento muscular progressivo");
            recomendacoes.push("Identifique e modifique pensamentos negativos sobre o trabalho");
          }
          break;
        case 'burnout':
          if (dados.nivel === 'alto' || dados.nivel === 'muito_alto') {
            recomendacoes.push("Reconecte-se com o propósito e significado do seu trabalho");
            recomendacoes.push("Busque atividades que tragam satisfação pessoal fora do trabalho");
          }
          break;
        case 'resiliencia':
          if (dados.nivel === 'baixo' || dados.nivel === 'moderado') {
            recomendacoes.push("Desenvolva uma rede de apoio social sólida");
            recomendacoes.push("Pratique gratidão e foque nos aspectos positivos da vida");
          }
          break;
        case 'suporte_social':
          if (dados.nivel === 'baixo' || dados.nivel === 'moderado') {
            recomendacoes.push("Fortaleça relacionamentos com colegas e supervisores");
            recomendacoes.push("Participe de atividades em equipe e eventos sociais da empresa");
          }
          break;
      }
    });
    
    // Garantir que sempre há pelo menos algumas recomendações
    if (recomendacoes.length === 0) {
      recomendacoes.push("Mantenha monitoramento regular do seu bem-estar ocupacional");
      recomendacoes.push("Pratique autocuidado e técnicas de gerenciamento do estresse");
      recomendacoes.push("Busque equilíbrio entre demandas profissionais e recursos pessoais");
    }
    
    return recomendacoes.slice(0, 8); // Limitar a 8 recomendações
  }
  
  /**
   * Converte resultado do estresse ocupacional para AnaliseResultado (compatibilidade)
   */
  converterParaAnaliseResultado(analise: ResultadoEstresseOcupacional): AnaliseResultado {
    const dimensoes: Record<string, { pontuacao: number; percentil: number; interpretacao: string }> = {};
    
    Object.entries(analise.dimensoes).forEach(([dimensaoId, dados]) => {
      const dimensao = dimensoesEstresseOcupacional.find(d => d.id === dimensaoId);
      dimensoes[dimensaoId] = {
        pontuacao: dados.pontuacao,
        percentil: Math.round((dados.media / 5) * 100),
        interpretacao: `${dimensao?.nome}: ${dados.classificacao}`
      };
    });
    
    return {
      dimensoes,
      pontuacao_geral: analise.indiceVulnerabilidade,
      nivel: this.converterNivelParaAnalise(analise.nivelGeral),
      pontos_fortes: this.identificarPontosFortes(analise),
      areas_desenvolvimento: this.identificarAreasDesenvolvimento(analise)
    };
  }
  
  private converterNivelParaAnalise(nivel: string): 'baixo' | 'medio' | 'alto' {
    switch (nivel) {
      case 'baixo':
        return 'baixo';
      case 'moderado':
        return 'medio';
      case 'alto':
      case 'muito_alto':
        return 'alto';
      default:
        return 'medio';
    }
  }
  
  private identificarPontosFortes(analise: ResultadoEstresseOcupacional): string[] {
    const pontosFortes: string[] = [];
    
    Object.entries(analise.dimensoes).forEach(([dimensaoId, dados]) => {
      const dimensao = dimensoesEstresseOcupacional.find(d => d.id === dimensaoId);
      
      // Para resiliência e suporte social, níveis altos são pontos fortes
      if ((dimensaoId === 'resiliencia' || dimensaoId === 'suporte_social') && 
          (dados.nivel === 'alto' || dados.nivel === 'muito_alto')) {
        pontosFortes.push(dimensao?.nome || dimensaoId);
      }
      
      // Para estresse e burnout, níveis baixos são pontos fortes
      if ((dimensaoId === 'estresse' || dimensaoId === 'burnout') && 
          dados.nivel === 'baixo') {
        pontosFortes.push(`Baixo ${dimensao?.nome || dimensaoId}`);
      }
    });
    
    return pontosFortes.slice(0, 3);
  }
  
  private identificarAreasDesenvolvimento(analise: ResultadoEstresseOcupacional): string[] {
    const areasDesenvolvimento: string[] = [];
    
    Object.entries(analise.dimensoes).forEach(([dimensaoId, dados]) => {
      const dimensao = dimensoesEstresseOcupacional.find(d => d.id === dimensaoId);
      
      // Para estresse e burnout, níveis altos são áreas de desenvolvimento
      if ((dimensaoId === 'estresse' || dimensaoId === 'burnout') && 
          (dados.nivel === 'alto' || dados.nivel === 'muito_alto')) {
        areasDesenvolvimento.push(dimensao?.nome || dimensaoId);
      }
      
      // Para resiliência e suporte social, níveis baixos são áreas de desenvolvimento
      if ((dimensaoId === 'resiliencia' || dimensaoId === 'suporte_social') && 
          (dados.nivel === 'baixo' || dados.nivel === 'moderado')) {
        areasDesenvolvimento.push(dimensao?.nome || dimensaoId);
      }
    });
    
    return areasDesenvolvimento.slice(0, 3);
  }
}

// Instância singleton do serviço
export const estresseOcupacionalService = new EstresseOcupacionalService();