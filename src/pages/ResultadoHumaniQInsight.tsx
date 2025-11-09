import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  
  Users,
  Heart,
  Scale,
  TrendingUp,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  Target,
  Lightbulb,
  Download
} from 'lucide-react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';

interface DimensaoResultado {
  nome: string;
  pontuacao: number;
  nivel: string;
  cor: string;
  icon: any;
}

export default function ResultadoHumaniQInsight() {
  const { resultadoId } = useParams();
  const [resultado, setResultado] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    carregarResultado();
  }, [resultadoId]);

  const carregarResultado = async () => {
    if (!resultadoId) {
      setErro("ID do resultado não fornecido");
      setCarregando(false);
      return;
    }

    console.log('🔍 [HumaniQ Insight] Carregando resultado:', resultadoId);

    try {
      setCarregando(true);
      const response = await apiService.obterResultadoPorId(resultadoId);
      
      if (!response?.resultado) {
        throw new Error("Resultado não encontrado na resposta da API");
      }

      const dadosCompletos = response.resultado;
      console.log('✅ [HumaniQ Insight] Dados recebidos:', dadosCompletos);

      // Validar estrutura esperada
      if (!dadosCompletos.metadados?.pontuacoes_dimensoes) {
        throw new Error("Dados do HumaniQ Insight incompletos - metadados ausentes");
      }

      setResultado(dadosCompletos);

    } catch (error) {
      console.error('❌ [HumaniQ Insight] Erro ao carregar:', error);
      const mensagemErro = error instanceof Error ? error.message : 'Erro ao carregar resultado';
      setErro(mensagemErro);
      toast({
        title: "Erro",
        description: mensagemErro,
        variant: "destructive",
      });
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return (
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (erro || !resultado) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Erro ao Carregar Resultado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Não foi possível carregar os resultados do teste. Tente novamente mais tarde.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extrair dados do resultado
  const metadados = resultado.metadados || {};
  const interpretacao = metadados.interpretacao || '';
  const pontuacaoGeral = resultado.pontuacaoTotal || 0;
  // Pontuação total é a soma das respostas (48 questões x escala 1-5)
  // Para converter em porcentagem: (pontuação / (48 * 5)) * 100
  const pontuacaoPercentual = ((pontuacaoGeral / (48 * 5)) * 100).toFixed(1);
  const pontuacaoMedia = (pontuacaoGeral / 48).toFixed(2); // Média de 1-5
  const tempoGasto = Math.round((resultado.tempoGasto || 0) / 60); // converter para minutos

  // Definir nível baseado na pontuação média (escala 1-5)
  const getNivel = (pontuacao: number) => {
    if (pontuacao >= 4.0) return { texto: 'Excelente', cor: 'text-green-600', bgCor: 'bg-green-100' };
    if (pontuacao >= 3.5) return { texto: 'Bom', cor: 'text-blue-600', bgCor: 'bg-blue-100' };
    if (pontuacao >= 3.0) return { texto: 'Adequado', cor: 'text-yellow-600', bgCor: 'bg-yellow-100' };
    if (pontuacao >= 2.5) return { texto: 'Atenção', cor: 'text-orange-600', bgCor: 'bg-orange-100' };
    return { texto: 'Crítico', cor: 'text-red-600', bgCor: 'bg-red-100' };
  };

  const nivelGeral = getNivel(parseFloat(pontuacaoMedia));

  // Extrair pontuações das dimensões
  const dimensoesData: DimensaoResultado[] = [
    {
      nome: 'Segurança Psicológica',
      pontuacao: metadados.pontuacoes_dimensoes?.['seguranca-psicologica'] || 0,
      nivel: getNivel(metadados.pontuacoes_dimensoes?.['seguranca-psicologica'] || 0).texto,
      cor: '#8B5CF6',
      icon: Target
    },
    {
      nome: 'Comunicação Interna',
      pontuacao: metadados.pontuacoes_dimensoes?.['comunicacao-interna'] || 0,
      nivel: getNivel(metadados.pontuacoes_dimensoes?.['comunicacao-interna'] || 0).texto,
      cor: '#3B82F6',
      icon: Users
    },
    {
      nome: 'Pertencimento',
      pontuacao: metadados.pontuacoes_dimensoes?.pertencimento || 0,
      nivel: getNivel(metadados.pontuacoes_dimensoes?.pertencimento || 0).texto,
      cor: '#EC4899',
      icon: Heart
    },
    {
      nome: 'Justiça Organizacional',
      pontuacao: metadados.pontuacoes_dimensoes?.['justica-organizacional'] || 0,
      nivel: getNivel(metadados.pontuacoes_dimensoes?.['justica-organizacional'] || 0).texto,
      cor: '#10B981',
      icon: Scale
    }
  ];

  // Dados para o gráfico de radar
  const radarData = dimensoesData.map(d => ({
    dimensao: d.nome.split(' ')[0], // Pegar primeira palavra
    pontuacao: (d.pontuacao * 20), // Converter para escala 0-100
    fullMark: 100
  }));

  // Dados para o gráfico de barras
  const barData = dimensoesData.map(d => ({
    nome: d.nome,
    pontuacao: (d.pontuacao * 20),
    cor: d.cor
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header com resultado geral */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-pink-600/10 rounded-3xl" />
          <Card className="border-none shadow-2xl backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                <Award className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                HumaniQ Insight
              </CardTitle>
              <CardDescription className="text-lg">
                Análise Completa do Clima Organizacional e Bem-Estar Psicológico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pontuação Geral */}
              <div className="text-center space-y-4">
                <div className="inline-flex flex-col items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Pontuação Geral
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {pontuacaoPercentual}
                    </span>
                    <span className="text-3xl font-semibold text-muted-foreground">%</span>
                  </div>
                  <Badge className={`${nivelGeral.bgCor} ${nivelGeral.cor} px-6 py-2 text-lg font-semibold`}>
                    {nivelGeral.texto}
                  </Badge>
                </div>
                
                <Progress 
                  value={parseFloat(pontuacaoPercentual)} 
                  className="h-3 bg-gray-200"
                />
                
                <div className="flex justify-center gap-8 pt-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{tempoGasto} minutos</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span className="text-sm font-medium">48 questões</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Radar */}
          <Card className="shadow-xl border-none bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Visão 360° das Dimensões
              </CardTitle>
              <CardDescription>
                Análise multidimensional do clima organizacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
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
          <Card className="shadow-xl border-none bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Pontuação por Dimensão
              </CardTitle>
              <CardDescription>
                Desempenho detalhado em cada área avaliada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={barData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                  <YAxis 
                    dataKey="nome" 
                    type="category" 
                    width={150}
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
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Cards das Dimensões */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dimensoesData.map((dimensao, index) => {
            const Icon = dimensao.icon;
            const nivelDimensao = getNivel(dimensao.pontuacao);
            const pontuacaoPerc = ((dimensao.pontuacao / 5) * 100).toFixed(1);
            
            return (
              <Card 
                key={index} 
                className="shadow-lg border-none bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm hover:shadow-xl transition-shadow"
              >
                <CardHeader className="space-y-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${dimensao.cor}20` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: dimensao.cor }} />
                  </div>
                  <CardTitle className="text-lg leading-tight">{dimensao.nome}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline gap-1">
                    <span 
                      className="text-4xl font-bold"
                      style={{ color: dimensao.cor }}
                    >
                      {pontuacaoPerc}
                    </span>
                    <span className="text-lg text-muted-foreground">%</span>
                  </div>
                  <Progress 
                    value={parseFloat(pontuacaoPerc)} 
                    className="h-2"
                    style={{ 
                      backgroundColor: '#e5e7eb',
                    }}
                  />
                  <Badge className={`${nivelDimensao.bgCor} ${nivelDimensao.cor} font-semibold`}>
                    {nivelDimensao.texto}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Interpretação */}
        {interpretacao && (
          <Card className="shadow-xl border-none bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Logo size="sm" showText={false} className="h-5 w-5 text-purple-600" />
                Análise Detalhada
              </CardTitle>
              <CardDescription>
                Interpretação profissional dos seus resultados
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <div 
                className="text-muted-foreground leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: interpretacao.replace(/\n/g, '<br/>') }}
              />
            </CardContent>
          </Card>
        )}

        {/* Recomendações */}
        {metadados.recomendacoes && metadados.recomendacoes.length > 0 && (
          <Card className="shadow-xl border-none bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Recomendações Personalizadas
              </CardTitle>
              <CardDescription>
                Sugestões para melhoria contínua do clima organizacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {metadados.recomendacoes.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Botão de Download */}
        <div className="flex justify-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Baixar Relatório Completo (PDF)
          </Button>
        </div>

      </div>
    </div>
  );
}
