import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, Loader2, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/AuthContext";
import { obterTodasPerguntasInsight, escalaLikertInsight, calcularResultadoClimaBemEstar } from "@/lib/testes/clima-bem-estar";
import { climaBemEstarService } from "@/lib/services/clima-bem-estar-service";
import { processamentoService, respostasService, resultadosService } from "@/lib/database";
import { sessionService } from "@/lib/services/session-service";
import { supabase } from "@/lib/supabase";
import ProcessingAnimation from "@/components/ProcessingAnimation";

export default function TesteClimaBemEstarPerguntas() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const perguntas = obterTodasPerguntasInsight().map(pergunta => ({
    id: pergunta.id,
    texto: pergunta.texto,
    categoria: pergunta.dimensao,
    escala: escalaLikertInsight
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
      console.log('🔍 [PERGUNTAS-CLIMA] Iniciando salvamento da resposta:', { perguntaId, valor });
      
      // Usar o serviço específico do clima e bem-estar
      // Usuário anônimo: passar '' para que o serviço salve usuario_id como null
      await climaBemEstarService.salvarRespostaIndividual(
        user?.id || '',
        perguntaId,
        valor
      );
      
      console.log('✅ [PERGUNTAS-CLIMA] Resposta salva com sucesso');
      setRespostaSalva(true);
      return true;
      
    } catch (error) {
      console.error('❌ [PERGUNTAS-CLIMA] Erro no salvamento:', error);
      setErroSalvamento(error instanceof Error ? error.message : "Erro desconhecido");
      return false;
    } finally {
      setSalvandoResposta(false);
    }
  };

  // Função para vincular resultados anônimos ao usuário autenticado
  const vincularResultadosAoUsuario = async (sessionId: string, usuarioId: string) => {
    try {
      console.log('🔗 [CLIMA] Vinculando resultados anônimos ao usuário:', { sessionId, usuarioId });
      
      const { data, error } = await supabase.rpc('vincular_resultados_usuario_seguro', {
        p_session_id: sessionId,
        p_usuario_id: usuarioId
      });

      if (error) {
        console.error('❌ [CLIMA] Erro ao vincular resultados:', error);
        return;
      }

      console.log('✅ [CLIMA] Resultados vinculados com sucesso:', data);
    } catch (error) {
      console.error('❌ [CLIMA] Erro na vinculação de resultados:', error);
    }
  };

  // Função para finalizar o teste
  const finalizarTeste = async () => {
    console.log('🔍 [FINALIZAR-TESTE-CLIMA] Iniciando finalização do teste...');
    setProcessandoTeste(true);
    
    try {
      const tempoTotal = Date.now() - tempoInicio;
      console.log('🔍 [FINALIZAR-TESTE-CLIMA] Tempo total calculado:', tempoTotal);
      
      // Mostrar animação de processamento
      setMostrarAnimacaoProcessamento(true);
      console.log('🔍 [FINALIZAR-TESTE-CLIMA] Animação de processamento iniciada');
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('🔍 [FINALIZAR-TESTE-CLIMA] Processamento simulado concluído');
      
      // Processar e salvar resultado para obter ID único
      console.log('🔍 [FINALIZAR-TESTE-CLIMA] Processando resultado...');
      console.log('🔍 [FINALIZAR-TESTE-CLIMA] Respostas disponíveis:', respostas);
      console.log('🔍 [FINALIZAR-TESTE-CLIMA] Número de respostas:', Object.keys(respostas).length);
      
      // Obter session ID para possível vinculação
      const sessionId = sessionService.getSessionId();
      
      // Usar o serviço específico do clima e bem-estar
      const { resultado: resultadoSalvo, analise } = await climaBemEstarService.processarResultadoCompleto(
        user?.id || '', // usar ID do usuário se autenticado, senão string vazia para anônimo
        respostas,
        tempoTotal
      );
      
      console.log('✅ [FINALIZAR-TESTE-CLIMA] Resultado salvo com ID:', resultadoSalvo.id);
      console.log('✅ [FINALIZAR-TESTE-CLIMA] Análise calculada:', analise);

      // Se o usuário estava anônimo mas agora está autenticado, vincular os resultados
      if (user && sessionId && !user.id) {
        await vincularResultadosAoUsuario(sessionId, user.id);
      }

      // Salvar respostas individuais no banco de dados
      console.log('🔍 [FINALIZAR-TESTE-CLIMA] Salvando respostas individuais no banco...');
      // Mapear IDs numéricos para UUIDs das perguntas
      const perguntaIdMap: { [key: string]: string } = {
        '1': '11111111-1111-1111-1111-111111111111',
        '2': '11111111-1111-1111-1111-111111111112',
        '3': '11111111-1111-1111-1111-111111111113',
        '4': '11111111-1111-1111-1111-111111111114',
        '5': '11111111-1111-1111-1111-111111111115',
        '6': '11111111-1111-1111-1111-111111111116',
        '7': '11111111-1111-1111-1111-111111111117',
        '8': '11111111-1111-1111-1111-111111111118',
        '9': '11111111-1111-1111-1111-111111111119',
        '10': '11111111-1111-1111-1111-11111111111a',
        '11': '11111111-1111-1111-1111-11111111111b',
        '12': '11111111-1111-1111-1111-11111111111c',
        '13': '11111111-1111-1111-1111-11111111111d',
        '14': '11111111-1111-1111-1111-11111111111e',
        '15': '11111111-1111-1111-1111-11111111111f',
        '16': '11111111-1111-1111-1111-111111111120',
        '17': '11111111-1111-1111-1111-111111111121',
        '18': '11111111-1111-1111-1111-111111111122',
        '19': '11111111-1111-1111-1111-111111111123',
        '20': '11111111-1111-1111-1111-111111111124',
        '21': '11111111-1111-1111-1111-111111111125',
        '22': '11111111-1111-1111-1111-111111111126',
        '23': '11111111-1111-1111-1111-111111111127',
        '24': '11111111-1111-1111-1111-111111111128',
        '25': '11111111-1111-1111-1111-111111111129',
        '26': '11111111-1111-1111-1111-11111111112a',
        '27': '11111111-1111-1111-1111-11111111112b',
        '28': '11111111-1111-1111-1111-11111111112c',
        '29': '11111111-1111-1111-1111-11111111112d',
        '30': '11111111-1111-1111-1111-11111111112e',
        '31': '11111111-1111-1111-1111-11111111112f',
        '32': '11111111-1111-1111-1111-111111111130',
        '33': '11111111-1111-1111-1111-111111111131',
        '34': '11111111-1111-1111-1111-111111111132',
        '35': '11111111-1111-1111-1111-111111111133',
        '36': '11111111-1111-1111-1111-111111111134',
        '37': '11111111-1111-1111-1111-111111111135',
        '38': '11111111-1111-1111-1111-111111111136',
        '39': '11111111-1111-1111-1111-111111111137',
        '40': '11111111-1111-1111-1111-111111111138',
        '41': '11111111-1111-1111-1111-111111111139',
        '42': '11111111-1111-1111-1111-11111111113a',
        '43': '11111111-1111-1111-1111-11111111113b',
        '44': '11111111-1111-1111-1111-11111111113c',
        '45': '11111111-1111-1111-1111-11111111113d',
        '46': '11111111-1111-1111-1111-11111111113e',
        '47': '11111111-1111-1111-1111-11111111113f',
        '48': '11111111-1111-1111-1111-111111111140'
      };

      const respostasParaSalvar = Object.entries(respostas).map(([perguntaId, valor]) => ({
        resultado_id: resultadoSalvo.id,
        pergunta_id: perguntaIdMap[perguntaId] || perguntaId, // Usar UUID correspondente ou fallback para o ID original
        resposta: valor.toString(),
        pontuacao: valor,
        tempo_resposta: null
      }));
      
      try {
        await respostasService.salvarRespostas(respostasParaSalvar);
        console.log('✅ [FINALIZAR-TESTE-CLIMA] Respostas individuais salvas com sucesso');
      } catch (errorRespostas) {
        console.error('⚠️ [FINALIZAR-TESTE-CLIMA] Erro ao salvar respostas individuais:', errorRespostas);
        // Não bloquear o fluxo, mas registrar o erro
      }
      
      // Navegar para URL exclusiva com ID do resultado
      console.log('🔍 [FINALIZAR-TESTE-CLIMA] Iniciando navegação para resultado...');
      const urlDestino = `/resultado/clima-bem-estar/${resultadoSalvo.id}`;
      console.log('🔍 [FINALIZAR-TESTE-CLIMA] URL de destino:', urlDestino);
      
      navigate(urlDestino, {
        state: { 
          respostas,
          tempoTotal,
          perguntasRespondidas: Object.keys(respostas).length,
          resultadoId: resultadoSalvo.id
        }
      });
      
      console.log('✅ [FINALIZAR-TESTE-CLIMA] Navegação iniciada com sucesso');
      
    } catch (error) {
      console.error('❌ [FINALIZAR-TESTE-CLIMA] Erro capturado:', error);
      console.error('❌ [FINALIZAR-TESTE-CLIMA] Tipo do erro:', typeof error);
      console.error('❌ [FINALIZAR-TESTE-CLIMA] Nome do erro:', error instanceof Error ? error.name : 'Unknown');
      console.error('❌ [FINALIZAR-TESTE-CLIMA] Mensagem do erro:', error instanceof Error ? error.message : String(error));
      console.error('❌ [FINALIZAR-TESTE-CLIMA] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      
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
  };

  // Função para lidar com a resposta
  const handleResposta = async (valor: number) => {
    if (processandoResposta || operacaoEmAndamento) {
      console.log('🔍 [PERGUNTAS-CLIMA] Operação já em andamento, ignorando clique');
      return;
    }

    console.log('🔍 [PERGUNTAS-CLIMA] Processando resposta:', { perguntaId: pergunta.id, valor });
    setProcessandoResposta(true);
    setRespostaSalva(false);
    setErroSalvamento(null);

    // Atualizar estado local imediatamente
    setRespostas(prev => ({ ...prev, [pergunta.id]: valor }));

    // Salvar no banco de dados
    const sucesso = await salvarRespostaIndividual(pergunta.id, valor);

    if (sucesso) {
      // Mostrar feedback visual por um momento
      await new Promise(resolve => setTimeout(resolve, 500));

      if (isUltimaPergunta) {
        console.log('🔍 [PERGUNTAS-CLIMA] Última pergunta respondida, mostrando botão finalizar');
        setMostrarBotaoFinalizar(true);
        setProcessandoResposta(false);
      } else {
        // Avançar automaticamente para próxima pergunta
        console.log('🔍 [PERGUNTAS-CLIMA] Avançando automaticamente para próxima pergunta');
        setAvancandoAutomaticamente(true);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setPerguntaAtual(prev => prev + 1);
        setRespostaSalva(false);
        setAvancandoAutomaticamente(false);
        setProcessandoResposta(false);
      }
    } else {
      setProcessandoResposta(false);
      toast({
        title: "Erro ao salvar resposta",
        description: "Tente novamente ou continue para a próxima pergunta.",
        variant: "destructive",
      });
    }
  };

  // Função para voltar à pergunta anterior
  const voltarPergunta = () => {
    if (perguntaAtual > 0 && !operacaoEmAndamento) {
      setPerguntaAtual(prev => prev - 1);
      setRespostaSalva(false);
      setErroSalvamento(null);
      setMostrarBotaoFinalizar(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Barra de progresso superior */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800">
              HumaniQ Insight – Clima e Bem-Estar
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
                  const valor = index + 1; // O valor é baseado no índice (0->1, 1->2, 2->3, 3->4, 4->5)
                  const isSelected = respostas[pergunta.id] === valor;
                  const letras = ['A', 'B', 'C', 'D', 'E'];
                  const letra = letras[index]; // Usa o índice diretamente (0->A, 1->B, 2->C, 3->D, 4->E)
                  
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
                        {letra}
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
              onClick={voltarPergunta}
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