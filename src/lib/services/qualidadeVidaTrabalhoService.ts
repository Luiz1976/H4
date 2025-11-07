// Serviço para integração do teste de Qualidade de Vida no Trabalho com o sistema
import { 
  calcularResultadoQVT, 
  configQualidadeVidaTrabalho,
  type ResultadoQVT 
} from '../testes/qualidade-vida-trabalho';
import { supabase } from '../supabase';
import { obterSessaoAtual } from './session-service';
import { authService } from '../../services/authService';
import { apiService } from '../../services/apiService';
import type { Pergunta } from '../types';

// Função auxiliar para classificar nível QVT
function classificarNivelQVT(pontuacao: number): string {
  if (pontuacao >= 4.5) return 'Excelente';
  if (pontuacao >= 4.0) return 'Muito Bom';
  if (pontuacao >= 3.5) return 'Bom';
  if (pontuacao >= 2.5) return 'Regular';
  if (pontuacao >= 2.0) return 'Ruim';
  return 'Crítico';
}

export interface PerguntaQVT extends Pergunta {
  opcoes: Array<{
    valor: number;
    texto: string;
    cor: string;
  }>;
}

/**
 * Escala de respostas padrão para o teste QVT
 */
const escalaRespostasQVT = [
  { valor: 1, texto: 'Discordo totalmente', cor: 'bg-red-500 hover:bg-red-600 text-white' },
  { valor: 2, texto: 'Discordo', cor: 'bg-orange-500 hover:bg-orange-600 text-white' },
  { valor: 3, texto: 'Neutro', cor: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
  { valor: 4, texto: 'Concordo', cor: 'bg-lime-500 hover:bg-lime-600 text-white' },
  { valor: 5, texto: 'Concordo totalmente', cor: 'bg-green-500 hover:bg-green-600 text-white' }
];

/**
 * Obtém todas as perguntas do teste QVT formatadas para o frontend
 */
export async function obterPerguntasQVT(): Promise<PerguntaQVT[]> {
  try {
    console.log('🔍 [QVT-SERVICE] Obtendo perguntas do teste QVT');
    
    const perguntasFormatadas: PerguntaQVT[] = configQualidadeVidaTrabalho.perguntas.map(pergunta => ({
      ...pergunta,
      opcoes: escalaRespostasQVT
    }));
    
    console.log('🔍 [QVT-SERVICE] Perguntas formatadas:', perguntasFormatadas.length);
    return perguntasFormatadas;
    
  } catch (error) {
    console.error('❌ [QVT-SERVICE] Erro ao obter perguntas:', error);
    throw new Error('Erro ao carregar perguntas do teste QVT');
  }
}

/**
 * Salva uma resposta individual do teste QVT
 */
export async function salvarRespostaQVT(
  sessaoId: string, 
  perguntaId: number, 
  valor: number
): Promise<void> {
  try {
    console.log('🔍 [QVT-SERVICE] Salvando resposta individual:', { sessaoId, perguntaId, valor });
    
    // Validar entrada
    if (!sessaoId || perguntaId < 1 || perguntaId > 50 || valor < 1 || valor > 5) {
      throw new Error('Parâmetros inválidos para salvar resposta QVT');
    }
    
    // Obter usuário autenticado (se existir)
    const currentUser = authService.getCurrentUser();
    
    // Salvar no banco de dados
    const { error } = await supabase
      .from('respostas_individuais_qvt')
      .upsert({
        session_id: sessaoId,
        usuario_id: currentUser?.id || null,
        pergunta_id: perguntaId,
        resposta: valor,
        dimensao: 'QVT', // Valor padrão para dimensão
        created_at: new Date().toISOString()
      }, {
        onConflict: 'session_id,pergunta_id'
      });
    
    if (error) {
      console.error('❌ [QVT-SERVICE] Erro ao salvar resposta:', error);
      throw new Error(`Erro ao salvar resposta: ${error.message}`);
    }
    
    console.log('✅ [QVT-SERVICE] Resposta salva com sucesso');
    
  } catch (error) {
    console.error('❌ [QVT-SERVICE] Erro no salvamento da resposta:', error);
    throw error;
  }
}

/**
 * Finaliza o teste QVT, calcula o resultado e salva no banco
 */
export async function finalizarTesteQVT(
  respostas: Record<number, number>
): Promise<{ resultado: { id: string; analise: ResultadoQVT } }> {
  try {
    console.log('🔍 [QVT-SERVICE] Iniciando finalização do teste QVT');
    console.log('🔍 [QVT-SERVICE] Respostas recebidas:', respostas);
    console.log('🔍 [QVT-SERVICE] Número de respostas:', Object.keys(respostas).length);
    
    // Validar completude do teste
    const totalPerguntas = configQualidadeVidaTrabalho.numeroPerguntas;
    const respostasCount = Object.keys(respostas).length;
    
    if (respostasCount !== totalPerguntas) {
      throw new Error(`Teste incompleto: ${respostasCount}/${totalPerguntas} respostas`);
    }
    
    // Calcular resultado usando a função específica do teste
    console.log('🔍 [QVT-SERVICE] Calculando resultado...');
    const analiseQVT = calcularResultadoQVT(respostas);
    console.log('🔍 [QVT-SERVICE] Análise calculada:', analiseQVT);
    
    // Obter session_id corretamente
    const sessao = obterSessaoAtual();
    const sessaoId = sessao?.sessionId;
    if (!sessaoId) {
      throw new Error('Sessão não encontrada');
    }

    console.log('🔍 [QVT-SERVICE] Session ID obtido:', sessaoId);
    
    // Obter usuário autenticado
    const currentUser = authService.getCurrentUser();
    let usuarioId = currentUser?.id || null;
    
    console.log('👤 [QVT-SERVICE] Usuário autenticado (id):', usuarioId);
    
    // CORREÇÃO: Garantir que usuario_id seja sempre preenchido baseado no usuário autenticado
    if (usuarioId) {
      console.log('🔍 [QVT-SERVICE] Usuário autenticado encontrado:', {
        id: usuarioId,
        email: currentUser?.email,
        role: currentUser?.role
      });
    } else {
      console.warn('⚠️ [QVT-SERVICE] Nenhum usuário autenticado encontrado');
    }
    
    console.log('🔍 [QVT-SERVICE] Preparando dados para salvar via API local');
    
    // Salvar resultado via API local
    const dadosAPI = {
      testeId: '7b3c8d4e-9f0a-1b2c-3d4e-5f6a7b8c9d0e', // UUID do teste QVT no banco
      pontuacaoTotal: analiseQVT.indiceGeral || 0,
      metadados: {
        tipo: 'qvt',
        pontuacao: analiseQVT.indiceGeral || 0,
        percentual: analiseQVT.percentualGeral || 0,
        categoria: analiseQVT.nivelGeral || 'Indefinido',
        dimensoes: analiseQVT.dimensoes || [],
        dimensoesCriticas: analiseQVT.dimensoesCriticas || [],
        pontoFortes: analiseQVT.pontoFortes || [],
        riscoTurnover: analiseQVT.riscoTurnover || false,
        recomendacoes: analiseQVT.recomendacoes || [],
        insights: analiseQVT.insights || [],
        alertasCriticos: analiseQVT.alertasCriticos || [],
        totalPerguntas: totalPerguntas,
        respostas: Object.entries(respostas).map(([perguntaId, valor]) => ({
          perguntaId,
          valor
        }))
      }
    };

    console.log('🔍 [QVT-SERVICE] Enviando resultado para API...');
    const resultadoSalvo = await apiService.salvarResultadoTeste(dadosAPI);
    console.log('✅ [QVT-SERVICE] Resultado salvo via API com sucesso:', resultadoSalvo);
    
    return {
      resultado: {
        id: resultadoSalvo.id,
        analise: {
          ...analiseQVT,
          id: resultadoSalvo.id,
          testeId: 'qualidade-vida-trabalho',
          nomeTeste: configQualidadeVidaTrabalho.nome,
          dataRealizacao: resultadoSalvo.dataRealizacao || new Date().toISOString(),
          versao: '1.0'
        }
      }
    };
    
  } catch (error) {
    console.error('❌ [QVT-SERVICE] Erro na finalização do teste:', error);
    throw error;
  }
}

/**
 * Busca um resultado específico do teste QVT por ID
 */
export async function buscarResultadoQVTPorId(id: string): Promise<ResultadoQVT | null> {
  try {
    console.log('🔍 [QVT-SERVICE] Buscando resultado por ID:', id);
    console.log('🔍 [QVT-SERVICE] Supabase client configurado:', !!supabase);
    
    const { data, error } = await supabase
      .from('resultados_qvt')
      .select('*')
      .eq('id', id)
      .single();
    
    console.log('🔍 [QVT-SERVICE] Resposta do Supabase:', { data: !!data, error: !!error });
    
    if (error) {
      console.error('❌ [QVT-SERVICE] Erro ao buscar resultado:', error);
      console.error('❌ [QVT-SERVICE] Detalhes do erro:', JSON.stringify(error, null, 2));
      return null;
    }
    
    if (!data) {
      console.log('⚠️ [QVT-SERVICE] Resultado não encontrado para ID:', id);
      return null;
    }
    
    console.log('✅ [QVT-SERVICE] Resultado encontrado:', data);
    console.log('🔍 [QVT-SERVICE] Estrutura dos dados:', Object.keys(data));
    
    // ===== CONTROLE DE ACESSO E SEGURANÇA =====
    console.log('🔐 [QVT-SERVICE] Iniciando verificação de controle de acesso');
    
    // Verificação de acesso: obter usuário atual e verificar se ele pode acessar este resultado
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      console.log('❌ [QVT-SERVICE] Usuário não autenticado - acesso negado');
      console.log('🔒 [QVT-SERVICE] AUDITORIA: Tentativa de acesso não autenticado ao resultado ID:', id);
      return null;
    }
    
    console.log('🔍 [QVT-SERVICE] Usuário autenticado:', { 
      email: currentUser.email, 
      role: currentUser.role, 
      empresa_id: currentUser.empresa_id 
    });
    
    // Verificar se o resultado pertence ao colaborador atual (se for colaborador)
    if (currentUser.role === 'colaborador') {
      console.log('👤 [QVT-SERVICE] Verificando acesso para colaborador');
      
      const { data: colaboradorData, error: colaboradorError } = await supabase
        .from('colaboradores')
        .select('id')
        .eq('email', currentUser.email)
        .single();
      
      if (colaboradorError) {
        console.error('❌ [QVT-SERVICE] Erro ao buscar dados do colaborador:', colaboradorError);
        console.log('🔒 [QVT-SERVICE] AUDITORIA: Erro na verificação de colaborador para resultado ID:', id);
        return null;
      }
      
      if (colaboradorData && data.usuario_id === colaboradorData.id) {
        console.log('✅ [QVT-SERVICE] Acesso permitido para colaborador proprietário');
        console.log('🔒 [QVT-SERVICE] AUDITORIA: Acesso autorizado - colaborador proprietário:', currentUser.email);
      } else {
        console.log('❌ [QVT-SERVICE] Acesso negado: resultado não pertence ao colaborador');
        console.log('🔒 [QVT-SERVICE] AUDITORIA: Tentativa de acesso negado - colaborador não proprietário:', {
          usuario_email: currentUser.email,
          colaborador_id: colaboradorData?.id,
          resultado_usuario_id: data.usuario_id,
          resultado_id: id
        });
        return null;
      }
    }
    
    // Verificar se é empresa e se o resultado pertence a um colaborador da empresa
    if (currentUser.role === 'empresa' && currentUser.empresa_id) {
      console.log('🏢 [QVT-SERVICE] Verificando acesso para empresa');
      
      const { data: colaboradorResultado, error: empresaError } = await supabase
        .from('colaboradores')
        .select('empresa_id')
        .eq('id', data.usuario_id)
        .single();
      
      if (empresaError) {
        console.error('❌ [QVT-SERVICE] Erro ao verificar vinculação empresa-colaborador:', empresaError);
        console.log('🔒 [QVT-SERVICE] AUDITORIA: Erro na verificação de empresa para resultado ID:', id);
        return null;
      }
      
      if (colaboradorResultado && colaboradorResultado.empresa_id === currentUser.empresa_id) {
        console.log('✅ [QVT-SERVICE] Acesso permitido para empresa proprietária');
        console.log('🔒 [QVT-SERVICE] AUDITORIA: Acesso autorizado - empresa proprietária:', {
          empresa_id: currentUser.empresa_id,
          usuario_email: currentUser.email
        });
      } else {
        console.log('❌ [QVT-SERVICE] Acesso negado: resultado não pertence à empresa');
        console.log('🔒 [QVT-SERVICE] AUDITORIA: Tentativa de acesso negado - empresa não proprietária:', {
          usuario_email: currentUser.email,
          empresa_id_usuario: currentUser.empresa_id,
          empresa_id_colaborador: colaboradorResultado?.empresa_id,
          resultado_id: id
        });
        return null;
      }
    }
    
    // Admins têm acesso a todos os resultados
    if (currentUser.role === 'admin') {
      console.log('✅ [QVT-SERVICE] Acesso permitido para admin');
      console.log('🔒 [QVT-SERVICE] AUDITORIA: Acesso autorizado - usuário admin:', currentUser.email);
    }
    
    // Se chegou até aqui, o acesso foi autorizado
    console.log('🔐 [QVT-SERVICE] Controle de acesso concluído - acesso autorizado');
    
    // Verificar se todos os campos necessários estão presentes
    const camposObrigatorios = ['id', 'indice_geral', 'nivel_geral', 'satisfacao_funcao', 'relacao_lideranca'];
    const camposFaltando = camposObrigatorios.filter(campo => data[campo] === null || data[campo] === undefined);
    
    if (camposFaltando.length > 0) {
      console.warn('⚠️ [QVT-SERVICE] Campos obrigatórios faltando:', camposFaltando);
    }
    
    // Reconstruir o objeto ResultadoQVT a partir dos dados do banco
    const resultado: ResultadoQVT = {
      id: data.id,
      testeId: 'qualidade-vida-trabalho',
      nomeTeste: configQualidadeVidaTrabalho.nome,
      dataRealizacao: data.created_at,
      versao: '1.0',
      indiceGeral: data.indice_geral,
      nivelGeral: data.nivel_geral,
      percentualGeral: data.percentual_geral,
      dimensoes: [
        {
          dimensao: 'Satisfação com a Função',
          pontuacao: data.satisfacao_funcao,
          nivel: classificarNivelQVT(data.satisfacao_funcao),
          percentual: (data.satisfacao_funcao / 5) * 100
        },
        {
          dimensao: 'Relação com Liderança',
          pontuacao: data.relacao_lideranca,
          nivel: classificarNivelQVT(data.relacao_lideranca),
          percentual: (data.relacao_lideranca / 5) * 100
        },
        {
          dimensao: 'Estrutura e Condições de Trabalho',
          pontuacao: data.estrutura_condicoes,
          nivel: classificarNivelQVT(data.estrutura_condicoes),
          percentual: (data.estrutura_condicoes / 5) * 100
        },
        {
          dimensao: 'Recompensas e Remuneração',
          pontuacao: data.recompensas_remuneracao,
          nivel: classificarNivelQVT(data.recompensas_remuneracao),
          percentual: (data.recompensas_remuneracao / 5) * 100
        },
        {
          dimensao: 'Equilíbrio Vida-Trabalho',
          pontuacao: data.equilibrio_vida_trabalho,
          nivel: classificarNivelQVT(data.equilibrio_vida_trabalho),
          percentual: (data.equilibrio_vida_trabalho / 5) * 100
        }
      ],
      dimensoesCriticas: (data.dimensoes_criticas || []).map((dimensao: string) => ({
        dimensao,
        pontuacao: 0, // Será calculado abaixo
        nivel: 'Crítico',
        percentual: 0
      })),
      pontoFortes: (data.pontos_fortes || []).map((dimensao: string) => ({
        dimensao,
        pontuacao: 0, // Será calculado abaixo
        nivel: 'Excelente',
        percentual: 0
      })),
      riscoTurnover: data.risco_turnover,
      recomendacoes: data.recomendacoes || [],
      insights: data.insights || [],
      alertasCriticos: data.alertas_criticos ? JSON.parse(data.alertas_criticos) : []
    };
    
    // Atualizar pontuações das dimensões críticas e pontos fortes
    resultado.dimensoesCriticas = resultado.dimensoesCriticas.map(dc => {
      const dimensaoCompleta = resultado.dimensoes.find(d => d.dimensao === dc.dimensao);
      return dimensaoCompleta ? { ...dc, pontuacao: dimensaoCompleta.pontuacao, percentual: dimensaoCompleta.percentual } : dc;
    });
    
    resultado.pontoFortes = resultado.pontoFortes.map(pf => {
      const dimensaoCompleta = resultado.dimensoes.find(d => d.dimensao === pf.dimensao);
      return dimensaoCompleta ? { ...pf, pontuacao: dimensaoCompleta.pontuacao, percentual: dimensaoCompleta.percentual } : pf;
    });
    
    console.log('🔍 [QVT-SERVICE] Resultado reconstruído:', resultado);
    console.log('🔍 [QVT-SERVICE] Dimensões:', resultado.dimensoes.length);
    console.log('🔍 [QVT-SERVICE] Dimensões críticas:', resultado.dimensoesCriticas.length);
    console.log('🔍 [QVT-SERVICE] Pontos fortes:', resultado.pontoFortes.length);
    console.log('✅ [QVT-SERVICE] Resultado final processado com sucesso');
    
    return resultado;
    
  } catch (error) {
    console.error('❌ [QVT-SERVICE] Erro na busca do resultado:', error);
    console.error('❌ [QVT-SERVICE] Stack trace:', error instanceof Error ? error.stack : 'No stack');
    return null;
  }
}

