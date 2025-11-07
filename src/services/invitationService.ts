import { supabase } from '../lib/supabase';
import { supabaseAdmin, executeAdminOperation, isServiceRoleAvailable } from '../lib/supabaseAdmin';

// ========================================
// INTERFACES E TIPOS
// ========================================

export interface ConviteEmpresa {
  id: string;
  token: string;
  nome_empresa: string;
  email_contato: string;
  admin_id: string;
  status: string;
  validade: string;
  metadados?: any;
  created_at: string;
}

export interface ConviteColaborador {
  id: string;
  token: string;
  email: string;
  nome: string;
  empresa_id: string;
  status: string;
  validade: string;
  created_at: string;
  empresas?: {
    nome_empresa: string;
  };
}

export interface InvitationResponse {
  success: boolean;
  message: string;
  data?: any;
  token?: string;
  convite?: ConviteEmpresa | ConviteColaborador;
}

export interface ConviteData {
  email: string;
  nome: string;
  empresa_id?: string; // Para convites de colaborador
  admin_id?: string;   // Para convites de empresa
  dias_expiracao?: number; // Padrão: 7 dias
}

// ========================================
// SERVIÇO DE CONVITES
// ========================================

class InvitationService {
  
  /**
   * Gera um token único para convites
   */
  private generateToken(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomStr}`.toUpperCase();
  }

  /**
   * Calcula data de expiração
   */
  private getExpirationDate(dias: number = 7): string {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + dias);
    return expiration.toISOString();
  }

  // ========================================
  // CONVITES PARA EMPRESAS
  // ========================================

  /**
   * Busca um convite de empresa ou colaborador por token.
   */
  async buscarConvitePorToken(token: string, tipo: 'empresa' | 'colaborador'): Promise<InvitationResponse> {
    const tabela = tipo === 'empresa' ? 'convites_empresa' : 'convites_colaborador';
    
    // Para convites de empresa, não há JOIN com empresas (o nome já está na tabela)
    // Para convites de colaborador, fazemos JOIN com empresas via empresa_id
    let selectClause = '*';
    if (tipo === 'colaborador') {
      selectClause = '*, empresas(nome_empresa)';
    }

    const { data: convite, error } = await supabase
      .from(tabela)
      .select(selectClause)
      .eq('token', token)
      .single();

    if (error || !convite) {
      console.error(`[DEBUG] Erro ao buscar convite (${tipo}) com token ${token}:`, error);
      return { success: false, message: 'Convite não encontrado.' };
    }

    // Verifica se o convite está expirado
    const agora = new Date();
    const validade = new Date(convite.validade);

    if (convite.status !== 'pendente' || agora > validade) {
      return { success: false, message: 'Convite expirado ou já utilizado.' };
    }

    return { success: true, message: 'Convite válido.', convite };
  }

  /**
   * Cria convite para empresa usando solução híbrida (Service Role + fallback)
   */
  async criarConviteEmpresa(dados: ConviteData): Promise<InvitationResponse> {
    try {
      console.log('🔍 [DEBUG] Iniciando criação de convite empresa:', dados);
      console.log('🔧 [DEBUG] Service Role disponível:', isServiceRoleAvailable());
      
      // Validações básicas
      if (!dados.email || !dados.nome || !dados.admin_id) {
        console.log('❌ [DEBUG] Dados inválidos:', { email: dados.email, nome: dados.nome, admin_id: dados.admin_id });
        return { 
          success: false, 
          message: 'Dados obrigatórios não fornecidos' 
        };
      }

      console.log('✅ [DEBUG] Validações básicas passaram');

      // Usar operação administrativa híbrida
      return await executeAdminOperation(
        // Operação com Service Role (privilegiada)
        async () => {
          console.log('🔧 [DEBUG] Executando com Service Role');
          return await this.criarConviteEmpresaAdmin(dados);
        },
        // Fallback com cliente normal (pode falhar por RLS)
        async () => {
          console.log('⚠️ [DEBUG] Executando com cliente normal (fallback)');
          return await this.criarConviteEmpresaNormal(dados);
        }
      );

    } catch (error) {
      console.error('❌ [DEBUG] Erro geral ao criar convite empresa:', error);
      return { 
        success: false, 
        message: 'Erro interno do servidor' 
      };
    }
  }

  /**
   * Cria convite usando Service Role (sem restrições RLS)
   */
  private async criarConviteEmpresaAdmin(dados: ConviteData): Promise<InvitationResponse> {
    // Verificar se já existe convite ativo para este email
    console.log('🔍 [DEBUG] [ADMIN] Verificando convite existente para email:', dados.email);
    const { data: conviteExistente, error: errorConviteExistente } = await supabaseAdmin
      .from('convites_empresa')
      .select('*')
      .eq('email_contato', dados.email)
      .eq('status', 'pendente')
      .gt('validade', new Date().toISOString())
      .single();

    console.log('🔍 [DEBUG] [ADMIN] Resultado verificação convite existente:', { conviteExistente, errorConviteExistente });

    if (conviteExistente) {
      console.log('❌ [DEBUG] [ADMIN] Convite existente encontrado');
      return { 
        success: false, 
        message: 'Já existe um convite ativo para este email' 
      };
    }

    // Verificar se empresa já está cadastrada
    console.log('🔍 [DEBUG] [ADMIN] Verificando empresa existente para email:', dados.email);
    const { data: empresaExistente, error: errorEmpresaExistente } = await supabaseAdmin
      .from('empresas')
      .select('id')
      .eq('email_contato', dados.email)
      .single();

    console.log('🔍 [DEBUG] [ADMIN] Resultado verificação empresa existente:', { empresaExistente, errorEmpresaExistente });

    if (empresaExistente) {
      console.log('❌ [DEBUG] [ADMIN] Empresa existente encontrada');
      return { 
        success: false, 
        message: 'Esta empresa já está cadastrada no sistema' 
      };
    }

    // Criar convite com Service Role
    const token = this.generateToken();
    const dataExpiracao = this.getExpirationDate(dados.dias_expiracao);

    console.log('🔍 [DEBUG] [ADMIN] Dados para inserção:', {
      token,
      email_contato: dados.email,
      nome_empresa: dados.nome,
      admin_id: dados.admin_id,
      validade: dataExpiracao,
      status: 'pendente'
    });

    const { data: novoConvite, error } = await supabaseAdmin
      .from('convites_empresa')
      .insert({
        token,
        email_contato: dados.email,
        nome_empresa: dados.nome,
        admin_id: dados.admin_id,
        validade: dataExpiracao,
        status: 'pendente'
      })
      .select()
      .single();

    console.log('🔍 [DEBUG] [ADMIN] Resultado inserção:', { novoConvite, error });

    if (error) {
      console.error('❌ [DEBUG] [ADMIN] Erro ao criar convite empresa:', error);
      throw new Error('Erro ao criar convite com Service Role');
    }

    console.log('✅ [DEBUG] [ADMIN] Convite criado com sucesso:', novoConvite);

    return { 
      success: true, 
      message: 'Convite criado com sucesso (Service Role)',
      token,
      convite: novoConvite
    };
  }

  /**
   * Cria convite usando cliente normal (pode falhar por RLS)
   */
  private async criarConviteEmpresaNormal(dados: ConviteData): Promise<InvitationResponse> {
    // Verificar se já existe convite ativo para este email
    console.log('🔍 [DEBUG] [NORMAL] Verificando convite existente para email:', dados.email);
    const { data: conviteExistente, error: errorConviteExistente } = await supabase
      .from('convites_empresa')
      .select('*')
      .eq('email_contato', dados.email)
      .eq('status', 'pendente')
      .gt('validade', new Date().toISOString())
      .single();

    console.log('🔍 [DEBUG] [NORMAL] Resultado verificação convite existente:', { conviteExistente, errorConviteExistente });

    if (conviteExistente) {
      console.log('❌ [DEBUG] [NORMAL] Convite existente encontrado');
      return { 
        success: false, 
        message: 'Já existe um convite ativo para este email' 
      };
    }

    // Verificar se empresa já está cadastrada
    console.log('🔍 [DEBUG] [NORMAL] Verificando empresa existente para email:', dados.email);
    const { data: empresaExistente, error: errorEmpresaExistente } = await supabase
      .from('empresas')
      .select('id')
      .eq('email_contato', dados.email)
      .single();

    console.log('🔍 [DEBUG] [NORMAL] Resultado verificação empresa existente:', { empresaExistente, errorEmpresaExistente });

    if (empresaExistente) {
      console.log('❌ [DEBUG] [NORMAL] Empresa existente encontrada');
      return { 
        success: false, 
        message: 'Esta empresa já está cadastrada no sistema' 
      };
    }

    // Criar convite com cliente normal
    const token = this.generateToken();
    const dataExpiracao = this.getExpirationDate(dados.dias_expiracao);

    console.log('🔍 [DEBUG] [NORMAL] Dados para inserção:', {
      token,
      email_contato: dados.email,
      nome_empresa: dados.nome,
      admin_id: dados.admin_id,
      validade: dataExpiracao,
      status: 'pendente'
    });

    const { data: novoConvite, error } = await supabase
      .from('convites_empresa')
      .insert({
        token,
        email_contato: dados.email,
        nome_empresa: dados.nome,
        admin_id: dados.admin_id,
        validade: dataExpiracao,
        status: 'pendente'
      })
      .select()
      .single();

    console.log('🔍 [DEBUG] [NORMAL] Resultado inserção:', { novoConvite, error });

    if (error) {
      console.error('❌ [DEBUG] [NORMAL] Erro ao criar convite empresa:', error);
      throw new Error('Erro ao criar convite com cliente normal: ' + error.message);
    }

    console.log('✅ [DEBUG] [NORMAL] Convite criado com sucesso:', novoConvite);

    return { 
      success: true, 
      message: 'Convite criado com sucesso (cliente normal)',
      token,
      convite: novoConvite
    };
  }

  /**
   * Valida convite de empresa
   */
  async validarConviteEmpresa(token: string): Promise<InvitationResponse> {
    try {
      if (!token) {
        return { 
          success: false, 
          message: 'Token é obrigatório' 
        };
      }

      const { data: convite, error } = await supabase
        .from('convites_empresa')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !convite) {
        return { 
          success: false, 
          message: 'Convite não encontrado' 
        };
      }

      // Verificar se já foi usado (campo 'status' ao invés de 'usado')
      if (convite.status === 'usado') {
        return { 
          success: false, 
          message: 'Este convite já foi utilizado' 
        };
      }

      // Verificar expiração (campo 'validade' ao invés de 'data_expiracao')
      if (new Date(convite.validade) < new Date()) {
        return { 
          success: false, 
          message: 'Este convite expirou' 
        };
      }

      return { 
        success: true, 
        message: 'Convite válido',
        convite,
        data: convite
      };

    } catch (error) {
      console.error('Erro ao validar convite empresa:', error);
      return { 
        success: false, 
        message: 'Erro interno do servidor' 
      };
    }
  }

  /**
   * Marca convite de empresa como usado
   */
  async marcarConviteEmpresaUsado(token: string): Promise<InvitationResponse> {
    try {
      const { data, error } = await supabase
        .from('convites_empresa')
        .update({ 
          status: 'usado', 
          updated_at: new Date().toISOString() 
        })
        .eq('token', token)
        .select()
        .single();

      if (error) {
        console.error('Erro ao marcar convite como usado:', error);
        return { 
          success: false, 
          message: 'Erro ao processar convite' 
        };
      }

      return { 
        success: true, 
        message: 'Convite processado com sucesso',
        convite: data
      };

    } catch (error) {
      console.error('Erro ao marcar convite como usado:', error);
      return { 
        success: false, 
        message: 'Erro interno do servidor' 
      };
    }
  }

  // ========================================
  // CONVITES PARA COLABORADORES
  // ========================================

  /**
   * Cria convite para colaborador
   */
  async criarConviteColaborador(dados: ConviteData): Promise<InvitationResponse> {
    try {
      // Validações
      if (!dados.email || !dados.nome || !dados.empresa_id) {
        return { 
          success: false, 
          message: 'Email, nome e ID da empresa são obrigatórios' 
        };
      }

      // Verificar se já existe convite ativo para este email na empresa
      const { data: conviteExistente } = await supabase
        .from('convites_colaborador')
        .select('*')
        .eq('email', dados.email)
        .eq('empresa_id', dados.empresa_id)
        .eq('status', 'pendente')
        .gt('validade', new Date().toISOString())
        .single();

      if (conviteExistente) {
        return { 
          success: false, 
          message: 'Já existe um convite ativo para este email nesta empresa' 
        };
      }

      // Verificar se colaborador já está cadastrado na empresa
      const { data: colaboradorExistente } = await supabase
        .from('colaboradores')
        .select('id')
        .eq('email', dados.email)
        .eq('empresa_id', dados.empresa_id)
        .single();

      if (colaboradorExistente) {
        return { 
          success: false, 
          message: 'Este colaborador já está cadastrado nesta empresa' 
        };
      }

      // Criar convite
      const token = this.generateToken();
      const dataExpiracao = this.getExpirationDate(dados.dias_expiracao);

      const { data: novoConvite, error } = await supabase
        .from('convites_colaborador')
        .insert({
          token,
          email: dados.email,
          nome: dados.nome,
          empresa_id: dados.empresa_id,
          validade: dataExpiracao,
          status: 'pendente'
        })
        .select('*, empresas(nome_empresa)')
        .single();

      if (error) {
        console.error('Erro ao criar convite colaborador:', error);
        return { 
          success: false, 
          message: 'Erro ao criar convite' 
        };
      }

      return { 
        success: true, 
        message: 'Convite criado com sucesso',
        token,
        convite: novoConvite
      };

    } catch (error) {
      console.error('Erro ao criar convite colaborador:', error);
      return { 
        success: false, 
        message: 'Erro interno do servidor' 
      };
    }
  }

  /**
   * Valida convite de colaborador
   */
  async validarConviteColaborador(token: string): Promise<InvitationResponse> {
    try {
      if (!token) {
        return { 
          success: false, 
          message: 'Token é obrigatório' 
        };
      }

      const { data: convite, error } = await supabase
        .from('convites_colaborador')
        .select('*, empresas(nome_empresa)')
        .eq('token', token)
        .single();

      if (error || !convite) {
        return { 
          success: false, 
          message: 'Convite não encontrado' 
        };
      }

      // Verificar se já foi usado
      if (convite.status === 'usado') {
        return { 
          success: false, 
          message: 'Este convite já foi utilizado' 
        };
      }

      // Verificar expiração
      if (new Date(convite.validade) < new Date()) {
        return { 
          success: false, 
          message: 'Este convite expirou' 
        };
      }

      return { 
        success: true, 
        message: 'Convite válido',
        convite,
        data: convite
      };

    } catch (error) {
      console.error('Erro ao validar convite colaborador:', error);
      return { 
        success: false, 
        message: 'Erro interno do servidor' 
      };
    }
  }

  /**
   * Marca convite de colaborador como usado
   */
  async marcarConviteColaboradorUsado(token: string): Promise<InvitationResponse> {
    try {
      const { data, error } = await supabase
        .from('convites_colaborador')
        .update({ 
          status: 'usado'
        })
        .eq('token', token)
        .select('*, empresas(nome_empresa)')
        .single();

      if (error) {
        console.error('Erro ao marcar convite como usado:', error);
        return { 
          success: false, 
          message: 'Erro ao processar convite' 
        };
      }

      return { 
        success: true, 
        message: 'Convite processado com sucesso',
        convite: data
      };

    } catch (error) {
      console.error('Erro ao marcar convite como usado:', error);
      return { 
        success: false, 
        message: 'Erro interno do servidor' 
      };
    }
  }

  // ========================================
  // MÉTODOS DE CONSULTA
  // ========================================

  /**
   * Lista convites de empresa (para admins)
   */
  async listarConvitesEmpresa(adminId?: string): Promise<InvitationResponse> {
    try {
      let query = supabase
        .from('convites_empresa')
        .select('*')
        .order('created_at', { ascending: false });

      if (adminId) {
        query = query.eq('admin_id', adminId);
      }

      const { data: convites, error } = await query;

      if (error) {
        console.error('Erro ao listar convites empresa:', error);
        return { 
          success: false, 
          message: 'Erro ao buscar convites' 
        };
      }

      return { 
        success: true, 
        message: 'Convites encontrados',
        data: convites
      };

    } catch (error) {
      console.error('Erro ao listar convites empresa:', error);
      return { 
        success: false, 
        message: 'Erro interno do servidor' 
      };
    }
  }

  /**
   * Lista convites de colaborador (para empresas)
   */
  async listarConvitesColaborador(empresaId: string): Promise<InvitationResponse> {
    try {
      const { data: convites, error } = await supabase
        .from('convites_colaborador')
        .select('*, empresas(nome_empresa)')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao listar convites colaborador:', error);
        return { 
          success: false, 
          message: 'Erro ao buscar convites' 
        };
      }

      return { 
        success: true, 
        message: 'Convites encontrados',
        data: convites
      };

    } catch (error) {
      console.error('Erro ao listar convites colaborador:', error);
      return { 
        success: false, 
        message: 'Erro interno do servidor' 
      };
    }
  }

  /**
   * Cancela convite (marca como expirado)
   */
  async cancelarConvite(token: string, tipo: 'empresa' | 'colaborador'): Promise<InvitationResponse> {
    try {
      const tabela = tipo === 'empresa' ? 'convites_empresa' : 'convites_colaborador';
      
      const { data, error } = await supabase
        .from(tabela)
        .update({ 
          validade: new Date().toISOString() // Define como expirado agora
        })
        .eq('token', token)
        .eq('status', 'pendente')
        .select()
        .single();

      if (error) {
        console.error('Erro ao cancelar convite:', error);
        return { 
          success: false, 
          message: 'Erro ao cancelar convite' 
        };
      }

      if (!data) {
        return { 
          success: false, 
          message: 'Convite não encontrado ou já utilizado' 
        };
      }

      return { 
        success: true, 
        message: 'Convite cancelado com sucesso',
        convite: data
      };

    } catch (error) {
      console.error('Erro ao cancelar convite:', error);
      return { 
        success: false, 
        message: 'Erro interno do servidor' 
      };
    }
  }


  /**
   * Valida convite genérico (empresa ou colaborador)
   */
  async validarConvite(token: string, tipo: 'empresa' | 'colaborador'): Promise<InvitationResponse> {
    try {
      if (tipo === 'empresa') {
        return await this.validarConviteEmpresa(token);
      } else {
        return await this.validarConviteColaborador(token);
      }
    } catch (error) {
      console.error('Erro ao validar convite:', error);
      return { 
        success: false, 
        message: 'Erro interno do servidor' 
      };
    }
  }

  /**
   * Gera URL completa do convite
   */
  gerarUrlConvite(token: string, tipo: 'empresa' | 'colaborador'): string {
    const baseUrl = window.location.origin;
    const path = tipo === 'empresa' ? '/convite/empresa' : '/convite/colaborador';
    return `${baseUrl}${path}/${token}`;
  }

  /**
   * Limpa convites expirados (método de manutenção)
   */
  async limparConvitesExpirados(): Promise<InvitationResponse> {
    try {
      const agora = new Date().toISOString();

      // Limpar convites de empresa expirados
      const { error: errorEmpresa } = await supabase
        .from('convites_empresa')
        .delete()
        .lt('validade', agora)
        .eq('status', 'pendente');

      // Limpar convites de colaborador expirados
      const { error: errorColaborador } = await supabase
        .from('convites_colaborador')
        .delete()
        .lt('validade', agora)
        .eq('status', 'pendente');

      if (errorEmpresa || errorColaborador) {
        console.error('Erro ao limpar convites:', { errorEmpresa, errorColaborador });
        return { 
          success: false, 
          message: 'Erro ao limpar convites expirados' 
        };
      }

      return { 
        success: true, 
        message: 'Convites expirados removidos com sucesso'
      };

    } catch (error) {
      console.error('Erro ao limpar convites expirados:', error);
      return { 
        success: false, 
        message: 'Erro interno do servidor' 
      };
    }
  }
}

// Instância singleton do serviço de convites
export const invitationService = new InvitationService();