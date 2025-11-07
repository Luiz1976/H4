import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Target, 
  TrendingUp,
  Heart,
  UserCheck,
  Building,
  DollarSign,
  Scale,
  BookOpen,
  Award,
  CheckCircle,
  BarChart3,
  Shield
} from 'lucide-react';
import { configQualidadeVidaTrabalho } from '@/lib/testes/qualidade-vida-trabalho';
import { motion } from 'framer-motion';
import LoadingAnimation from '@/components/LoadingAnimation';

const dimensions = [
  {
    name: 'Satisfação com a Função',
    icon: Heart,
    description: 'Avalia o nível de realização e satisfação com as atividades desempenhadas',
    color: 'text-blue-600'
  },
  {
    name: 'Relação com Liderança',
    icon: UserCheck,
    description: 'Mede a qualidade da relação e comunicação com gestores e líderes',
    color: 'text-green-600'
  },
  {
    name: 'Estrutura e Condições de Trabalho',
    icon: Building,
    description: 'Analisa recursos, ambiente físico e estrutura organizacional',
    color: 'text-purple-600'
  },
  {
    name: 'Recompensas e Remuneração',
    icon: DollarSign,
    description: 'Avalia satisfação com remuneração, benefícios e reconhecimento',
    color: 'text-orange-600'
  },
  {
    name: 'Equilíbrio Vida-Trabalho',
    icon: Scale,
    description: 'Mede a capacidade de conciliar vida pessoal e profissional',
    color: 'text-teal-600'
  }
];

const qualityLevels = [
  { level: 'Excelente', range: '85-100', color: 'bg-green-100 text-green-800', description: 'Qualidade de vida excepcional' },
  { level: 'Boa', range: '70-84', color: 'bg-blue-100 text-blue-800', description: 'Qualidade de vida satisfatória' },
  { level: 'Regular', range: '55-69', color: 'bg-yellow-100 text-yellow-800', description: 'Qualidade de vida moderada' },
  { level: 'Baixa', range: '40-54', color: 'bg-orange-100 text-orange-800', description: 'Qualidade de vida comprometida' },
  { level: 'Crítica', range: '0-39', color: 'bg-red-100 text-red-800', description: 'Qualidade de vida muito baixa' }
];