/**
 * Obtém todas as respostas individuais de uma sessão
 */
export async function obterRespostasQVTPorSessao(sessaoId: string): Promise<Record<number, number>> {
  try {
    console.log('🔍 [QVT-SERVICE] Obtendo respostas da sessão:', sessaoId);
    
    const { data, error } = await supabase
      .from('respostas_individuais_qvt')
      .select('pergunta_id, resposta')
      .eq('session_id', sessaoId)
      .order('pergunta_id');
    
    if (error) {
      console.error('❌ [QVT-SERVICE] Erro ao obter respostas:', error);
      throw new Error(`Erro ao obter respostas: ${error.message}`);
    }
    
    // Converter para o formato esperado
    const respostas: Record<number, number> = {};
    data?.forEach(item => {
      respostas[item.pergunta_id] = item.resposta;
    });
    
    console.log('✅ [QVT-SERVICE] Respostas obtidas:', Object.keys(respostas).length);
    return respostas;
    
  } catch (error) {
    console.error('❌ [QVT-SERVICE] Erro ao obter respostas da sessão:', error);
    throw error;
  }
}

// Exportar configuração do teste para uso em outros componentes
export { configQualidadeVidaTrabalho };

// Exportar o serviço como default e named export
export const qualidadeVidaTrabalhoService = {
  finalizarTesteQVT,
  buscarResultadoQVTPorId,
  obterRespostasQVTPorSessao
};

export default qualidadeVidaTrabalhoService;