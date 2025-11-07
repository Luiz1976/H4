import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Sparkles, 
  Loader2,
  AlertTriangle,
  Activity,
  Users,
  Shield,
  TrendingUp,
  CheckCircle2,
  Clock,
  Target,
  Briefcase,
  DollarSign,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import Logo from '@/components/Logo';
import MatrizRisco from "@/components/prg/MatrizRisco";
import GraficoDistribuicaoRiscos from "@/components/prg/GraficoDistribuicaoRiscos";
import GraficoRadarDimensoes from "@/components/prg/GraficoRadarDimensoes";
import RiskGauge from "@/components/RiskGauge";

interface EmpresaData {
  nome: string;
  cnpj: string;
  endereco: string;
  setor: string;
}

interface PRGData {
  empresa?: EmpresaData;
  indiceGlobal: number;
  kpis: {
    indiceEstresse: number;
    climaPositivo: number;
    satisfacaoChefia: number;
    riscoBurnout: number;
    maturidadePRG: number;
    segurancaPsicologica: number;
  };
  totalColaboradores: number;
  totalTestes: number;
  cobertura: number;
  dadosPorTipo: {
    clima: number;
    estresse: number;
    burnout: number;
    qvt: number;
    assedio: number;
    disc: number;
  };
  aiAnalysis: {
    sintese: string;
    dataGeracao: string;
  };
  recomendacoes: Array<{
    categoria: string;
    prioridade: string;
    titulo: string;
    descricao: string;
    acoesPraticas?: string[];
    prazo?: string;
    responsavel?: string;
    impactoEsperado?: string;
    recursos?: string[];
  }>;
  matrizRiscos: Array<{
    nome: string;
    probabilidade: 'A' | 'B' | 'C' | 'D' | 'E';
    severidade: 1 | 2 | 3 | 4 | 5;
    categoria: string;
  }>;
  distribuicaoRiscos: Array<{
    categoria: string;
    critico: number;
    alto: number;
    moderado: number;
    baixo: number;
  }>;
  dimensoesPsicossociais: Array<{
    dimensao: string;
    valor: number;
    meta: number;
  }>;
}

