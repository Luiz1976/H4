// src/services/secureInvitationService.ts
// Serviço seguro para operações de convite usando Service Role

import { supabase } from '../lib/supabase';

export interface ConviteEmpresa {
  id?: string;
  email: string;
  nome_empresa: string;
  token: string;
  validade: string;
  status: 'pendente' | 'usado' | 'expirado';
  criado_em?: string;
  usado_em?: string;
}

export interface ConviteColaborador {
  id?: string;
  email: string;
  empresa_id: string;
  nome_colaborador?: string;
  cargo?: string;
  departamento?: string;
  token: string;
  validade: string;
  status: 'pendente' | 'usado' | 'expirado';
  criado_em?: string;
  usado_em?: string;
  criado_por?: string;
}

export interface SecureInvitationResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

class SecureInvitationService {
  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private calculateExpirationDate(days: number = 7): string {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    return expirationDate.toISOString();
  }

  /**
   * Cria convite para empresa usando função RPC segura
   */
  async criarConviteEmpresa(dados: {
    email: string;
    nome_empresa: string;
    dias_validade?: number;
  }): Promise<SecureInvitationResponse> {
    try {
      const token = this.generateToken();
      const validade = this.calculateExpirationDate(dados.dias_validade || 7);

      // Usar RPC function que executa com privilégios de service role
      const { data, error } = await supabase.rpc('criar_convite_empresa_seguro', {
        p_email: dados.email,
        p_nome_empresa: dados.nome_empresa,
        p_token: token,
        p_validade: validade
      });

      if (error) {
        console.error('Erro ao criar convite empresa:', error);
        return {
          success: false,
          error: error.message,
          message: 'Erro ao criar convite para empresa'
        };
      }

      return {
        success: true,
        data: data,
        message: 'Convite para empresa criado com sucesso'
      };
    } catch (error) {
      console.error('Erro inesperado ao criar convite empresa:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: 'Erro inesperado ao criar convite'
      };
    }
  }

  /**
   * Cria convite para colaborador usando função RPC segura
   */
  async criarConviteColaborador(dados: {
    email: string;
    empresa_id: string;
    nome_colaborador?: string;
    cargo?: string;
    departamento?: string;
    dias_validade?: number;
  }): Promise<SecureInvitationResponse> {
    try {
      const token = this.generateToken();
      const validade = this.calculateExpirationDate(dados.dias_validade || 7);

      // Obter usuário atual para rastreamento
      const { data: { user } } = await supabase.auth.getUser();
      const criado_por = user?.id || null;

      // Usar RPC function que executa com privilégios de service role
      const { data, error } = await supabase.rpc('criar_convite_colaborador_seguro', {
        p_email: dados.email,
        p_empresa_id: dados.empresa_id,
        p_nome_colaborador: dados.nome_colaborador || null,
        p_cargo: dados.cargo || null,
        p_departamento: dados.departamento || null,
        p_token: token,
        p_validade: validade,
        p_criado_por: criado_por
      });

      if (error) {
        console.error('Erro ao criar convite colaborador:', error);
        return {
          success: false,
          error: error.message,
          message: 'Erro ao criar convite para colaborador'
        };
      }

      return {
        success: true,
        data: data,
        message: 'Convite para colaborador criado com sucesso'
      };
    } catch (error) {
      console.error('Erro inesperado ao criar convite colaborador:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: 'Erro inesperado ao criar convite'
      };
    }
  }

  /**
   * Valida convite usando função RPC segura
   */
  async validarConvite(token: string, tipo: 'empresa' | 'colaborador'): Promise<SecureInvitationResponse> {
    try {
      const functionName = tipo === 'empresa' 
        ? 'validar_convite_empresa_seguro' 
        : 'validar_convite_colaborador_seguro';

      const { data, error } = await supabase.rpc(functionName, {
        p_token: token
      });

      if (error) {
        console.error(`Erro ao validar convite ${tipo}:`, error);
        return {
          success: false,
          error: error.message,
          message: `Erro ao validar convite ${tipo}`
        };
      }

      return {
        success: true,
        data: data,
        message: `Convite ${tipo} validado com sucesso`
      };
    } catch (error) {
      console.error(`Erro inesperado ao validar convite ${tipo}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: 'Erro inesperado ao validar convite'
      };
    }
  }

  /**
   * Marca convite como usado usando função RPC segura
   */
  async marcarConviteComoUsado(token: string, tipo: 'empresa' | 'colaborador'): Promise<SecureInvitationResponse> {
    try {
      const functionName = tipo === 'empresa' 
        ? 'marcar_convite_empresa_usado_seguro' 
        : 'marcar_convite_colaborador_usado_seguro';

      const { data, error } = await supabase.rpc(functionName, {
        p_token: token
      });

      if (error) {
        console.error(`Erro ao marcar convite ${tipo} como usado:`, error);
        return {
          success: false,
          error: error.message,
          message: `Erro ao marcar convite ${tipo} como usado`
        };
      }

      return {
        success: true,
        data: data,
        message: `Convite ${tipo} marcado como usado`
      };
    } catch (error) {
      console.error(`Erro inesperado ao marcar convite ${tipo} como usado:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: 'Erro inesperado ao marcar convite como usado'
      };
    }
  }

  /**
   * Lista convites com filtros usando função RPC segura
   */
  async listarConvites(filtros: {
    tipo: 'empresa' | 'colaborador';
    empresa_id?: string;
    status?: 'pendente' | 'usado' | 'expirado';
    limite?: number;
  }): Promise<SecureInvitationResponse> {
    try {
      const functionName = filtros.tipo === 'empresa' 
        ? 'listar_convites_empresa_seguro' 
        : 'listar_convites_colaborador_seguro';

      const { data, error } = await supabase.rpc(functionName, {
        p_empresa_id: filtros.empresa_id || null,
        p_status: filtros.status || null,
        p_limite: filtros.limite || 50
      });

      if (error) {
        console.error(`Erro ao listar convites ${filtros.tipo}:`, error);
        return {
          success: false,
          error: error.message,
          message: `Erro ao listar convites ${filtros.tipo}`
        };
      }

      return {
        success: true,
        data: data || [],
        message: `Convites ${filtros.tipo} listados com sucesso`
      };
    } catch (error) {
      console.error(`Erro inesperado ao listar convites ${filtros.tipo}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: 'Erro inesperado ao listar convites'
      };
    }
  }

  /**
   * Limpa convites expirados usando função RPC segura
   */
  async limparConvitesExpirados(): Promise<SecureInvitationResponse> {
    try {
      const { data, error } = await supabase.rpc('limpar_convites_expirados_seguro');

      if (error) {
        console.error('Erro ao limpar convites expirados:', error);
        return {
          success: false,
          error: error.message,
          message: 'Erro ao limpar convites expirados'
        };
      }

      return {
        success: true,
        data: data,
        message: 'Convites expirados limpos com sucesso'
      };
    } catch (error) {
      console.error('Erro inesperado ao limpar convites expirados:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: 'Erro inesperado ao limpar convites expirados'
      };
    }
  }
}

export const secureInvitationService = new SecureInvitationService();