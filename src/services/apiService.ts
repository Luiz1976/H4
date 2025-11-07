// Serviço para comunicação com a API backend
// Em desenvolvimento: usa URL relativa (proxy Vite)
// Em produção: usa VITE_API_URL do ambiente
import Cookies from 'js-cookie';
const RAW_API_BASE = import.meta.env.VITE_API_URL || '';
const API_BASE_URL = RAW_API_BASE.replace(/\/+$/, '').replace(/\/api$/, '');
// Fallback opcional para produção
const RAW_FALLBACK_BASE = import.meta.env.VITE_API_FALLBACK_URL || '';
const API_FALLBACK_BASE = RAW_FALLBACK_BASE.replace(/\/+$/, '').replace(/\/api$/, '');

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface ConviteEmpresa {
  nomeEmpresa: string;
  emailContato: string;
  diasValidade?: number;
}

interface ConviteColaborador {
  nome: string;
  email: string;
  cargo?: string;
  departamento?: string;
  diasValidade?: number;
}

interface ConviteResponse {
  id: string;
  token: string;
  nomeEmpresa?: string;
  emailContato?: string;
  email?: string;
  nome?: string;
  cargo?: string;
  departamento?: string;
  validade: string;
  status: string;
  linkConvite?: string;
}

function getAuthToken(): string | null {
  // Preferir cookies em produção; fallback para localStorage
  const cookieToken = Cookies.get('authToken');
  if (cookieToken && typeof cookieToken === 'string' && cookieToken.length > 0) {
    return cookieToken;
  }
  const lsToken = localStorage.getItem('authToken');
  return lsToken || null;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const buildUrl = (base: string) => `${base}${endpoint}`;

    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const primaryUrl = API_BASE_URL ? buildUrl(API_BASE_URL) : endpoint; // relativo se base vazia

    const tryFetch = async (url: string) => {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (_) {
        data = null;
      }

      if (!response.ok) {
        const err = new Error(data?.error || `HTTP ${response.status}: ${response.statusText}`) as any;
        err.status = response.status;
        err.url = url;
        err.data = data;
        throw err;
      }

      return data as T;
    };

    try {
      return await tryFetch(primaryUrl);
    } catch (error: any) {
      const isServerError = typeof error?.status === 'number' && error.status >= 500;
      const isNetworkError = !error?.status; // falha de rede geralmente não tem status
      const canFallback = Boolean(API_FALLBACK_BASE);

      if ((isServerError || isNetworkError) && canFallback) {
        const fallbackUrl = buildUrl(API_FALLBACK_BASE);
        console.warn(`⚠️ [ApiService] Erro em '${primaryUrl}' → tentando fallback '${fallbackUrl}'`);
        return await tryFetch(fallbackUrl);
      }

      throw error;
    }
  }

  // Health check da API
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest('/health');
  }

  // Criar convite de empresa
  async criarConviteEmpresa(dados: ConviteEmpresa): Promise<ConviteResponse> {
    const response = await this.makeRequest<{ convite: ConviteResponse; linkConvite: string }>(
      '/api/convites/empresa',
      {
        method: 'POST',
        body: JSON.stringify(dados),
      }
    );
    return response.convite;
  }

  // Criar convite de colaborador
  async criarConviteColaborador(dados: ConviteColaborador): Promise<ConviteResponse> {
    const response = await this.makeRequest<{ convite: ConviteResponse; linkConvite: string }>(
      '/api/convites/colaborador',
      {
        method: 'POST',
        body: JSON.stringify(dados),
      }
    );
    return response.convite;
  }

  // Buscar convite por token
  async buscarConvitePorToken(token: string, tipo: 'empresa' | 'colaborador'): Promise<ConviteResponse> {
    const response = await this.makeRequest<{ convite: ConviteResponse; tipo: string }>(
      `/api/convites/token/${token}?tipo=${tipo}`
    );
    return response.convite;
  }

  // Aceitar convite de empresa
  async aceitarConviteEmpresa(token: string, senha: string): Promise<{ message: string; empresa: any }> {
    return this.makeRequest(`/api/convites/empresa/aceitar/${token}`, {
      method: 'POST',
      body: JSON.stringify({ senha }),
    });
  }

  // Aceitar convite de colaborador
  async aceitarConviteColaborador(token: string, senha: string): Promise<{ message: string; colaborador: any }> {
    return this.makeRequest(`/api/convites/colaborador/aceitar/${token}`, {
      method: 'POST',
      body: JSON.stringify({ senha }),
    });
  }

  // Listar convites
  async listarConvites(): Promise<{ convites: ConviteResponse[]; tipo: string }> {
    return this.makeRequest('/api/convites/listar');
  }

  // Cancelar convite de colaborador
  async cancelarConviteColaborador(token: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`/api/convites/colaborador/${token}`, {
      method: 'DELETE',
    });
  }

  // Cancelar convite de empresa
  async cancelarConviteEmpresa(token: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest(`/api/convites/empresa/${token}`, {
      method: 'DELETE',
    });
  }

  // Listar testes disponíveis
  async listarTestes(): Promise<{ testes: any[] }> {
    return this.makeRequest('/api/testes');
  }

  // Obter perguntas de um teste
  async obterPerguntasTeste(testeId: string): Promise<{ perguntas: any[]; total: number }> {
    return this.makeRequest(`/api/testes/${testeId}/perguntas`);
  }

  // Submeter resultado de teste
  async submeterResultadoTeste(dados: {
    testeId: string;
    respostas: Array<{ perguntaId: string; valor: string; pontuacao?: number }>;
    tempoGasto?: number;
    sessionId?: string;
  }): Promise<{ message: string; resultado: any }> {
    return this.makeRequest('/api/testes/resultado', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  // Obter meus resultados
  async obterMeusResultados(): Promise<{ resultados: any[]; total: number }> {
    return this.makeRequest('/api/testes/resultados/meus');
  }

  // Obter resultado por ID
  async obterResultadoPorId(id: string): Promise<{ resultado: any; respostas: any[] }> {
    return this.makeRequest(`/api/testes/resultado/${id}`);
  }

  // Obter dados da empresa
  async obterDadosEmpresa(): Promise<{ empresa: any }> {
    return this.makeRequest('/api/empresas/me');
  }

  // Listar colaboradores da empresa
  async listarColaboradores(): Promise<{ colaboradores: any[]; total: number }> {
    return this.makeRequest('/api/empresas/colaboradores');
  }

  // Obter estatísticas da empresa
  async obterEstatisticasEmpresa(): Promise<{ estatisticas: any }> {
    return this.makeRequest('/api/empresas/estatisticas');
  }

  // Salvar resultado de teste psicológico
  async salvarResultadoTeste(dados: {
    testeId?: string | null;
    usuarioId?: string | null;
    pontuacaoTotal: number;
    tempoGasto?: number;
    sessionId?: string;
    metadados?: any;
    status?: string;
    userEmail?: string;
    empresaId?: string | null;
  }): Promise<{ id: string; pontuacaoTotal: number; dataRealizacao: string }> {
    const token = getAuthToken();
    
    // Se tiver token, usa endpoint autenticado; senão usa anônimo
    const endpoint = token ? '/api/testes/resultado' : '/api/testes/resultado/anonimo';
    
    const response = await this.makeRequest<{ resultado: any }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(dados),
    });
    
    return response.resultado;
  }
  async obterDashboardAdmin(): Promise<any> {
    return this.makeRequest('/api/admin/dashboard');
  }
}

export const apiService = new ApiService();
export type { ConviteEmpresa, ConviteColaborador, ConviteResponse, ApiResponse };
