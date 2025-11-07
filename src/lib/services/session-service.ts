/**
 * Serviço de Gerenciamento de Sessão
 * Responsável por gerar e manter identificadores únicos de sessão para usuários anônimos
 */

export interface SessionInfo {
  sessionId: string;
  createdAt: string;
  lastActivity: string;
  userAgent: string;
}

export class SessionService {
  private readonly SESSION_KEY = 'humaniq_session_id';
  private readonly SESSION_INFO_KEY = 'humaniq_session_info';
  
  /**
   * Gera um ID de sessão único
   */
  private generateSessionId(): string {
    // Preferir UUID v4 válido (compatível com coluna UUID do banco)
    try {
      // Navegadores modernos
      if (typeof crypto !== 'undefined' && 'randomUUID' in crypto && typeof (crypto as any).randomUUID === 'function') {
        return (crypto as any).randomUUID();
      }
      // Fallback com getRandomValues
      if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
        const buf = new Uint8Array(16);
        (crypto as any).getRandomValues(buf);
        // Ajustes para formato UUID v4
        buf[6] = (buf[6] & 0x0f) | 0x40; // versão 4
        buf[8] = (buf[8] & 0x3f) | 0x80; // variante RFC 4122
        const toHex = (n: number) => n.toString(16).padStart(2, '0');
        const hex = Array.from(buf, toHex).join('');
        return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}`;
      }
    } catch (_) {
      // Ignorar e cair no fallback abaixo
    }
    // Fallback final (não criptograficamente seguro, mas no formato UUID v4)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Obtém informações do user agent
   */
  private getUserAgent(): string {
    return navigator.userAgent || 'Unknown';
  }

  /**
   * Obtém ou cria um ID de sessão
   */
  getSessionId(): string {
    let sessionId = localStorage.getItem(this.SESSION_KEY);
    const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    
    // Se não existir ou não for um UUID v4 válido, gerar um novo
    if (!sessionId || !isValidUUID(sessionId)) {
      sessionId = this.generateSessionId();
      this.createSession(sessionId);
    } else {
      // Atualizar última atividade
      this.updateLastActivity();
    }
    
    return sessionId;
  }

  /**
   * Cria uma nova sessão
   */
  private createSession(sessionId: string): void {
    const now = new Date().toISOString();
    const sessionInfo: SessionInfo = {
      sessionId,
      createdAt: now,
      lastActivity: now,
      userAgent: this.getUserAgent()
    };

    localStorage.setItem(this.SESSION_KEY, sessionId);
    localStorage.setItem(this.SESSION_INFO_KEY, JSON.stringify(sessionInfo));

    console.log('🔑 [SESSION-SERVICE] Nova sessão criada:', sessionId);
  }

  /**
   * Atualiza a última atividade da sessão
   */
  private updateLastActivity(): void {
    const sessionInfoStr = localStorage.getItem(this.SESSION_INFO_KEY);
    if (sessionInfoStr) {
      try {
        const sessionInfo: SessionInfo = JSON.parse(sessionInfoStr);
        sessionInfo.lastActivity = new Date().toISOString();
        localStorage.setItem(this.SESSION_INFO_KEY, JSON.stringify(sessionInfo));
      } catch (error) {
        console.warn('⚠️ [SESSION-SERVICE] Erro ao atualizar atividade:', error);
      }
    }
  }

  /**
   * Obtém informações completas da sessão
   */
  getSessionInfo(): SessionInfo | null {
    const sessionInfoStr = localStorage.getItem(this.SESSION_INFO_KEY);
    if (!sessionInfoStr) return null;

    try {
      return JSON.parse(sessionInfoStr);
    } catch (error) {
      console.warn('⚠️ [SESSION-SERVICE] Erro ao ler informações da sessão:', error);
      return null;
    }
  }

  /**
   * Limpa a sessão atual (útil para testes ou reset)
   */
  clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.SESSION_INFO_KEY);
    console.log('🧹 [SESSION-SERVICE] Sessão limpa');
  }

  /**
   * Verifica se a sessão é válida (não expirada)
   */
  isSessionValid(): boolean {
    const sessionInfo = this.getSessionInfo();
    if (!sessionInfo) return false;

    // Considerar sessão válida por 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const lastActivity = new Date(sessionInfo.lastActivity);
    return lastActivity > thirtyDaysAgo;
  }

  /**
   * Renova a sessão se necessário
   */
  renewSessionIfNeeded(): string {
    if (!this.isSessionValid()) {
      this.clearSession();
    }
    return this.getSessionId();
  }

  /**
   * Obtém dados para salvamento no banco
   */
  getSessionDataForDatabase() {
    const sessionInfo = this.getSessionInfo();
    return {
      session_id: this.getSessionId(),
      user_agent: sessionInfo?.userAgent || this.getUserAgent(),
      // IP será obtido pelo servidor se necessário
      ip_address: null
    };
  }
}

// Instância singleton do serviço
export const sessionService = new SessionService();

// Hook para usar em componentes React
export const useSession = () => {
  const sessionId = sessionService.getSessionId();
  const sessionInfo = sessionService.getSessionInfo();
  
  return {
    sessionId,
    sessionInfo,
    renewSession: () => sessionService.renewSessionIfNeeded(),
    clearSession: () => sessionService.clearSession(),
    getSessionData: () => sessionService.getSessionDataForDatabase()
  };
};

/**
 * Função para obter sessão atual (compatibilidade com imports existentes)
 */
export function obterSessaoAtual(): SessionInfo | null {
  return sessionService.getSessionInfo();
}