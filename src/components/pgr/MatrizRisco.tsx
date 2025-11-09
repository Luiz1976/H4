import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, TrendingUp, Activity } from "lucide-react";

interface RiscoItem {
  nome: string;
  probabilidade: 'A' | 'B' | 'C' | 'D' | 'E';
  severidade: 1 | 2 | 3 | 4 | 5;
  categoria: string;
}

interface MatrizRiscoProps {
  riscos: RiscoItem[];
}

export default function MatrizRisco({ riscos }: MatrizRiscoProps) {
  const [selectedCell, setSelectedCell] = useState<{ prob: string; sev: number; riscos: RiscoItem[] } | null>(null);
  const probabilidades = [
    { letra: 'E', label: 'MUITO PROVÁVEL', desc: 'Controle inexistente' },
    { letra: 'D', label: 'PROVÁVEL', desc: 'Controle deficiente' },
    { letra: 'C', label: 'POSSÍVEL', desc: 'Controle com pequenas deficiências' },
    { letra: 'B', label: 'POUCO PROVÁVEL', desc: 'Controle com conformidade legal' },
    { letra: 'A', label: 'RARO', desc: 'Controle excelente' }
  ];

  const severidades = [
    { num: 1, label: '1 LEVE', desc: 'Incômodo, insatisfação ou desconforto' },
    { num: 2, label: '2 MENOR', desc: 'Dano leve/dor/mal-estar/estresse sem necessidade' },
    { num: 3, label: '3 MODERADA', desc: 'Adoecimento com incapacidade temporária' },
    { num: 4, label: '4 MAIOR', desc: 'Incapacidade temporária prolongada, dores crônicas' },
    { num: 5, label: '5 EXTREMA', desc: 'Incapacidade permanente parcial (sequelas)' }
  ];

  // Função para determinar a cor da célula baseada no nível de risco
  const getCorRisco = (prob: string, sev: number): string => {
    const probIndex = 'ABCDE'.indexOf(prob);
    const score = probIndex + sev;

    if (score <= 2) return 'bg-green-500/80 hover:bg-green-600/80 border-green-400'; // TRIVIAL
    if (score <= 4) return 'bg-lime-500/80 hover:bg-lime-600/80 border-lime-400'; // TOLERÁVEL
    if (score <= 6) return 'bg-yellow-500/80 hover:bg-yellow-600/80 border-yellow-400'; // MODERADO
    if (score <= 8) return 'bg-orange-500/80 hover:bg-orange-600/80 border-orange-400'; // SUBSTANCIAL
    return 'bg-red-500/80 hover:bg-red-600/80 border-red-400'; // INTOLERÁVEL
  };

  const getNivelRisco = (prob: string, sev: number): string => {
    const probIndex = 'ABCDE'.indexOf(prob);
    const score = probIndex + sev;

    if (score <= 2) return 'TRIVIAL';
    if (score <= 4) return 'TOLERÁVEL';
    if (score <= 6) return 'MODERADO';
    if (score <= 8) return 'SUBSTANCIAL';
    return 'INTOLERÁVEL';
  };

  // Contar riscos por célula
  const contarRiscos = (prob: string, sev: number) => {
    return riscos.filter(r => r.probabilidade === prob && r.severidade === sev).length;
  };

  // Obter riscos de uma célula específica
  const getRiscosCelula = (prob: string, sev: number) => {
    return riscos.filter(r => r.probabilidade === prob && r.severidade === sev);
  };

  // Abrir popup com detalhes dos riscos
  const handleCellClick = (prob: string, sev: number) => {
    const riscosNaCelula = getRiscosCelula(prob, sev);
    if (riscosNaCelula.length > 0) {
      setSelectedCell({ prob, sev, riscos: riscosNaCelula });
    }
  };

  // Mapear categoria para cor e ícone
  const getCategoriaInfo = (categoria: string) => {
    const map: Record<string, { cor: string; icon: any }> = {
      'estresse': { cor: 'bg-orange-500/20 text-orange-300 border-orange-500/30', icon: Activity },
      'clima': { cor: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: TrendingUp },
      'burnout': { cor: 'bg-red-500/20 text-red-300 border-red-500/30', icon: AlertTriangle },
      'qvt': { cor: 'bg-green-500/20 text-green-300 border-green-500/30', icon: TrendingUp },
      'assedio': { cor: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: AlertTriangle },
      'lideranca': { cor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', icon: TrendingUp },
    };
    return map[categoria.toLowerCase()] || { cor: 'bg-gray-500/20 text-gray-300 border-gray-500/30', icon: Activity };
  };

  return (
    <Card className="border-0 bg-white/5 backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-white text-xl flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
          Matriz de Risco Qualitativa
        </CardTitle>
        <p className="text-white/60 text-sm">Avaliação de riscos psicossociais - Severidade vs Probabilidade</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-white/20 bg-cyan-900/50 p-3 text-white text-sm font-bold" colSpan={2}>
                  MATRIZ DE RISCO QUALITATIVA
                </th>
                <th className="border border-white/20 bg-blue-900/70 p-3 text-white text-xs font-bold text-center" colSpan={5}>
                  SEVERIDADE
                </th>
              </tr>
              <tr>
                <th className="border border-white/20 bg-cyan-800/50 p-2 text-white text-xs w-32"></th>
                <th className="border border-white/20 bg-cyan-800/50 p-2 text-white text-xs w-32"></th>
                {severidades.map(sev => (
                  <th key={sev.num} className="border border-white/20 bg-blue-800/50 p-2 text-white text-xs text-center min-w-[120px]">
                    <div className="font-bold mb-1">{sev.label}</div>
                    <div className="font-normal text-[10px] leading-tight">{sev.desc}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {probabilidades.map(prob => (
                <tr key={prob.letra}>
                  <td className="border border-white/20 bg-cyan-800/30 p-2 text-white text-xs font-bold text-center w-12">
                    {prob.letra}
                  </td>
                  <td className="border border-white/20 bg-cyan-800/30 p-2 text-white text-xs">
                    <div className="font-bold mb-1">{prob.label}</div>
                    <div className="font-normal text-[10px] opacity-80">{prob.desc}</div>
                  </td>
                  {severidades.map(sev => {
                    const count = contarRiscos(prob.letra, sev.num);
                    const nivel = getNivelRisco(prob.letra, sev.num);
                    const hasRisks = count > 0;
                    return (
                      <td 
                        key={`${prob.letra}-${sev.num}`}
                        className={`border-2 p-3 text-center transition-all ${hasRisks ? 'cursor-pointer hover:scale-105 hover:shadow-xl' : 'cursor-default'} ${getCorRisco(prob.letra, sev.num)}`}
                        onClick={() => hasRisks && handleCellClick(prob.letra, sev.num)}
                        data-testid={`matriz-celula-${prob.letra}-${sev.num}`}
                      >
                        <div className="font-bold text-white text-sm mb-1">{nivel}</div>
                        {count > 0 && (
                          <Badge className="bg-white/20 text-white border-white/40 text-xs hover:bg-white/30">
                            {count} {count === 1 ? 'risco' : 'riscos'}
                          </Badge>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legenda */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded border-2 border-green-400"></div>
            <span className="text-white text-xs">Trivial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-lime-500 rounded border-2 border-lime-400"></div>
            <span className="text-white text-xs">Tolerável</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-500 rounded border-2 border-yellow-400"></div>
            <span className="text-white text-xs">Moderado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded border-2 border-orange-400"></div>
            <span className="text-white text-xs">Substancial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-500 rounded border-2 border-red-400"></div>
            <span className="text-white text-xs">Intolerável</span>
          </div>
        </div>
      </CardContent>

      {/* Dialog/Popup de Detalhes */}
      <Dialog open={!!selectedCell} onOpenChange={() => setSelectedCell(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-400" />
              Detalhes dos Riscos Psicossociais
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              {selectedCell && (
                <>
                  <span className="font-semibold">Probabilidade:</span> {selectedCell.prob} | 
                  <span className="font-semibold ml-2">Severidade:</span> {selectedCell.sev} | 
                  <span className="font-semibold ml-2">Nível:</span> {getNivelRisco(selectedCell.prob, selectedCell.sev)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {selectedCell?.riscos.map((risco, index) => {
              const catInfo = getCategoriaInfo(risco.categoria);
              const IconComponent = catInfo.icon;
              
              return (
                <Card key={index} className="border-slate-700 bg-slate-800/50 backdrop-blur-xl hover:bg-slate-800/80 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${catInfo.cor.split(' ')[0]}`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-white">{risco.nome}</h3>
                          <Badge variant="outline" className={catInfo.cor}>
                            {risco.categoria.charAt(0).toUpperCase() + risco.categoria.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div className="bg-slate-900/50 p-3 rounded-lg">
                            <p className="text-slate-400 mb-1">Probabilidade</p>
                            <p className="text-white font-semibold text-lg">{risco.probabilidade}</p>
                            <p className="text-slate-400 text-xs mt-1">
                              {risco.probabilidade === 'E' && 'Muito Provável'}
                              {risco.probabilidade === 'D' && 'Provável'}
                              {risco.probabilidade === 'C' && 'Possível'}
                              {risco.probabilidade === 'B' && 'Pouco Provável'}
                              {risco.probabilidade === 'A' && 'Raro'}
                            </p>
                          </div>
                          
                          <div className="bg-slate-900/50 p-3 rounded-lg">
                            <p className="text-slate-400 mb-1">Severidade</p>
                            <p className="text-white font-semibold text-lg">{risco.severidade}</p>
                            <p className="text-slate-400 text-xs mt-1">
                              {risco.severidade === 5 && 'Extrema'}
                              {risco.severidade === 4 && 'Maior'}
                              {risco.severidade === 3 && 'Moderada'}
                              {risco.severidade === 2 && 'Menor'}
                              {risco.severidade === 1 && 'Leve'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-3 bg-slate-900/50 p-3 rounded-lg">
                          <p className="text-slate-400 text-xs mb-1">Nível de Risco</p>
                          <Badge className={`${getCorRisco(risco.probabilidade, risco.severidade)} text-white font-bold`}>
                            {getNivelRisco(risco.probabilidade, risco.severidade)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {selectedCell && selectedCell.riscos.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                Nenhum risco identificado nesta célula
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
