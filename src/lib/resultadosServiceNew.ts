import { apiService } from '../services/apiService';

export const resultadosService = {
  /**
   * Salvar resultado de um teste usando a API local
   */
  async salvarResultado(resultado: any): Promise<any> {
    try {
      console.log('🔍 [RESULTADOS-SERVICE] Iniciando salvamento via API local');
      console.log('📊 [RESULTADOS-SERVICE] Dados recebidos:', JSON.stringify(resultado, null, 2));
      
      // Preparar dados para API (converter snake_case para camelCase)
      const dadosApi = {
        testeId: resultado.teste_id || null,
        usuarioId: resultado.usuario_id || null,
        pontuacaoTotal: Number(resultado.pontuacao_total),
        tempoGasto: resultado.tempo_gasto ? Number(resultado.tempo_gasto) : undefined,
        sessionId: resultado.session_id,
        metadados: resultado.metadados,
        status: resultado.status || 'concluido',
        userEmail: resultado.user_email || undefined,
        empresaId: resultado.empresa_id || null,
      };
      
      console.log('🔍 [RESULTADOS-SERVICE] Enviando para API local:', JSON.stringify(dadosApi, null, 2));
      
      // Salvar via API local
      const resultadoSalvo = await apiService.salvarResultadoTeste(dadosApi);
      
      console.log('✅ [RESULTADOS-SERVICE] Resultado salvo com sucesso via API:', resultadoSalvo);
      
      // Salvar no cache local para acesso sem autenticação
      if (resultadoSalvo && resultadoSalvo.id) {
        try {
          const resultadosCache = localStorage.getItem('resultadosCache');
          const cache = resultadosCache ? JSON.parse(resultadosCache) : {};
          cache[resultadoSalvo.id] = resultadoSalvo;
          localStorage.setItem('resultadosCache', JSON.stringify(cache));
          console.log('✅ [RESULTADOS-SERVICE] Resultado salvo no cache local');
        } catch (e) {
          console.warn('⚠️ [RESULTADOS-SERVICE] Erro ao salvar no cache local:', e);
        }
      }
      
      // Se é um colaborador logado e o teste foi concluído, marcar como indisponível
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('currentUser');
      
      if (token && user && resultado.teste_id) {
        try {
          const userData = JSON.parse(user);
          
          // Apenas marcar como concluído se for um colaborador
          if (userData.role === 'colaborador') {
            console.log('🔒 [RESULTADOS-SERVICE] Marcando teste como concluído para colaborador...');
            
            const response = await fetch('/api/teste-disponibilidade/marcar-concluido', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                testeId: resultado.teste_id,
                colaboradorId: userData.userId
              })
            });

            if (response.ok) {
              console.log('✅ [RESULTADOS-SERVICE] Teste marcado como indisponível com sucesso');
              
              // ✅ Disparar evento customizado para invalidar cache no frontend
              window.dispatchEvent(new CustomEvent('teste-concluido', { 
                detail: { testeId: resultado.teste_id } 
              }));
              console.log('🔄 [RESULTADOS-SERVICE] Evento teste-concluido disparado');
            } else {
              const error = await response.json();
              console.error('⚠️ [RESULTADOS-SERVICE] Erro ao marcar teste como indisponível:', error);
            }
          }
        } catch (error) {
          // Não bloquear o fluxo se falhar ao marcar como indisponível
          console.error('⚠️ [RESULTADOS-SERVICE] Erro ao processar marcação de disponibilidade:', error);
        }
      }
      
      return resultadoSalvo;
      
    } catch (error) {
      console.error('❌ [RESULTADOS-SERVICE] Erro ao salvar:', error);
      console.error('❌ [RESULTADOS-SERVICE] Stack trace:', error instanceof Error ? error.stack : 'Sem stack trace');
      throw error;
    }
  },

  /**
   * Buscar resultado por ID diretamente do banco de dados
   */
  async buscarResultadoPorId(resultadoId: string): Promise<any> {
    try {
      console.log('🔍 [RESULTADOS-SERVICE] Buscando resultado por ID:', resultadoId);
      
      // Buscar diretamente do sessionStorage/localStorage
      const sessionId = sessionStorage.getItem('session_id') || localStorage.getItem('session_id');
      
      // Importar dinamicamente o serviço de banco de dados
      const { resultadosService: dbResultadosService } = await import('./database');
      
      // Buscar resultado por ID
      const resultado = await dbResultadosService.buscarResultadoPorId(resultadoId);
      
      if (!resultado) {
        throw new Error('Resultado não encontrado');
      }
      
      console.log('✅ [RESULTADOS-SERVICE] Resultado encontrado:', resultado);
      
      return resultado;
      
    } catch (error) {
      console.error('❌ [RESULTADOS-SERVICE] Erro ao buscar resultado:', error);
      throw error;
    }
  },
};
