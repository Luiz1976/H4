import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Layers, TrendingUp, Info } from 'lucide-react';
import { ResultadoClimaBemEstar } from '@/lib/testes/clima-bem-estar';

interface ClimaBemEstarAreaChartProps {
  resultado: ResultadoClimaBemEstar;
}

const ClimaBemEstarAreaChart: React.FC<ClimaBemEstarAreaChartProps> = ({ resultado }) => {
  // Labels amigáveis por dimensão
  const dimensaoLabels: Record<string, string> = {
    segurancaPsicologica: 'Segurança Psicológica',
    comunicacaoInterna: 'Comunicação Interna',
    pertencimento: 'Pertencimento e Inclusão',
    justicaOrganizacional: 'Justiça Organizacional',
  };

  // Fallback: quando não temos respostas por pergunta, estimar distribuição a partir da média
  const estimarDistribuicaoPorMedia = (media: number) => {
    const categorias = ['Muito Baixo', 'Baixo', 'Moderado', 'Alto', 'Muito Alto'];
    const mapa: Record<number, string> = {
      1: 'Muito Baixo',
      2: 'Baixo',
      3: 'Moderado',
      4: 'Alto',
      5: 'Muito Alto',
    };

    const percentuais: Record<string, number> = {
      'Muito Baixo': 0,
      'Baixo': 0,
      'Moderado': 0,
      'Alto': 0,
      'Muito Alto': 0,
    };

    if (media <= 1) {
      percentuais['Muito Baixo'] = 100;
      return percentuais;
    }
    if (media >= 5) {
      percentuais['Muito Alto'] = 100;
      return percentuais;
    }

    const base = Math.floor(media);
    const frac = media - base; // parte fracionária (0..1)
    const catBase = mapa[base];
    const catTopo = mapa[base + 1];

    // Distribuição linear entre categorias vizinhas
    percentuais[catBase] = Math.round((1 - frac) * 100);
    percentuais[catTopo] = Math.round(frac * 100);

    // Ajuste para garantir soma = 100 por possíveis arredondamentos
    const soma = categorias.reduce((acc, c) => acc + percentuais[c], 0);
    if (soma !== 100) {
      // Corrigir no catTopo
      percentuais[catTopo] += 100 - soma;
    }

    return percentuais;
  };
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

    // Analisar distribuição das respostas por dimensão
    const dadosPorDimensao = Object.entries(resultado.dimensoes).map(([dimensaoId, dados]) => {
      const perguntasRecord: Record<number, number> = dados.perguntas || {};
      const respostas = Object.values(perguntasRecord);

      // Contar respostas por categoria (1-5 mapeado para as categorias)
      const contadores: Record<string, number> = {
        'Muito Baixo': 0,
        'Baixo': 0,
        'Moderado': 0,
        'Alto': 0,
        'Muito Alto': 0,
      };

      respostas.forEach((resposta: any) => {
        const valor = resposta?.resposta ?? resposta;
        if (valor === 1) contadores['Muito Baixo']++;
        else if (valor === 2) contadores['Baixo']++;
        else if (valor === 3) contadores['Moderado']++;
        else if (valor === 4) contadores['Alto']++;
        else if (valor === 5) contadores['Muito Alto']++;
      });

      // Converter para percentuais; se não houver respostas, estimar pela média
      let total = respostas.length;
      let percentuais: Record<string, number> = {};
      if (total > 0) {
        percentuais = Object.fromEntries(
          Object.entries(contadores).map(([categoria, count]) => [
            categoria,
            Math.round((count / total) * 100),
          ])
        );
      } else {
        percentuais = estimarDistribuicaoPorMedia(dados.media ?? 0);
        // Usar total padrão de perguntas por dimensão (12) para estatísticas
        total = 12;
      }

      return {
        dimensao: dimensaoLabels[dimensaoId] || dimensaoId,
        dimensaoId,
        ...percentuais,
        total,
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
          <Layers className="h-5 w-5 text-teal-600" />
          Distribuição das Respostas por Categoria
        </CardTitle>
        <p className="text-sm text-slate-600">
          Análise da distribuição percentual das respostas em cada nível de intensidade por dimensão
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Gráfico de Área Empilhada */}
          <div className="xl:col-span-3">
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dadosPorDimensao}
                  margin={{
                    top: 20,
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
                    cursor={{ fill: 'rgba(20, 184, 166, 0.05)' }}
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
                  
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    iconType="rect"
                    wrapperStyle={{ paddingBottom: '20px' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Painel de Estatísticas */}
          <div className="space-y-4">
            {/* Distribuição Geral */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-4 rounded-xl border border-teal-100">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                Distribuição Geral
              </h4>
              <div className="space-y-2">
                {categorias.map((categoria) => (
                  <div key={categoria} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: cores[categoria] }}
                      />
                      <span className="text-xs font-medium text-slate-700">
                        {categoria}
                      </span>
                    </div>
                    <Badge 
                      variant="secondary"
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${cores[categoria]}20`,
                        color: cores[categoria],
                        border: `1px solid ${cores[categoria]}40`
                      }}
                    >
                      {distribuicaoGeral[categoria]}%
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 pt-3 border-t border-teal-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Total de Respostas</span>
                  <span className="font-bold text-slate-800">{totalRespostas}</span>
                </div>
              </div>
            </div>

            {/* Detalhes por Dimensão */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-600" />
                Detalhes por Dimensão
              </h4>
              <div className="space-y-3">
                {dadosPorDimensao.map((dimensao) => (
                  <div 
                    key={dimensao.dimensaoId}
                    className="p-3 bg-white/80 rounded-lg border border-white/50"
                  >
                    <div className="font-medium text-sm text-slate-700 mb-2">
                      {dimensao.dimensao}
                    </div>
                    
                    <div className="space-y-1">
                      {categorias.map((categoria) => (
                        <div key={categoria} className="flex justify-between items-center">
                          <span className="text-xs text-slate-500">{categoria}</span>
                          <span className="text-xs font-bold text-slate-800">
                            {dimensao[categoria]}%
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Perguntas</span>
                        <span className="text-xs font-bold text-slate-800">
                          {dimensao.total}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interpretação */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-100">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-teal-600" />
                Interpretação
              </h4>
              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  <strong>Muito Baixo/Baixo:</strong> Respostas indicam baixa percepção de problemas ou alta satisfação organizacional.
                </p>
                <p>
                  <strong>Moderado:</strong> Nível intermediário que requer atenção e monitoramento contínuo.
                </p>
                <p>
                  <strong>Alto/Muito Alto:</strong> Indicam necessidade de intervenção e melhorias no clima organizacional.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClimaBemEstarAreaChart;
