import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, AlertTriangle, Shield, Heart, Activity } from 'lucide-react';
import { ResultadoEstresseOcupacional } from '@/lib/testes/estresse-ocupacional';

interface EstresseOcupacionalBarChartProps {
  resultado: ResultadoEstresseOcupacional;
}

const EstresseOcupacionalBarChart: React.FC<EstresseOcupacionalBarChartProps> = ({ resultado }) => {
  // Preparar dados para o gráfico de barras
  const data = Object.entries(resultado.dimensoes).map(([dimensaoId, dados]) => ({
    dimensao: dados.nome,
    pontuacao: dados.pontuacao,
    media: dados.media,
    percentual: (dados.media / 5) * 100,
    nivel: dados.nivel,
    classificacao: dados.classificacao,
    dimensaoId: dimensaoId
  }));

  // Configuração do gráfico
  const chartConfig = {
    percentual: {
      label: "Percentual",
      color: "hsl(var(--chart-1))",
    },
  };

  // Função para obter cor baseada no nível e dimensão
  const obterCorPorNivel = (nivel: string, dimensaoId: string) => {
    // Para resiliência e suporte social, invertemos a lógica das cores
    if (dimensaoId === 'resiliencia' || dimensaoId === 'suporte_social') {
      switch (nivel) {
        case 'muito_alto': return '#10b981'; // Verde forte
        case 'alto': return '#34d399'; // Verde médio
        case 'moderado': return '#fbbf24'; // Amarelo
        case 'baixo': return '#f87171'; // Vermelho
        default: return '#94a3b8'; // Cinza
      }
    } else {
      switch (nivel) {
        case 'muito_alto': return '#ef4444'; // Vermelho forte
        case 'alto': return '#f97316'; // Laranja
        case 'moderado': return '#eab308'; // Amarelo
        case 'baixo': return '#22c55e'; // Verde
        default: return '#94a3b8'; // Cinza
      }
    }
  };

  // Função para obter ícone por dimensão
  const obterIconePorDimensao = (dimensaoId: string) => {
    switch (dimensaoId) {
      case 'estresse': return <AlertTriangle className="h-4 w-4" />;
      case 'burnout': return <Activity className="h-4 w-4" />;
      case 'resiliencia': return <Shield className="h-4 w-4" />;
      case 'suporte_social': return <Heart className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  // Função para obter gradiente baseado na cor
  const obterGradiente = (cor: string, index: number) => (
    <defs key={`gradient-${index}`}>
      <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={cor} stopOpacity={0.8} />
        <stop offset="100%" stopColor={cor} stopOpacity={0.3} />
      </linearGradient>
    </defs>
  );

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          Comparativo por Dimensões
        </CardTitle>
        <p className="text-sm text-slate-600">
          Análise comparativa das pontuações obtidas em cada dimensão avaliada
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Gráfico de Barras */}
          <div className="xl:col-span-3">
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 80,
                  }}
                  barCategoryGap="20%"
                >
                  {/* Gradientes para cada barra */}
                  <defs>
                    {data.map((item, index) => (
                      <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={obterCorPorNivel(item.nivel, item.dimensaoId)} stopOpacity={0.9} />
                        <stop offset="100%" stopColor={obterCorPorNivel(item.nivel, item.dimensaoId)} stopOpacity={0.4} />
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
                    tick={{ fontSize: 11, fontWeight: 500, fill: 'hsl(var(--foreground))' }}
                    className="font-medium"
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    label={{ 
                      value: 'Percentual (%)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' }
                    }}
                  />
                  <Bar 
                    dataKey="percentual" 
                    radius={[8, 8, 0, 0]}
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth={2}
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`url(#gradient-${index})`}
                      />
                    ))}
                  </Bar>
                  <ChartTooltip 
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)', radius: 4 }}
                    content={
                      <ChartTooltipContent 
                        className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg rounded-lg"
                        formatter={(value, name, props) => [
                          `${Number(value).toFixed(1)}%`,
                          'Percentual'
                        ]}
                        labelFormatter={(label) => `${label}`}
                      />
                    }
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Painel de Detalhes */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Detalhes das Pontuações
              </h4>
              <div className="space-y-3">
                {data.map((item, index) => (
                  <div 
                    key={item.dimensaoId}
                    className="p-3 bg-white/80 rounded-lg border border-white/50 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {obterIconePorDimensao(item.dimensaoId)}
                      <span className="font-medium text-sm text-slate-700">
                        {item.dimensao}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Pontuação</span>
                        <span className="font-bold text-slate-800">
                          {item.pontuacao}/{Object.keys(resultado.dimensoes[item.dimensaoId].perguntas || {}).length * 5}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Média</span>
                        <span className="font-bold text-slate-800">
                          {item.media.toFixed(2)}/5.0
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Percentual</span>
                        <span className="font-bold text-slate-800">
                          {item.percentual.toFixed(0)}%
                        </span>
                      </div>
                      
                      <Badge 
                        variant="secondary" 
                        className="w-full justify-center text-xs mt-2"
                        style={{ 
                          backgroundColor: `${obterCorPorNivel(item.nivel, item.dimensaoId)}20`,
                          color: obterCorPorNivel(item.nivel, item.dimensaoId),
                          border: `1px solid ${obterCorPorNivel(item.nivel, item.dimensaoId)}40`
                        }}
                      >
                        {item.classificacao}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legenda de Cores */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-600" />
                Legenda de Níveis
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <span className="text-xs text-slate-600">Muito Alto Risco</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-orange-500"></div>
                  <span className="text-xs text-slate-600">Alto Risco</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-500"></div>
                  <span className="text-xs text-slate-600">Risco Moderado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-xs text-slate-600">Baixo Risco</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 italic">
                  * Para Resiliência e Suporte Social, cores mais verdes indicam melhores resultados
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstresseOcupacionalBarChart;