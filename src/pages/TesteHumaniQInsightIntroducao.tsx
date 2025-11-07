'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingAnimation from "@/components/LoadingAnimation"
import { 
  Shield, 
  Users, 
  MessageSquare, 
  Heart, 
  Scale, 
  Sparkles,
  Lightbulb, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  Play,
  BarChart3,
  TrendingUp,
  
  Clock,
  Award,
  Puzzle,
  Building2
} from 'lucide-react'
import Logo from '@/components/Logo';

export default function TesteHumaniQInsightIntroducao() {
  const navigate = useNavigate()
  const [hoveredDimension, setHoveredDimension] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleStartTest = async () => {
    setIsLoading(true)
  }

  const handleLoadingComplete = () => {
    navigate('/teste/humaniq-insight/perguntas')
  }

  // Renderizar animação de carregamento
  if (isLoading) {
    return (
      <LoadingAnimation 
        onComplete={handleLoadingComplete}
        testName="HumaniQ Insight"
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
      description: 'Liberdade para se expressar sem medo de julgamento ou retaliação.'
    },
    {
      icon: MessageSquare,
      title: 'Comunicação Interna',
      description: 'Clareza, abertura e fluxo de informação entre times e lideranças.'
    },
    {
      icon: Users,
      title: 'Pertencimento e Inclusão',
      description: 'Sentimento de ser aceito, valorizado e integrado à equipe.'
    },
    {
      icon: Scale,
      title: 'Justiça Organizacional',
      description: 'Percepção de equidade, ética, transparência e reconhecimento.'
    }
  ]

  const benefits = [
    {
      icon: Shield,
      title: 'Segurança Emocional',
      description: 'Fortalece cultura de segurança psicológica no ambiente de trabalho'
    },
    {
      icon: MessageSquare,
      title: 'Comunicação Efetiva',
      description: 'Melhora comunicação e colaboração entre equipes'
    },
    {
      icon: Heart,
      title: 'Ambiente Saudável',
      description: 'Promove ambiente saudável e mais engajado'
    },
    {
      icon: TrendingUp,
      title: 'Redução de Conflitos',
      description: 'Reduz conflitos e rotatividade por clima tóxico'
    }
  ]

  const scientificBases = [
    'Segurança Psicológica (Amy Edmondson, 1999)',
    'Comunicação Organizacional (Clampitt, 2012)',
    'Teoria do Pertencimento (Baumeister & Leary, 1995)',
    'Justiça Organizacional (Greenberg, 1990)'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-100 text-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
              <Logo size="sm" showText={false} className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-violet-800 to-purple-700 bg-clip-text text-transparent">
            HumaniQ Insight
          </h1>
          <p className="text-xl text-purple-700 mb-2 font-medium">
            Clima Organizacional e Bem-Estar Psicológico
          </p>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Avalia a percepção dos colaboradores sobre aspectos psicossociais do ambiente de trabalho que influenciam diretamente o bem-estar, a motivação e o engajamento
          </p>
        </div>

        {/* Dimensões */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-slate-800">
            Dimensões Psicossociais Avaliadas
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {dimensions.map((dimension, index) => (
              <div
                key={index}
                className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl ${
                  hoveredDimension === index ? 'bg-white scale-105 border-purple-300' : ''
                }`}
                onMouseEnter={() => setHoveredDimension(index)}
                onMouseLeave={() => setHoveredDimension(null)}
                data-testid={`dimension-card-${index}`}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mr-4 shadow-md">
                    <dimension.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {dimension.title}
                  </h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {dimension.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Base Científica */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-slate-800">
            Base Científica
          </h2>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-slate-200 shadow-lg">
            <div className="grid md:grid-cols-2 gap-4">
              {scientificBases.map((base, index) => (
                <div key={index} className="flex items-center gap-3" data-testid={`scientific-base-${index}`}>
                  <div className="w-2 h-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full" />
                  <p className="text-slate-700 font-medium">{base}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefícios */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-slate-800">
            Benefícios para sua Organização
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg text-center hover:shadow-xl hover:scale-105 transition-all duration-300"
                data-testid={`benefit-card-${index}`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-md">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Informações do Teste */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-slate-200 shadow-lg mb-12">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Duração</h3>
              <p className="text-slate-600">Aproximadamente 15-20 minutos</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Puzzle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Questões</h3>
              <p className="text-slate-600">48 questões objetivas</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Resultado</h3>
              <p className="text-slate-600">Relatório detalhado com análise de IA</p>
            </div>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-8 border border-purple-200 shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <Lightbulb className="w-7 h-7 text-purple-600" />
            Instruções Importantes
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-slate-700">Leia cada afirmação com atenção</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-slate-700">Responda com base na sua percepção atual do ambiente de trabalho</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-slate-700">Use a escala de 1 (Discordo totalmente) a 5 (Concordo totalmente)</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-slate-700">Seja honesto e objetivo em suas respostas</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <p className="text-slate-700">Não há respostas certas ou erradas</p>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleBackToTests}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/80 hover:bg-white text-slate-700 font-medium shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar aos Testes
          </button>
          <button
            onClick={handleStartTest}
            className="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            data-testid="button-start"
          >
            <Play className="w-5 h-5" />
            Iniciar Avaliação
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
