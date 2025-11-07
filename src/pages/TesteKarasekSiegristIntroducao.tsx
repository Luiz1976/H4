'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import LoadingAnimation from '@/components/LoadingAnimation'
import { ArrowLeft, ArrowRight, Clock, Users, Target, TrendingUp, Heart, Zap, Award, BookOpen, AlertTriangle, CheckCircle, Info, Scale, BarChart3, Shield } from 'lucide-react'
import Logo from "@/components/Logo";

export default function TesteKarasekSiegristIntroducao() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleStartTest = () => {
    setIsLoading(true)
  }

  const handleLoadingComplete = () => {
    navigate('/teste/karasek-siegrist/perguntas')
  }

  // Renderizar animação de carregamento
  if (isLoading) {
    return (
      <LoadingAnimation 
        onComplete={handleLoadingComplete}
        testName="Karasek-Siegrist"
        duration={8000}
      />
    )
  }

  const dimensoes = [
    {
      titulo: 'Demanda Psicológica',
      descricao: 'Pressão temporal, carga mental e emocional do trabalho',
      icon: Target,
      cor: 'bg-gradient-to-br from-blue-600 to-indigo-600',
      textoCor: 'text-white'
    },
    {
      titulo: 'Controle do Trabalho',
      descricao: 'Autonomia, uso de habilidades e participação nas decisões',
      icon: Scale,
      cor: 'bg-gradient-to-br from-emerald-600 to-teal-600',
      textoCor: 'text-white'
    },
    {
      titulo: 'Apoio Social',
      descricao: 'Suporte de colegas e supervisores no ambiente de trabalho',
      icon: Users,
      cor: 'bg-gradient-to-br from-violet-600 to-purple-600',
      textoCor: 'text-white'
    },
    {
      titulo: 'Esforço-Recompensa',
      descricao: 'Equilíbrio entre esforço despendido e recompensas recebidas',
      icon: BarChart3,
      cor: 'bg-gradient-to-br from-amber-600 to-orange-600',
      textoCor: 'text-white'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/testes')}
            className="mb-4 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Testes
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Modelo Karasek-Siegrist
            </h1>
            <p className="text-xl text-blue-700 max-w-3xl mx-auto">
              Avaliação abrangente do estresse ocupacional através da análise das demandas, 
              controle, apoio social e equilíbrio esforço-recompensa no trabalho
            </p>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-800">40-50</div>
              <div className="text-sm text-slate-600">Minutos</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-800">67</div>
              <div className="text-sm text-slate-600">Questões</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Target className="w-8 h-8 text-violet-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-800">4</div>
              <div className="text-sm text-slate-600">Dimensões</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-amber-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-800">95%</div>
              <div className="text-sm text-slate-600">Precisão</div>
            </CardContent>
          </Card>
        </div>

        {/* Cards Coloridos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <Logo size="lg" showText={false} className="mx-auto mb-4 opacity-90" />
              <h3 className="text-lg font-semibold mb-2">Demanda</h3>
              <p className="text-sm opacity-90">Pressão e carga mental</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <Scale className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-lg font-semibold mb-2">Controle</h3>
              <p className="text-sm opacity-90">Autonomia e decisão</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-lg font-semibold mb-2">Apoio</h3>
              <p className="text-sm opacity-90">Suporte social</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-lg font-semibold mb-2">Equilíbrio</h3>
              <p className="text-sm opacity-90">Esforço-recompensa</p>
            </CardContent>
          </Card>
        </div>

        {/* Dimensões Avaliadas */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              Dimensões Avaliadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dimensoes.map((dimensao, index) => (
                <div key={index} className={`p-6 rounded-xl ${dimensao.cor} ${dimensao.textoCor} shadow-lg hover:shadow-xl transition-all duration-300`}>
                  <div className="flex items-start gap-4">
                    <dimensao.icon className="w-8 h-8 flex-shrink-0 opacity-90" />
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{dimensao.titulo}</h3>
                      <p className="opacity-90">{dimensao.descricao}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Informações Gerais */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-600" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800">Duração</h3>
                </div>
                <p className="text-blue-700 mb-2">Tempo estimado: 40-50 minutos</p>
                <p className="text-sm text-blue-600">Responda com calma e atenção para resultados mais precisos</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-emerald-800">Aplicação</h3>
                </div>
                <p className="text-emerald-700 mb-2">Individual ou coletiva</p>
                <p className="text-sm text-emerald-600">Adequado para trabalhadores de todas as áreas</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-violet-800">Validação</h3>
                </div>
                <p className="text-violet-700 mb-2">Cientificamente validado</p>
                <p className="text-sm text-violet-600">Amplamente utilizado em pesquisas internacionais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fundamentação Científica */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              Fundamentação Científica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <h3 className="text-xl font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Modelo Demanda-Controle-Apoio (Karasek)
                </h3>
                <p className="text-emerald-700 mb-3">
                  Desenvolvido por Robert Karasek, este modelo propõe que o estresse ocupacional resulta 
                  da interação entre as demandas psicológicas do trabalho e o grau de controle que o 
                  trabalhador possui sobre suas atividades.
                </p>
                <ul className="text-emerald-600 text-sm space-y-1">
                  <li>• <strong>Alta Demanda + Baixo Controle:</strong> Situação de alto estresse</li>
                  <li>• <strong>Alta Demanda + Alto Controle:</strong> Trabalho ativo e desafiador</li>
                  <li>• <strong>Baixa Demanda + Baixo Controle:</strong> Trabalho passivo</li>
                  <li>• <strong>Apoio Social:</strong> Fator moderador do estresse</li>
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <h3 className="text-xl font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Modelo Esforço-Recompensa (Siegrist)
                </h3>
                <p className="text-blue-700 mb-3">
                  Criado por Johannes Siegrist, este modelo foca no desequilíbrio entre o esforço 
                  despendido no trabalho e as recompensas recebidas (salário, reconhecimento, 
                  segurança no emprego, oportunidades de carreira).
                </p>
                <ul className="text-blue-600 text-sm space-y-1">
                  <li>• <strong>Alto Esforço + Baixa Recompensa:</strong> Situação de estresse crônico</li>
                  <li>• <strong>Comprometimento Excessivo:</strong> Padrão de enfrentamento inadequado</li>
                  <li>• <strong>Reciprocidade Social:</strong> Expectativa de retorno justo</li>
                  <li>• <strong>Impacto na Saúde:</strong> Riscos cardiovasculares e psicológicos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Objetivos */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-600" />
              Objetivos da Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex-shrink-0">
                    <Logo size="sm" showText={false} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Identificar Fatores de Estresse</h4>
                    <p className="text-sm text-slate-600">Mapear as principais fontes de estresse no ambiente de trabalho</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex-shrink-0">
                    <Scale className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Avaliar Recursos de Enfrentamento</h4>
                    <p className="text-sm text-slate-600">Analisar o controle e apoio disponíveis para lidar com demandas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex-shrink-0">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Promover Bem-estar</h4>
                    <p className="text-sm text-slate-600">Contribuir para a melhoria da qualidade de vida no trabalho</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex-shrink-0">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Orientar Intervenções</h4>
                    <p className="text-sm text-slate-600">Fornecer dados para ações preventivas e corretivas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex-shrink-0">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Prevenir Adoecimento</h4>
                    <p className="text-sm text-slate-600">Identificar riscos antes que se tornem problemas de saúde</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Melhorar Performance</h4>
                    <p className="text-sm text-slate-600">Otimizar condições para maior produtividade e satisfação</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefícios */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
              <Award className="w-6 h-6 text-teal-600" />
              Benefícios da Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <Zap className="w-8 h-8 text-emerald-600 mb-4" />
                <h4 className="font-semibold text-emerald-800 mb-2">Para o Indivíduo</h4>
                <ul className="text-emerald-700 text-sm space-y-1">
                  <li>• Autoconhecimento profissional</li>
                  <li>• Identificação de pontos de melhoria</li>
                  <li>• Estratégias de enfrentamento</li>
                  <li>• Prevenção de burnout</li>
                </ul>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <Users className="w-8 h-8 text-blue-600 mb-4" />
                <h4 className="font-semibold text-blue-800 mb-2">Para a Equipe</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Melhoria da comunicação</li>
                  <li>• Fortalecimento do apoio social</li>
                  <li>• Redução de conflitos</li>
                  <li>• Maior coesão grupal</li>
                </ul>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                <TrendingUp className="w-8 h-8 text-violet-600 mb-4" />
                <h4 className="font-semibold text-violet-800 mb-2">Para a Organização</h4>
                <ul className="text-violet-700 text-sm space-y-1">
                  <li>• Redução do absenteísmo</li>
                  <li>• Maior produtividade</li>
                  <li>• Melhoria do clima organizacional</li>
                  <li>• Retenção de talentos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              Instruções Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-2">Antes do Teste</h4>
                <ul className="text-amber-700 text-sm space-y-1">
                  <li>• Escolha um ambiente tranquilo e sem interrupções</li>
                  <li>• Reserve tempo suficiente (40-50 minutos)</li>
                  <li>• Reflita sobre sua experiência de trabalho atual</li>
                  <li>• Responda com base nos últimos 6 meses</li>
                </ul>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Durante o Teste</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Leia cada questão com atenção</li>
                  <li>• Responda de forma honesta e espontânea</li>
                  <li>• Não há respostas certas ou erradas</li>
                  <li>• Marque apenas uma resposta por questão</li>
                  <li>• Evite respostas neutras em excesso</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Considerações e Limitações */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
              <Info className="w-6 h-6 text-slate-600" />
              Considerações e Limitações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2">Fatores que Podem Influenciar</h4>
                <ul className="text-slate-700 text-sm space-y-1">
                  <li>• Estado emocional atual</li>
                  <li>• Eventos recentes no trabalho</li>
                  <li>• Mudanças organizacionais</li>
                  <li>• Condições pessoais de saúde</li>
                  <li>• Expectativas profissionais</li>
                </ul>
              </div>

              <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-indigo-800 mb-2">Importante Lembrar</h4>
                <ul className="text-indigo-700 text-sm space-y-1">
                  <li>• Este é um instrumento de triagem, não diagnóstico</li>
                  <li>• Resultados devem ser interpretados por profissionais qualificados</li>
                  <li>• Intervenções requerem análise contextual</li>
                  <li>• Reavaliações periódicas são recomendadas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            onClick={handleStartTest}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Iniciar Avaliação
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}