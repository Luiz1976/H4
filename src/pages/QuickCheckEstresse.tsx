import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, Loader2, ArrowLeft, AlertCircle, Clock, 
  Sparkles, Shield, Users, Target, AlertTriangle, TrendingUp,
  FileText, Award, Clock3, Zap, BarChart3
} from 'lucide-react';
import { numeroParaLetra } from '@/lib/utils';
import LoadingAnimation from '@/components/LoadingAnimation';
import ProcessingAnimation from '@/components/ProcessingAnimation';

const perguntasQuickCheck = [
  { 
    id: 1, 
    texto: "Sinto que a pressão no meu trabalho é constante e difícil de manejar.",
    dimensao: "estresse"
  },
  { 
    id: 2, 
    texto: "Tenho dificuldades para desligar mentalmente das tarefas ao final do expediente.",
    dimensao: "estresse"
  },
  { 
    id: 3, 
    texto: "Frequentemente me sinto sobrecarregado(a) com as responsabilidades profissionais.",
    dimensao: "estresse"
  },
  { 
    id: 4, 
    texto: "Sinto que o meu trabalho interfere negativamente no meu descanso e sono.",
    dimensao: "estresse"
  },
  { 
    id: 5, 
    texto: "Me sinto emocionalmente exaurido(a) devido às demandas profissionais.",
    dimensao: "burnout"
  },
  { 
    id: 6, 
    texto: "Sinto-me frequentemente exausto(a) ao final do dia de trabalho.",
    dimensao: "burnout"
  },
  { 
    id: 7, 
    texto: "Sinto que não consigo manter um equilíbrio saudável entre trabalho e vida pessoal.",
    dimensao: "resiliencia"
  }
];

const opcoesResposta = [
  "Discordo totalmente",
  "Discordo",
  "Neutro",
  "Concordo",
  "Concordo totalmente"
];

type EstagioTeste = 'loading' | 'perguntas' | 'processando' | 'resultado';

