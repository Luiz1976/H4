import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, Loader2, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { obterTodasPerguntasKS, escalaLikert4, escalaLikert5, calcularResultadoKarasekSiegrist } from "@/lib/testes/karasek-siegrist";
import { karasekSiegristService } from "@/lib/services/karasek-siegrist-service";
import { processamentoService, respostasService, resultadosService } from "@/lib/database";
import { sessionService } from "@/lib/services/session-service";
import { numeroParaLetra } from "@/lib/utils";
import ProcessingAnimation from "@/components/ProcessingAnimation";

export default function TesteKarasekSiegristPerguntas() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [perguntas, setPerguntas] = useState<any[]>([]);
  const [carregandoPerguntas, setCarregandoPerguntas] = useState(true);
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
  
  // Buscar perguntas do banco de dados
  useEffect(() => {
    const buscarPerguntas = async () => {
      try {
        setCarregandoPerguntas(true);
        const response = await fetch('/api/testes/3d9f4a0b-5c6e-7f8a-9d0e-1f2a3b4c5d6e/perguntas');
        const data = await response.json();
        
        if (data.perguntas) {
          // Mapear perguntas do banco de dados para o formato esperado
          const perguntasMapeadas = data.perguntas.map((p: any) => ({
            id: p.ordem, // Usar ordem como ID para manter compatibilidade
            texto: p.texto,
            categoria: 'karasek-siegrist',
            escala: p.opcoes ? Object.values(p.opcoes) : escalaLikert5,
            perguntaDbId: p.id // ID real do banco de dados
          }));
          
          console.log(`✅ [PERGUNTAS] ${perguntasMapeadas.length} perguntas carregadas do banco de dados`);
          setPerguntas(perguntasMapeadas);
        }
      } catch (error) {
        console.error('❌ [PERGUNTAS] Erro ao buscar perguntas:', error);
        toast({
          title: "Erro ao carregar perguntas",
          description: "Não foi possível carregar as perguntas do teste.",
          variant: "destructive"
        });
      } finally {
        setCarregandoPerguntas(false);
      }
    };
    
    buscarPerguntas();
  }, [toast]);

  // Resetar estados quando mudar de pergunta
  useEffect(() => {
    setRespostaSalva(false);
    setErroSalvamento(null);
    setProcessandoResposta(false);
  }, [perguntaAtual]);
  
  if (carregandoPerguntas) {
    return (
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-muted-foreground">Carregando perguntas...</p>
      </div>
    );
  }
  
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
      console.log('🔍 [PERGUNTAS] Iniciando salvamento da resposta:', { perguntaId, valor });
      
      // Usar o serviço real em vez da simulação
      const sucesso = await karasekSiegristService.salvarRespostaIndividual(perguntaId, valor);
      
      if (sucesso) {
        console.log('✅ [PERGUNTAS] Resposta salva com sucesso');
        setRespostaSalva(true);
        return true;
      } else {
        console.error('❌ [PERGUNTAS] Falha no salvamento da resposta');
        throw new Error("Falha no salvamento da resposta");
      }
      
    } catch (error) {
      console.error('❌ [PERGUNTAS] Erro no salvamento:', error);
      setErroSalvamento(error instanceof Error ? error.message : "Erro desconhecido");
      return false;
    } finally {
      setSalvandoResposta(false);
    }
  };

  // Função para finalizar o teste
  const finalizarTeste = async () => {
    console.log('🔍 [FINALIZAR-TESTE] Iniciando finalização do teste...');
    setProcessandoTeste(true);
    
    try {
      const tempoTotal = Date.now() - tempoInicio;
      console.log('🔍 [FINALIZAR-TESTE] Tempo total calculado:', tempoTotal);
      
      // Mostrar animação de processamento
      setMostrarAnimacaoProcessamento(true);
      console.log('🔍 [FINALIZAR-TESTE] Animação de processamento iniciada');
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('🔍 [FINALIZAR-TESTE] Processamento simulado concluído');
      
      // Processar e salvar resultado para obter ID único
      console.log('🔍 [FINALIZAR-TESTE] Processando resultado...');
      console.log('🔍 [FINALIZAR-TESTE] Respostas disponíveis:', respostas);
      console.log('🔍 [FINALIZAR-TESTE] Número de respostas:', Object.keys(respostas).length);
      
      const analiseKarasek = calcularResultadoKarasekSiegrist(respostas);
      console.log('🔍 [FINALIZAR-TESTE] Análise calculada:', analiseKarasek);
      
      // Preparar dados para salvar
      const sessionId = sessionService.getSessionId();
      console.log('🔍 [FINALIZAR-TESTE] Session ID obtido:', sessionId);
      
      const dadosResultado = {
        usuario_id: null,
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
          analise_completa: analiseKarasek,
          versao_teste: '1.0',
          timestamp_processamento: new Date().toISOString(),
          perguntas_respondidas: Object.keys(respostas).length
        }
      };

      console.log('🔍 [FINALIZAR-TESTE] Dados preparados para salvamento:', dadosResultado);
      console.log('🔍 [FINALIZAR-TESTE] Verificando resultadosService:', typeof resultadosService);
      console.log('🔍 [FINALIZAR-TESTE] Verificando salvarResultado:', typeof resultadosService.salvarResultado);

      // Salvar resultado e obter ID único
      console.log('🔍 [FINALIZAR-TESTE] Iniciando chamada para salvarResultado...');
      const resultadoSalvo = await resultadosService.salvarResultado(dadosResultado);
      console.log('✅ [FINALIZAR-TESTE] Resultado salvo com ID:', resultadoSalvo.id);
      console.log('✅ [FINALIZAR-TESTE] Dados completos do resultado salvo:', resultadoSalvo);

      // Salvar respostas individuais no banco de dados
      console.log('🔍 [FINALIZAR-TESTE] Salvando respostas individuais no banco...');
      const respostasParaSalvar = Object.entries(respostas).map(([perguntaId, valor]) => ({
        resultado_id: resultadoSalvo.id,
        pergunta_id: perguntaId, // Será convertido para UUID no banco se necessário
        resposta: valor.toString(),
        pontuacao: valor,
        tempo_resposta: null
      }));
      
      try {
        await respostasService.salvarRespostas(respostasParaSalvar);
        console.log('✅ [FINALIZAR-TESTE] Respostas individuais salvas com sucesso');
      } catch (errorRespostas) {
        console.error('⚠️ [FINALIZAR-TESTE] Erro ao salvar respostas individuais:', errorRespostas);
        // Não bloquear o fluxo, mas registrar o erro
      }
      
      // Navegar para URL exclusiva com ID do resultado
      console.log('🔍 [FINALIZAR-TESTE] Iniciando navegação para resultado...');
      const urlDestino = `/resultado/karasek-siegrist/${resultadoSalvo.id}`;
      console.log('🔍 [FINALIZAR-TESTE] URL de destino:', urlDestino);
      
      navigate(urlDestino, {
        state: { 
          respostas,
          tempoTotal,
          perguntasRespondidas: Object.keys(respostas).length,
          resultadoId: resultadoSalvo.id
        }
      });
      
      console.log('✅ [FINALIZAR-TESTE] Navegação iniciada com sucesso');
      
    } catch (error) {
      console.error('❌ [FINALIZAR-TESTE] Erro capturado:', error);
      console.error('❌ [FINALIZAR-TESTE] Tipo do erro:', typeof error);
      console.error('❌ [FINALIZAR-TESTE] Nome do erro:', error instanceof Error ? error.name : 'Unknown');
      console.error('❌ [FINALIZAR-TESTE] Mensagem do erro:', error instanceof Error ? error.message : String(error));
      console.error('❌ [FINALIZAR-TESTE] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Barra de progresso superior */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800">
              HumaniQ - Karasek-Siegrist
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
            <div className="inline-block bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full">
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
                  <span className="text-sm font-medium text-blue-600">Discordo</span>
                  <div 
                    className="h-2 w-80 rounded-full"
                    style={{
                      background: 'linear-gradient(to right, #3b82f6, #60a5fa, #9ca3af, #4ade80, #22c55e)'
                    }}
                  ></div>
                  <span className="text-sm font-medium text-green-600">Concordo</span>
                </div>
              </div>
              
              <div className="flex justify-center items-start gap-6 mt-8">
                {(pergunta.escala === 'likert4' ? escalaLikert4 : escalaLikert5).map((opcao, index) => {
                  const isSelected = respostas[pergunta.id] === index + 1;
                  const valor = index + 1;
                  const totalOpcoes = pergunta.escala === 'likert4' ? 4 : 5;
                  
                  const getButtonColor = () => {
                    if (operacaoEmAndamento) {
                      return isSelected 
                        ? 'bg-slate-300 text-slate-500 border-slate-300' 
                        : 'bg-slate-100 text-slate-400 border-slate-200';
                    }
                    
                    if (totalOpcoes === 4) {
                      switch (valor) {
                        case 1: return isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50';
                        case 2: return isSelected ? 'bg-blue-400 text-white border-blue-400 shadow-lg' : 'bg-white text-blue-400 border-blue-300 hover:bg-blue-50';
                        case 3: return isSelected ? 'bg-green-400 text-white border-green-400 shadow-lg' : 'bg-white text-green-400 border-green-300 hover:bg-green-50';
                        case 4: return isSelected ? 'bg-green-600 text-white border-green-600 shadow-lg' : 'bg-white text-green-600 border-green-300 hover:bg-green-50';
                        default: return 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50';
                      }
                    } else {
                      switch (valor) {
                        case 1: return isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50';
                        case 2: return isSelected ? 'bg-blue-400 text-white border-blue-400 shadow-lg' : 'bg-white text-blue-400 border-blue-300 hover:bg-blue-50';
                        case 3: return isSelected ? 'bg-gray-500 text-white border-gray-500 shadow-lg' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50';
                        case 4: return isSelected ? 'bg-green-400 text-white border-green-400 shadow-lg' : 'bg-white text-green-400 border-green-300 hover:bg-green-50';
                        case 5: return isSelected ? 'bg-green-600 text-white border-green-600 shadow-lg' : 'bg-white text-green-600 border-green-300 hover:bg-green-50';
                        default: return 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50';
                      }
                    }
                  };

                  const getLabelText = () => {
                    if (totalOpcoes === 4) {
                      switch (valor) {
                        case 1: return 'Discordo totalmente';
                        case 2: return 'Discordo';
                        case 3: return 'Concordo';
                        case 4: return 'Concordo totalmente';
                        default: return opcao;
                      }
                    } else {
                      switch (valor) {
                        case 1: return 'Discordo totalmente';
                        case 2: return 'Discordo';
                        case 3: return 'Neutro';
                        case 4: return 'Concordo';
                        case 5: return 'Concordo totalmente';
                        default: return opcao;
                      }
                    }
                  };

                  return (
                    <div key={index} className="flex flex-col items-center gap-2">
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
                      <span className={`text-xs font-medium text-center leading-tight w-20 ${
                        operacaoEmAndamento ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {getLabelText()}
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
                      disabled={processandoTeste}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
                    >
                      {processandoTeste ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processando Resultados...
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
            </div>
          </CardContent>
        </Card>
        
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