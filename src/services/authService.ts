// WRAPPER: Redireciona para o novo serviço de autenticação local
import { authServiceNew, User as NewUser, AuthResponse as NewAuthResponse } from './authServiceNew';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'empresa' | 'colaborador';
  redirectUrl: string;
  empresaId?: string;
  permissoes?: any;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  data?: any;
}

class AuthService {
  private currentUser: User | null = null;
  private initializationPromise: Promise<void>;

  constructor() {
    this.initializationPromise = this.initializeAuth();
  }

  async waitForInitialization(): Promise<void> {
    return this.initializationPromise;
  }

  private async initializeAuth() {
    console.log('🔄 [AuthService] Usando novo serviço de autenticação local');
    this.currentUser = authServiceNew.getCurrentUser();
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const result = await authServiceNew.login(email, password);
    if (result.success && result.user) {
      this.currentUser = result.user;
    }
    return result;
  }

  async logout(): Promise<void> {
    await authServiceNew.logout();
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return authServiceNew.getCurrentUser();
  }

  isAuthenticated(): boolean {
    return authServiceNew.isAuthenticated();
  }

  // Métodos legados vazios para compatibilidade
  async registrarAdmin(data: any): Promise<AuthResponse> {
    const result = await authServiceNew.registrarAdmin(data.email, data.nome, data.senha);
    if (result.success && result.user) {
      this.currentUser = result.user;
    }
    return result;
  }

  async registrarEmpresa(data: any): Promise<AuthResponse> {
    console.warn('⚠️ registrarEmpresa deve usar o endpoint de aceitar convite');
    return { success: false, message: 'Use o endpoint de convites' };
  }

  async registrarColaborador(data: any): Promise<AuthResponse> {
    console.warn('⚠️ registrarColaborador deve usar o endpoint de aceitar convite');
    return { success: false, message: 'Use o endpoint de convites' };
  }

  async verificarConviteEmpresa(token: string): Promise<any> {
    console.warn('⚠️ Use apiService.buscarConvitePorToken');
    return { success: false };
  }

  async verificarConviteColaborador(token: string): Promise<any> {
    console.warn('⚠️ Use apiService.buscarConvitePorToken');
    return { success: false };
  }

  validarSenha(senha: string): { valida: boolean; erros: string[] } {
    const erros: string[] = [];
    
    if (senha.length < 6) {
      erros.push('A senha deve ter pelo menos 6 caracteres');
    }
    
    return {
      valida: erros.length === 0,
      erros
    };
  }

  async getEmpresas(): Promise<{ success: boolean; data?: any[]; message?: string }> {
    return authServiceNew.getEmpresas();
  }

  async getColaboradores(): Promise<{ success: boolean; data?: any[]; message?: string }> {
    return authServiceNew.getColaboradores();
  }

  async getColaboradorById(id: string): Promise<{ success: boolean; data?: any; message?: string }> {
    return authServiceNew.getColaboradorById(id);
  }

  async getResultadosColaborador(colaboradorId: string): Promise<{ success: boolean; data?: any[]; message?: string }> {
    return authServiceNew.getResultadosColaborador(colaboradorId);
  }
}

export const authService = new AuthService();
