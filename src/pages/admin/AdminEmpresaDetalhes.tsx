import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Building2, Users, Mail, TrendingUp, TrendingDown, Activity, Target, Award,
  Calendar, CheckCircle, XCircle, Clock, BarChart3, PieChart, Briefcase, AlertTriangle,
  AlertCircle, Info, Zap, TrendingDown as Down, Shield, DollarSign, Percent, UserCheck,
  UserX, Timer, Sun, Moon, Sunrise, Sunset
} from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Indicadores {
  empresa: {
    id: string;
    nome: string;
    email: string;
    cnpj: string;
    setor: string;
    ativa: boolean;
    dataCadastro: string;
    diasAtivos: number;
    mesesAtivos: number;
  };
  colaboradores: {
    total: number;
    ativos: number;
    inativos: number;
    comTestes: number;
    semTestes: number;
    taxaConclusao: number;
    indiceRetencao: number;
    taxaCrescimento: number;
  };
  convites: {
    gerados: number;
    utilizados: number;
    pendentes: number;
    expirados: number;
    taxaUtilizacao: number;
  };
  testes: {
    total: number;
    esteMes: number;
    ultimos7Dias: number;
    mediaPorColaborador: number;
    pontuacaoMedia: number;
    porCategoria: Record<string, number>;
    crescimentoMensal: number;
    produtividadeMensal: number;
    previsaoProximoMes: number;
    frequenciaMedia: number;
  };
  saude: {
    indiceGeral: number;
    coberturaAvaliacao: number;
    categoriasRisco: Array<{ categoria: string; nivel: string; testes: number }>;
    custoPorColaborador: number;
  };
  analise: {
    distribuicaoTemporal: {
      manha: number;
      tarde: number;
      noite: number;
      madrugada: number;
    };
    tendencia: Array<{ mes: string; testes: number }>;
    alertas: Array<{ tipo: string; mensagem: string; prioridade: string }>;
  };
  conversao?: {
    visitantesLanding: number;
    testesDemonstracao: number;
    checkoutsIniciados: number;
    comprasFinalizadas: number;
    taxaConversaoDemo: number;
    taxaConversaoCheckout: number;
    taxaConversaoGeral: number;
  };
  faturamento?: {
    receitaMensal: number;
    receitaTotal: number;
    ticketMedio: number;
    planoAtual: string;
    valorPlano: number;
    proximaCobranca: string;
    statusPagamento: string;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const PRIORIDADE_COLORS = {
  crítica: 'bg-red-100 text-red-800 border-red-300',
  alta: 'bg-orange-100 text-orange-800 border-orange-300',
  média: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  baixa: 'bg-blue-100 text-blue-800 border-blue-300',
};

export default function AdminEmpresaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarIndicadores();
  }, [id]);

  const carregarIndicadores = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/empresas/${id}/indicadores`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar indicadores');
      }

      const data = await response.json();
      console.log('📊 Indicadores recebidos:', data);
      setIndicadores(data);
    } catch (error) {
      console.error('Erro ao carregar indicadores:', error);
      toast.error('Erro ao carregar indicadores da empresa');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Carregando dashboard executivo...</p>
        </div>
      </div>
    );
  }

  if (!indicadores) return null;

  const categoriaData = Object.entries(indicadores.testes.porCategoria || {}).map(([nome, valor]) => ({
    nome,
    valor,
  }));

  const distribuicaoData = [
    { periodo: 'Manhã\n(6h-12h)', quantidade: indicadores.analise?.distribuicaoTemporal?.manha || 0, icon: 'sunrise' },
    { periodo: 'Tarde\n(12h-18h)', quantidade: indicadores.analise?.distribuicaoTemporal?.tarde || 0, icon: 'sun' },
    { periodo: 'Noite\n(18h-00h)', quantidade: indicadores.analise?.distribuicaoTemporal?.noite || 0, icon: 'sunset' },
    { periodo: 'Madrugada\n(0h-6h)', quantidade: indicadores.analise?.distribuicaoTemporal?.madrugada || 0, icon: 'moon' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header Executivo */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                data-testid="button-voltar"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900" data-testid="text-nome-empresa">
                      {indicadores.empresa.nome}
                    </h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {indicadores.empresa.email}
                      </span>
                      {indicadores.empresa.setor && (
                        <span className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {indicadores.empresa.setor}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {indicadores.empresa.mesesAtivos} meses ativos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right mr-3">
                <p className="text-xs text-gray-500">Índice de Saúde</p>
                <p className="text-2xl font-bold text-green-600">{indicadores.saude?.indiceGeral || 0}%</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                indicadores.empresa?.ativa 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {indicadores.empresa?.ativa ? 'Ativa' : 'Inativa'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alertas Críticos */}
        {indicadores.analise?.alertas && indicadores.analise.alertas.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              Alertas e Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {indicadores.analise.alertas.map((alerta, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${PRIORIDADE_COLORS[alerta.prioridade as keyof typeof PRIORIDADE_COLORS]}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{alerta.tipo}</p>
                      <p className="text-sm mt-1">{alerta.mensagem}</p>
                    </div>
                    {alerta.prioridade === 'crítica' && <AlertCircle className="w-5 h-5 ml-2" />}
                    {alerta.prioridade === 'alta' && <AlertTriangle className="w-5 h-5 ml-2" />}
                    {alerta.prioridade === 'média' && <Info className="w-5 h-5 ml-2" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPIs de Conversão e Faturamento */}
        {(indicadores.conversao || indicadores.faturamento) && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Conversão e Faturamento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Visitantes Landing */}
              {indicadores.conversao && (
                <>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Taxa Demo</p>
                        <p className="text-lg font-bold text-blue-600">{indicadores.conversao.taxaConversaoDemo}%</p>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{indicadores.conversao.visitantesLanding}</h3>
                    <p className="text-xs text-gray-500 mt-1">Visitantes Landing</p>
                    <div className="mt-2 text-xs text-gray-600">
                      {indicadores.conversao.testesDemonstracao} testes demo
                    </div>
                  </div>

                  {/* Taxa de Conversão Geral */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Percent className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Checkout</p>
                        <p className="text-lg font-bold text-green-600">{indicadores.conversao.taxaConversaoCheckout}%</p>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{indicadores.conversao.taxaConversaoGeral}%</h3>
                    <p className="text-xs text-gray-500 mt-1">Conversão Geral</p>
                    <div className="mt-2 text-xs text-gray-600">
                      {indicadores.conversao.comprasFinalizadas} compras finalizadas
                    </div>
                  </div>
                </>
              )}

              {/* Faturamento */}
              {indicadores.faturamento && (
                <>
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-90">Mensal</p>
                        <p className="text-lg font-bold">R$ {indicadores.faturamento.receitaMensal.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold">R$ {indicadores.faturamento.receitaTotal.toLocaleString('pt-BR')}</h3>
                    <p className="text-xs opacity-75 mt-1">Receita Total</p>
                    <div className="mt-2 text-xs opacity-90">
                      Ticket: R$ {indicadores.faturamento.ticketMedio.toLocaleString('pt-BR')}
                    </div>
                  </div>

                  {/* Plano Atual */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Award className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        indicadores.faturamento.statusPagamento === 'ativo' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {indicadores.faturamento.statusPagamento}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{indicadores.faturamento.planoAtual}</h3>
                    <p className="text-xs text-gray-500 mt-1">Plano Atual</p>
                    <div className="mt-2 text-xs text-gray-600">
                      R$ {indicadores.faturamento.valorPlano}/mês
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Próxima cobrança: {new Date(indicadores.faturamento.proximaCobranca).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* KPIs Executivos - Linha 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Índice de Saúde */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-xs opacity-90">Índice de Saúde</p>
                <p className="text-3xl font-bold">{indicadores.saude?.indiceGeral || 0}%</p>
              </div>
            </div>
            <p className="text-xs opacity-75">Organizacional</p>
          </div>

          {/* Retenção */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-xs opacity-90">Retenção</p>
                <p className="text-3xl font-bold">{indicadores.colaboradores?.indiceRetencao || 0}%</p>
              </div>
            </div>
            <p className="text-xs opacity-75">{indicadores.colaboradores?.ativos || 0} ativos de {indicadores.colaboradores?.total || 0}</p>
          </div>

          {/* Cobertura */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-xs opacity-90">Cobertura</p>
                <p className="text-3xl font-bold">{indicadores.saude?.coberturaAvaliacao || 0}%</p>
              </div>
            </div>
            <p className="text-xs opacity-75">{indicadores.colaboradores?.comTestes || 0}/{indicadores.colaboradores?.total || 0} avaliados</p>
          </div>

          {/* Produtividade */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-xs opacity-90">Produtividade</p>
                <p className="text-3xl font-bold">{indicadores.testes?.produtividadeMensal || 0}</p>
              </div>
            </div>
            <p className="text-xs opacity-75">testes/mês</p>
          </div>

          {/* Previsão */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <div className="text-right">
                <p className="text-xs opacity-90">Previsão</p>
                <p className="text-3xl font-bold">{indicadores.testes?.previsaoProximoMes || 0}</p>
              </div>
            </div>
            <p className="text-xs opacity-75">próximo mês</p>
          </div>
        </div>

        {/* Cards Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Colaboradores */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium">Crescimento</p>
                <p className="text-lg font-bold text-blue-600">+{indicadores.colaboradores?.taxaCrescimento || 0}%</p>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{indicadores.colaboradores?.total || 0}</h3>
            <p className="text-sm text-gray-500 mb-3">Colaboradores</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-green-600 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Ativos</span>
                <span className="font-semibold">{indicadores.colaboradores?.ativos || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 flex items-center"><XCircle className="w-3 h-3 mr-1" /> Inativos</span>
                <span className="font-semibold">{indicadores.colaboradores?.inativos || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600 flex items-center"><UserX className="w-3 h-3 mr-1" /> Sem avaliação</span>
                <span className="font-semibold">{indicadores.colaboradores?.semTestes || 0}</span>
              </div>
            </div>
          </div>

          {/* Convites */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium">Taxa de Uso</p>
                <p className="text-lg font-bold text-green-600">{indicadores.convites?.taxaUtilizacao || 0}%</p>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{indicadores.convites?.gerados || 0}</h3>
            <p className="text-sm text-gray-500 mb-3">Convites Gerados</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-green-600 flex items-center"><CheckCircle className="w-3 h-3 mr-1" /> Utilizados</span>
                <span className="font-semibold">{indicadores.convites?.utilizados || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600 flex items-center"><Clock className="w-3 h-3 mr-1" /> Pendentes</span>
                <span className="font-semibold">{indicadores.convites?.pendentes || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-600 flex items-center"><XCircle className="w-3 h-3 mr-1" /> Expirados</span>
                <span className="font-semibold">{indicadores.convites?.expirados || 0}</span>
              </div>
            </div>
          </div>

          {/* Testes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium">Este Mês</p>
                <p className="text-lg font-bold text-purple-600">{indicadores.testes?.esteMes || 0}</p>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{indicadores.testes?.total || 0}</h3>
            <p className="text-sm text-gray-500 mb-3">Testes Realizados</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-purple-600 flex items-center"><Calendar className="w-3 h-3 mr-1" /> Últimos 7 dias</span>
                <span className="font-semibold">{indicadores.testes?.ultimos7Dias || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 flex items-center"><Timer className="w-3 h-3 mr-1" /> Frequência</span>
                <span className="font-semibold">{indicadores.testes?.frequenciaMedia || 0} dias</span>
              </div>
            </div>
          </div>

          {/* Média */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center">
                {(indicadores.testes?.crescimentoMensal || 0) > 0 ? (
                  <div className="flex items-center text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-xs font-medium">+{indicadores.testes?.crescimentoMensal || 0}</span>
                  </div>
                ) : (indicadores.testes?.crescimentoMensal || 0) < 0 ? (
                  <div className="flex items-center text-red-600">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    <span className="text-xs font-medium">{indicadores.testes?.crescimentoMensal || 0}</span>
                  </div>
                ) : (
                  <div className="text-gray-400 text-xs">Estável</div>
                )}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{indicadores.testes?.mediaPorColaborador || 0}</h3>
            <p className="text-sm text-gray-500 mb-3">Média por Colaborador</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-orange-600 flex items-center"><Award className="w-3 h-3 mr-1" /> Pontuação</span>
                <span className="font-semibold">{indicadores.testes?.pontuacaoMedia || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 flex items-center"><DollarSign className="w-3 h-3 mr-1" /> Custo/Colab</span>
                <span className="font-semibold">{indicadores.saude?.custoPorColaborador || 0} testes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos - Linha 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tendência */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Tendência de Testes (6 meses)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={indicadores.analise?.tendencia || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="testes" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Testes Realizados"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição Temporal */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
              <Clock className="w-5 h-5 mr-2 text-purple-600" />
              Distribuição Temporal dos Testes
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distribuicaoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="periodo" stroke="#94a3b8" style={{ fontSize: '11px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Bar dataKey="quantidade" name="Testes" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráficos - Linha 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Categorias */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
              <PieChart className="w-5 h-5 mr-2 text-green-600" />
              Distribuição por Categoria
            </h3>
            {categoriaData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={categoriaData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nome, percent }) => `${nome}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {categoriaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p>Nenhum teste realizado ainda</p>
              </div>
            )}
          </div>

          {/* Categorias de Risco */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Categorias de Risco Identificadas
            </h3>
            {indicadores.saude?.categoriasRisco && indicadores.saude.categoriasRisco.length > 0 ? (
              <div className="space-y-3">
                {indicadores.saude.categoriasRisco.map((cat, index) => (
                  <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-red-900">{cat.categoria}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        cat.nivel === 'Crítico' 
                          ? 'bg-red-200 text-red-900' 
                          : 'bg-orange-200 text-orange-900'
                      }`}>
                        {cat.nivel}
                      </span>
                    </div>
                    <p className="text-sm text-red-700">{cat.testes} testes com baixa pontuação</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[240px] text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <p className="text-green-600 font-semibold">Nenhuma categoria de risco identificada</p>
                <p className="text-sm text-gray-500 mt-2">Todas as áreas estão dentro dos parâmetros esperados</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              🔒 Dados agregados e anônimos em conformidade com a LGPD. Última atualização: {new Date().toLocaleString('pt-BR')}
            </p>
            <button
              onClick={carregarIndicadores}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              <Activity className="w-3 h-3 mr-1" />
              Atualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
