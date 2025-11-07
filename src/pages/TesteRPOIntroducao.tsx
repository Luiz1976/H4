import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingAnimation from "@/components/LoadingAnimation";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight,
  Play, 
  Shield, 
  Target, 
  Zap, 
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
  Lightbulb,
  
  Home,
  Briefcase,
  UserCheck,
  Scale
} from 'lucide-react';
import Logo from '@/components/Logo';
import { infoTesteRPO } from '@/lib/testes/rpo';

const TesteRPOIntroducao: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleIniciarTeste = () => {
    setIsLoading(true);
  };

  const handleLoadingComplete = () => {
    navigate('/teste/rpo/perguntas');
  };

  // Renderizar animação de carregamento
  if (isLoading) {
    return (
      <LoadingAnimation 
        onComplete={handleLoadingComplete}
        testName="HumaniQ RPO"
        duration={8000}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 text-white shadow-lg">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">{infoTesteRPO.nome}</h1>
              <p className="text-red-700 font-medium">Avaliação de Riscos Psicossociais Ocupacionais</p>
            </div>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">
            {infoTesteRPO.descricao}
          </p>
        </div>

        {/* Badges informativos */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200 px-3 py-1">
            <Clock className="w-4 h-4 mr-1" />
            {infoTesteRPO.duracao}
          </Badge>
          <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200 px-3 py-1">
            <Shield className="w-4 h-4 mr-1" />
            Científicamente validado
          </Badge>
          <Badge className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border-violet-200 px-3 py-1">
            <Target className="w-4 h-4 mr-1" />
            {infoTesteRPO.questoes} questões
          </Badge>
          <Badge className="bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border-red-200 px-3 py-1">
            <BarChart3 className="w-4 h-4 mr-1" />
            {infoTesteRPO.dimensoes} dimensões
          </Badge>
        </div>

        {/* Dimensões Avaliadas */}
        <Card className="mb-8 bg-white/80 border-slate-200 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-600" />
              Dimensões dos Riscos Psicossociais
            </CardTitle>
            <CardDescription className="text-slate-600">
              O HumaniQ RPO avalia 8 dimensões críticas dos riscos psicossociais no trabalho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 border border-red-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="h-6 w-6 text-red-600" />
                    <h3 className="font-semibold text-slate-800">Demandas do Trabalho</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Pressão temporal, carga de trabalho e complexidade das tarefas
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="h-6 w-6 text-blue-600" />
                    <h3 className="font-semibold text-slate-800">Autonomia e Controle</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Capacidade de tomar decisões e influenciar o próprio trabalho
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-6 w-6 text-emerald-600" />
                    <h3 className="font-semibold text-slate-800">Apoio Social</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Suporte dos colegas e supervisores no ambiente de trabalho
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
                  <div className="flex items-center gap-3 mb-2">
                    <UserCheck className="h-6 w-6 text-violet-600" />
                    <h3 className="font-semibold text-slate-800">Reconhecimento</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Valorização do trabalho e oportunidades de crescimento
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-6 w-6 text-amber-600" />
                    <h3 className="font-semibold text-slate-800">Segurança no Emprego</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Estabilidade e previsibilidade na continuidade do trabalho
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="h-6 w-6 text-cyan-600" />
                    <h3 className="font-semibold text-slate-800">Ambiente Físico</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Condições físicas do trabalho e recursos disponíveis
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Home className="h-6 w-6 text-pink-600" />
                    <h3 className="font-semibold text-slate-800">Conflito Trabalho-Família</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Equilíbrio entre demandas profissionais e vida pessoal
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Scale className="h-6 w-6 text-indigo-600" />
                    <h3 className="font-semibold text-slate-800">Cultura Organizacional</h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    Valores, comunicação e justiça organizacional
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bases Científicas */}
        <Card className="mb-8 bg-white/80 border-slate-200 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600" />
              Fundamentação Científica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {infoTesteRPO.basesCientificas.map((base, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200">
                  <CheckCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600 leading-relaxed">{base}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Objetivos */}
        <Card className="mb-8 bg-white/80 border-slate-200 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600" />
              Objetivos da Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {infoTesteRPO.objetivos.map((objetivo, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 border border-red-200">
                  <Target className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600 leading-relaxed">{objetivo}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        <Card className="mb-8 bg-white/80 border-slate-200 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-red-600" />
              O que você receberá
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Ao final da avaliação, você receberá um relatório detalhado com:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 border border-red-200">
                  <BarChart3 className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm text-slate-800">Índice Geral de Risco</h4>
                    <p className="text-xs text-slate-600">Classificação do nível de risco psicossocial</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                  <Activity className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm text-slate-800">Análise por Dimensão</h4>
                    <p className="text-xs text-slate-600">Avaliação detalhada de cada fator</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                  <Lightbulb className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm text-slate-800">Recomendações</h4>
                    <p className="text-xs text-slate-600">Estratégias personalizadas de intervenção</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200">
                  <TrendingUp className="h-5 w-5 text-violet-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-sm text-slate-800">Plano de Ação</h4>
                    <p className="text-xs text-slate-600">Diretrizes para melhoria do ambiente</p>
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
              {infoTesteRPO.instrucoes.map((instrucao, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600 leading-relaxed">{instrucao}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Benefícios */}
        <Card className="mb-8 bg-white/80 border-slate-200 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-600" />
              Benefícios da Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {infoTesteRPO.beneficios.map((beneficio, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                  <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600 leading-relaxed">{beneficio}</p>
                </div>
              ))}
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
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg border border-white/30"
          >
            Iniciar Avaliação
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TesteRPOIntroducao;