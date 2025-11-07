import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, TrendingDown, Filter, Grid3x3, BarChart3 } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AreaPrioritaria {
  nome: string;
  percentual: number;
  nivel: string;
  categoria?: string;
}

interface AreasPrioritariasProps {
  texto: string; // Texto completo da análise IA
}

// Função para extrair áreas prioritárias do texto da análise IA
function extrairAreasPrioritarias(texto: string): AreaPrioritaria[] {
  const areas: AreaPrioritaria[] = [];
  
  // Procurar pela seção "ÁREAS PRIORITÁRIAS PARA INTERVENÇÃO"
  const secaoMatch = texto.match(/ÁREAS PRIORITÁRIAS PARA INTERVENÇÃO[\s\S]*?(?=\n\n[A-Z]{3,}|$)/);
  
  if (!secaoMatch) {
    return [];
  }
  
  const secao = secaoMatch[0];
  
  // Extrair cada linha com bullet point
  const linhasMatch = secao.matchAll(/•\s*([^:]+):\s*(\d+)%\s*\(([^)]+)\)/g);
  
  for (const match of linhasMatch) {
    areas.push({
      nome: match[1].trim(),
      percentual: parseInt(match[2]),
      nivel: match[3].trim()
    });
  }
  
  return areas;
}

// Categorizar automaticamente por tipo
function categorizarArea(nome: string): string {
  const categorias = {
    'Liderança': ['Liderança', 'Chefia', 'Gestão'],
    'Ambiente': ['Ambiente', 'Físico', 'Recursos', 'Segurança'],
    'Organização': ['Cultura', 'Clima', 'Organizacional', 'Comunicação'],
    'Trabalho': ['Demandas', 'Trabalho', 'Carga', 'Ritmo', 'Jornada'],
    'Saúde': ['Estresse', 'Burnout', 'Psicológico', 'Saúde', 'Resiliência'],
    'Desenvolvimento': ['Desenvolvimento', 'Crescimento', 'Carreira'],
    'Social': ['Social', 'Apoio', 'Relacionamento', 'Suporte'],
    'Autonomia': ['Autonomia', 'Controle', 'Poder'],
    'Reconhecimento': ['Reconhecimento', 'Recompensas', 'Valorização'],
    'Outros': []
  };
  
  for (const [categoria, palavras] of Object.entries(categorias)) {
    if (palavras.some(p => nome.includes(p))) {
      return categoria;
    }
  }
  
  return 'Outros';
}

