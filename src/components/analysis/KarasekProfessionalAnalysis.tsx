import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  
  Heart, 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  BookOpen,
  Users,
  Lightbulb
} from 'lucide-react';
import Logo from '@/components/Logo';

interface ResultadoKarasekSiegrist {
  riscoGeral: {
    percentual: number;
    nivel: string;
    classificacao: string;
  };
  dimensoes: Record<string, {
    percentual: number;
    nivel: string;
    classificacao: string;
  }>;
}

interface KarasekProfessionalAnalysisProps {
  resultado: ResultadoKarasekSiegrist;
}

const dimensaoInfo: Record<string, {
  nome: string;
  descricao: string;
  impacto: string;
  icon: React.ReactNode;
}> = {
  'demanda-psicologica': {
    nome: 'Demanda Psicológica',
    descricao: 'Refere-se à carga mental e emocional exigida pelo trabalho',
    impacto: 'Altos níveis podem levar ao esgotamento e estresse crônico',
    icon: <Logo size="sm" showText={false} className="h-5 w-5" />
  },
  'controle-autonomia': {
    nome: 'Controle e Autonomia',
    descricao: 'Capacidade de tomar decisões e controlar o próprio trabalho',
    impacto: 'Baixo controle aumenta significativamente o risco de adoecimento',
    icon: <Target className="h-5 w-5" />
  },
  'apoio-social': {
    nome: 'Apoio Social',
    descricao: 'Suporte recebido de colegas e supervisores no ambiente de trabalho',
    impacto: 'Fundamental para o bem-estar e enfrentamento do estresse',
    icon: <Users className="h-5 w-5" />
  },
  'esforco-exigido': {
    nome: 'Esforço Exigido',
    descricao: 'Demandas físicas e mentais percebidas no trabalho',
    impacto: 'Excesso pode comprometer a saúde física e mental',
    icon: <TrendingUp className="h-5 w-5" />
  },
  'recompensas-recebidas': {
    nome: 'Recompensas Recebidas',
    descricao: 'Reconhecimento, salário e perspectivas de carreira',
    impacto: 'Desequilíbrio esforço-recompensa gera insatisfação e adoecimento',
    icon: <CheckCircle className="h-5 w-5" />
  },
  'hipercomprometimento': {
    nome: 'Hipercomprometimento',
    descricao: 'Envolvimento excessivo e compulsivo com o trabalho',
    impacto: 'Pode levar ao burnout e comprometer a vida pessoal',
    icon: <AlertTriangle className="h-5 w-5" />
  }
};