export default function QuickCheckEstresse() {
  const navigate = useNavigate();
  const [estagio, setEstagio] = useState<EstagioTeste>('loading');
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [salvandoResposta, setSalvandoResposta] = useState(false);
  const [respostaSalva, setRespostaSalva] = useState(false);
  const [avancandoAutomaticamente, setAvancandoAutomaticamente] = useState(false);
  const [processandoResposta, setProcessandoResposta] = useState(false);
  const [mostrarBotaoFinalizar, setMostrarBotaoFinalizar] = useState(false);
  const [pontuacaoTotal, setPontuacaoTotal] = useState(0);
  const [classificacao, setClassificacao] = useState('');
  const [cor, setCor] = useState('');

  const pergunta = perguntasQuickCheck[perguntaAtual];
  const progresso = ((perguntaAtual + 1) / perguntasQuickCheck.length) * 100;
  const jaRespondeu = respostas[pergunta.id] !== undefined;
  const isUltimaPergunta = perguntaAtual === perguntasQuickCheck.length - 1;
  const operacaoEmAndamento = salvandoResposta || avancandoAutomaticamente || processandoResposta;

  useEffect(() => {
    setRespostaSalva(false);
    setProcessandoResposta(false);
  }, [perguntaAtual]);

  const handleLoadingComplete = () => {
    setEstagio('perguntas');
  };

  const handleResposta = async (valor: number) => {
    if (operacaoEmAndamento) {
      console.log('Operação já em andamento, ignorando clique');
      return;
    }

    setProcessandoResposta(true);

    try {
      setRespostas(prev => ({
        ...prev,
        [pergunta.id]: valor
      }));

      setSalvandoResposta(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setSalvandoResposta(false);
      setRespostaSalva(true);

      await new Promise(resolve => setTimeout(resolve, 1500));

      if (!isUltimaPergunta) {
        setAvancandoAutomaticamente(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setPerguntaAtual(prev => prev + 1);
        setAvancandoAutomaticamente(false);
        setRespostaSalva(false);
      } else {
        setMostrarBotaoFinalizar(true);
      }
    } finally {
      setProcessandoResposta(false);
    }
  };

  const handleAnterior = () => {
    if (perguntaAtual > 0 && !operacaoEmAndamento) {
      setPerguntaAtual(prev => prev - 1);
      setMostrarBotaoFinalizar(false);
    }
  };

  const finalizarTeste = () => {
    setEstagio('processando');
  };

  const handleProcessamentoCompleto = () => {
    calcularResultado();
    setEstagio('resultado');
  };

  const calcularResultado = () => {
    const valores = Object.values(respostas);
    const soma = valores.reduce((acc, val) => acc + val, 0);
    const media = soma / valores.length;
    setPontuacaoTotal(media);

    if (media <= 2.0) {
      setClassificacao('Baixo Risco');
      setCor('text-green-600');
    } else if (media <= 3.5) {
      setClassificacao('Risco Moderado');
      setCor('text-yellow-600');
    } else if (media <= 4.5) {
      setClassificacao('Alto Risco');
      setCor('text-orange-600');
    } else {
      setClassificacao('Risco Crítico');
      setCor('text-red-600');
    }
  };

  const getButtonColor = (valor: number) => {
    const isSelected = respostas[pergunta.id] === valor;
    
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

  if (estagio === 'loading') {
    return <LoadingAnimation onComplete={handleLoadingComplete} testName="Quick Check - Estresse Ocupacional" duration={6000} />;
  }

  if (estagio === 'processando') {
    return <ProcessingAnimation onComplete={handleProcessamentoCompleto} />;
  }

  if (estagio === 'resultado') {
    const porcentagemRisco = (pontuacaoTotal / 5) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 p-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <Card className="border-none shadow-2xl bg-white/80 backdrop-blur">
            <CardContent className="p-8 space-y-6">
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
                </motion.div>
                <h1 className="text-3xl font-bold text-gray-800">Análise Concluída!</h1>
                <p className="text-gray-600">Seu nível de estresse ocupacional foi identificado</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Classificação</p>
                      <p className={`text-4xl font-bold ${cor}`}>{classificacao}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Índice de Estresse</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-5xl font-bold ${cor}`}>
                          {pontuacaoTotal.toFixed(1)}
                        </span>
                        <span className="text-2xl text-gray-400">/5.0</span>
                      </div>
                    </div>
                    <Progress value={porcentagemRisco} className="h-3" />
                  </CardContent>
                </Card>

                <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-800">O que isso significa?</h3>
                        <p className="text-sm text-gray-600">
                          {pontuacaoTotal <= 2.0 && "Seu nível de estresse está controlado. Continue mantendo hábitos saudáveis."}
                          {pontuacaoTotal > 2.0 && pontuacaoTotal <= 3.5 && "Atenção: Você apresenta sinais moderados de estresse. É importante monitorar."}
                          {pontuacaoTotal > 3.5 && pontuacaoTotal <= 4.5 && "Alerta: Alto nível de estresse detectado. Recomendamos ações imediatas."}
                          {pontuacaoTotal > 4.5 && "Crítico: Nível de estresse muito elevado. Intervenção urgente recomendada."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-800">Esta é apenas uma prévia!</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    A avaliação completa da HumaniQ AI analisa <strong>38 dimensões psicossociais</strong>, 
                    gera relatórios profissionais em PDF, identifica riscos críticos e oferece 
                    planos de ação personalizados conforme a NR-01.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3 pt-2">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <Shield className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                      <p className="text-xs font-medium">Conformidade NR-01</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-xs font-medium">Gestão de Equipes</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <Target className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                      <p className="text-xs font-medium">Planos de Ação</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mensagem personalizada baseada no risco */}
              {pontuacaoTotal > 3.5 && (
                <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <h3 className="font-semibold text-red-800">Atenção: Ação Recomendada</h3>
                    </div>
                    <p className="text-sm text-red-700">
                      Seu resultado indica um nível de estresse que merece atenção imediata. 
                      A avaliação completa pode identificar exatamente quais dimensões necessitam intervenção 
                      e fornecer um plano de ação estruturado para sua recuperação.
                    </p>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-600">
                        <strong className="text-red-600">Não deixe para depois:</strong> Quanto mais cedo você 
                        agir, mais rápido poderá retomar seu equilíbrio e bem-estar.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Card de prova social e urgência */}
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-800">Junte-se a Centenas de Profissionais</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-purple-600">500+</p>
                      <p className="text-xs text-gray-600 mt-1">Profissionais avaliados</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-indigo-600">50+</p>
                      <p className="text-xs text-gray-600 mt-1">Empresas atendidas</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Empresas líderes já confiam na HumaniQ AI para gerenciar riscos psicossociais 
                    e manter conformidade com a NR-01.
                  </p>
                </CardContent>
              </Card>

              {/* Card de benefícios específicos */}
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-gray-800">O que você receberá na avaliação completa</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Relatório Profissional em PDF</p>
                        <p className="text-xs text-gray-600">Análise detalhada de 38 dimensões psicossociais com gráficos e insights</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Plano de Ação Personalizado</p>
                        <p className="text-xs text-gray-600">Recomendações específicas conforme NR-01 para sua situação</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Dashboard Interativo</p>
                        <p className="text-xs text-gray-600">Acompanhe sua evolução ao longo do tempo com métricas visuais</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock3 className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">Resultados em Minutos</p>
                        <p className="text-xs text-gray-600">Análise completa processada instantaneamente por IA</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card de comparação - O que você está perdendo */}
              <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-600" />
                    <h3 className="font-semibold text-gray-800">Comparação: Preview vs. Avaliação Completa</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-amber-200">
                          <th className="text-left py-2 px-2">Recursos</th>
                          <th className="text-center py-2 px-2 text-gray-500">Preview Grátis</th>
                          <th className="text-center py-2 px-2 text-indigo-600">Completa</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        <tr className="border-b border-amber-100">
                          <td className="py-2 px-2">Perguntas analisadas</td>
                          <td className="text-center py-2 px-2">7</td>
                          <td className="text-center py-2 px-2 font-bold text-indigo-600">80</td>
                        </tr>
                        <tr className="border-b border-amber-100">
                          <td className="py-2 px-2">Dimensões avaliadas</td>
                          <td className="text-center py-2 px-2">3</td>
                          <td className="text-center py-2 px-2 font-bold text-indigo-600">38</td>
                        </tr>
                        <tr className="border-b border-amber-100">
                          <td className="py-2 px-2">Relatório PDF profissional</td>
                          <td className="text-center py-2 px-2">✗</td>
                          <td className="text-center py-2 px-2 font-bold text-indigo-600">✓</td>
                        </tr>
                        <tr className="border-b border-amber-100">
                          <td className="py-2 px-2">Plano de ação NR-01</td>
                          <td className="text-center py-2 px-2">✗</td>
                          <td className="text-center py-2 px-2 font-bold text-indigo-600">✓</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">Gestão de equipes</td>
                          <td className="text-center py-2 px-2">✗</td>
                          <td className="text-center py-2 px-2 font-bold text-indigo-600">✓</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg py-6"
                  data-testid="button-acessar-plataforma"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Acessar Avaliação Completa Agora
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/landing')}
                  className="flex-1 border-2 text-lg py-6"
                  data-testid="button-voltar-landing"
                >
                  Voltar à Página Inicial
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <p className="text-xs text-gray-500">
                  ⚠️ Este é um teste demonstrativo gratuito. Os resultados não substituem avaliação profissional.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Barra de progresso superior */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800">
              Quick Check - Estresse Ocupacional
            </h1>
            <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {perguntaAtual + 1} de {perguntasQuickCheck.length}
            </span>
          </div>
          <Progress value={progresso} className="h-3 bg-slate-200" />
          
          {/* Indicador de status do salvamento */}
          {(operacaoEmAndamento || respostaSalva) && (
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
                  {pergunta.dimensao}
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
                {opcoesResposta.map((opcao, index) => {
                  const valor = index + 1;
                  const isSelected = respostas[pergunta.id] === valor;

                  return (
                    <div key={index} className="flex flex-col items-center gap-3">
                      <button
                        className={`
                          w-16 h-16 rounded-lg border-2 font-bold text-lg
                          transition-all duration-300 ease-in-out
                          ${operacaoEmAndamento ? 'cursor-not-allowed' : 'transform hover:scale-110 active:scale-95'}
                          focus:outline-none focus:ring-4 focus:ring-blue-200
                          ${getButtonColor(valor)}
                          ${operacaoEmAndamento ? 'opacity-60' : ''}
                        `}
                        onClick={() => !operacaoEmAndamento && handleResposta(valor)}
                        disabled={operacaoEmAndamento}
                        style={{
                          pointerEvents: operacaoEmAndamento ? 'none' : 'auto'
                        }}
                        data-testid={`button-resposta-${valor}`}
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
                      Selecionado: {opcoesResposta[respostas[pergunta.id] - 1]}
                    </span>
                  </div>
                </div>
              )}

              {/* Botão de finalizar teste */}
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
                      data-testid="button-finalizar-teste"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Finalizar Teste
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

        {/* Navegação inferior */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleAnterior}
              disabled={perguntaAtual === 0 || operacaoEmAndamento}
              className="px-6 py-2 border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-anterior"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>

            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-lg">
              <span className="font-medium">{Object.keys(respostas).length}</span>
              <span>de</span>
              <span className="font-medium">{perguntasQuickCheck.length}</span>
              <span>respondidas</span>
            </div>

            <div className="text-sm text-slate-500 text-center max-w-48">
              <p className="font-medium">Avanço Automático</p>
              <p className="text-xs">
                {operacaoEmAndamento ? 'Processando...' : 'Responda para avançar automaticamente'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
