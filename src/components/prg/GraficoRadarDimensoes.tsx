import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface DadoDimensao {
  dimensao: string;
  valor: number;
  meta: number;
  nivel?: string;
  cor?: string;
}

interface GraficoRadarDimensoesProps {
  dados: DadoDimensao[];
}

export default function GraficoRadarDimensoes({ dados }: GraficoRadarDimensoesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  console.log(`📊 [Radar Chart] Renderizando com ${dados.length} dimensões REAIS:`, dados.slice(0, 5).map(d => `${d.dimensao}: ${d.valor}%`));
  
  // Top 10 dimensões mais críticas (menor gap em relação à meta)
  const dimensoesCriticas = [...dados]
    .sort((a, b) => (a.valor - a.meta) - (b.valor - b.meta))
    .slice(0, 10);

  // Filtrar por busca
  const dadosFiltrados = dados.filter(d => 
    d.dimensao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estatísticas
  const mediaGeral = dados.reduce((acc, d) => acc + d.valor, 0) / dados.length;
  const abaixoDaMeta = dados.filter(d => d.valor < d.meta).length;
  const acimaDaMeta = dados.filter(d => d.valor >= d.meta).length;

  // Função para obter cor baseada no gap
  const getCorPorGap = (valor: number, meta: number) => {
    const gap = valor - meta;
    if (gap >= 0) return "#10b981"; // Verde - atingiu meta
    if (gap >= -10) return "#f59e0b"; // Amarelo - próximo
    if (gap >= -20) return "#f97316"; // Laranja - atenção
    return "#ef4444"; // Vermelho - crítico
  };

  return (
    <Card className="border-0 bg-white/5 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-white text-xl flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          Dimensões Psicossociais
        </CardTitle>
        <p className="text-white/60 text-sm">Avaliação detalhada de {dados.length} dimensões de risco psicossocial</p>
        
        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
            <div className="text-white/60 text-xs">Média Geral</div>
            <div className="text-white text-2xl font-bold">{mediaGeral.toFixed(1)}%</div>
          </div>
          <div className="bg-green-500/20 rounded-lg p-3 backdrop-blur border border-green-500/30">
            <div className="text-green-200 text-xs flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Acima da Meta
            </div>
            <div className="text-white text-2xl font-bold">{acimaDaMeta}</div>
          </div>
          <div className="bg-red-500/20 rounded-lg p-3 backdrop-blur border border-red-500/30">
            <div className="text-red-200 text-xs flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              Abaixo da Meta
            </div>
            <div className="text-white text-2xl font-bold">{abaixoDaMeta}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="barras" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10">
            <TabsTrigger value="barras" className="data-[state=active]:bg-purple-500">
              📊 Barras (Todas)
            </TabsTrigger>
            <TabsTrigger value="radar" className="data-[state=active]:bg-purple-500">
              🎯 Radar (Top 10)
            </TabsTrigger>
            <TabsTrigger value="tabela" className="data-[state=active]:bg-purple-500">
              📋 Tabela
            </TabsTrigger>
          </TabsList>

          {/* VISUALIZAÇÃO 1: GRÁFICO DE BARRAS HORIZONTAIS */}
          <TabsContent value="barras" className="mt-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <Input
                  placeholder="Buscar dimensão..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  data-testid="input-search-dimension"
                />
              </div>
              <p className="text-white/60 text-xs mt-2">
                Mostrando {dadosFiltrados.length} de {dados.length} dimensões
              </p>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {dadosFiltrados.map((dim, idx) => {
                const gap = dim.valor - dim.meta;
                const cor = getCorPorGap(dim.valor, dim.meta);
                const percentualPreenchimento = (dim.valor / 100) * 100;

                return (
                  <div key={idx} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all" data-testid={`dimension-card-${idx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white text-sm font-semibold flex-1">{dim.dimensao}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-lg font-bold">{dim.valor}%</span>
                        <span className="text-white/60 text-xs">/ {dim.meta}%</span>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="relative h-8 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentualPreenchimento}%`,
                          background: `linear-gradient(90deg, ${cor}dd, ${cor})`
                        }}
                      />
                      <div 
                        className="absolute top-0 h-full border-l-2 border-dashed border-white/60"
                        style={{ left: `${dim.meta}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold drop-shadow-lg">
                          {gap >= 0 ? `+${gap.toFixed(1)}%` : `${gap.toFixed(1)}%`} da meta
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mt-2">
                      <div 
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{ 
                          backgroundColor: `${cor}30`,
                          color: cor,
                          border: `1px solid ${cor}60`
                        }}
                      >
                        {dim.nivel || (gap >= 0 ? "✓ Meta Atingida" : gap >= -10 ? "⚠ Atenção" : "⚠ Crítico")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* VISUALIZAÇÃO 2: RADAR COM TOP 10 CRÍTICAS */}
          <TabsContent value="radar" className="mt-4">
            <div className="bg-orange-500/20 border border-orange-500/40 rounded-lg p-3 mb-4">
              <p className="text-orange-200 text-sm">
                🎯 <strong>Top 10 Dimensões Críticas</strong> - Mostrando apenas as dimensões com maior gap em relação à meta para facilitar a visualização.
              </p>
            </div>

            <ResponsiveContainer width="100%" height={500}>
              <RadarChart data={dimensoesCriticas}>
                <PolarGrid stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />
                <PolarAngleAxis 
                  dataKey="dimensao" 
                  tick={{ fill: '#fff', fontSize: 13, fontWeight: 600 }}
                  stroke="rgba(255,255,255,0.4)"
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fill: '#fff', fontSize: 12, fontWeight: 600 }}
                  stroke="rgba(255,255,255,0.4)"
                  tickCount={6}
                />
                <Radar 
                  name="Valor Atual" 
                  dataKey="valor" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.7} 
                  strokeWidth={3}
                />
                <Radar 
                  name="Meta" 
                  dataKey="meta" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3} 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Legend 
                  wrapperStyle={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}
                  iconType="circle"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(139, 92, 246, 0.5)',
                    borderRadius: '12px',
                    color: '#fff',
                    padding: '12px',
                    fontWeight: 600
                  }}
                  labelStyle={{ color: '#8b5cf6', fontWeight: 700, marginBottom: '8px' }}
                />
              </RadarChart>
            </ResponsiveContainer>

            {/* Lista das Top 10 */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {dimensoesCriticas.map((d, i) => (
                <div 
                  key={i} 
                  className="bg-white/10 rounded-lg p-2 border-l-4"
                  style={{ borderColor: getCorPorGap(d.valor, d.meta) }}
                >
                  <p className="text-white text-xs font-semibold">{i + 1}. {d.dimensao}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-white text-sm">{d.valor}%</span>
                    <span className="text-white/60 text-xs">Meta: {d.meta}%</span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: getCorPorGap(d.valor, d.meta) }}>
                    Gap: {(d.valor - d.meta).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* VISUALIZAÇÃO 3: TABELA DETALHADA */}
          <TabsContent value="tabela" className="mt-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <Input
                  placeholder="Buscar dimensão..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  data-testid="input-search-dimension-table"
                />
              </div>
            </div>

            <div className="bg-white/5 rounded-lg overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-white/10 sticky top-0">
                    <tr>
                      <th className="text-left p-3 text-white text-xs font-semibold">#</th>
                      <th className="text-left p-3 text-white text-xs font-semibold">Dimensão</th>
                      <th className="text-center p-3 text-white text-xs font-semibold">Atual</th>
                      <th className="text-center p-3 text-white text-xs font-semibold">Meta</th>
                      <th className="text-center p-3 text-white text-xs font-semibold">Gap</th>
                      <th className="text-center p-3 text-white text-xs font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosFiltrados.map((dim, idx) => {
                      const gap = dim.valor - dim.meta;
                      const cor = getCorPorGap(dim.valor, dim.meta);
                      
                      return (
                        <tr 
                          key={idx} 
                          className="border-t border-white/10 hover:bg-white/5 transition-colors"
                          data-testid={`table-row-${idx}`}
                        >
                          <td className="p-3 text-white/60 text-sm">{idx + 1}</td>
                          <td className="p-3 text-white text-sm font-medium">{dim.dimensao}</td>
                          <td className="p-3 text-center">
                            <span className="text-white text-sm font-bold">{dim.valor}%</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-white/60 text-sm">{dim.meta}%</span>
                          </td>
                          <td className="p-3 text-center">
                            <span 
                              className="text-sm font-bold"
                              style={{ color: cor }}
                            >
                              {gap >= 0 ? '+' : ''}{gap.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div 
                              className="inline-block px-2 py-1 rounded text-xs font-semibold"
                              style={{ 
                                backgroundColor: `${cor}30`,
                                color: cor,
                                border: `1px solid ${cor}60`
                              }}
                            >
                              {gap >= 0 ? "✓ OK" : gap >= -10 ? "⚠ Atenção" : "⚠ Crítico"}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
