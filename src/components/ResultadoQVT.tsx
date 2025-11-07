import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Star, 
  Users, 
  Building, 
  Heart, 
  Award, 
  Scale,
  Download,
  Share2,
  Target,
  ArrowLeft
} from "lucide-react";
import { type ResultadoQVT, AlertaCritico } from "@/lib/types";
import { gerarAlertasQVT } from '@/lib/testes/qualidade-vida-trabalho';

interface ResultadoQVTProps {
  resultado: ResultadoQVT;
}

interface DimensionConfig {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  description: string;
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
};

function getScoreLevel(score: number) {
  if (score >= 4.5) return { level: 'Excelente', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
  if (score >= 3.5) return { level: 'Bom', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
  if (score >= 2.5) return { level: 'Moderado', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
  if (score >= 1.5) return { level: 'Baixo', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
  return { level: 'Crítico', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
}

export default function ResultadoQVT({ resultado }: ResultadoQVTProps) {
  // ===== LOGS DETALHADOS PARA DEBUG =====
  console.log('🔍 [RESULTADO-QVT] ===== ANÁLISE COMPLETA DOS DADOS =====');
  console.log('🔍 [RESULTADO-QVT] Objeto resultado completo:', JSON.stringify(resultado, null, 2));
  console.log('🔍 [RESULTADO-QVT] Tipo do resultado:', typeof resultado);
  console.log('🔍 [RESULTADO-QVT] Chaves do objeto resultado:', Object.keys(resultado || {}));
  
  // Verificar campos camelCase vs snake_case
  console.log('🔍 [RESULTADO-QVT] ===== MAPEAMENTO DE CAMPOS =====');
  console.log('🔍 [RESULTADO-QVT] indiceGeral (camelCase):', resultado?.indiceGeral);
  console.log('🔍 [RESULTADO-QVT] indice_geral (snake_case):', resultado?.indice_geral);
  console.log('🔍 [RESULTADO-QVT] nivelGeral (camelCase):', resultado?.nivelGeral);
  console.log('🔍 [RESULTADO-QVT] nivel_geral (snake_case):', resultado?.nivel_geral);
  console.log('🔍 [RESULTADO-QVT] percentualGeral (camelCase):', resultado?.percentualGeral);
  console.log('🔍 [RESULTADO-QVT] percentual_geral (snake_case):', resultado?.percentual_geral);
  
  // Verificar dimensões
  console.log('🔍 [RESULTADO-QVT] ===== DIMENSÕES =====');
  console.log('🔍 [RESULTADO-QVT] satisfacao_funcao:', resultado?.satisfacao_funcao);
  console.log('🔍 [RESULTADO-QVT] relacao_lideranca:', resultado?.relacao_lideranca);
  console.log('🔍 [RESULTADO-QVT] estrutura_condicoes:', resultado?.estrutura_condicoes);
  console.log('🔍 [RESULTADO-QVT] recompensas_remuneracao:', resultado?.recompensas_remuneracao);
  console.log('🔍 [RESULTADO-QVT] equilibrio_vida_trabalho:', resultado?.equilibrio_vida_trabalho);
  
  // Verificar arrays
  console.log('🔍 [RESULTADO-QVT] ===== ARRAYS =====');
  console.log('🔍 [RESULTADO-QVT] pontos_fortes:', resultado?.pontos_fortes);
  console.log('🔍 [RESULTADO-QVT] dimensoes_criticas:', resultado?.dimensoes_criticas);
  console.log('🔍 [RESULTADO-QVT] risco_turnover:', resultado?.risco_turnover);
  
  // Verificar se há dimensões estruturadas
  console.log('🔍 [RESULTADO-QVT] ===== DIMENSÕES ESTRUTURADAS =====');
  console.log('🔍 [RESULTADO-QVT] dimensoes (array estruturado):', resultado?.dimensoes);
  if (resultado?.dimensoes) {
    console.log('🔍 [RESULTADO-QVT] Número de dimensões:', resultado.dimensoes.length);
    resultado.dimensoes.forEach((dim, index) => {
      console.log(`🔍 [RESULTADO-QVT] Dimensão ${index + 1}:`, dim);
    });
  }

  // Gerar alertas críticos
  const alertasCriticos = gerarAlertasQVT(resultado);

  const { 
    indiceGeral, 
    indice_geral,
    dimensoes, 
    dimensoesCriticas, 
    pontoFortes, 
    riscoTurnover, 
    nivelGeral: nivel,
    nivel_geral, 
    recomendacoes, 
    insights,
    dataRealizacao
  } = resultado;

  // Usar os valores corretos (snake_case do banco de dados)
  const indiceAtual = indiceGeral || indice_geral || 0;
  const nivelAtual = nivel || nivel_geral || 'Não Definido';

  console.log('🔍 [RESULTADO-QVT] ===== VALORES FINAIS CALCULADOS =====');
  console.log('🔍 [RESULTADO-QVT] indiceAtual final:', indiceAtual);
  console.log('🔍 [RESULTADO-QVT] nivelAtual final:', nivelAtual);
  console.log('🔍 [RESULTADO-QVT] Percentual calculado:', (indiceAtual / 5) * 100);

  // Processar pontos fortes e dimensões críticas dos dados reais
  console.log('🔍 [RESULTADO-QVT] pontoFortes do banco:', resultado?.pontos_fortes);
  console.log('🔍 [RESULTADO-QVT] dimensoesCriticas do banco:', resultado?.dimensoes_criticas);
  
  // Usar os dados reais do banco (arrays de strings)
  const pontosFortes = resultado?.pontos_fortes || [];
  const pontosFracos = resultado?.dimensoes_criticas || [];
  
  // Se não há pontos fortes específicos, criar baseado nas pontuações altas (>= 4.0)
  const pontosFortesDinamicos = pontosFortes.length === 0 ? [
    resultado?.satisfacao_funcao >= 4.0 && 'Satisfação com a Função',
    resultado?.relacao_lideranca >= 4.0 && 'Relação com Liderança', 
    resultado?.estrutura_condicoes >= 4.0 && 'Estrutura e Condições de Trabalho',
    resultado?.recompensas_remuneracao >= 4.0 && 'Recompensas e Remuneração',
    resultado?.equilibrio_vida_trabalho >= 4.0 && 'Equilíbrio Vida-Trabalho'
  ].filter(Boolean) : pontosFortes;
  
  // Se não há áreas críticas específicas, criar baseado nas pontuações baixas (< 3.0)
  const pontosFracosDinamicos = pontosFracos.length === 0 ? [
    resultado?.satisfacao_funcao < 3.0 && 'Satisfação com a Função necessita atenção',
    resultado?.relacao_lideranca < 3.0 && 'Relação com Liderança necessita atenção',
    resultado?.estrutura_condicoes < 3.0 && 'Estrutura e Condições de Trabalho necessita atenção', 
    resultado?.recompensas_remuneracao < 3.0 && 'Recompensas e Remuneração necessita atenção',
    resultado?.equilibrio_vida_trabalho < 3.0 && 'Equilíbrio Vida-Trabalho necessita atenção'
  ].filter(Boolean) : pontosFracos;

  const overallLevel = getScoreLevel(indiceAtual);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Resultado do Teste QVT',
          text: `Confira meu resultado do Teste de Qualidade de Vida no Trabalho: ${indiceAtual.toFixed(1)}/5.0`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Erro ao compartilhar:', err);
      }
    } else {
      // Fallback para copiar URL
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const handleDownloadPDF = () => {
    // Implementar download do PDF
    alert('Funcionalidade de download em desenvolvimento');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
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
                {dataRealizacao ? `Concluído em ${new Date(dataRealizacao).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}` : 'Resultado da avaliação de qualidade de vida no trabalho'}
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

        {/* Alertas Críticos */}
        {alertasCriticos && alertasCriticos.length > 0 && (
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Críticos ({alertasCriticos.length})
            </h3>
            {alertasCriticos.map((alerta) => (
              <Alert key={alerta.id} variant={alerta.tipo === 'critico' ? 'destructive' : 'default'} className="border-l-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  {alerta.titulo}
                  <div className="flex gap-2">
                    <Badge variant={alerta.urgencia === 'Imediata' ? 'destructive' : 'secondary'}>
                      {alerta.urgencia}
                    </Badge>
                    <Badge variant="outline">{alerta.impacto}</Badge>
                  </div>
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="mb-3">{alerta.descricao}</p>
                  <div className="space-y-2">
                    <p className="font-medium">Ações Recomendadas:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {alerta.recomendacoes.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        <strong>Prazo:</strong> {alerta.prazoAcao}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        <strong>Responsável:</strong> {alerta.responsavel}
                      </span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

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
                  {indiceAtual.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">de 5.0</div>
              </div>
            </div>
            
            <div className="mb-4">
              <Progress value={(indiceAtual / 5) * 100} className="h-3" />
            </div>
            
            <Badge className={`${overallLevel.color} ${overallLevel.bgColor} border-0`}>
              {overallLevel.level}
            </Badge>

            {/* Alerta de Risco de Turnover */}
            {riscoTurnover && (
              <Alert className="border-red-200 bg-red-50 mt-4">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Alerta: Risco de Turnover Detectado</AlertTitle>
                <AlertDescription className="text-red-700">
                  Os resultados indicam baixa satisfação em áreas críticas. Recomenda-se atenção imediata 
                  para melhorar a retenção de talentos.
                </AlertDescription>
              </Alert>
            )}
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
              {(dimensoes || []).map((dimensao, index) => {
                // Mapear nomes das dimensões para as configurações
                let configKey = dimensao.dimensao;
                if (dimensao.dimensao === 'Satisfação com a Função') configKey = 'Satisfação com a Função';
                else if (dimensao.dimensao === 'Relação com Liderança') configKey = 'Relação com Liderança';
                else if (dimensao.dimensao === 'Estrutura e Condições de Trabalho') configKey = 'Estrutura e Condições de Trabalho';
                else if (dimensao.dimensao === 'Recompensas e Remuneração') configKey = 'Recompensas e Remuneração';
                else if (dimensao.dimensao === 'Equilíbrio Vida-Trabalho') configKey = 'Equilíbrio Vida-Trabalho';

                const config = dimensionConfigs[configKey] || {
                  name: dimensao.dimensao,
                  icon: Building,
                  color: 'text-gray-600',
                  bgColor: 'bg-gray-50',
                  description: 'Dimensão da qualidade de vida no trabalho'
                };
                
                const level = getScoreLevel(dimensao.pontuacao || 0);
                const Icon = config.icon;
                
                return (
                  <div key={dimensao.dimensao}>
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
                            {(dimensao.pontuacao || 0).toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-500">de 5.0</div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-500">Progresso</span>
                          <span className="text-xs text-gray-500">{Math.round(((dimensao.pontuacao || 0) / 5) * 100)}%</span>
                        </div>
                        <Progress value={((dimensao.pontuacao || 0) / 5) * 100} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={`${level.color} ${level.bgColor} border-0 text-xs`}>
                          {level.level}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          {dimensao.pontuacao >= 4.0 ? '✓ Ponto forte' : 
                           dimensao.pontuacao < 3.0 ? '⚠ Área de melhoria' : 
                           '→ Nível adequado'}
                        </div>
                      </div>
                    </div>
                    
                    {index < (dimensoes || []).length - 1 && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Análise */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Pontos Fortes */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Pontos Fortes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pontosFortesDinamicos.length > 0 ? pontosFortesDinamicos.map((ponto, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-800">{ponto}</span>
                  </div>
                )) : (
                  <p className="text-sm text-green-700">Todas as dimensões estão em níveis adequados.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Áreas de Melhoria */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <TrendingDown className="h-5 w-5" />
                Áreas de Melhoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pontosFracosDinamicos.length > 0 ? pontosFracosDinamicos.map((ponto, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-800">{ponto}</span>
                  </div>
                )) : (
                  <p className="text-sm text-red-700">Excelente! Nenhuma área crítica identificada.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recomendações */}
        {recomendacoes && recomendacoes.length > 0 && (
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
              <div className="space-y-4">
                {recomendacoes.map((recomendacao, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="p-2 rounded-full bg-blue-100">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 mb-1">
                        Recomendação {index + 1}
                      </h4>
                      <p className="text-sm text-blue-800">{recomendacao}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Este resultado é confidencial e destinado exclusivamente ao usuário.
            Para mais informações sobre QVT, consulte o setor de Recursos Humanos.
          </p>
        </div>
      </div>
    </div>
  );
}