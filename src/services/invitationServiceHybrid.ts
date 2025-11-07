// services/invitationServiceHybrid.ts
// Serviço híbrido que usa API backend segura como principal e Supabase direto como fallback

import { apiService, type ConviteEmpresa as ApiConviteEmpresa, type ConviteColaborador as ApiConviteColaborador, type ConviteResponse } from './apiService';
import { invitationService as originalService, type ConviteEmpresa, type ConviteColaborador, type InvitationResponse, type ConviteData } from './invitationService';
import { type ConviteData as ConviteDataLegacy } from './conviteService';

// ========================================
// INTERFACES UNIFICADAS
// ========================================

export interface HybridInvitationResponse {
  success: boolean;
  message: string;
  data?: any;
  token?: string;
  convite?: ConviteEmpresa | ConviteColaborador;
  source?: 'api' | 'supabase'; // Indica qual fonte foi usada
}

// ========================================
// SERVIÇO HÍBRIDO DE CONVITES
// ========================================

import { supabase } from '../lib/supabase';

class HybridInvitationService {
  async createInvitation(dados: Omit<ConviteDataLegacy, 'id' | 'dataCriacao' | 'status' | 'colaboradoresUsaram' | 'colaboradoresRestantes' | 'codigoConvite'>): Promise<ConviteDataLegacy> {
    const codigo = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const agora = new Date();

    const dataExpiracao = dados.tipoLiberacao === 'prazo' && dados.prazoDias
      ? new Date(agora.getTime() + dados.prazoDias * 24 * 60 * 60 * 1000)
      : null;

    // A tabela correta é 'convites_empresa', não 'convites'
    const { data, error } = await supabase
      .from('convites_empresa')
      .insert([
        {
          token: codigo, // Campo correto é 'token'
          nome_empresa: dados.nomeEmpresa,
          email_contato: dados.emailContato,
          // Removendo campos que não existem na tabela convites_empresa
          status: 'pendente',
          validade: dataExpiracao ? dataExpiracao.toISOString() : null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar convite no Supabase:', error);
      throw new Error('Não foi possível criar o convite.');
    }

    return {
      id: data.id,
      codigoConvite: data.token, // Campo correto é 'token'
      nomeEmpresa: data.nome_empresa,
      emailContato: data.email_contato,
      numeroColaboradores: dados.numeroColaboradores, // Valor do input
      tipoLiberacao: dados.tipoLiberacao,
      prazoDias: dados.prazoDias,
      dataCriacao: new Date(data.created_at),
      dataExpiracao: data.validade ? new Date(data.validade) : undefined,
      status: data.status,
      colaboradoresUsaram: 0, // Valor inicial
      colaboradoresRestantes: dados.numeroColaboradores, // Valor inicial
    };
  }

  
  /**
   * Cria convite para empresa usando API backend (principal) ou Supabase direto (fallback)
   */
  async criarConviteEmpresa(dados: ConviteData): Promise<HybridInvitationResponse> {
    try {
      console.log('🔄 [HYBRID] Tentando criar convite empresa via API backend...');
      
      // Tentar via API backend primeiro
      const apiResponse = await apiService.criarConviteEmpresa({
        nome_empresa: dados.nome,
        email_contato: dados.email,
        admin_id: dados.admin_id!
      });

      if (apiResponse.success && apiResponse.data) {
        console.log('✅ [HYBRID] Convite empresa criado via API backend');
        return {
          success: true,
          message: apiResponse.message || 'Convite criado com sucesso via API',
          token: apiResponse.data.token,
          convite: {
            id: apiResponse.data.id,
            token: apiResponse.data.token,
            nome_empresa: apiResponse.data.nome_empresa,
            email_contato: apiResponse.data.email_contato,
            admin_id: apiResponse.data.admin_id,
            status: apiResponse.data.status,
            validade: apiResponse.data.validade,
            created_at: apiResponse.data.created_at,
            metadados: apiResponse.data.metadados
          },
          source: 'api'
        };
      }

      console.log('⚠️ [HYBRID] API backend falhou, tentando Supabase direto...');
      console.log('🔍 [HYBRID] Erro da API:', apiResponse.error);

      // Fallback para Supabase direto
      const supabaseResponse = await originalService.criarConviteEmpresa(dados);
      
      return {
        ...supabaseResponse,
        source: 'supabase'
      };

    } catch (error) {
      console.error('❌ [HYBRID] Erro em ambas as tentativas:', error);
      
      // Último recurso: tentar Supabase direto
      try {
        const supabaseResponse = await originalService.criarConviteEmpresa(dados);
        return {
          ...supabaseResponse,
          source: 'supabase'
        };
      } catch (fallbackError) {
        console.error('❌ [HYBRID] Fallback também falhou:', fallbackError);
        return {
          success: false,
          message: 'Erro em todos os métodos de criação de convite',
          source: 'api'
        };
      }
    }
  }

  /**
   * Cria convite para colaborador usando apenas API backend
   */
  async criarConviteColaborador(dados: ConviteData): Promise<HybridInvitationResponse> {
    try {
      console.log('🔄 [HYBRID] Criando convite colaborador via API backend...', dados);
      
      // Usar apenas API backend
      const convite = await apiService.criarConviteColaborador({
        nome: dados.nome,
        email: dados.email,
        cargo: dados.cargo,
        departamento: dados.departamento,
        diasValidade: dados.dias_expiracao || 3
      });

      console.log('✅ [HYBRID] Convite colaborador criado via API backend:', convite);
      return {
        success: true,
        message: 'Convite criado com sucesso',
        token: convite.token,
        data: convite,
        source: 'api'
      };

    } catch (error) {
      console.error('❌ [HYBRID] Erro ao criar convite:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao criar convite',
        source: 'api'
      };
    }
  }

  /**
   * Busca convite por token - usa Supabase direto (leitura é permitida)
   */
  async buscarConvitePorToken(token: string, tipo: 'empresa' | 'colaborador'): Promise<HybridInvitationResponse> {
    try {
      // Para leitura, usar Supabase direto é mais eficiente
      const response = await originalService.buscarConvitePorToken(token, tipo);
      return {
        ...response,
        source: 'supabase'
      };
    } catch (error) {
      console.error('❌ [HYBRID] Erro ao buscar convite:', error);
      return {
        success: false,
        message: 'Erro ao buscar convite',
        source: 'supabase'
      };
    }
  }

  /**
   * Lista convites - usa apenas API backend
   * A API backend determina automaticamente qual tipo retornar baseado no usuário autenticado
   */
  async listarConvites(
    tipo?: 'empresa' | 'colaborador',
    empresaId?: string,
    limite?: number,
    offset?: number
  ): Promise<HybridInvitationResponse> {
    try {
      console.log('🔄 [HYBRID] Listando convites via API backend...');
      
      // Usar apenas API backend - a API determina o tipo pelo token JWT
      const apiResponse = await apiService.listarConvites();

      if (apiResponse && apiResponse.convites) {
        console.log('✅ [HYBRID] Convites listados via API backend:', apiResponse.convites.length, 'convites');
        return {
          success: true,
          message: 'Convites listados com sucesso',
          data: apiResponse.convites,
          source: 'api'
        };
      }

      // Se a API retornou erro, retornar lista vazia ao invés de falhar
      console.log('⚠️ [HYBRID] API backend retornou resposta vazia, retornando lista vazia');
      return {
        success: true,
        message: 'Nenhum convite encontrado',
        data: [],
        source: 'api'
      };

    } catch (error) {
      console.error('❌ [HYBRID] Erro ao listar convites:', error);
      // Retornar lista vazia ao invés de erro para não quebrar a interface
      return {
        success: true,
        message: 'Erro ao conectar com o servidor. Tente novamente.',
        data: [],
        source: 'api'
      };
    }
  }

  /**
   * Usar convite - usa Supabase direto (operação de escrita permitida para usuários autenticados)
   */
  async usarConvite(token: string, tipo: 'empresa' | 'colaborador'): Promise<HybridInvitationResponse> {
    try {
      const response = await originalService.usarConvite(token, tipo);
      return {
        ...response,
        source: 'supabase'
      };
    } catch (error) {
      console.error('❌ [HYBRID] Erro ao usar convite:', error);
      return {
        success: false,
        message: 'Erro ao usar convite',
        source: 'supabase'
      };
    }
  }

  /**
   * Validar convite - usa Supabase direto (leitura é permitida)
   */
  async validarConvite(token: string, tipo: 'empresa' | 'colaborador'): Promise<HybridInvitationResponse> {
    try {
      const response = await originalService.validarConvite(token, tipo);
      return {
        ...response,
        source: 'supabase'
      };
    } catch (error) {
      console.error('❌ [HYBRID] Erro ao validar convite:', error);
      return {
        success: false,
        message: 'Erro ao validar convite',
        source: 'supabase'
      };
    }
  }

  /**
   * Gerar URL do convite - método utilitário
   */
  gerarUrlConvite(token: string, tipo: 'empresa' | 'colaborador'): string {
    return originalService.gerarUrlConvite(token, tipo);
  }

  /**
   * Cancelar convite - usa API backend
   */
  async cancelarConvite(token: string, tipo: 'empresa' | 'colaborador'): Promise<HybridInvitationResponse> {
    try {
      console.log('🔄 [HYBRID] Cancelando convite via API backend...', { token, tipo });
      
      // Usar API backend
      const response = tipo === 'colaborador' 
        ? await apiService.cancelarConviteColaborador(token)
        : await apiService.cancelarConviteEmpresa(token);

      console.log('✅ [HYBRID] Convite cancelado via API backend:', response);
      return {
        success: response.success,
        message: response.message || 'Convite cancelado com sucesso',
        source: 'api'
      };
    } catch (error) {
      console.error('❌ [HYBRID] Erro ao cancelar convite:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao cancelar convite',
        source: 'api'
      };
    }
  }

  /**
   * Health check da API backend
   */
  async healthCheck(): Promise<HybridInvitationResponse> {
    try {
      const response = await apiService.healthCheck();
      return {
        success: response.success,
        message: response.success ? 'API backend funcionando' : 'API backend com problemas',
        data: response.data,
        source: 'api'
      };
    } catch (error) {
      console.error('❌ [HYBRID] API backend não disponível:', error);
      return {
        success: false,
        message: 'API backend não disponível',
        source: 'api'
      };
    }
  }
}

const hybridInvitationService = new HybridInvitationService();

export { hybridInvitationService };