import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge } from 'lucide-react';

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

interface KarasekGaugeChartProps {
  resultado: ResultadoKarasekSiegrist | null;
}

const chartConfig = {
  risco: {
    label: "Nível de Risco",
  },
};

export function KarasekGaugeChart({ resultado }: KarasekGaugeChartProps) {
  // Validação defensiva
  if (!resultado || !resultado.riscoGeral) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="text-center">
          <Gauge className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Carregando dados do gráfico...</p>
        </div>
      </div>
    );
  }

  const { percentual, nivel, classificacao } = resultado.riscoGeral;

  // Dados para o gráfico gauge
  const data = [
    { name: 'Risco', value: percentual, fill: getCorPorNivel(nivel) },
    { name: 'Restante', value: 100 - percentual, fill: '#f1f5f9' }
  ];

  // Função para determinar a cor baseada no nível
  function getCorPorNivel(nivel: string): string {
    if (!nivel || typeof nivel !== 'string') return '#64748b';
    
    switch (nivel.toLowerCase()) {
      case 'baixo':
        return '#10b981'; // emerald-500
      case 'moderado':
        return '#f59e0b'; // amber-500
      case 'alto':
        return '#f97316'; // orange-500
      case 'muito alto':
        return '#ef4444'; // red-500
      default:
        return '#64748b'; // slate-500
    }
  }

  // Função para obter o ícone baseado no nível
  function getIconePorNivel(nivel: string) {
    const cor = getCorPorNivel(nivel);
    return <Gauge className="h-8 w-8" style={{ color: cor }} />;
  }

  return (
    <div className="flex flex-col items-center">
      {/* Container do gráfico */}
      <div className="relative w-full h-64 flex items-center justify-center">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="55%"
                startAngle={180}
                endAngle={0}
                innerRadius={50}
                outerRadius={100}
                paddingAngle={0}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Indicador central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <div className="text-center space-y-1">
            <div className="flex justify-center mb-2">
              {getIconePorNivel(nivel)}
            </div>
            <div className="text-4xl font-bold text-slate-800">
              {percentual}%
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Risco Geral
            </div>
          </div>
        </div>
      </div>

      {/* Legenda e classificação */}
      <div className="mt-4 flex flex-col items-center space-y-3">
        <div 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 shadow-sm"
          style={{ 
            borderColor: getCorPorNivel(nivel),
            backgroundColor: `${getCorPorNivel(nivel)}15`
          }}
        >
          <span className="font-semibold text-slate-800 text-sm">
            {classificacao}
          </span>
        </div>
        
        <div className="text-xs text-slate-500 text-center max-w-sm leading-relaxed">
          Nível de risco psicossocial baseado no modelo Karasek-Siegrist
        </div>
      </div>
    </div>
  );
}