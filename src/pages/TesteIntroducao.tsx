import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, FileText, Target, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import LoadingAnimation from "@/components/LoadingAnimation";
import { apiService } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";

// Interface para dados do teste vindos da API
interface TesteData {
  id: string;
  nome: string;
  descricao: string;
  duracao: string;
  questoes: number;
  categoria: string;
  objetivos: string[];
  dimensoes: string[];
  instrucoes: string[];
}

export default function TesteIntroducao() {
  const { testeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [teste, setTeste] = useState<TesteData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Buscar dados do teste da API
  useEffect(() => {
    const buscarDadosTeste = async () => {
      if (!testeId) {
        setErro('ID do teste não fornecido');
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        setErro(null);

        console.log('🔍 [TesteIntroducao] Buscando dados do teste:', testeId);
        
        // Buscar testes disponíveis da API
        const response = await apiService.listarTestes();
        console.log('✅ [TesteIntroducao] Testes disponíveis:', response);

        // Procurar o teste específico pelo ID
        const testeEncontrado = response.testes.find((t: any) => t.id === testeId);
        
        if (!testeEncontrado) {
          console.error('❌ [TesteIntroducao] Teste não encontrado:', testeId);
          setErro('Teste não encontrado ou não disponível');
          return;
        }

        console.log('✅ [TesteIntroducao] Teste encontrado:', testeEncontrado);
        
        // Mapear dados da API para o formato esperado pelo componente
        const testeFormatado: TesteData = {
          id: testeEncontrado.id,
          nome: testeEncontrado.nome,
          descricao: testeEncontrado.descricao || 'Descrição não disponível',
          duracao: testeEncontrado.duracao || 'Tempo estimado não disponível',
          questoes: testeEncontrado.questoes || testeEncontrado.total_perguntas || 0,
          categoria: testeEncontrado.categoria || 'Teste Psicológico',
          objetivos: testeEncontrado.objetivos || ['Avaliação psicológica completa'],
          dimensoes: testeEncontrado.dimensoes || ['Avaliação Geral'],
          instrucoes: testeEncontrado.instrucoes || [
            'Responda com honestidade',
            'Não há respostas certas ou erradas',
            'Complete todas as questões',
            'Considere seu comportamento habitual'
          ]
        };

        setTeste(testeFormatado);
        
      } catch (error: any) {
        console.error('❌ [TesteIntroducao] Erro ao buscar teste:', error);
        setErro(error.message || 'Erro ao carregar informações do teste');
        
        toast({
          title: "Erro ao carregar teste",
          description: "Não foi possível carregar as informações do teste. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setCarregando(false);
      }
    };

    buscarDadosTeste();
  }, [testeId, toast]);

  // Estados de carregamento e erro
  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando informações do teste...</p>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h1 className="text-2xl font-bold text-destructive">Erro ao carregar teste</h1>
          <p className="text-muted-foreground">{erro}</p>
          <Button onClick={() => navigate('/testes')}>
            Voltar aos Testes
          </Button>
        </div>
      </div>
    );
  }

  if (!teste) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Teste não encontrado</h1>
          <Button onClick={() => navigate('/testes')}>
            Voltar aos Testes
          </Button>
        </div>
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