import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Clock, 
  Users, 
  CheckSquare, 
  ArrowRight,
  Calendar,
  Star,
  AlertCircle
} from 'lucide-react';

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

interface KarasekActionPlanProps {
  resultado: ResultadoKarasekSiegrist;
}

interface Acao {
  titulo: string;
  descricao: string;
  prazo: string;
  prioridade: 'alta' | 'media' | 'baixa';
  responsavel: string;
  recursos: string[];
}

const recomendacoesPorDimensao: Record<string, {
  nome: string;
  acoes: Acao[];
}> = {
  'demanda-psicologica': {
    nome: 'Demanda Psicológica',
    acoes: [
      {
        titulo: 'Reorganização de Tarefas',
        descricao: 'Revisar e redistribuir cargas de trabalho para evitar sobrecarga',
        prazo: '2-4 semanas',
        prioridade: 'alta',
        responsavel: 'Gestão direta',
        recursos: ['Análise de processos', 'Redistribuição de equipe']
      },
      {
        titulo: 'Técnicas de Gestão do Tempo',
        descricao: 'Implementar metodologias como Pomodoro e priorização de tarefas',
        prazo: '1-2 semanas',
        prioridade: 'media',
        responsavel: 'Individual',
        recursos: ['Treinamento', 'Ferramentas digitais']
      }
    ]
  },
  'controle-autonomia': {
    nome: 'Controle e Autonomia',
    acoes: [
      {
        titulo: 'Ampliação da Autonomia',
        descricao: 'Negociar maior flexibilidade nas decisões do dia a dia',
        prazo: '4-6 semanas',
        prioridade: 'alta',
        responsavel: 'Gestão + RH',
        recursos: ['Revisão de políticas', 'Treinamento de liderança']
      },
      {
        titulo: 'Participação em Decisões',
        descricao: 'Criar canais para participação em decisões que afetam o trabalho',
        prazo: '6-8 semanas',
        prioridade: 'media',
        responsavel: 'Liderança',
        recursos: ['Comitês participativos', 'Reuniões regulares']
      }
    ]
  },
  'apoio-social': {
    nome: 'Apoio Social',
    acoes: [
      {
        titulo: 'Fortalecimento de Vínculos',
        descricao: 'Promover atividades de integração e trabalho em equipe',
        prazo: '2-3 semanas',
        prioridade: 'media',
        responsavel: 'RH + Equipe',
        recursos: ['Eventos de integração', 'Projetos colaborativos']
      },
      {
        titulo: 'Programa de Mentoria',
        descricao: 'Estabelecer sistema de apoio entre colegas experientes e novatos',
        prazo: '4-6 semanas',
        prioridade: 'baixa',
        responsavel: 'RH',
        recursos: ['Treinamento de mentores', 'Estrutura formal']
      }
    ]
  },
  'esforco-exigido': {
    nome: 'Esforço Exigido',
    acoes: [
      {
        titulo: 'Otimização de Processos',
        descricao: 'Identificar e eliminar atividades desnecessárias ou redundantes',
        prazo: '3-5 semanas',
        prioridade: 'alta',
        responsavel: 'Gestão de processos',
        recursos: ['Mapeamento de processos', 'Automação']
      },
      {
        titulo: 'Pausas Estratégicas',
        descricao: 'Implementar intervalos regulares para recuperação física e mental',
        prazo: '1 semana',
        prioridade: 'media',
        responsavel: 'Individual + Gestão',
        recursos: ['Política de pausas', 'Espaços de descanso']
      }
    ]
  },
  'recompensas-recebidas': {
    nome: 'Recompensas Recebidas',
    acoes: [
      {
        titulo: 'Sistema de Reconhecimento',
        descricao: 'Implementar programa estruturado de reconhecimento e feedback',
        prazo: '6-8 semanas',
        prioridade: 'alta',
        responsavel: 'RH + Liderança',
        recursos: ['Política de reconhecimento', 'Orçamento para incentivos']
      },
      {
        titulo: 'Plano de Desenvolvimento',
        descricao: 'Criar trilhas claras de crescimento profissional e capacitação',
        prazo: '8-12 semanas',
        prioridade: 'media',
        responsavel: 'RH + Gestão',
        recursos: ['Mapeamento de competências', 'Orçamento para treinamentos']
      }
    ]
  },
  'hipercomprometimento': {
    nome: 'Hipercomprometimento',
    acoes: [
      {
        titulo: 'Estabelecimento de Limites',
        descricao: 'Definir horários claros e respeitar o tempo de descanso',
        prazo: '2-3 semanas',
        prioridade: 'alta',
        responsavel: 'Individual + Gestão',
        recursos: ['Política de horários', 'Monitoramento de horas extras']
      },
      {
        titulo: 'Práticas de Bem-estar',
        descricao: 'Incorporar atividades de relaxamento e mindfulness na rotina',
        prazo: '1-2 semanas',
        prioridade: 'media',
        responsavel: 'Individual',
        recursos: ['Apps de meditação', 'Programas de bem-estar']
      }
    ]
  }
};

