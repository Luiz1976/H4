import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Users, 
  Award,
  Scale,
  Home,
  Clock
} from 'lucide-react';
import { obterPerguntasRPO, obterInfoTesteRPO, calcularResultadoRPO } from '../lib/testes/riscos-psicossociais-ocupacionais';

const iconesDimensao = {
  'Demandas do trabalho': <TrendingUp className="h-5 w-5" />,
  'Autonomia e controle': <Shield className="h-5 w-5" />,
  'Relações interpessoais e apoio social': <Users className="h-5 w-5" />,
  'Reconhecimento e recompensas': <Award className="h-5 w-5" />,
  'Justiça e clima organizacional': <Scale className="h-5 w-5" />,
  'Segurança no trabalho e futuro': <Shield className="h-5 w-5" />,
  'Interface trabalho-vida pessoal': <Home className="h-5 w-5" />,
  'Violência, assédio e pressão': <AlertTriangle className="h-5 w-5" />
};

export default function TesteRPO() {
  const navigate = useNavigate();
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [dimensaoAtual, setDimensaoAtual] = useState('');
  const [mostrarResumo, setMostrarResumo] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const perguntas = obterPerguntasRPO();
  const infoTeste = obterInfoTesteRPO();
  const totalPerguntas = perguntas.length;
  const progresso = ((perguntaAtual + 1) / totalPerguntas) * 100;

  // Atualizar dimensão atual baseada na pergunta
  useEffect(() => {
    if (perguntas[perguntaAtual]) {
      setDimensaoAtual(perguntas[perguntaAtual].dimensao);
    }
  }, [perguntaAtual, perguntas]);

  const handleResposta = (valor: number) => {
    const perguntaId = perguntas[perguntaAtual].id;
    setRespostas(prev => ({
      ...prev,
      [perguntaId]: valor
    }));
  };

  const proximaPergunta = () => {
    if (perguntaAtual < totalPerguntas - 1) {
      setPerguntaAtual(prev => prev + 1);
    } else {
      setMostrarResumo(true);
    }
  };

  const perguntaAnterior = () => {
    if (perguntaAtual > 0) {
      setPerguntaAtual(prev => prev - 1);
    }
  };

  const finalizarTeste = async () => {
    setCarregando(true);
    
    try {
      // Verificar se todas as perguntas foram respondidas
      const perguntasNaoRespondidas = [];
      for (let i = 0; i < totalPerguntas; i++) {
        const perguntaId = perguntas[i].id;
        if (!(perguntaId in respostas)) {
          perguntasNaoRespondidas.push(perguntaId);
        }
      }

      if (perguntasNaoRespondidas.length > 0) {
        alert(`Por favor, responda todas as perguntas. Faltam: ${perguntasNaoRespondidas.join(', ')}`);
        setCarregando(false);
        return;
      }

      // Calcular resultado
      const resultado = calcularResultadoRPO(respostas);
      
      // Gerar ID único para o resultado
      const resultadoId = `rpo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Salvar no localStorage (em produção seria salvo no banco)
      localStorage.setItem(`resultado_${resultadoId}`, JSON.stringify({
        tipo: 'rpo',
        data: new Date().toISOString(),
        resultado,
        respostas
      }));

      // Navegar para página de resultado
      navigate(`/resultado/riscos-psicossociais-ocupacionais-${resultadoId}`);
      
    } catch (error) {
      console.error('Erro ao finalizar teste:', error);
      alert('Erro ao processar o teste. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const voltarParaPergunta = (indice: number) => {
    setPerguntaAtual(indice);
    setMostrarResumo(false);
  };

  const contarRespostasPorDimensao = () => {
    const contadores: Record<string, { respondidas: number; total: number }> = {};
    
    perguntas.forEach((pergunta) => {
      if (!contadores[pergunta.dimensao]) {
        contadores[pergunta.dimensao] = { respondidas: 0, total: 0 };
      }
      contadores[pergunta.dimensao].total++;
      if (pergunta.id in respostas) {
        contadores[pergunta.dimensao].respondidas++;
      }
    });
    
    return contadores;
  };

  if (mostrarResumo) {
    const contadores = contarRespostasPorDimensao();
    const totalRespondidas = Object.keys(respostas).length;
    const todasRespondidas = totalRespondidas === totalPerguntas;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Resumo do Teste</CardTitle>
            <CardDescription>
              Revise suas respostas antes de finalizar o teste
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {totalRespondidas}/{totalPerguntas}
              </div>
              <div className="text-gray-600">Perguntas respondidas</div>
              <Progress value={(totalRespondidas / totalPerguntas) * 100} className="mt-4" />
            </div>

            {!todasRespondidas && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Você ainda tem {totalPerguntas - totalRespondidas} pergunta(s) sem resposta. 
                  Complete todas as perguntas para finalizar o teste.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(contadores).map(([dimensao, contador]) => (
                <Card key={dimensao} className="border-l-4 border-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      {iconesDimensao[dimensao]}
                      <h3 className="font-semibold text-sm">{dimensao}</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {contador.respondidas}/{contador.total} respondidas
                      </span>
                      <Badge 
                        variant={contador.respondidas === contador.total ? "default" : "secondary"}
                      >
                        {contador.respondidas === contador.total ? "Completa" : "Incompleta"}
                      </Badge>
                    </div>
                    <Progress 
                      value={(contador.respondidas / contador.total) * 100} 
                      className="mt-2 h-2" 
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setMostrarResumo(false)}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar ao Teste
              </Button>
              
              <Button 
                onClick={finalizarTeste}
                disabled={!todasRespondidas || carregando}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {carregando ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Finalizar Teste'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pergunta = perguntas[perguntaAtual];
  const respostaAtual = respostas[pergunta.id];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header com informações do teste */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{infoTeste.titulo}</h1>
            <p className="text-gray-600">{infoTeste.descricao}</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {perguntaAtual + 1} de {totalPerguntas}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progresso geral</span>
            <span className="font-semibold">{progresso.toFixed(0)}%</span>
          </div>
          <Progress value={progresso} className="h-2" />
        </div>
      </div>

      {/* Indicador da dimensão atual */}
      <Card className="mb-6 border-l-4 border-blue-500">
        <CardContent className="pt-4">
          <div className="flex items-center space-x-3">
            {iconesDimensao[dimensaoAtual]}
            <div>
              <h2 className="font-semibold text-lg">{dimensaoAtual}</h2>
              <p className="text-sm text-gray-600">
                Dimensão {Object.keys(iconesDimensao).indexOf(dimensaoAtual) + 1} de 8
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pergunta atual */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">
            Pergunta {perguntaAtual + 1}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg leading-relaxed">{pergunta.texto}</p>
          
          <div className="space-y-3">
            {['Discordo totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo totalmente'].map((opcao, index) => {
              const valor = index + 1;
              const selecionada = respostaAtual === valor;
              
              return (
                <button
                  key={index}
                  onClick={() => handleResposta(valor)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:shadow-md ${
                    selecionada
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selecionada 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {selecionada && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span className="font-medium">{opcao}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={perguntaAnterior}
          disabled={perguntaAtual === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setMostrarResumo(true)}
          >
            Ver Resumo
          </Button>
          
          <Button
            onClick={proximaPergunta}
            disabled={!respostaAtual}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {perguntaAtual === totalPerguntas - 1 ? 'Finalizar' : 'Próxima'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Indicador de resposta obrigatória */}
      {!respostaAtual && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Selecione uma resposta para continuar
          </p>
        </div>
      )}
    </div>
  );
}