export default function AreasPrioritarias({ texto }: AreasPrioritariasProps) {
  const [filtroNivel, setFiltroNivel] = useState<string>("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  
  // Extrair áreas do texto
  let areas = extrairAreasPrioritarias(texto);
  
  // Adicionar categorias
  areas = areas.map(area => ({
    ...area,
    categoria: categorizarArea(area.nome)
  }));
  
  // Aplicar filtros
  let areasFiltradas = areas;
  if (filtroNivel !== "todos") {
    areasFiltradas = areasFiltradas.filter(a => a.nivel === filtroNivel);
  }
  if (filtroCategoria !== "todas") {
    areasFiltradas = areasFiltradas.filter(a => a.categoria === filtroCategoria);
  }
  
  // Ordenar por criticidade (menor percentual primeiro)
  areasFiltradas.sort((a, b) => a.percentual - b.percentual);
  
  // Estatísticas
  const totalAreas = areas.length;
  const criticas = areas.filter(a => a.percentual < 35).length;
  const atencao = areas.filter(a => a.percentual >= 35 && a.percentual < 50).length;
  const mediaPercentual = areas.reduce((acc, a) => acc + a.percentual, 0) / totalAreas;
  
  // Categorias únicas
  const categorias = [...new Set(areas.map(a => a.categoria))].filter(c => c !== 'Outros').sort();
  categorias.push('Outros'); // Outros no final
  
  // Cores por nível
  const getCorPorNivel = (nivel: string, percentual: number) => {
    if (nivel === 'Crítico' || percentual < 35) return '#ef4444';
    if (nivel === 'Alto' || percentual < 50) return '#f97316';
    if (nivel === 'Moderado' || percentual < 70) return '#f59e0b';
    return '#10b981';
  };
  
  // Ícone por nível
  const getIconePorNivel = (nivel: string) => {
    if (nivel === 'Crítico') return '🔴';
    if (nivel === 'Alto') return '🟠';
    if (nivel === 'Moderado') return '🟡';
    return '🟢';
  };
  
  if (areas.length === 0) {
    return (
      <Card className="border-0 bg-white/5 backdrop-blur-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
            Áreas Prioritárias para Intervenção
          </CardTitle>
          <p className="text-white/60 text-sm">Nenhuma área crítica identificada na análise.</p>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="border-0 bg-white/5 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-white text-xl flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
          Áreas Prioritárias para Intervenção
        </CardTitle>
        <p className="text-white/60 text-sm">
          {totalAreas} dimensões identificadas que requerem atenção especial
        </p>
        
        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="bg-red-500/20 rounded-lg p-3 backdrop-blur border border-red-500/30">
            <div className="text-red-200 text-xs flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Críticas
            </div>
            <div className="text-white text-2xl font-bold">{criticas}</div>
            <div className="text-red-200 text-xs">{'<'}35%</div>
          </div>
          <div className="bg-orange-500/20 rounded-lg p-3 backdrop-blur border border-orange-500/30">
            <div className="text-orange-200 text-xs flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              Atenção
            </div>
            <div className="text-white text-2xl font-bold">{atencao}</div>
            <div className="text-orange-200 text-xs">35-50%</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur border border-white/20">
            <div className="text-white/60 text-xs">Média Geral</div>
            <div className="text-white text-2xl font-bold">{mediaPercentual.toFixed(1)}%</div>
            <div className="text-white/60 text-xs">das {totalAreas} áreas</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filtros */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <Select value={filtroNivel} onValueChange={setFiltroNivel}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Filtrar por nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os níveis</SelectItem>
                <SelectItem value="Crítico">🔴 Crítico</SelectItem>
                <SelectItem value="Alto">🟠 Alto</SelectItem>
                <SelectItem value="Moderado">🟡 Moderado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {categorias.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="cards" className="data-[state=active]:bg-orange-500 flex items-center gap-2">
              <Grid3x3 className="w-4 h-4" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="grafico" className="data-[state=active]:bg-orange-500 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Gráfico
            </TabsTrigger>
          </TabsList>

          {/* VISUALIZAÇÃO 1: CARDS */}
          <TabsContent value="cards" className="mt-4">
            <div className="text-white/60 text-xs mb-3">
              Mostrando {areasFiltradas.length} de {totalAreas} áreas
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {areasFiltradas.map((area, idx) => {
                const cor = getCorPorNivel(area.nivel, area.percentual);
                const icone = getIconePorNivel(area.nivel);
                
                return (
                  <div 
                    key={idx} 
                    className="group bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-all border-l-4 hover:scale-[1.02]"
                    style={{ borderColor: cor }}
                    data-testid={`priority-card-${idx}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{icone}</span>
                        <div>
                          <h4 className="text-white text-sm font-semibold group-hover:text-orange-300 transition-colors">
                            {area.nome}
                          </h4>
                          <span className="text-white/40 text-xs">{area.categoria}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-2xl font-bold">{area.percentual}%</div>
                        <div 
                          className="text-xs font-semibold px-2 py-1 rounded mt-1"
                          style={{ 
                            backgroundColor: `${cor}30`,
                            color: cor,
                            border: `1px solid ${cor}60`
                          }}
                        >
                          {area.nivel}
                        </div>
                      </div>
                    </div>
                    
                    {/* Barra de Progresso */}
                    <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700 group-hover:brightness-125"
                        style={{ 
                          width: `${area.percentual}%`,
                          backgroundColor: cor
                        }}
                      />
                    </div>
                    
                    {/* Gap em relação ao mínimo aceitável (70%) */}
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-white/60">Meta mínima: 70%</span>
                      <span 
                        className="font-semibold"
                        style={{ color: cor }}
                      >
                        Gap: {(area.percentual - 70).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* VISUALIZAÇÃO 2: GRÁFICO DE BARRAS */}
          <TabsContent value="grafico" className="mt-4">
            <div className="bg-orange-500/20 border border-orange-500/40 rounded-lg p-3 mb-4">
              <p className="text-orange-200 text-sm">
                📊 <strong>Visualização Comparativa</strong> - Quanto menor o percentual, maior a prioridade de intervenção.
              </p>
            </div>
            
            <ResponsiveContainer width="100%" height={Math.max(400, areasFiltradas.length * 35)}>
              <BarChart 
                data={areasFiltradas} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  tick={{ fill: '#fff', fontSize: 12 }}
                  stroke="rgba(255,255,255,0.3)"
                />
                <YAxis 
                  type="category" 
                  dataKey="nome" 
                  tick={{ fill: '#fff', fontSize: 11 }}
                  stroke="rgba(255,255,255,0.3)"
                  width={140}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.9)', 
                    border: '1px solid rgba(249, 115, 22, 0.5)',
                    borderRadius: '12px',
                    color: '#fff',
                    padding: '12px'
                  }}
                  labelStyle={{ color: '#f97316', fontWeight: 700, marginBottom: '8px' }}
                  formatter={(value: number, name: string, props: any) => [
                    `${value}% (${props.payload.nivel})`,
                    'Percentual'
                  ]}
                />
                <Bar dataKey="percentual" radius={[0, 8, 8, 0]}>
                  {areasFiltradas.map((area, idx) => (
                    <Cell 
                      key={idx} 
                      fill={getCorPorNivel(area.nivel, area.percentual)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            {/* Legenda */}
            <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-white text-xs">Crítico (&lt;35%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-white text-xs">Alto (35-50%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-white text-xs">Moderado (50-70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-white text-xs">Saudável (&gt;70%)</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Alerta de ação */}
        {criticas > 0 && (
          <div className="mt-4 bg-red-500/20 border border-red-500/40 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-200 font-semibold text-sm mb-1">
                  Atenção Urgente Necessária
                </h4>
                <p className="text-red-200/80 text-xs">
                  {criticas} {criticas === 1 ? 'área crítica identificada' : 'áreas críticas identificadas'} com 
                  percentual abaixo de 35%. Estas áreas demandam ações específicas e imediatas para 
                  melhoria dos indicadores psicossociais.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
