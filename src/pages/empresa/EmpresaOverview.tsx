import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, TrendingUp, Award, Calendar, Clock, 
  Activity, Target, BarChart3, Sparkles, 
  TrendingDown, Zap, Shield, ArrowUp, ArrowDown, X, FileCheck
} from 'lucide-react';
import Logo from '@/components/Logo';
import { empresaStatisticsService, EstatisticasEmpresa } from '../../services/empresaStatisticsService';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../hooks/AuthContext';
import { toast } from 'sonner';

export default function EmpresaOverview() {
  const { user } = useAuth();
  const [estatisticas, setEstatisticas] = useState<EstatisticasEmpresa>({
    total_colaboradores: 0,
    colaboradores_ativos: 0,
    total_testes_realizados: 0,
    convites_pendentes: 0,
    testes_este_mes: 0,
    media_pontuacao: 0
  });
  const [loading, setLoading] = useState(true);
  const [showConviteModal, setShowConviteModal] = useState(false);
  const [novoConvite, setNovoConvite] = useState({
    email: '',
    nome: '',
    cargo: '',
    departamento: '',
    dias_expiracao: 7
  });

  const carregarEstatisticas = async () => {
    if (!user?.empresaId) {
      console.log('🔍 [EmpresaOverview] Usuário sem empresaId:', user);
      return;
    }

    console.log('🔍 [EmpresaOverview] Iniciando carregamento de estatísticas para empresa:', user.empresaId);
    setLoading(true);
    
    try {
      const stats = await empresaStatisticsService.buscarEstatisticasEmpresa(user.empresaId);
      console.log('✅ [EmpresaOverview] Estatísticas carregadas com sucesso:', stats);
      setEstatisticas(stats);
    } catch (error) {
      console.error('❌ [EmpresaOverview] Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas da empresa');
    } finally {
      setLoading(false);
      console.log('🔍 [EmpresaOverview] Carregamento finalizado');
    }
  };

  useEffect(() => {
    carregarEstatisticas();
  }, [user?.empresaId]);

  const criarConviteColaborador = async () => {
    try {
      if (!novoConvite.email || !novoConvite.nome) {
        toast.error('Email e nome são obrigatórios');
        return;
      }

      if (!user?.empresaId) {
        toast.error('Empresa não identificada');
        return;
      }

      const response = await apiService.criarConviteColaborador({
        nome: novoConvite.nome,
        email: novoConvite.email,
        cargo: novoConvite.cargo,
        departamento: novoConvite.departamento,
        diasValidade: novoConvite.dias_expiracao
      });

      toast.success('Convite criado com sucesso!');
      
      const urlConvite = `${window.location.origin}/aceitar-convite/${response.token}`;
      navigator.clipboard.writeText(urlConvite);
      toast.info('URL do convite copiada para a área de transferência');
      
      setShowConviteModal(false);
      setNovoConvite({ email: '', nome: '', cargo: '', departamento: '', dias_expiracao: 7 });
      carregarEstatisticas();
    } catch (error) {
      console.error('Erro ao criar convite:', error);
      toast.error('Erro ao criar convite');
    }
  };

  const calcularMediaTestesPorColaborador = (): string => {
    if (estatisticas.total_colaboradores === 0) return '0.0';
    return (estatisticas.total_testes_realizados / estatisticas.total_colaboradores).toFixed(1);
  };

  const calcularTaxaAtivos = (): number => {
    if (estatisticas.total_colaboradores === 0) return 0;
    return (estatisticas.colaboradores_ativos / estatisticas.total_colaboradores) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            {/* Header Skeleton */}
            <div className="h-24 bg-white/60 backdrop-blur-sm rounded-2xl"></div>
            
            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-36 bg-white/60 backdrop-blur-sm rounded-2xl"></div>
              ))}
            </div>
            
            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-white/60 backdrop-blur-sm rounded-2xl"></div>
              <div className="h-64 bg-white/60 backdrop-blur-sm rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Colaboradores',
      value: estatisticas.total_colaboradores,
      subtitle: `${estatisticas.colaboradores_ativos} ativos`,
      icon: Users,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10'
    },
    {
      title: 'Testes Realizados',
      value: estatisticas.total_testes_realizados,
      subtitle: `${estatisticas.testes_este_mes} este mês`,
      icon: Activity,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10'
    },
    {
      title: 'Média de Pontuação',
      value: estatisticas.media_pontuacao,
      subtitle: 'Últimos 30 dias',
      icon: TrendingUp,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10'
    },
    {
      title: 'Convites Pendentes',
      value: estatisticas.convites_pendentes,
      subtitle: 'Aguardando resposta',
      icon: Clock,
      color: 'amber',
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-500/10 to-orange-500/10'
    },
    {
      title: 'Média de Testes',
      value: calcularMediaTestesPorColaborador(),
      subtitle: 'Por colaborador',
      icon: FileCheck,
      color: 'indigo',
      gradient: 'from-indigo-500 to-blue-500',
      bgGradient: 'from-indigo-500/10 to-blue-500/10'
    },
    {
      title: 'Nível de Engajamento',
      value: estatisticas.media_pontuacao >= 80 ? 'Alto' : estatisticas.media_pontuacao >= 60 ? 'Médio' : 'Baixo',
      subtitle: 'Baseado na pontuação média',
      icon: Award,
      color: 'rose',
      gradient: 'from-rose-500 to-red-500',
      bgGradient: 'from-rose-500/10 to-red-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div 
          className="mb-8 backdrop-blur-xl bg-white/70 rounded-3xl shadow-xl border border-white/20 p-8 overflow-hidden relative"
          style={{ animation: 'slideUp 0.6s ease-out' }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <Logo size="sm" showText={false} className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {user?.name ? `${user.name}` : 'Dashboard'}
                </h1>
              </div>
              <p className="text-gray-600 ml-14">Visão geral do desempenho e estatísticas da sua empresa</p>
            </div>
            
            <button
              data-testid="button-convidar-colaborador"
              onClick={() => setShowConviteModal(true)}
              className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <span>Convidar Colaborador</span>
              </div>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              data-testid={`card-stat-${index}`}
              className="group relative backdrop-blur-xl bg-white/70 rounded-2xl shadow-lg border border-white/20 p-6 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer"
              style={{
                animation: `slideUp ${0.6 + index * 0.1}s ease-out`,
              }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              {/* Gradient Border Glow */}
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />
              
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1" data-testid={`text-stat-value-${index}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.subtitle}</p>
                </div>
                
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Decorative Corner Element */}
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-white/10 to-transparent rounded-tl-full transform translate-x-12 translate-y-12 group-hover:translate-x-8 group-hover:translate-y-8 transition-transform duration-500" />
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumo Mensal */}
          <div 
            className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-lg border border-white/20 p-6 overflow-hidden"
            style={{ animation: 'slideUp 1.2s ease-out' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Resumo Mensal</h3>
              </div>
              <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                Atual
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="group p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-blue-50 hover:to-cyan-50 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Testes realizados este mês</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900" data-testid="text-testes-mes">
                    {estatisticas.testes_este_mes}
                  </span>
                </div>
              </div>
              
              <div className="group p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-green-50 hover:to-emerald-50 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Colaboradores ativos</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900" data-testid="text-colaboradores-ativos">
                    {estatisticas.colaboradores_ativos}
                  </span>
                </div>
              </div>
              
              <div className="group p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-amber-50 hover:to-orange-50 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Convites pendentes</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900" data-testid="text-convites-pendentes">
                    {estatisticas.convites_pendentes}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Indicadores de Performance */}
          <div 
            className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-lg border border-white/20 p-6 overflow-hidden"
            style={{ animation: 'slideUp 1.3s ease-out' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Indicadores de Performance</h3>
              </div>
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            
            <div className="space-y-6">
              {/* Média de Testes */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Média de Testes por Colaborador</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900" data-testid="text-media-testes">
                      {calcularMediaTestesPorColaborador()}
                    </span>
                    {parseFloat(calcularMediaTestesPorColaborador()) > 2 ? (
                      <ArrowUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                </div>
                <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(parseFloat(calcularMediaTestesPorColaborador()) * 20, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse" />
                  </div>
                </div>
              </div>
              
              {/* Pontuação Média */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Pontuação Média</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900" data-testid="text-media-pontuacao">
                      {estatisticas.media_pontuacao}/100
                    </span>
                    {estatisticas.media_pontuacao > 70 ? (
                      <ArrowUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>
                <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg transition-all duration-1000 ease-out"
                    style={{ width: `${estatisticas.media_pontuacao}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse" />
                  </div>
                </div>
              </div>
              
              {/* Colaboradores Ativos */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Colaboradores Ativos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900" data-testid="text-taxa-ativos">
                      {calcularTaxaAtivos().toFixed(1)}%
                    </span>
                    {calcularTaxaAtivos() > 80 ? (
                      <ArrowUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>
                <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg transition-all duration-1000 ease-out"
                    style={{ width: `${calcularTaxaAtivos()}%` }}
                  >
                    <div className="absolute inset-0 bg-white/30 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Convite */}
      {showConviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="relative backdrop-blur-2xl bg-white/90 rounded-3xl shadow-2xl border border-white/20 w-full max-w-md overflow-hidden"
            style={{ animation: 'slideUp 0.4s ease-out' }}
          >
            {/* Decorative Header Gradient */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500" />
            
            {/* Close Button */}
            <button
              data-testid="button-fechar-modal"
              onClick={() => setShowConviteModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Convidar Colaborador</h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome do Colaborador
                  </label>
                  <input
                    data-testid="input-nome"
                    type="text"
                    value={novoConvite.nome}
                    onChange={(e) => setNovoConvite({...novoConvite, nome: e.target.value})}
                    className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                    placeholder="Digite o nome do colaborador"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    data-testid="input-email-modal"
                    type="email"
                    value={novoConvite.email}
                    onChange={(e) => setNovoConvite({...novoConvite, email: e.target.value})}
                    className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                    placeholder="email@colaborador.com"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cargo (Opcional)
                    </label>
                    <input
                      data-testid="input-cargo"
                      type="text"
                      value={novoConvite.cargo}
                      onChange={(e) => setNovoConvite({...novoConvite, cargo: e.target.value})}
                      className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      placeholder="Analista"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Departamento
                    </label>
                    <input
                      data-testid="input-departamento"
                      type="text"
                      value={novoConvite.departamento}
                      onChange={(e) => setNovoConvite({...novoConvite, departamento: e.target.value})}
                      className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      placeholder="RH"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dias para Expiração
                  </label>
                  <select
                    data-testid="select-dias-expiracao"
                    value={novoConvite.dias_expiracao}
                    onChange={(e) => setNovoConvite({...novoConvite, dias_expiracao: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value={3}>3 dias</option>
                    <option value={7}>7 dias</option>
                    <option value={15}>15 dias</option>
                    <option value={30}>30 dias</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button
                  data-testid="button-cancelar"
                  onClick={() => setShowConviteModal(false)}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  data-testid="button-criar-convite"
                  onClick={criarConviteColaborador}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  Criar Convite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
