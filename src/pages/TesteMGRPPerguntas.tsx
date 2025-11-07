import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, Loader2, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/AuthContext";
import { obterPerguntasMaturidadeRiscosPsicossociais, calcularResultadoMaturidadeRiscosPsicossociais } from "@/lib/testes/maturidade-riscos-psicossociais";
import { processamentoService, respostasService, resultadosService } from "@/lib/database";
import { sessionService } from "@/lib/services/session-service";
import { supabase } from "@/lib/supabase";
import { numeroParaLetra } from "@/lib/utils";
import ProcessingAnimation from "@/components/ProcessingAnimation";

export default function TesteMGRPPerguntas() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const perguntas = obterPerguntasMaturidadeRiscosPsicossociais().map(pergunta => ({
    id: pergunta.id,
    texto: pergunta.texto,
    categoria: pergunta.dimensao,
    escala: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'] // Escala Likert 1-5 para maturidade
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
      console.log('🔍 [PERGUNTAS-MGRP] Iniciando salvamento da resposta:', { perguntaId, valor });
      
      // Simular salvamento (implementar serviço real posteriormente)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('✅ [PERGUNTAS-MGRP] Resposta salva com sucesso');
      setRespostaSalva(true);
      return true;
      
    } catch (error) {
      console.error('❌ [PERGUNTAS-MGRP] Erro no salvamento:', error);
      setErroSalvamento(error instanceof Error ? error.message : "Erro desconhecido");
      return false;
    } finally {
      setSalvandoResposta(false);
    }
  };

  // Função para vincular resultados anônimos ao usuário autenticado
  const vincularResultadosAoUsuario = async (sessionId: string, usuarioId: string) => {
    try {
      console.log('🔗 [MGRP] Vinculando resultados anônimos ao usuário:', { sessionId, usuarioId });
      
      const { data, error } = await supabase.rpc('vincular_resultados_usuario_seguro', {
        p_session_id: sessionId,
        p_usuario_id: usuarioId
      });

      if (error) {
        console.error('❌ [MGRP] Erro ao vincular resultados:', error);
        return;
      }

      console.log('✅ [MGRP] Resultados vinculados com sucesso:', data);
    } catch (error) {
      console.error('❌ [MGRP] Erro na vinculação de resultados:', error);
    }
  };

  // Função para finalizar o teste
  const finalizarTeste = async () => {
    console.log('🔍 [FINALIZAR-TESTE-MGRP] Iniciando finalização do teste...');
    setProcessandoTeste(true);
    
    try {
      const tempoTotal = Date.now() - tempoInicio;
      console.log('🔍 [FINALIZAR-TESTE-MGRP] Tempo total calculado:', tempoTotal);
      
      // Mostrar animação de processamento
      setMostrarAnimacaoProcessamento(true);
      console.log('🔍 [FINALIZAR-TESTE-MGRP] Animação de processamento iniciada');
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('🔍 [FINALIZAR-TESTE-MGRP] Processamento simulado concluído');
      
      // Processar e salvar resultado para obter ID único
      console.log('🔍 [FINALIZAR-TESTE-MGRP] Processando resultado...');
      console.log('🔍 [FINALIZAR-TESTE-MGRP] Respostas disponíveis:', respostas);
      console.log('🔍 [FINALIZAR-TESTE-MGRP] Número de respostas:', Object.keys(respostas).length);
      
      const analiseMaturidade = calcularResultadoMaturidadeRiscosPsicossociais(respostas);
      console.log('🔍 [FINALIZAR-TESTE-MGRP] Análise calculada:', analiseMaturidade);
      
      // Preparar dados para salvar
      const sessionId = sessionService.getSessionId();
      console.log('🔍 [FINALIZAR-TESTE-MGRP] Session ID obtido:', sessionId);
      
      const dadosResultado = {
        usuario_id: user?.id || null,
        session_id: sessionId,
        pontuacao_total: Math.round(analiseMaturidade.pontuacaoGeral * 100) / 100,
        tempo_gasto: tempoTotal || 0,
        status: 'concluido' as const,
        metadados: {
          tipo_teste: 'maturidade-riscos-psicossociais',
          teste_nome: 'HumaniQ MGRP – Maturidade em Gestão de Riscos Psicossociais',
          pontuacoes_dimensoes: Object.keys(analiseMaturidade.dimensoes).reduce((acc, key) => {
            acc[key] = analiseMaturidade.dimensoes[key]?.pontuacao || 0;
            return acc;
          }, {} as Record<string, number>),
          analise_completa: analiseMaturidade,
          versao_teste: '1.0',
          timestamp_processamento: new Date().toISOString(),
          perguntas_respondidas: Object.keys(respostas).length
        }
      };

      console.log('🔍 [FINALIZAR-TESTE-MGRP] Dados preparados para salvamento:', dadosResultado);

      // Salvar resultado e obter ID único
      console.log('🔍 [FINALIZAR-TESTE-MGRP] Iniciando chamada para salvarResultado...');
      const resultadoSalvo = await resultadosService.salvarResultado(dadosResultado);
      console.log('✅ [FINALIZAR-TESTE-MGRP] Resultado salvo com ID:', resultadoSalvo.id);

      // Se o usuário estava anônimo mas agora está autenticado, vincular os resultados
      if (user && !dadosResultado.usuario_id) {
        await vincularResultadosAoUsuario(sessionId, user.id);
      }

      // Salvar respostas individuais no banco de dados
      console.log('🔍 [FINALIZAR-TESTE-MGRP] Salvando respostas individuais no banco...');
      const respostasParaSalvar = Object.entries(respostas).map(([perguntaId, valor]) => ({
        resultado_id: resultadoSalvo.id,
        pergunta_id: perguntaId,
        resposta: valor.toString(),
        pontuacao: valor,
        tempo_resposta: null
      }));
      
      try {
        await respostasService.salvarRespostas(respostasParaSalvar);
        console.log('✅ [FINALIZAR-TESTE-MGRP] Respostas individuais salvas com sucesso');
      } catch (errorRespostas) {
        console.error('⚠️ [FINALIZAR-TESTE-MGRP] Erro ao salvar respostas individuais:', errorRespostas);
      }
      
      // Navegar para URL exclusiva com ID do resultado
      console.log('🔍 [FINALIZAR-TESTE-MGRP] Iniciando navegação para resultado...');
      const urlDestino = `/resultado/maturidade-riscos-psicossociais/${resultadoSalvo.id}`;
      console.log('🔍 [FINALIZAR-TESTE-MGRP] URL de destino:', urlDestino);
      
      navigate(urlDestino, {
        state: { 
          respostas,
          tempoTotal,
          perguntasRespondidas: Object.keys(respostas).length,
          resultadoId: resultadoSalvo.id
        }
      });
      
      console.log('✅ [FINALIZAR-TESTE-MGRP] Navegação iniciada com sucesso');
      
    } catch (error) {
      console.error('❌ [FINALIZAR-TESTE-MGRP] Erro capturado:', error);
      
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Barra de progresso superior */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800">
              HumaniQ MGRP – Maturidade em Gestão de Riscos Psicossociais
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
                  <span className="text-sm font-medium text-red-600">Nunca</span>
                  <div 
                    className="h-2 w-80 rounded-full"
                    style={{
                      background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #16a34a)'
                    }}
                  ></div>
                  <span className="text-sm font-medium text-green-600">Sempre</span>
                </div>
              </div>
              
              <div className="flex justify-center items-start gap-6 mt-8">
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
                      case 1: return isSelected ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'bg-white text-red-600 border-red-300 hover:bg-red-50';
                      case 2: return isSelected ? 'bg-orange-500 text-white border-orange-500 shadow-lg' : 'bg-white text-orange-500 border-orange-300 hover:bg-orange-50';
                      case 3: return isSelected ? 'bg-yellow-500 text-white border-yellow-500 shadow-lg' : 'bg-white text-yellow-600 border-yellow-300 hover:bg-yellow-50';
                      case 4: return isSelected ? 'bg-green-500 text-white border-green-500 shadow-lg' : 'bg-white text-green-500 border-green-300 hover:bg-green-50';
                      case 5: return isSelected ? 'bg-green-600 text-white border-green-600 shadow-lg' : 'bg-white text-green-600 border-green-300 hover:bg-green-50';
                      default: return 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50';
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