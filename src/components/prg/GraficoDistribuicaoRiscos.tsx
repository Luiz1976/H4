import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface DadosDistribuicao {
  categoria: string;
  critico: number;
  alto: number;
  moderado: number;
  baixo: number;
}

interface GraficoDistribuicaoRiscosProps {
  dados: DadosDistribuicao[];
}

export default function GraficoDistribuicaoRiscos({ dados }: GraficoDistribuicaoRiscosProps) {
  console.log(`📊 [Distribuição Riscos] Renderizando ${dados.length} categorias com dados REAIS:`, dados);
  
  return (
    <Card className="border-0 bg-white/5 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-white text-xl flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
          Distribuição de Riscos por Categoria
        </CardTitle>
        <p className="text-white/60 text-sm">Classificação dos riscos identificados por nível de severidade</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dados} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="categoria" 
              stroke="#fff" 
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fill: '#fff', fontSize: 12 }}
            />
            <YAxis stroke="#fff" tick={{ fill: '#fff' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend 
              wrapperStyle={{ color: '#fff' }}
              iconType="circle"
            />
            <Bar dataKey="critico" name="Crítico" stackId="a" fill="#ef4444" />
            <Bar dataKey="alto" name="Alto" stackId="a" fill="#f97316" />
            <Bar dataKey="moderado" name="Moderado" stackId="a" fill="#eab308" />
            <Bar dataKey="baixo" name="Baixo" stackId="a" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