export function KarasekActionPlan({ resultado }: KarasekActionPlanProps) {
  const dimensoesAltoRisco = Object.entries(resultado.dimensoes)
    .filter(([_, dados]) => dados && (dados.nivel === 'alto' || dados.nivel === 'moderado'))
    .sort(([, a], [, b]) => b.percentual - a.percentual);

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPrioridadeIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return <AlertCircle className="h-4 w-4" />;
      case 'media': return <Clock className="h-4 w-4" />;
      case 'baixa': return <CheckSquare className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <Card className="bg-white shadow-sm border border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Target className="h-6 w-6 text-blue-600" />
            Plano de Ação Estratégico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-800">
                {dimensoesAltoRisco.length}
              </div>
              <div className="text-sm text-blue-600">Dimensões Prioritárias</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-2xl font-bold text-amber-800">
                {dimensoesAltoRisco.reduce((acc, [dimensaoId]) => 
                  acc + (recomendacoesPorDimensao[dimensaoId]?.acoes.length || 0), 0
                )}
              </div>
              <div className="text-sm text-amber-600">Ações Recomendadas</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-800">
                2-12
              </div>
              <div className="text-sm text-green-600">Semanas para Implementação</div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Recomendação Principal
            </h4>
            <p className="text-sm text-slate-700">
              {resultado.riscoGeral.nivel === 'alto' 
                ? 'Implementação imediata das ações de alta prioridade com acompanhamento semanal dos resultados.'
                : resultado.riscoGeral.nivel === 'moderado'
                  ? 'Foco nas dimensões de maior risco com implementação gradual e monitoramento mensal.'
                  : 'Manutenção das práticas atuais com melhorias pontuais nas áreas identificadas.'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Planos por Dimensão */}
      {dimensoesAltoRisco.map(([dimensaoId, dados]) => {
        const recomendacao = recomendacoesPorDimensao[dimensaoId];
        if (!recomendacao) return null;

        return (
          <Card key={dimensaoId} className="bg-white shadow-sm border border-slate-200/60">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5 text-blue-600" />
                  {recomendacao.nome}
                </div>
                <Badge 
                  variant={dados.nivel === 'alto' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {dados.percentual}% - {dados.nivel}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recomendacao.acoes.map((acao, index) => (
                  <div 
                    key={index}
                    className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-slate-800">{acao.titulo}</h4>
                      <Badge 
                        className={`text-xs ${getPrioridadeColor(acao.prioridade)} flex items-center gap-1`}
                      >
                        {getPrioridadeIcon(acao.prioridade)}
                        {acao.prioridade}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-3">{acao.descricao}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-600">
                          <strong>Prazo:</strong> {acao.prazo}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-600">
                          <strong>Responsável:</strong> {acao.responsavel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-600">
                          <strong>Recursos:</strong> {acao.recursos.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Cronograma de Implementação */}
      <Card className="bg-white shadow-sm border border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-6 w-6 text-blue-600" />
            Cronograma de Implementação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
              <div className="font-semibold text-red-800">Semanas 1-2: Ações Imediatas</div>
              <div className="text-sm text-red-700">
                Implementar técnicas de gestão do tempo, estabelecer limites de horário e iniciar práticas de bem-estar
              </div>
            </div>
            <div className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded">
              <div className="font-semibold text-amber-800">Semanas 3-6: Mudanças Estruturais</div>
              <div className="text-sm text-amber-700">
                Reorganizar tarefas, ampliar autonomia e fortalecer vínculos sociais no trabalho
              </div>
            </div>
            <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
              <div className="font-semibold text-green-800">Semanas 7-12: Consolidação</div>
              <div className="text-sm text-green-700">
                Implementar sistemas de reconhecimento, programas de mentoria e planos de desenvolvimento
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Próximos Passos</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
              <li>Compartilhe este plano com sua liderança e RH</li>
              <li>Priorize as ações de alta prioridade para implementação imediata</li>
              <li>Estabeleça um cronograma de acompanhamento semanal/mensal</li>
              <li>Reavalie os resultados após 3 meses de implementação</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}