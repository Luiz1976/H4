import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingAnimation from "@/components/LoadingAnimation";
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight,
  Play, 
  Target, 
  Zap, 
  Shield, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  FileText, 
  BarChart3,
  Heart,
  Activity,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import Logo from '../components/Logo';

const TesteEstresseOcupacionalIntroducao: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleIniciarTeste = () => {
    setIsLoading(true);
  };

  const handleLoadingComplete = () => {
    navigate('/teste/estresse-ocupacional/perguntas');
  };

  // Renderizar animação de carregamento
  if (isLoading) {
    return (
      <LoadingAnimation 
        onComplete={handleLoadingComplete}
        testName="Estresse Ocupacional"
        duration={8000}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Logo size="md" showText={false} />
            <div>
              <h1 className="text-3xl font-bold text-slate-800">HumaniQ EO</h1>
              <p className="text-blue-700 font-medium">Avaliação de Estresse Ocupacional</p>
            </div>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">
            Uma ferramenta científica para avaliar níveis de estresse ocupacional, 
            risco de burnout e capacidade de resiliência no ambiente de trabalho.
          </p>
        </div>

        {/* Badges informativos */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200 px-3 py-1">
            <Clock className="w-4 h-4 mr-1" />
            15-20 minutos
          </Badge>
          <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200 px-3 py-1">
            <Shield className="w-4 h-4 mr-1" />
            Científicamente validado
          </Badge>
          <Badge className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border-violet-200 px-3 py-1">
            <Target className="w-4 h-4 mr-1" />
            Relatório detalhado
          </Badge>
        </div>

        {/* Dimensões Avaliadas */}
        <Card className="mb-8 bg-white/80 border-slate-200 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Dimensões Avaliadas
            </CardTitle>
            <CardDescription className="text-slate-600">
              O HumaniQ EO avalia múltiplas dimensões do estresse ocupacional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Logo size="sm" showText={false} />
                    <h3 className="font-semibold text-slate-800">Controle Inibitório</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Capacidade de controlar impulsos e manter foco em tarefas importantes
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="h-6 w-6 text-emerald-600" />
                    <h3 className="font-semibold text-slate-800">Flexibilidade Cognitiva</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Habilidade de adaptar-se a mudanças e alternar entre diferentes tarefas
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="h-6 w-6 text-violet-600" />
                    <h3 className="font-semibold text-slate-800">Memória de Trabalho</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Capacidade de manter e manipular informações mentalmente
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-6 w-6 text-amber-600" />
                    <h3 className="font-semibold text-slate-800">Resiliência</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Capacidade de recuperar-se de situações estressantes e adversidades
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo Científico */}
        <Card className="mb-8 bg-white/80 border-slate-200 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Conteúdo Científico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-blue-700">Fundamentação Teórica</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Baseado no modelo de Karasek e Theorell sobre demanda-controle e no modelo de 
                  esforço-recompensa de Siegrist, incorporando também elementos da teoria da 
                  conservação de recursos de Hobfoll.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-emerald-700">Validação Científica</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Instrumento validado com população brasileira, apresentando índices 
                  psicométricos adequados de confiabilidade e validade.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-indigo-700">Aplicação Prática</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Utilizado em contextos organizacionais para identificação precoce de 
                  riscos psicossociais e desenvolvimento de estratégias preventivas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* O que é o HumaniQ EO */}
        <Card className="mb-8 bg-white/80 border-slate-200 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-600" />
              O que é o HumaniQ EO?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              O HumaniQ EO é uma ferramenta de avaliação abrangente que mede os níveis de estresse ocupacional, 
              risco de burnout e capacidade de resiliência dos colaboradores. Baseado em evidências científicas 
              e diretrizes internacionais, oferece insights valiosos para a promoção do bem-estar no ambiente de trabalho.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                <Heart className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-medium text-sm mb-1 text-slate-800">Bem-estar</h4>
                <p className="text-xs text-slate-600">Avalia o estado geral de saúde mental</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-sm mb-1 text-slate-800">Resiliência</h4>
                <p className="text-xs text-slate-600">Mede a capacidade de adaptação</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
                <BarChart3 className="h-8 w-8 text-violet-600 mx-auto mb-2" />
                <h4 className="font-medium text-sm mb-1 text-slate-800">Performance</h4>
                <p className="text-xs text-slate-600">Identifica fatores de risco</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card className="mb-8 bg-white/80 border-slate-200 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              Resultado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Ao final da avaliação, você receberá um relatório detalhado com:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm text-slate-800">Nível de Estresse</h4>
                    <p className="text-xs text-slate-600">Classificação do seu nível atual</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                  <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm text-slate-800">Recomendações</h4>
                    <p className="text-xs text-slate-600">Estratégias personalizadas</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
                  <BarChart3 className="h-5 w-5 text-violet-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm text-slate-800">Análise Detalhada</h4>
                    <p className="text-xs text-slate-600">Gráficos e métricas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                  <Users className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm text-slate-800">Comparativo</h4>
                    <p className="text-xs text-slate-600">Benchmarks do setor</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instruções Importantes */}
        <Card className="mb-8 bg-white/80 border-slate-200 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Instruções Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-red-50 to-rose-50 border border-red-200">
                <Clock className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm mb-1 text-slate-800">Tempo Estimado</h4>
                  <p className="text-xs text-slate-600">
                    A avaliação leva aproximadamente 15-20 minutos para ser concluída
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200">
                <Shield className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm mb-1 text-slate-800">Privacidade</h4>
                  <p className="text-xs text-slate-600">
                    Suas respostas são confidenciais e utilizadas apenas para gerar seu relatório
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-sm mb-1 text-slate-800">Honestidade</h4>
                  <p className="text-xs text-slate-600">
                    Responda com sinceridade para obter resultados mais precisos e úteis
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="px-8 py-3 bg-white/80 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-lg backdrop-blur-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          <Button
            onClick={handleIniciarTeste}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg border border-white/30"
          >
            Iniciar Avaliação
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TesteEstresseOcupacionalIntroducao;