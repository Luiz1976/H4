import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, Loader2, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/AuthContext";
import { obterTodasPerguntasEO, escalaLikert, calcularResultadoEstresseOcupacional } from "@/lib/testes/estresse-ocupacional";
import { estresseOcupacionalService } from "@/lib/services/estresse-ocupacional-service";
import { processamentoService, respostasService, resultadosService } from "@/lib/database";
import { sessionService } from "@/lib/services/session-service";
import { supabase } from "@/lib/supabase";
import { numeroParaLetra } from "@/lib/utils";
import ProcessingAnimation from "@/components/ProcessingAnimation";

export default function TesteEstresseOcupacionalPerguntas() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const perguntas = obterTodasPerguntasEO().map(pergunta => ({
    id: pergunta.id,
    texto: pergunta.texto,
    categoria: pergunta.dimensao,
    escala: escalaLikert
  }));
  
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [processandoTeste, setProcessandoTeste] = useState(false);
  const [tempoInicio] = useState(Date.now());
  
  // Estados para controle do avanço automático
  const [salvandoResposta, setSalvandoResposta] = useState(false);
  const [respostaSalva, setRespostaSalva] = useState(false);
  const [erroSalvamento, setErroSalvamento] = useState<string | null>(null);
  const [avancandoAutomaticamente, setAvancandoAutomaticamente] = useState(false);
  
  // Novo estado para proteção contra múltiplos cliques
  const [processandoResposta, setProcessandoResposta] = useState(false);
  const [mostrarBotaoFinalizar, setMostrarBotaoFinalizar] = useState(false);
  
  // Estado para controlar a animação de processamento
  const [mostrarAnimacaoProcessamento, setMostrarAnimacaoProcessamento] = useState(false);
  
  if (!perguntas.length) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-destructive">Teste não encontrado</h1>
        <Button onClick={() => navigate('/testes')}>
          Voltar aos Testes
        </Button>
      </div>
    );
  }

  const pergunta = perguntas[perguntaAtual];
  const progresso = ((perguntaAtual + 1) / perguntas.length) * 100;
  const jaRespondeu = respostas[pergunta.id] !== undefined;
  const isUltimaPergunta = perguntaAtual === perguntas.length - 1;

  // Verificar se qualquer operação está em andamento
  const operacaoEmAndamento = salvandoResposta || avancandoAutomaticamente || processandoResposta || processandoTeste;

  // Função para salvar resposta individual
  const salvarRespostaIndividual = async (perguntaId: number, valor: number): Promise<boolean> => {
    setSalvandoResposta(true);
    setErroSalvamento(null);
    
    try {
      console.log('🔍 [PERGUNTAS-EO] Iniciando salvamento da resposta:', { perguntaId, valor });
      
      // Simular salvamento (implementar serviço real posteriormente)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('✅ [PERGUNTAS-EO] Resposta salva com sucesso');
      setRespostaSalva(true);
      return true;
      
    } catch (error) {
      console.error('❌ [PERGUNTAS-EO] Erro no salvamento:', error);
      setErroSalvamento(error instanceof Error ? error.message : "Erro desconhecido");
      return false;
    } finally {
      setSalvandoResposta(false);
    }
  };

  // Função para finalizar o teste
  const finalizarTeste = async () => {
    console.log('🔍 [FINALIZAR-TESTE-EO] Iniciando finalização do teste...');
    setProcessandoTeste(true);
    
    try {
      const tempoTotal = Date.now() - tempoInicio;
      console.log('🔍 [FINALIZAR-TESTE-EO] Tempo total calculado:', tempoTotal);
      
      // Mostrar animação de processamento
      setMostrarAnimacaoProcessamento(true);
      console.log('🔍 [FINALIZAR-TESTE-EO] Animação de processamento iniciada');
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('🔍 [FINALIZAR-TESTE-EO] Processamento simulado concluído');
      
      // Processar e salvar resultado para obter ID único
      console.log('🔍 [FINALIZAR-TESTE-EO] Processando resultado...');
      console.log('🔍 [FINALIZAR-TESTE-EO] Respostas disponíveis:', respostas);
      console.log('🔍 [FINALIZAR-TESTE-EO] Número de respostas:', Object.keys(respostas).length);
      
      const analiseEstresse = calcularResultadoEstresseOcupacional(respostas);
      console.log('🔍 [FINALIZAR-TESTE-EO] Análise calculada:', analiseEstresse);
      
      // Preparar dados para salvar
      const sessionId = sessionService.getSessionId();
      console.log('🔍 [FINALIZAR-TESTE-EO] Session ID obtido:', sessionId);
      
      const dadosResultado = {
        usuario_id: isAuthenticated && user ? user.id : null, // Usar ID do usuário se autenticado
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
            resiliencia: analiseEstresse.dimensoes['resiliencia']?.media || 0,
            suporte_social: analiseEstresse.dimensoes['suporte_social']?.media || 0
          },
          analise_completa: analiseEstresse,
          versao_teste: '1.0',
          timestamp_processamento: new Date().toISOString(),
          perguntas_respondidas: Object.keys(respostas).length
        }
      };

      console.log('🔍 [FINALIZAR-TESTE-EO] Dados preparados para salvamento:', dadosResultado);
      console.log('🔍 [FINALIZAR-TESTE-EO] Usuário autenticado:', isAuthenticated);
      console.log('🔍 [FINALIZAR-TESTE-EO] ID do usuário:', user?.id);

      // Salvar resultado e obter ID único
      console.log('🔍 [FINALIZAR-TESTE-EO] Iniciando chamada para salvarResultado...');
      const resultadoSalvo = await resultadosService.salvarResultado(dadosResultado);
      console.log('✅ [FINALIZAR-TESTE-EO] Resultado salvo com ID:', resultadoSalvo.id);

      // Se o usuário não estava autenticado mas agora está, vincular resultados anônimos
      if (!dadosResultado.usuario_id && isAuthenticated && user) {
        console.log('🔗 [FINALIZAR-TESTE-EO] Tentando vincular resultados anônimos ao usuário autenticado...');
        try {
          // Chamar função SQL para vincular resultados anônimos
          const { data, error } = await supabase.rpc('vincular_resultados_usuario_seguro', {
            p_session_id: sessionId,
            p_usuario_id: user.id
          });
          
          if (error) {
            console.error('❌ [FINALIZAR-TESTE-EO] Erro ao vincular resultados:', error);
          } else {
            console.log('✅ [FINALIZAR-TESTE-EO] Resultados vinculados com sucesso:', data);
          }
        } catch (linkError) {
          console.error('❌ [FINALIZAR-TESTE-EO] Erro na vinculação de resultados:', linkError);
          // Não bloquear o fluxo, apenas registrar o erro
        }
      }

      // Salvar respostas individuais no banco de dados
      console.log('🔍 [FINALIZAR-TESTE-EO] Salvando respostas individuais no banco...');
      const respostasParaSalvar = Object.entries(respostas).map(([perguntaId, valor]) => ({
        resultado_id: resultadoSalvo.id,
        pergunta_id: perguntaId, // Será convertido para UUID no banco se necessário
        resposta: valor.toString(),
        pontuacao: valor,
        tempo_resposta: null
      }));
      
      try {
        await respostasService.salvarRespostas(respostasParaSalvar);
        console.log('✅ [FINALIZAR-TESTE-EO] Respostas individuais salvas com sucesso');
      } catch (errorRespostas) {
        console.error('⚠️ [FINALIZAR-TESTE-EO] Erro ao salvar respostas individuais:', errorRespostas);
        // Não bloquear o fluxo, mas registrar o erro
      }
      
      // Navegar para URL exclusiva com ID do resultado
      console.log('🔍 [FINALIZAR-TESTE-EO] Iniciando navegação para resultado...');
      const urlDestino = `/resultado/estresse-ocupacional/${resultadoSalvo.id}`;
      console.log('🔍 [FINALIZAR-TESTE-EO] URL de destino:', urlDestino);
      
      navigate(urlDestino, {
        state: { 
          respostas,
          tempoTotal,
          perguntasRespondidas: Object.keys(respostas).length,
          resultadoId: resultadoSalvo.id
        }
      });
      
      console.log('✅ [FINALIZAR-TESTE-EO] Navegação iniciada com sucesso');
      
    } catch (error) {
      console.error('❌ [FINALIZAR-TESTE-EO] Erro capturado:', error);
      console.error('❌ [FINALIZAR-TESTE-EO] Tipo do erro:', typeof error);
      console.error('❌ [FINALIZAR-TESTE-EO] Nome do erro:', error instanceof Error ? error.name : 'Unknown');
      console.error('❌ [FINALIZAR-TESTE-EO] Mensagem do erro:', error instanceof Error ? error.message : String(error));
      console.error('❌ [FINALIZAR-TESTE-EO] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      
      toast({
        title: "Erro ao finalizar teste",
        description: "Ocorreu um erro ao processar seus resultados. Tente novamente.",
        variant: "destructive",
      });
      setProcessandoTeste(false);
      setMostrarAnimacaoProcessamento(false);
    }
  };

  // Função chamada quando a animação de processamento termina
  const handleAnimacaoCompleta = () => {
    setMostrarAnimacaoProcessamento(false);
    // A navegação já foi feita na função finalizarTeste
  };

  // Função modificada para lidar com respostas e avanço automático
  const handleResposta = async (valor: number) => {
    // Verificar se já está processando alguma operação
    if (operacaoEmAndamento) {
      console.log('Operação já em andamento, ignorando clique');
      return;
    }

    // Marcar como processando para evitar múltiplos cliques
    setProcessandoResposta(true);

    try {
      // Atualizar estado local imediatamente para feedback visual
      setRespostas(prev => ({
        ...prev,
        [pergunta.id]: valor
      }));

      // Salvar resposta no backend
      const sucessoSalvamento = await salvarRespostaIndividual(pergunta.id, valor);
      
      if (sucessoSalvamento) {
        // Mostrar feedback de sucesso
        toast({
          title: "Resposta registrada",
          description: "Sua resposta foi salva com sucesso.",
          duration: 2000,
        });

        // Aguardar um momento para o usuário ver o feedback
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Avançar automaticamente se não for a última pergunta
        if (!isUltimaPergunta) {
          setAvancandoAutomaticamente(true);
          await new Promise(resolve => setTimeout(resolve, 500));
          setPerguntaAtual(prev => prev + 1);
          setAvancandoAutomaticamente(false);
          setRespostaSalva(false);
        } else {
          // Se for a última pergunta, mostrar botão de finalizar
          setMostrarBotaoFinalizar(true);
        }
      } else {
        // Mostrar erro e não avançar
        toast({
          title: "Erro no salvamento",
          description: erroSalvamento || "Não foi possível salvar sua resposta. Tente novamente.",
          variant: "destructive",
          duration: 4000,
        });
      }
    } finally {
      // Sempre liberar o processamento no final
      setProcessandoResposta(false);
    }
  };

  const handleAnterior = () => {
    if (perguntaAtual > 0) {
      setPerguntaAtual(prev => prev - 1);
    }
  };

  // Resetar estados quando mudar de pergunta
  useEffect(() => {
    setRespostaSalva(false);
    setErroSalvamento(null);
    setProcessandoResposta(false);
  }, [perguntaAtual]);

  // Mostrar animação de processamento se ativa
  if (mostrarAnimacaoProcessamento) {
    return (
      <ProcessingAnimation 
        onComplete={handleAnimacaoCompleta}
        message="Processando seus resultados..."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Barra de progresso superior */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800">
              HumaniQ EO – Estresse Ocupacional
            </h1>
            <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {perguntaAtual + 1} de {perguntas.length}
            </span>
          </div>
          <Progress value={progresso} className="h-3 bg-slate-200" />
          
          {/* Indicador de status do salvamento */}
          {(operacaoEmAndamento || respostaSalva || erroSalvamento) && (
            <div className="mt-4 flex items-center justify-center">
              {salvandoResposta && (
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Salvando resposta...</span>
                </div>
              )}
              {respostaSalva && !avancandoAutomaticamente && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Resposta salva com sucesso!</span>
                </div>
              )}
              {avancandoAutomaticamente && (
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Avançando para próxima pergunta...</span>
                </div>
              )}
              {processandoResposta && !salvandoResposta && (
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-lg border border-orange-200">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Processando resposta...</span>
                </div>
              )}
              {erroSalvamento && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Erro: {erroSalvamento}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card da pergunta */}
        <Card className="bg-white shadow-sm border border-slate-200/60">
          {/* Cabeçalho com fundo escuro */}
          <div className="bg-slate-700 text-white px-6 py-4 rounded-t-lg">
            <h2 className="text-xl font-semibold mb-2">
              Pergunta {perguntaAtual + 1}
            </h2>
            <div className="inline-block bg-purple-500 text-white text-sm font-medium px-3 py-1 rounded-full">
              {pergunta.categoria}
            </div>
          </div>
          
          <CardContent className="p-0">
            {/* Texto da pergunta com fundo cinza claro */}
            <div className="bg-gray-100 p-8 text-center">
              <p className="text-lg text-slate-700 leading-relaxed">
                {pergunta.texto}
              </p>
            </div>

            {/* Opções de resposta */}
            <div className="p-8 space-y-6">
              <h3 className="text-base font-semibold text-slate-700 text-center">
                Selecione sua resposta
              </h3>
              
              {/* Escala visual horizontal */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-red-600">Nunca</span>
                  <div 
                    className="h-2 w-80 rounded-full"
                    style={{
                      background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #84cc16, #22c55e)'
                    }}
                  ></div>
                  <span className="text-sm font-medium text-green-600">Sempre</span>
                </div>
              </div>
              
              <div className="flex justify-center items-start gap-6 mt-8">
                {escalaLikert.map((opcao, index) => {
                  const isSelected = respostas[pergunta.id] === index + 1;
                  const valor = index + 1;
                  
                  const getButtonColor = () => {
                    if (operacaoEmAndamento) {
                      return isSelected 
                        ? 'bg-slate-300 text-slate-500 border-slate-300' 
                        : 'bg-slate-100 text-slate-400 border-slate-200';
                    }
                    
                    switch (valor) {
                      case 1: return isSelected ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'bg-white text-red-600 border-red-300 hover:bg-red-50';
                      case 2: return isSelected ? 'bg-orange-500 text-white border-orange-500 shadow-lg' : 'bg-white text-orange-500 border-orange-300 hover:bg-orange-50';
                      case 3: return isSelected ? 'bg-yellow-500 text-white border-yellow-500 shadow-lg' : 'bg-white text-yellow-600 border-yellow-300 hover:bg-yellow-50';
                      case 4: return isSelected ? 'bg-lime-500 text-white border-lime-500 shadow-lg' : 'bg-white text-lime-600 border-lime-300 hover:bg-lime-50';
                      case 5: return isSelected ? 'bg-green-600 text-white border-green-600 shadow-lg' : 'bg-white text-green-600 border-green-300 hover:bg-green-50';
                      default: return 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50';
                    }
                  };
                  
                  return (
                    <div key={index} className="flex flex-col items-center space-y-3">
                      <Button
                        onClick={() => handleResposta(valor)}
                        disabled={operacaoEmAndamento}
                        className={`
                          w-16 h-16 rounded-lg text-lg font-bold border-2 transition-all duration-200
                          ${getButtonColor()}
                          ${operacaoEmAndamento ? 'cursor-not-allowed' : 'cursor-pointer'}
                          ${isSelected ? 'transform scale-110' : 'hover:scale-105'}
                        `}
                      >
                        {numeroParaLetra(valor)}
                      </Button>
                      <span className="text-xs text-center text-slate-600 max-w-20 leading-tight">
                        {opcao}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de navegação */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleAnterior}
            disabled={perguntaAtual === 0 || operacaoEmAndamento}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>

          {/* Botão Finalizar Teste - só aparece na última pergunta após responder */}
          {isUltimaPergunta && (mostrarBotaoFinalizar || jaRespondeu) && (
            <Button
              onClick={finalizarTeste}
              disabled={processandoTeste || !jaRespondeu}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
            >
              {processandoTeste ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                'Finalizar Teste'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}