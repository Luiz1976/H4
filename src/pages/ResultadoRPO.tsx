import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Download, Share2, RefreshCw, TrendingUp, Award, Building2, AlertTriangle, Heart, Users, Loader2, CheckCircle, Eye, BarChart3, Radar, Gauge, Activity, Shield, Zap, Briefcase, UserCheck, Home, Globe } from "lucide-react";
import Logo from "@/components/Logo";
import { calcularResultadoRPO, gerarRecomendacoesRPO, type ResultadoRPO } from "@/lib/testes/rpo";
import { resultadosService } from "@/lib/database";
import { sessionService } from "@/lib/services/session-service";

export default function ResultadoRPO() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resultadoId } = useParams<{ resultadoId: string }>();
  const [resultado, setResultado] = useState<ResultadoRPO | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    processarResultado();
  }, []);

  const processarResultado = async () => {
    try {
      setCarregando(true);
      setErro(null);

      console.log('🔍 [RPO-RESULTADO] Resultado ID da URL:', resultadoId);

      // Se temos um ID na URL, buscar resultado existente
      if (resultadoId) {
        console.log('🔍 [RPO-RESULTADO] Buscando resultado existente com ID:', resultadoId);
        
        const resultadoExistente = await resultadosService.buscarResultadoPorId(resultadoId);
        
        if (resultadoExistente && resultadoExistente.metadados?.analise_completa) {
          console.log('✅ [RPO-RESULTADO] Resultado encontrado no banco:', resultadoExistente);
          console.log('🔍 [DEBUG] Análise completa do banco:', resultadoExistente.metadados.analise_completa);
          
          let analiseCompleta = resultadoExistente.metadados.analise_completa;
          
          // Verificar se as propriedades classificacaoGeral e nivelGeral existem
          // Se não existirem, recalcular baseado no indiceGeralRisco
          if (!analiseCompleta.classificacaoGeral || !analiseCompleta.nivelGeral) {
            console.log('⚠️ [RPO-RESULTADO] Propriedades classificacaoGeral/nivelGeral ausentes, recalculando...');
            
            const indiceGeralRisco = analiseCompleta.indiceGeralRisco || 0;
            
            if (indiceGeralRisco >= 4.0) {
              analiseCompleta.classificacaoGeral = "Risco Muito Alto";
              analiseCompleta.nivelGeral = 'muito_alto';
            } else if (indiceGeralRisco >= 3.0) {
              analiseCompleta.classificacaoGeral = "Risco Alto";
              analiseCompleta.nivelGeral = 'alto';
            } else if (indiceGeralRisco >= 2.0) {
              analiseCompleta.classificacaoGeral = "Risco Moderado";
              analiseCompleta.nivelGeral = 'moderado';
            } else {
              analiseCompleta.classificacaoGeral = "Risco Baixo";
              analiseCompleta.nivelGeral = 'baixo';
            }
            
            console.log('✅ [RPO-RESULTADO] Propriedades recalculadas:', {
              classificacaoGeral: analiseCompleta.classificacaoGeral,
              nivelGeral: analiseCompleta.nivelGeral,
              indiceGeralRisco
            });
          }
          
          setResultado(analiseCompleta);
          setCarregando(false);
          return;
        } else {
          console.log('❌ [RPO-RESULTADO] Resultado não encontrado ou sem análise completa');
        }
      }

      // Fallback: processar dados do estado da navegação (para compatibilidade)
      const { respostas, tempoTotal, perguntasRespondidas } = location.state || {};

      if (!respostas || Object.keys(respostas).length === 0) {
        throw new Error("Dados de resposta não encontrados e resultado não existe no banco");
      }

      console.log('🔍 [RPO-RESULTADO] Processando resultado com respostas:', respostas);

      // Calcular resultado usando a função específica do teste
      const analiseRPO = calcularResultadoRPO(respostas);
      console.log('🔍 [RPO-RESULTADO] Análise calculada:', analiseRPO);
      console.log('🔍 [DEBUG] Estrutura completa do resultado:', JSON.stringify(analiseRPO, null, 2));

      // Salvar resultado no banco de dados apenas se não temos ID
      if (!resultadoId) {
        const sessionId = sessionService.getSessionId();
        const dadosResultado = {
          usuario_id: null, // Anônimo
          session_id: sessionId,
          pontuacao_total: Math.round(analiseRPO.indiceGeralRisco),
          tempo_gasto: tempoTotal || 0,
          status: 'concluido' as const,
          metadados: {
            tipo_teste: 'rpo',
            teste_nome: 'HumaniQ RPO - Riscos Psicossociais Ocupacionais',
            pontuacoes_dimensoes: {
              demandas_trabalho: analiseRPO.dimensoes['demandas_trabalho']?.media || 0,
              autonomia_controle: analiseRPO.dimensoes['autonomia_controle']?.media || 0,
              apoio_social: analiseRPO.dimensoes['apoio_social']?.media || 0,
              reconhecimento: analiseRPO.dimensoes['reconhecimento']?.media || 0,
              seguranca_emprego: analiseRPO.dimensoes['seguranca_emprego']?.media || 0,
              ambiente_fisico: analiseRPO.dimensoes['ambiente_fisico']?.media || 0,
              conflito_trabalho_familia: analiseRPO.dimensoes['conflito_trabalho_familia']?.media || 0,
              cultura_organizacional: analiseRPO.dimensoes['cultura_organizacional']?.media || 0
            },
            interpretacao: gerarInterpretacao(analiseRPO),
            recomendacoes: gerarRecomendacoesRPO(analiseRPO.nivelGeral, analiseRPO.dimensoes),
            analise_completa: analiseRPO,
            versao_teste: '1.0',
            timestamp_processamento: new Date().toISOString(),
            perguntas_respondidas: perguntasRespondidas || Object.keys(respostas).length
          }
        };

        console.log('🔍 [RPO-RESULTADO] Salvando resultado no banco...');
        const resultadoSalvo = await resultadosService.salvarResultado(dadosResultado);
        console.log('✅ [RPO-RESULTADO] Resultado salvo com ID:', resultadoSalvo.id);
      }

      setResultado(analiseRPO);
      setCarregando(false);

    } catch (error) {
      console.error('❌ [RPO-RESULTADO] Erro ao processar resultado:', error);
      setErro(error instanceof Error ? error.message : "Erro desconhecido");
      setCarregando(false);
    }
  };

  const gerarInterpretacao = (analise: ResultadoRPO): string => {
    const { indiceGeralRisco, classificacaoGeral, nivelGeral } = analise;
    
    let interpretacao = `Seu Índice Geral de Risco Psicossocial foi de ${indiceGeralRisco?.toFixed(1) || 'N/A'} pontos, classificado como "${classificacaoGeral || 'N/A'}". `;
    
    switch (nivelGeral) {
      case 'baixo':
        interpretacao += "Excelente! Seu ambiente de trabalho apresenta baixos riscos psicossociais, com condições favoráveis ao bem-estar ocupacional.";
        break;
      case 'moderado':
        interpretacao += "Seu ambiente de trabalho apresenta riscos psicossociais moderados. É importante manter atenção e implementar melhorias preventivas.";
        break;
      case 'alto':
        interpretacao += "Atenção! Seu ambiente de trabalho apresenta riscos psicossociais elevados que podem estar impactando sua saúde mental e desempenho.";
        break;
      case 'muito_alto':
        interpretacao += "Alerta! Os riscos psicossociais em seu ambiente de trabalho estão em níveis críticos e requerem intervenção imediata.";
        break;
    }
    
    return interpretacao;
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
      case 'demandas_trabalho': return <Briefcase className="h-5 w-5" />;
      case 'autonomia_controle': return <UserCheck className="h-5 w-5" />;
      case 'apoio_social': return <Users className="h-5 w-5" />;
      case 'reconhecimento': return <Award className="h-5 w-5" />;
      case 'seguranca_emprego': return <Shield className="h-5 w-5" />;
      case 'ambiente_fisico': return <Building2 className="h-5 w-5" />;
      case 'conflito_trabalho_familia': return <Home className="h-5 w-5" />;
      case 'cultura_organizacional': return <Globe className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const obterNomeDimensao = (dimensaoId: string) => {
    const nomes = {
      'demandas_trabalho': 'Demandas do Trabalho',
      'autonomia_controle': 'Autonomia e Controle',
      'apoio_social': 'Apoio Social',
      'reconhecimento': 'Reconhecimento',
      'seguranca_emprego': 'Segurança no Emprego',
      'ambiente_fisico': 'Ambiente Físico',
      'conflito_trabalho_familia': 'Conflito Trabalho-Família',
      'cultura_organizacional': 'Cultura Organizacional'
    };
    return nomes[dimensaoId as keyof typeof nomes] || dimensaoId;
  };

  const obterCorPorDimensao = (dimensaoId: string, nivel: string) => {
    // Para dimensões positivas (autonomia_controle, apoio_social, reconhecimento, seguranca_emprego, cultura_organizacional)
    // níveis altos são bons (verde)
    // Para dimensões negativas (demandas_trabalho, ambiente_fisico, conflito_trabalho_familia)
    // níveis altos são ruins (vermelho)
    const dimensoesPositivas = ['autonomia_controle', 'apoio_social', 'reconhecimento', 'seguranca_emprego', 'cultura_organizacional'];
    const isPositiveDimension = dimensoesPositivas.includes(dimensaoId);
    
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-red-600" />
          <h2 className="text-xl font-semibold text-slate-700">Carregando resultado...</h2>
          <p className="text-slate-500">Aguarde enquanto processamos seus dados</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-100 flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-100 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-100 p-4">
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
            <Button variant="outline" size="sm" onClick={() => navigate('/teste/rpo')}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refazer Teste
            </Button>
          </div>
        </div>

        {/* Título e Resumo Geral */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  HumaniQ RPO – Riscos Psicossociais Ocupacionais
                </CardTitle>
                <CardDescription className="text-red-100 mt-2">
                  Análise Abrangente do Ambiente de Trabalho
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {resultado.indiceGeralRisco?.toFixed(1) || 'N/A'}
                </div>
                <div className="text-sm text-red-100">
                  Índice Geral de Risco
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
                <p className="text-sm text-slate-600">Nível de Risco</p>
              </div>

              {/* Dimensões Avaliadas */}
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-700 mb-1">
                  8
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
              <BarChart3 className="h-5 w-5 text-red-600" />
              Análise por Dimensões
            </CardTitle>
            <CardDescription>
              Detalhamento das pontuações em cada área de risco psicossocial avaliada
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
                        {obterNomeDimensao(dimensaoId)}
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

        {/* Recomendações */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-600" />
              Recomendações Personalizadas
            </CardTitle>
            <CardDescription>
              Sugestões baseadas no seu perfil de riscos psicossociais ocupacionais
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gerarRecomendacoesRPO(resultado.nivelGeral, resultado.dimensoes).map((recomendacao, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-semibold">
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
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Award className="h-5 w-5" />
              Próximos Passos
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-auto p-4 flex flex-col items-center gap-2 bg-white text-red-700 border-red-200 hover:bg-red-50"
                variant="outline"
                onClick={() => navigate('/teste/rpo')}
              >
                <RefreshCw className="h-6 w-6" />
                <span className="font-semibold">Refazer Teste</span>
                <span className="text-xs text-center">
                  Acompanhe sua evolução
                </span>
              </Button>
              
              <Button 
                className="h-auto p-4 flex flex-col items-center gap-2 bg-white text-red-700 border-red-200 hover:bg-red-50"
                variant="outline"
              >
                <Download className="h-6 w-6" />
                <span className="font-semibold">Baixar Relatório</span>
                <span className="text-xs text-center">
                  PDF completo dos resultados
                </span>
              </Button>
              
              <Button 
                className="h-auto p-4 flex flex-col items-center gap-2 bg-white text-red-700 border-red-200 hover:bg-red-50"
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