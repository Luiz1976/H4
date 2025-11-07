import { apiService } from './apiService';

export interface EstatisticasEmpresa {
  total_colaboradores: number;
  colaboradores_ativos: number;
  total_testes_realizados: number;
  convites_pendentes: number;
  testes_este_mes: number;
  media_pontuacao: number;
}

class EmpresaStatisticsService {
  async buscarEstatisticasEmpresa(empresaId: string): Promise<EstatisticasEmpresa> {
    try {
      const response = await apiService.obterEstatisticasEmpresa();
      return response.estatisticas;
    } catch (error) {
      console.error('Erro ao buscar estatísticas da empresa:', error);
      
      return {
        total_colaboradores: 0,
        colaboradores_ativos: 0,
        total_testes_realizados: 0,
        convites_pendentes: 0,
        testes_este_mes: 0,
        media_pontuacao: 0
      };
    }
  }
}

export const empresaStatisticsService = new EmpresaStatisticsService();
