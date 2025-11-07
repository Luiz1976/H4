import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { ResultadoKarasekSiegrist } from '@/types/karasek-siegrist';

interface DimensaoData {
  dimensao: string;
  percentual: number;
  nivel: string;
  classificacao: string;
  cor: string;
}

interface KarasekBarChartProps {
  resultado: ResultadoKarasekSiegrist;
}

const dimensaoLabels: Record<string, string> = {
  'demanda-psicologica': 'Demanda Psicológica',
  'controle-autonomia': 'Controle/Autonomia',
  'apoio-social': 'Apoio Social',
  'esforco-exigido': 'Esforço Exigido',
  'recompensas-recebidas': 'Recompensas',
  'hipercomprometimento': 'Hipercomprometimento'
};

const chartConfig = {
  percentual: {
    label: "Percentual (%)",
    color: "hsl(var(--chart-1))",
  },
};

// Cores modernas e profissionais para o gráfico de barras
const getBarColor = (value: number) => {
  if (value >= 80) return '#ef4444'; // red-500 - Alto risco
  if (value >= 60) return '#f97316'; // orange-500 - Risco moderado-alto
  if (value >= 40) return '#f59e0b'; // amber-500 - Risco moderado
  if (value >= 20) return '#10b981'; // emerald-500 - Baixo risco
  return '#64748b'; // slate-500 - Muito baixo
};

function getCorPorNivel(nivel: string): string {
  if (!nivel) return '#6b7280'; // gray-500
  
  switch (nivel.toLowerCase()) {
    case 'baixo':
      return '#10b981'; // green-500
    case 'moderado':
      return '#f59e0b'; // amber-500
    case 'alto':
      return '#ef4444'; // red-500
    default:
      return '#6b7280'; // gray-500
  }
}

export function KarasekBarChart({ resultado }: KarasekBarChartProps) {
  // Validação defensiva
  if (!resultado || !resultado.dimensoes) {
    return (
      <Card className="bg-white shadow-sm border border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="h-6 w-6 text-green-600" />
            Comparação por Dimensões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Dados não disponíveis para exibir o gráfico de barras.
          </div>
        </CardContent>
      </Card>
    );
  }

  const data: DimensaoData[] = Object.entries(resultado.dimensoes)
    .filter(([_, dados]) => dados)
    .map(([dimensaoId, dados]) => ({
      dimensao: dimensaoLabels[dimensaoId] || dimensaoId,
      percentual: dados.percentual || 0,
      nivel: dados.nivel || 'N/A',
      classificacao: dados.classificacao || 'N/A',
      cor: getCorPorNivel(dados.nivel)
    }))
    .sort((a, b) => b.percentual - a.percentual); // Ordenar por percentual decrescente

  return (
    <Card className="bg-white shadow-sm border border-slate-200/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          Comparativo por Dimensões
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                className="stroke-slate-200/60"
                vertical={false}
              />
              <XAxis 
                dataKey="dimensao" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 11, fontWeight: 500, fill: 'hsl(var(--foreground))' }}
                className="font-medium fill-slate-600"
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                className="fill-slate-500"
                label={{ 
                  value: 'Percentual (%)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' }
                }}
              />
              <ChartTooltip 
                cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                content={<ChartTooltipContent 
                  className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg"
                  formatter={(value, name, props) => [
                    `${value}%`,
                    'Percentual'
                  ]}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return (
                      <div className="space-y-1">
                        <div className="font-semibold">{label}</div>
                        {item && (
                          <div className="text-sm text-muted-foreground">
                            Nível: <span className="capitalize font-medium">{item.nivel}</span>
                          </div>
                        )}
                      </div>
                    );
                  }}
                />} 
              />
              <Bar 
                dataKey="percentual" 
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.percentual)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Legenda personalizada */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-muted-foreground">Baixo Risco</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
            <span className="text-sm text-muted-foreground">Risco Moderado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-sm text-muted-foreground">Alto Risco</span>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Comparação dos níveis de risco por dimensão (ordenado por intensidade)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}