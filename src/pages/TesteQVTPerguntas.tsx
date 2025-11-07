'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, Save, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/AuthContext';
import { obterPerguntasQVT, finalizarTesteQVT } from '@/lib/services/qualidadeVidaTrabalhoService';
import { sessionService } from '@/lib/services/session-service';
import { supabase } from '@/lib/supabase';
import { numeroParaLetra } from '@/lib/utils';
import ProcessingAnimation from '@/components/ProcessingAnimation';

interface Pergunta {
  id: number;
  texto: string;
  dimensao: string;
  tipo: string;
  opcoes: Array<{
    valor: number;
    texto: string;
    cor: string;
  }>;
}

// Escala de cores para as respostas QVT
const escalaRespostas = [
  { valor: 1, texto: 'Discordo totalmente', cor: 'bg-red-500 hover:bg-red-600 text-white' },
  { valor: 2, texto: 'Discordo', cor: 'bg-orange-500 hover:bg-orange-600 text-white' },
  { valor: 3, texto: 'Neutro', cor: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
  { valor: 4, texto: 'Concordo', cor: 'bg-lime-500 hover:bg-lime-600 text-white' },
  { valor: 5, texto: 'Concordo totalmente', cor: 'bg-green-500 hover:bg-green-600 text-white' }
];

export default function TesteQVTPerguntas() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [mostrarAnimacaoProcessamento, setMostrarAnimacaoProcessamento] = useState(false);
  const [resultadoTeste, setResultadoTeste] = useState<any>(null);

  useEffect(() => {
    const inicializar = async () => {
      try {
        const perguntasData = await obterPerguntasQVT();
        const perguntasFormatadas = perguntasData.map((p, index) => ({
          id: index + 1,
          texto: p.texto,
          dimensao: p.dimensao,
          tipo: p.tipo,
          opcoes: escalaRespostas
        }));
        
        setPerguntas(perguntasFormatadas);
        setCarregando(false);
      } catch (error) {
        console.error('Erro ao carregar perguntas QVT:', error);
        toast.error('Erro ao carregar o teste. Tente novamente.');
        navigate('/testes');
      }
    };

    inicializar();
  }, [navigate]);

  // Função para vincular resultados anônimos ao usuário autenticado
  const vincularResultadosAoUsuario = async (sessionId: string, usuarioId: string) => {
    try {
      console.log('🔗 [QVT] Vinculando resultados anônimos ao usuário:', { sessionId, usuarioId });
      
      const { data, error } = await supabase.rpc('vincular_resultados_usuario_seguro', {
        p_session_id: sessionId,
        p_usuario_id: usuarioId
      });

      if (error) {
        console.error('❌ [QVT] Erro ao vincular resultados:', error);
        return;
      }

      console.log('✅ [QVT] Resultados vinculados com sucesso:', data);
    } catch (error) {
      console.error('❌ [QVT] Erro na vinculação de resultados:', error);
    }
  };

  const handleResposta = async (valor: number) => {
    console.log('🔍 [QVT-PERGUNTAS] Clique detectado no botão:', valor);
    console.log('🔍 [QVT-PERGUNTAS] Estado atual - perguntaAtual:', perguntaAtual);
    console.log('🔍 [QVT-PERGUNTAS] Estado atual - salvando:', salvando);
    
    if (salvando) {
      console.log('⚠️ [QVT-PERGUNTAS] Operação já em andamento, ignorando clique');
      return;
    }

    console.log('🔍 [QVT-PERGUNTAS] Salvando resposta no estado local...');
    setSalvando(true);
    
    try {
      // Atualizar estado local imediatamente
      setRespostas(prev => {
        const novasRespostas = {
          ...prev,
          [perguntaAtual + 1]: valor
        };
        console.log('🔍 [QVT-PERGUNTAS] Estado local atualizado:', novasRespostas);
        return novasRespostas;
      });

      console.log('✅ [QVT-PERGUNTAS] Resposta salva com sucesso!');

      // Feedback visual
      toast.success('Resposta salva!', {
        duration: 500,
        icon: <CheckCircle className="h-4 w-4 text-green-600" />
      });

      console.log('🔍 [QVT-PERGUNTAS] Aguardando 500ms antes de avançar...');
      
      // Avançar automaticamente após 500ms
      setTimeout(() => {
        console.log('🔍 [QVT-PERGUNTAS] Executando avanço automático...');
        if (perguntaAtual < perguntas.length - 1) {
          console.log('🔍 [QVT-PERGUNTAS] Avançando para próxima pergunta:', perguntaAtual + 1);
          setPerguntaAtual(prev => prev + 1);
        } else {
          console.log('🔍 [QVT-PERGUNTAS] Última pergunta alcançada');
        }
        setSalvando(false);
        console.log('🔍 [QVT-PERGUNTAS] Estado salvando resetado');
      }, 500);

    } catch (error) {
      console.error('❌ [QVT-PERGUNTAS] Erro ao salvar resposta:', error);
      console.error('❌ [QVT-PERGUNTAS] Tipo do erro:', typeof error);
      console.error('❌ [QVT-PERGUNTAS] Stack trace:', error instanceof Error ? error.stack : 'No stack');
      toast.error('Erro ao salvar resposta. Tente novamente.');
      setSalvando(false);
    }
  };

  const handleFinalizarTeste = async () => {
    const respostasNaoRespondidas = perguntas.filter((_, index) => !respostas[index + 1]);
    
    if (respostasNaoRespondidas.length > 0) {
      toast.error(`Ainda há ${respostasNaoRespondidas.length} pergunta(s) sem resposta.`);
      return;
    }

    setFinalizando(true);
    setMostrarAnimacaoProcessamento(true);

    try {
      console.log('🔄 [QVT-FINALIZAR] Iniciando finalização do teste');
      console.log('🔄 [QVT-FINALIZAR] Respostas disponíveis:', respostas);
      console.log('🔄 [QVT-FINALIZAR] Número de respostas:', Object.keys(respostas).length);
      
      // Obter session ID para possível vinculação
      const sessionId = sessionService.getSessionId();
      
      const { resultado } = await finalizarTesteQVT(respostas);
      console.log('✅ [QVT-FINALIZAR] Resultado obtido:', resultado);
      console.log('🔍 [QVT-FINALIZAR] ID do resultado:', resultado?.id);

      // Se o usuário estava anônimo mas agora está autenticado, vincular os resultados
      if (user && sessionId && user.id) {
        await vincularResultadosAoUsuario(sessionId, user.id);
      }
      
      // Armazenamos o resultado no estado React
      setResultadoTeste(resultado);
    } catch (error) {
      console.error('❌ [QVT-FINALIZAR] Erro ao finalizar teste:', error);
      toast.error('Erro ao finalizar teste. Tente novamente.');
      setFinalizando(false);
      setMostrarAnimacaoProcessamento(false);
    }
  };

  const handleAnimacaoCompleta = () => {
    setMostrarAnimacaoProcessamento(false);
    console.log('🎬 [QVT-ANIMACAO] Animação completa, verificando resultado:', resultadoTeste);
    
    if (resultadoTeste && resultadoTeste.id) {
      console.log('✅ [QVT-ANIMACAO] Navegando para resultado com ID:', resultadoTeste.id);
      navigate(`/resultado/qualidade-vida-trabalho/${resultadoTeste.id}`);
    } else {
      console.error('❌ [QVT-ANIMACAO] Resultado inválido ou sem ID:', resultadoTeste);
      toast.error('Erro: Resultado do teste não foi encontrado. Redirecionando...');
      // Fallback: redirecionar para página de testes ou erro
      setTimeout(() => {
        navigate('/testes');
      }, 2000);
    }
  };

  const handleVoltarPergunta = () => {
    if (perguntaAtual > 0) {
      setPerguntaAtual(prev => prev - 1);
    }
  };

  const handleProximaPergunta = () => {
    if (perguntaAtual < perguntas.length - 1) {
      setPerguntaAtual(prev => prev + 1);
    }
  };

  const progresso = ((Object.keys(respostas).length) / perguntas.length) * 100;
  const perguntasRespondidas = Object.keys(respostas).length;

  if (carregando) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Carregando perguntas...</p>
        </div>
      </div>
    );
  }

  if (perguntas.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Nenhuma pergunta encontrada.</p>
          <Button onClick={() => navigate('/testes')} className="mt-4">
            Voltar aos Testes
          </Button>
        </div>
      </div>
    );
  }

  const pergunta = perguntas[perguntaAtual];
  const respostaAtual = respostas[pergunta.id];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header Simplificado */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">HumaniQ QVT - Qualidade de Vida no Trabalho</h1>
          <span className="text-gray-600 font-medium">{perguntaAtual + 1} de {perguntas.length}</span>
        </div>

        {/* Barra de Progresso Simples */}
        <div className="mb-6">
          <Progress value={progresso} className="h-1 bg-gray-200" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={perguntaAtual}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Pergunta {perguntaAtual + 1}</h2>
                    <Badge className="bg-purple-500 text-white hover:bg-purple-600">
                      {pergunta.dimensao}
                    </Badge>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    {pergunta.texto}
                  </p>
                </div>

                {/* Escala de Respostas */}
                <div className="space-y-6">
                  <p className="text-gray-800 text-center font-medium">
                    Selecione sua resposta
                  </p>
                  
                  {/* Gradiente Visual */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-4">
                      <span className="text-red-600 text-sm">Discordo</span>
                      <span className="text-gray-600 text-sm">Neutro</span>
                      <span className="text-green-600 text-sm">Concordo</span>
                    </div>
                    <div className="h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full mx-4"></div>
                  </div>

                  {/* Botões de Resposta */}
                  <div className="flex justify-evenly">
                    {escalaRespostas.map((opcao) => (
                      <div key={opcao.valor} className="text-center">
                        <motion.button
                          onClick={() => handleResposta(opcao.valor)}
                          disabled={salvando || finalizando}
                          className={`w-12 h-12 rounded-lg border-2 font-bold text-lg transition-all duration-300 ${
                            respostaAtual === opcao.valor
                              ? `${opcao.cor} border-white scale-110 shadow-lg`
                              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:shadow-md'
                          } ${salvando || finalizando ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          whileHover={!salvando && !finalizando ? { scale: 1.1 } : {}}
                          whileTap={!salvando && !finalizando ? { scale: 0.95 } : {}}
                        >
                          {numeroParaLetra(opcao.valor)}
                        </motion.button>
                        <p className={`text-xs mt-2 ${
                          respostaAtual === opcao.valor ? 'text-white font-medium' : 'text-gray-600'
                        }`}>
                          {opcao.texto}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {salvando && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex items-center justify-center gap-2 text-emerald-400"
                  >
                    <Save className="h-5 w-5 animate-pulse" />
                    <span className="font-medium">Salvando resposta...</span>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navegação Inferior */}
        <div className="flex items-center justify-between">
          {/* Botão Anterior */}
          <div className="flex-1">
            {perguntaAtual > 0 && (
              <Button
                variant="outline"
                onClick={handleVoltarPergunta}
                disabled={salvando || finalizando}
                className="bg-white border-gray-300 hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            )}
          </div>

          {/* Contador Central */}
          <div className="flex-1 text-center">
            <p className="text-gray-600 font-medium">
              {perguntasRespondidas} de {perguntas.length} respondidas
            </p>
          </div>

          {/* Avanço Automático */}
          <div className="flex-1 text-right">
            <div className="text-gray-600">
              <p className="font-medium">Avanço Automático</p>
              <p className="text-sm text-gray-500">Responda para avançar automaticamente</p>
            </div>
          </div>
        </div>

        {/* Botão Finalizar (quando na última pergunta) */}
        {perguntaAtual === perguntas.length - 1 && perguntasRespondidas === perguntas.length && (
          <div className="mt-8 text-center">
            <Button
              onClick={handleFinalizarTeste}
              disabled={finalizando}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg px-8"
            >
              {finalizando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Finalizando...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Finalizar Teste
                </>
              )}
            </Button>
          </div>
        )}

        {/* Animação de Processamento */}
        {mostrarAnimacaoProcessamento && (
          <ProcessingAnimation onComplete={handleAnimacaoCompleta} />
        )}

      </div>
    </div>
  );
}