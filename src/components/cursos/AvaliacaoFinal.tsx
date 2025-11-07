import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Clock, Award, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Curso } from "@/data/cursosData.ts";

interface AvaliacaoFinalProps {
  curso: Curso;
  progresso: any;
  avaliacaoRealizada: boolean;
}

interface Questao {
  id: number;
  pergunta: string;
  opcoes: string[];
  respostaCorreta: number;
}

// Gerar questões baseadas no conteúdo real do curso
const gerarQuestoes = (curso: Curso): Questao[] => {
  const questoes: Questao[] = [];
  let questaoId = 1;

  // Adicionar 1-2 perguntas sobre o objetivo e resultados do curso
  questoes.push({
    id: questaoId++,
    pergunta: `Qual é o objetivo principal do curso "${curso.titulo}"?`,
    opcoes: [
      curso.objetivo,
      "Aprender apenas teoria sem aplicação prática",
      "Desenvolver habilidades técnicas não relacionadas",
      "Estudar conteúdos genéricos sem foco específico"
    ],
    respostaCorreta: 0
  });

  // Para cada módulo, criar perguntas baseadas nos tópicos
  curso.modulos.forEach((modulo, moduloIndex) => {
    // Pegar os principais tópicos do módulo
    const topicos = modulo.topicos || [];
    
    if (topicos.length > 0) {
      // Criar pergunta sobre o primeiro tópico importante
      const topicoDestaque = topicos[0];
      const opcoesEmbaralhadas = [
        "Conceitos não relacionados ao tema",
        topicoDestaque,
        "Assuntos fora do escopo do curso",
        "Teorias sem aplicação prática"
      ].sort(() => Math.random() - 0.5);
      
      questoes.push({
        id: questaoId++,
        pergunta: `No módulo "${modulo.titulo}", qual é um dos principais tópicos abordados?`,
        opcoes: opcoesEmbaralhadas,
        respostaCorreta: opcoesEmbaralhadas.indexOf(topicoDestaque)
      });
    }

    // Criar pergunta sobre objetivos específicos do módulo (se houver tópicos)
    if (topicos.length > 1) {
      const topicoSecundario = topicos[Math.min(1, topicos.length - 1)];
      const opcoesEmbaralhadas2 = [
        topicoSecundario,
        "Estratégias de marketing digital",
        "Programação de computadores",
        "Gestão financeira pessoal"
      ].sort(() => Math.random() - 0.5);
      
      questoes.push({
        id: questaoId++,
        pergunta: `Qual dos seguintes tópicos é abordado no módulo "${modulo.titulo}"?`,
        opcoes: opcoesEmbaralhadas2,
        respostaCorreta: opcoesEmbaralhadas2.indexOf(topicoSecundario)
      });
    }
  });

  // Adicionar pergunta sobre resultados esperados
  if (curso.resultadosEsperados && curso.resultadosEsperados.length > 0) {
    const resultadoDestaque = curso.resultadosEsperados[0];
    const opcoesEmbaralhadas3 = [
      "Nenhum resultado prático mensurável",
      resultadoDestaque,
      "Certificação em outra área não relacionada",
      "Apenas conhecimento teórico sem aplicação"
    ].sort(() => Math.random() - 0.5);
    
    questoes.push({
      id: questaoId++,
      pergunta: `Qual é um dos resultados esperados ao concluir este curso?`,
      opcoes: opcoesEmbaralhadas3,
      respostaCorreta: opcoesEmbaralhadas3.indexOf(resultadoDestaque)
    });
  }

  // Limitar a 10 questões no máximo
  return questoes.slice(0, 10);
};