export default function PRGPublico() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prgData, setPrgData] = useState<PRGData | null>(null);
  const [activeTab, setActiveTab] = useState("resumo");

  useEffect(() => {
    const fetchPRGData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!token) {
          throw new Error('Token de compartilhamento inválido');
        }

        console.log('📊 [PRG Público] Carregando dados compartilhados...');
        
        const response = await fetch(`/api/empresas/prg/publico/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Não foi possível carregar os dados do PRG');
        }

        const data = await response.json();
        setPrgData(data);
        console.log('✅ [PRG Público] Dados carregados com sucesso');
        
      } catch (err) {
        console.error('❌ [PRG Público] Erro:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchPRGData();
  }, [token]);

  const getStatusBadge = (valor: number) => {
    if (valor >= 80) {
      return { label: "Excelente", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
    } else if (valor >= 60) {
      return { label: "Adequado", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
    } else if (valor >= 40) {
      return { label: "Atenção", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" };
    } else {
      return { label: "Crítico", color: "bg-red-500/20 text-red-300 border-red-500/30" };
    }
  };

  const getRiskBadge = (valor: number) => {
    if (valor >= 70) {
      return { label: "Risco Alto", color: "bg-red-500/20 text-red-300 border-red-500/30" };
    } else if (valor >= 40) {
      return { label: "Risco Moderado", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" };
    } else {
      return { label: "Risco Baixo", color: "bg-green-500/20 text-green-300 border-green-500/30" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto" />
          <p className="text-white/70 text-base md:text-lg">Carregando relatório executivo...</p>
        </div>
      </div>
    );
  }

  if (error || !prgData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 p-4 md:p-6 flex items-center justify-center">
        <Card className="border-red-500/50 bg-red-950/20 backdrop-blur-xl max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto" />
            <p className="text-white font-semibold">Acesso Inválido</p>
            <p className="text-white/60 text-sm">{error || 'Token de compartilhamento inválido ou expirado'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const indiceGlobal = prgData.indiceGlobal;
  const statusGlobal = getStatusBadge(indiceGlobal);

  const kpisData = [
    {
      titulo: "Estresse Ocupacional",
      subtitulo: "Nível de pressão e demanda no trabalho",
      valor: prgData.kpis.indiceEstresse,
      icon: Activity,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      interpretacao: prgData.kpis.indiceEstresse >= 70 ? "Nível elevado - requer atenção imediata" : prgData.kpis.indiceEstresse >= 50 ? "Nível moderado - monitoramento recomendado" : "Nível controlado"
    },
    {
      titulo: "Clima Organizacional",
      subtitulo: "Qualidade do ambiente de trabalho",
      valor: prgData.kpis.climaPositivo,
      icon: Users,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      interpretacao: prgData.kpis.climaPositivo >= 70 ? "Ambiente saudável e produtivo" : prgData.kpis.climaPositivo >= 50 ? "Ambiente adequado com potencial de melhoria" : "Requer intervenção urgente"
    },
    {
      titulo: "Satisfação com Liderança",
      subtitulo: "Percepção sobre gestão e chefia",
      valor: prgData.kpis.satisfacaoChefia,
      icon: CheckCircle2,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      interpretacao: prgData.kpis.satisfacaoChefia >= 70 ? "Liderança bem avaliada" : prgData.kpis.satisfacaoChefia >= 50 ? "Avaliação moderada" : "Necessita desenvolvimento de lideranças"
    },
    {
      titulo: "Risco de Burnout",
      subtitulo: "Probabilidade de esgotamento profissional",
      valor: prgData.kpis.riscoBurnout,
      icon: AlertTriangle,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      interpretacao: prgData.kpis.riscoBurnout >= 60 ? "Risco elevado - ação imediata necessária" : prgData.kpis.riscoBurnout >= 40 ? "Risco moderado - prevenção recomendada" : "Risco controlado",
      isRisk: true
    },
    {
      titulo: "Maturidade do PRG",
      subtitulo: "Nível de implementação do programa",
      valor: prgData.kpis.maturidadePRG,
      icon: TrendingUp,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      interpretacao: prgData.kpis.maturidadePRG >= 75 ? "Programa maduro e estruturado" : prgData.kpis.maturidadePRG >= 50 ? "Programa em desenvolvimento" : "Programa inicial - requer estruturação"
    },
    {
      titulo: "Segurança Psicológica",
      subtitulo: "Sensação de proteção e apoio",
      valor: prgData.kpis.segurancaPsicologica,
      icon: Shield,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      interpretacao: prgData.kpis.segurancaPsicologica >= 70 ? "Ambiente seguro e acolhedor" : prgData.kpis.segurancaPsicologica >= 50 ? "Segurança adequada" : "Requer fortalecimento"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 p-3 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        
        {/* IDENTIFICAÇÃO DA EMPRESA */}
        {prgData.empresa && (
          <Card className="border-0 bg-white/5 backdrop-blur-md shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white">{prgData.empresa.nome}</h2>
                  <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-white/70 mt-1">
                    <span>CNPJ: {prgData.empresa.cnpj}</span>
                    {prgData.empresa.setor !== 'Não informado' && <span>Setor: {prgData.empresa.setor}</span>}
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border-white/20 shrink-0">
                  Relatório Público
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* HEADER EXECUTIVO */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl -z-10"></div>
          
          <Card className="border-0 bg-white/10 backdrop-blur-2xl shadow-2xl rounded-2xl md:rounded-3xl overflow-hidden">
            <CardContent className="p-6 md:p-12">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-8">
                <div className="flex-1 min-w-0 space-y-4 md:space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                      <div className="relative p-3 md:p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                        <FileText className="h-8 w-8 md:h-12 md:w-12 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight">
                          Relatório Executivo PRG
                        </h1>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 backdrop-blur-xl shrink-0">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Público
                        </Badge>
                      </div>
                      <p className="text-white/70 text-sm md:text-base lg:text-lg font-medium">
                        Programa de Gestão de Riscos Psicossociais
                      </p>
                      <p className="text-white/50 text-xs md:text-sm mt-2">
                        Conforme NR-01 e ISO 45003
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-auto flex items-center justify-center">
                  <RiskGauge 
                    value={indiceGlobal}
                    totalTests={prgData.totalTestes}
                    size="medium"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TABS PRINCIPAIS */}
        <Card className="border-0 bg-white/10 backdrop-blur-xl shadow-xl rounded-2xl">
          <CardContent className="p-3 md:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="overflow-x-auto -mx-3 md:mx-0 px-3 md:px-0">
                <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-1 md:gap-2 bg-white/5 p-1.5 md:p-2 rounded-xl mb-4 md:mb-6 min-w-max lg:min-w-0">
                  <TabsTrigger 
                    value="resumo" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-white/60 text-xs md:text-sm whitespace-nowrap px-2 md:px-4"
                  >
                    Resumo
                  </TabsTrigger>
                  <TabsTrigger 
                    value="indicadores" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-white/60 text-xs md:text-sm whitespace-nowrap px-2 md:px-4"
                  >
                    Indicadores
                  </TabsTrigger>
                  <TabsTrigger 
                    value="dimensoes" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-white/60 text-xs md:text-sm whitespace-nowrap px-2 md:px-4"
                  >
                    Dimensões
                  </TabsTrigger>
                  <TabsTrigger 
                    value="riscos" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-white/60 text-xs md:text-sm whitespace-nowrap px-2 md:px-4"
                  >
                    Riscos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analise" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-white/60 text-xs md:text-sm whitespace-nowrap px-2 md:px-4"
                  >
                    Análise
                  </TabsTrigger>
                  <TabsTrigger 
                    value="acoes" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-white/60 text-xs md:text-sm whitespace-nowrap px-2 md:px-4"
                  >
                    Ações
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* ABA: RESUMO EXECUTIVO */}
              <TabsContent value="resumo" className="space-y-4 md:space-y-6 mt-4">
                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-bold text-white">Resumo Executivo</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30 backdrop-blur-xl">
                      <CardContent className="p-4 md:p-6 text-center">
                        <Users className="h-8 w-8 md:h-10 md:w-10 text-blue-400 mx-auto mb-2" />
                        <p className="text-white/60 text-xs md:text-sm mb-1">Colaboradores</p>
                        <p className="text-3xl md:text-4xl font-bold text-white">{prgData.totalColaboradores}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30 backdrop-blur-xl">
                      <CardContent className="p-4 md:p-6 text-center">
                        <FileText className="h-8 w-8 md:h-10 md:w-10 text-purple-400 mx-auto mb-2" />
                        <p className="text-white/60 text-xs md:text-sm mb-1">Avaliações Realizadas</p>
                        <p className="text-3xl md:text-4xl font-bold text-white">{prgData.totalTestes}</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30 backdrop-blur-xl">
                      <CardContent className="p-4 md:p-6 text-center">
                        <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-green-400 mx-auto mb-2" />
                        <p className="text-white/60 text-xs md:text-sm mb-1">Taxa de Participação</p>
                        <p className="text-3xl md:text-4xl font-bold text-white">{prgData.cobertura}%</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30 backdrop-blur-xl">
                      <CardContent className="p-4 md:p-6 text-center">
                        <Activity className="h-8 w-8 md:h-10 md:w-10 text-orange-400 mx-auto mb-2" />
                        <p className="text-white/60 text-xs md:text-sm mb-1">Status Geral</p>
                        <p className="text-2xl md:text-3xl font-bold text-white">{statusGlobal.label}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-gradient-to-br from-white/5 to-white/10 border-white/20 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white text-lg md:text-xl flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 md:h-6 md:w-6" />
                        O que é o PRG?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-white/80 space-y-3 text-sm md:text-base leading-relaxed">
                      <p>
                        O <strong>Programa de Gestão de Riscos Psicossociais (PRG)</strong> é uma ferramenta estratégica para identificar, 
                        avaliar e mitigar fatores que podem afetar a saúde mental e o bem-estar dos colaboradores.
                      </p>
                      <p>
                        Este relatório apresenta uma visão completa da situação atual da organização, incluindo indicadores-chave, 
                        análise de riscos e recomendações práticas para melhoria contínua.
                      </p>
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 md:p-4 mt-4">
                        <p className="text-blue-200 text-xs md:text-sm">
                          <strong>Conformidade:</strong> Este programa está alinhado com a NR-01 (Portaria MTP nº 6.730/2020) 
                          e ISO 45003:2021 para gestão de saúde e segurança ocupacional.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ABA: INDICADORES DETALHADOS */}
              <TabsContent value="indicadores" className="space-y-4 mt-4">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Indicadores-Chave de Desempenho</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {kpisData.map((kpi, index) => {
                    const Icon = kpi.icon;
                    const status = kpi.isRisk ? getRiskBadge(kpi.valor) : getStatusBadge(kpi.valor);
                    
                    return (
                      <Card key={index} className="border-0 bg-white/10 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all">
                        <CardContent className="p-4 md:p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-2 md:p-3 rounded-xl ${kpi.bgColor} shrink-0`}>
                              <Icon className={`h-5 w-5 md:h-6 md:w-6 ${kpi.color}`} />
                            </div>
                            <Badge className={`${status.color} border backdrop-blur-xl text-xs`}>
                              {status.label}
                            </Badge>
                          </div>
                          
                          <h3 className="text-white font-bold text-base md:text-lg mb-1">{kpi.titulo}</h3>
                          <p className="text-white/60 text-xs md:text-sm mb-3">{kpi.subtitulo}</p>
                          
                          <div className="flex items-end gap-2 mb-3">
                            <span className="text-4xl md:text-5xl font-black text-white">{kpi.valor}%</span>
                          </div>
                          
                          <Progress value={kpi.valor} className="mt-3 h-2 md:h-3 bg-white/10" />
                          
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-white/70 text-xs md:text-sm">
                              <strong className="text-white">Interpretação:</strong> {kpi.interpretacao}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* ABA: DIMENSÕES PSICOSSOCIAIS */}
              <TabsContent value="dimensoes" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Dimensões Psicossociais</h2>
                    <p className="text-white/60 text-sm md:text-base">
                      Análise comparativa entre situação atual e metas estabelecidas
                    </p>
                  </div>
                  
                  <GraficoRadarDimensoes dados={prgData.dimensoesPsicossociais} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-4">
                    {prgData.dimensoesPsicossociais.map((dim, idx) => {
                      const gap = dim.meta - dim.valor;
                      const percentualMeta = (dim.valor / dim.meta) * 100;
                      
                      return (
                        <Card key={idx} className="bg-white/5 border-white/10 backdrop-blur-xl">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-white font-semibold text-sm md:text-base">{dim.dimensao}</h4>
                              <Badge className={percentualMeta >= 90 ? "bg-green-500/20 text-green-300 border-green-500/30" : percentualMeta >= 70 ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" : "bg-red-500/20 text-red-300 border-red-500/30"}>
                                {percentualMeta.toFixed(0)}% da meta
                              </Badge>
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-2xl md:text-3xl font-bold text-white">{dim.valor}%</span>
                              <span className="text-white/50 text-sm">/ Meta: {dim.meta}%</span>
                            </div>
                            <Progress value={percentualMeta} className="h-2 bg-white/10" />
                            {gap > 0 && (
                              <p className="text-white/60 text-xs mt-2">
                                Gap de {gap}% para atingir a meta
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* ABA: ANÁLISE DE RISCOS */}
              <TabsContent value="riscos" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <h2 className="text-xl md:text-2xl font-bold text-white">Análise de Riscos</h2>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Distribuição por Categoria</h3>
                      <GraficoDistribuicaoRiscos dados={prgData.distribuicaoRiscos} />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Matriz de Riscos</h3>
                      <MatrizRisco riscos={prgData.matrizRiscos} />
                    </div>
                  </div>

                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="text-white text-base md:text-lg">Legenda da Matriz</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm md:text-base">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-white font-semibold mb-2">Probabilidade:</p>
                          <ul className="text-white/70 space-y-1 text-xs md:text-sm">
                            <li>A - Rara (até 20%)</li>
                            <li>B - Improvável (20-40%)</li>
                            <li>C - Possível (40-60%)</li>
                            <li>D - Provável (60-80%)</li>
                            <li>E - Quase certa (acima de 80%)</li>
                          </ul>
                        </div>
                        <div>
                          <p className="text-white font-semibold mb-2">Severidade:</p>
                          <ul className="text-white/70 space-y-1 text-xs md:text-sm">
                            <li>1 - Leve (impacto mínimo)</li>
                            <li>2 - Menor (impacto baixo)</li>
                            <li>3 - Moderada (impacto médio)</li>
                            <li>4 - Maior (impacto alto)</li>
                            <li>5 - Extrema (impacto crítico)</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ABA: ANÁLISE IA */}
              <TabsContent value="analise" className="space-y-4 mt-4">
                <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-blue-500/20 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white text-lg md:text-xl flex items-center gap-2">
                      <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
                      Análise Inteligente com IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white/5 rounded-xl p-4 md:p-6 border border-white/10">
                      <div className="text-white/90 space-y-4 leading-relaxed text-sm md:text-base">
                        {prgData.aiAnalysis.sintese.split('\n\n').map((paragrafo, i) => (
                          <p key={i} className="text-justify">{paragrafo}</p>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-white/50 text-xs md:text-sm">
                        Análise gerada por Inteligência Artificial • {new Date(prgData.aiAnalysis.dataGeracao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ABA: PLANO DE AÇÕES */}
              <TabsContent value="acoes" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Plano de Ações Recomendadas</h2>
                    <p className="text-white/60 text-sm md:text-base">
                      {prgData.recomendacoes.length} recomendações estratégicas baseadas nos dados coletados
                    </p>
                  </div>

                  {prgData.recomendacoes.map((rec, index) => (
                    <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3 md:gap-4 mb-4">
                          <Badge className={rec.prioridade === 'Alta' ? 'bg-red-500/20 text-red-300 border-red-500/30 shrink-0' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30 shrink-0'}>
                            {rec.prioridade === 'Alta' ? '🔴' : '🟡'} {rec.prioridade}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold text-base md:text-lg mb-1">{rec.titulo}</h4>
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                              {rec.categoria}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="text-white/80 text-sm md:text-base leading-relaxed">{rec.descricao}</p>
                          </div>

                          {rec.acoesPraticas && rec.acoesPraticas.length > 0 && (
                            <div className="bg-white/5 rounded-lg p-3 md:p-4 border border-white/10">
                              <h5 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                                <ArrowRight className="h-4 w-4" />
                                Ações Práticas:
                              </h5>
                              <ul className="space-y-2">
                                {rec.acoesPraticas.map((acao, i) => (
                                  <li key={i} className="text-white/70 text-xs md:text-sm flex items-start gap-2">
                                    <span className="text-blue-400 shrink-0">•</span>
                                    <span>{acao}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {rec.prazo && (
                              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                <p className="text-white/50 text-xs mb-1 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Prazo
                                </p>
                                <p className="text-white text-sm font-semibold">{rec.prazo}</p>
                              </div>
                            )}
                            
                            {rec.responsavel && (
                              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                <p className="text-white/50 text-xs mb-1 flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  Responsável
                                </p>
                                <p className="text-white text-sm font-semibold">{rec.responsavel}</p>
                              </div>
                            )}
                            
                            {rec.impactoEsperado && (
                              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                <p className="text-white/50 text-xs mb-1 flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  Impacto Esperado
                                </p>
                                <p className="text-white text-sm font-semibold">{rec.impactoEsperado}</p>
                              </div>
                            )}
                            
                            {rec.recursos && rec.recursos.length > 0 && (
                              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                <p className="text-white/50 text-xs mb-1 flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  Recursos
                                </p>
                                <p className="text-white text-sm font-semibold">{rec.recursos.join(', ')}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>

        {/* RODAPÉ HUMANIQ AI */}
        <Card className="border-0 bg-gradient-to-r from-indigo-950/50 via-purple-950/50 to-blue-950/50 backdrop-blur-lg shadow-xl">
          <CardContent className="p-4 md:p-6">
            <div className="text-center space-y-3 md:space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Logo size="sm" showText={false} className="h-5 w-5 md:h-6 md:w-6 text-purple-400" />
                <h3 className="text-lg md:text-xl font-bold text-white">HumaniQ AI</h3>
              </div>
              <p className="text-white/80 text-xs md:text-sm max-w-4xl mx-auto leading-relaxed">
                A <strong>HumaniQ AI</strong> é uma plataforma inteligente especializada na análise e gestão de riscos psicossociais e ocupacionais, 
                desenvolvida com base na NR-01 e demais normativas vigentes de Saúde e Segurança do Trabalho (SST). 
                Utilizando inteligência artificial e metodologia científica, a HumaniQ AI realiza diagnósticos automatizados, 
                cruzamento de dados de testes psicossociais e comportamentais, e gera relatórios técnicos que subsidiam a construção do PRG 
                – Programa de Gerenciamento de Riscos, de forma precisa, ética e em conformidade com os princípios da prevenção e melhoria contínua.
              </p>
              <p className="text-white/60 text-xs">
                Todos os relatórios da HumaniQ AI são produzidos de forma autônoma e imparcial, com base nos resultados dos colaboradores vinculados à empresa analisada, 
                garantindo sigilo, integridade dos dados e rastreabilidade completa do processo avaliativo.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 pt-3 md:pt-4">
                <Badge variant="outline" className="bg-white/5 border-white/20 text-white/70 text-xs md:text-sm">
                  <Shield className="h-3 w-3 mr-1" />
                  NR-01
                </Badge>
                <Badge variant="outline" className="bg-white/5 border-white/20 text-white/70 text-xs md:text-sm">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  ISO 45003
                </Badge>
                <Badge variant="outline" className="bg-white/5 border-white/20 text-white/70 text-xs md:text-sm">
                  <Logo size="sm" showText={false} className="h-3 w-3 mr-1" />
                  IA Ética
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
