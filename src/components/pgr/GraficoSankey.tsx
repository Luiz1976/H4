import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

interface DadosSankey {
  nodes: Array<{ name: string }>;
  links: Array<{ source: number; target: number; value: number }>;
}

interface GraficoSankeyProps {
  dados: DadosSankey;
  titulo?: string;
  descricao?: string;
}

// Utilidades de sanitização
const isFiniteNumber = (n: any) => typeof n === 'number' && Number.isFinite(n);
const sanitizeSankeyData = (dados: DadosSankey): DadosSankey => {
  const nodes = (dados?.nodes ?? []).map((n) => ({
    name: typeof n?.name === 'string' && n.name.trim() ? n.name : 'N/A',
  }));

  const maxIndex = Math.max(0, nodes.length - 1);

  const links = (dados?.links ?? [])
    .filter((l) => isFiniteNumber(l?.source) && isFiniteNumber(l?.target) && isFiniteNumber(l?.value))
    .map((l) => ({
      source: Math.min(Math.max(0, Math.trunc(l.source)), maxIndex),
      target: Math.min(Math.max(0, Math.trunc(l.target)), maxIndex),
      value: Math.max(1, Math.abs(l.value)),
    }))
    .filter((l) => l.source !== l.target); // evita loops inválidos

  return { nodes, links };
};

const CustomNode = ({ x, y, width, height, payload, containerWidth }: any) => {
  if (![x, y, width, height, containerWidth].every(isFiniteNumber) || height <= 0 || width <= 0) {
    return null;
  }
  const isOut = x + width + 6 > containerWidth;
  const labelX = isOut ? x - 6 : x + width + 6;
  const labelY = y + height / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#667eea"
        fillOpacity="0.9"
        rx={4}
      />
      <text
        textAnchor={isOut ? 'end' : 'start'}
        x={labelX}
        y={labelY}
        fontSize="13"
        fontWeight="600"
        fill="#fff"
        style={{ 
          dominantBaseline: 'middle',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)'
        }}
      >
        {typeof payload?.name === 'string' ? payload.name : 'N/A'}
      </text>
    </g>
  );
};

const CustomLink = (props: any) => {
  const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index } = props;
  const nums = [sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX];
  if (!nums.every(isFiniteNumber)) return null;
  const width = isFiniteNumber(linkWidth) && linkWidth > 0 ? linkWidth : 1;
  const colors = ['#60a5fa', '#f97316', '#10b981', '#a78bfa', '#f59e0b', '#ec4899'];
  const color = colors[index % colors.length];
  const d = `M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`;
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeOpacity={0.5}
        style={{ transition: 'all 0.3s ease' }}
      />
    </g>
  );
};

export default function GraficoSankey({ dados, titulo = "Fluxo de Transição", descricao = "Visualização do fluxo entre diferentes estados de bem-estar" }: GraficoSankeyProps) {
  const sanitized = useMemo(() => sanitizeSankeyData(dados), [dados]);
  const hasData = sanitized.nodes.length > 0 && sanitized.links.length > 0;
  console.log(`📊 [Sankey Chart] Renderizando com ${sanitized.nodes.length} nós e ${sanitized.links.length} conexões:`, sanitized);

  return (
    <Card className="border-0 bg-white/5 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-white text-xl flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></div>
          {titulo}
        </CardTitle>
        <p className="text-white/60 text-sm">{descricao}</p>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={450}>
            <Sankey
              data={sanitized}
              node={<CustomNode />}
              link={<CustomLink />}
              nodePadding={20}
              margin={{ top: 20, right: 160, bottom: 20, left: 160 }}
            >
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '12px'
                }}
                formatter={(value: any) => [`${value} colaboradores`, 'Fluxo']}
              />
            </Sankey>
          </ResponsiveContainer>
        ) : (
          <div className="p-4 text-white/80 text-sm">Dados insuficientes para renderizar o diagrama de fluxo.</div>
        )}

        {/* Explicação */}
        <div className="mt-4 p-4 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-white/10 rounded-lg">
          <p className="text-white/80 text-sm">
            <strong className="text-white">Fluxo de Dados:</strong> Este diagrama mostra como os colaboradores
            transitam entre diferentes estados de bem-estar psicossocial ao longo do tempo, revelando
            padrões de melhoria ou deterioração nas condições de trabalho.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
