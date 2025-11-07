import React from 'react';
import { Loader2, AlertTriangle, Eye, Download, Share2, Clock, Target, TrendingUp, Award, Lightbulb, CheckCircle } from 'lucide-react';
import Logo from "@/components/Logo";
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { calcularResultadoKarasekSiegrist, type ResultadoKarasekSiegrist } from '@/lib/testes/karasek-siegrist';
import { KarasekRadarChart } from '@/components/charts/KarasekRadarChart';
import { KarasekGaugeChart } from '@/components/charts/KarasekGaugeChart';
import { KarasekBarChart } from '@/components/charts/KarasekBarChart';
import { KarasekProfessionalAnalysis } from '@/components/analysis/KarasekProfessionalAnalysis';
import { KarasekActionPlan } from '@/components/analysis/KarasekActionPlan';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ResultadoTeste {
  id: string;
  nomeTest?: string;
  categoria?: string;
  pontuacao?: number;
  nivel?: string;
  dataRealizacao?: string;
  tipoTabela?: string;
}

interface ResultadoVisualizacaoProps {
  resultado: ResultadoTeste | null;
  dadosResultado: any;
  carregando?: boolean;
  erro?: string | null;
}

export function ResultadoVisualizacao({ resultado, dadosResultado, carregando = false, erro = null }: ResultadoVisualizacaoProps) {
  
  // Função para identificar se é um teste HumaniQ Insight
  const isHumaniQInsight = (resultado: ResultadoTeste | null): boolean => {
    if (!resultado) return false;
    
    const nomeTest = resultado.nomeTest?.toLowerCase() || '';
    const tipoTeste = dadosResultado?.metadados?.tipo_teste?.toLowerCase() || '';
    const testeNome = dadosResultado?.metadados?.teste_nome?.toLowerCase() || '';
    
    return nomeTest.includes('humaniq insight') || 
           tipoTeste === 'humaniq-insight' ||
           testeNome.includes('humaniq insight');
  };
  
  // Função para identificar se é um teste Karasek-Siegrist
  const isKarasekSiegrist = (resultado: ResultadoTeste | null): boolean => {
    if (!resultado) return false;
    
    const nomeTest = resultado.nomeTest?.toLowerCase() || '';
    const tipoTeste = dadosResultado?.metadados?.tipo_teste?.toLowerCase() || '';
    const testeNome = dadosResultado?.metadados?.teste_nome?.toLowerCase() || '';
    
    return nomeTest.includes('karasek') || nomeTest.includes('siegrist') || 
           nomeTest.includes('demanda') || nomeTest.includes('controle') ||
           nomeTest.includes('esforço') || nomeTest.includes('recompensa') ||
           tipoTeste === 'karasek-siegrist' ||
           testeNome.includes('karasek') || testeNome.includes('siegrist');
  };

  // Função para identificar se é um teste de Clima Organizacional
  const isClimaOrganizacional = (resultado: ResultadoTeste | null): boolean => {
    if (!resultado) return false;
    
    const nomeTest = resultado.nomeTest?.toLowerCase() || '';
    const tipoTeste = dadosResultado?.metadados?.tipo_teste?.toLowerCase() || '';
    const testeNome = dadosResultado?.metadados?.teste_nome?.toLowerCase() || '';
    
    return nomeTest.includes('clima organizacional') || 
           nomeTest.includes('pesquisa de clima') ||
           tipoTeste === 'clima-organizacional' ||
           testeNome.includes('clima organizacional') ||
           testeNome.includes('pesquisa de clima');
  };

  // Função para identificar se é um teste RPO (Riscos Psicossociais Ocupacionais)
  const isRPO = (resultado: ResultadoTeste | null): boolean => {
    if (!resultado) return false;
    
    const nomeTest = resultado.nomeTest?.toLowerCase() || '';
    const tipoTeste = dadosResultado?.metadados?.tipo_teste?.toLowerCase() || '';
    const testeNome = dadosResultado?.metadados?.teste_nome?.toLowerCase() || '';
    
    return nomeTest.includes('rpo') || 
           nomeTest.includes('riscos psicossociais') ||
           nomeTest.includes('humaniq rpo') ||
           tipoTeste === 'rpo' ||
           tipoTeste.includes('riscos-psicossociais') ||
           testeNome.includes('rpo') ||
           testeNome.includes('riscos psicossociais');
  };

  // Função para identificar se é um teste QVT (Qualidade de Vida no Trabalho)
  const isQVT = (resultado: ResultadoTeste | null): boolean => {
    if (!resultado) return false;
    
    const nomeTest = resultado.nomeTest?.toLowerCase() || '';
    const tipoTeste = dadosResultado?.metadados?.tipo_teste?.toLowerCase() || '';
    const testeNome = dadosResultado?.metadados?.teste_nome?.toLowerCase() || '';
    
    return nomeTest.includes('qvt') || 
           nomeTest.includes('qualidade de vida') ||
           nomeTest.includes('qualidade vida trabalho') ||
           nomeTest.includes('vida no trabalho') ||
           tipoTeste === 'qvt' ||
           testeNome.includes('qualidade de vida');
  };

  const renderKarasekSiegristContent = (dados: ResultadoKarasekSiegrist) => (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl border border-slate-200/60">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Resumo Executivo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
              {dados.riscoGeral.percentual}%
            </div>
            <div className="text-sm font-medium text-slate-600">Pontuação Total</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
            <Badge className={`${obterCorRisco(dados.riscoGeral.nivel)} text-sm font-medium px-3 py-1`}>
              {dados.riscoGeral.classificacao}
            </Badge>
            <div className="text-sm font-medium text-slate-600 mt-1">Nível de Risco</div>
          </div>
        </div>
      </div>

      {/* Gráfico de Gauge */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/60">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Nível de Risco Psicossocial</h3>
        <KarasekGaugeChart resultado={dados} />
      </div>

      {/* Gráfico Radar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/60">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Perfil Psicossocial</h3>
        <KarasekRadarChart resultado={dados} />
      </div>

      {/* Gráfico de Barras */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/60">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Comparativo por Dimensões</h3>
        <KarasekBarChart resultado={dados} />
      </div>

      {/* Análise Profissional */}
      <KarasekProfessionalAnalysis resultado={dados} />

      {/* Plano de Ação */}
      <KarasekActionPlan resultado={dados} />
    </div>
  );

  const renderClimaOrganizacionalContent = (dados: any) => {
    // Extrair dados dos metadados se disponível
    const metadados = dados.metadados || dados;
    const analiseCompleta = metadados.analise_completa || {};
    const pontuacoesDimensoes = metadados.pontuacoes_dimensoes || {};
    
    return (
      <div className="space-y-6">
        {/* Resumo Executivo */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200/60">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Pesquisa de Clima Organizacional</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                {metadados.pontuacao_total || analiseCompleta.pontuacaoGeral || analiseCompleta.mediaGeral || 'N/A'}
              </div>
              <div className="text-sm font-medium text-slate-600">Pontuação Geral</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
              <Badge className="text-sm font-medium px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200">
                {analiseCompleta.classificacaoGeral || analiseCompleta.nivelGeral || 'Não definido'}
              </Badge>
              <div className="text-sm font-medium text-slate-600 mt-1">Classificação</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
              <div className="text-lg font-bold text-purple-600">
                {metadados.usuario_nome || 'Usuário'}
              </div>
              <div className="text-sm font-medium text-slate-600">Avaliado</div>
            </div>
          </div>
        </div>

        {/* Dimensões do Clima Organizacional - MODERNIZADO */}
        {pontuacoesDimensoes && Object.keys(pontuacoesDimensoes).length > 0 && (
          <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border-2 border-slate-200 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <Logo size="sm" showText={false} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Dimensões Avaliadas</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(pontuacoesDimensoes).map(([dimensao, pontuacao]) => {
                const pontuacaoNum = typeof pontuacao === 'number' ? pontuacao : 0;
                const percentual = Math.min(100, Math.max(0, pontuacaoNum));
                const obterCor = (valor: number) => {
                  if (valor >= 70) return {
                    bg: 'from-emerald-500 to-teal-500',
                    text: 'text-emerald-600',
                    bgCard: 'from-emerald-50 to-teal-50',
                    border: 'border-emerald-200'
                  };
                  if (valor >= 40) return {
                    bg: 'from-amber-500 to-yellow-500',
                    text: 'text-amber-600',
                    bgCard: 'from-amber-50 to-yellow-50',
                    border: 'border-amber-200'
                  };
                  return {
                    bg: 'from-red-500 to-orange-500',
                    text: 'text-red-600',
                    bgCard: 'from-red-50 to-orange-50',
                    border: 'border-red-200'
                  };
                };
                const cores = obterCor(percentual);
                
                return (
                  <div 
                    key={dimensao} 
                    className={`relative overflow-hidden bg-gradient-to-br ${cores.bgCard} p-6 rounded-2xl border-2 ${cores.border} shadow-lg hover:shadow-2xl transition-all duration-300 group`}
                  >
                    {/* Círculo decorativo */}
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/30 rounded-full blur-2xl"></div>
                    
                    <div className="relative">
                      <div className="text-sm font-bold text-slate-600 mb-3 uppercase tracking-wide">
                        {dimensao.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      
                      <div className="flex items-baseline gap-2 mb-4">
                        <div className={`text-5xl font-black ${cores.text}`}>
                          {pontuacaoNum.toFixed(1)}
                        </div>
                        <div className="text-lg text-slate-500 font-medium">/ 100</div>
                      </div>
                      
                      {/* Barra de progresso moderna */}
                      <div className="relative">
                        <div className="w-full bg-slate-300/50 rounded-full h-4 overflow-hidden shadow-inner">
                          <div 
                            className={`bg-gradient-to-r ${cores.bg} h-4 rounded-full transition-all duration-1000 ease-out shadow-lg relative overflow-hidden`}
                            style={{ width: `${percentual}%` }}
                          >
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                          </div>
                        </div>
                        <div className={`text-right text-xs font-bold ${cores.text} mt-2`}>
                          {percentual.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Interpretação e Recomendações */}
        {(metadados.interpretacao || metadados.recomendacoes) && (
          <div className="bg-white p-6 rounded-xl border border-slate-200/60">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Análise e Recomendações</h3>
            <div className="space-y-4">
              {metadados.interpretacao && (
                <div>
                  <div className="text-sm font-medium text-blue-600 mb-2">Interpretação:</div>
                  <div className="text-sm text-slate-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    {Array.isArray(metadados.interpretacao) 
                      ? metadados.interpretacao.join(' ') 
                      : metadados.interpretacao}
                  </div>
                </div>
              )}
              {metadados.recomendacoes && (
                <div>
                  <div className="text-sm font-medium text-green-600 mb-2">Recomendações:</div>
                  <div className="text-sm text-slate-700 bg-green-50 p-4 rounded-lg border border-green-200">
                    {Array.isArray(metadados.recomendacoes) 
                      ? metadados.recomendacoes.map((rec: string, index: number) => (
                          <div key={index} className="mb-2 last:mb-0">• {rec}</div>
                        ))
                      : metadados.recomendacoes}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Informações Técnicas */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/60">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Informações da Avaliação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Versão do Teste:</span>
              <span className="ml-2 font-medium">{metadados.versao_teste || '1.0'}</span>
            </div>
            <div>
              <span className="text-slate-600">Data de Processamento:</span>
              <span className="ml-2 font-medium">
                {metadados.timestamp_processamento 
                  ? new Date(metadados.timestamp_processamento).toLocaleDateString('pt-BR')
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-600">E-mail:</span>
              <span className="ml-2 font-medium">{metadados.usuario_email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-600">Tipo de Teste:</span>
              <span className="ml-2 font-medium capitalize">{metadados.tipo_teste || 'clima-organizacional'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRPOContent = (dados: any) => {
    // Extrair dados dos metadados se disponível
    const metadados = dados.metadados || dados;
    const analiseCompleta = metadados.analise_completa || {};
    const pontuacoesDimensoes = metadados.pontuacoes_dimensoes || {};
    const pontuacaoTotal = metadados.pontuacao_total || analiseCompleta.indiceGeralRisco || 0;
    const classificacaoGeral = analiseCompleta.classificacaoGeral || analiseCompleta.nivelGeral || 'Moderado';
    
    // Função para obter cor baseada no nível de risco
    const obterCorRiscoRPO = (nivel: string) => {
      switch (nivel?.toLowerCase()) {
        case 'baixo':
        case 'baixo risco':
          return 'bg-white text-emerald-700 border-2 border-emerald-400';
        case 'moderado':
        case 'risco moderado':
          return 'bg-white text-amber-700 border-2 border-amber-400';
        case 'alto':
        case 'alto risco':
          return 'bg-white text-orange-700 border-2 border-orange-400';
        case 'critico':
        case 'muito alto':
        case 'risco crítico':
          return 'bg-white text-red-700 border-2 border-red-400';
        default:
          return 'bg-white text-slate-700 border-2 border-slate-400';
      }
    };

    // Função para obter cor da barra de progresso
    const obterCorBarra = (pontuacao: number) => {
      if (pontuacao >= 4.0) return 'bg-gradient-to-r from-red-500 to-rose-500';
      if (pontuacao >= 3.0) return 'bg-gradient-to-r from-orange-500 to-amber-500';
      if (pontuacao >= 2.0) return 'bg-gradient-to-r from-yellow-500 to-amber-500';
      return 'bg-gradient-to-r from-emerald-500 to-teal-500';
    };

    // Calcular percentual (inverso para riscos - quanto menor, melhor)
    const percentual = Math.round((5 - pontuacaoTotal) * 20);
  
    return (
      <div className="space-y-6">
        {/* CARD PREMIUM: Resumo Executivo */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-rose-700 p-8 rounded-2xl shadow-2xl border border-orange-400/20">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <AlertTriangle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Análise de Riscos Psicossociais</h3>
                <p className="text-orange-100 text-sm">Avaliação HumaniQ RPO</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Índice de Risco */}
              <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                <div className="text-6xl font-black text-white mb-2 tracking-tight">
                  {typeof pontuacaoTotal === 'number' ? pontuacaoTotal.toFixed(1) : pontuacaoTotal}
                </div>
                <div className="text-sm font-semibold text-orange-100 uppercase tracking-wider">Índice de Risco</div>
                <div className="text-xs text-white/80 mt-1">Escala de 1.0 a 5.0</div>
              </div>

              {/* Classificação */}
              <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                <div className="inline-block">
                  <Badge className={`text-base font-bold px-4 py-2 ${obterCorRiscoRPO(classificacaoGeral)}`}>
                    {classificacaoGeral}
                  </Badge>
                </div>
                <div className="text-sm font-semibold text-orange-100 uppercase tracking-wider mt-3">Classificação</div>
                <div className="text-xs text-white/80 mt-1">Nível de alerta</div>
              </div>

              {/* Saúde Psicossocial */}
              <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                <div className="text-5xl font-black text-white mb-2">
                  {percentual}%
                </div>
                <div className="text-sm font-semibold text-orange-100 uppercase tracking-wider">Saúde Ocupacional</div>
                <div className="text-xs text-white/80 mt-1">Quanto maior, melhor</div>
              </div>
            </div>

            {/* Barra de Progresso */}
            <div className="mt-6">
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-white via-orange-200 to-white h-3 rounded-full transition-all duration-1000 shadow-lg"
                  style={{ width: `${percentual}%` }}
                ></div>
              </div>
              <div className="text-center text-white/90 text-xs mt-2 font-medium">
                84 perguntas respondidas
              </div>
            </div>
          </div>
        </div>

        {/* ALERTAS CRÍTICOS DETALHADOS */}
        {analiseCompleta.alertasCriticos && analiseCompleta.alertasCriticos.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              Alertas Críticos Identificados
            </h3>
            <div className="grid gap-3">
              {analiseCompleta.alertasCriticos.map((alerta: string, index: number) => (
                <div 
                  key={index} 
                  className="group relative overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-5 rounded-xl border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-red-500 to-orange-500"></div>
                  <div className="flex items-start gap-4 ml-3">
                    <div className="flex-shrink-0 p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-red-100 text-red-800 border border-red-300 text-xs font-bold">
                          URGENTE
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-800 leading-relaxed">
                        {alerta}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DIMENSÕES DOS RISCOS PSICOSSOCIAIS - Cards Individuais Premium */}
        {pontuacoesDimensoes && Object.keys(pontuacoesDimensoes).length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-slate-800">Avaliação por Dimensões</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(pontuacoesDimensoes).map(([dimensao, dados]) => {
                const dadosDimensao = typeof dados === 'object' ? dados as any : { media: dados };
                const media = dadosDimensao.media || dadosDimensao.pontuacao || dados;
                const classificacao = dadosDimensao.classificacao || 'Não definido';
                const pontuacao = typeof media === 'number' ? media : parseFloat(media) || 0;
                
                return (
                  <div 
                    key={dimensao} 
                    className="bg-white p-5 rounded-xl border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-slate-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-slate-800 capitalize leading-tight">
                          {dimensao.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                      </div>
                      <Badge className={`text-xs px-3 py-1 font-bold ${obterCorRiscoRPO(classificacao)}`}>
                        {classificacao}
                      </Badge>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-3">
                      <div className={`text-3xl font-black ${
                        pontuacao >= 4.0 ? 'text-red-600' :
                        pontuacao >= 3.0 ? 'text-orange-600' :
                        pontuacao >= 2.0 ? 'text-yellow-600' :
                        'text-emerald-600'
                      }`}>
                        {pontuacao.toFixed(1)}
                      </div>
                      <div className="text-sm text-slate-500 font-medium">/ 5.0</div>
                    </div>
                    
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 shadow-sm ${obterCorBarra(pontuacao)}`}
                        style={{ width: `${Math.min(100, Math.max(0, pontuacao * 20))}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-right text-xs text-slate-500 font-medium mt-2">
                      {Math.round(pontuacao * 20)}% de risco
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* INTERPRETAÇÃO PROFISSIONAL */}
        {(metadados.interpretacao || analiseCompleta.interpretacao) && (
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Logo size="sm" showText={false} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Interpretação dos Riscos</h3>
            </div>
            <div className="text-sm text-slate-700 leading-relaxed bg-white/60 p-4 rounded-lg border border-blue-300">
              {Array.isArray(metadados.interpretacao || analiseCompleta.interpretacao) 
                ? (metadados.interpretacao || analiseCompleta.interpretacao).join(' ') 
                : (metadados.interpretacao || analiseCompleta.interpretacao)}
            </div>
          </div>
        )}

        {/* RECOMENDAÇÕES ESTRATÉGICAS */}
        {(metadados.recomendacoes || analiseCompleta.recomendacoes) && (
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-emerald-600" />
              </div>
              Recomendações de Intervenção
            </h3>
            <div className="grid gap-3">
              {(Array.isArray(metadados.recomendacoes || analiseCompleta.recomendacoes) 
                ? (metadados.recomendacoes || analiseCompleta.recomendacoes)
                : [(metadados.recomendacoes || analiseCompleta.recomendacoes)]
              ).map((rec: string, index: number) => (
                <div 
                  key={index} 
                  className="group bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-5 rounded-xl border-2 border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {index + 1}
                    </div>
                    <p className="flex-1 text-sm font-medium text-slate-800 leading-relaxed pt-1">
                      {rec}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações Técnicas */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Informações da Avaliação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">ID do Resultado:</span>
              <span className="ml-2 font-medium">{dados.id || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-600">Versão do Teste:</span>
              <span className="ml-2 font-medium">{metadados.versao_teste || '1.0'}</span>
            </div>
            <div>
              <span className="text-slate-600">E-mail:</span>
              <span className="ml-2 font-medium">{metadados.usuario_email || 'N/A'}</span>
            </div>
            {dados.tempo_gasto && (
              <div>
                <span className="text-slate-600">Tempo de Avaliação:</span>
                <span className="ml-2 font-medium">{dados.tempo_gasto}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderQVTContent = (dados: any) => {
    // Extrair dados dos metadados se disponível
    const metadados = dados.metadados || dados;
    
    // Função para obter cor baseada na pontuação
    const obterCorPontuacao = (pontuacao: number) => {
      if (pontuacao >= 4.5) return 'bg-gradient-to-r from-green-500 to-emerald-500';
      if (pontuacao >= 4.0) return 'bg-gradient-to-r from-lime-500 to-green-500';
      if (pontuacao >= 3.5) return 'bg-gradient-to-r from-yellow-500 to-lime-500';
      if (pontuacao >= 3.0) return 'bg-gradient-to-r from-orange-400 to-yellow-500';
      if (pontuacao >= 2.5) return 'bg-gradient-to-r from-orange-500 to-red-500';
      return 'bg-gradient-to-r from-red-600 to-rose-600';
    };

    const obterCorTexto = (pontuacao: number) => {
      if (pontuacao >= 4.5) return 'text-green-700';
      if (pontuacao >= 4.0) return 'text-lime-700';
      if (pontuacao >= 3.5) return 'text-yellow-700';
      if (pontuacao >= 3.0) return 'text-orange-600';
      if (pontuacao >= 2.5) return 'text-orange-700';
      return 'text-red-700';
    };

    const obterCorBadge = (pontuacao: number) => {
      if (pontuacao >= 4.5) return 'bg-green-100 text-green-800 border-green-300';
      if (pontuacao >= 4.0) return 'bg-lime-100 text-lime-800 border-lime-300';
      if (pontuacao >= 3.5) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      if (pontuacao >= 3.0) return 'bg-orange-100 text-orange-800 border-orange-300';
      if (pontuacao >= 2.5) return 'bg-orange-200 text-orange-900 border-orange-400';
      return 'bg-red-100 text-red-800 border-red-300';
    };

    // Função para obter classificação baseada na pontuação
    const obterClassificacao = (pontuacao: number) => {
      if (pontuacao >= 4.5) return 'Excelente';
      if (pontuacao >= 4.0) return 'Muito Bom';
      if (pontuacao >= 3.5) return 'Bom';
      if (pontuacao >= 3.0) return 'Regular';
      if (pontuacao >= 2.5) return 'Baixo';
      return 'Crítico';
    };

    // Dimensões QVT - tentar buscar dos metadados.dimensoes ou do formato antigo
    const dimensoes = metadados.dimensoes || [
      { dimensao: 'Satisfação com a Função', pontuacao: dados.satisfacao_funcao || 0, percentual: 0, nivel: '' },
      { dimensao: 'Relação com Liderança', pontuacao: dados.relacao_lideranca || 0, percentual: 0, nivel: '' },
      { dimensao: 'Estrutura e Condições', pontuacao: dados.estrutura_condicoes || 0, percentual: 0, nivel: '' },
      { dimensao: 'Recompensas e Remuneração', pontuacao: dados.recompensas_remuneracao || 0, percentual: 0, nivel: '' },
      { dimensao: 'Equilíbrio Vida-Trabalho', pontuacao: dados.equilibrio_vida_trabalho || 0, percentual: 0, nivel: '' }
    ];

    // Índice geral - tentar buscar dos metadados ou do formato antigo
    const indiceGeral = metadados.pontuacao || dados.pontuacao_total || dados.indice_geral || 0;
    const nivelGeral = metadados.categoria || dados.nivel_geral || obterClassificacao(indiceGeral);
    const percentualGeral = metadados.percentual || dados.percentual_geral || ((indiceGeral / 5) * 100);

    // Identificar pontos fortes e críticos
    const pontoFortes = metadados.pontoFortes || dimensoes.filter((d: any) => d.pontuacao >= 4.0);
    const dimensoesCriticas = metadados.dimensoesCriticas || dimensoes.filter((d: any) => d.pontuacao < 2.5);
    const riscoTurnover = metadados.riscoTurnover || dados.risco_turnover || indiceGeral < 2.5;
    
    // Extrair dados adicionais
    const insights = metadados.insights || [];
    const recomendacoes = metadados.recomendacoes || [];
    const alertasCriticos = metadados.alertasCriticos || [];
    const totalPerguntas = metadados.totalPerguntas || dados.total_perguntas || 50;

    return (
      <div className="space-y-6">
        {/* Resumo Executivo - Card Destacado */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 rounded-2xl shadow-2xl text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Eye className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Qualidade de Vida no Trabalho</h2>
              <p className="text-blue-100 text-sm mt-1">Avaliação Completa - {totalPerguntas} Perguntas Respondidas</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Índice Geral */}
            <div className="text-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
              <div className="text-6xl font-black mb-2 drop-shadow-lg">
                {indiceGeral.toFixed(1)}
              </div>
              <div className="text-sm font-medium text-blue-100 mb-1">de 5.0 pontos</div>
              <div className="text-xs text-blue-200 uppercase tracking-wider">Índice Geral de QVT</div>
            </div>
            
            {/* Classificação */}
            <div className="text-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
              <div className="flex flex-col items-center justify-center h-full">
                <Badge className="text-lg font-bold px-4 py-2 mb-3 bg-white text-indigo-900 border-none shadow-lg">
                  {nivelGeral}
                </Badge>
                <div className="text-xs text-blue-200 uppercase tracking-wider">Classificação Geral</div>
              </div>
            </div>
            
            {/* Percentual */}
            <div className="text-center p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
              <div className="text-6xl font-black mb-2 drop-shadow-lg">
                {percentualGeral.toFixed(0)}%
              </div>
              <div className="text-sm font-medium text-blue-100 mb-1">de satisfação</div>
              <div className="text-xs text-blue-200 uppercase tracking-wider">Performance Global</div>
            </div>
          </div>
          
          {/* Barra de Progresso Visual */}
          <div className="mt-6">
            <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden backdrop-blur-sm border border-white/30">
              <div 
                className="h-full bg-gradient-to-r from-white via-yellow-200 to-green-400 shadow-inner transition-all duration-1000"
                style={{ width: `${percentualGeral}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Alertas Críticos Detalhados */}
        {alertasCriticos.length > 0 && (
          <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-6 rounded-2xl border-2 border-red-300 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-900">Alertas Críticos - Ação Imediata Necessária</h3>
                <p className="text-sm text-red-700 mt-1">{alertasCriticos.length} área(s) requer(em) atenção urgente</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {alertasCriticos.map((alerta: any, index: number) => (
                <div key={index} className="bg-white p-6 rounded-xl border-2 border-red-200 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-red-600 text-white border-none text-xs font-bold px-3 py-1">
                          {alerta.urgencia || 'URGENTE'}
                        </Badge>
                        <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs font-medium px-3 py-1">
                          Impacto: {alerta.impacto || 'Alto'}
                        </Badge>
                      </div>
                      <h4 className="text-lg font-bold text-red-900 mb-2">{alerta.titulo}</h4>
                      <p className="text-sm text-slate-700 mb-4">{alerta.descricao}</p>
                    </div>
                  </div>
                  
                  {alerta.recomendacoes && alerta.recomendacoes.length > 0 && (
                    <div className="border-t border-red-100 pt-4 mt-4">
                      <div className="text-xs font-bold text-slate-600 uppercase mb-3">Ações Recomendadas:</div>
                      <ul className="space-y-2">
                        {alerta.recomendacoes.map((rec: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="text-red-500 font-bold mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold">Prazo:</span> {alerta.prazoAcao || 'Imediato'}
                    </div>
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold">Responsável:</span> {alerta.responsavel || 'RH + Gestão'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Alertas Simples (fallback) */}
        {alertasCriticos.length === 0 && (riscoTurnover || dimensoesCriticas.length > 0) && (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border border-red-200/60">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Críticos
            </h3>
            <div className="space-y-3">
              {riscoTurnover && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    <strong>Risco de Turnover Elevado:</strong> O índice geral indica alta probabilidade de rotatividade.
                  </AlertDescription>
                </Alert>
              )}
              {dimensoesCriticas.length > 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertDescription className="text-orange-800">
                    <strong>Dimensões Críticas:</strong> {dimensoesCriticas.map((d: any) => d.dimensao).join(', ')} requerem atenção imediata.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}

        {/* Dimensões da Qualidade de Vida - Design Profissional */}
        <div className="bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border border-slate-200/60 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Logo size="sm" showText={false} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800">Avaliação por Dimensões</h3>
              <p className="text-sm text-slate-600 mt-1">Análise detalhada das 5 dimensões de QVT</p>
            </div>
          </div>
          
          <div className="space-y-5">
            {dimensoes.map((dimensao: any, index: number) => (
              <div key={index} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base font-bold text-slate-800">{dimensao.dimensao}</span>
                      <Badge className={`${obterCorBadge(dimensao.pontuacao)} text-xs font-semibold px-2 py-1 border`}>
                        {dimensao.nivel || obterClassificacao(dimensao.pontuacao)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-black ${obterCorTexto(dimensao.pontuacao)}`}>
                      {dimensao.pontuacao.toFixed(1)}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">de 5.0</div>
                  </div>
                </div>
                
                {/* Barra de Progresso Melhorada */}
                <div className="relative">
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                    <div 
                      className={`h-full ${obterCorPontuacao(dimensao.pontuacao)} transition-all duration-500 shadow-inner`}
                      style={{ width: `${(dimensao.pontuacao / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="absolute -top-1 right-0 text-xs font-bold text-slate-600">
                    {dimensao.percentual?.toFixed(0) || ((dimensao.pontuacao / 5) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pontos Fortes */}
        {pontoFortes.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200/60">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Pontos Fortes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pontoFortes.map((ponto: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-green-800">{ponto.dimensao}</div>
                    <div className="text-sm text-green-600">{ponto.pontuacao.toFixed(1)}/5.0</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights Profissionais */}
        {insights.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6 rounded-2xl border border-purple-200/60 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Logo size="sm" showText={false} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-purple-900">Insights Profissionais</h3>
                <p className="text-sm text-purple-700 mt-1">Análise comportamental e padrões identificados</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {insights.map((insight: string, index: number) => (
                <div key={index} className="bg-white p-5 rounded-xl border-l-4 border-purple-400 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed flex-1">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Recomendações Estratégicas */}
        {recomendacoes.length > 0 && (
          <div className="bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 p-6 rounded-2xl border border-cyan-200/60 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-cyan-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-cyan-900">Recomendações Estratégicas</h3>
                <p className="text-sm text-cyan-700 mt-1">Ações sugeridas para melhoria contínua</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {recomendacoes.map((rec: string, index: number) => (
                <div key={index} className="bg-white p-5 rounded-xl border border-cyan-100 hover:border-cyan-300 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-sm">✓</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">{rec}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações Técnicas */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-xl border border-slate-200/60">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Informações Técnicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">ID do Resultado:</span>
              <span className="ml-2 font-medium">{dados.id || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-600">Data de Realização:</span>
              <span className="ml-2 font-medium">{dados.created_at ? new Date(dados.created_at).toLocaleDateString('pt-BR') : 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-600">Total de Perguntas:</span>
              <span className="ml-2 font-medium">{dados.total_perguntas || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-600">Sessão:</span>
              <span className="ml-2 font-medium">{dados.session_id || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHumaniQInsightContent = (dados: any) => {
    // Extrair dados dos metadados
    const metadados = dados.metadados || dados;
    const pontuacaoTotal = dados.pontuacao_total || metadados.pontuacao_total || 147;
    const tempoGasto = dados.tempo_gasto || metadados.tempo_gasto || 0;
    const pontuacoesDimensoes = metadados.pontuacoes_dimensoes || {};
    const recomendacoes = metadados.recomendacoes || [];
    
    // Calcular pontuação percentual e média
    const pontuacaoPercentual = ((pontuacaoTotal / (48 * 5)) * 100).toFixed(1);
    const pontuacaoMedia = (pontuacaoTotal / 48).toFixed(2);
    const tempoMinutos = Math.round(tempoGasto / 60);
    
    // Definir nível baseado na pontuação média (escala 1-5)
    const getNivel = (pontuacao: number) => {
      if (pontuacao >= 4.0) return { texto: 'Excelente', cor: 'text-green-600', bgCor: 'bg-green-100', classificacao: 'Clima Positivo e Saudavel' };
      if (pontuacao >= 3.5) return { texto: 'Bom', cor: 'text-blue-600', bgCor: 'bg-blue-100', classificacao: 'Clima Positivo' };
      if (pontuacao >= 3.0) return { texto: 'Adequado', cor: 'text-yellow-600', bgCor: 'bg-yellow-100', classificacao: 'Clima Moderado/Neutro' };
      if (pontuacao >= 2.5) return { texto: 'Atenção', cor: 'text-orange-600', bgCor: 'bg-orange-100', classificacao: 'Clima de Atencao' };
      return { texto: 'Crítico', cor: 'text-red-600', bgCor: 'bg-red-100', classificacao: 'Clima Problematico' };
    };
    
    const nivelGeral = getNivel(parseFloat(pontuacaoMedia));
    
    // Gerar análise detalhada profissional
    const gerarAnaliseDetalhada = () => {
      const dimensoes = [
        {
          nome: 'Seguranca Psicologica',
          valor: pontuacoesDimensoes['seguranca-psicologica'] || 0,
          descricao: 'Liberdade para se expressar sem medo de julgamento ou retaliacao'
        },
        {
          nome: 'Comunicacao Interna',
          valor: pontuacoesDimensoes['comunicacao-interna'] || 0,
          descricao: 'Clareza, abertura e fluxo de informacao entre times e liderancas'
        },
        {
          nome: 'Pertencimento e Inclusao',
          valor: pontuacoesDimensoes['pertencimento'] || 0,
          descricao: 'Sentimento de ser aceito, valorizado e integrado a equipe'
        },
        {
          nome: 'Justica Organizacional',
          valor: pontuacoesDimensoes['justica-organizacional'] || 0,
          descricao: 'Percepcao de equidade, etica, transparencia e reconhecimento'
        }
      ];
      
      let analise = `ANALISE HUMANIQ INSIGHT\n\n`;
      analise += `Pontuacao Geral: ${pontuacaoMedia} de 5.00\n`;
      analise += `Classificacao: ${nivelGeral.classificacao}\n\n`;
      analise += `VISAO GERAL\n\n`;
      
      if (parseFloat(pontuacaoMedia) >= 4.0) {
        analise += `Sua organizacao apresenta um clima organizacional excelente. Os colaboradores demonstram alto nivel de engajamento, confianca e satisfacao. Continue investindo nas praticas que tem gerado esses resultados positivos.\n\n`;
      } else if (parseFloat(pontuacaoMedia) >= 3.5) {
        analise += `Sua organizacao apresenta um clima organizacional positivo. Existem fundacoes solidas, mas ainda ha oportunidades de melhoria em areas especificas como seguranca psicologica, comunicacao interna, pertencimento e justica organizacional.\n\n`;
      } else if (parseFloat(pontuacaoMedia) >= 3.0) {
        analise += `Sua organizacao apresenta um clima organizacional moderado. Existem aspectos positivos, mas tambem oportunidades significativas de melhoria em areas como seguranca psicologica, comunicacao interna, pertencimento e justica organizacional.\n\n`;
      } else if (parseFloat(pontuacaoMedia) >= 2.5) {
        analise += `Sua organizacao apresenta um clima organizacional que requer atencao. Diversas areas criticas necessitam de intervencao imediata para evitar impactos negativos no engajamento, produtividade e retencao de talentos.\n\n`;
      } else {
        analise += `Sua organizacao apresenta um clima organizacional critico. E fundamental implementar acoes corretivas urgentes em multiplas dimensoes para reverter a situacao atual e prevenir consequencias graves para o negocio.\n\n`;
      }
      
      analise += `ANALISE POR DIMENSAO\n\n`;
      
      dimensoes.forEach(dim => {
        const nivel = getNivel(dim.valor);
        analise += `${dim.nome}: ${dim.valor.toFixed(2)} de 5.00 - ${nivel.classificacao}\n`;
        analise += `${dim.descricao}\n\n`;
      });
      
      return analise;
    };
    
    const interpretacao = gerarAnaliseDetalhada();
    
    // Preparar dados das dimensões para os gráficos
    const dimensoesData = [
      {
        nome: 'Segurança Psicológica',
        dimensao: 'Segurança',
        pontuacao: (pontuacoesDimensoes['seguranca-psicologica'] || 0) * 20,
        valor: pontuacoesDimensoes['seguranca-psicologica'] || 0,
        cor: '#8B5CF6',
        fullMark: 100
      },
      {
        nome: 'Comunicação Interna',
        dimensao: 'Comunicação',
        pontuacao: (pontuacoesDimensoes['comunicacao-interna'] || 0) * 20,
        valor: pontuacoesDimensoes['comunicacao-interna'] || 0,
        cor: '#3B82F6',
        fullMark: 100
      },
      {
        nome: 'Pertencimento',
        dimensao: 'Pertencimento',
        pontuacao: (pontuacoesDimensoes['pertencimento'] || 0) * 20,
        valor: pontuacoesDimensoes['pertencimento'] || 0,
        cor: '#EC4899',
        fullMark: 100
      },
      {
        nome: 'Justiça Organizacional',
        dimensao: 'Justiça',
        pontuacao: (pontuacoesDimensoes['justica-organizacional'] || 0) * 20,
        valor: pontuacoesDimensoes['justica-organizacional'] || 0,
        cor: '#10B981',
        fullMark: 100
      },
    ];
    
    return (
      <div className="container max-w-7xl mx-auto p-6 space-y-6 bg-gradient-to-br from-purple-50/30 via-blue-50/30 to-pink-50/30 min-h-screen">
        {/* Header com Título */}
        <div className="text-center space-y-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full backdrop-blur-sm mb-2">
            <Logo size="md" showText={false} />
          </div>
          <h1 className="text-4xl font-bold">HumaniQ Insight</h1>
          <p className="text-lg opacity-90">
            Análise Completa do Clima Organizacional e Bem-Estar Psicológico
          </p>
        </div>

        {/* Card Principal - Pontuação Geral */}
        <Card className="border-2 border-purple-200/60 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <h2 className="text-lg font-semibold text-slate-600 uppercase tracking-wide">
                PONTUAÇÃO GERAL
              </h2>
              <div className="text-7xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {pontuacaoPercentual} %
              </div>
              <Badge className={`text-lg px-6 py-2 ${nivelGeral.bgCor} ${nivelGeral.cor} border-0`}>
                {nivelGeral.texto}
              </Badge>
              
              <div className="max-w-2xl mx-auto mt-6">
                <Progress 
                  value={parseFloat(pontuacaoPercentual)} 
                  className="h-3 bg-gradient-to-r from-slate-200 to-slate-300"
                />
              </div>
              
              <div className="flex justify-center gap-12 mt-8 text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">{tempoMinutos} minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <span className="font-medium">48 questões</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico Radar */}
          <Card className="border-purple-200/60 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Visão 360° das Dimensões
              </CardTitle>
              <CardDescription>Análise multidimensional do clima organizacional</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={dimensoesData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis 
                    dataKey="dimensao" 
                    tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af' }} />
                  <Radar
                    name="Pontuação"
                    dataKey="pontuacao"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Pontuação']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Barras */}
          <Card className="border-purple-200/60 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Pontuação por Dimensão
              </CardTitle>
              <CardDescription>Desempenho detalhado em cada área avaliada</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dimensoesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                  <YAxis 
                    dataKey="dimensao" 
                    type="category" 
                    width={100}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Pontuação']}
                  />
                  <Bar dataKey="pontuacao" radius={[0, 8, 8, 0]}>
                    {dimensoesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Análise Detalhada */}
        {interpretacao && (
          <Card className="border-purple-200/60 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-purple-600" />
                Análise Detalhada
              </CardTitle>
              <CardDescription>Interpretação profissional dos seus resultados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate max-w-none whitespace-pre-wrap">
                {interpretacao}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recomendações */}
        {recomendacoes && recomendacoes.length > 0 && (
          <Card className="border-purple-200/60 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Recomendações Estratégicas
              </CardTitle>
              <CardDescription>Ações prioritárias para melhoria do clima organizacional</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recomendacoes.map((recomendacao, index) => (
                  <div key={index} className="flex gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200/60">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-slate-700 flex-1">{recomendacao}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderGenericContent = (dados: any) => {
    // Verificar se é um resultado QVT com dados específicos
    if (dados.indice_geral !== undefined || dados.satisfacao_funcao !== undefined) {
      return renderQVTContent(dados);
    }

    // Renderização genérica para outros tipos de teste
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-xl border border-slate-200/60">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Informações do Resultado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-slate-600">Pontuação:</div>
              <div className="text-xl font-bold text-slate-800">{resultado?.pontuacao || dados?.pontuacao || 'N/A'}%</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-slate-600">Nível:</div>
              <Badge variant="outline" className="text-sm">
                {resultado?.nivel || dados?.nivel || 'Não definido'}
              </Badge>
            </div>
          </div>
          
          {/* Mostrar dados brutos se disponíveis */}
          {dados && Object.keys(dados).length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-600 mb-2">Dados do Resultado:</div>
              <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono text-slate-700 max-h-40 overflow-y-auto">
                {JSON.stringify(dados, null, 2)}
              </div>
            </div>
          )}
        </div>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Visualização detalhada específica não disponível para este tipo de teste. Os dados básicos estão sendo exibidos acima.
          </AlertDescription>
        </Alert>
      </div>
    );
  };

  const obterCorRisco = (nivelRisco: string) => {
    switch (nivelRisco?.toLowerCase()) {
      case 'baixo':
        return 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200';
      case 'moderado':
        return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200';
      case 'alto':
        return 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200';
      case 'muito alto':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200';
      default:
        return 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border border-slate-200';
    }
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Carregando resultado...</span>
      </div>
    );
  }

  if (erro) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar resultado: {erro}
        </AlertDescription>
      </Alert>
    );
  }

  if (!dadosResultado) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Nenhum dado disponível para exibir.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      {isHumaniQInsight(resultado!) ? 
        renderHumaniQInsightContent(dadosResultado) : 
        isKarasekSiegrist(resultado!) ? 
        renderKarasekSiegristContent(dadosResultado) : 
        isClimaOrganizacional(resultado!) ?
        renderClimaOrganizacionalContent(dadosResultado) :
        isRPO(resultado!) ?
        renderRPOContent(dadosResultado) :
        isQVT(resultado!) ?
        renderQVTContent(dadosResultado) :
        renderGenericContent(dadosResultado)
      }
    </>
  );
}
