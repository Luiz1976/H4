import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Building2, 
  TrendingUp, 
  Calendar,
  Activity,
  UserCheck,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';

interface Estatisticas {
  total_empresas: number;
  empresas_ativas: number;
  total_colaboradores: number;
  colaboradores_ativos: number;
  convites_pendentes: number;
  convites_usados: number;
  crescimento_mensal: {
    empresas: number;
    colaboradores: number;
  };
  atividade_recente: {
    novas_empresas_mes: number;
    novos_colaboradores_mes: number;
    convites_enviados_mes: number;
  };
}

export default function AdminEstatisticas() {
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      setLoading(true);
      const response = await authService.getEstatisticas();
      
      if (response.success && response.data) {
        setEstatisticas(response.data);
      } else {
        toast.error(response.message || 'Erro ao carregar estatísticas');
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!estatisticas) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Erro ao carregar estatísticas</h3>
          <p className="mt-1 text-sm text-gray-500">Tente recarregar a página.</p>
        </div>
      </div>
    );
  }

  const formatarPorcentagem = (valor: number) => {
    const sinal = valor >= 0 ? '+' : '';
    return `${sinal}${valor.toFixed(1)}%`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Estatísticas</h1>
        <p className="text-gray-600">Visão geral do desempenho da plataforma</p>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Total de Empresas</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.total_empresas}</p>
              <div className="flex items-center mt-1">
                <span className={`text-sm ${
                  estatisticas.crescimento_mensal.empresas >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatarPorcentagem(estatisticas.crescimento_mensal.empresas)}
                </span>
                <span className="text-sm text-gray-500 ml-1">este mês</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Total de Colaboradores</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.total_colaboradores}</p>
              <div className="flex items-center mt-1">
                <span className={`text-sm ${
                  estatisticas.crescimento_mensal.colaboradores >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatarPorcentagem(estatisticas.crescimento_mensal.colaboradores)}
                </span>
                <span className="text-sm text-gray-500 ml-1">este mês</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Empresas Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.empresas_ativas}</p>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-500">
                  {((estatisticas.empresas_ativas / estatisticas.total_empresas) * 100).toFixed(1)}% do total
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500">Colaboradores Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.colaboradores_ativos}</p>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-500">
                  {((estatisticas.colaboradores_ativos / estatisticas.total_colaboradores) * 100).toFixed(1)}% do total
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Convites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status dos Convites</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm text-gray-600">Convites Pendentes</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {estatisticas.convites_pendentes}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserCheck className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Convites Usados</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {estatisticas.convites_usados}
              </span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Taxa de Conversão</span>
                <span className="text-sm font-semibold text-blue-600">
                  {estatisticas.convites_pendentes + estatisticas.convites_usados > 0 
                    ? ((estatisticas.convites_usados / (estatisticas.convites_pendentes + estatisticas.convites_usados)) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Atividade Recente</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">Novas Empresas (30 dias)</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {estatisticas.atividade_recente.novas_empresas_mes}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Novos Colaboradores (30 dias)</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {estatisticas.atividade_recente.novos_colaboradores_mes}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-sm text-gray-600">Convites Enviados (30 dias)</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {estatisticas.atividade_recente.convites_enviados_mes}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Crescimento */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Crescimento Mensal</h3>
          <TrendingUp className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatarPorcentagem(estatisticas.crescimento_mensal.empresas)}
            </div>
            <div className="text-sm text-gray-600">Crescimento de Empresas</div>
            <div className="text-xs text-gray-500 mt-1">Comparado ao mês anterior</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatarPorcentagem(estatisticas.crescimento_mensal.colaboradores)}
            </div>
            <div className="text-sm text-gray-600">Crescimento de Colaboradores</div>
            <div className="text-xs text-gray-500 mt-1">Comparado ao mês anterior</div>
          </div>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
        <div className="flex items-center mb-4">
          <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Resumo Geral</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Taxa de Ativação:</span>
            <span className="ml-2 text-gray-600">
              {((estatisticas.empresas_ativas / estatisticas.total_empresas) * 100).toFixed(1)}% das empresas
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Média de Colaboradores:</span>
            <span className="ml-2 text-gray-600">
              {estatisticas.total_empresas > 0 
                ? (estatisticas.total_colaboradores / estatisticas.total_empresas).toFixed(1)
                : 0} por empresa
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Engajamento:</span>
            <span className="ml-2 text-gray-600">
              {((estatisticas.colaboradores_ativos / estatisticas.total_colaboradores) * 100).toFixed(1)}% dos colaboradores
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}