export function KarasekProfessionalAnalysis({ resultado }: KarasekProfessionalAnalysisProps) {
  const dimensoesOrdenadas = Object.entries(resultado.dimensoes)
    .filter(([_, dados]) => dados)
    .sort(([, a], [, b]) => b.percentual - a.percentual);

  const dimensaoMaiorRisco = dimensoesOrdenadas[0];
  const dimensaoMenorRisco = dimensoesOrdenadas[dimensoesOrdenadas.length - 1];

  const gerarAnaliseGeral = () => {
    const { percentual, nivel, classificacao } = resultado.riscoGeral;
    
    if (nivel === 'baixo') {
      return {
        titulo: 'Perfil Psicossocial Favorável',
        descricao: 'Seu ambiente de trabalho apresenta características protetivas para a saúde mental e bem-estar ocupacional.',
        recomendacao: 'Mantenha as práticas atuais e continue monitorando periodicamente.',
        cor: 'text-green-700',
        bgCor: 'bg-green-50',
        borderCor: 'border-green-200'
      };
    } else if (nivel === 'moderado') {
      return {
        titulo: 'Atenção Necessária',
        descricao: 'Existem fatores de risco que merecem atenção e intervenção preventiva.',
        recomendacao: 'Implemente estratégias de melhoria focadas nas dimensões de maior risco.',
        cor: 'text-amber-700',
        bgCor: 'bg-amber-50',
        borderCor: 'border-amber-200'
      };
    } else {
      return {
        titulo: 'Intervenção Urgente Necessária',
        descricao: 'O ambiente apresenta fatores de risco significativos que podem comprometer a saúde.',
        recomendacao: 'Busque apoio profissional e implemente mudanças imediatas.',
        cor: 'text-red-700',
        bgCor: 'bg-red-50',
        borderCor: 'border-red-200'
      };
    }
  };

  const analiseGeral = gerarAnaliseGeral();

  return (
    <div className="space-y-6">
      {/* Análise Geral */}
      <Card className="bg-white shadow-sm border border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Análise Psicossocial Profissional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className={`${analiseGeral.bgCor} ${analiseGeral.borderCor} border-l-4`}>
            <Heart className={`h-4 w-4 ${analiseGeral.cor}`} />
            <AlertDescription>
              <div className="space-y-2">
                <h4 className={`font-semibold ${analiseGeral.cor}`}>
                  {analiseGeral.titulo}
                </h4>
                <p className="text-sm text-slate-700">
                  {analiseGeral.descricao}
                </p>
                <p className="text-sm font-medium text-slate-800">
                  <strong>Recomendação:</strong> {analiseGeral.recomendacao}
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-800">
                {resultado.riscoGeral.percentual}%
              </div>
              <div className="text-sm text-slate-600">Risco Geral</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-lg font-semibold text-slate-800 capitalize">
                {resultado.riscoGeral.nivel}
              </div>
              <div className="text-sm text-slate-600">Nível de Risco</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-lg font-semibold text-slate-800">
                {resultado.riscoGeral.classificacao}
              </div>
              <div className="text-sm text-slate-600">Classificação</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análise por Dimensões */}
      <Card className="bg-white shadow-sm border border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-blue-600" />
            Análise Detalhada por Dimensões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dimensoesOrdenadas.map(([dimensaoId, dados], index) => {
              const info = dimensaoInfo[dimensaoId];
              if (!info) return null;

              const isHighRisk = dados.nivel === 'alto';
              const isMediumRisk = dados.nivel === 'moderado';

              return (
                <div 
                  key={dimensaoId}
                  className={`p-4 rounded-lg border-l-4 ${
                    isHighRisk 
                      ? 'bg-red-50 border-red-400' 
                      : isMediumRisk 
                        ? 'bg-amber-50 border-amber-400'
                        : 'bg-green-50 border-green-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        isHighRisk 
                          ? 'bg-red-100 text-red-600' 
                          : isMediumRisk 
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-green-100 text-green-600'
                      }`}>
                        {info.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{info.nome}</h4>
                        <p className="text-sm text-slate-600 mt-1">{info.descricao}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={isHighRisk ? 'destructive' : isMediumRisk ? 'secondary' : 'default'}
                        className="mb-1"
                      >
                        {dados.percentual}%
                      </Badge>
                      <div className="text-xs text-slate-500 capitalize">
                        {dados.nivel}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-slate-700">
                    <strong>Impacto:</strong> {info.impacto}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights Científicos */}
      <Card className="bg-white shadow-sm border border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="h-6 w-6 text-blue-600" />
            Insights Baseados em Evidências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">
                Modelo Karasek-Siegrist
              </h4>
              <p className="text-sm text-blue-700">
                Este modelo científico, amplamente validado, identifica que a combinação de alta demanda 
                com baixo controle (modelo Karasek) e o desequilíbrio esforço-recompensa (modelo Siegrist) 
                são os principais preditores de adoecimento ocupacional.
              </p>
            </div>

            {dimensaoMaiorRisco && (
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">
                  Dimensão de Maior Atenção: {dimensaoInfo[dimensaoMaiorRisco[0]]?.nome}
                </h4>
                <p className="text-sm text-orange-700">
                  Com {dimensaoMaiorRisco[1].percentual}% de risco, esta dimensão requer intervenção 
                  prioritária. Estudos mostram que melhorias nesta área podem ter impacto significativo 
                  no bem-estar geral.
                </p>
              </div>
            )}

            {dimensaoMenorRisco && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">
                  Fator Protetor: {dimensaoInfo[dimensaoMenorRisco[0]]?.nome}
                </h4>
                <p className="text-sm text-green-700">
                  Com apenas {dimensaoMenorRisco[1].percentual}% de risco, esta dimensão representa 
                  um fator protetor importante. Mantenha e fortaleça estes aspectos positivos.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}