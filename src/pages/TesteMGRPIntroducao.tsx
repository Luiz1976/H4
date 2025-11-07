import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LoadingAnimation from "@/components/LoadingAnimation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  TrendingUp, 
  Users, 
  FileText, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Target, 
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Award,
  Play
} from "lucide-react";
import { infoTesteMaturidadeRiscosPsicossociais } from "@/lib/testes/maturidade-riscos-psicossociais";

export default function TesteMGRPIntroducao() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleIniciarTeste = () => {
    setIsLoading(true);
  };

  const handleLoadingComplete = () => {
    navigate('/teste/maturidade-gestao-riscos/perguntas');
  };

  // Renderizar animação de carregamento
  if (isLoading) {
    return (
      <LoadingAnimation 
        onComplete={handleLoadingComplete}
        testName="HumaniQ MGRP"
        duration={8000}
      />
    );
  }

  const dimensions = [
    {
      name: "Prevenção e Mapeamento",
      icon: Shield,
      description: "Avaliação e identificação proativa dos riscos psicossociais",
      color: "text-blue-600"
    },
    {
      name: "Monitoramento e Controle",
      icon: TrendingUp,
      description: "Sistemas de acompanhamento contínuo dos indicadores",
      color: "text-green-600"
    },
    {
      name: "Acolhimento e Suporte",
      icon: Users,
      description: "Programas de apoio e assistência aos colaboradores",
      color: "text-purple-600"
    },
    {
      name: "Conformidade Legal",
      icon: FileText,
      description: "Cumprimento das normas e regulamentações vigentes",
      color: "text-orange-600"
    },
    {
      name: "Cultura e Comunicação",
      icon: MessageSquare,
      description: "Ambiente organizacional e práticas de comunicação",
      color: "text-red-600"
    }
  ];

  const maturityLevels = [
    { level: "Otimizada", range: "4.5 - 5.0", color: "bg-green-100 text-green-800", description: "Gestão exemplar de riscos psicossociais" },
    { level: "Avançada", range: "3.6 - 4.4", color: "bg-blue-100 text-blue-800", description: "Gestão adequada com oportunidades de melhoria" },
    { level: "Intermediária", range: "2.8 - 3.5", color: "bg-yellow-100 text-yellow-800", description: "Gestão em desenvolvimento" },
    { level: "Inicial", range: "2.0 - 2.7", color: "bg-orange-100 text-orange-800", description: "Gestão básica implementada" },
    { level: "Baixa", range: "1.0 - 1.9", color: "bg-red-100 text-red-800", description: "Necessita implementação urgente" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full shadow-lg">
                <Shield className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {infoTesteMaturidadeRiscosPsicossociais.nome}
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              {infoTesteMaturidadeRiscosPsicossociais.descricao}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2 shadow-sm">
                <Clock className="h-4 w-4 mr-2" />
                {infoTesteMaturidadeRiscosPsicossociais.duracao}
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2 shadow-sm">
                <FileText className="h-4 w-4 mr-2" />
                {infoTesteMaturidadeRiscosPsicossociais.questoes} questões
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2 shadow-sm">
                <Target className="h-4 w-4 mr-2" />
                {infoTesteMaturidadeRiscosPsicossociais.dimensoes} dimensões
              </Badge>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Dimensões Avaliadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="mb-8 bg-white/80 border-slate-200 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Dimensões Avaliadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dimensions.map((dimension, index) => (
                  <motion.div
                    key={dimension.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="text-center p-4 rounded-lg bg-white/90 border border-slate-200 hover:bg-white hover:shadow-lg transition-all duration-300"
                  >
                    <dimension.icon className={`h-8 w-8 mx-auto mb-3 ${dimension.color}`} />
                    <h4 className="font-semibold text-sm mb-2">{dimension.name}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {dimension.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Níveis de Maturidade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="mb-8 bg-white/80 border-slate-200 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Award className="h-5 w-5 text-blue-600" />
                Níveis de Maturidade
              </CardTitle>
              <p className="text-slate-600">
                Entenda os diferentes níveis de maturidade em gestão de riscos psicossociais
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {maturityLevels.map((level, index) => (
                  <motion.div
                    key={level.level}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="p-4 rounded-lg bg-white/90 border border-slate-200 hover:bg-white hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={`${level.color} text-white shadow-sm`}>
                        Nível {level.level}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">{level.description}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Pontuação: {level.range}
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Base Científica */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-8 w-8 text-blue-200" />
              <h3 className="text-2xl font-bold">Base Científica</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="border-l-4 border-blue-300 pl-4">
                <h4 className="font-semibold mb-1">NR 01</h4>
                <p className="text-sm text-blue-200">Disposições Gerais e Gerenciamento de Riscos Ocupacionais</p>
              </div>
              <div className="border-l-4 border-emerald-300 pl-4">
                <h4 className="font-semibold mb-1">ISO 45003</h4>
                <p className="text-sm text-blue-200">Diretrizes para gestão de saúde e segurança psicológica no trabalho</p>
              </div>
              <div className="border-l-4 border-blue-300 pl-4">
                <h4 className="font-semibold mb-1">OIT - Organização Internacional do Trabalho</h4>
                <p className="text-sm text-blue-200">Convenções e recomendações sobre riscos psicossociais</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-slate-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h3 className="text-2xl font-bold text-slate-800">Validação Científica</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Convenções da OIT</h4>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Convenção 155 - Segurança e Saúde dos Trabalhadores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Convenção 187 - Quadro Promocional para a Segurança e Saúde no Trabalho</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Validação Científica</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Desenvolvido com base em pesquisas científicas e melhores práticas internacionais 
                  para avaliação de riscos psicossociais no ambiente de trabalho.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* O que é o HumaniQ MGRP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="mb-8 bg-white/80 border-slate-200 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                O que é o HumaniQ MGRP?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                O HumaniQ MGRP é uma ferramenta de avaliação abrangente que mede o grau de maturidade da organização 
                na gestão de riscos psicossociais. Baseado em evidências científicas e diretrizes internacionais, 
                oferece insights valiosos para o desenvolvimento de estratégias eficazes de prevenção e controle.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100 shadow-sm">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-sm mb-1 text-slate-800">Prevenção</h4>
                  <p className="text-xs text-slate-600">Identificação proativa de riscos</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-emerald-50 border border-emerald-100 shadow-sm">
                  <TrendingUp className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <h4 className="font-medium text-sm mb-1 text-slate-800">Monitoramento</h4>
                  <p className="text-xs text-slate-600">Acompanhamento contínuo</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-violet-50 border border-violet-100 shadow-sm">
                  <Users className="h-8 w-8 text-violet-600 mx-auto mb-2" />
                  <h4 className="font-medium text-sm mb-1 text-slate-800">Suporte</h4>
                  <p className="text-xs text-slate-600">Programas de apoio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Iniciar Avaliação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-slate-200 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Pronto para Começar?</h2>
            <p className="text-slate-600 mb-8">
              Inicie sua avaliação de maturidade em gestão de riscos psicossociais e descubra 
              oportunidades de melhoria para sua organização.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate('/testes')}
                className="bg-white/80 text-slate-700 border-slate-300 hover:bg-white/90 hover:text-slate-800 transition-colors backdrop-blur-sm shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Testes
              </Button>
              <Button
                onClick={handleIniciarTeste}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Avaliação
              </Button>
            </div>
            <div className="mt-6 text-sm text-slate-500">
              <p>⏱️ Tempo estimado: {infoTesteMaturidadeRiscosPsicossociais.duracao}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}