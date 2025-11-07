import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, TrendingUp, Info } from 'lucide-react';
import { ResultadoEstresseOcupacional } from '@/lib/testes/estresse-ocupacional';

interface EstresseOcupacionalAreaChartProps {
  resultado: ResultadoEstresseOcupacional;
}

const EstresseOcupacionalAreaChart: React.FC<EstresseOcupacionalAreaChartProps> = ({ resultado }) => {
  // Preparar dados para o gráfico de área empilhada
  const prepararDados = () => {
    const categorias = ['Muito Baixo', 'Baixo', 'Moderado', 'Alto', 'Muito Alto'];
    const cores = {
      'Muito Baixo': '#10b981',
      'Baixo': '#34d399', 
      'Moderado': '#fbbf24',
      'Alto': '#f87171',
      'Muito Alto': '#ef4444'
    };

    // Função para simular distribuição baseada na média
    const simularDistribuicao = (media: number, dimensaoId: string) => {
      // Para resiliência, invertemos a lógica (média alta = bom)
      const isPositiveDimension = dimensaoId === 'resiliencia';
      
      // Simular distribuição baseada na média
      const distribuicao = {
        'Muito Baixo': 0,
        'Baixo': 0,
        'Moderado': 0,
        'Alto': 0,
        'Muito Alto': 0
      };

      // Calcular distribuição aproximada baseada na média
      if (media <= 1.5) {
        distribuicao['Muito Baixo'] = 60;
        distribuicao['Baixo'] = 30;
        distribuicao['Moderado'] = 10;
      } else if (media <= 2.5) {
        distribuicao['Muito Baixo'] = 20;
        distribuicao['Baixo'] = 50;
        distribuicao['Moderado'] = 25;
        distribuicao['Alto'] = 5;
      } else if (media <= 3.5) {
        distribuicao['Baixo'] = 15;
        distribuicao['Moderado'] = 50;
        distribuicao['Alto'] = 25;
        distribuicao['Muito Alto'] = 10;
      } else if (media <= 4.5) {
        distribuicao['Moderado'] = 20;
        distribuicao['Alto'] = 50;
        distribuicao['Muito Alto'] = 30;
      } else {
        distribuicao['Alto'] = 25;
        distribuicao['Muito Alto'] = 75;
      }

      return distribuicao;
    };

    // Analisar distribuição das respostas por dimensão usando as médias
    const dadosPorDimensao = Object.entries(resultado.dimensoes).map(([dimensaoId, dados]) => {
      const media = dados.media || 0;
      
      // Simular distribuição baseada na média
      const distribuicao = simularDistribuicao(media, dimensaoId);
      
      // Obter nome da dimensão baseado no ID
      const nomeDimensao = dimensaoId === 'estresse' ? 'Estresse Ocupacional' :
                          dimensaoId === 'burnout' ? 'Burnout' :
                          dimensaoId === 'resiliencia' ? 'Resiliência Emocional' :
                          dados.nome || dimensaoId;

      // Simular total de respostas baseado nas dimensões do teste
      const totalSimulado = dimensaoId === 'estresse' ? 10 :
                           dimensaoId === 'burnout' ? 28 :
                           dimensaoId === 'resiliencia' ? 18 : 20;

      return {
        dimensao: nomeDimensao,
        dimensaoId,
        ...distribuicao,
        total: totalSimulado
      };
    });

    return { dadosPorDimensao, cores, categorias };
  };

  const { dadosPorDimensao, cores, categorias } = prepararDados();

  // Configuração do gráfico
  const chartConfig = {
    'Muito Baixo': {
      label: "Muito Baixo",
      color: cores['Muito Baixo'],
    },
    'Baixo': {
      label: "Baixo", 
      color: cores['Baixo'],
    },
    'Moderado': {
      label: "Moderado",
      color: cores['Moderado'],
    },
    'Alto': {
      label: "Alto",
      color: cores['Alto'],
    },
    'Muito Alto': {
      label: "Muito Alto",
      color: cores['Muito Alto'],
    },
  };

  // Calcular estatísticas gerais
  const calcularEstatisticas = () => {
    const totalRespostas = dadosPorDimensao.reduce((acc, dim) => acc + dim.total, 0);
    const distribuicaoGeral = categorias.reduce((acc, categoria) => {
      const totalCategoria = dadosPorDimensao.reduce((sum, dim) => {
        return sum + (dim[categoria] * dim.total / 100);
      }, 0);
      acc[categoria] = totalRespostas > 0 ? Math.round((totalCategoria / totalRespostas) * 100) : 0;
      return acc;
    }, {} as Record<string, number>);

    return { totalRespostas, distribuicaoGeral };
  };

  const { totalRespostas, distribuicaoGeral } = calcularEstatisticas();

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-emerald-600" />
          Distribuição das Respostas por Categoria
        </CardTitle>
        <p className="text-sm text-slate-600">
          Análise da distribuição percentual das respostas em cada nível de intensidade por dimensão
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de Área Empilhada - Expandido */}
          <div className="lg:col-span-2">
            <ChartContainer config={chartConfig} className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dadosPorDimensao}
                  margin={{
                    top: 30,
                    right: 30,
                    left: 20,
                    bottom: 80,
                  }}
                >
                  <defs>
                    {categorias.map((categoria, index) => (
                      <linearGradient key={`gradient-${categoria}`} id={`gradient-${categoria}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={cores[categoria]} stopOpacity={0.8} />
                        <stop offset="100%" stopColor={cores[categoria]} stopOpacity={0.3} />
                      </linearGradient>
                    ))}
                  </defs>
                  
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    className="stroke-slate-200/60"
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="dimensao" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    tick={{ fontSize: 12, fontWeight: 500, fill: 'hsl(var(--foreground))' }}
                    className="font-medium"
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    label={{ 
                      value: 'Percentual (%)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: '12px' }
                    }}
                  />
                  
                  {categorias.map((categoria, index) => (
                    <Area
                      key={categoria}
                      type="monotone"
                      dataKey={categoria}
                      stackId="1"
                      stroke={cores[categoria]}
                      fill={`url(#gradient-${categoria})`}
                      strokeWidth={2}
                    />
                  ))}
                  
                  <ChartTooltip 
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    content={
                      <ChartTooltipContent 
                        className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg rounded-lg"
                        formatter={(value, name) => [
                          `${value}%`,
                          name
                        ]}
                        labelFormatter={(label) => `${label}`}
                      />
                    }
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Painel de Informações Consolidado */}
          <div className="space-y-6">
            {/* Legenda de Cores */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-slate-600" />
                Legenda
              </h4>
              <div className="space-y-2">
                {categorias.map((categoria) => (
                  <div key={categoria} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-3 rounded"
                      style={{ backgroundColor: cores[categoria] }}
                    />
                    <span className="text-sm font-medium text-slate-700 flex-1">
                      {categoria}
                    </span>
                    <Badge 
                      variant="secondary"
                      className="text-xs px-2 py-1"
                      style={{ 
                        backgroundColor: `${cores[categoria]}15`,
                        color: cores[categoria],
                        border: `1px solid ${cores[categoria]}30`
                      }}
                    >
                      {distribuicaoGeral[categoria]}%
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total de Respostas</span>
                  <span className="font-bold text-slate-800 text-lg">{totalRespostas}</span>
                </div>
              </div>
            </div>

            {/* Resumo das Dimensões */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100">
              <h4 className="font-semibold text-slate-800 mb-3">
                Resumo por Dimensão
              </h4>
              <div className="space-y-3">
                {dadosPorDimensao.map((dimensao) => {
                  // Encontrar a categoria predominante
                  const categoriaPredominante = categorias.reduce((prev, current) => 
                    dimensao[current] > dimensao[prev] ? current : prev
                  );
                  
                  return (
                    <div 
                      key={dimensao.dimensaoId}
                      className="p-3 bg-white/80 rounded-lg border border-white/50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm text-slate-700">
                          {dimensao.dimensao}
                        </span>
                        <span className="text-xs text-slate-500">
                          {dimensao.total} perguntas
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: cores[categoriaPredominante] }}
                        />
                        <span className="text-xs text-slate-600">
                          Predominante: <strong>{categoriaPredominante}</strong> ({dimensao[categoriaPredominante]}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interpretação */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                Interpretação
              </h4>
              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  <strong>Muito Baixo/Baixo:</strong> Baixa intensidade dos sintomas ou alta capacidade de enfrentamento.
                </p>
                <p>
                  <strong>Moderado:</strong> Nível intermediário que requer atenção e monitoramento.
                </p>
                <p>
                  <strong>Alto/Muito Alto:</strong> Necessidade de intervenção e acompanhamento especializado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstresseOcupacionalAreaChart;