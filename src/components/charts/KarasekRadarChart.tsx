import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { ResultadoKarasekSiegrist } from '@/types/karasek-siegrist';

interface DimensaoData {
  dimensao: string;
  percentual: number;
  nivel: string;
  classificacao: string;
}

interface KarasekRadarChartProps {
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
    label: "Percentual",
    color: "hsl(var(--chart-1))",
  },
};

// Cores modernas e profissionais para o radar - Design 2024
const RADAR_COLORS = {
  fill: 'url(#radarGradient)', // Gradiente moderno
  fillOpacity: 0.3,
  stroke: '#3b82f6', // blue-500 vibrante
  strokeWidth: 3,
  dot: '#1d4ed8', // blue-700 
  dotActive: '#1e40af', // blue-800 para hover
  grid: '#e2e8f0', // slate-200
  gridSecondary: '#f8fafc', // slate-50
  accent: '#06b6d4', // cyan-500 para destaques
};

export function KarasekRadarChart({ resultado }: KarasekRadarChartProps) {
  // Validação defensiva
  if (!resultado || !resultado.dimensoes) {
    return (
      <Card className="bg-white shadow-sm border border-slate-200/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Perfil Psicossocial - Visão Radar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Dados não disponíveis para exibir o gráfico radar.
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
      classificacao: dados.classificacao || 'N/A'
    }));

  return (
    <Card className="bg-white shadow-sm border border-slate-200/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          Perfil Psicossocial - Visão Radar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[500px] w-full animate-in fade-in-0 duration-700">
          <RadarChart data={data} margin={{ top: 80, right: 100, bottom: 80, left: 100 }} className="animate-in slide-in-from-bottom-4 duration-1000 delay-300">
            {/* Definição do gradiente moderno */}
            <defs>
              <radialGradient id="radarGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent 
                  hideLabel 
                  className="bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-2xl rounded-xl p-4 transition-all duration-200"
                  formatter={(value, name) => [
                    `${value}%`,
                    name === 'percentual' ? 'Nível' : name
                  ]}
                />
              }
            />
            <PolarGrid 
              className="opacity-40 transition-opacity duration-300" 
              stroke={RADAR_COLORS.grid}
              strokeWidth={1.5}
              strokeDasharray="3,3"
            />
            <PolarAngleAxis 
              dataKey="dimensao" 
              className="text-sm font-bold fill-slate-800"
              tick={{ 
                fontSize: 14, 
                fontWeight: 700,
                fill: '#1e293b', // slate-800
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
              tickFormatter={(value) => {
                // Quebra labels longos em duas linhas com melhor formatação
                const words = value.split(' ');
                if (words.length > 2) {
                  const mid = Math.ceil(words.length / 2);
                  return `${words.slice(0, mid).join(' ')}\n${words.slice(mid).join(' ')}`;
                }
                return value;
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
            />
            <Radar
              dataKey="percentual"
              fill="url(#radarGradient)"
              fillOpacity={0.6}
              stroke={RADAR_COLORS.accent}
              strokeWidth={3}
              dot={{ 
                fill: RADAR_COLORS.dot, 
                strokeWidth: 3, 
                stroke: '#ffffff',
                r: 6,
                filter: 'url(#glow)'
              }}
              activeDot={{ 
                r: 8, 
                fill: RADAR_COLORS.dotActive, 
                stroke: '#ffffff', 
                strokeWidth: 3,
                filter: 'url(#glow)',
                className: 'animate-pulse'
              }}
              className="transition-all duration-300 hover:drop-shadow-lg"
            />
          </RadarChart>
        </ChartContainer>
        <div className="mt-8 space-y-4">
          <div className="text-center">
            <p className="text-base font-semibold text-slate-800 mb-1">
              Perfil Psicossocial Detalhado
            </p>
            <p className="text-sm text-slate-600">
              Visualização das seis dimensões avaliadas no modelo Karasek-Siegrist
            </p>
          </div>
          
          {/* Legenda moderna com gradientes */}
          <div className="grid grid-cols-1 gap-3 text-sm">
            {data.map((item, index) => (
              <div 
                key={index} 
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div 
                    className="w-4 h-4 rounded-full border-3 border-white shadow-lg transition-transform duration-200 group-hover:scale-110 flex-shrink-0"
                    style={{ 
                      backgroundColor: RADAR_COLORS.dot,
                      boxShadow: `0 0 0 2px ${RADAR_COLORS.accent}20`
                    }}
                  />
                  <span className="font-semibold text-slate-800 group-hover:text-slate-900 transition-colors truncate">
                    {item.dimensao}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="font-bold text-lg text-slate-900 leading-tight">
                      {item.percentual}%
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">
                      {item.nivel}
                    </div>
                  </div>
                  <div 
                    className="w-2 h-8 rounded-full bg-gradient-to-t from-slate-300 to-blue-500 opacity-70"
                    style={{
                      background: `linear-gradient(to top, #e2e8f0 0%, ${RADAR_COLORS.accent} ${item.percentual}%)`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Indicador de escala moderna */}
          <div className="flex flex-wrap items-center justify-center mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200/50">
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <span className="whitespace-nowrap">0% - Baixo</span>
              </div>
              <div className="w-px h-4 bg-slate-300 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="whitespace-nowrap">50% - Médio</span>
              </div>
              <div className="w-px h-4 bg-slate-300 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                <span className="whitespace-nowrap">100% - Alto</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}