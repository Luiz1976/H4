'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Download, Share2, RefreshCw, TrendingUp, Award, Building2, AlertTriangle, Heart, Users, Loader2, CheckCircle, Eye, BarChart3, Radar, Gauge, Activity, Shield, UserX, MessageSquare, Target, BookOpen } from 'lucide-react';
import Logo from "@/components/Logo";
import { calcularResultadoPercepacaoAssedio, type ResultadoPercepacaoAssedio } from '@/lib/testes/percepcao-assedio';
import { resultadosService } from '@/lib/database';
import { sessionService } from '@/lib/services/session-service';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ResultadoPAS() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resultadoId } = useParams<{ resultadoId: string }>();
  const [resultado, setResultado] = useState<ResultadoPercepacaoAssedio | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    processarResultado();
  }, []);

  const processarResultado = async () => {
    try {
      setCarregando(true);
      setErro(null);

      console.log('🔍 [PAS-RESULTADO] Resultado ID da URL:', resultadoId);

      // Se temos um ID na URL, buscar resultado existente
      if (resultadoId) {
        console.log('🔍 [PAS-RESULTADO] Buscando resultado existente com ID:', resultadoId);
        
        const resultadoExistente = await resultadosService.buscarResultadoPorId(resultadoId);
        
        if (resultadoExistente && resultadoExistente.metadados?.analise_completa) {
          console.log('✅ [PAS-RESULTADO] Resultado encontrado no banco:', resultadoExistente);
          setResultado(resultadoExistente.metadados.analise_completa);
          setCarregando(false);
          return;
        } else {
          console.log('❌ [PAS-RESULTADO] Resultado não encontrado ou sem análise completa');
        }
      }

      // Fallback: processar dados do estado da navegação (para compatibilidade)
      const { respostas, tempoTotal, perguntasRespondidas } = location.state || {};

      if (!respostas || Object.keys(respostas).length === 0) {
        throw new Error("Dados de resposta não encontrados e resultado não existe no banco");
      }

      console.log('🔍 [PAS-RESULTADO] Processando resultado com respostas:', respostas);

      // Calcular resultado usando a função específica do teste
      const analisePAS = calcularResultadoPercepacaoAssedio(respostas);
      console.log('🔍 [PAS-RESULTADO] Análise calculada:', analisePAS);
      
      // Validar se a análise foi calculada corretamente
      if (!analisePAS || typeof analisePAS !== 'object') {
        console.error('🚨 [PAS-RESULTADO] Análise inválida:', analisePAS);
        throw new Error("Erro ao calcular análise do teste");
      }

      // Salvar resultado no banco de dados apenas se não temos ID
      if (!resultadoId) {
        const sessionId = sessionService.getSessionId();
        const dadosResultado = {
          usuario_id: null, // Anônimo
          session_id: sessionId,
          pontuacao_total: analisePAS.percentualGeral,
          tempo_gasto: tempoTotal || 0,
          status: 'concluido' as const,
          metadados: {
            tipo_teste: 'percepcao-assedio',
            teste_nome: 'HumaniQ PAS - Percepção de Assédio Moral e Sexual',
            pontuacoes_dimensoes: {
              assedio_moral_direto: analisePAS.dimensoes.find(d => d.id === 'assedio-moral-direto')?.percentual || 0,
              assedio_moral_institucional: analisePAS.dimensoes.find(d => d.id === 'assedio-moral-institucional')?.percentual || 0,
              assedio_sexual: analisePAS.dimensoes.find(d => d.id === 'assedio-sexual')?.percentual || 0,
              percepcao_ambiente_denuncias: analisePAS.dimensoes.find(d => d.id === 'percepcao-ambiente-denuncias')?.percentual || 0,
              impactos_emocionais: analisePAS.dimensoes.find(d => d.id === 'impactos-emocionais')?.percentual || 0
            },
            interpretacao: gerarInterpretacao(analisePAS),
            recomendacoes: gerarRecomendacoes(analisePAS),
            analise_completa: analisePAS,
            versao_teste: '1.0',
            timestamp_processamento: new Date().toISOString(),
            perguntas_respondidas: perguntasRespondidas || Object.keys(respostas).length
          }
        };

        console.log('🔍 [PAS-RESULTADO] Salvando resultado no banco...');
        const resultadoSalvo = await resultadosService.salvarResultado(dadosResultado);
        console.log('✅ [PAS-RESULTADO] Resultado salvo com ID:', resultadoSalvo.id);
      }

      setResultado(analisePAS);
      setCarregando(false);

    } catch (error) {
      console.error('❌ [PAS-RESULTADO] Erro ao processar resultado:', error);
      setErro(error instanceof Error ? error.message : "Erro desconhecido");
      setCarregando(false);
    }
  };

  const gerarInterpretacao = (analise: ResultadoPercepacaoAssedio): string => {
    // Verificar se analise existe e tem as propriedades necessárias
    if (!analise || !analise.nivelRiscoGeral || !analise.classificacaoGeral) {
      console.warn('🚨 [PAS-RESULTADO] Análise inválida para gerar interpretação:', analise);
      return "Não foi possível gerar uma interpretação válida. Recomenda-se refazer o teste.";
    }
    
    const { nivelRiscoGeral, classificacaoGeral } = analise;
    
    let interpretacao = `Seu resultado geral no teste HumaniQ PAS foi classificado como "${classificacaoGeral}" com nível de risco "${nivelRiscoGeral}". `;
    
    switch (nivelRiscoGeral) {
      case 'Baixo Risco':
        interpretacao += "Você percebe o ambiente de trabalho como seguro e respeitoso, com baixo risco de situações de assédio moral e sexual.";
        break;
      case 'Risco Moderado':
        interpretacao += "Foram identificados alguns sinais de alerta que merecem atenção. É importante monitorar e implementar medidas preventivas.";
        break;
      case 'Alto Risco':
        interpretacao += "Seu perfil indica situações críticas que requerem atenção imediata. É recomendável buscar apoio e implementar mudanças urgentes.";
        break;
      case 'Risco Crítico':
        interpretacao += "O ambiente apresenta características altamente tóxicas que demandam intervenção imediata e apoio especializado.";
        break;
      default:
        interpretacao += "Recomenda-se uma análise mais detalhada das dimensões avaliadas para identificar áreas específicas de intervenção.";
    }
    
    return interpretacao;
  };

  const gerarRecomendacoes = (analise: ResultadoPercepacaoAssedio): string[] => {
    const recomendacoes: string[] = [];
    
    // Verificar se analise existe e tem as propriedades necessárias
    if (!analise || !analise.nivelRiscoGeral || !analise.dimensoes) {
      console.warn('🚨 [PAS-RESULTADO] Análise inválida para gerar recomendações:', analise);
      return [
        "Recomenda-se refazer o teste para obter recomendações personalizadas",
        "Procure orientação profissional sobre assédio no trabalho",
        "Mantenha-se informado sobre seus direitos trabalhistas"
      ];
    }
    
    // Recomendações baseadas no nível de risco geral
    switch (analise.nivelRiscoGeral) {
      case 'Baixo Risco':
        recomendacoes.push(
          "Continue mantendo um ambiente de trabalho respeitoso e seguro",
          "Participe de treinamentos de prevenção ao assédio",
          "Mantenha canais de comunicação abertos com a liderança"
        );
        break;
      case 'Risco Moderado':
        recomendacoes.push(
          "Documente situações inadequadas que presenciar ou vivenciar",
          "Busque apoio dos canais de denúncia da organização",
          "Participe de grupos de apoio ou programas de bem-estar"
        );
        break;
      case 'Alto Risco':
      case 'Risco Crítico':
        recomendacoes.push(
          "Procure imediatamente os canais de denúncia disponíveis",
          "Busque apoio psicológico especializado",
          "Documente todas as situações de assédio vivenciadas",
          "Considere buscar orientação jurídica especializada"
        );
        break;
    }
    
    // Recomendações específicas por dimensão crítica
    if (Array.isArray(analise.dimensoes)) {
      analise.dimensoes.forEach(dimensao => {
        if (dimensao && dimensao.nivelRisco && (dimensao.nivelRisco === 'Risco Crítico' || dimensao.nivelRisco === 'Alto Risco')) {
          switch (dimensao.id) {
            case 'assedio-moral-direto':
              recomendacoes.push("Busque apoio imediato para situações de assédio moral direto");
              break;
            case 'assedio-moral-institucional':
              recomendacoes.push("Avalie mudanças organizacionais para combater o assédio institucional");
              break;
            case 'assedio-sexual':
              recomendacoes.push("Procure canais especializados em casos de assédio sexual");
              break;
            case 'percepcao-ambiente-denuncias':
              recomendacoes.push("Fortaleça os canais de denúncia e resposta organizacional");
              break;
            case 'impactos-emocionais':
              recomendacoes.push("Priorize o cuidado com sua saúde mental e bem-estar emocional");
              break;
          }
        }
      });
    }
    
    return recomendacoes && recomendacoes.length > 0 ? recomendacoes.slice(0, 8) : [
      "Recomenda-se refazer o teste para obter recomendações personalizadas"
    ]; // Limitar a 8 recomendações com fallback
  };

  const obterCorPorNivel = (nivel: string) => {
    switch (nivel) {
      case 'Baixo Risco': return 'text-green-700 bg-green-100 border-green-300';
      case 'Risco Moderado': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'Alto Risco': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'Risco Crítico': return 'text-red-700 bg-red-100 border-red-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const obterIconePorNivel = (nivel: string) => {
    switch (nivel) {
      case 'Baixo Risco': return <CheckCircle className="h-5 w-5" />;
      case 'Risco Moderado': return <AlertTriangle className="h-5 w-5" />;
      case 'Alto Risco': return <AlertTriangle className="h-5 w-5" />;
      case 'Risco Crítico': return <AlertTriangle className="h-5 w-5" />;
      default: return <Logo size="sm" showText={false} />;
    }
  };

  const obterIconeDimensao = (dimensaoId: string) => {
    switch (dimensaoId) {
      case 'assedio-moral-direto': return <AlertTriangle className="h-5 w-5" />;
      case 'assedio-moral-institucional': return <Shield className="h-5 w-5" />;
      case 'assedio-sexual': return <UserX className="h-5 w-5" />;
      case 'percepcao-ambiente-denuncias': return <MessageSquare className="h-5 w-5" />;
      case 'impactos-emocionais': return <Heart className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-8 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Resultado: HumaniQ PAS
              </h1>
              <p className="text-blue-100 text-lg">
                Percepção de Assédio Moral e Sexual
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/testes')}
              className="text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar aos Testes
            </Button>
          </div>
        </motion.div>

        {/* Resultado Geral */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center"
        >
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-slate-200 max-w-2xl w-full">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-3 text-2xl text-slate-800">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Gauge className="h-7 w-7 text-white" />
                </div>
                Nível de Risco Geral
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-4">
                <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {resultado.percentualGeral}%
                </div>
                <Badge className={`text-lg px-6 py-2 ${obterCorPorNivel(resultado.nivelRiscoGeral)}`}>
                  {obterIconePorNivel(resultado.nivelRiscoGeral)}
                  <span className="ml-2">{resultado.nivelRiscoGeral}</span>
                </Badge>
                <div className="text-xl font-semibold text-slate-700">
                  {resultado.classificacaoGeral}
                </div>
              </div>
              
              <Alert className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 text-left">
                <Logo size="sm" showText={false} />
                <AlertDescription className="text-sm leading-relaxed text-slate-700 font-medium">
                  {gerarInterpretacao(resultado)}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </motion.div>

        {/* Análise por Dimensões */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-slate-800">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                Análise por Dimensões
              </CardTitle>
              <CardDescription className="text-slate-600 text-lg">
                Avaliação detalhada de cada área de risco
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                {resultado.dimensoes.map((dimensao, index) => (
                  <motion.div 
                    key={dimensao.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    className="bg-gradient-to-r from-slate-50 to-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${dimensao.cor} rounded-xl flex items-center justify-center shadow-lg`}>
                          {obterIconeDimensao(dimensao.id)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-800">{dimensao.nome}</h3>
                          <p className="text-slate-600">{dimensao.descricao}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-slate-800 mb-1">
                          {dimensao.percentual}%
                        </div>
                        <Badge className={`${obterCorPorNivel(dimensao.nivelRisco)} text-sm`}>
                          {dimensao.nivelRisco}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Progress value={dimensao.percentual} className="h-3" />
                      
                      <div className="bg-slate-50 rounded-xl p-4">
                        <h4 className="font-semibold text-slate-800 mb-2">Interpretação:</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {dimensao.interpretacao}
                        </p>
                      </div>

                      {dimensao.alertasCriticos && dimensao.alertasCriticos.length > 0 && (
                        <Alert className="border-l-4 border-l-red-500 bg-red-50">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <AlertDescription>
                            <div className="font-semibold text-red-800 mb-2">Alertas Críticos:</div>
                            <ul className="text-red-700 text-sm space-y-1">
                              {dimensao.alertasCriticos.map((alerta, idx) => (
                                <li key={idx}>• {alerta}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recomendações */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-slate-800">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                Recomendações Personalizadas
              </CardTitle>
              <CardDescription className="text-slate-600 text-lg">
                Ações sugeridas baseadas no seu perfil de risco
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Recomendações Educacionais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Ações Educacionais
                  </h3>
                  <div className="space-y-3">
                    {(resultado.recomendacoesEducativas || []).slice(0, 4).map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 text-sm leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recomendações Disciplinares */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    Ações Disciplinares
                  </h3>
                  <div className="space-y-3">
                    {(resultado.recomendacoesDisciplinares || []).slice(0, 4).map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 text-sm leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Indicadores ESG */}
        {resultado.indicadoresESG && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl border border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl text-slate-800">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  Indicadores ESG
                </CardTitle>
                <CardDescription className="text-slate-600 text-lg">
                  Impacto nos critérios ambientais, sociais e de governança
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-200">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-purple-800 mb-2">
                      {resultado.indicadoresESG.diversidadeInclusao}%
                    </div>
                    <div className="text-sm font-medium text-purple-700">Diversidade & Inclusão</div>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                    <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-blue-800 mb-2">
                      {resultado.indicadoresESG.segurancaPsicologica}%
                    </div>
                    <div className="text-sm font-medium text-blue-700">Segurança Psicológica</div>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200">
                    <Building2 className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-emerald-800 mb-2">
                      {resultado.indicadoresESG.culturaCorporativa}%
                    </div>
                    <div className="text-sm font-medium text-emerald-700">Cultura Corporativa</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="flex justify-center gap-4 pt-6"
        >
          <Button 
            variant="outline"
            onClick={() => navigate('/testes')}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-slate-300"
          >
            <Building2 className="h-4 w-4" />
            Outros Testes
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/todos-resultados')}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border-slate-200 hover:bg-white hover:border-slate-300"
          >
            <Eye className="h-4 w-4" />
            Todos os Resultados
          </Button>
          <Button 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            onClick={() => toast.success('Funcionalidade em desenvolvimento')}
          >
            <Download className="h-4 w-4" />
            Exportar Relatório
          </Button>
        </motion.div>
      </div>
    </div>
  );
}