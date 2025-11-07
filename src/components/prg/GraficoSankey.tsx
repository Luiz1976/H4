import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';

interface DadosSankey {
  nodes: Array<{ name: string }>;
  links: Array<{ source: number; target: number; value: number }>;
}

interface GraficoSankeyProps {
  dados: DadosSankey;
  titulo?: string;
  descricao?: string;
}

const CustomNode = ({ x, y, width, height, index, payload, containerWidth }: any) => {
  const isOut = x + width + 6 > containerWidth;
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
        x={isOut ? x - 6 : x + width + 6}
        y={y + height / 2}
        fontSize="13"
        fontWeight="600"
        fill="#fff"
        style={{ 
          dominantBaseline: 'middle',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)'
        }}
      >
        {payload.name}
      </text>
    </g>
  );
};

const CustomLink = (props: any) => {
  const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index } = props;
  
  // Cores alternadas para os links
  const colors = ['#60a5fa', '#f97316', '#10b981', '#a78bfa', '#f59e0b', '#ec4899'];
  const color = colors[index % colors.length];
  
  return (
    <g>
      <path
        d={`
          M${sourceX},${sourceY}
          C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
        `}
        fill="none"
        stroke={color}
        strokeWidth={linkWidth}
        strokeOpacity={0.5}
        style={{ transition: 'all 0.3s ease' }}
      />
    </g>
  );
};

export default function GraficoSankey({ dados, titulo = "Fluxo de Transição", descricao = "Visualização do fluxo entre diferentes estados de bem-estar" }: GraficoSankeyProps) {
  console.log(`📊 [Sankey Chart] Renderizando com ${dados.nodes.length} nós e ${dados.links.length} conexões:`, dados);

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
        <ResponsiveContainer width="100%" height={450}>
          <Sankey
            data={dados}
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
