'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoadingAnimation from "@/components/LoadingAnimation"
import { 
  Building2, 
  Users, 
  Crown, 
  Heart, 
  Trophy, 
  Zap, 
  Lightbulb, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  Play,
  User,
  Smile,
  Activity,
  BarChart3,
  Puzzle,
  Gauge,
  Layers,
  Sparkles,
  Award,
  TrendingUp,
  
  Clock
} from 'lucide-react'
import Logo from '@/components/Logo';

export default function TesteClimaOrganizacionalIntroducao() {
  const navigate = useNavigate()
  const [hoveredDimension, setHoveredDimension] = useState<number | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleStartTest = async () => {
    setIsLoading(true)
  }

  const handleLoadingComplete = () => {
    navigate('/teste/clima-organizacional/perguntas')
  }

  // Renderizar animação de carregamento
  if (isLoading) {
    return (
      <LoadingAnimation 
        onComplete={handleLoadingComplete}
        testName="Clima Organizacional"
        duration={8000}
      />
    );
  }

  const handleBackToTests = () => {
    navigate('/testes')
  }

  const dimensions = [
    {
      icon: Building2,
      title: 'Cultura e Valores',
      description: 'Avalia o alinhamento entre valores organizacionais e práticas diárias.'
    },
    {
      icon: Crown,
      title: 'Liderança',
      description: 'Mede a qualidade da liderança e sua influência no ambiente de trabalho.'
    },
    {
      icon: Users,
      title: 'Relacionamento Interpessoal',
      description: 'Analisa a qualidade dos relacionamentos e cooperação entre colegas.'
    },
    {
      icon: Trophy,
      title: 'Reconhecimento e Recompensas',
      description: 'Avalia como a organização reconhece e valoriza seus colaboradores.'
    },
    {
      icon: TrendingUp,
      title: 'Desenvolvimento Profissional',
      description: 'Mede as oportunidades de crescimento e capacitação oferecidas.'
    },
    {
      icon: Gauge,
      title: 'Condições de Trabalho',
      description: 'Avalia a adequação da infraestrutura e recursos disponíveis.'
    },
    {
      icon: Heart,
      title: 'Engajamento e Bem-estar',
      description: 'Analisa o nível de envolvimento emocional e satisfação no trabalho.'
    }
  ]

  const benefits = [
    {
      icon: Lightbulb,
      title: 'Diagnóstico Organizacional',
      description: 'Identifique pontos fortes e oportunidades de melhoria no clima'
    },
    {
      icon: Building2,
      title: 'Melhoria do Ambiente',
      description: 'Receba insights para criar um ambiente de trabalho mais saudável'
    },
    {
      icon: BarChart3,
      title: 'Aumento da Produtividade',
      description: 'Otimize o desempenho através de um clima organizacional positivo'
    },
    {
      icon: Users,
      title: 'Engajamento da Equipe',
      description: 'Fortaleça o comprometimento e satisfação dos colaboradores'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
            Pesquisa de Clima Organizacional
          </h1>
          <p className="text-xl text-blue-700 mb-2 font-medium">
            Avaliação Completa do Ambiente de Trabalho
          </p>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Descubra como sua organização está performando em aspectos fundamentais que impactam a satisfação e produtividade dos colaboradores
          </p>
        </div>

        {/* Dimensões */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-slate-800">
            Dimensões Avaliadas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dimensions.map((dimension, index) => (
              <div
                key={index}
                className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl ${
                  hoveredDimension === index ? 'bg-white scale-105 border-blue-300' : ''
                }`}
                onMouseEnter={() => setHoveredDimension(index)}
                onMouseLeave={() => setHoveredDimension(null)}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4 shadow-md">
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

        {/* Benefícios */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8 text-slate-800">
            Benefícios da Pesquisa
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg text-center hover:shadow-xl hover:scale-105 transition-all duration-300"
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
              <p className="text-slate-600">56 questões objetivas</p>
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm rounded-xl p-8 border border-blue-200 shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <CheckCircle className="w-6 h-6 mr-3 text-emerald-600" />
            Instruções Importantes
          </h2>
          <div className="space-y-4 text-slate-700">
            <p className="flex items-start">
              <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0 text-white shadow-sm">1</span>
              Responda com base na sua experiência atual na organização
            </p>
            <p className="flex items-start">
              <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0 text-white shadow-sm">2</span>
              Seja honesto em suas respostas para obter um diagnóstico preciso
            </p>
            <p className="flex items-start">
              <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0 text-white shadow-sm">3</span>
              Considere os últimos 6 meses de trabalho ao responder
            </p>
            <p className="flex items-start">
              <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0 text-white shadow-sm">4</span>
              A pesquisa pode ser pausada e retomada a qualquer momento
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleBackToTests}
            className="flex items-center px-6 py-3 bg-white/80 hover:bg-white text-slate-700 hover:text-slate-800 rounded-lg transition-all duration-300 backdrop-blur-sm border border-slate-300 shadow-md hover:shadow-lg font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar aos Testes
          </button>
          
          <button
            onClick={handleStartTest}
            disabled={isStarting}
            className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isStarting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Iniciando...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Iniciar Avaliação
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}