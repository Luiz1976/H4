import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { obterTodasPerguntas } from "@/lib/testes/clima-organizacional";
import { obterTodasPerguntasKS } from "@/lib/testes/karasek-siegrist";
import { obterTodasPerguntasHumaniQInsight } from "@/lib/testes/humaniq-insight";
import { processamentoService, respostasService } from "@/lib/database";
import { numeroParaLetra } from "@/lib/utils";
import ProcessingAnimation from "@/components/ProcessingAnimation";

// Mock data das perguntas - em produção viria do backend baseado no teste
const perguntasMock = {
  "big-five": [
    {
      id: 1,
      texto: "Eu me vejo como alguém que é original, com novas ideias",
      categoria: "Abertura",
      escala: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"]
    },
    {
      id: 2,
      texto: "Eu me vejo como alguém que faz um trabalho completo",
      categoria: "Conscienciosidade",
      escala: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"]
    },
    {
      id: 3,
      texto: "Eu me vejo como alguém que é falante, comunicativo",
      categoria: "Extroversão",
      escala: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"]
    },
    {
      id: 4,
      texto: "Eu me vejo como alguém que é prestativo e não egoísta com os outros",
      categoria: "Amabilidade", 
      escala: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"]
    },
    {
      id: 5,
      texto: "Eu me vejo como alguém que se preocupa muito",
      categoria: "Neuroticismo",
      escala: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"]
    }
  ],
  "inteligencia-emocional": [
    {
      id: 1,
      texto: "Eu consigo identificar facilmente minhas emoções quando elas surgem",
      categoria: "Autoconsciência",
      escala: ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"]
    },
    {
      id: 2,
      texto: "Eu consigo controlar minhas emoções quando necessário",
      categoria: "Autorregulação",
      escala: ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"]
    },
    {
      id: 3,
      texto: "Eu percebo facilmente as emoções das outras pessoas",
      categoria: "Empatia",
      escala: ["Nunca", "Raramente", "Às vezes", "Frequentemente", "Sempre"]
    }
  ],
  "clima-organizacional": obterTodasPerguntas().map(pergunta => ({
    id: pergunta.id,
    texto: pergunta.texto,
    categoria: pergunta.dimensao,
    escala: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"]
  })),
  "karasek-siegrist": obterTodasPerguntasKS().map(pergunta => ({
    id: pergunta.id,
    texto: pergunta.texto,
    categoria: pergunta.dimensao,
    escala: pergunta.escala
  })),
  "humaniq-insight": obterTodasPerguntasHumaniQInsight().map(pergunta => ({
    id: pergunta.id,
    texto: pergunta.texto,
    categoria: pergunta.dimensao,
    escala: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"]
  }))
};