export default function TesteQVTIntroducao() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleIniciarTeste = () => {
    setIsLoading(true);
  };

  const handleLoadingComplete = () => {
    navigate('/teste/qualidade-vida-trabalho/perguntas');
  };

  // Renderizar animação de carregamento
  if (isLoading) {
    return (
      <LoadingAnimation 
        onComplete={handleLoadingComplete}
        testName={configQualidadeVidaTrabalho.nome}
        duration={8000}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/testes')}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar aos Testes</span>
              </Button>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Avaliação de Qualidade de Vida
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            {configQualidadeVidaTrabalho.nome}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {configQualidadeVidaTrabalho.descricao}
          </p>
        </motion.div>

        {/* Statistical Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <Card className="text-center bg-white/80 border-slate-200 backdrop-blur-sm shadow-sm hover:bg-white/90 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">{configQualidadeVidaTrabalho.numeroPerguntas}</div>
              <div className="text-sm text-slate-600">Perguntas</div>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-white/80 border-slate-200 backdrop-blur-sm shadow-sm hover:bg-white/90 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-emerald-600 mb-2">{configQualidadeVidaTrabalho.dimensoes.length}</div>
              <div className="text-sm text-slate-600">Dimensões</div>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-white/80 border-slate-200 backdrop-blur-sm shadow-sm hover:bg-white/90 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-sm text-slate-600">Precisão</div>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-white/80 border-slate-200 backdrop-blur-sm shadow-sm hover:bg-white/90 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-indigo-600 mb-2">{configQualidadeVidaTrabalho.tempoEstimado}</div>
              <div className="text-sm text-slate-600">Duração</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Colored Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <Clock className="h-8 w-8" />
                <span className="text-lg font-semibold">Tempo Otimizado</span>
              </div>
              <p className="text-blue-100 text-sm">
                Avaliação completa em apenas {configQualidadeVidaTrabalho.tempoEstimado}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <BookOpen className="h-8 w-8" />
                <span className="text-lg font-semibold">Base Científica</span>
              </div>
              <p className="text-emerald-100 text-sm">
                Alinhado com ISO 45001 e conceitos ESG
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <Scale className="h-8 w-8" />
                <span className="text-lg font-semibold">Escala Likert</span>
              </div>
              <p className="text-blue-100 text-sm">
                Medição precisa de 1 a 5 pontos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-0 hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <BarChart3 className="h-8 w-8" />
                <span className="text-lg font-semibold">Índice Geral</span>
              </div>
              <p className="text-indigo-100 text-sm">
                Score consolidado de qualidade de vida
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dimensions Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Dimensões Avaliadas</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Nossa avaliação abrange aspectos fundamentais da qualidade de vida no trabalho
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dimensions.map((dimension, index) => (
              <motion.div
                key={dimension.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              >
                <Card className="h-full bg-white/80 border-slate-200 backdrop-blur-sm shadow-sm hover:bg-white/90 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`p-2 rounded-lg bg-slate-50 shadow-sm`}>
                        <dimension.icon className={`h-6 w-6 ${dimension.color}`} />
                      </div>
                      <h3 className="font-semibold text-slate-800">{dimension.name}</h3>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {dimension.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quality Levels */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Níveis de Qualidade de Vida</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Entenda como interpretamos os resultados da sua avaliação
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {qualityLevels.map((level, index) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
              >
                <Card className="text-center h-full bg-white/80 border-slate-200 backdrop-blur-sm shadow-sm hover:bg-white/90 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <Badge className={`mb-3 ${level.color}`}>
                      {level.level}
                    </Badge>
                    <div className="text-sm font-medium text-slate-800 mb-2">{level.range} pontos</div>
                    <div className="text-xs text-slate-600">{level.description}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Scientific Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Shield className="h-6 w-6 text-blue-200" />
                <span>Fundamentação Científica</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-white mb-3">Bases Científicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-blue-300">
                    <Award className="h-5 w-5 text-blue-200" />
                    <div>
                      <div className="font-medium text-white">ISO 45001</div>
                      <div className="text-xs text-blue-200">Saúde e Segurança Ocupacional</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-emerald-300">
                    <Target className="h-5 w-5 text-emerald-200" />
                    <div>
                      <div className="font-medium text-white">ESG</div>
                      <div className="text-xs text-emerald-200">Sustentabilidade Corporativa</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-indigo-300">
                    <Users className="h-5 w-5 text-indigo-200" />
                    <div>
                      <div className="font-medium text-white">Psicologia Organizacional</div>
                      <div className="text-xs text-indigo-200">Bem-estar no Trabalho</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-white mb-3">Validação Científica</h3>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-300 mt-0.5" />
                    <div className="text-sm text-blue-100">
                      <p className="mb-2">
                        <strong className="text-white">Metodologia validada</strong> por especialistas em Psicologia Organizacional e Gestão de Pessoas, 
                        com base em pesquisas científicas sobre qualidade de vida no trabalho.
                      </p>
                      <p>
                        <strong className="text-white">Confiabilidade estatística</strong> comprovada através de testes com mais de 10.000 colaboradores 
                        em diferentes setores e organizações.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Objectives and Benefits */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mb-12"
        >
          <Card className="bg-white/80 border-slate-200 backdrop-blur-sm shadow-sm hover:bg-white/90 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-slate-800">Objetivos e Benefícios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-slate-800">Objetivos</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                      <span>Identificar fatores que impactam a qualidade de vida no trabalho</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                      <span>Avaliar o bem-estar físico e mental dos colaboradores</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                      <span>Medir a satisfação com o ambiente organizacional</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    <h3 className="font-semibold text-slate-800">Benefícios</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                      <span>Melhoria do clima organizacional</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                      <span>Redução do turnover e absenteísmo</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                      <span>Aumento da produtividade e engajamento</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Logo and CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="text-center"
        >
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-full mb-4 shadow-lg">
              <div className="text-blue-200 font-bold text-2xl">QVT</div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">HumaniQ QVT</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Transforme o ambiente de trabalho da sua organização através de insights precisos sobre qualidade de vida.
            </p>
          </div>
          
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={handleIniciarTeste}
          >
            <span className="mr-2">Iniciar Avaliação</span>
            <TrendingUp className="h-5 w-5" />
          </Button>
          <p className="text-sm text-slate-600 mt-4">
            Tempo estimado: {configQualidadeVidaTrabalho.tempoEstimado} • {configQualidadeVidaTrabalho.numeroPerguntas} perguntas
          </p>
        </motion.div>
      </div>
    </div>
  );
}