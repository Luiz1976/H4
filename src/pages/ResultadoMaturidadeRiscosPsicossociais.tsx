import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Download, Share2, RefreshCw, TrendingUp, Award, Building2, AlertTriangle, Heart, Users, Loader2, CheckCircle, Eye, BarChart3, Radar, Gauge, Activity, Shield, Target, Zap } from "lucide-react";
import Logo from "@/components/Logo";
import { calcularResultadoMGRP, type ResultadoMGRP } from "@/lib/testes/mgrp";
import { resultadosService } from "@/lib/database";
import { sessionService } from "@/lib/services/session-service";
import { motion } from "framer-motion";

export default function ResultadoMaturidadeRiscosPsicossociais() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resultadoId } = useParams<{ resultadoId: string }>();
  const [resultado, setResultado] = useState<ResultadoMGRP | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    processarResultado();
  }, []);

  // Função para converter níveis antigos para novos
  const converterNivelAntigo = (nivelAntigo: string): 'inicial' | 'em-desenvolvimento' | 'estruturado' | 'otimizado' => {
    switch (nivelAntigo) {
      case 'baixa':
      case 'inicial':
        return 'inicial';
      case 'intermediaria':
        return 'em-desenvolvimento';
      case 'avancada':
        return 'estruturado';
      case 'otimizada':
        return 'otimizado';
      default:
        return 'inicial';
    }
  };

  const processarResultado = async () => {
    try {
      setCarregando(true);
      setErro(null);

      console.log('🔍 [MGRP-RESULTADO] Resultado ID da URL:', resultadoId);

      // Se temos um ID na URL, buscar resultado existente
      if (resultadoId) {
        console.log('🔍 [MGRP-RESULTADO] Buscando resultado existente com ID:', resultadoId);
        
        const resultadoExistente = await resultadosService.buscarResultadoPorId(resultadoId);
        
        if (resultadoExistente && resultadoExistente.metadados?.analise_completa) {
          const analiseCompleta = resultadoExistente.metadados.analise_completa;
          
          console.log('🔍 [MGRP-RESULTADO] Análise completa encontrada:', analiseCompleta);
          console.log('🔍 [MGRP-RESULTADO] Verificando estrutura...');
          console.log('🔍 [MGRP-RESULTADO] Tem maturidadeGeral?', !!analiseCompleta.maturidadeGeral);
          console.log('🔍 [MGRP-RESULTADO] Tem mediaGeral?', !!analiseCompleta.mediaGeral);
          
          // Verificar se já está na nova estrutura
          if (analiseCompleta.maturidadeGeral) {
            console.log('✅ [MGRP-RESULTADO] Usando estrutura nova (maturidadeGeral)');
            setResultado(analiseCompleta);
          } 
          // Converter estrutura antiga para nova
          else if (analiseCompleta.mediaGeral !== undefined) {
            console.log('🔄 [MGRP-RESULTADO] Convertendo estrutura antiga para nova');
            console.log('🔄 [MGRP-RESULTADO] Dados originais:', {
              pontuacaoGeral: analiseCompleta.pontuacaoGeral,
              mediaGeral: analiseCompleta.mediaGeral,
              nivelGeral: analiseCompleta.nivelGeral,
              classificacaoGeral: analiseCompleta.classificacaoGeral
            });
            
            const resultadoConvertido: ResultadoMGRP = {
              dimensoes: {},
              maturidadeGeral: {
                pontuacao: analiseCompleta.pontuacaoGeral || 0,
                percentual: Math.round((analiseCompleta.mediaGeral || 0) * 20), // Converter média (1-5) para percentual (0-100)
                nivel: converterNivelAntigo(analiseCompleta.nivelGeral),
                classificacao: analiseCompleta.classificacaoGeral || 'Não classificado'
              },
              recomendacoes: analiseCompleta.recomendacoes || [],
              planoMelhoria: analiseCompleta.planoMelhoria || []
            };

            console.log('🔄 [MGRP-RESULTADO] Resultado convertido:', resultadoConvertido);
            console.log('🔄 [MGRP-RESULTADO] MaturidadeGeral convertida:', resultadoConvertido.maturidadeGeral);

            // Converter dimensões se existirem
            if (analiseCompleta.dimensoes) {
              console.log('🔄 [MGRP-RESULTADO] Convertendo dimensões:', Object.keys(analiseCompleta.dimensoes));
              
              Object.entries(analiseCompleta.dimensoes).forEach(([chave, dimensao]) => {
                if (dimensao && typeof dimensao === 'object') {
                  const dimensaoConvertida = {
                    pontuacao: dimensao.pontuacao || 0,
                    percentual: dimensao.percentual || Math.round((dimensao.pontuacao || 0) / 8 * 100), // Assumindo pontuação máxima de 8 por dimensão
                    nivel: converterNivelAntigo(dimensao.nivel),
                    classificacao: dimensao.classificacao || 'Não classificado',
                    descricao: dimensao.descricao || ''
                  };
                  
                  console.log(`🔄 [MGRP-RESULTADO] Dimensão ${chave} convertida:`, dimensaoConvertida);
                  resultadoConvertido.dimensoes[chave] = dimensaoConvertida;
                }
              });
            }

            console.log('✅ [MGRP-RESULTADO] Conversão concluída, definindo resultado');
            setResultado(resultadoConvertido);
          } else {
            console.log('❌ [MGRP-RESULTADO] Estrutura de dados não reconhecida');
            console.log('❌ [MGRP-RESULTADO] Chaves disponíveis:', Object.keys(analiseCompleta));
            throw new Error("Estrutura de dados do resultado não reconhecida");
          }
          
          setCarregando(false);
          return;
        } else {
          console.log('❌ [MGRP-RESULTADO] Resultado não encontrado ou sem análise completa');
        }
      }

      // Fallback: processar dados do estado da navegação (para compatibilidade)
      const { respostas, tempoTotal, perguntasRespondidas } = location.state || {};

      if (!respostas || Object.keys(respostas).length === 0) {
        throw new Error("Dados de resposta não encontrados e resultado não existe no banco");
      }

      console.log('🔍 [MGRP-RESULTADO] Processando resultado com respostas:', respostas);

      // Calcular resultado usando a função específica do teste
      const analiseMGRP = calcularResultadoMGRP(respostas);
      console.log('🔍 [MGRP-RESULTADO] Análise calculada:', analiseMGRP);

      // Salvar resultado no banco de dados apenas se não temos ID
      if (!resultadoId) {
        const sessionId = sessionService.getSessionId();
        const dadosResultado = {
          usuario_id: null, // Anônimo
          session_id: sessionId,
          pontuacao_total: analiseMGRP.maturidadeGeral.percentual,
          tempo_gasto: tempoTotal || 0,
          status: 'concluido' as const,
          metadados: {
            tipo_teste: 'maturidade-gestao-riscos',
            teste_nome: 'HumaniQ - MGRP (Maturidade em Gestão de Riscos Psicossociais)',
            pontuacoes_dimensoes: {
              identificacao_riscos: analiseMGRP.dimensoes['identificacao-riscos']?.percentual || 0,
              avaliacao_impacto: analiseMGRP.dimensoes['avaliacao-impacto']?.percentual || 0,
              medidas_preventivas: analiseMGRP.dimensoes['medidas-preventivas']?.percentual || 0,
              monitoramento_controle: analiseMGRP.dimensoes['monitoramento-controle']?.percentual || 0,
              cultura_organizacional: analiseMGRP.dimensoes['cultura-organizacional']?.percentual || 0,
              capacitacao_desenvolvimento: analiseMGRP.dimensoes['capacitacao-desenvolvimento']?.percentual || 0
            },
            interpretacao: gerarInterpretacao(analiseMGRP),
            recomendacoes: gerarRecomendacoes(analiseMGRP),
            analise_completa: analiseMGRP,
            versao_teste: '1.0',
            timestamp_processamento: new Date().toISOString(),
            perguntas_respondidas: perguntasRespondidas || Object.keys(respostas).length
          }
        };

        console.log('🔍 [MGRP-RESULTADO] Salvando resultado no banco...');
        const resultadoSalvo = await resultadosService.salvarResultado(dadosResultado);
        console.log('✅ [MGRP-RESULTADO] Resultado salvo com ID:', resultadoSalvo.id);
      }

      setResultado(analiseMGRP);
      setCarregando(false);

    } catch (error) {
      console.error('❌ [MGRP-RESULTADO] Erro ao processar resultado:', error);
      setErro(error instanceof Error ? error.message : "Erro desconhecido");
      setCarregando(false);
    }
  };

  const gerarInterpretacao = (analise: ResultadoMGRP): string => {
    const { maturidadeGeral } = analise;
    
    let interpretacao = `Sua organização apresenta nível de maturidade "${maturidadeGeral.nivel}" na gestão de riscos psicossociais, com ${maturidadeGeral.percentual}% de desenvolvimento. `;
    
    switch (maturidadeGeral.nivel) {
      case 'inicial':
        interpretacao += "A organização está nos estágios iniciais da gestão de riscos psicossociais. É fundamental estabelecer bases sólidas e processos estruturados para evoluir na maturidade.";
        break;
      case 'em-desenvolvimento':
        interpretacao += "A organização demonstra progresso na implementação de práticas de gestão de riscos psicossociais, mas ainda há oportunidades significativas de melhoria.";
        break;
      case 'estruturado':
        interpretacao += "A organização possui processos bem definidos e estruturados para gestão de riscos psicossociais, com práticas consistentes e resultados mensuráveis.";
        break;
      case 'otimizado':
        interpretacao += "A organização demonstra excelência na gestão de riscos psicossociais, com processos maduros, cultura preventiva consolidada e melhoria contínua.";
        break;
      default:
        interpretacao += "Recomenda-se uma análise mais detalhada das dimensões avaliadas para identificar áreas específicas de desenvolvimento.";
    }
    
    return interpretacao;
  };

  const gerarRecomendacoes = (analise: ResultadoMGRP): string[] => {
    const recomendacoes: string[] = [];
    
    // Recomendações baseadas no nível de maturidade
    switch (analise.maturidadeGeral.nivel) {
      case 'inicial':
        recomendacoes.push(
          "Estabeleça uma política formal de gestão de riscos psicossociais",
          "Implemente processos básicos de identificação e avaliação de riscos",
          "Desenvolva programas de conscientização sobre saúde mental no trabalho",
          "Crie canais de comunicação para relato de situações de risco"
        );
        break;
      case 'em-desenvolvimento':
        recomendacoes.push(
          "Fortaleça os processos de monitoramento e controle existentes",
          "Implemente indicadores de desempenho para gestão de riscos psicossociais",
          "Desenvolva programas de capacitação para lideranças",
          "Estabeleça protocolos de resposta a situações de risco identificadas"
        );
        break;
      case 'estruturado':
        recomendacoes.push(
          "Implemente processos de melhoria contínua baseados em dados",
          "Desenvolva programas avançados de promoção do bem-estar",
          "Estabeleça parcerias estratégicas para inovação em saúde ocupacional",
          "Crie programas de reconhecimento e engajamento dos colaboradores"
        );
        break;
      case 'otimizado':
        recomendacoes.push(
          "Mantenha a excelência através de revisões periódicas dos processos",
          "Compartilhe boas práticas com outras organizações do setor",
          "Invista em pesquisa e desenvolvimento de novas abordagens",
          "Torne-se referência em gestão de riscos psicossociais"
        );
        break;
    }
    
    // Recomendações específicas por dimensão com baixa maturidade
    Object.entries(analise.dimensoes).forEach(([dimensao, dados]) => {
      if (dados && (dados.nivel === 'inicial' || dados.percentual < 50)) {
        switch (dimensao) {
          case 'identificacao-riscos':
            recomendacoes.push("Desenvolva ferramentas sistemáticas para identificação de riscos psicossociais");
            break;
          case 'avaliacao-impacto':
            recomendacoes.push("Implemente metodologias estruturadas para avaliação de impacto dos riscos");
            break;
          case 'medidas-preventivas':
            recomendacoes.push("Estabeleça programas abrangentes de prevenção de riscos psicossociais");
            break;
          case 'monitoramento-controle':
            recomendacoes.push("Crie sistemas de monitoramento contínuo e controle de riscos");
            break;
          case 'cultura-organizacional':
            recomendacoes.push("Fortaleça a cultura organizacional voltada para saúde mental e bem-estar");
            break;
          case 'capacitacao-desenvolvimento':
            recomendacoes.push("Invista em programas de capacitação e desenvolvimento em gestão de riscos");
            break;
        }
      }
    });
    
    return recomendacoes.slice(0, 8); // Limitar a 8 recomendações
  };

  const obterCorPorNivel = (nivel: string) => {
    switch (nivel) {
      case 'otimizado': return 'text-green-700 bg-green-100 border-green-300';
      case 'estruturado': return 'text-blue-700 bg-blue-100 border-blue-300';
      case 'em-desenvolvimento': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'inicial': return 'text-red-700 bg-red-100 border-red-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const obterIconePorNivel = (nivel: string) => {
    switch (nivel) {
      case 'otimizado': return <Award className="h-5 w-5" />;
      case 'estruturado': return <Target className="h-5 w-5" />;
      case 'em-desenvolvimento': return <TrendingUp className="h-5 w-5" />;
      case 'inicial': return <AlertTriangle className="h-5 w-5" />;
      default: return <Logo size="sm" showText={false} />;
    }
  };

  const obterDescricaoNivel = (nivel: string) => {
    switch (nivel) {
      case 'otimizado': return 'Excelência em gestão de riscos psicossociais';
      case 'estruturado': return 'Processos bem definidos e estruturados';
      case 'em-desenvolvimento': return 'Em processo de desenvolvimento e melhoria';
      case 'inicial': return 'Estágio inicial de implementação';
      default: return 'Nível não identificado';
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Processando Resultado</h2>
          <p className="text-gray-500">Analisando sua maturidade em gestão de riscos psicossociais...</p>
        </motion.div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-4"
        >
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao Carregar Resultado</h2>
                <p className="text-gray-600 mb-4">{erro}</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => navigate('/testes')} variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar aos Testes
                  </Button>
                  <Button onClick={processarResultado}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!resultado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-4"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Logo size="lg" showText={false} className="mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Resultado Não Encontrado</h2>
                <p className="text-gray-600 mb-4">Não foi possível encontrar os dados do seu teste.</p>
                <Button onClick={() => navigate('/testes')} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar aos Testes
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Log adicional para verificar o valor na renderização
  console.log('🎨 [MGRP-RENDER] Renderizando resultado:', resultado);
  console.log('🎨 [MGRP-RENDER] MaturidadeGeral:', resultado.maturidadeGeral);
  console.log('🎨 [MGRP-RENDER] Percentual para exibir:', resultado.maturidadeGeral?.percentual);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/testes')}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Resultado MGRP</h1>
                <p className="text-gray-600">Maturidade em Gestão de Riscos Psicossociais</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
            </div>
          </div>

          {/* Resultado Geral */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-8 border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8" />
                    <div>
                      <CardTitle className="text-2xl">Maturidade Geral</CardTitle>
                      <CardDescription className="text-blue-100">
                        Nível de desenvolvimento organizacional
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">
                      {resultado.maturidadeGeral?.percentual || 0}%
                    </div>
                    <Badge className={`${obterCorPorNivel(resultado.maturidadeGeral?.nivel || 'inicial')} border`}>
                      {obterIconePorNivel(resultado.maturidadeGeral?.nivel || 'inicial')}
                      <span className="ml-2 capitalize">
                        {(resultado.maturidadeGeral?.nivel || 'inicial').replace('-', ' ')}
                      </span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progresso de Maturidade</span>
                    <span className="text-sm text-gray-500">
                      {resultado.maturidadeGeral?.percentual || 0}%
                    </span>
                  </div>
                  <Progress value={resultado.maturidadeGeral?.percentual || 0} className="h-3" />
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {obterDescricaoNivel(resultado.maturidadeGeral?.nivel || 'inicial')}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Dimensões da Maturidade */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  Dimensões da Maturidade
                </CardTitle>
                <CardDescription>
                  Análise detalhada por área de gestão de riscos psicossociais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(resultado.dimensoes).map(([chave, dimensao]) => {
                    if (!dimensao) return null;
                    
                    const nomesDimensoes: Record<string, string> = {
                      'identificacao-riscos': 'Identificação de Riscos',
                      'avaliacao-impacto': 'Avaliação de Impacto',
                      'medidas-preventivas': 'Medidas Preventivas',
                      'monitoramento-controle': 'Monitoramento e Controle',
                      'cultura-organizacional': 'Cultura Organizacional',
                      'capacitacao-desenvolvimento': 'Capacitação e Desenvolvimento'
                    };

                    return (
                      <motion.div
                        key={chave}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + Object.keys(resultado.dimensoes).indexOf(chave) * 0.1 }}
                        className="p-4 border rounded-lg bg-white shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">
                            {nomesDimensoes[chave] || chave}
                          </h4>
                          <Badge className={`${obterCorPorNivel(dimensao.nivel)} border text-xs`}>
                            {dimensao.nivel.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="mb-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">Maturidade</span>
                            <span className="text-sm font-medium">{dimensao.percentual}%</span>
                          </div>
                          <Progress value={dimensao.percentual} className="h-2" />
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {dimensao.descricao}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Interpretação e Recomendações */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Interpretação */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-6 w-6 text-blue-600" />
                    Interpretação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {gerarInterpretacao(resultado)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recomendações */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-blue-600" />
                    Recomendações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {gerarRecomendacoes(resultado).map((recomendacao, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm leading-relaxed">{recomendacao}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Próximos Passos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8"
          >
            <Alert>
              <Logo size="sm" showText={false} />
              <AlertDescription>
                <strong>Próximos Passos:</strong> Considere implementar as recomendações de forma gradual e sistemática. 
                Monitore regularmente o progresso e reavalie a maturidade organizacional periodicamente para acompanhar a evolução.
              </AlertDescription>
            </Alert>
          </motion.div>

          {/* Ações */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center gap-4 mt-8"
          >
            <Button onClick={() => navigate('/testes')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Fazer Outro Teste
            </Button>
            <Button onClick={() => navigate('/resultados')}>
              <Eye className="h-4 w-4 mr-2" />
              Ver Todos os Resultados
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}