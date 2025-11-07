'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Heart,
  Users,
  Building,
  Award,
  Scale,
  Loader2
} from 'lucide-react'

interface QVTResult {
  id: string
  userId: string
  overallScore: number
  dimensionScores: {
    'Satisfação com a Função': number
    'Relação com Liderança': number
    'Estrutura e Condições de Trabalho': number
    'Recompensas e Remuneração': number
    'Equilíbrio Vida-Trabalho': number
  }
  interpretation: string
  recommendations: string
  completedAt: string
  metadata: {
    testType: string
    totalQuestions: number
    dimensions: string[]
  }
}

interface DimensionConfig {
  name: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  description: string
}

const dimensionConfigs: Record<string, DimensionConfig> = {
  'Satisfação com a Função': {
    name: 'Satisfação com a Função',
    icon: Building,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Satisfação com as atividades e responsabilidades'
  },
  'Relação com Liderança': {
    name: 'Relação com Liderança',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Relacionamento com supervisores e gestores'
  },
  'Estrutura e Condições de Trabalho': {
    name: 'Estrutura e Condições de Trabalho',
    icon: Heart,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Ambiente físico, recursos e infraestrutura'
  },
  'Recompensas e Remuneração': {
    name: 'Recompensas e Remuneração',
    icon: Award,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Valorização financeira e reconhecimento'
  },
  'Equilíbrio Vida-Trabalho': {
    name: 'Equilíbrio Vida-Trabalho',
    icon: Scale,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    description: 'Equilíbrio entre vida pessoal e profissional'
  }
}

function getScoreLevel(score: number) {
  if (score >= 4.5) return { level: 'Excelente', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
  if (score >= 3.5) return { level: 'Bom', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' }
  if (score >= 2.5) return { level: 'Moderado', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' }
  if (score >= 1.5) return { level: 'Baixo', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' }
  return { level: 'Crítico', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
}

export default function QVTResultPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [result, setResult] = useState<QVTResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/login')
      return
    }

    fetchResult()
  }, [session, status, params.id])

  const fetchResult = async () => {
    try {
      const response = await fetch(`/api/colaborador/tests/result/${params.id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Resultado não encontrado')
        } else if (response.status === 403) {
          setError('Você não tem permissão para ver este resultado')
        } else {
          setError('Erro ao carregar resultado')
        }
        return
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Erro ao carregar resultado')
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Resultado do Teste QVT',
          text: `Confira meu resultado do Teste de Qualidade de Vida no Trabalho: ${result?.overallScore.toFixed(1)}/5.0`,
          url: window.location.href
        })
      } catch (err) {
        console.log('Erro ao compartilhar:', err)
      }
    } else {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.href)
      alert('Link copiado para a área de transferência!')
    }
  }

  const handleDownloadPDF = () => {
    // Implementar download do PDF
    alert('Funcionalidade de download em desenvolvimento')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando resultado...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => router.push('/colaborador/psicossociais')}>
                Voltar aos Testes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!result) {
    return null
  }

  const overallLevel = getScoreLevel(result.overallScore)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/colaborador/psicossociais')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Testes
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Resultado do Teste QVT
              </h1>
              <p className="text-gray-600">
                Concluído em {new Date(result.completedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Resultado Geral */}
        <Card className={`mb-8 ${overallLevel.bgColor} border-l-4 ${overallLevel.borderColor}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pontuação Geral</h2>
                <p className="text-gray-600">Sua qualidade de vida no trabalho</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-gray-900">
                  {result.overallScore.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">de 5.0</div>
              </div>
            </div>
            
            <div className="mb-4">
              <Progress value={(result.overallScore / 5) * 100} className="h-3" />
            </div>
            
            <Badge className={`${overallLevel.color} ${overallLevel.bgColor} border-0`}>
              {overallLevel.level}
            </Badge>
          </CardContent>
        </Card>

        {/* Dimensões */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análise por Dimensão
            </CardTitle>
            <CardDescription>
              Avaliação detalhada das 5 dimensões da qualidade de vida no trabalho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(result.dimensionScores).map(([dimension, score], index) => {
                const config = dimensionConfigs[dimension]
                const level = getScoreLevel(score)
                const Icon = config.icon
                
                return (
                  <div key={dimension}>
                    <div className={`p-4 rounded-lg ${config.bgColor} border ${level.borderColor}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-white ${config.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{config.name}</h3>
                            <p className="text-sm text-gray-600">{config.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {score.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-500">de 5.0</div>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <Progress value={(score / 5) * 100} className="h-2" />
                      </div>
                      
                      <Badge className={`${level.color} ${level.bgColor} border-0 text-xs`}>
                        {level.level}
                      </Badge>
                    </div>
                    
                    {index < Object.entries(result.dimensionScores).length - 1 && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Interpretação */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Interpretação dos Resultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                {result.interpretation}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Recomendações */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recomendações Personalizadas
            </CardTitle>
            <CardDescription>
              Sugestões para melhorar sua qualidade de vida no trabalho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                {result.recommendations}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Este resultado é confidencial e destinado exclusivamente ao usuário.
            Para mais informações sobre QVT, consulte o setor de Recursos Humanos.
          </p>
        </div>
      </div>
    </div>
  )
}