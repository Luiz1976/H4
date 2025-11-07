import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gauge, TrendingUp, AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ResultadoEstresseOcupacional } from '@/lib/testes/estresse-ocupacional';

interface EstresseOcupacionalGaugeChartProps {
  resultado: ResultadoEstresseOcupacional;
}

const EstresseOcupacionalGaugeChart: React.FC<EstresseOcupacionalGaugeChartProps> = ({ resultado }) => {
  // Calcular índice de vulnerabilidade geral (0-100)
  const calcularIndiceVulnerabilidade = () => {
    const dimensoes = resultado.dimensoes;
    
    // Pesos para cada dimensão (estresse e burnout são negativos, resiliência e suporte são positivos)
    const pesoEstresse = dimensoes.estresse?.media || 0;
    const pesoBurnout = dimensoes.burnout?.media || 0;
    const pesoResiliencia = dimensoes.resiliencia?.media || 0;
    const pesoSuporteSocial = dimensoes.suporte_social?.media || 0;
    
    // Fórmula: ((estresse + burnout) - (resiliência + suporte)) / 4 * 100
    // Normalizado para 0-100 onde 100 é máxima vulnerabilidade
    const vulnerabilidade = ((pesoEstresse + pesoBurnout) - (pesoResiliencia + pesoSuporteSocial)) / 4;
    const indiceNormalizado = Math.max(0, Math.min(100, (vulnerabilidade + 2) * 25)); // Normalizar para 0-100
    
    return Math.round(indiceNormalizado);
  };

  const indiceVulnerabilidade = calcularIndiceVulnerabilidade();

  // Determinar nível de risco baseado no índice
  const obterNivelRisco = (indice: number) => {
    if (indice >= 80) return { nivel: 'critico', label: 'Crítico', cor: '#dc2626', icon: XCircle };
    if (indice >= 60) return { nivel: 'alto', label: 'Alto', cor: '#ea580c', icon: AlertTriangle };
    if (indice >= 40) return { nivel: 'moderado', label: 'Moderado', cor: '#ca8a04', icon: AlertCircle };
    if (indice >= 20) return { nivel: 'baixo', label: 'Baixo', cor: '#16a34a', icon: CheckCircle };
    return { nivel: 'muito_baixo', label: 'Muito Baixo', cor: '#059669', icon: CheckCircle };
  };

  const nivelRisco = obterNivelRisco(indiceVulnerabilidade);

  // Dados para o gráfico gauge
  const data = [
    { name: 'Preenchido', value: indiceVulnerabilidade, fill: nivelRisco.cor },
    { name: 'Vazio', value: 100 - indiceVulnerabilidade, fill: '#f1f5f9' }
  ];

  // Configuração do gráfico
  const chartConfig = {
    vulnerabilidade: {
      label: "Índice de Vulnerabilidade",
      color: nivelRisco.cor,
    },
  };

  // Função para obter mensagem baseada no nível
  const obterMensagem = (nivel: string) => {
    switch (nivel) {
      case 'critico':
        return 'Situação crítica que requer intervenção imediata e acompanhamento profissional especializado.';
      case 'alto':
        return 'Alto nível de vulnerabilidade. Recomenda-se buscar apoio profissional e implementar estratégias de manejo.';
      case 'moderado':
        return 'Nível moderado de vulnerabilidade. Importante monitorar e adotar medidas preventivas.';
      case 'baixo':
        return 'Baixo nível de vulnerabilidade. Manter práticas saudáveis e estratégias de bem-estar.';
      default:
        return 'Excelente nível de bem-estar ocupacional. Continue mantendo as práticas atuais.';
    }
  };

  // Calcular ângulo para a agulha
  const anguloAgulha = (indiceVulnerabilidade / 100) * 180 - 90;

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-indigo-600" />
          Índice de Vulnerabilidade Geral
        </CardTitle>
        <p className="text-sm text-slate-600">
          Medida consolidada do nível de risco ocupacional baseada em todas as dimensões avaliadas
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico Gauge */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <ChartContainer config={chartConfig} className="h-[300px] w-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={80}
                      outerRadius={120}
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
              
              {/* Agulha do velocímetro */}
              <div 
                className="absolute top-1/2 left-1/2 w-1 h-16 bg-slate-800 origin-bottom transform -translate-x-1/2 -translate-y-full transition-transform duration-1000 ease-out"
                style={{ 
                  transform: `translate(-50%, -100%) rotate(${anguloAgulha}deg)`,
                  transformOrigin: 'bottom center'
                }}
              />
              
              {/* Centro do velocímetro */}
              <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-slate-800 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10" />
              
              {/* Valor central */}
              <div className="absolute top-2/3 left-1/2 transform -translate-x-1/2 text-center">
                <div className="text-3xl font-bold text-slate-800">{indiceVulnerabilidade}</div>
                <div className="text-sm text-slate-500">de 100</div>
              </div>
            </div>

            {/* Escala do velocímetro */}
            <div className="flex justify-between w-[240px] mt-4 text-xs text-slate-500">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
            
            {/* Labels da escala */}
            <div className="flex justify-between w-[280px] mt-2 text-xs font-medium">
              <span className="text-green-600">Baixo</span>
              <span className="text-yellow-600">Moderado</span>
              <span className="text-red-600">Alto</span>
            </div>
          </div>

          {/* Painel de Informações */}
          <div className="space-y-6">
            {/* Status Atual */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <nivelRisco.icon 
                  className="h-8 w-8" 
                  style={{ color: nivelRisco.cor }}
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Nível {nivelRisco.label}
                  </h3>
                  <Badge 
                    variant="secondary"
                    className="mt-1"
                    style={{ 
                      backgroundColor: `${nivelRisco.cor}20`,
                      color: nivelRisco.cor,
                      border: `1px solid ${nivelRisco.cor}40`
                    }}
                  >
                    {indiceVulnerabilidade}/100 pontos
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-slate-600 leading-relaxed">
                {obterMensagem(nivelRisco.nivel)}
              </p>
            </div>

            {/* Breakdown por Dimensões */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
              <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                Contribuição por Dimensão
              </h4>
              
              <div className="space-y-3">
                {Object.entries(resultado.dimensoes).map(([dimensaoId, dados]) => {
                  const contribuicao = dimensaoId === 'estresse' || dimensaoId === 'burnout' 
                    ? (dados.media / 5) * 100 
                    : 100 - ((dados.media / 5) * 100);
                  
                  return (
                    <div key={dimensaoId} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        {dados.nome}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-1000 ease-out"
                            style={{ 
                              width: `${contribuicao}%`,
                              backgroundColor: dimensaoId === 'estresse' || dimensaoId === 'burnout' 
                                ? '#ef4444' 
                                : '#10b981'
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600 w-8">
                          {Math.round(contribuicao)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recomendações Rápidas */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Ações Prioritárias
              </h4>
              
              <ul className="space-y-2 text-sm text-slate-600">
                {indiceVulnerabilidade >= 60 && (
                  <>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      Buscar acompanhamento profissional especializado
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      Implementar estratégias de manejo do estresse
                    </li>
                  </>
                )}
                {indiceVulnerabilidade >= 40 && indiceVulnerabilidade < 60 && (
                  <>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                      Monitorar regularmente os níveis de estresse
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                      Fortalecer rede de suporte social
                    </li>
                  </>
                )}
                {indiceVulnerabilidade < 40 && (
                  <>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      Manter práticas atuais de bem-estar
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      Continuar desenvolvendo resiliência
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstresseOcupacionalGaugeChart;