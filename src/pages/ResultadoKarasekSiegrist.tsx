import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Download, Share2, RefreshCw, TrendingUp, Award, Building2, AlertTriangle, Heart, Users, Loader2, CheckCircle, Eye, BarChart3, Radar, Gauge, Activity } from "lucide-react";
import Logo from "@/components/Logo";
import { calcularResultadoKarasekSiegrist, type ResultadoKarasekSiegrist } from "@/lib/testes/karasek-siegrist";
import { resultadosService } from "@/lib/database";
import { sessionService } from "@/lib/services/session-service";
import { KarasekRadarChart } from "@/components/charts/KarasekRadarChart";
import { KarasekGaugeChart } from "@/components/charts/KarasekGaugeChart";
import { KarasekBarChart } from "@/components/charts/KarasekBarChart";
import { KarasekProfessionalAnalysis } from "@/components/analysis/KarasekProfessionalAnalysis";
import { KarasekActionPlan } from "@/components/analysis/KarasekActionPlan";

export default function ResultadoKarasekSiegrist() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resultadoId } = useParams<{ resultadoId: string }>();
  const [resultado, setResultado] = useState<ResultadoKarasekSiegrist | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    processarResultado();
  }, []);

  const processarResultado = async () => {
    try {
      setCarregando(true);
      setErro(null);

      console.log('🔍 [KARASEK-RESULTADO] Resultado ID da URL:', resultadoId);

      // Se temos um ID na URL, buscar resultado existente
      if (resultadoId) {
        console.log('🔍 [KARASEK-RESULTADO] Buscando resultado existente com ID:', resultadoId);
        
        const resultadoExistente = await resultadosService.buscarResultadoPorId(resultadoId);
        
        if (resultadoExistente && resultadoExistente.metadados?.analise_completa) {
          console.log('✅ [KARASEK-RESULTADO] Resultado encontrado no banco:', resultadoExistente);
          setResultado(resultadoExistente.metadados.analise_completa);
          setCarregando(false);
          return;
        } else {
          console.log('❌ [KARASEK-RESULTADO] Resultado não encontrado ou sem análise completa');
        }
      }

      // Fallback: processar dados do estado da navegação (para compatibilidade)
      const { respostas, tempoTotal, perguntasRespondidas } = location.state || {};

      if (!respostas || Object.keys(respostas).length === 0) {
        throw new Error("Dados de resposta não encontrados e resultado não existe no banco");
      }

      console.log('🔍 [KARASEK-RESULTADO] Processando resultado com respostas:', respostas);

      // Calcular resultado usando a função específica do teste
      const analiseKarasek = calcularResultadoKarasekSiegrist(respostas);
      console.log('🔍 [KARASEK-RESULTADO] Análise calculada:', analiseKarasek);

      // Salvar resultado no banco de dados apenas se não temos ID
      if (!resultadoId) {
        const sessionId = sessionService.getSessionId();
        const dadosResultado = {
          usuario_id: null, // Anônimo
          session_id: sessionId,
          pontuacao_total: analiseKarasek.riscoGeral.percentual,
          tempo_gasto: tempoTotal || 0,
          status: 'concluido' as const,
          metadados: {
            tipo_teste: 'karasek-siegrist',
            teste_nome: 'HumaniQ - Karasek-Siegrist',
            pontuacoes_dimensoes: {
              demanda_psicologica: analiseKarasek.dimensoes['demanda-psicologica']?.percentual || 0,
              controle_autonomia: analiseKarasek.dimensoes['controle-autonomia']?.percentual || 0,
              apoio_social: analiseKarasek.dimensoes['apoio-social']?.percentual || 0,
              esforco_exigido: analiseKarasek.dimensoes['esforco-exigido']?.percentual || 0,
              recompensas_recebidas: analiseKarasek.dimensoes['recompensas-recebidas']?.percentual || 0,
              hipercomprometimento: analiseKarasek.dimensoes['hipercomprometimento']?.percentual || 0
            },
            interpretacao: gerarInterpretacao(analiseKarasek),
            recomendacoes: gerarRecomendacoes(analiseKarasek),
            analise_completa: analiseKarasek,
            versao_teste: '1.0',
            timestamp_processamento: new Date().toISOString(),
            perguntas_respondidas: perguntasRespondidas || Object.keys(respostas).length
          }
        };

        console.log('🔍 [KARASEK-RESULTADO] Salvando resultado no banco...');
        const resultadoSalvo = await resultadosService.salvarResultado(dadosResultado);
        console.log('✅ [KARASEK-RESULTADO] Resultado salvo com ID:', resultadoSalvo.id);
      }

      setResultado(analiseKarasek);
      setCarregando(false);

    } catch (error) {
      console.error('❌ [KARASEK-RESULTADO] Erro ao processar resultado:', error);
      setErro(error instanceof Error ? error.message : "Erro desconhecido");
      setCarregando(false);
    }
  };

  const gerarInterpretacao = (analise: ResultadoKarasekSiegrist): string => {
    const { riscoGeral } = analise;
    
    let interpretacao = `Seu resultado geral no teste Karasek-Siegrist foi classificado como "${riscoGeral.classificacao}" com nível de risco "${riscoGeral.nivel}". `;
    
    switch (riscoGeral.nivel) {
      case 'baixo':
        interpretacao += "Você apresenta um bom equilíbrio entre demandas e recursos no trabalho, com baixo risco de desenvolvimento de problemas relacionados ao estresse ocupacional.";
        break;
      case 'moderado':
        interpretacao += "Você apresenta algumas situações que merecem atenção. É importante monitorar e implementar estratégias preventivas para manter o bem-estar no trabalho.";
        break;
      case 'alto':
        interpretacao += "Seu perfil indica situações que requerem atenção imediata. É recomendável buscar apoio e implementar mudanças para reduzir os fatores de risco identificados.";
        break;
      default:
        interpretacao += "Recomenda-se uma análise mais detalhada das dimensões avaliadas para identificar áreas específicas de intervenção.";
    }
    
    return interpretacao;
  };

  const gerarRecomendacoes = (analise: ResultadoKarasekSiegrist): string[] => {
    const recomendacoes: string[] = [];
    
    // Recomendações baseadas no nível de risco
    switch (analise.riscoGeral.nivel) {
      case 'baixo':
        recomendacoes.push(
          "Continue mantendo o equilíbrio atual entre trabalho e vida pessoal",
          "Pratique técnicas de relaxamento e mindfulness regularmente",
          "Mantenha uma rede de apoio social sólida no trabalho"
        );
        break;
      case 'moderado':
        recomendacoes.push(
          "Implemente estratégias de gestão do tempo e priorização de tarefas",
          "Busque desenvolver habilidades de comunicação assertiva",
          "Considere atividades físicas regulares para reduzir o estresse"
        );
        break;
      case 'alto':
        recomendacoes.push(
          "Busque apoio profissional especializado em saúde ocupacional",
          "Avalie a possibilidade de mudanças no ambiente ou organização do trabalho",
          "Implemente técnicas de manejo do estresse de forma sistemática"
        );
        break;
    }
    
    // Recomendações específicas por dimensão
    Object.entries(analise.dimensoes).forEach(([dimensao, dados]) => {
      if (dados && dados.nivel === 'critico') {
        switch (dimensao) {
          case 'demandaPsicologica':
            recomendacoes.push("Trabalhe na reorganização das demandas psicológicas do trabalho");
            break;
          case 'controleAutonomia':
            recomendacoes.push("Busque aumentar seu controle e autonomia nas atividades profissionais");
            break;
          case 'apoioSocial':
            recomendacoes.push("Fortaleça as relações de apoio social no ambiente de trabalho");
            break;
          case 'esforcoExigido':
            recomendacoes.push("Avalie e ajuste o nível de esforço exigido em suas atividades");
            break;
          case 'recompensasRecebidas':
            recomendacoes.push("Dialogue sobre reconhecimento e recompensas adequadas ao seu esforço");
            break;
          case 'hipercomprometimento':
            recomendacoes.push("Trabalhe no equilíbrio do comprometimento com o trabalho");
            break;
        }
      }
    });
    
    return recomendacoes.slice(0, 6); // Limitar a 6 recomendações
  };

  const obterCorPorNivel = (nivel: string) => {
    switch (nivel) {
      case 'excelente': return 'text-green-700 bg-green-100 border-green-300';
      case 'bom': return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'regular': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'ruim': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'critico': return 'text-red-700 bg-red-100 border-red-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const obterIconePorNivel = (nivel: string) => {
    switch (nivel) {
      case 'excelente': return <Award className="h-5 w-5" />;
      case 'bom': return <CheckCircle className="h-5 w-5" />;
      case 'regular': return <TrendingUp className="h-5 w-5" />;
      case 'ruim': return <AlertTriangle className="h-5 w-5" />;
      case 'critico': return <AlertTriangle className="h-5 w-5" />;
      default: return <Logo size="sm" showText={false} />;
    }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-700">Processando seus resultados...</h2>
          <p className="text-slate-600">Aguarde enquanto analisamos suas respostas</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-700">Resultado não encontrado</h2>
          <Button onClick={() => navigate('/testes')}>
            Voltar aos Testes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Resultado: HumaniQ - Karasek-Siegrist
              </h1>
              <p className="text-slate-600">
                Avaliação Profissional de Riscos Psicossociais Ocupacionais
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/testes')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar aos Testes
            </Button>
          </div>
        </div>

        {/* Seção Principal - Resultado Geral */}
        <div className="flex justify-center mb-8">
          <Card className="bg-gradient-to-br from-slate-50 to-white shadow-lg border border-slate-200/60 hover:shadow-xl transition-shadow max-w-2xl w-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg text-slate-800 justify-center">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <Gauge className="h-5 w-5 text-white" />
                </div>
                Nível de Risco Psicossocial
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <KarasekGaugeChart resultado={resultado} />
            </CardContent>
          </Card>
        </div>

        {/* Resumo Executivo */}
        <Card className="bg-gradient-to-br from-slate-50 to-white shadow-lg border border-slate-200/60 hover:shadow-xl transition-shadow mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg text-slate-800">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                <Logo size="sm" showText={false} />
              </div>
              Resumo Executivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-0 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {resultado.riscoGeral.percentual}%
                </div>
                <div className="text-sm font-medium text-slate-600">Pontuação Total</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-2 ${obterCorRisco(resultado.riscoGeral.nivel)}`}>
                  {obterIconePorNivel(resultado.riscoGeral.nivel)}
                  {resultado.riscoGeral.classificacao}
                </div>
                <div className="text-sm font-medium text-slate-600">Classificação</div>
              </div>
            </div>

            <Alert className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
              <Logo size="sm" showText={false} />
              <AlertDescription className="text-sm leading-relaxed text-slate-700 font-medium">
                {gerarInterpretacao(resultado)}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Gráficos de Análise */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-slate-50 to-white shadow-lg border border-slate-200/60 hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg text-slate-800">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg">
                  <Radar className="h-5 w-5 text-white" />
                </div>
                Perfil Psicossocial
              </CardTitle>
              <CardDescription className="text-slate-600 font-medium text-sm">
                Visualização multidimensional dos fatores de risco
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <KarasekRadarChart resultado={resultado} />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 to-white shadow-lg border border-slate-200/60 hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg text-slate-800">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                Comparativo por Dimensões
              </CardTitle>
              <CardDescription className="text-slate-600 font-medium text-sm">
                Análise detalhada de cada fator avaliado
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <KarasekBarChart resultado={resultado} />
            </CardContent>
          </Card>
        </div>

        {/* Análise Profissional */}
        <div className="mb-8">
          <KarasekProfessionalAnalysis resultado={resultado} />
        </div>

        {/* Plano de Ação */}
        <div className="mb-8">
          <KarasekActionPlan resultado={resultado} />
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-6">
          <Button 
            variant="outline"
            onClick={() => navigate('/testes')}
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            Outros Testes
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/colaborador/resultados')}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Todos os Resultados
          </Button>
          <Button 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>
      </div>
    </div>
  );
}