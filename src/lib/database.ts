import { supabase, retryWithBackoff } from './supabase';
import type { Teste, Pergunta, Resultado, Resposta, AnaliseResultado } from './types';
import { climaOrganizacionalService } from './services/clima-organizacional-service';
import { karasekSiegristService } from './services/karasek-siegrist-service';
import { humaniQInsightService } from './services/humaniq-insight-service';
import { sessionService } from './services/session-service';
import { apiService } from '@/services/apiService';

// ==================== TESTES ====================

export const testesService = {
  // Buscar todos os testes ativos
  async buscarTestes(): Promise<Teste[]> {
    const { data, error } = await supabase
      .from('testes')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar testes:', error);
      throw new Error('Falha ao carregar testes');
    }

    return data || [];
  },

  // Buscar teste por ID
  async buscarTestePorId(id: string): Promise<Teste | null> {
    const { data, error } = await supabase
      .from('testes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar teste:', error);
      return null;
    }

    return data;
  },

  // Criar novo teste
  async criarTeste(teste: Omit<Teste, 'id' | 'created_at' | 'updated_at'>): Promise<Teste> {
    const { data, error } = await supabase
      .from('testes')
      .insert(teste)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar teste:', error);
      throw new Error('Falha ao criar teste');
    }

    return data;
  }
};

// ==================== PERGUNTAS ====================

export const perguntasService = {
  // Buscar perguntas de um teste
  async buscarPerguntasPorTeste(testeId: string): Promise<Pergunta[]> {
    const { data, error } = await supabase
      .from('perguntas')
      .select('*')
      .eq('teste_id', testeId)
      .order('ordem', { ascending: true });

    if (error) {
      console.error('Erro ao buscar perguntas:', error);
      throw new Error('Falha ao carregar perguntas');
    }

    return data || [];
  },

  // Criar nova pergunta
  async criarPergunta(pergunta: Omit<Pergunta, 'id' | 'created_at' | 'updated_at'>): Promise<Pergunta> {
    const { data, error } = await supabase
      .from('perguntas')
      .insert(pergunta)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar pergunta:', error);
      throw new Error('Falha ao criar pergunta');
    }

    return data;
  }
};

// ==================== RESULTADOS ====================

