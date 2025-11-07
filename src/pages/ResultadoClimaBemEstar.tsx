import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Download, Share2, RefreshCw, TrendingUp, Award, 
  Building2, AlertTriangle, Heart, Users, Loader2, CheckCircle, Eye, 
  BarChart3, Radar, Gauge, Activity, Shield, MessageCircle, UserCheck, 
  Scale, Sparkles, Target, Zap, Info, ChevronRight
} from "lucide-react";
import Logo from '@/components/Logo';
import { calcularResultadoClimaBemEstar, gerarRecomendacoesInsight, type ResultadoClimaBemEstar } from "@/lib/testes/clima-bem-estar";
import { resultadosService } from "@/lib/database";
import { sessionService } from "@/lib/services/session-service";
import ClimaBemEstarAreaChart from "@/components/charts/ClimaBemEstarAreaChart";
import ClimaBemEstarRadarChart from "@/components/charts/ClimaBemEstarRadarChart";

export default function ResultadoClimaBemEstar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resultadoId } = useParams<{ resultadoId: string }>();
  const [resultado, setResultado] = useState<ResultadoClimaBemEstar | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    processarResultado();
  }, []);

  const processarResultado = async () => {
    try {
      setCarregando(true);
      setErro(null);

      console.log('🔍 [CLIMA-RESULTADO] Resultado ID da URL:', resultadoId);

      if (resultadoId) {
        console.log('🔍 [CLIMA-RESULTADO] Buscando resultado existente com ID:', resultadoId);
        
        const resultadoExistente = await resultadosService.buscarResultadoPorId(resultadoId);
        
        if (resultadoExistente && resultadoExistente.metadados?.analise_completa) {
          console.log('✅ [CLIMA-RESULTADO] Resultado encontrado no banco:', resultadoExistente);
          const analise = resultadoExistente.metadados.analise_completa as ResultadoClimaBemEstar;
          if (analise && analise.dimensoes) {
            Object.entries(analise.dimensoes).forEach(([id, dim]) => {
              if (typeof dim.percentual !== 'number' && typeof dim.media === 'number') {
                dim.percentual = Math.round((dim.media / 5) * 100);
              }
            });
          }
          setResultado(analise);
          setCarregando(false);
          return;
        } else {
          console.log('❌ [CLIMA-RESULTADO] Resultado não encontrado ou sem análise completa');
        }
      }

      const { respostas, tempoTotal, perguntasRespondidas } = location.state || {};

      if (!respostas || Object.keys(respostas).length === 0) {
        throw new Error("Dados de resposta não encontrados e resultado não existe no banco");
      }

      console.log('🔍 [CLIMA-RESULTADO] Processando resultado com respostas:', respostas);

      let analiseClima = calcularResultadoClimaBemEstar(respostas);
      console.log('🔍 [CLIMA-RESULTADO] Análise calculada (antes de add percentual):', analiseClima);

      if (analiseClima && analiseClima.dimensoes) {
        Object.keys(analiseClima.dimensoes).forEach(dimensaoId => {
          const dimensao = analiseClima.dimensoes[dimensaoId];
          if (dimensao && typeof dimensao.media === 'number') {
            dimensao.percentual = (dimensao.media / 5) * 100;
          }
        });
      }
      
      console.log('✅ [CLIMA-RESULTADO] Análise final (com percentual):', analiseClima);

      if (!resultadoId) {
        const sessionId = sessionService.getSessionId();
        const dadosResultado = {
          usuario_id: null,
          session_id: sessionId,
          pontuacao_total: Math.round(analiseClima.mediaGeral * 20),
          tempo_gasto: tempoTotal || 0,
          status: 'concluido' as const,
          metadados: {
            tipo_teste: '55fc21f9-cc10-4b4a-8765-3f5087eaf1f5',
            teste_nome: 'HumaniQ Insight – Clima Organizacional e Bem-Estar Psicológico',
            pontuacoes_dimensoes: {
              seguranca_psicologica: analiseClima.dimensoes['segurancaPsicologica']?.media || 0,
              comunicacao_interna: analiseClima.dimensoes['comunicacaoInterna']?.media || 0,
              pertencimento: analiseClima.dimensoes['pertencimento']?.media || 0,
              justica_organizacional: analiseClima.dimensoes['justicaOrganizacional']?.media || 0
            },
            interpretacao: gerarInterpretacao(analiseClima),
            recomendacoes: gerarRecomendacoesInsight(analiseClima),
            analise_completa: analiseClima,
            versao_teste: '1.0',
            timestamp_processamento: new Date().toISOString(),
            perguntas_respondidas: perguntasRespondidas || Object.keys(respostas).length
          }
        };

        console.log('🔍 [CLIMA-RESULTADO] Salvando resultado no banco...');
        const resultadoSalvo = await resultadosService.salvarResultado(dadosResultado);
        console.log('✅ [CLIMA-RESULTADO] Resultado salvo com ID:', resultadoSalvo.id);
      }

      setResultado(analiseClima);
      setCarregando(false);

    } catch (error) {
      console.error('❌ [CLIMA-RESULTADO] Erro ao processar resultado:', error);
      setErro(error instanceof Error ? error.message : "Erro desconhecido");
      setCarregando(false);
    }
  };

  const gerarInterpretacao = (analise: ResultadoClimaBemEstar): string => {
    const { mediaGeral, classificacaoGeral, nivelGeral } = analise;
    
    let interpretacao = `Sua avaliação do Clima Organizacional e Bem-Estar Psicológico obteve uma média de ${mediaGeral?.toFixed(2) || 'N/A'} pontos, classificada como "${classificacaoGeral || 'N/A'}". `;
    
    switch (nivelGeral) {
      case 'saudavel':
        interpretacao += "Excelente! Você percebe um ambiente de trabalho muito positivo, com alta segurança psicológica, comunicação eficaz, forte senso de pertencimento e justiça organizacional.";
        break;
      case 'neutro':
        interpretacao += "Você percebe um ambiente de trabalho moderado. Algumas áreas estão funcionando bem, mas há oportunidades de melhoria para criar um clima mais positivo e saudável.";
        break;
      case 'problematico':
        interpretacao += "Atenção! Você percebe desafios significativos no clima organizacional que podem estar impactando seu bem-estar e o de seus colegas. É importante buscar melhorias.";
        break;
    }
    
    return interpretacao;
  };

  const obterCorPorNivel = (nivel: string) => {
    switch (nivel) {
      case 'saudavel': return 'bg-emerald-500';
      case 'neutro': return 'bg-amber-500';
      case 'problematico': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  const obterCorFundoPorNivel = (nivel: string) => {
    switch (nivel) {
      case 'saudavel': return 'from-emerald-50 to-teal-50';
      case 'neutro': return 'from-amber-50 to-yellow-50';
      case 'problematico': return 'from-red-50 to-orange-50';
      default: return 'from-slate-50 to-gray-50';
    }
  };

  const obterIconePorNivel = (nivel: string) => {
    switch (nivel) {
      case 'saudavel': return <CheckCircle className="h-6 w-6" />;
      case 'neutro': return <Eye className="h-6 w-6" />;
      case 'problematico': return <AlertTriangle className="h-6 w-6" />;
      default: return <Activity className="h-6 w-6" />;
    }
  };

  const obterIconePorDimensao = (dimensaoId: string) => {
    switch (dimensaoId) {
      case 'segurancaPsicologica': return <Shield className="h-8 w-8" />;
      case 'comunicacaoInterna': return <MessageCircle className="h-8 w-8" />;
      case 'pertencimento': return <UserCheck className="h-8 w-8" />;
      case 'justicaOrganizacional': return <Scale className="h-8 w-8" />;
      default: return <Activity className="h-8 w-8" />;
    }
  };

  const obterNomeDimensao = (dimensaoId: string) => {
    switch (dimensaoId) {
      case 'segurancaPsicologica': return 'Segurança Psicológica';
      case 'comunicacaoInterna': return 'Comunicação Interna';
      case 'pertencimento': return 'Pertencimento e Inclusão';
      case 'justicaOrganizacional': return 'Justiça Organizacional';
      default: return dimensaoId;
    }
  };

  const obterDescricaoDimensao = (dimensaoId: string) => {
    switch (dimensaoId) {
      case 'segurancaPsicologica': 
        return 'Sentir-se seguro para expressar opiniões e assumir riscos sem medo de consequências negativas.';
      case 'comunicacaoInterna': 
        return 'Qualidade e efetividade da comunicação entre equipes e liderança.';
      case 'pertencimento': 
        return 'Sensação de fazer parte da equipe e ser valorizado como indivíduo.';
      case 'justicaOrganizacional': 
        return 'Percepção de equidade nas decisões, processos e distribuição de recursos.';
      default: 
        return '';
    }
  };

  // Componente de medidor circular
  const CircularProgress = ({ value, size = 120, strokeWidth = 12, cor }: { value: number; size?: number; strokeWidth?: number; cor: string }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cor}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-slate-700">
            {value.toFixed(0)}%
          </span>
        </div>
      </div>
    );
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-emerald-600" />
            <div className="absolute inset-0 h-16 w-16 mx-auto rounded-full border-4 border-emerald-200 opacity-20"></div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Analisando Seus Resultados...</h2>
            <p className="text-slate-600">Processando as dimensões do clima organizacional</p>
          </div>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">Erro ao Carregar Resultado</CardTitle>
            <CardDescription className="text-base">{erro}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/testes')} 
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Testes
              </Button>
              <Button 
                onClick={processarResultado}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!resultado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Resultado Não Encontrado</h2>
            <p className="text-slate-600 mb-6">Não foi possível localizar os dados deste teste.</p>
            <Button 
              onClick={() => navigate('/testes')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Testes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const percentualGeral = Math.round((resultado.mediaGeral / 5) * 100);
  const dimensoesArray = Object.entries(resultado.dimensoes);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${obterCorFundoPorNivel(resultado.nivelGeral || 'neutro')} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header com ações */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/testes')}
            className="bg-white/80 backdrop-blur-sm hover:bg-white"
            data-testid="button-voltar"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/80 backdrop-blur-sm hover:bg-white"
              data-testid="button-baixar-pdf"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/80 backdrop-blur-sm hover:bg-white"
              data-testid="button-compartilhar"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>

        {/* Hero Section - Resultado Geral */}
        <Card className="border-0 shadow-2xl bg-white overflow-hidden" data-testid="card-resultado-geral">
          <div className="relative">
            {/* Background decorativo */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 opacity-90"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
            
            <CardHeader className="relative text-white pb-8 pt-10">
              <div className="flex items-start justify-between flex-wrap gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <Badge className="bg-white/30 text-white border-white/40 backdrop-blur-sm mb-2">
                        Análise Completa
                      </Badge>
                      <CardTitle className="text-4xl font-extrabold tracking-tight">
                        Clima e Bem-Estar Organizacional
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-emerald-100 text-lg max-w-2xl">
                    Avaliação científica do ambiente psicológico e qualidade das relações no trabalho
                  </CardDescription>
                </div>

                {/* Score Circle */}
                <div className="flex flex-col items-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                  <CircularProgress 
                    value={percentualGeral} 
                    size={140} 
                    strokeWidth={14}
                    cor={obterCorPorNivel(resultado.nivelGeral || 'neutro')}
                  />
                  <div className="mt-4 text-center">
                    <div className="text-white/90 text-sm font-medium mb-1">Pontuação Geral</div>
                    <div className="text-3xl font-bold text-white">{resultado.mediaGeral.toFixed(1)}/5.0</div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </div>

          <CardContent className="p-8">
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-100 shadow-sm">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${obterCorPorNivel(resultado.nivelGeral || 'neutro')} bg-opacity-20`}>
                  {obterIconePorNivel(resultado.nivelGeral || 'neutro')}
                </div>
                <div className="text-2xl font-bold text-slate-800 mb-1">
                  {resultado.classificacaoGeral}
                </div>
                <div className="text-sm text-slate-600 font-medium">Classificação</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-100 shadow-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-4">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-slate-800 mb-1 capitalize">
                  {resultado.nivelGeral}
                </div>
                <div className="text-sm text-slate-600 font-medium">Nível do Clima</div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-100 shadow-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 mb-4">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-slate-800 mb-1">
                  4
                </div>
                <div className="text-sm text-slate-600 font-medium">Dimensões Avaliadas</div>
              </div>
            </div>

            {/* Interpretação */}
            <Alert className="border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm" data-testid="alert-interpretacao">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Logo size="sm" showText={false} className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-emerald-900 mb-2 text-lg">Interpretação dos Resultados</h4>
                  <AlertDescription className="text-slate-700 leading-relaxed text-base">
                    {gerarInterpretacao(resultado)}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          </CardContent>
        </Card>

        {/* Tabs de Visualização */}
        <Tabs defaultValue="dimensoes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm p-1 h-auto" data-testid="tabs-visualizacao">
            <TabsTrigger 
              value="dimensoes" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white py-3"
              data-testid="tab-dimensoes"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dimensões
            </TabsTrigger>
            <TabsTrigger 
              value="graficos" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white py-3"
              data-testid="tab-graficos"
            >
              <Radar className="h-4 w-4 mr-2" />
              Gráficos
            </TabsTrigger>
            <TabsTrigger 
              value="acoes" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white py-3"
              data-testid="tab-acoes"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Recomendações
            </TabsTrigger>
          </TabsList>

          {/* Tab: Dimensões */}
          <TabsContent value="dimensoes" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {dimensoesArray.map(([dimensaoId, dados]) => {
                const percentual = Math.round((dados.media / 5) * 100);
                return (
                  <Card 
                    key={dimensaoId} 
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group"
                    data-testid={`card-dimensao-${dimensaoId}`}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-4 rounded-2xl bg-gradient-to-br ${
                            dados.nivel === 'saudavel' ? 'from-emerald-100 to-teal-100' :
                            dados.nivel === 'neutro' ? 'from-amber-100 to-yellow-100' :
                            'from-red-100 to-orange-100'
                          } group-hover:scale-110 transition-transform duration-300`}>
                            {obterIconePorDimensao(dimensaoId)}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-xl font-bold text-slate-800 mb-2">
                              {obterNomeDimensao(dimensaoId)}
                            </CardTitle>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {obterDescricaoDimensao(dimensaoId)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Progress Ring e Métricas */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-baseline gap-3 mb-3">
                            <span className="text-4xl font-bold text-slate-800">
                              {dados.media.toFixed(1)}
                            </span>
                            <span className="text-lg text-slate-500">/5.0</span>
                          </div>
                          <Badge 
                            className={`${
                              dados.nivel === 'saudavel' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                              dados.nivel === 'neutro' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                              'bg-red-100 text-red-700 border-red-300'
                            } border px-3 py-1 font-semibold`}
                          >
                            {dados.classificacao}
                          </Badge>
                        </div>
                        <CircularProgress 
                          value={percentual} 
                          size={100} 
                          strokeWidth={10}
                          cor={
                            dados.nivel === 'saudavel' ? 'text-emerald-500' :
                            dados.nivel === 'neutro' ? 'text-amber-500' :
                            'text-red-500'
                          }
                        />
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>Pontuação: {dados.pontuacao}</span>
                          <span>{percentual}%</span>
                        </div>
                        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`absolute inset-y-0 left-0 rounded-full ${
                              dados.nivel === 'saudavel' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                              dados.nivel === 'neutro' ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                              'bg-gradient-to-r from-red-500 to-orange-500'
                            } transition-all duration-1000 ease-out`}
                            style={{ width: `${percentual}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Tab: Gráficos */}
          <TabsContent value="graficos" className="mt-6 space-y-6">
            <ClimaBemEstarRadarChart resultado={resultado} />
            <ClimaBemEstarAreaChart resultado={resultado} />
          </TabsContent>

          {/* Tab: Recomendações */}
          <TabsContent value="acoes" className="mt-6 space-y-6">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Plano de Ação Personalizado</CardTitle>
                    <CardDescription className="text-base mt-1">
                      Recomendações baseadas na sua avaliação de clima organizacional
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  {gerarRecomendacoesInsight(resultado).map((recomendacao, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-4 p-5 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-300 group"
                      data-testid={`recomendacao-${index}`}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {recomendacao}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Próximos Passos */}
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 overflow-hidden" data-testid="card-proximos-passos">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full blur-3xl opacity-30"></div>
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Continue Sua Jornada</CardTitle>
                <CardDescription className="text-base mt-1">
                  Explore mais ferramentas para melhorar o clima organizacional
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-auto p-6 flex flex-col items-center gap-3 bg-white border-2 border-gray-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all duration-300 shadow-sm hover:shadow-lg"
                variant="outline"
                onClick={() => navigate('/teste/clima-bem-estar')}
                data-testid="button-refazer-teste"
              >
                <RefreshCw className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-bold text-lg mb-1">Refazer Teste</div>
                  <div className="text-xs opacity-75">Acompanhe sua evolução ao longo do tempo</div>
                </div>
              </Button>
              
              <Button 
                className="h-auto p-6 flex flex-col items-center gap-3 bg-white border-2 border-gray-200 text-slate-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-300 shadow-sm hover:shadow-lg"
                variant="outline"
                data-testid="button-baixar-relatorio"
              >
                <Download className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-bold text-lg mb-1">Baixar Relatório</div>
                  <div className="text-xs opacity-75">PDF completo com análise detalhada</div>
                </div>
              </Button>
              
              <Button 
                className="h-auto p-6 flex flex-col items-center gap-3 bg-white border-2 border-gray-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-300 shadow-sm hover:shadow-lg"
                variant="outline"
                onClick={() => navigate('/testes')}
                data-testid="button-outros-testes"
              >
                <Building2 className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-bold text-lg mb-1">Outros Testes</div>
                  <div className="text-xs opacity-75">Explore avaliações complementares</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer com informações */}
        <div className="text-center py-6 text-sm text-slate-600 space-y-2">
          <p className="flex items-center justify-center gap-2">
            <Info className="h-4 w-4" />
            Resultado gerado em {new Date().toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p className="text-xs text-slate-500">
            HumaniQ Insight - Avaliação Científica de Clima Organizacional e Bem-Estar Psicológico
          </p>
        </div>
      </div>
    </div>
  );
}