export default function TestePerguntas() {
  const { testeId: testeIdParam } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Extrair testeId dos parâmetros ou do pathname
  const pathname = window.location.pathname;
  const testeIdFromPath = pathname.includes('/humaniq-insight/') ? 'humaniq-insight' 
    : pathname.includes('/clima-organizacional/') ? 'clima-organizacional'
    : pathname.includes('/karasek-siegrist/') ? 'karasek-siegrist'
    : testeIdParam;
  
  const testeId = testeIdFromPath || testeIdParam;
  const perguntas = perguntasMock[testeId as keyof typeof perguntasMock] || [];
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
    try {
      setSalvandoResposta(true);
      setErroSalvamento(null);
      setRespostaSalva(false);

      // Simular salvamento individual da resposta
      // Em um cenário real, você criaria um endpoint específico para salvar respostas individuais
      const respostaData = {
        pergunta_id: perguntaId,
        valor: valor,
        teste_id: testeId,
        timestamp: new Date().toISOString()
      };

      // Simular delay de rede para demonstrar o feedback
      await new Promise(resolve => setTimeout(resolve, 800));

      // Aqui você faria a chamada real para o backend
      // Por enquanto, vamos simular sucesso
      console.log('Resposta salva:', respostaData);
      
      setRespostaSalva(true);
      return true;
      
    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
      setErroSalvamento('Falha ao salvar resposta. Tente novamente.');
      return false;
    } finally {
      setSalvandoResposta(false);
    }
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

  const handleProxima = () => {
    if (!jaRespondeu) {
      toast({
        title: "Resposta obrigatória",
        description: "Por favor, selecione uma resposta antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    if (isUltimaPergunta) {
      // Na última pergunta, apenas mostrar o botão de finalizar
      setMostrarBotaoFinalizar(true);
    } else {
      setPerguntaAtual(perguntaAtual + 1);
    }
  };

  const finalizarTeste = async () => {
    try {
      setProcessandoTeste(true);
      setMostrarAnimacaoProcessamento(true); // Mostrar animação
      
      console.log('🔍 [DEBUG] Iniciando finalização do teste');
      console.log('🔍 [DEBUG] testeId:', testeId);
      console.log('🔍 [DEBUG] respostas:', respostas);
      console.log('🔍 [DEBUG] número de respostas:', Object.keys(respostas).length);
      console.log('🔍 [DEBUG] número de perguntas:', perguntas.length);
      
      // Calcular tempo de resposta em segundos
      const tempoResposta = Math.round((Date.now() - tempoInicio) / 1000);
      
      console.log('🔍 [DEBUG] Parâmetros para processamento:');
      console.log('🔍 [DEBUG] - testeId:', testeId);
      console.log('🔍 [DEBUG] - respostas:', respostas);
      console.log('🔍 [DEBUG] - tempoResposta:', tempoResposta);
      console.log('🔍 [DEBUG] Chamando processamentoService.processarTesteCompleto...');

      try {
        // Processar teste no backend com os parâmetros corretos
        console.log('🔍 [DEBUG] Iniciando processamento...');
        const resultado = await processamentoService.processarTesteCompleto(
          testeId!,
          respostas,
          undefined, // usuarioNome
          undefined, // usuarioEmail
          tempoResposta
        );
        
        console.log('🔍 [DEBUG] Resultado recebido:', resultado);
        console.log('🔍 [DEBUG] Resultado.resultado:', resultado.resultado);
        console.log('🔍 [DEBUG] Resultado.resultado.id:', resultado.resultado.id);
        
        toast({
          title: "Teste finalizado!",
          description: "Suas respostas foram processadas com sucesso.",
        });

        // Navegar para resultados com o ID do resultado
        console.log('🔍 [DEBUG] Navegando para resultado:', `/resultado/${testeId}/${resultado.resultado.id}`);
        navigate(`/resultado/${testeId}/${resultado.resultado.id}`);
        
      } catch (processError) {
        console.error('❌ [ERROR] Erro específico no processamento:', processError);
        console.error('❌ [ERROR] Tipo do erro:', typeof processError);
        console.error('❌ [ERROR] Nome do erro:', processError instanceof Error ? processError.name : 'Unknown');
        console.error('❌ [ERROR] Mensagem do erro:', processError instanceof Error ? processError.message : String(processError));
        console.error('❌ [ERROR] Stack trace completo:', processError instanceof Error ? processError.stack : 'No stack trace');
        
        // Verificar se é erro de rede, banco de dados, etc.
        if (processError instanceof Error) {
          if (processError.message.includes('fetch')) {
            console.error('❌ [ERROR] Erro de rede detectado');
          } else if (processError.message.includes('database') || processError.message.includes('supabase')) {
            console.error('❌ [ERROR] Erro de banco de dados detectado');
          } else if (processError.message.includes('validation')) {
            console.error('❌ [ERROR] Erro de validação detectado');
          }
        }
        
        throw processError; // Re-throw para ser capturado pelo catch externo
      }
      
    } catch (error) {
      console.error('❌ [ERROR] Erro ao processar teste:', error);
      console.error('❌ [ERROR] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('❌ [ERROR] Error message:', error instanceof Error ? error.message : String(error));
      
      toast({
        title: "Erro ao processar teste",
        description: "Ocorreu um erro ao processar suas respostas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProcessandoTeste(false);
      setMostrarAnimacaoProcessamento(false); // Ocultar animação em caso de erro
    }
  };

  // Função chamada quando a animação de processamento termina
  const handleAnimacaoCompleta = () => {
    setMostrarAnimacaoProcessamento(false);
    // A navegação já foi feita na função finalizarTeste
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Barra de progresso superior */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800">
              {testeId === 'big-five' && 'Big Five'}
              {testeId === 'inteligencia-emocional' && 'Inteligência Emocional'}
              {testeId === 'clima-organizacional' && 'Clima Organizacional'}
              {testeId === 'karasek-siegrist' && 'Karasek-Siegrist'}
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
                  <span className="text-sm font-medium">{erroSalvamento}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card da pergunta */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
          {/* Header da pergunta */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Pergunta {perguntaAtual + 1}</h2>
                <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {pergunta.categoria}
                </span>
              </div>
            </div>
          </div>

          {/* Conteúdo da pergunta */}
          <div className="p-8">
            <p className="text-lg text-slate-700 mb-8 leading-relaxed">
              {pergunta.texto}
            </p>

            {/* Área de resposta */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800 text-center">
                Selecione sua resposta
              </h3>

              {/* Escala visual horizontal */}
              <div className="space-y-4">
                {/* Barra de progresso da escala */}
                <div className="w-full h-2 bg-gradient-to-r from-blue-500 via-gray-400 to-green-500 rounded-full"></div>
                
                {/* Indicadores da escala */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-500">Discordo</span>
                  <span className="text-sm font-medium text-gray-500">Neutro</span>
                  <span className="text-sm font-medium text-green-500">Concordo</span>
                </div>
              </div>

              {/* Botões de resposta */}
              <div className="flex justify-center gap-4 mt-8">
                {pergunta.escala.map((opcao, index) => {
                  const isSelected = respostas[pergunta.id] === index + 1;
                  const valor = index + 1;
                  
                  const getButtonColor = () => {
                    if (operacaoEmAndamento) {
                      return isSelected 
                        ? 'bg-slate-300 text-slate-500 border-slate-300' 
                        : 'bg-slate-100 text-slate-400 border-slate-200';
                    }
                    
                    switch (valor) {
                      case 1: return isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50';
                      case 2: return isSelected ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-200' : 'bg-white text-blue-500 border-blue-300 hover:bg-blue-50';
                      case 3: return isSelected ? 'bg-slate-600 text-white border-slate-600 shadow-lg shadow-slate-200' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50';
                      case 4: return isSelected ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-200' : 'bg-white text-green-500 border-green-300 hover:bg-green-50';
                      case 5: return isSelected ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-200' : 'bg-white text-green-600 border-green-300 hover:bg-green-50';
                      default: return 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50';
                    }
                  };

                  return (
                    <div key={index} className="flex flex-col items-center gap-3">
                      <button
                        className={`
                          w-16 h-16 rounded-lg border-2 font-bold text-lg
                          transition-all duration-300 ease-in-out
                          ${operacaoEmAndamento ? 'cursor-not-allowed' : 'transform hover:scale-110 active:scale-95'}
                          focus:outline-none focus:ring-4 focus:ring-blue-200
                          ${getButtonColor()}
                          ${operacaoEmAndamento ? 'opacity-60' : ''}
                        `}
                        onClick={() => !operacaoEmAndamento && handleResposta(valor)}
                        disabled={operacaoEmAndamento}
                        style={{
                          pointerEvents: operacaoEmAndamento ? 'none' : 'auto'
                        }}
                      >
                        {numeroParaLetra(valor)}
                      </button>
                      <span className={`text-xs font-medium text-center leading-tight max-w-20 ${
                        operacaoEmAndamento ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {opcao}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Feedback da seleção */}
              {jaRespondeu && !operacaoEmAndamento && (
                <div className="mt-8 p-4 bg-blue-600 text-white rounded-xl">
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">
                      Selecionado: {pergunta.escala[respostas[pergunta.id] - 1]}
                    </span>
                  </div>
                </div>
              )}

              {/* Botão de finalizar teste - aparece após responder a última pergunta */}
              {mostrarBotaoFinalizar && isUltimaPergunta && jaRespondeu && (
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      🎉 Parabéns! Você respondeu todas as perguntas
                    </h3>
                    <p className="text-green-700 mb-4">
                      Clique no botão abaixo para finalizar o teste e ver seus resultados
                    </p>
                    <Button
                      onClick={finalizarTeste}
                      disabled={operacaoEmAndamento}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {operacaoEmAndamento ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Finalizando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Finalizar Teste
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Aviso sobre bloqueio durante processamento */}
              {operacaoEmAndamento && (
                <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center justify-center gap-3 text-amber-700">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium text-sm">
                      Aguarde o processamento da resposta anterior antes de selecionar uma nova opção
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navegação inferior - Simplificada para avanço automático */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleAnterior}
              disabled={perguntaAtual === 0 || operacaoEmAndamento}
              className="px-6 py-2 border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-lg">
              <span className="font-medium">{Object.keys(respostas).length}</span>
              <span>de</span>
              <span className="font-medium">{perguntas.length}</span>
              <span>respondidas</span>
            </div>

            {/* Informação sobre avanço automático */}
            <div className="text-sm text-slate-500 text-center max-w-48">
              <p className="font-medium">Avanço Automático</p>
              <p className="text-xs">
                {operacaoEmAndamento ? 'Processando...' : 'Responda para avançar automaticamente'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Animação de processamento */}
      {mostrarAnimacaoProcessamento && (
        <ProcessingAnimation onComplete={handleAnimacaoCompleta} />
      )}
    </div>
  );
}