export default function AvaliacaoFinal({ curso, progresso, avaliacaoRealizada }: AvaliacaoFinalProps) {
  const { toast } = useToast();
  const [inicioAvaliacao, setInicioAvaliacao] = useState(false);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [questoes] = useState<Questao[]>(gerarQuestoes(curso));
  const [tempoInicio, setTempoInicio] = useState<number | null>(null);
  const [resultadoFinal, setResultadoFinal] = useState<{
    aprovado: boolean;
    pontuacao: number;
    totalQuestoes: number;
    tentativaAtual: number;
    tentativasRestantes: number;
  } | null>(null);

  const tentativasRealizadas = progresso?.tentativasAvaliacao || 0;
  const tentativasRestantes = 3 - tentativasRealizadas;
  const jaAprovado = avaliacaoRealizada && progresso?.avaliacaoFinalPontuacao && progresso.avaliacaoFinalPontuacao >= (questoes.length * 0.7);

  const submeterAvaliacaoMutation = useMutation({
    mutationFn: async (dados: any) => {
      return apiRequest(`/api/cursos/avaliacao/${curso.slug}`, {
        method: 'POST',
        body: JSON.stringify(dados)
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cursos/progresso', curso.slug] });
      setResultadoFinal(data);
      
      if (data.aprovado) {
        // Emitir certificado automaticamente
        emitirCertificadoMutation.mutate();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar a avaliação.",
        variant: "destructive"
      });
    }
  });

  const emitirCertificadoMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/cursos/certificado/${curso.slug}`, {
        method: 'POST',
        body: JSON.stringify({
          cursoId: curso.id.toString(),
          cursoTitulo: curso.titulo,
          cargaHoraria: curso.duracao
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cursos/certificado', curso.slug] });
      toast({
        title: "🎉 Parabéns!",
        description: "Seu certificado foi emitido com sucesso!",
      });
    }
  });

  const iniciarAvaliacao = () => {
    setInicioAvaliacao(true);
    setTempoInicio(Date.now());
  };

  const handleRespostaChange = (questaoId: number, resposta: number) => {
    setRespostas(prev => ({ ...prev, [questaoId]: resposta }));
  };

  const finalizarAvaliacao = () => {
    const tempoGasto = tempoInicio ? Math.floor((Date.now() - tempoInicio) / 1000) : 0;
    
    // Calcular pontuação
    let pontuacao = 0;
    questoes.forEach(questao => {
      if (respostas[questao.id] === questao.respostaCorreta) {
        pontuacao++;
      }
    });

    submeterAvaliacaoMutation.mutate({
      cursoId: curso.id.toString(),
      respostas,
      pontuacao,
      totalQuestoes: questoes.length,
      tempoGasto
    });
  };

  const todasRespondidas = questoes.every(q => respostas[q.id] !== undefined);
  const porcentagemAcerto = resultadoFinal 
    ? Math.round((resultadoFinal.pontuacao / resultadoFinal.totalQuestoes) * 100)
    : 0;

  // Função para refazer a avaliação
  const refazerAvaliacao = () => {
    setResultadoFinal(null);
    setRespostas({});
    setInicioAvaliacao(false);
    setTempoInicio(null);
  };

  // Se já foi aprovado
  if (jaAprovado && !resultadoFinal) {
    return (
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="p-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-700 mb-2">
            Avaliação Concluída!
          </h3>
          <p className="text-green-600 mb-2">
            Você já foi aprovado na avaliação final deste curso.
          </p>
          <p className="text-sm text-gray-600">
            Nota: {progresso?.avaliacaoFinalPontuacao} de {questoes.length} ({Math.round((progresso?.avaliacaoFinalPontuacao || 0) / questoes.length * 100)}%)
          </p>
        </CardContent>
      </Card>
    );
  }

  // Resultado final
  if (resultadoFinal) {
    return (
      <Card className={`border-2 ${resultadoFinal.aprovado ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardContent className="p-12 text-center space-y-6">
          {resultadoFinal.aprovado ? (
            <>
              <Award className="h-20 w-20 text-yellow-500 mx-auto animate-bounce" />
              <h3 className="text-3xl font-bold text-green-700">
                🎉 Parabéns! Você foi aprovado!
              </h3>
              <div className="text-6xl font-bold text-green-600">
                {porcentagemAcerto}%
              </div>
              <p className="text-lg text-green-700">
                Você acertou {resultadoFinal.pontuacao} de {resultadoFinal.totalQuestoes} questões
              </p>
              <p className="text-gray-700">
                Seu certificado foi emitido automaticamente e está disponível na aba "Certificado"!
              </p>
              <div className="mt-4 text-sm text-gray-600">
                Tentativa {resultadoFinal.tentativaAtual} de 3
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="h-20 w-20 text-red-500 mx-auto" />
              <h3 className="text-3xl font-bold text-red-700">
                Não foi desta vez
              </h3>
              <div className="text-6xl font-bold text-red-600">
                {porcentagemAcerto}%
              </div>
              <p className="text-lg text-red-700">
                Você acertou {resultadoFinal.pontuacao} de {resultadoFinal.totalQuestoes} questões
              </p>
              <p className="text-gray-700 mb-4">
                É necessário acertar pelo menos 70% para ser aprovado.
              </p>
              
              {resultadoFinal.tentativasRestantes > 0 ? (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                  <p className="text-yellow-800 font-semibold mb-2">
                    Você ainda tem {resultadoFinal.tentativasRestantes} tentativa{resultadoFinal.tentativasRestantes > 1 ? 's' : ''} restante{resultadoFinal.tentativasRestantes > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-yellow-700 mb-4">
                    Revise o conteúdo dos módulos e tente novamente!
                  </p>
                  <Button
                    onClick={refazerAvaliacao}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                    data-testid="button-refazer-avaliacao"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              ) : (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <p className="text-red-800 font-semibold">
                    Você utilizou todas as 3 tentativas disponíveis
                  </p>
                  <p className="text-sm text-red-700 mt-2">
                    Entre em contato com o administrador do curso para mais informações.
                  </p>
                </div>
              )}

              <div className="mt-4 text-sm text-gray-600">
                Tentativa {resultadoFinal.tentativaAtual} de 3
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Antes de iniciar
  if (!inicioAvaliacao) {
    return (
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Award className="h-8 w-8 text-blue-600" />
            Avaliação Final
          </CardTitle>
          <CardDescription>
            Complete a avaliação para receber seu certificado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
            <h4 className="font-semibold text-blue-900">Informações da Avaliação:</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Total de questões: {questoes.length}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Nota mínima para aprovação: 70%
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Você tem direito a 3 tentativas
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Certificado emitido automaticamente após aprovação
              </li>
            </ul>
          </div>

          {tentativasRealizadas > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <p className="text-yellow-800 font-semibold">
                ⚠️ Tentativas utilizadas: {tentativasRealizadas} de 3
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Você ainda tem {tentativasRestantes} tentativa{tentativasRestantes > 1 ? 's' : ''} disponível{tentativasRestantes > 1 ? 'is' : ''}
              </p>
            </div>
          )}

          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
            onClick={iniciarAvaliacao}
            data-testid="button-iniciar-avaliacao"
          >
            <Clock className="h-5 w-5 mr-2" />
            Iniciar Avaliação
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Durante a avaliação
  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Avaliação Final - {curso.titulo}</span>
            <Badge className="bg-blue-100 text-blue-700">
              {Object.keys(respostas).length}/{questoes.length} respondidas
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {questoes.map((questao, index) => (
        <Card key={questao.id} className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg">
              Questão {index + 1} de {questoes.length}
            </CardTitle>
            <CardDescription className="text-base text-gray-800 font-medium">
              {questao.pergunta}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={respostas[questao.id]?.toString()}
              onValueChange={(value) => handleRespostaChange(questao.id, parseInt(value))}
            >
              {questao.opcoes.map((opcao, idx) => (
                <div key={idx} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                  <RadioGroupItem value={idx.toString()} id={`q${questao.id}-o${idx}`} />
                  <Label htmlFor={`q${questao.id}-o${idx}`} className="flex-1 cursor-pointer">
                    {opcao}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="p-6">
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-6"
            onClick={finalizarAvaliacao}
            disabled={!todasRespondidas || submeterAvaliacaoMutation.isPending}
            data-testid="button-finalizar-avaliacao"
          >
            {submeterAvaliacaoMutation.isPending ? (
              <>Enviando...</>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Finalizar Avaliação
              </>
            )}
          </Button>
          {!todasRespondidas && (
            <p className="text-sm text-orange-700 text-center mt-3">
              Responda todas as questões antes de finalizar
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${className}`}>{children}</span>;
}
