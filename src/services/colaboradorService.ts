import { authService } from './authService';

export interface ColaboradorCompleto {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  departamento?: string;
  avatar?: string;
  empresaId: string;
  permissoes: any;
  ativo: boolean;
  createdAt: string;
}

class ColaboradorService {
  async getDadosColaboradorLogado(): Promise<ColaboradorCompleto | null> {
    try {
      console.log('🔍 [ColaboradorService] Iniciando busca por dados do colaborador logado...');
      
      // Obter token de autenticação
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.log('⚠️ [ColaboradorService] Nenhum token encontrado');
        return null;
      }

      // Buscar dados do colaborador via API
      const response = await fetch('/api/colaboradores/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('❌ [ColaboradorService] Erro ao buscar colaborador:', response.status);
        return null;
      }

      const data = await response.json();
      console.log('✅ [ColaboradorService] Colaborador encontrado com sucesso:', data.colaborador);
      
      return data.colaborador;
    } catch (error) {
      console.error('❌ [ColaboradorService] Erro geral:', error);
      return null;
    }
  }

  /**
   * Atualiza dados do colaborador
   */
  async atualizarColaborador(id: string, dados: Partial<ColaboradorCompleto>): Promise<boolean> {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('Nenhum token encontrado');
        return false;
      }

      const response = await fetch(`/api/colaboradores/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
      });

      if (!response.ok) {
        console.error('Erro ao atualizar colaborador:', response.status);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro no serviço de atualização:', error);
      return false;
    }
  }
}

export const colaboradorService = new ColaboradorService();
