// Serviço para integração do teste de Clima Organizacional com o sistema
import { 
  calcularResultadoClimaOrganizacional, 
  dimensoesClimaOrganizacional,
  obterTodasPerguntas,
  infoTesteClimaOrganizacional,
  type ResultadoClimaOrganizacional 
} from '../testes/clima-organizacional';
import { resultadosService } from '../resultadosServiceNew';
import { sessionService } from './session-service';
import type { Resultado, AnaliseResultado } from '../types';

export class ClimaOrganizacionalService {
  
  /**
   * Processa as respostas do teste e salva no banco de dados
   */
  async processarResultado(
    respostas: Record<number, number>,
    usuarioNome?: string,
    usuarioEmail?: string,
    tempoGasto: number = 0,
    empresa_id?: string // Adicionar parâmetro empresa_id
  ): Promise<{ resultado: Resultado; analise: ResultadoClimaOrganizacional }> {
    
    try {
      console.log('🔍 [CLIMA-SERVICE] Iniciando processamento do resultado');
      console.log('🔍 [CLIMA-SERVICE] Respostas recebidas:', respostas);
      console.log('🔍 [CLIMA-SERVICE] Número de respostas:', Object.keys(respostas).length);
      
      // Calcular resultado usando a função específica do teste
      console.log('🔍 [CLIMA-SERVICE] Calculando resultado...');
      const analiseClima = calcularResultadoClimaOrganizacional(respostas);
      console.log('🔍 [CLIMA-SERVICE] Análise calculada:', analiseClima);
      
      // Converter para o formato do banco de dados
      console.log('🔍 [CLIMA-SERVICE] Convertendo pontuações das dimensões...');
      const pontuacoesDimensoes: Record<string, number> = {};
      Object.entries(analiseClima.dimensoes).forEach(([dimensaoId, dados]) => {
        pontuacoesDimensoes[dimensaoId] = dados.media;
      });
      console.log('🔍 [CLIMA-SERVICE] Pontuações das dimensões:', pontuacoesDimensoes);
      
      // Gerar interpretação textual
      console.log('🔍 [CLIMA-SERVICE] Gerando interpretação...');
      const interpretacao = this.gerarInterpretacao(analiseClima);
      console.log('🔍 [CLIMA-SERVICE] Interpretação gerada:', interpretacao.substring(0, 100) + '...');
      
      // Gerar recomendações
      console.log('🔍 [CLIMA-SERVICE] Gerando recomendações...');
      const recomendacoes = this.gerarRecomendacoes(analiseClima);
      console.log('🔍 [CLIMA-SERVICE] Recomendações geradas:', recomendacoes.length, 'itens');
      
      // Obter session_id para persistência
      const sessionId = sessionService.getSessionId();
      console.log('🔍 [CLIMA-SERVICE] Session ID obtido:', sessionId);
      
      // Preparar dados para salvar no banco (compatível com schema)
      // O backend buscará automaticamente o teste_id baseado no teste_nome
      const dadosResultado = {
        teste_id: null, // O backend buscará automaticamente o ID correto usando metadados.teste_nome
        usuario_id: usuarioEmail ? crypto.randomUUID() : null, // NULL para anônimos conforme schema
        session_id: sessionId, // Incluir session_id para persistência
        pontuacao_total: analiseClima.pontuacaoGeral, // Usar pontuação total calculada (soma das respostas)
        tempo_gasto: tempoGasto, // Campo correto conforme schema
        status: 'concluido' as const,
        metadados: {
          tipo_teste: 'clima-organizacional', // Identificar o tipo no metadados
          teste_nome: infoTesteClimaOrganizacional.nome,
          usuario_nome: usuarioNome || 'Anônimo',
          usuario_email: usuarioEmail || null,
          empresa_id: empresa_id || null, // Adicionar empresa_id aos metadados
          pontuacoes_dimensoes: pontuacoesDimensoes,
          interpretacao,
          recomendacoes,
          analise_completa: analiseClima,
          versao_teste: '1.0',
          timestamp_processamento: new Date().toISOString()
        }
      };
      
      console.log('🔍 [CLIMA-SERVICE] Dados preparados para salvar:', dadosResultado);
      console.log('🔍 [CLIMA-SERVICE] Chamando resultadosService.salvarResultado...');
      
      try {
        // Salvar no banco de dados
        console.log('🔍 [CLIMA-SERVICE] Tentando salvar resultado...');
        const resultadoSalvo = await resultadosService.salvarResultado(dadosResultado);
        console.log('🔍 [CLIMA-SERVICE] Resultado salvo com sucesso:', resultadoSalvo);
        
        if (!resultadoSalvo) {
          console.error('❌ [CLIMA-SERVICE] Resultado salvo é nulo ou indefinido');
          throw new Error('Falha ao salvar resultado: retorno nulo do banco de dados');
        }
        
        // Verificar se o objeto tem a propriedade 'id'
        if (!resultadoSalvo.id) {
          console.error('❌ [CLIMA-SERVICE] Resultado salvo não contém ID válido:', resultadoSalvo);
          throw new Error('Falha ao salvar resultado: ID não encontrado no retorno');
        }
        
        console.log('🔍 [CLIMA-SERVICE] ID do resultado salvo:', resultadoSalvo.id);
        
        return {
          resultado: resultadoSalvo,
          analise: analiseClima
        };
        
      } catch (saveError) {
        console.error('❌ [CLIMA-SERVICE] Erro específico ao salvar:', saveError);
        console.error('❌ [CLIMA-SERVICE] Tipo do erro de salvamento:', typeof saveError);
        console.error('❌ [CLIMA-SERVICE] Nome do erro de salvamento:', saveError instanceof Error ? saveError.name : 'Unknown');
        console.error('❌ [CLIMA-SERVICE] Mensagem do erro de salvamento:', saveError instanceof Error ? saveError.message : String(saveError));
        console.error('❌ [CLIMA-SERVICE] Stack trace do salvamento:', saveError instanceof Error ? saveError.stack : 'No stack trace');
        throw saveError;
      }
      
    } catch (error) {
      console.error('❌ [CLIMA-SERVICE] Erro no processamento:', error);
      console.error('❌ [CLIMA-SERVICE] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }
  
  /**
   * Gera interpretação textual do resultado
   */
  private gerarInterpretacao(analise: ResultadoClimaOrganizacional): string {
    const { mediaGeral, classificacaoGeral, nivelGeral } = analise;
    
    let interpretacao = `Seu resultado geral de Clima Organizacional foi de ${mediaGeral.toFixed(2)} pontos, classificado como "${classificacaoGeral}". `;
    
    // Análise por nível
    switch (nivelGeral) {
      case 'excelente':
        interpretacao += "Parabéns! Você percebe o ambiente organizacional de forma muito positiva, indicando alta satisfação e engajamento com a empresa.";
        break;
      case 'bom':
        interpretacao += "Você tem uma percepção positiva do ambiente organizacional, com bons níveis de satisfação e algumas oportunidades de melhoria.";
        break;
      case 'regular':
        interpretacao += "Sua percepção do clima organizacional é neutra, indicando que há aspectos positivos e negativos equilibrados no ambiente de trabalho.";
        break;
      case 'ruim':
        interpretacao += "Você percebe alguns desafios significativos no ambiente organizacional que podem estar impactando sua satisfação e produtividade.";
        break;
      case 'critico':
        interpretacao += "Sua percepção indica sérios problemas no clima organizacional que requerem atenção imediata da gestão.";
        break;
    }
    
    // Destacar dimensões mais fortes e mais fracas
    const dimensoesOrdenadas = Object.entries(analise.dimensoes)
      .sort(([,a], [,b]) => b.media - a.media);
    
    if (dimensoesOrdenadas.length > 0) {
      const melhorDimensao = dimensoesOrdenadas[0];
      const piorDimensao = dimensoesOrdenadas[dimensoesOrdenadas.length - 1];
      
      const nomeMelhor = dimensoesClimaOrganizacional.find(d => d.id === melhorDimensao[0])?.nome;
      const nomePior = dimensoesClimaOrganizacional.find(d => d.id === piorDimensao[0])?.nome;
      
      interpretacao += ` Sua dimensão mais forte é "${nomeMelhor}" (${melhorDimensao[1].media.toFixed(2)} pontos), enquanto "${nomePior}" apresenta maior oportunidade de melhoria (${piorDimensao[1].media.toFixed(2)} pontos).`;
    }
    
    return interpretacao;
  }
  
  /**
   * Gera recomendações baseadas no resultado
   */
  private gerarRecomendacoes(analise: ResultadoClimaOrganizacional): string[] {
    const recomendacoes: string[] = [];
    
    // Recomendações baseadas no nível geral
    switch (analise.nivelGeral) {
      case 'excelente':
        recomendacoes.push("Continue mantendo essa percepção positiva e seja um agente de mudança positiva para seus colegas");
        recomendacoes.push("Considere compartilhar suas experiências positivas com a liderança para replicar boas práticas");
        break;
      case 'bom':
        recomendacoes.push("Identifique oportunidades específicas de melhoria e dialogue com sua liderança sobre elas");
        recomendacoes.push("Mantenha o engajamento e contribua ativamente para melhorar o ambiente de trabalho");
        break;
      case 'regular':
        recomendacoes.push("Reflita sobre os aspectos que mais impactam sua satisfação no trabalho");
        recomendacoes.push("Busque feedback da liderança e colegas para entender diferentes perspectivas");
        break;
      case 'ruim':
        recomendacoes.push("Converse com sua liderança sobre os principais desafios identificados");
        recomendacoes.push("Considere buscar apoio de RH ou canais internos de comunicação");
        break;
      case 'critico':
        recomendacoes.push("É importante comunicar suas preocupações à liderança ou RH imediatamente");
        recomendacoes.push("Considere buscar apoio profissional se o ambiente estiver afetando seu bem-estar");
        break;
    }
    
    // Recomendações específicas por dimensão com baixa pontuação
    Object.entries(analise.dimensoes).forEach(([dimensaoId, dados]) => {
      if (dados.nivel === 'ruim' || dados.nivel === 'critico') {
        const dimensao = dimensoesClimaOrganizacional.find(d => d.id === dimensaoId);
        if (dimensao) {
          switch (dimensaoId) {
            case 'comunicacao':
              recomendacoes.push("Busque canais alternativos de comunicação e solicite clarificações quando necessário");
              break;
            case 'lideranca':
              recomendacoes.push("Agende conversas individuais com sua liderança para melhorar o relacionamento");
              break;
            case 'relacionamento':
              recomendacoes.push("Invista em construir relacionamentos mais próximos com colegas de trabalho");
              break;
            case 'reconhecimento':
              recomendacoes.push("Documente suas conquistas e comunique seus resultados à liderança");
              break;
            case 'desenvolvimento':
              recomendacoes.push("Procure oportunidades de capacitação e converse sobre seu plano de carreira");
              break;
            case 'condicoes':
              recomendacoes.push("Reporte problemas de infraestrutura e solicite melhorias nas condições de trabalho");
              break;
            case 'equilibrio':
              recomendacoes.push("Estabeleça limites claros entre trabalho e vida pessoal e comunique suas necessidades");
              break;
            case 'engajamento':
              recomendacoes.push("Reflita sobre seus valores e objetivos profissionais e busque alinhamento com a empresa");
              break;
          }
        }
      }
    });
    
    // Garantir que sempre há pelo menos algumas recomendações
    if (recomendacoes.length === 0) {
      recomendacoes.push("Continue monitorando sua percepção do ambiente de trabalho");
      recomendacoes.push("Mantenha diálogo aberto com liderança e colegas");
      recomendacoes.push("Busque oportunidades de contribuir para melhorias organizacionais");
    }
    
    return recomendacoes.slice(0, 6); // Limitar a 6 recomendações
  }
  
  /**
   * Converte resultado do clima organizacional para AnaliseResultado (compatibilidade)
   */
  converterParaAnaliseResultado(analise: ResultadoClimaOrganizacional): AnaliseResultado {
    const dimensoes: Record<string, { pontuacao: number; percentil: number; interpretacao: string }> = {};
    
    Object.entries(analise.dimensoes).forEach(([dimensaoId, dados]) => {
      const dimensao = dimensoesClimaOrganizacional.find(d => d.id === dimensaoId);
      dimensoes[dimensaoId] = {
        pontuacao: dados.pontuacao,
        percentil: Math.round((dados.media / 5) * 100),
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
      case 'critico':
      case 'ruim':
        return 'baixo';
      case 'regular':
        return 'medio';
      case 'bom':
      case 'excelente':
        return 'alto';
      default:
        return 'medio';
    }
  }
  
  private identificarPontosFortes(analise: ResultadoClimaOrganizacional): string[] {
    return Object.entries(analise.dimensoes)
      .filter(([, dados]) => dados.nivel === 'bom' || dados.nivel === 'excelente')
      .map(([dimensaoId]) => {
        const dimensao = dimensoesClimaOrganizacional.find(d => d.id === dimensaoId);
        return dimensao?.nome || dimensaoId;
      })
      .slice(0, 3);
  }
  
  private identificarAreasDesenvolvimento(analise: ResultadoClimaOrganizacional): string[] {
    return Object.entries(analise.dimensoes)
      .filter(([, dados]) => dados.nivel === 'ruim' || dados.nivel === 'critico' || dados.nivel === 'regular')
      .sort(([,a], [,b]) => a.media - b.media)
      .map(([dimensaoId]) => {
        const dimensao = dimensoesClimaOrganizacional.find(d => d.id === dimensaoId);
        return dimensao?.nome || dimensaoId;
      })
      .slice(0, 3);
  }
}

// Instância singleton do serviço
export const climaOrganizacionalService = new ClimaOrganizacionalService();