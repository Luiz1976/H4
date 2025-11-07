import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  User, 
  Award,
  Search,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { empresaStatisticsService } from '../../services/empresaStatisticsService';

interface ResultadoTeste {
  id: string;
  colaborador_nome: string;
  colaborador_email: string;
  teste_nome: string;
  pontuacao: number;
  pontuacao_maxima: number;
  percentual: number;
  tempo_conclusao: number; // em minutos
  data_realizacao: string;
  status: 'concluido' | 'em_andamento' | 'nao_iniciado';
  categoria: string;
  nivel_dificuldade: 'facil' | 'medio' | 'dificil';
}

export default function EmpresaResultados() {
  const [resultados, setResultados] = useState<ResultadoTeste[]>([]);
  const [filtroResultados, setFiltroResultados] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarResultados = async () => {
      const user = authService.getCurrentUser();
      if (!user?.empresaId) {
        console.log('🔍 [EmpresaResultados] Usuário sem empresaId:', user);
        return;
      }

      console.log('🔍 [EmpresaResultados] Iniciando carregamento de resultados para empresa:', user.empresaId);
      setLoading(true);
      
      try {
        const resultados = await empresaStatisticsService.buscarResultadosEmpresa(user.empresaId);
        console.log('✅ [EmpresaResultados] Resultados carregados com sucesso:', resultados);
        setResultados(resultados);
      } catch (error) {
        console.error('❌ [EmpresaResultados] Erro ao carregar resultados:', error);
        toast.error('Erro ao carregar resultados da empresa');
      } finally {
        setLoading(false);
        console.log('🔍 [EmpresaResultados] Carregamento finalizado');
      }
    };

    carregarResultados();
  }, []);

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarTempo = (minutos: number) => {
    if (minutos === 0) return '-';
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    if (horas > 0) {
      return `${horas}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluido':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            <Award className="w-3 h-3 mr-1" />
            Concluído
          </span>
        );
      case 'em_andamento':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <BarChart3 className="w-3 h-3 mr-1" />
            Em Andamento
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            Não Iniciado
          </span>
        );
    }
  };

  const getPerformanceBadge = (percentual: number) => {
    if (percentual >= 90) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          <TrendingUp className="w-3 h-3 mr-1" />
          Excelente
        </span>
      );
    } else if (percentual >= 70) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          Bom
        </span>
      );
    } else if (percentual >= 50) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Regular
        </span>
      );
    } else if (percentual > 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          <TrendingDown className="w-3 h-3 mr-1" />
          Baixo
        </span>
      );
    }
    return null;
  };

  const resultadosFiltrados = resultados.filter(resultado => {
    const matchesSearch = resultado.colaborador_nome.toLowerCase().includes(filtroResultados.toLowerCase()) ||
                         resultado.teste_nome.toLowerCase().includes(filtroResultados.toLowerCase()) ||
                         resultado.colaborador_email.toLowerCase().includes(filtroResultados.toLowerCase());
    
    const matchesCategoria = categoriaFiltro === 'todas' || resultado.categoria === categoriaFiltro;
    const matchesStatus = statusFiltro === 'todos' || resultado.status === statusFiltro;
    
    return matchesSearch && matchesCategoria && matchesStatus;
  });

  const categorias = [...new Set(resultados.map(r => r.categoria))];

  const estatisticas = {
    totalTestes: resultados.length,
    testesCompletos: resultados.filter(r => r.status === 'concluido').length,
    mediaGeral: resultados.filter(r => r.status === 'concluido').length > 0 
      ? Math.round(resultados.filter(r => r.status === 'concluido').reduce((acc, r) => acc + r.percentual, 0) / resultados.filter(r => r.status === 'concluido').length)
      : 0,
    tempoMedio: resultados.filter(r => r.status === 'concluido' && r.tempo_conclusao > 0).length > 0
      ? Math.round(resultados.filter(r => r.status === 'concluido' && r.tempo_conclusao > 0).reduce((acc, r) => acc + r.tempo_conclusao, 0) / resultados.filter(r => r.status === 'concluido' && r.tempo_conclusao > 0).length)
      : 0
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resultados dos Testes</h1>
          <p className="text-gray-600">Acompanhe o desempenho dos colaboradores nos testes</p>
        </div>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Exportar</span>
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total de Testes</p>
              <p className="text-lg font-semibold text-gray-900">{estatisticas.totalTestes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completos</p>
              <p className="text-lg font-semibold text-gray-900">{estatisticas.testesCompletos}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Média Geral</p>
              <p className="text-lg font-semibold text-gray-900">{estatisticas.mediaGeral}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-orange-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tempo Médio</p>
              <p className="text-lg font-semibold text-gray-900">{formatarTempo(estatisticas.tempoMedio)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por colaborador ou teste..."
                value={filtroResultados}
                onChange={(e) => setFiltroResultados(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todas">Todas as categorias</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os status</option>
              <option value="concluido">Concluído</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="nao_iniciado">Não Iniciado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Resultados */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Colaborador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teste
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pontuação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tempo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resultadosFiltrados.map((resultado) => (
                <tr key={resultado.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {resultado.colaborador_nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          {resultado.colaborador_email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{resultado.teste_nome}</div>
                    <div className="text-sm text-gray-500">{resultado.categoria}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(resultado.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {resultado.status === 'concluido' ? (
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{resultado.pontuacao}</span>
                        <span className="text-gray-500">/{resultado.pontuacao_maxima}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {resultado.status === 'concluido' ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{resultado.percentual}%</span>
                        {getPerformanceBadge(resultado.percentual)}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatarTempo(resultado.tempo_conclusao)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                      {formatarData(resultado.data_realizacao)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {resultado.status === 'concluido' && (
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {resultadosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum resultado encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filtroResultados || categoriaFiltro !== 'todas' || statusFiltro !== 'todos'
                ? 'Tente ajustar os filtros de busca.' 
                : 'Nenhum teste foi realizado ainda.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}