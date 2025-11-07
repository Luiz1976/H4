'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingAnimation from "@/components/LoadingAnimation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Clock, FileText, Shield, TrendingUp, Users, MessageSquare, CheckCircle, AlertTriangle, Target, BookOpen, BarChart3, UserX, Heart } from 'lucide-react';
import { configPercepacaoAssedio } from '@/lib/testes/percepcao-assedio';
import { motion } from 'framer-motion';

export default function TestePASIntroducao() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartTest = async () => {
    setIsLoading(true);
  };

  const handleLoadingComplete = () => {
    navigate('/teste/percepcao-assedio/perguntas');
  };

  // Renderizar animação de carregamento
  if (isLoading) {
    return (
      <LoadingAnimation 
        onComplete={handleLoadingComplete}
        testName="Percepção de Assédio"
        duration={8000}
        messages={[
          "Preparando ambiente seguro e confidencial...",
          "Configurando perguntas especializadas...",
          "Criando espaço de reflexão protegido...",
          "Quase pronto! Sua avaliação está começando..."
        ]}
      />
    );
  }

  const dimensions = [
    {
      name: "Assédio Moral Direto",
      icon: AlertTriangle,
      description: "Agressões verbais, humilhações e condutas abusivas diretas",
      color: "bg-red-500",
      questions: 12
    },
    {
      name: "Assédio Moral Institucional",
      icon: Shield,
      description: "Cultura organizacional abusiva e omissão institucional",
      color: "bg-orange-500",
      questions: 10
    },
    {
      name: "Assédio Sexual",
      icon: UserX,
      description: "Comentários, gestos e toques inapropriados de natureza sexual",
      color: "bg-purple-500",
      questions: 12
    },
    {
      name: "Percepção de Ambiente e Denúncias",
      icon: MessageSquare,
      description: "Canais de denúncia, confiança e resposta organizacional",
      color: "bg-blue-500",
      questions: 10
    },
    {
      name: "Impactos Emocionais",
      icon: Heart,
      description: "Segurança emocional e bem-estar psicológico",
      color: "bg-green-500",
      questions: 4
    }
  ];

  const riskLevels = [
    { 
      level: "Baixo Risco", 
      range: "0-25%", 
      color: "bg-green-100 text-green-800 border-green-200", 
      description: "Ambiente seguro e respeitoso",
      icon: CheckCircle
    },
    { 
      level: "Risco Moderado", 
      range: "26-50%", 
      color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
      description: "Sinais de alerta identificados",
      icon: AlertTriangle
    },
    { 
      level: "Alto Risco", 
      range: "51-75%", 
      color: "bg-orange-100 text-orange-800 border-orange-200", 
      description: "Situações críticas detectadas",
      icon: AlertTriangle
    },
    { 
      level: "Risco Crítico", 
      range: "76-100%", 
      color: "bg-red-100 text-red-800 border-red-200", 
      description: "Ambiente altamente tóxico",
      icon: AlertTriangle
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Conformidade Legal",
      description: "Atende aos requisitos da Lei 14.457/22 sobre prevenção ao assédio"
    },
    {
      icon: BarChart3,
      title: "Diagnóstico Preciso",
      description: "Análise científica baseada em metodologias validadas internacionalmente"
    },
    {
      icon: Target,
      title: "Ações Direcionadas",
      description: "Recomendações específicas para cada dimensão de risco identificada"
    },
    {
      icon: TrendingUp,
      title: "Melhoria Contínua",
      description: "Monitoramento evolutivo do clima organizacional e cultura de respeito"
    }
  ];

  const objectives = [
    "Identificar condutas abusivas percebidas ou vivenciadas no ambiente de trabalho",
    "Mapear áreas críticas de risco de assédio moral e sexual",
    "Avaliar a eficácia dos canais de denúncia e resposta organizacional",
    "Medir impactos na saúde mental e bem-estar dos colaboradores",
    "Fornecer base científica para ações preventivas e corretivas"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-8 mb-8 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/testes')}
              className="text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Button>
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">HumaniQ PAS</h1>
                  <p className="text-blue-100 text-lg">Percepção de Assédio Moral e Sexual</p>
                </div>
              </div>
            </div>
            <div className="w-20" />
          </div>
        </motion.div>

        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Identifique e Previna Situações de Assédio
          </h2>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Avaliação científica abrangente para identificação de condutas abusivas e percepções de assédio moral e sexual no ambiente de trabalho, 
            com foco na prevenção e proteção dos colaboradores.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">48</div>
            <div className="text-slate-600 font-medium">Questões</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">5</div>
            <div className="text-slate-600 font-medium">Dimensões</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">92%</div>
            <div className="text-slate-600 font-medium">Confiabilidade</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">15-20</div>
            <div className="text-slate-600 font-medium">Minutos</div>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12"
        >
          <h3 className="text-3xl font-bold text-center mb-8 text-slate-800">Por que Realizar Este Teste?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-slate-800">{benefit.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Dimensions Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mb-12"
        >
          <h3 className="text-3xl font-bold text-center mb-8 text-slate-800">Dimensões Avaliadas</h3>
          <p className="text-center text-slate-600 mb-10 max-w-3xl mx-auto text-lg">
            Análise multidimensional baseada em metodologias científicas validadas para identificação precisa de riscos
          </p>
          
          <div className="grid gap-6">
            {dimensions.map((dimension, index) => {
              const Icon = dimension.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 flex items-center gap-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className={`w-16 h-16 ${dimension.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-xl text-slate-800">{dimension.name}</h4>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                        {dimension.questions} questões
                      </Badge>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{dimension.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Risk Levels Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.9 }}
          className="mb-12"
        >
          <h3 className="text-3xl font-bold text-center mb-8 text-slate-800">Níveis de Classificação</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {riskLevels.map((level, index) => {
              const Icon = level.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 2.1 + index * 0.1 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-center mb-4">
                    <Icon className="h-8 w-8 text-slate-600" />
                  </div>
                  <Badge className={`${level.color} mb-4 text-sm font-semibold px-3 py-1`}>
                    {level.level}
                  </Badge>
                  <div className="text-lg font-bold text-slate-700 mb-2">{level.range}</div>
                  <div className="text-sm text-slate-600 leading-relaxed">{level.description}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Objectives Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 2.5 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold text-center mb-8">Objetivos da Avaliação</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {objectives.map((objective, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 2.7 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-slate-100 leading-relaxed">{objective}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scientific Base */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 3.0 }}
          className="mb-12"
        >
          <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-3">
                <BookOpen className="h-7 w-7 text-blue-600" />
                Base Científica e Metodológica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-lg mb-4 text-slate-800">Fundamentação Teórica</h4>
                  <ul className="space-y-3">
                    {configPercepacaoAssedio.baseCientifica.map((base, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-600">{base}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-4 text-slate-800">Características Técnicas</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-slate-600">Escala Likert de 5 pontos</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-slate-600">Análise multidimensional</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-slate-600">Classificação de riscos</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-slate-600">Recomendações personalizadas</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Start Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 3.2 }}
          className="text-center"
        >
          <Button 
            onClick={handleStartTest}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <Clock className="h-6 w-6 mr-3" />
            Iniciar Avaliação
            <ArrowRight className="h-6 w-6 ml-3" />
          </Button>
          <p className="text-slate-500 mt-4 text-sm">
            Tempo estimado: {configPercepacaoAssedio.tempoEstimado} • 48 questões • 5 dimensões
          </p>
        </motion.div>
      </div>
    </div>
  );
}