import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, FileText, Target, CheckCircle } from "lucide-react";
import LoadingAnimation from "@/components/LoadingAnimation";

// Mock data dos testes - em produção seria carregado do backend
const testesData = {
  "big-five": {
    nome: "Big Five - Traços de Personalidade",
    descricao: "O Big Five é um dos modelos mais cientificamente validados para avaliação da personalidade humana. Este teste mede cinco dimensões fundamentais que capturam a essência da personalidade individual.",
    duracao: "15-20 minutos",
    questoes: 44,
    categoria: "Personalidade",
    objetivos: [
      "Identificar seus traços dominantes de personalidade",
      "Compreender como você se relaciona com outros",
      "Descobrir seus pontos fortes e áreas de desenvolvimento",
      "Obter insights para crescimento pessoal e profissional"
    ],
    dimensoes: [
      "Abertura à Experiência",
      "Conscienciosidade", 
      "Extroversão",
      "Amabilidade",
      "Neuroticismo"
    ],
    instrucoes: [
      "Leia cada pergunta com atenção",
      "Responda de forma honesta e espontânea",
      "Não há respostas certas ou erradas",
      "Considere como você geralmente se comporta",
      "Complete todas as questões para um resultado preciso"
    ]
  },
  "inteligencia-emocional": {
    nome: "Inteligência Emocional",
    descricao: "A Inteligência Emocional é a capacidade de reconhecer, compreender e gerenciar suas próprias emoções, bem como perceber e influenciar as emoções dos outros de forma eficaz.",
    duracao: "10-15 minutos",
    questoes: 28,
    categoria: "Emocional",
    objetivos: [
      "Avaliar sua consciência emocional",
      "Medir habilidades de autorregulação",
      "Identificar competências sociais",
      "Desenvolver estratégias de melhoria"
    ],
    dimensoes: [
      "Autoconsciência",
      "Autorregulação",
      "Motivação",
      "Empatia",
      "Habilidades Sociais"
    ],
    instrucoes: [
      "Reflita sobre situações reais que vivenciou",
      "Considere suas reações emocionais típicas",
      "Seja honesto sobre suas capacidades",
      "Pense em como você interage com outros",
      "Responda baseado em sua experiência geral"
    ]
  },
  "clima-organizacional": {
    nome: "HumaniQ - Clima Organizacional",
    descricao: "Pesquisa de clima organizacional baseada em modelo científico que avalia 8 dimensões fundamentais do ambiente de trabalho, proporcionando insights valiosos para o desenvolvimento organizacional.",
    duracao: "15-20 minutos",
    questoes: 56,
    categoria: "Organizacional",
    objetivos: [
      "Avaliar a percepção do clima organizacional",
      "Identificar pontos fortes e oportunidades de melhoria",
      "Medir o nível de engajamento e satisfação",
      "Fornecer insights para desenvolvimento organizacional"
    ],
    dimensoes: [
      "Comunicação",
      "Liderança",
      "Relacionamento Interpessoal",
      "Reconhecimento e Recompensas",
      "Desenvolvimento Profissional",
      "Condições de Trabalho e Infraestrutura",
      "Equilíbrio Trabalho x Vida Pessoal",
      "Engajamento e Pertencimento"
    ],
    instrucoes: [
      "Responda com base na sua experiência atual na organização",
      "Use a escala de 1 (Discordo totalmente) a 5 (Concordo totalmente)",
      "Seja honesto e objetivo em suas respostas",
      "Considere situações recentes e frequentes",
      "Suas respostas são confidenciais e anônimas"
    ]
  },
  "karasek-siegrist": {
    nome: "HumaniQ - Karasek–Siegrist",
    descricao: "Avaliação científica de risco psicossocial no trabalho baseada nos modelos de Karasek e Siegrist. Identifica fatores de estresse ocupacional e risco de burnout através de 6 dimensões fundamentais.",
    duracao: "15-20 minutos",
    questoes: 60,
    categoria: "Psicossocial",
    objetivos: [
      "Avaliar o risco psicossocial no ambiente de trabalho",
      "Identificar fatores de estresse ocupacional",
      "Medir o desequilíbrio esforço-recompensa",
      "Detectar sinais precoces de burnout",
      "Fornecer recomendações para intervenção preventiva"
    ],
    dimensoes: [
      "Demanda Psicológica",
      "Controle e Autonomia",
      "Apoio Social",
      "Esforço Exigido",
      "Recompensas Recebidas",
      "Hipercomprometimento"
    ],
    instrucoes: [
      "Responda com base na sua experiência atual no trabalho",
      "Use a escala fornecida para cada pergunta",
      "Seja honesto sobre suas percepções e sentimentos",
      "Considere situações típicas do seu dia a dia profissional",
      "Não há respostas certas ou erradas, apenas sua percepção",
      "Suas respostas são confidenciais e protegidas"
    ]
  }
  // ... outros testes podem ser adicionados aqui
};

export default function TesteIntroducao() {
  const { testeId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const teste = testesData[testeId as keyof typeof testesData];

  if (!teste) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-destructive">Teste não encontrado</h1>
        <Button onClick={() => navigate('/testes')}>
          Voltar aos Testes
        </Button>
      </div>
    );
  }

  const handleIniciarTeste = () => {
    setIsLoading(true);
  };

  const handleLoadingComplete = () => {
    navigate(`/teste/${testeId}/perguntas`);
  };

  // Renderizar animação de carregamento
  if (isLoading) {
    return (
      <LoadingAnimation 
        onComplete={handleLoadingComplete}
        testName={teste?.nome || "teste"}
        duration={8000} // 8 segundos
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/testes')}
          className="p-0 h-auto font-normal hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Testes
        </Button>
        <span>/</span>
        <span className="text-foreground">{teste.nome}</span>
      </div>

      {/* Header */}
      <div className="text-center space-y-4">
        <Badge className="bg-gradient-primary">{teste.categoria}</Badge>
        <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
          {teste.nome}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {teste.descricao}
        </p>
      </div>

      {/* Informações do Teste */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="font-semibold">{teste.duracao}</div>
            <div className="text-sm text-muted-foreground">Duração estimada</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="font-semibold">{teste.questoes} questões</div>
            <div className="text-sm text-muted-foreground">Total de perguntas</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="font-semibold">{teste.dimensoes.length} dimensões</div>
            <div className="text-sm text-muted-foreground">Aspectos avaliados</div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Objetivos */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Objetivos do Teste
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {teste.objetivos.map((objetivo, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-success mt-0.5 shrink-0" />
                <span className="text-sm">{objetivo}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Dimensões */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Dimensões Avaliadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {teste.dimensoes.map((dimensao, index) => (
              <Badge key={index} variant="secondary" className="mr-2 mb-2">
                {dimensao}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Instruções */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Instruções Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {teste.instrucoes.map((instrucao, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center mt-0.5 shrink-0">
                {index + 1}
              </div>
              <span className="text-sm">{instrucao}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Botão de Ação */}
      <div className="text-center space-y-4">
        <Button 
          size="lg"
          className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6 shadow-glow"
          onClick={handleIniciarTeste}
        >
          Fazer Teste Agora
        </Button>
        <p className="text-sm text-muted-foreground">
          Suas respostas são confidenciais e seguras
        </p>
      </div>
    </div>
  );
}