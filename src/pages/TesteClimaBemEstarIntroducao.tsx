'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import LoadingAnimation from "@/components/LoadingAnimation"
import { 
  ArrowLeft, 
  Play, 
  Users, 
  Building2, 
  Heart, 
  Shield, 
  MessageCircle, 
  Scale, 
  UserCheck,
  Clock,
  FileText,
  Award,
  CheckCircle,
  Lightbulb,
  TrendingUp,
  Target,
  BarChart3,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { infoTesteClimaBemEstar } from '@/lib/testes/clima-bem-estar'

export default function HumaniqInsightIntroducaoPage() {
  const navigate = useNavigate()
  const [hoveredDimension, setHoveredDimension] = useState<number | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleStartTest = async () => {
    setIsLoading(true)
  }

  const handleLoadingComplete = () => {
    navigate('/teste/clima-bem-estar/perguntas')
  }

  // Renderizar animação de carregamento
  if (isLoading) {
    return (
      <LoadingAnimation 
        onComplete={handleLoadingComplete}
        testName="Clima e Bem-Estar"
        duration={8000}
      />
    );
  }

  const handleBackToTests = () => {
    navigate('/testes')
  }

  const dimensions = [
    {
      icon: Shield,
      title: 'Segurança Psicológica',
      description: 'Avalia o nível de confiança para expressar ideias e preocupações sem medo de retaliação.'
    },
    {
      icon: MessageCircle,
      title: 'Comunicação Organizacional',
      description: 'Mede a qualidade, clareza e efetividade da comunicação interna.'
    },
    {
      icon: Users,
      title: 'Senso de Pertencimento',
      description: 'Analisa o sentimento de inclusão e conexão com a organização.'
    },
    {
      icon: Scale,
      title: 'Justiça Organizacional',
      description: 'Avalia a percepção de equidade nos processos e decisões organizacionais.'
    }
  ]

  const benefits = [
    {
      icon: Shield,
      title: 'Fortalece Segurança Psicológica',
      description: 'Cria ambiente onde colaboradores se sentem seguros para inovar e contribuir'
    },
    {
      icon: MessageCircle,
      title: 'Melhora Comunicação',
      description: 'Identifica gaps comunicacionais e promove diálogo mais efetivo'
    },
    {
      icon: Heart,
      title: 'Promove Bem-estar',
      description: 'Desenvolve ambiente saudável que prioriza o bem-estar psicológico'
    },
    {
      icon: TrendingUp,
      title: 'Reduz Rotatividade',
      description: 'Diminui conflitos e turnover causados por clima organizacional tóxico'
    },
    {
      icon: Building2,
      title: 'Base para ESG',
      description: 'Fornece fundamentos sólidos para iniciativas de ESG e liderança humanizada'
    },
    {
      icon: Target,
      title: 'Ações Direcionadas',
      description: 'Oferece insights específicos para melhorias organizacionais efetivas'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="ghost"
            onClick={handleBackToTests}
            className="text-slate-700 hover:bg-white/80 hover:text-slate-800 transition-colors border border-slate-200 bg-white/60 backdrop-blur-sm shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Testes
          </Button>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm">
            {infoTesteClimaBemEstar.categoria}
          </Badge>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6 leading-tight">
            {infoTesteClimaBemEstar.nome}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {infoTesteClimaBemEstar.descricao}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">10.000+</h3>
            <p className="text-slate-600">Colaboradores</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Building2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">500+</h3>
            <p className="text-slate-600">Empresas Atendidas</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Clock className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{infoTesteClimaBemEstar.duracao}</h3>
            <p className="text-slate-600">Duração</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FileText className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{infoTesteClimaBemEstar.questoes}</h3>
            <p className="text-slate-600">Questões</p>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">
            Benefícios do HumaniQ Insight
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="group"
              >
                <Card className="bg-white/80 border-slate-200 backdrop-blur-sm hover:bg-white/90 hover:shadow-lg transition-all duration-300 h-full shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl group-hover:scale-110 transition-transform duration-300 border border-blue-100">
                        <benefit.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Dimensions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-4">
            Dimensões Avaliadas
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            O teste avalia {infoTesteClimaBemEstar.dimensoes} dimensões fundamentais baseadas em teorias científicas validadas
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {dimensions.map((dimension, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                onMouseEnter={() => setHoveredDimension(index)}
                onMouseLeave={() => setHoveredDimension(null)}
                className="group cursor-pointer"
              >
                <Card className={`bg-white/80 border-slate-200 backdrop-blur-sm transition-all duration-300 h-full shadow-sm ${
                  hoveredDimension === index ? 'bg-white/90 scale-105 shadow-lg' : 'hover:bg-white/90 hover:shadow-md'
                }`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl transition-all duration-300 border ${
                        hoveredDimension === index 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 scale-110 border-blue-600' 
                          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
                      }`}>
                        <dimension.icon className={`w-6 h-6 transition-colors duration-300 ${
                          hoveredDimension === index ? 'text-white' : 'text-blue-600'
                        }`} />
                      </div>
                      <CardTitle className="text-slate-800 text-lg">
                        {dimension.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-slate-600 leading-relaxed">
                      {dimension.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Scientific Foundation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-16"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-slate-200 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <Award className="w-6 h-6 mr-3 text-amber-600" />
              Fundamentação Científica
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Base Teórica</h3>
                <div className="space-y-3">
                  {infoTesteClimaBemEstar.basesCientificas.map((base, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-slate-600 text-sm">{base}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Metodologia</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-slate-600 text-sm">Escala Likert de 5 pontos validada</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-slate-600 text-sm">Análise multidimensional integrada</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-slate-600 text-sm">Relatório com recomendações personalizadas</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-slate-600 text-sm">Benchmarking organizacional</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Test Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mb-16"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-slate-200 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Detalhes do Teste</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Clock className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Duração</h3>
                <p className="text-slate-600">{infoTesteClimaBemEstar.duracao}</p>
              </div>
              <div>
                <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <FileText className="w-8 h-8 text-violet-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Questões</h3>
                <p className="text-slate-600">{infoTesteClimaBemEstar.questoes} questões objetivas</p>
              </div>
              <div>
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Award className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Resultado</h3>
                <p className="text-slate-600">Relatório detalhado com análise de IA</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mb-16"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-slate-200 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 text-blue-600" />
              Instruções Importantes
            </h2>
            <div className="space-y-4">
              {infoTesteClimaBemEstar.instrucoes.map((instrucao, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm flex-shrink-0 shadow-sm">
                    {index + 1}
                  </div>
                  <p className="text-slate-600 leading-relaxed">{instrucao}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <Button
            variant="outline"
            onClick={handleBackToTests}
            className="bg-white/80 text-slate-700 border-slate-300 hover:bg-white/90 hover:text-slate-800 transition-colors backdrop-blur-sm shadow-sm px-8 py-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Testes
          </Button>
          <Button
            onClick={handleStartTest}
            disabled={isStarting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-3"
          >
            {isStarting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Iniciando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Iniciar Teste
              </>
            )}
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="text-center text-blue-100/60 text-sm"
        >
          <p className="mb-2">
            <strong>HumaniQ Insight</strong> • {infoTesteClimaBemEstar.questoes} questões • {infoTesteClimaBemEstar.duracao} • Baseado em teorias científicas validadas
          </p>
          <p>© 2024 HumaniQ. Todos os direitos reservados.</p>
        </motion.div>
      </div>
    </div>
  )
}