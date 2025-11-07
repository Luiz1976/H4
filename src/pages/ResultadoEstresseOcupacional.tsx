import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Download, Share2, RefreshCw, TrendingUp, Award, Building2, AlertTriangle, Heart, Users, Loader2, CheckCircle, Eye, BarChart3, Radar, Gauge, Activity, Shield, Zap } from "lucide-react";
import Logo from "@/components/Logo";
import { calcularResultadoEstresseOcupacional, type ResultadoEstresseOcupacional } from "@/lib/testes/estresse-ocupacional";
import { resultadosService } from "@/lib/database";
import { sessionService } from "@/lib/services/session-service";
import EstresseOcupacionalRadarChart from "@/components/charts/EstresseOcupacionalRadarChart";
import EstresseOcupacionalBarChart from "@/components/charts/EstresseOcupacionalBarChart";
import EstresseOcupacionalGaugeChart from "@/components/charts/EstresseOcupacionalGaugeChart";
import EstresseOcupacionalAreaChart from "@/components/charts/EstresseOcupacionalAreaChart";

export default function ResultadoEstresseOcupacional() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resultadoId } = useParams<{ resultadoId: string }>();
  const [resultado, setResultado] = useState<ResultadoEstresseOcupacional | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    processarResultado();
  }, []);

  const processarResultado = async () => {
    try {
      setCarregando(true);
      setErro(null);

      console.log('🔍 [EO-RESULTADO] Resultado ID da URL:', resultadoId);

      // Se temos um ID na URL, buscar resultado existente
      if (resultadoId) {
        console.log('🔍 [EO-RESULTADO] Buscando resultado existente com ID:', resultadoId);
        
        const resultadoExistente = await resultadosService.buscarResultadoPorId(resultadoId);
        
        if (resultadoExistente && resultadoExistente.metadados?.analise_completa) {
          console.log('✅ [EO-RESULTADO] Resultado encontrado no banco:', resultadoExistente);
          console.log('🔍 [DEBUG] Análise completa do banco:', resultadoExistente.metadados.analise_completa);
          console.log('🔍 [DEBUG] classificacaoGeral:', resultadoExistente.metadados.analise_completa.classificacaoGeral);
          console.log('🔍 [DEBUG] nivelGeral:', resultadoExistente.metadados.analise_completa.nivelGeral);
          
          let analiseCompleta = resultadoExistente.metadados.analise_completa;
          
          // Verificar se as propriedades classificacaoGeral e nivelGeral existem
          // Se não existirem, recalcular baseado no indiceVulnerabilidade
          if (!analiseCompleta.classificacaoGeral || !analiseCompleta.nivelGeral) {
            console.log('⚠️ [EO-RESULTADO] Propriedades classificacaoGeral/nivelGeral ausentes, recalculando...');
            
            const indiceVulnerabilidade = analiseCompleta.indiceVulnerabilidade || 0;
            
            if (indiceVulnerabilidade >= 4.0) {
              analiseCompleta.classificacaoGeral = "Muito Alto Risco";
              analiseCompleta.nivelGeral = 'muito_alto';
            } else if (indiceVulnerabilidade >= 3.6) {
              analiseCompleta.classificacaoGeral = "Alto Risco";
              analiseCompleta.nivelGeral = 'alto';
            } else if (indiceVulnerabilidade >= 2.1) {
              analiseCompleta.classificacaoGeral = "Risco Moderado";
              analiseCompleta.nivelGeral = 'moderado';
            } else {
              analiseCompleta.classificacaoGeral = "Baixo Risco";
              analiseCompleta.nivelGeral = 'baixo';
            }
            
            console.log('✅ [EO-RESULTADO] Propriedades recalculadas:', {
              classificacaoGeral: analiseCompleta.classificacaoGeral,
              nivelGeral: analiseCompleta.nivelGeral,
              indiceVulnerabilidade
            });
          }
          
          setResultado(analiseCompleta);
          setCarregando(false);
          return;
        } else {
          console.log('❌ [EO-RESULTADO] Resultado não encontrado ou sem análise completa');
        }
      }

      // Fallback: processar dados do estado da navegação (para compatibilidade)
      const { respostas, tempoTotal, perguntasRespondidas } = location.state || {};

      if (!respostas || Object.keys(respostas).length === 0) {
        throw new Error("Dados de resposta não encontrados e resultado não existe no banco");
      }

      console.log('🔍 [EO-RESULTADO] Processando resultado com respostas:', respostas);

      // Calcular resultado usando a função específica do teste
      const analiseEstresse = calcularResultadoEstresseOcupacional(respostas);
      console.log('🔍 [EO-RESULTADO] Análise calculada:', analiseEstresse);
      console.log('🔍 [DEBUG] Estrutura completa do resultado:', JSON.stringify(analiseEstresse, null, 2));
      console.log('🔍 [DEBUG] classificacaoGeral calculada:', analiseEstresse.classificacaoGeral);
      console.log('🔍 [DEBUG] nivelGeral calculado:', analiseEstresse.nivelGeral);
      console.log('🔍 [DEBUG] indiceVulnerabilidade:', analiseEstresse.indiceVulnerabilidade);
      console.log('🔍 [DEBUG] classificacaoVulnerabilidade:', analiseEstresse.classificacaoVulnerabilidade);
      console.log('🔍 [DEBUG] nivelVulnerabilidade:', analiseEstresse.nivelVulnerabilidade);

      // Salvar resultado no banco de dados apenas se não temos ID
      if (!resultadoId) {
        const sessionId = sessionService.getSessionId();
        const dadosResultado = {
          usuario_id: null, // Anônimo
          session_id: sessionId,
          pontuacao_total: Math.round(analiseEstresse.indiceVulnerabilidade),
          tempo_gasto: tempoTotal || 0,
          status: 'concluido' as const,
          metadados: {
            tipo_teste: 'estresse-ocupacional',
            teste_nome: 'HumaniQ EO – Estresse Ocupacional, Burnout e Resiliência',
            pontuacoes_dimensoes: {
              estresse: analiseEstresse.dimensoes['estresse']?.media || 0,
              burnout: analiseEstresse.dimensoes['burnout']?.media || 0,
              resiliencia: analiseEstresse.dimensoes['resiliencia']?.media || 0
            },
            interpretacao: gerarInterpretacao(analiseEstresse),
            recomendacoes: gerarRecomendacoes(analiseEstresse),
            analise_completa: analiseEstresse,
            versao_teste: '1.0',
            timestamp_processamento: new Date().toISOString(),
            perguntas_respondidas: perguntasRespondidas || Object.keys(respostas).length
          }
        };

        console.log('🔍 [EO-RESULTADO] Salvando resultado no banco...');
        const resultadoSalvo = await resultadosService.salvarResultado(dadosResultado);
        console.log('✅ [EO-RESULTADO] Resultado salvo com ID:', resultadoSalvo.id);
      }

      setResultado(analiseEstresse);
      setCarregando(false);

    } catch (error) {
      console.error('❌ [EO-RESULTADO] Erro ao processar resultado:', error);
      setErro(error instanceof Error ? error.message : "Erro desconhecido");
      setCarregando(false);
    }
  };

  const gerarInterpretacao = (analise: ResultadoEstresseOcupacional): string => {
    const { indiceVulnerabilidade, classificacaoGeral, nivelGeral } = analise;
    
    let interpretacao = `Seu Índice de Vulnerabilidade ao Estresse Ocupacional foi de ${indiceVulnerabilidade?.toFixed(1) || 'N/A'} pontos, classificado como "${classificacaoGeral || 'N/A'}". `;
    
    switch (nivelGeral) {
      case 'baixo':
        interpretacao += "Excelente! Você demonstra boa capacidade de lidar com o estresse ocupacional, com níveis baixos de burnout e boa resiliência.";
        break;
      case 'moderado':
        interpretacao += "Você apresenta níveis moderados de estresse ocupacional. É importante manter atenção aos sinais e implementar estratégias preventivas.";
        break;
      case 'alto':
        interpretacao += "Você está apresentando níveis elevados de estresse ocupacional que podem estar impactando seu bem-estar e desempenho.";
        break;
      case 'muito_alto':
        interpretacao += "Atenção! Seus níveis de estresse ocupacional estão muito elevados e requerem intervenção imediata para preservar sua saúde mental.";
        break;
    }
    
    return interpretacao;
  };

  const gerarRecomendacoes = (analise: ResultadoEstresseOcupacional): string[] => {
    const recomendacoes: string[] = [];
    
    // Recomendações baseadas no nível geral
    switch (analise.nivelGeral || 'baixo') {
      case 'baixo':
        recomendacoes.push(
          "Continue mantendo suas estratégias atuais de gerenciamento do estresse",
          "Considere compartilhar suas técnicas de bem-estar com colegas",
          "Mantenha práticas regulares de autocuidado e prevenção"
        );
        break;
      case 'moderado':
        recomendacoes.push(
          "Implemente técnicas de relaxamento e mindfulness no dia a dia",
          "Estabeleça limites claros entre trabalho e vida pessoal",
          "Busque atividades físicas regulares para reduzir o estresse"
        );
        break;
      case 'alto':
        recomendacoes.push(
          "Considere buscar apoio profissional de um psicólogo ou coach",
          "Reavalie sua carga de trabalho e prioridades profissionais",
          "Implemente pausas regulares durante o dia de trabalho"
        );
        break;
      case 'muito_alto':
        recomendacoes.push(
          "Procure ajuda profissional imediatamente - psicólogo ou psiquiatra",
          "Converse com RH sobre possíveis ajustes na função ou carga de trabalho",
          "Considere afastamento temporário se necessário para recuperação"
        );
        break;
    }
    
    return recomendacoes.slice(0, 6); // Limitar a 6 recomendações
  };

  const obterCorPorNivel = (nivel: string) => {
    switch (nivel) {
      case 'baixo': return 'text-green-700 bg-green-100 border-green-300';
      case 'moderado': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'alto': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'muito_alto': return 'text-red-700 bg-red-100 border-red-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const obterIconePorNivel = (nivel: string) => {
    switch (nivel) {
      case 'baixo': return <CheckCircle className="h-5 w-5" />;
      case 'moderado': return <Eye className="h-5 w-5" />;
      case 'alto': return <AlertTriangle className="h-5 w-5" />;
      case 'muito_alto': return <AlertTriangle className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const obterIconePorDimensao = (dimensaoId: string) => {
    switch (dimensaoId) {
      case 'estresse': return <Zap className="h-5 w-5" />;
      case 'burnout': return <AlertTriangle className="h-5 w-5" />;
      case 'resiliencia': return <Shield className="h-5 w-5" />;

      default: return <Activity className="h-5 w-5" />;
    }
  };

  const obterCorPorDimensao = (dimensaoId: string, nivel: string) => {
    // Para estresse e burnout, níveis altos são ruins (vermelho)
    // Para resiliência, níveis altos são bons (verde)
    const isPositiveDimension = dimensaoId === 'resiliencia';
    
    if (isPositiveDimension) {
      switch (nivel) {
        case 'muito_alto': return 'text-green-700 bg-green-100 border-green-300';
        case 'alto': return 'text-green-600 bg-green-50 border-green-200';
        case 'moderado': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
        case 'baixo': return 'text-red-700 bg-red-100 border-red-300';
        default: return 'text-gray-700 bg-gray-100 border-gray-300';
      }
    } else {
      switch (nivel) {
        case 'muito_alto': return 'text-red-700 bg-red-100 border-red-300';
        case 'alto': return 'text-orange-700 bg-orange-100 border-orange-300';
        case 'moderado': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
        case 'baixo': return 'text-green-700 bg-green-100 border-green-300';
        default: return 'text-gray-700 bg-gray-100 border-gray-300';
      }
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" />
          <h2 className="text-xl font-semibold text-slate-700">Carregando resultado...</h2>
          <p className="text-slate-500">Aguarde enquanto processamos seus dados</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Erro ao carregar resultado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">{erro}</p>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/testes')} variant="outline">
                Voltar aos Testes
              </Button>
              <Button onClick={processarResultado}>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 mx-auto text-orange-500" />
          <h2 className="text-xl font-semibold text-slate-700">Resultado não encontrado</h2>
          <Button onClick={() => navigate('/testes')}>
            Voltar aos Testes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/testes')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Testes
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/teste/estresse-ocupacional')}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refazer Teste
            </Button>
          </div>
        </div>

        {/* Título e Resumo Geral */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  HumaniQ EO – Estresse Ocupacional
                </CardTitle>
                <CardDescription className="text-purple-100 mt-2">
                  Análise de Burnout e Resiliência
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {resultado.indiceVulnerabilidade?.toFixed(1) || 'N/A'}
                </div>
                <div className="text-sm text-purple-100">
                  Índice de Vulnerabilidade
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Classificação Geral */}
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${obterCorPorNivel(resultado.nivelGeral || 'baixo')}`}>
                  {obterIconePorNivel(resultado.nivelGeral || 'baixo')}
                  <span className="font-semibold">{resultado.classificacaoGeral || 'N/A'}</span>
                </div>
                <p className="text-sm text-slate-600 mt-2">Classificação Geral</p>
              </div>

              {/* Nível de Risco */}
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700 mb-1">
                  {resultado.nivelGeral?.toUpperCase() || 'N/A'}
                </div>
                <p className="text-sm text-slate-600">Nível de Vulnerabilidade</p>
              </div>

              {/* Dimensões Avaliadas */}
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700 mb-1">
                  3
                </div>
                <p className="text-sm text-slate-600">Dimensões Avaliadas</p>
              </div>
            </div>

            {/* Interpretação */}
            <Alert className="mt-6">
              <Logo size="sm" showText={false} />
              <AlertDescription className="text-base leading-relaxed">
                {gerarInterpretacao(resultado)}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Análise por Dimensões */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Análise por Dimensões
            </CardTitle>
            <CardDescription>
              Detalhamento das pontuações em cada área avaliada
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(resultado.dimensoes).map(([dimensaoId, dados]) => (
                <div key={dimensaoId} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {obterIconePorDimensao(dimensaoId)}
                      <span className="font-semibold text-slate-700">
                        {dimensaoId === 'estresse' ? 'Estresse Ocupacional' : 
                         dimensaoId === 'burnout' ? 'Burnout' : 
                         dimensaoId === 'resiliencia' ? 'Resiliência Emocional' : 
                         dimensaoId}
                      </span>
                    </div>
                    <Badge className={obterCorPorDimensao(dimensaoId, dados.nivel)}>
                      {dados.classificacao}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pontuação: {dados.pontuacao}</span>
                      <span>Média: {dados.media.toFixed(2)}</span>
                    </div>
                    <Progress 
                      value={(dados.media / 5) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Visualizações Gráficas */}
        <div className="space-y-8">
          {/* Gráfico Radar - Visão Geral das Dimensões */}
          <EstresseOcupacionalRadarChart resultado={resultado} />
          
          {/* Gráfico Gauge - Índice de Vulnerabilidade */}
          <EstresseOcupacionalGaugeChart resultado={resultado} />
          
          {/* Gráfico de Barras - Comparativo das Dimensões */}
          <EstresseOcupacionalBarChart resultado={resultado} />
          
          {/* Gráfico de Área - Distribuição das Respostas */}
          <EstresseOcupacionalAreaChart resultado={resultado} />
        </div>

        {/* Recomendações */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Recomendações Personalizadas
            </CardTitle>
            <CardDescription>
              Sugestões baseadas no seu perfil de estresse ocupacional
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gerarRecomendacoes(resultado).map((recomendacao, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {recomendacao}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Próximos Passos */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Award className="h-5 w-5" />
              Próximos Passos
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-auto p-4 flex flex-col items-center gap-2 bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                variant="outline"
                onClick={() => navigate('/testes')}
              >
                <RefreshCw className="h-6 w-6" />
                <span className="font-semibold">Refazer Teste</span>
                <span className="text-xs text-center">
                  Acompanhe sua evolução
                </span>
              </Button>
              
              <Button 
                className="h-auto p-4 flex flex-col items-center gap-2 bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                variant="outline"
              >
                <Download className="h-6 w-6" />
                <span className="font-semibold">Baixar Relatório</span>
                <span className="text-xs text-center">
                  PDF completo dos resultados
                </span>
              </Button>
              
              <Button 
                className="h-auto p-4 flex flex-col items-center gap-2 bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                variant="outline"
              >
                <Users className="h-6 w-6" />
                <span className="font-semibold">Buscar Apoio</span>
                <span className="text-xs text-center">
                  Encontre profissionais especializados
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}