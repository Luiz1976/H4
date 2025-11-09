import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

interface DadosParliament {
  categoria: string;
  quantidade: number;
  cor: string;
  label?: string;
}

interface GraficoParliamentProps {
  dados: DadosParliament[];
  titulo?: string;
  descricao?: string;
}

export default function GraficoParliament({ dados, titulo = "Distribuição de Colaboradores", descricao = "Visualização da distribuição por categorias de risco psicossocial" }: GraficoParliamentProps) {
  console.log(`📊 [Parliament Chart] Renderizando com ${dados.length} categorias:`, dados);

  const totalColaboradores = useMemo(() => 
    dados.reduce((acc, d) => acc + d.quantidade, 0), 
    [dados]
  );

  // Gerar posições em semicírculo
  const circles = useMemo(() => {
    const positions: Array<{ x: number; y: number; cor: string; categoria: string }> = [];
    let currentIndex = 0;

    dados.forEach(categoria => {
      for (let i = 0; i < categoria.quantidade; i++) {
        const angle = Math.PI - (currentIndex / totalColaboradores) * Math.PI;
        const radius = 150 + (Math.floor(currentIndex / 20) * 25);
        const x = 200 + radius * Math.cos(angle);
        const y = 220 - radius * Math.sin(angle);
        
        positions.push({
          x,
          y,
          cor: categoria.cor,
          categoria: categoria.categoria
        });
        currentIndex++;
      }
    });

    return positions;
  }, [dados, totalColaboradores]);

  return (
    <Card className="border-0 bg-white/5 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-white text-xl flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          {titulo}
        </CardTitle>
        <p className="text-white/60 text-sm">{descricao}</p>
      </CardHeader>
      <CardContent>
        {/* SVG Parliament Chart */}
        <svg width="100%" height="450" viewBox="0 0 400 300" style={{ maxWidth: '100%' }}>
          {/* Círculos representando colaboradores */}
          {circles.map((circle, idx) => (
            <circle
              key={idx}
              cx={circle.x}
              cy={circle.y}
              r={4}
              fill={circle.cor}
              opacity={0.85}
              style={{ transition: 'all 0.3s ease' }}
            >
              <title>{circle.categoria}</title>
            </circle>
          ))}
          
          {/* Texto central */}
          <text
            x="200"
            y="210"
            textAnchor="middle"
            fill="white"
            fontSize="48"
            fontWeight="900"
          >
            {totalColaboradores}
          </text>
          <text
            x="200"
            y="235"
            textAnchor="middle"
            fill="rgba(255,255,255,0.6)"
            fontSize="14"
            fontWeight="500"
          >
            colaboradores
          </text>
        </svg>

        {/* Legenda */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {dados.map((categoria, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: categoria.cor }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {categoria.label || categoria.categoria}
                </p>
                <p className="text-white/60 text-xs">
                  {categoria.quantidade} ({((categoria.quantidade / totalColaboradores) * 100).toFixed(1)}%)
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-lg">
          <p className="text-white/80 text-sm text-center">
            <strong className="text-white">{totalColaboradores} colaboradores</strong> distribuídos em{' '}
            <strong className="text-white">{dados.length} categorias</strong> de classificação de risco
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
