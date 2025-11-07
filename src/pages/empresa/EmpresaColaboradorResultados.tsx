import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Download,
  Eye
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { ResultadoPopup } from '@/components/ResultadoPopup';
import { GerenciamentoTestesColaborador } from '@/components/GerenciamentoTestesColaborador';
import { GerenciamentoCursosColaborador } from '@/components/GerenciamentoCursosColaborador';
import { PainelCursosColaborador } from '@/components/PainelCursosColaborador';

interface Colaborador {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  departamento?: string;
  ativo: boolean;
  created_at: string;
  avatar?: string;
}

interface ResultadoTeste {
  id: string;
  testeId: string;
  nomeTest: string;
  categoria: string;
  pontuacao: number;
  pontuacaoMaxima: number;
  percentual: number;
  status: 'concluido' | 'em_andamento' | 'nao_iniciado';
  dataRealizacao: string;
  tempoDuracao?: number;
  observacoes?: string;
  tipoTabela?: string;
  nivel?: string;
}

export default function EmpresaColaboradorResultados() {
  const { colaboradorId } = useParams<{ colaboradorId: string }>();
  const navigate = useNavigate();
  
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
  const [resultados, setResultados] = useState<ResultadoTeste[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroTeste, setFiltroTeste] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [colaboradorInfo, setColaboradorInfo] = useState<any>(null);
  
  // Estados para o popup
  const [popupAberto, setPopupAberto] = useState(false);
  const [resultadoSelecionado, setResultadoSelecionado] = useState<ResultadoTeste | null>(null);

  useEffect(() => {
    console.log('🔄 [EmpresaColaboradorResultados] useEffect executado');
    console.log('🔍 [EmpresaColaboradorResultados] colaboradorId:', colaboradorId);
    
    const initializeAndLoad = async () => {
      try {
        // Aguardar a inicialização do authService
        console.log('⏳ [EmpresaColaboradorResultados] Aguardando inicialização do authService...');
        await authService.waitForInitialization();
        
        console.log('👤 [EmpresaColaboradorResultados] Usuário atual após inicialização:', authService.getCurrentUser());
        
        if (colaboradorId) {
          console.log('✅ [EmpresaColaboradorResultados] Iniciando carregamento de dados...');
          await carregarDadosColaborador();
          await carregarResultadosTestes();
        } else {
          console.error('❌ [EmpresaColaboradorResultados] colaboradorId não encontrado na URL');
          toast.error('ID do colaborador não encontrado na URL');
          navigate('/empresa/gestao-colaboradores');
        }
      } catch (error) {
        console.error('💥 [EmpresaColaboradorResultados] Erro na inicialização:', error);
        toast.error('Erro ao inicializar a página');
        navigate('/empresa/gestao-colaboradores');
      }
    };
    
    initializeAndLoad();
  }, [colaboradorId]);

  const carregarDadosColaborador = async () => {
    try {
      console.log('🔍 [EmpresaColaboradorResultados] Iniciando carregamento do colaborador:', colaboradorId);
      
      if (!colaboradorId) {
        console.error('❌ [EmpresaColaboradorResultados] ID do colaborador não fornecido');
        toast.error('ID do colaborador não fornecido');
        navigate('/empresa/gestao-colaboradores');
        return;
      }

      const response = await authService.getColaboradorById(colaboradorId);
      console.log('📋 [EmpresaColaboradorResultados] Resposta do getColaboradorById:', response);
      
      if (response.success && response.data) {
        console.log('✅ [EmpresaColaboradorResultados] Colaborador carregado com sucesso:', response.data);
        setColaborador(response.data);
      } else {
        console.error('❌ [EmpresaColaboradorResultados] Erro ao carregar colaborador:', response.message);
        toast.error(response.message || 'Erro ao carregar dados do colaborador');
        navigate('/empresa/gestao-colaboradores');
      }
    } catch (error) {
      console.error('💥 [EmpresaColaboradorResultados] Erro interno ao carregar colaborador:', error);
      toast.error('Erro ao carregar dados do colaborador');
      navigate('/empresa/gestao-colaboradores');
    }
  };

  const carregarResultadosTestes = async () => {
    try {
      console.log('🔍 [EmpresaColaboradorResultados] Iniciando carregamento dos resultados para:', colaboradorId);
      console.log('👤 [EmpresaColaboradorResultados] Usuário atual:', authService.getCurrentUser());
      console.log('🏢 [EmpresaColaboradorResultados] Empresa atual:', authService.getCurrentUser()?.empresaId);
      setLoading(true);
      
      const response = await authService.getResultadosColaborador(colaboradorId!);
      console.log('📊 [EmpresaColaboradorResultados] Resposta COMPLETA do getResultadosColaborador:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        console.log('✅ [EmpresaColaboradorResultados] Resultados carregados:', response.data.length, 'resultados');
        console.log('📋 [EmpresaColaboradorResultados] Detalhes dos resultados:', response.data);
        setResultados(response.data);
      } else {
        console.error('❌ [EmpresaColaboradorResultados] Erro ao carregar resultados:', response.message);
        console.error('❌ [EmpresaColaboradorResultados] Response completo:', response);
        toast.error(response.message || 'Erro ao carregar resultados dos testes');
      }
    } catch (error) {
      console.error('💥 [EmpresaColaboradorResultados] Erro interno ao carregar resultados:', error);
      toast.error('Erro ao carregar resultados dos testes');
    } finally {
      setLoading(false);
    }
  };

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
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return horas > 0 ? `${horas}h ${mins}min` : `${mins}min`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-100 text-green-800';
      case 'em_andamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'nao_iniciado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="w-4 h-4" />;
      case 'em_andamento':
        return <Clock className="w-4 h-4" />;
      case 'nao_iniciado':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleViewResult = (resultado: ResultadoTeste) => {
    console.log('🔍 [EmpresaColaboradorResultados] handleViewResult chamado com:', resultado);
    
    // Verificar se o resultado é válido antes de abrir o popup
    if (!resultado || !resultado.id) {
      console.error('❌ [EmpresaColaboradorResultados] Resultado inválido:', resultado);
      toast.error('Erro: dados do resultado não encontrados');
      return;
    }

    // Verificar se nomeTest existe, se não, usar um valor padrão
    if (!resultado.nomeTest) {
      console.warn('⚠️ [EmpresaColaboradorResultados] nomeTest não encontrado, usando valor padrão');
      resultado.nomeTest = 'Teste sem nome';
    }

    // Abrir popup em vez de navegar
    setResultadoSelecionado(resultado);
    setPopupAberto(true);
  };

  const getNivelColor = (percentual: number) => {
    if (percentual >= 80) return 'text-green-600';
    if (percentual >= 60) return 'text-yellow-600';
    if (percentual >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const resultadosFiltrados = resultados.filter(resultado => {
    const searchTerm = (filtroTeste || '').toLowerCase();
    const testeName = (resultado.nomeTest || '').toLowerCase();
    const category = (resultado.categoria || '').toLowerCase();
    
    const matchesSearch = testeName.includes(searchTerm) || category.includes(searchTerm);
    const matchesStatus = filtroStatus === 'todos' || resultado.status === filtroStatus;
    
    return matchesSearch && matchesStatus;
  });

  const estatisticas = {
    total: resultados.length,
    concluidos: resultados.filter(r => r.status === 'concluido').length,
    emAndamento: resultados.filter(r => r.status === 'em_andamento').length,
    mediaPercentual: resultados.length > 0 
      ? Math.round(resultados.reduce((acc, r) => acc + r.percentual, 0) / resultados.length)
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
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={() => navigate('/empresa/gestao-colaboradores')}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar para Colaboradores
        </button>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Resultados dos Testes</span>
      </div>

      {/* Header do Colaborador */}
      {colaborador && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={colaborador.avatar} 
                  alt={colaborador.nome}
                />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-semibold">
                  {colaborador.nome.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{colaborador.nome}</h1>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {colaborador.email}
                  </div>
                  {colaborador.cargo && (
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      {colaborador.cargo}
                    </div>
                  )}
                  {colaborador.departamento && (
                    <div className="flex items-center">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      {colaborador.departamento}
                    </div>
                  )}
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  Membro desde {formatarData(colaborador.created_at)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                colaborador.ativo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {colaborador.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total de Testes</p>
              <p className="text-lg font-semibold text-gray-900">{estatisticas.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Concluídos</p>
              <p className="text-lg font-semibold text-gray-900">{estatisticas.concluidos}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Em Andamento</p>
              <p className="text-lg font-semibold text-gray-900">{estatisticas.emAndamento}</p>
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
              <p className="text-lg font-semibold text-gray-900">{estatisticas.mediaPercentual}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Abas para Resultados e Gerenciamento de Testes */}
      <Tabs defaultValue="resultados" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="resultados" data-testid="tab-resultados">
            Resultados dos Testes
          </TabsTrigger>
          <TabsTrigger value="gerenciar" data-testid="tab-gerenciar-testes">
            Gerenciar Testes
          </TabsTrigger>
          <TabsTrigger value="gerenciar-cursos" data-testid="tab-gerenciar-cursos">
            Gerenciar Cursos
          </TabsTrigger>
          <TabsTrigger value="cursos-certificados" data-testid="tab-cursos-certificados">
            Cursos e Certificados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resultados">
          {/* Filtros */}
          <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar testes..."
                  value={filtroTeste}
                  onChange={(e) => setFiltroTeste(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todos os status</option>
                  <option value="concluido">Concluídos</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="nao_iniciado">Não Iniciados</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Resultados */}
          <div className="space-y-4">
            {resultadosFiltrados.map((resultado) => (
              <div key={resultado.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{resultado.nomeTest}</h3>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(resultado.status)}`}>
                        {getStatusIcon(resultado.status)}
                        <span className="ml-1">
                          {resultado.status === 'concluido' ? 'Concluído' : 
                           resultado.status === 'em_andamento' ? 'Em Andamento' : 'Não Iniciado'}
                        </span>
                      </span>
                      {resultado.tipoTabela && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {resultado.tipoTabela === 'resultados_qvt' ? 'QVT' : 
                           resultado.tipoTabela === 'resultados_rpo' ? 'RPO' : 
                           resultado.tipoTabela === 'resultados' ? 'Padrão' : resultado.tipoTabela}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Pontuação</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {resultado.pontuacao}/{resultado.pontuacaoMaxima}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Percentual</p>
                        <p className={`text-lg font-semibold ${getNivelColor(resultado.percentual)}`}>
                          {resultado.percentual}%
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Data de Realização</p>
                        <p className="text-sm text-gray-900">{formatarData(resultado.dataRealizacao)}</p>
                      </div>
                      
                      {resultado.tempoDuracao && (
                        <div>
                          <p className="text-sm text-gray-500">Tempo Gasto</p>
                          <p className="text-sm text-gray-900">{formatarTempo(resultado.tempoDuracao)}</p>
                        </div>
                      )}
                    </div>

                    {resultado.categoria && (
                      <div className="mb-3">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {resultado.categoria}
                        </span>
                      </div>
                    )}

                    {resultado.observacoes && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">{resultado.observacoes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewResult(resultado)}
                      className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                      title="Visualizar detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50"
                      title="Baixar relatório"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {resultadosFiltrados.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum resultado encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filtroTeste || filtroStatus !== 'todos' 
                    ? 'Tente ajustar os filtros de busca.' 
                    : 'Este colaborador ainda não realizou nenhum teste.'}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="gerenciar">
          {colaborador && (
            <GerenciamentoTestesColaborador
              colaboradorId={colaborador.id}
              colaboradorNome={colaborador.nome}
            />
          )}
        </TabsContent>

        <TabsContent value="gerenciar-cursos">
          {colaborador && (
            <GerenciamentoCursosColaborador
              colaboradorId={colaborador.id}
              colaboradorNome={colaborador.nome}
            />
          )}
        </TabsContent>

        <TabsContent value="cursos-certificados">
          {colaborador && (
            <PainelCursosColaborador colaboradorId={colaborador.id} />
          )}
        </TabsContent>
      </Tabs>

      {/* Popup para exibir resultado */}
      <ResultadoPopup
        isOpen={popupAberto}
        onClose={() => {
          setPopupAberto(false);
          setResultadoSelecionado(null);
        }}
        resultado={resultadoSelecionado}
      />
    </div>
  );
}