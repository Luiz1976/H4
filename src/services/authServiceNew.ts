import Cookies from 'js-cookie';

// Base URL da API
// Em produção, usa VITE_API_URL (ex.: https://api.humaniqai.com.br)
// Em desenvolvimento, faz fallback para http://localhost:3001
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
// Normalizar base para evitar duplicações de "/api" e barras finais
const NORMALIZED_BASE = (API_BASE_URL || '').replace(/\/api\/?$/, '').replace(/\/+$/, '');
// NOVO: Fallback opcional via variável de ambiente
const API_FALLBACK_URL = import.meta.env.VITE_API_FALLBACK_URL || '';
const FALLBACK_BASE = (API_FALLBACK_URL || '').replace(/\/api\/?$/, '').replace(/\/+$/, '');

// Configurações de cookies para produção/desenvolvimento
const getCookieConfig = () => {
  const isProduction = import.meta.env.PROD;
  return {
    domain: isProduction ? '.humaniqai.com.br' : undefined,
    secure: isProduction,
    sameSite: 'lax' as const,
    expires: 7 // 7 dias
  };
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'empresa' | 'colaborador';
  redirectUrl: string;
  empresaId?: string;
  permissoes?: any;
  avatar?: string;
  cargo?: string;
  departamento?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

class AuthServiceNew {
  private currentUser: User | null = null;
  private token: string | null = null;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    // Priorizar cookies, fallback para localStorage
    const cookieUser = Cookies.get('currentUser');
    const cookieToken = Cookies.get('authToken');
    
    const storedUser = cookieUser || localStorage.getItem('currentUser');
    const storedToken = cookieToken || localStorage.getItem('authToken');

    if (storedUser && storedToken) {
      try {
        this.currentUser = JSON.parse(storedUser);
        this.token = storedToken;
        
        // Migrar para cookies se ainda estiver no localStorage
        if (!cookieUser || !cookieToken) {
          this.saveAuthData(this.currentUser, this.token);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de autenticação:', error);
        this.clearAuth();
      }
    }
  }

  private saveAuthData(user: User, token: string) {
    const cookieConfig = getCookieConfig();
    
    // Salvar nos cookies (preferido para produção)
    Cookies.set('currentUser', JSON.stringify(user), cookieConfig);
    Cookies.set('authToken', token, cookieConfig);
    
    // Manter no localStorage como fallback
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('authToken', token);
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${NORMALIZED_BASE}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    console.log(`🔄 [AuthService] Fazendo requisição: ${url}`);
    console.log(`🔄 [AuthService] API_BASE_URL: ${API_BASE_URL}`);
    console.log(`🔄 [AuthService] NORMALIZED_BASE: ${NORMALIZED_BASE}`);
    console.log(`🔄 [AuthService] FALLBACK_BASE: ${FALLBACK_BASE}`);
    console.log(`🔄 [AuthService] Headers:`, headers);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors',
        credentials: 'include',
      });

      console.log(`📡 [AuthService] Response status: ${response.status}`);
      console.log(`📡 [AuthService] Response ok: ${response.ok}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [AuthService] Erro HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ [AuthService] Resposta recebida:`, data);
      return data;
    } catch (error) {
      console.error(`❌ [AuthService] Erro na requisição para ${url}:`, error);
      
      // Tentar fallback automaticamente se houver falha de conectividade
      const isFetchFail = error instanceof TypeError && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'));
      const canFallback = FALLBACK_BASE && FALLBACK_BASE !== NORMALIZED_BASE;
      if (isFetchFail && canFallback) {
        const fallbackUrl = `${FALLBACK_BASE}${endpoint}`;
        console.warn(`⚠️ [AuthService] Tentando fallback: ${fallbackUrl}`);
        try {
          const fbResponse = await fetch(fallbackUrl, {
            ...options,
            headers,
            mode: 'cors',
            credentials: 'include',
          });
          console.log(`📡 [AuthService] Fallback status: ${fbResponse.status}`);
          if (fbResponse.ok) {
            const fbData = await fbResponse.json();
            console.warn(`✅ [AuthService] Fallback bem-sucedido em ${fallbackUrl}`);
            return fbData;
          } else {
            const fbText = await fbResponse.text();
            console.error(`❌ [AuthService] Fallback falhou: HTTP ${fbResponse.status}:`, fbText);
          }
        } catch (fbError) {
          console.error(`❌ [AuthService] Erro ao usar fallback ${fallbackUrl}:`, fbError);
        }
      }
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error(`🚨 [AuthService] Erro de conectividade - verifique se o servidor está rodando em ${NORMALIZED_BASE}`);
        console.error(`💡 [AuthService] Possíveis soluções:`);
        console.error(`   1. Verificar se o backend Render está online`);
        console.error(`   2. Iniciar servidor local: npm run server`);
        console.error(`   3. Verificar configuração VITE_API_URL no ambiente (Vercel/.env)`);
        if (canFallback) {
          console.error(`   4. Fallback tentou usar: ${FALLBACK_BASE} (defina VITE_API_FALLBACK_URL)`);
        }

        const detailedError = new Error(`Falha na conectividade com o backend.\n\n🔍 Diagnóstico:\n- URL tentada: ${url}\n- Backend primário: indisponível ou com erro (500/502)\n- Fallback: ${canFallback ? 'tentado' : 'não configurado'}\n\n🛠️ Soluções:\n1. Confirmar VITE_API_URL em produção\n2. Definir VITE_API_FALLBACK_URL (ex.: ngrok/Railway)\n3. Liberar espaço e executar local: npm run server\n4. Forçar redeploy e limpar cache no Vercel\n\n⚠️ Status atual: Sistema indisponível para login`);

        throw detailedError;
      }
      
      throw error;
    }
  }

  async registrarAdmin(email: string, nome: string, senha: string): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest<{ token: string; user: any }>('/api/auth/register/admin', {
        method: 'POST',
        body: JSON.stringify({ email, nome, senha }),
      });

      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.nome,
        role: 'admin',
        redirectUrl: '/admin',
      };

      this.currentUser = user;
      this.token = response.token;
      this.saveAuthData(user, response.token);

      return { success: true, user, token: response.token };
    } catch (error) {
      console.error('Erro ao registrar admin:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao registrar administrador'
      };
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest<{ token: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const roleMap: Record<string, string> = {
        admin: '/admin',
        empresa: '/empresa',
        colaborador: '/colaborador',
      };

      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.nome || response.user.name,
        role: response.user.role,
        redirectUrl: roleMap[response.user.role] || '/',
        empresaId: response.user.empresaId,
        avatar: response.user.avatar,
        cargo: response.user.cargo,
        departamento: response.user.departamento,
      };

      this.currentUser = user;
      this.token = response.token;
      this.saveAuthData(user, response.token);

      return { success: true, user, token: response.token };
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'E-mail ou senha inválidos'
      };
    }
  }

  async logout(): Promise<void> {
    this.clearAuth();
  }

  private clearAuth(): void {
    this.currentUser = null;
    this.token = null;
    
    // Limpar cookies
    Cookies.remove('currentUser', { 
      domain: import.meta.env.PROD ? '.humaniqai.com.br' : undefined 
    });
    Cookies.remove('authToken', { 
      domain: import.meta.env.PROD ? '.humaniqai.com.br' : undefined 
    });
    
    // Limpar localStorage como fallback
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser && !!this.token;
  }

  hasRole(...roles: ('admin' | 'empresa' | 'colaborador')[]): boolean {
    if (!this.currentUser) return false;
    return roles.includes(this.currentUser.role);
  }

  async getEmpresas(): Promise<{ success: boolean; data?: any[]; message?: string }> {
    try {
      const response = await this.makeRequest<{ data: any[] }>('/api/empresas', {
        method: 'GET'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Erro ao buscar empresas' };
    }
  }

  async getColaboradores(): Promise<{ success: boolean; data?: any[]; message?: string }> {
    try {
      const response = await this.makeRequest<{ data: any[] }>('/api/colaboradores', {
        method: 'GET'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Erro ao buscar colaboradores' };
    }
  }

  async getColaboradorById(id: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await this.makeRequest<{ data: any }>(`/api/colaboradores/${id}`, {
        method: 'GET'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Erro ao buscar colaborador' };
    }
  }

  async getResultadosColaborador(colaboradorId: string): Promise<{ success: boolean; data?: any[]; message?: string }> {
    try {
      const response = await this.makeRequest<{ data: any[] }>(`/api/testes/resultado/${colaboradorId}`, {
        method: 'GET'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Erro ao buscar resultados' };
    }
  }
}

export const authServiceNew = new AuthServiceNew();