export const resultadosService = {
  // Salvar resultado de um teste usando API local
  async salvarResultado(resultado: Omit<Resultado, 'id' | 'data_realizacao'>): Promise<Resultado> {
    try {
      console.log('🔍 [DATABASE] Iniciando salvamento do resultado via API local');
      console.log('🔍 [DATABASE] Dados recebidos:', resultado);
      
      // Preparar dados no formato esperado pela API
      const dadosAPI = {
        testeId: resultado.teste_id || null,
        pontuacaoTotal: resultado.pontuacao_total,
        tempoGasto: resultado.tempo_gasto || 0,
        sessionId: resultado.session_id,
        metadados: resultado.metadados,
        status: resultado.status || 'concluido'
      };
      
      console.log('🔍 [DATABASE] Dados formatados para API:', dadosAPI);
      
      // Chamar API local usando o método correto
      const response = await apiService.salvarResultadoTeste(dadosAPI);
      console.log('✅ [DATABASE] Resposta da API:', response);
      
      // Retornar no formato esperado
      const resultadoItem = {
        ...resultado,
        id: response.id || sessionService.getSessionId(),
        data_realizacao: response.dataRealizacao || new Date().toISOString()
      };
      
      console.log('✅ [DATABASE] Resultado processado com sucesso via API local');
      return resultadoItem;
      
    } catch (error) {
      console.error('❌ [DATABASE] Erro ao salvar resultado via API:', error);
      console.error('❌ [DATABASE] Stack trace:', error instanceof Error ? error.stack : 'Sem stack trace');
      throw error;
    }
  },

  // Salvar uma resposta individual durante o teste
  async salvarResposta(resposta: {
    teste_id: string;
    usuario_id: string | null;
    session_id: string;
    pergunta_id: number;
    resposta: number;
    timestamp: string;
  }): Promise<void> {
    try {
      console.log('🔍 [DATABASE] Iniciando salvamento de resposta individual');
      console.log('📊 [DATABASE] Dados da resposta:', JSON.stringify(resposta, null, 2));
      
      // Garantir UUID v4 válido no session_id
      const isValidUUIDv4 = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
      let sessionIdToUse = resposta.session_id;
      if (!isValidUUIDv4(sessionIdToUse)) {
        const regenerated = sessionService.getSessionId();
        console.warn('⚠️ [DATABASE] session_id inválido ao salvar resposta. Substituindo por UUID v4:', {
          recebido: resposta.session_id,
          usando: regenerated
        });
        sessionIdToUse = regenerated;
      }
      
      // MIGRAÇÃO DE SUPABASE → API LOCAL
      // As respostas individuais são salvas em localStorage como backup
      // O resultado final será salvo via API local quando o teste for concluído
      const chaveStorage = `resposta_${sessionIdToUse}_${resposta.pergunta_id}`;
      const dadosResposta = {
        teste_id: resposta.teste_id,
        usuario_id: resposta.usuario_id,
        session_id: sessionIdToUse,
        pergunta_id: resposta.pergunta_id.toString(),
        resposta: resposta.resposta.toString(),
        pontuacao: resposta.resposta,
        tempo_resposta: null,
        created_at: resposta.timestamp
      };
      
      localStorage.setItem(chaveStorage, JSON.stringify(dadosResposta));
      
      console.log('✅ [DATABASE] Resposta individual salva no localStorage');
      console.log('📄 [DATABASE] Chave:', chaveStorage);
      
      // Nota: As respostas serão persistidas no banco de dados
      // quando o teste for finalizado, via apiService.submeterResultado()
      
    } catch (error) {
      console.error('❌ [DATABASE] Erro geral no salvamento da resposta:', error);
      console.error('🔍 [DATABASE] Tipo do erro:', typeof error);
      console.error('🔍 [DATABASE] Nome do erro:', error instanceof Error ? error.name : 'Unknown');
      console.error('🔍 [DATABASE] Mensagem do erro:', error instanceof Error ? error.message : String(error));
      console.error('🔍 [DATABASE] Stack trace:', error instanceof Error ? error.stack : 'Sem stack trace');
      
      throw error;
    }
  },

  // Função para verificar se um resultado específico existe e qual seu session_id
  async verificarResultadoPorId(id: string): Promise<{ existe: boolean; sessionId?: string; resultado?: any }> {
    try {
      console.log('🔍 [VERIFICAR-RESULTADO] Verificando resultado com ID:', id);
      
      const { data, error } = await supabase
        .from('resultados')
        .select(`
          *,
          testes!inner(
            id,
            nome,
            categoria,
            tempo_estimado
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ [VERIFICAR-RESULTADO] Erro ao buscar resultado:', error);
        return { existe: false };
      }

      if (!data) {
        console.log('❌ [VERIFICAR-RESULTADO] Resultado não encontrado');
        return { existe: false };
      }

      console.log('✅ [VERIFICAR-RESULTADO] Resultado encontrado:', {
        id: data.id,
        session_id: data.session_id,
        tipo_teste: data.testes?.nome,
        created_at: data.data_realizacao,
        pontuacao_total: data.pontuacao_total
      });

      return {
        existe: true,
        sessionId: data.session_id,
        resultado: data
      };
    } catch (error) {
      console.error('❌ [VERIFICAR-RESULTADO] Erro inesperado:', error);
      return { existe: false };
    }
  },

  // Buscar resultado específico por ID com respostas - MIGRADO PARA API LOCAL
  async buscarResultadoPorId(id: string): Promise<Resultado | null> {
    try {
      console.log('🔍 [BUSCAR-RESULTADO-POR-ID] ===== INICIANDO BUSCA VIA API LOCAL =====');
      console.log('🔍 [BUSCAR-RESULTADO-POR-ID] ID solicitado:', id);
      
      // Importar apiService para usar API local
      const { apiService } = await import('../services/apiService');
      
      // Fazer requisição à API local (autenticação feita automaticamente pelo backend)
      const response = await apiService.obterResultadoPorId(id);
      
      if (!response || !response.resultado) {
        console.log('❌ [BUSCAR-RESULTADO-POR-ID] Nenhum resultado encontrado para ID:', id);
        return null;
      }
      
      const data = response.resultado;
      
      console.log('✅ [BUSCAR-RESULTADO-POR-ID] Resultado encontrado!');
      console.log('🔍 [BUSCAR-RESULTADO-POR-ID] ID do resultado:', data.id);
      console.log('🔍 [BUSCAR-RESULTADO-POR-ID] teste_id:', data.testeId);
      console.log('🔍 [BUSCAR-RESULTADO-POR-ID] pontuacao_total:', data.pontuacaoTotal);
      console.log('🔍 [BUSCAR-RESULTADO-POR-ID] metadados existe?', !!data.metadados);
      
      // Mapear dados da API para o formato esperado pelo frontend
      const resultado = {
        id: data.id,
        session_id: data.sessionId,
        tipo_teste: data.metadados?.tipo_teste || null,
        created_at: data.dataRealizacao,
        pontuacao_total: data.pontuacaoTotal,
        teste_id: data.testeId,
        metadados: data.metadados || {},
        respostas: [],
        
        // Incluir campos extras se existirem nos metadados
        ...(data.metadados || {})
      };
      
      console.log('🔍 [BUSCAR-RESULTADO-POR-ID] ===== BUSCA CONCLUÍDA VIA API LOCAL =====');
      
      return resultado;
    } catch (error) {
      console.error('❌ [BUSCAR-RESULTADO-POR-ID] Erro inesperado:', error);
      console.error('❌ [BUSCAR-RESULTADO-POR-ID] Stack trace:', error instanceof Error ? error.stack : 'Sem stack trace');
      return null;
    }
  },

  // Buscar TODOS os resultados (de todas as sessões) - NOVA FUNÇÃO COM RPC
  async buscarTodosResultados(filtros?: {
    tipoTeste?: string;
    dataInicio?: string;
    dataFim?: string;
    pontuacaoMin?: number;
    pontuacaoMax?: number;
    busca?: string;
    limite?: number;
    offset?: number;
    userEmail?: string; // Filtrar por email do usuário autenticado
    empresa_id?: string; // Filtrar por empresa_id para que empresas vejam resultados de seus colaboradores
  }): Promise<{ resultados: Resultado[]; total: number }> {
    try {
      console.log('🔍 [BUSCAR-TODOS-RESULTADOS-RPC] Buscando todos os resultados via RPC');
      console.log('🔍 [BUSCAR-TODOS-RESULTADOS-RPC] Filtros aplicados:', filtros);

      // Usar a função RPC para evitar problemas de RLS
      const { data, error } = await supabase.rpc('buscar_todos_resultados_simples', {
        user_email_param: filtros?.userEmail || null,
        limite_param: filtros?.limite || 50,
        offset_param: filtros?.offset || 0
      });

      console.log('🔍 [BUSCAR-TODOS-RESULTADOS-RPC] RPC executada - dados brutos:', { data, error });

      if (error) {
        console.error('❌ [BUSCAR-TODOS-RESULTADOS-RPC] Erro na RPC:', {
          message: (error as any)?.message,
          code: (error as any)?.code,
          details: (error as any)?.details,
          hint: (error as any)?.hint
        });
        throw error;
      }

      if (!data) {
        console.log('⚠️ [BUSCAR-TODOS-RESULTADOS-RPC] Nenhum resultado encontrado');
        return { resultados: [], total: 0 };
      }

      // Aplicar filtros adicionais no lado do cliente (se necessário)
      let resultadosFiltrados = data;

      if (filtros?.tipoTeste) {
        const tipo = filtros.tipoTeste.toLowerCase();
        resultadosFiltrados = resultadosFiltrados.filter((resultado: any) => {
          const metadados = resultado.metadados || {};
          const testeNome = (metadados.teste_nome || '').toLowerCase();
          const tipoTeste = (metadados.tipo_teste || '').toLowerCase();
          return testeNome.includes(tipo) || tipoTeste.includes(tipo);
        });
      }

      if (filtros?.dataInicio) {
        const dataInicio = new Date(filtros.dataInicio);
        resultadosFiltrados = resultadosFiltrados.filter((resultado: any) => 
          new Date(resultado.data_realizacao) >= dataInicio
        );
      }

      if (filtros?.dataFim) {
        const dataFim = new Date(filtros.dataFim);
        resultadosFiltrados = resultadosFiltrados.filter((resultado: any) => 
          new Date(resultado.data_realizacao) <= dataFim
        );
      }

      if (filtros?.pontuacaoMin !== undefined) {
        resultadosFiltrados = resultadosFiltrados.filter((resultado: any) => 
          resultado.pontuacao_total >= filtros.pontuacaoMin!
        );
      }

      if (filtros?.pontuacaoMax !== undefined) {
        resultadosFiltrados = resultadosFiltrados.filter((resultado: any) => 
          resultado.pontuacao_total <= filtros.pontuacaoMax!
        );
      }

      if (filtros?.busca) {
        const busca = filtros.busca.toLowerCase();
        resultadosFiltrados = resultadosFiltrados.filter((resultado: any) => {
          const metadados = resultado.metadados || {};
          const observacoes = (metadados.observacoes || '').toLowerCase();
          return observacoes.includes(busca);
        });
      }

      console.log('✅ [BUSCAR-TODOS-RESULTADOS-RPC] Resultados encontrados:', resultadosFiltrados?.length || 0);
      
      // Processar resultados para garantir que tenham nome do teste
      console.log('🔍 [DEBUG] Dados brutos recebidos:', resultadosFiltrados?.length || 0);
      console.log('🔍 [DEBUG] Primeiros 3 resultados brutos:', JSON.stringify(resultadosFiltrados?.slice(0, 3), null, 2));
      
      const resultadosProcessados = (resultadosFiltrados || [])
        .map((resultado, index) => {
          console.log(`🔍 [DEBUG-MAP] Processando resultado ${index + 1}:`, {
            id: resultado.id,
            teste_id: resultado.teste_id,
            metadados_tipo_teste: resultado.metadados?.tipo_teste,
            metadados_teste_nome: resultado.metadados?.teste_nome
          });
          
          // Obter nome do teste dos metadados
          let nomeTeste = resultado.metadados?.teste_nome;
          
          if (!nomeTeste && resultado.metadados?.tipo_teste) {
            // Mapear tipos de teste conhecidos
            const tiposConhecidos: Record<string, string> = {
              'karasek-siegrist': 'HumaniQ - Karasek-Siegrist',
              'clima-organizacional': 'HumaniQ Clima Organizacional',
              'pas': 'Percepção de Assédio (PAS)',
              'rpo': 'Riscos Psicossociais Ocupacionais (RPO)',
              'qvt': 'Qualidade de Vida no Trabalho (QVT)',
              'estresse-ocupacional': 'Estresse Ocupacional',
              '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5': 'Clima e Bem-Estar',
              'mgrp': 'MGRP - Modelo de Gestão de Riscos Psicossociais'
            };
            nomeTeste = tiposConhecidos[resultado.metadados.tipo_teste] || resultado.metadados.tipo_teste;
            console.log(`🔍 [DEBUG-MAP] Nome obtido de tipo_teste: "${nomeTeste}"`);
          }
          
          const nomeTesteFinal = nomeTeste || 'Teste Desconhecido';
          console.log(`🔍 [DEBUG-MAP] Nome final para resultado ${resultado.id}: "${nomeTesteFinal}"`);
          
          return {
            ...resultado,
            testes: resultado.testes || { nome: nomeTesteFinal }
          };
        })
        .filter((resultado, index) => {
          const metadados = resultado.metadados || {};
          
          // Filtrar resultados marcados como deletados
          if (metadados.deleted === true) {
            console.log('🗑️ [BUSCAR-TODOS-RESULTADOS] Resultado deletado filtrado:', {
              id: resultado.id?.substring(0, 8),
              deleted_at: metadados.deleted_at,
              delete_reason: metadados.delete_reason
            });
            return false;
          }
          
          // Filtrar resultados sem teste válido
          const nomeTesteValido = resultado.testes?.nome;
          
          console.log(`🔍 [DEBUG-FILTER] Avaliando resultado ${index + 1} (ID: ${resultado.id}):`, {
            nome: nomeTesteValido,
            teste_id: resultado.teste_id,
            tipo_teste: resultado.metadados?.tipo_teste
          });
          
          // Excluir se:
          // 1. Nome é "Teste Desconhecido"
          // 2. teste_id é null E não tem tipo_teste válido nos metadados
          if (nomeTesteValido === 'Teste Desconhecido') {
            console.log('🚫 [FILTRO] Excluindo resultado "Teste Desconhecido":', resultado.id);
            return false;
          }
          
          if (!resultado.teste_id && !resultado.metadados?.tipo_teste) {
            console.log('🚫 [FILTRO] Excluindo resultado sem teste_id e sem tipo_teste:', resultado.id);
            return false;
          }
          
          console.log('✅ [FILTRO] Mantendo resultado real:', resultado.id, nomeTesteValido);
          return true;
        });

      console.log('🔍 [BUSCAR-TODOS-RESULTADOS] Resultados processados:', resultadosProcessados.length);
      resultadosProcessados.forEach(r => {
        console.log('  -', r.id, ':', r.testes?.nome, '(teste_id:', r.teste_id, ')');
      });

      console.log('✅ [BUSCAR-TODOS-RESULTADOS-RPC] Processamento concluído');
      console.log('✅ [BUSCAR-TODOS-RESULTADOS-RPC] Total final de resultados:', resultadosProcessados.length);

      return {
        resultados: resultadosProcessados,
        total: resultadosFiltrados.length
      };

    } catch (error) {
      console.error('❌ [BUSCAR-TODOS-RESULTADOS-RPC] Erro geral:', error);
      throw error;
    }
  },

  // Buscar resultados por sessão (principal função para persistência) - OTIMIZADA
  async buscarResultadosPorSessao(sessionId: string, filtros?: {
    tipoTeste?: string;
    dataInicio?: string;
    dataFim?: string;
    pontuacaoMin?: number;
    pontuacaoMax?: number;
    busca?: string;
    limite?: number;
    offset?: number;
  }): Promise<{ resultados: Resultado[]; total: number }> {
    try {
      console.log('🔍 [BUSCAR-POR-SESSAO] Buscando resultados para sessão:', sessionId);
      console.log('🔍 [BUSCAR-POR-SESSAO] Filtros aplicados:', filtros);
      
      let query = supabase
        .from('resultados')
        .select(`
          id,
          session_id,
          teste_id,
          pontuacao_total,
          tempo_gasto,
          data_realizacao,
          metadados,
          testes!inner(
            id,
            nome,
            categoria,
            tempo_estimado
          )
        `, { count: 'exact' })
        .eq('session_id', sessionId);

      // Aplicar filtros
      if (filtros?.tipoTeste) {
        query = query.eq('testes.nome', filtros.tipoTeste);
      }

      if (filtros?.dataInicio) {
        query = query.gte('data_realizacao', filtros.dataInicio);
      }

      if (filtros?.dataFim) {
        query = query.lte('data_realizacao', filtros.dataFim);
      }

      if (filtros?.pontuacaoMin !== undefined) {
        query = query.gte('pontuacao_total', filtros.pontuacaoMin);
      }

      if (filtros?.pontuacaoMax !== undefined) {
        query = query.lte('pontuacao_total', filtros.pontuacaoMax);
      }

      // Busca por texto nos metadados ou nome do teste
      if (filtros?.busca) {
        query = query.or(`testes.nome.ilike.%${filtros.busca}%,metadados->>'observacoes'.ilike.%${filtros.busca}%`);
      }

      // Ordenação e paginação otimizada
      query = query.order('data_realizacao', { ascending: false });

      if (filtros?.limite) {
        query = query.limit(filtros.limite);
      }

      if (filtros?.offset) {
        query = query.range(filtros.offset, (filtros.offset + (filtros.limite || 10)) - 1);
      }

      console.log('🔍 [BUSCAR-POR-SESSAO] Executando query...');
      const { data, error, count } = await query;

      console.log('🔍 [BUSCAR-POR-SESSAO] Resposta da query:', { data: data?.length, error, count });

      if (error) {
        console.error('❌ [BUSCAR-POR-SESSAO] Erro na query:', error);
        throw error;
      }

      console.log('✅ [BUSCAR-POR-SESSAO] Resultados encontrados:', data?.length || 0);
      console.log('✅ [BUSCAR-POR-SESSAO] Total de registros:', count);
      console.log('✅ [BUSCAR-POR-SESSAO] Dados retornados:', data);

      return {
        resultados: data || [],
        total: count || 0
      };

    } catch (error) {
      console.error('❌ [BUSCAR-POR-SESSAO] Erro geral:', error);
      throw error;
    }
  },

  // Buscar tipos de teste únicos para filtros
  async buscarTiposTeste(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('testes')
        .select('nome')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('❌ [TIPOS-TESTE] Erro ao buscar tipos:', error);
        throw new Error(`Falha ao carregar tipos de teste: ${error.message}`);
      }

      return data?.map(t => t.nome) || [];

    } catch (error) {
      console.error('❌ [TIPOS-TESTE] Erro geral:', error);
      throw error;
    }
  },

  // Buscar estatísticas de um teste
  async buscarEstatisticasTeste(testeId: string) {
    const { data, error } = await supabase
      .from('resultados')
      .select('pontuacao_total, tempo_gasto')
      .eq('teste_id', testeId);

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Falha ao carregar estatísticas');
    }

    if (!data || data.length === 0) {
      return {
        total_realizacoes: 0,
        media_pontuacao: 0,
        media_tempo: 0,
        distribuicao_pontuacoes: { baixo: 0, medio: 0, alto: 0 }
      };
    }

    const totalRealizacoes = data.length;
    const mediaPontuacao = data.reduce((acc, r) => acc + r.pontuacao_total, 0) / totalRealizacoes;
    const mediaTempo = data.reduce((acc, r) => acc + r.tempo_gasto, 0) / totalRealizacoes;

    // Distribuição de pontuações (assumindo escala 0-100)
    const distribuicao = data.reduce(
      (acc, r) => {
        if (r.pontuacao_total < 40) acc.baixo++;
        else if (r.pontuacao_total < 70) acc.medio++;
        else acc.alto++;
        return acc;
      },
      { baixo: 0, medio: 0, alto: 0 }
    );

    return {
      total_realizacoes: totalRealizacoes,
      media_pontuacao: Math.round(mediaPontuacao * 100) / 100,
      media_tempo: Math.round(mediaTempo * 100) / 100,
      distribuicao_pontuacoes: distribuicao
    };
  }
};

// ==================== RESPOSTAS ====================

export const respostasService = {
  // Salvar respostas de um resultado
  async salvarRespostas(respostas: Omit<Resposta, 'id' | 'created_at'>[]): Promise<Resposta[]> {
    const { data, error } = await supabase
      .from('respostas')
      .insert(respostas)
      .select();

    if (error) {
      console.error('Erro ao salvar respostas:', error);
      throw new Error('Falha ao salvar respostas');
    }

    return data || [];
  },

  // Buscar respostas por resultado
  async buscarRespostasPorResultado(resultadoId: string): Promise<Resposta[]> {
    const { data, error } = await supabase
      .from('respostas')
      .select('*')
      .eq('resultado_id', resultadoId);

    if (error) {
      console.error('Erro ao buscar respostas:', error);
      throw new Error('Falha ao carregar respostas');
    }

    return data || [];
  }
};

// ==================== ANÁLISE ====================

export const analiseService = {
  // Calcular análise de resultado
  calcularAnalise(respostas: Resposta[], perguntas: Pergunta[]): AnaliseResultado {
    // Lógica simplificada de análise - pode ser expandida conforme necessário
    const pontuacaoTotal = respostas.reduce((acc, resposta) => {
      const valor = typeof resposta.valor === 'number' ? resposta.valor : parseInt(resposta.valor) || 0;
      return acc + valor;
    }, 0);

    const pontuacaoMaxima = perguntas.length * 5; // Assumindo escala 1-5
    const percentual = (pontuacaoTotal / pontuacaoMaxima) * 100;

    let nivel: 'baixo' | 'medio' | 'alto';
    if (percentual < 40) nivel = 'baixo';
    else if (percentual < 70) nivel = 'medio';
    else nivel = 'alto';

    return {
      dimensoes: {
        geral: {
          pontuacao: pontuacaoTotal,
          percentil: Math.round(percentual),
          interpretacao: this.getInterpretacao(nivel)
        }
      },
      pontuacao_geral: pontuacaoTotal,
      nivel,
      pontos_fortes: this.getPontosFortes(nivel),
      areas_desenvolvimento: this.getAreasDesenvolvimento(nivel)
    };
  },

  getInterpretacao(nivel: 'baixo' | 'medio' | 'alto'): string {
    const interpretacoes = {
      baixo: 'Resultado indica necessidade de desenvolvimento em várias áreas.',
      medio: 'Resultado mostra um desempenho equilibrado com oportunidades de melhoria.',
      alto: 'Resultado demonstra excelente desempenho na maioria das áreas avaliadas.'
    };
    return interpretacoes[nivel];
  },

  getPontosFortes(nivel: 'baixo' | 'medio' | 'alto'): string[] {
    const pontos = {
      baixo: ['Disposição para aprender', 'Potencial de crescimento'],
      medio: ['Equilíbrio geral', 'Base sólida para desenvolvimento'],
      alto: ['Excelente desempenho', 'Competências bem desenvolvidas', 'Potencial de liderança']
    };
    return pontos[nivel];
  },

  getAreasDesenvolvimento(nivel: 'baixo' | 'medio' | 'alto'): string[] {
    switch (nivel) {
      case 'baixo': return ['Desenvolver estratégias de melhoria', 'Buscar capacitação'];
      case 'medio': return ['Manter consistência', 'Aprimorar pontos específicos'];
      case 'alto': return ['Manter excelência', 'Compartilhar boas práticas'];
      default: return [];
    }
  }
};

// ==================== PROCESSAMENTO UNIFICADO ====================

// Mapeamento de slugs para UUIDs dos testes no banco de dados
const TESTE_SLUG_TO_UUID: Record<string, string> = {
  'humaniq-insight': '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5',
  'clima-organizacional': '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5', // Mesmo teste
  'karasek-siegrist': '9b7d4c8e-1a2b-4f3e-9d7a-5e6f7a8b9c0d',
  'estresse-ocupacional': '2c8e3f9a-4b5d-6e7a-8c9d-0e1f2a3b4c5d',
  'pas': '4e0a5b1c-6d7f-8e9a-0f1a-2b3c4d5e6f7a',
  'mgrp': '5f1a6c2d-7e8f-9a0b-1c2d-3e4f5a6b7c8d'
};

export const processamentoService = {
  /**
   * Processa respostas de qualquer teste usando o service apropriado
   */
  async processarTesteCompleto(
    testeId: string,
    respostas: Record<number, number>,
    usuarioNome?: string,
    usuarioEmail?: string,
    tempoGasto: number = 0
  ): Promise<{ resultado: Resultado; analise: AnaliseResultado }> {
    
    // Validações básicas
    if (!testeId || !respostas || Object.keys(respostas).length === 0) {
      throw new Error('Dados inválidos para processamento');
    }

    // Converter slug para UUID se necessário
    const testeSlug = testeId; // Guardar o slug original para o switch
    const testeUUID = TESTE_SLUG_TO_UUID[testeId] || testeId; // Converter para UUID se existir no mapa
    
    console.log('🔍 [PROCESSAMENTO] Slug recebido:', testeSlug);
    console.log('🔍 [PROCESSAMENTO] UUID do teste:', testeUUID);

    try {
      // Determinar qual service usar baseado no teste (usar slug original)
      switch (testeSlug) {
        case 'clima-organizacional':
          const resultadoClima = await climaOrganizacionalService.processarResultado(
            respostas, usuarioNome, usuarioEmail, tempoGasto
          );
          return {
            resultado: resultadoClima.resultado,
            analise: climaOrganizacionalService.converterParaAnaliseResultado(resultadoClima.analise)
          };

        case 'karasek-siegrist':
          const usuarioId = usuarioEmail || crypto.randomUUID();
          const resultadoKS = await karasekSiegristService.processarRespostas(usuarioId, respostas);
          return resultadoKS;

        case 'humaniq-insight':
          console.log('🔍 [DATABASE] Processando teste HumaniQ Insight');
          console.log('🔍 [DATABASE] UUID do teste:', testeUUID);
          const resultadoHumaniQ = await humaniQInsightService.processarResultado(
            respostas,
            usuarioNome,
            usuarioEmail,
            tempoGasto,
            testeUUID // Passar o UUID em vez do slug
          );
          return resultadoHumaniQ;

        default:
          // Para testes que ainda não têm service específico, usar processamento genérico
          return await this.processarTesteGenerico(testeUUID, respostas, usuarioNome, usuarioEmail, tempoGasto);
      }
    } catch (error) {
      console.error('❌ [DATABASE] Erro ao processar teste:', error);
      console.error('❌ [DATABASE] Tipo do erro:', typeof error);
      console.error('❌ [DATABASE] Nome do erro:', error instanceof Error ? error.name : 'Unknown');
      console.error('❌ [DATABASE] Mensagem do erro:', error instanceof Error ? error.message : String(error));
      console.error('❌ [DATABASE] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Re-throw o erro original em vez de mascarar
      throw error;
    }
  },

  /**
   * Processamento genérico para testes sem service específico
   */
  async processarTesteGenerico(
    testeId: string,
    respostas: Record<number, number>,
    usuarioNome?: string,
    usuarioEmail?: string,
    tempoGasto: number = 0
  ): Promise<{ resultado: Resultado; analise: AnaliseResultado }> {
    
    // Buscar informações do teste
    const teste = await testesService.buscarTestePorId(testeId);
    if (!teste) {
      throw new Error('Teste não encontrado');
    }

    // Buscar perguntas do teste
    const perguntas = await perguntasService.buscarPerguntasPorTeste(testeId);
    
    // Calcular pontuação total simples
    const valores = Object.values(respostas);
    const pontuacaoTotal = Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 20);
    
    // Obter session_id para persistência
    const sessionId = sessionService.getSessionId();
    
    // CORREÇÃO: Garantir que usuario_id seja sempre preenchido baseado no usuário autenticado
    let usuarioIdFinal: string | null = null;
    
    // Tentar obter usuário autenticado
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      usuarioIdFinal = currentUser.id;
      console.log('🔍 [PROCESSAMENTO-GENERICO] Usuário autenticado encontrado:', {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role
      });
    } else {
      console.warn('⚠️ [PROCESSAMENTO-GENERICO] Nenhum usuário autenticado encontrado');
    }
    
    // Se não temos usuario_id do auth, usar o email como fallback (compatibilidade)
    if (!usuarioIdFinal && usuarioEmail) {
      usuarioIdFinal = usuarioEmail;
      console.log('🔍 [PROCESSAMENTO-GENERICO] Usando email como usuario_id (fallback):', usuarioEmail);
    }
    
    // Criar resultado
    const dadosResultado: Omit<Resultado, 'id' | 'data_realizacao'> = {
      teste_id: testeId,
      usuario_id: usuarioIdFinal, // Usar o ID real do usuário autenticado
      session_id: sessionId,
      pontuacao_total: pontuacaoTotal,
      tempo_gasto: tempoGasto,
      status: 'concluido',
      metadados: {
        tipo_teste: testeId,
        teste_nome: teste.nome,
        usuario_nome: usuarioNome,
        usuario_email: usuarioEmail,
        usuario_id_auth: usuarioIdFinal, // Manter referência ao ID real do usuário
        pontuacoes_dimensoes: {},
        interpretacao: analiseService.getInterpretacao(
          pontuacaoTotal < 40 ? 'baixo' : pontuacaoTotal < 70 ? 'medio' : 'alto'
        ),
        recomendacoes: analiseService.getAreasDesenvolvimento(
          pontuacaoTotal < 40 ? 'baixo' : pontuacaoTotal < 70 ? 'medio' : 'alto'
        ),
        versao_teste: '1.0',
        timestamp_processamento: new Date().toISOString()
      }
    };

    // Salvar resultado
    const resultado = await resultadosService.salvarResultado(dadosResultado);

    // Salvar respostas individuais
    const respostasArray: Omit<Resposta, 'id' | 'created_at'>[] = Object.entries(respostas).map(([perguntaId, valor]) => ({
      resultado_id: resultado.id,
      pergunta_id: parseInt(perguntaId),
      valor
    }));

    await respostasService.salvarRespostas(respostasArray);

    // Gerar análise
    const analise = analiseService.calcularAnalise(respostasArray as Resposta[], perguntas);

    return { resultado, analise };
  }
};