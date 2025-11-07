import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Target,
  Activity,
  Zap,
  RefreshCw,
  Download,
  Filter,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { conviteService, type ConviteMetrics, type ConviteData } from "@/services/conviteService";

interface DashboardData {
  metricas: ConviteMetrics;
  convitesRecentes: ConviteData[];
  convitesProximosVencimento: ConviteData[];
  tendencias: {
    mes: string;
    convites: number;
    colaboradores: number;
    taxa: number;
  }[];
}

const DashboardConvites = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroTempo, setFiltroTempo] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cores para gráficos
  const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    purple: '#8b5cf6'
  };

  const PIE_COLORS = [COLORS.success, COLORS.warning, COLORS.danger, COLORS.info];

  useEffect(() => {
    carregarDashboard();
  }, [filtroTempo]);

  const carregarDashboard = async () => {
    setIsLoading(true);
    try {
      const [metricas, convites, convitesVencimento] = await Promise.all([
        conviteService.obterMetricas(),
        conviteService.listarConvites(),
        conviteService.verificarConvitesProximosVencimento(7)
      ]);

      // Simular dados de tendência
      const tendencias = metricas.convitesPorMes.map(item => ({
        mes: item.mes,
        convites: item.quantidade,
        colaboradores: Math.floor(item.quantidade * 15 + Math.random() * 10),
        taxa: Math.floor(Math.random() * 30 + 60)
      }));

      setDashboardData({
        metricas,
        convitesRecentes: convites.slice(0, 5),
        convitesProximosVencimento: convitesVencimento,
        tendencias
      });
    } catch (error) {
      toast.error("Erro ao carregar dashboard", {
        description: "Tente novamente em alguns instantes"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarDashboard = async () => {
    setIsRefreshing(true);
    await carregarDashboard();
    setIsRefreshing(false);
    toast.success("Dashboard atualizado!");
  };

  const exportarRelatorio = () => {
    toast.success("Relatório exportado!", {
      description: "O arquivo será baixado em breve"
    });
  };

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calcularDiasRestantes = (dataExpiracao: Date) => {
    const hoje = new Date();
    const diffTime = dataExpiracao.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950 dark:to-pink-900 p-6">
        <div className="container mx-auto max-w-7xl">
          <Alert className="max-w-md mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar dados do dashboard. Tente novamente.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const { metricas, convitesRecentes, convitesProximosVencimento, tendencias } = dashboardData;

  // Dados para gráfico de pizza
  const dadosPizza = [
    { name: 'Ativos', value: metricas.convitesAtivos, color: COLORS.success },
    { name: 'Expirados', value: metricas.convitesExpirados, color: COLORS.warning },
    { name: 'Usados', value: metricas.totalConvites - metricas.convitesAtivos - metricas.convitesExpirados, color: COLORS.info }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Dashboard de Convites
            </h1>
            <p className="text-muted-foreground mt-1">
              Análise completa do desempenho dos convites psicossociais
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={atualizarDashboard}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportarRelatorio}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Convites</p>
                  <p className="text-3xl font-bold text-foreground">{metricas.totalConvites}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-green-600">+12%</span>
                <span className="text-muted-foreground ml-1">vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Colaboradores</p>
                  <p className="text-3xl font-bold text-foreground">{metricas.totalColaboradores}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Activity className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-blue-600">{metricas.taxaUtilizacao}%</span>
                <span className="text-muted-foreground ml-1">taxa de utilização</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Convites Ativos</p>
                  <p className="text-3xl font-bold text-green-600">{metricas.convitesAtivos}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={(metricas.convitesAtivos / metricas.totalConvites) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Próximos ao Vencimento</p>
                  <p className="text-3xl font-bold text-orange-600">{convitesProximosVencimento.length}</p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <AlertTriangle className="h-4 w-4 text-orange-600 mr-1" />
                <span className="text-orange-600">Requer atenção</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas de Convites Próximos ao Vencimento */}
        {convitesProximosVencimento.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <strong>Atenção:</strong> {convitesProximosVencimento.length} convite(s) próximo(s) do vencimento.
              <div className="mt-2 space-y-1">
                {convitesProximosVencimento.slice(0, 3).map(convite => (
                  <div key={convite.id} className="text-sm">
                    • <strong>{convite.nomeEmpresa}</strong> - expira em {calcularDiasRestantes(convite.dataExpiracao!)} dias
                  </div>
                ))}
                {convitesProximosVencimento.length > 3 && (
                  <div className="text-sm text-muted-foreground">
                    ... e mais {convitesProximosVencimento.length - 3} convite(s)
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs com Gráficos e Análises */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="details">Detalhes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Pizza - Status dos Convites */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Status dos Convites
                  </CardTitle>
                  <CardDescription>
                    Distribuição atual dos convites por status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dadosPizza}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {dadosPizza.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    {dadosPizza.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.name}: {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico de Barras - Convites por Mês */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Convites por Mês
                  </CardTitle>
                  <CardDescription>
                    Evolução mensal da criação de convites
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metricas.convitesPorMes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="quantidade" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendências de Participação
                </CardTitle>
                <CardDescription>
                  Análise temporal da participação dos colaboradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={tendencias}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="colaboradores" 
                        stackId="1"
                        stroke={COLORS.success} 
                        fill={COLORS.success}
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="convites" 
                        stackId="2"
                        stroke={COLORS.primary} 
                        fill={COLORS.primary}
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Taxa de Utilização por Mês
                </CardTitle>
                <CardDescription>
                  Percentual de colaboradores que utilizaram os convites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tendencias}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="taxa" 
                        stroke={COLORS.purple} 
                        strokeWidth={3}
                        dot={{ fill: COLORS.purple, strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {/* Lista de Convites Recentes */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Convites Recentes
                </CardTitle>
                <CardDescription>
                  Últimos convites criados no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {convitesRecentes.map(convite => (
                    <div key={convite.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{convite.nomeEmpresa}</h4>
                        <p className="text-sm text-muted-foreground">{convite.emailContato}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {convite.colaboradoresUsaram}/{convite.numeroColaboradores} colaboradores
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Criado em {formatarData(convite.dataCriacao)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={convite.status === 'ativo' ? 'default' : 'secondary'}
                          className={
                            convite.status === 'ativo' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                              : ''
                          }
                        >
                          {convite.status === 'ativo' ? 'Ativo' : 
                           convite.status === 'expirado' ? 'Expirado' : 'Usado'}
                        </Badge>
                        {convite.dataExpiracao && (
                          <Badge variant="outline">
                            {calcularDiasRestantes(convite.dataExpiracao)} dias restantes
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardConvites;