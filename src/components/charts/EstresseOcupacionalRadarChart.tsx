import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radar as RadarIcon, TrendingUp, AlertTriangle, Shield, Heart, Sparkles } from 'lucide-react';
import { ResultadoEstresseOcupacional } from '@/lib/testes/estresse-ocupacional';

interface EstresseOcupacionalRadarChartProps {
  resultado: ResultadoEstresseOcupacional;
}

const EstresseOcupacionalRadarChart: React.FC<EstresseOcupacionalRadarChartProps> = ({ resultado }) => {
  // Preparar dados para o gráfico radar com cores específicas por dimensão
  const data = Object.entries(resultado.dimensoes).map(([dimensaoId, dados]) => ({
    dimensao: dados.nome,
    pontuacao: dados.media,
    percentual: (dados.media / 5) * 100,
    nivel: dados.nivel,
    classificacao: dados.classificacao,
    dimensaoId: dimensaoId,
    fullMark: 100
  }));

  // Configuração do gráfico
  const chartConfig = {
    pontuacao: {
      label: "Pontuação",
      color: "hsl(var(--chart-1))",
    },
  };

  // Função para obter cor específica por dimensão (mais vibrante e diferenciada)
  const obterCorPorDimensao = (dimensaoId: string) => {
    switch (dimensaoId) {
      case 'estresse': return '#dc2626'; // Vermelho mais intenso para estresse
      case 'burnout': return '#ea580c'; // Laranja mais intenso para burnout
      case 'resiliencia': return '#059669'; // Verde mais intenso para resiliência
      default: return '#7c3aed'; // Roxo mais intenso padrão
    }
  };

  // Função para obter gradiente por dimensão
  const obterGradientePorDimensao = (dimensaoId: string) => {
    switch (dimensaoId) {
      case 'estresse': return 'url(#gradientEstresse)';
      case 'burnout': return 'url(#gradientBurnout)';
      case 'resiliencia': return 'url(#gradientResiliencia)';
      default: return 'url(#gradientPadrao)';
    }
  };

  // Função para obter cor baseada no nível (para badges e indicadores)
  const obterCorPorNivel = (nivel: string, dimensaoId?: string) => {
    // Para resiliência, invertemos a lógica das cores
    if (dimensaoId === 'resiliencia') {
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
      case 'burnout': return <TrendingUp className="h-4 w-4" />;
      case 'resiliencia': return <Shield className="h-4 w-4" />;
      default: return <RadarIcon className="h-4 w-4" />;
    }
  };

  // Função para obter nome abreviado das dimensões para melhor legibilidade
  const obterNomeAbreviado = (nome: string) => {
    switch (nome) {
      case 'Estresse Ocupacional': return 'Estresse';
      case 'Resiliência Emocional': return 'Resiliência';
      default: return nome;
    }
  };

  // Preparar dados com nomes abreviados
  const dataComNomesAbreviados = data.map(item => ({
    ...item,
    dimensaoAbreviada: obterNomeAbreviado(item.dimensao)
  }));

  return (
    <Card className="bg-gradient-to-br from-white via-slate-50 to-indigo-50 shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <RadarIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Perfil Multidimensional</h3>
            <p className="text-indigo-100 text-sm font-medium">
              Análise radar das três dimensões principais
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Gráfico Radar Aprimorado */}
          <div className="xl:col-span-2">
            <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
              <ChartContainer config={chartConfig} className="h-[450px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart 
                    data={dataComNomesAbreviados} 
                    margin={{ top: 50, right: 120, bottom: 80, left: 120 }}
                  >
                    {/* Grid com estilo aprimorado */}
                    <PolarGrid 
                      className="stroke-slate-400 opacity-60" 
                      radialLines={true}
                      gridType="polygon"
                      strokeWidth={1.5}
                    />
                    
                    {/* Eixo angular com labels melhorados */}
                    <PolarAngleAxis 
                      dataKey="dimensaoAbreviada" 
                      tick={{ 
                        fontSize: 16, 
                        fontWeight: 800,
                        fill: '#0f172a',
                        textAnchor: 'middle'
                      }}
                      className="text-slate-900"
                    />
                    
                    {/* Eixo radial com mais detalhes */}
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ 
                        fontSize: 13, 
                        fill: '#475569',
                        fontWeight: 600
                      }}
                      tickCount={6}
                      axisLine={false}
                    />
                    
                    {/* Área principal com gradiente e pontos customizados */}
                    <Radar
                      name="Pontuação"
                      dataKey="percentual"
                      stroke="url(#radarGradient)"
                      fill="url(#radarFillGradient)"
                      fillOpacity={0.25}
                      strokeWidth={4}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        
                        // Validações de segurança para evitar erros
                        if (!payload || !cx || !cy) return null;
                        if (!payload.dimensao || !payload.dimensaoId) return null;
                        
                        // Calcular posição do label baseado na posição do ponto
                        const centerX = 225; // Centro aproximado do gráfico
                        const centerY = 225; // Centro aproximado do gráfico
                        const angle = Math.atan2(cy - centerY, cx - centerX);
                        const distance = 45; // Distância do ponto para o label
                        const labelX = cx + Math.cos(angle) * distance;
                        const labelY = cy + Math.sin(angle) * distance;
                        
                        // Ajustar alinhamento do texto baseado na posição
                        let textAnchor = 'middle';
                        if (labelX > cx + 10) textAnchor = 'start';
                        else if (labelX < cx - 10) textAnchor = 'end';
                        
                        // Fallback para dimensao se for undefined
                        const dimensaoTexto = payload.dimensao || 'Dimensão';
                        const dimensaoLength = dimensaoTexto.length;
                        
                        return (
                          <g>
                            {/* Ponto do gráfico */}
                            <circle
                              cx={cx}
                              cy={cy}
                              r={16}
                              fill={obterGradientePorDimensao(payload.dimensaoId)}
                              stroke="#ffffff"
                              strokeWidth={6}
                              filter="drop-shadow(0 8px 16px rgba(0,0,0,0.4)) drop-shadow(0 0 12px rgba(255,255,255,0.7)) url(#glowEffect)"
                              className="animate-pulse hover:animate-none transition-all duration-700 ease-in-out hover:scale-150 cursor-pointer transform-gpu"
                              style={{
                                transformOrigin: `${cx}px ${cy}px`
                              }}
                            />
                            
                            {/* Fundo do label */}
                            <rect
                              x={labelX - (dimensaoLength * 4)}
                              y={labelY - 12}
                              width={dimensaoLength * 8}
                              height={24}
                              rx={12}
                              fill="rgba(255, 255, 255, 0.95)"
                              stroke={obterCorPorDimensao(payload.dimensaoId)}
                              strokeWidth={2}
                              filter="drop-shadow(0 2px 8px rgba(0,0,0,0.15))"
                            />
                            
                            {/* Texto do label */}
                            <text
                              x={labelX}
                              y={labelY + 4}
                              textAnchor={textAnchor}
                              fontSize={14}
                              fontWeight={700}
                              fill={obterCorPorDimensao(payload.dimensaoId)}
                              className="pointer-events-none"
                            >
                              {dimensaoTexto}
                            </text>
                          </g>
                        );
                      }}
                    />
                    
                    {/* Tooltip aprimorado */}
                    <ChartTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-xl p-4 min-w-[200px]">
                              <div className="flex items-center gap-2 mb-3">
                                {obterIconePorDimensao(data.dimensaoId)}
                                <h4 className="font-bold text-slate-800">{data.dimensao}</h4>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-slate-600">Pontuação:</span>
                                  <span className="font-bold text-lg" style={{ color: obterCorPorDimensao(data.dimensaoId) }}>
                                    {data.percentual.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-slate-600">Média:</span>
                                  <span className="font-semibold">{data.pontuacao.toFixed(2)}/5.0</span>
                                </div>
                                <div className="pt-2 border-t border-slate-200">
                                  <Badge 
                                    className="w-full justify-center text-xs font-bold shadow-sm"
                                    style={{ 
                                      backgroundColor: `${obterCorPorNivel(data.nivel, data.dimensaoId)}20`,
                                      color: obterCorPorNivel(data.nivel, data.dimensaoId),
                                      border: `2px solid ${obterCorPorNivel(data.nivel, data.dimensaoId)}60`,
                                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                    }}
                                  >
                                    {data.classificacao}
                                  </Badge>
                                  <div className="mt-2 text-xs text-slate-500 text-center">
                                    Nível de Risco: <span className="font-semibold">{data.nivel}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    
                    {/* Definições de gradientes aprimorados */}
                    <defs>
                      {/* Gradientes para a área principal */}
                      <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                        <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.6} />
                      </linearGradient>
                      <radialGradient id="radarFillGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="70%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.1} />
                      </radialGradient>
                      
                      {/* Gradientes específicos aprimorados para cada dimensão */}
                      <radialGradient id="gradientEstresse" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
                        <stop offset="20%" stopColor="#fca5a5" stopOpacity={1} />
                        <stop offset="60%" stopColor="#dc2626" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#7f1d1d" stopOpacity={0.9} />
                      </radialGradient>
                      
                      <radialGradient id="gradientBurnout" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
                        <stop offset="20%" stopColor="#fed7aa" stopOpacity={1} />
                        <stop offset="60%" stopColor="#ea580c" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#9a3412" stopOpacity={0.9} />
                      </radialGradient>
                      
                      <radialGradient id="gradientResiliencia" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
                        <stop offset="20%" stopColor="#a7f3d0" stopOpacity={1} />
                        <stop offset="60%" stopColor="#059669" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#064e3b" stopOpacity={0.9} />
                      </radialGradient>
                      
                      <radialGradient id="gradientPadrao" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
                        <stop offset="20%" stopColor="#c4b5fd" stopOpacity={1} />
                        <stop offset="60%" stopColor="#7c3aed" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#4c1d95" stopOpacity={0.9} />
                      </radialGradient>
                      
                      {/* Filtros para efeitos de brilho aprimorados */}
                      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                      
                      <filter id="glowEffect" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feOffset dx="0" dy="0" result="offsetBlur"/>
                        <feFlood floodColor="#ffffff" floodOpacity="0.8"/>
                        <feComposite in="offsetBlur" operator="in"/>
                        <feMerge> 
                          <feMergeNode/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                      
                      <filter id="shadowEffect" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.3"/>
                      </filter>
                    </defs>
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          {/* Painel de Detalhes Aprimorado */}
          <div className="space-y-6">
            {/* Resumo das Dimensões com Design Melhorado */}
            <div className="bg-gradient-to-br from-white via-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200 shadow-lg">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                Dimensões Avaliadas
              </h4>
              <div className="space-y-4">
                {Object.entries(resultado.dimensoes).map(([dimensaoId, dados]) => (
                  <div 
                    key={dimensaoId}
                    className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    {/* Barra de cor da dimensão */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                      style={{ backgroundColor: obterCorPorDimensao(dimensaoId) }}
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0 shadow-md"
                          style={{ backgroundColor: obterCorPorDimensao(dimensaoId) }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div style={{ color: obterCorPorDimensao(dimensaoId) }}>
                              {obterIconePorDimensao(dimensaoId)}
                            </div>
                            <span className="font-semibold text-sm text-slate-800 truncate">
                              {dados.nome}
                            </span>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className="text-xs font-medium"
                            style={{ 
                              backgroundColor: `${obterCorPorNivel(dados.nivel, dimensaoId)}20`,
                              color: obterCorPorNivel(dados.nivel, dimensaoId),
                              border: `1px solid ${obterCorPorNivel(dados.nivel, dimensaoId)}40`
                            }}
                          >
                            {dados.classificacao}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div 
                          className="font-bold text-xl"
                          style={{ color: obterCorPorDimensao(dimensaoId) }}
                        >
                          {((dados.media / 5) * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {dados.media.toFixed(2)}/5.0
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interpretação Aprimorada */}
            <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6 rounded-2xl border border-slate-200 shadow-lg">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-slate-600 to-gray-600 rounded-lg">
                  <RadarIcon className="h-4 w-4 text-white" />
                </div>
                Como Interpretar
              </h4>
              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  <strong>Pontos no Gráfico:</strong> Cada ponto colorido representa uma dimensão específica. 
                  Pontos mais distantes do centro indicam pontuações mais altas.
                </p>
                <p>
                  <strong>Cores das Dimensões:</strong>
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Estresse (vermelho)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>Burnout (laranja)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Resiliência (verde)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstresseOcupacionalRadarChart;