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
import { configPercepacaoAssedio, escalaLikertPAS } from '@/lib/testes/percepcao-assedio';
import { obterPerguntasPercepacaoAssedio } from '@/lib/services/perguntasPercepacaoAssedio';
import { salvarRespostaPercepacaoAssedio, finalizarTestePercepacaoAssedio } from '@/lib/services/resultadosPercepacaoAssedio';
import { obterSessaoAtual } from '@/lib/services/session-service';
import { supabase } from '@/lib/supabase';
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

// Mapeamento de valores para letras
const letras = ['A', 'B', 'C', 'D', 'E'];

// Escala de cores para as respostas
const escalaRespostas = [
  { valor: 1, texto: 'Discordo totalmente', cor: 'bg-red-500 hover:bg-red-600 text-white' },
  { valor: 2, texto: 'Discordo', cor: 'bg-orange-500 hover:bg-orange-600 text-white' },
  { valor: 3, texto: 'Neutro', cor: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
  { valor: 4, texto: 'Concordo', cor: 'bg-lime-500 hover:bg-lime-600 text-white' },
  { valor: 5, texto: 'Concordo totalmente', cor: 'bg-green-500 hover:bg-green-600 text-white' }
];

export default function TestePASPerguntas() {
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
  const [sessaoId, setSessaoId] = useState<string | null>(null);

  useEffect(() => {
    const inicializar = async () => {
      try {
        const sessao = await obterSessaoAtual();
        if (!sessao) {
          toast.error('Sessão não encontrada. Redirecionando...');
          navigate('/testes');
          return;
        }
        setSessaoId(sessao.sessionId);

        const perguntasData = await obterPerguntasPercepacaoAssedio();
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
        console.error('Erro ao carregar perguntas:', error);
        toast.error('Erro ao carregar o teste. Tente novamente.');
        navigate('/testes');
      }
    };

    inicializar();
  }, [navigate]);

  // Função para vincular resultados anônimos ao usuário autenticado
  // Nota: Esta função não é mais necessária pois o sistema agora salva resultados diretamente com autenticação
  const vincularResultadosAoUsuario = async (sessionId: string, usuarioId: string) => {
    console.log('🔗 [PAS] Vinculação automática (sistema já autentica diretamente):', { sessionId, usuarioId });
  };

  const handleResposta = async (valor: number) => {
    console.log('🔍 [PAS-PERGUNTAS] Clique detectado no botão:', valor);
    console.log('🔍 [PAS-PERGUNTAS] Estado atual - sessaoId:', sessaoId);
    console.log('🔍 [PAS-PERGUNTAS] Estado atual - perguntaAtual:', perguntaAtual);
    console.log('🔍 [PAS-PERGUNTAS] Estado atual - salvando:', salvando);
    
    if (!sessaoId) {
      console.error('❌ [PAS-PERGUNTAS] Erro: sessaoId não encontrado!');
      toast.error('Erro: Sessão não encontrada. Recarregue a página.');
      return;
    }

    if (salvando) {
      console.log('⚠️ [PAS-PERGUNTAS] Operação já em andamento, ignorando clique');
      return;
    }

    console.log('🔍 [PAS-PERGUNTAS] Iniciando salvamento da resposta...');
    setSalvando(true);
    
    try {
      console.log('🔍 [PAS-PERGUNTAS] Chamando salvarRespostaPercepacaoAssedio...');
      console.log('🔍 [PAS-PERGUNTAS] Parâmetros:', { perguntaId: perguntaAtual + 1, resposta: valor, sessaoId });
      
      // Salvar resposta individual
      await salvarRespostaPercepacaoAssedio(perguntaAtual + 1, valor, sessaoId);
      
      console.log('✅ [PAS-PERGUNTAS] Resposta salva com sucesso!');
      
      // Atualizar estado local
      setRespostas(prev => {
        const novasRespostas = {
          ...prev,
          [perguntaAtual + 1]: valor
        };
        console.log('🔍 [PAS-PERGUNTAS] Estado local atualizado:', novasRespostas);
        return novasRespostas;
      });

      // Feedback visual
      toast.success('Resposta salva!', {
        duration: 1000,
        icon: <CheckCircle className="h-4 w-4 text-green-600" />
      });

      console.log('🔍 [PAS-PERGUNTAS] Aguardando 1 segundo antes de avançar...');
      
      // Avançar automaticamente após 1 segundo
      setTimeout(() => {
        console.log('🔍 [PAS-PERGUNTAS] Executando avanço automático...');
        if (perguntaAtual < perguntas.length - 1) {
          console.log('🔍 [PAS-PERGUNTAS] Avançando para próxima pergunta:', perguntaAtual + 1);
          setPerguntaAtual(prev => prev + 1);
        } else {
          console.log('🔍 [PAS-PERGUNTAS] Última pergunta alcançada');
        }
        setSalvando(false);
        console.log('🔍 [PAS-PERGUNTAS] Estado salvando resetado');
      }, 1000);

    } catch (error) {
      console.error('❌ [PAS-PERGUNTAS] Erro ao salvar resposta:', error);
      console.error('❌ [PAS-PERGUNTAS] Tipo do erro:', typeof error);
      console.error('❌ [PAS-PERGUNTAS] Stack trace:', error instanceof Error ? error.stack : 'No stack');
      toast.error('Erro ao salvar resposta. Tente novamente.');
      setSalvando(false);
    }
  };

  const handleFinalizarTeste = async () => {
    if (!sessaoId) return;

    const respostasNaoRespondidas = perguntas.filter((_, index) => !respostas[index + 1]);
    
    if (respostasNaoRespondidas.length > 0) {
      toast.error(`Ainda há ${respostasNaoRespondidas.length} pergunta(s) sem resposta.`);
      return;
    }

    setFinalizando(true);
    setMostrarAnimacaoProcessamento(true);

    try {
      console.log('🔄 [PAS-FINALIZAR] Iniciando finalização do teste para sessão:', sessaoId);
      console.log('🔄 [PAS-FINALIZAR] Respostas disponíveis:', respostas);
      console.log('🔄 [PAS-FINALIZAR] Número de respostas:', Object.keys(respostas).length);
      
      const { resultado } = await finalizarTestePercepacaoAssedio(respostas);
      console.log('✅ [PAS-FINALIZAR] Resultado obtido:', resultado);
      console.log('🔍 [PAS-FINALIZAR] ID do resultado:', resultado?.id);
      
      // Se o usuário estava anônimo mas agora está autenticado, vincular os resultados
      if (user && sessaoId) {
        await vincularResultadosAoUsuario(sessaoId, user.id);
      }
      
      // Armazenamos o resultado no estado React
      setResultadoTeste(resultado);
    } catch (error) {
      console.error('❌ [PAS-FINALIZAR] Erro ao finalizar teste:', error);
      toast.error('Erro ao finalizar teste. Tente novamente.');
      setFinalizando(false);
      setMostrarAnimacaoProcessamento(false);
    }
  };

  const handleAnimacaoCompleta = () => {
    setMostrarAnimacaoProcessamento(false);
    console.log('🎬 [PAS-ANIMACAO] Animação completa, verificando resultado:', resultadoTeste);
    
    if (resultadoTeste && resultadoTeste.id) {
      console.log('✅ [PAS-ANIMACAO] Navegando para resultado com ID:', resultadoTeste.id);
      navigate(`/resultado/percepcao-assedio/${resultadoTeste.id}`);
    } else {
      console.error('❌ [PAS-ANIMACAO] Resultado inválido ou sem ID:', resultadoTeste);
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
          <h1 className="text-2xl font-bold text-gray-800">HumaniQ PAS Percepção de Assédio Moral e Sexual</h1>
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
                    <Badge className="bg-blue-500 text-white hover:bg-blue-600">
                      {pergunta.dimensao.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                      <span className="text-blue-600 text-sm">Discordo</span>
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
                          {letras[opcao.valor - 1]}
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
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg px-8"
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