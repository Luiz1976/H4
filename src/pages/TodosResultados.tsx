import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/AuthContext';
import { 
  Search, 
  Filter, 
  Calendar, 
  BarChart3, 
  Clock, 
  Users, 
  TrendingUp,
  Eye,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
  Shield,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { apiService } from '@/services/apiService';

interface Resultado {
  id: string;
  teste_id?: string;
  pontuacao_total?: number;
  tempo_gasto?: number;
  data_realizacao?: string;
  status?: string;
  metadados?: any;
  testes?: {
    nome?: string;
    categoria?: string;
  } | null;
  indice_geral?: number;
  satisfacao_funcao?: number;
}

interface FiltrosTodosResultados {
  tipoTeste?: string;
  dataInicio?: string;
  dataFim?: string;
  pontuacaoMin?: number;
  pontuacaoMax?: number;
  busca?: string;
  limite?: number;
  offset?: number;
  userEmail?: string;
}

interface EstatisticasGerais {
  totalTestes: number;
  pontuacaoMedia: number;
  tempoMedio: number;
  tempoTotal: number;
  testeMaisRealizado: string;
}

const ITENS_POR_PAGINA = 20;

export default function TodosResultados() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Hook no nível do componente
  
  // Estados principais
  const [resultados, setResultados] = useState<any[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasGerais>({
    totalTestes: 0,
    pontuacaoMedia: 0,
    tempoMedio: 0,
    tempoTotal: 0,
    testeMaisRealizado: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recomendacoes, setRecomendacoes] = useState<{ titulo: string; descricao: string; prioridade: 'alta' | 'media' | 'baixa'; categoria?: string }[]>([]);
  
  // Estados de paginação e filtros
  const [filtros, setFiltros] = useState<FiltrosTodosResultados>({
    limite: ITENS_POR_PAGINA,
    offset: 0
  });
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalResultados, setTotalResultados] = useState(0);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [tiposTeste, setTiposTeste] = useState<string[]>(['QVT', 'RPO', 'Clima e Bem-Estar', 'Estresse Ocupacional', 'Karasek-Siegrist', 'PAS', 'MGRP']);

  // Carregar dados iniciais
  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [TODOS-RESULTADOS] Carregando resultados do usuário:', user?.email);
      
      // Buscar resultados via API local
      const response = await apiService.obterMeusResultados();
      
      console.log('✅ [TODOS-RESULTADOS] Resultados recebidos:', response.resultados.length);
      console.log('📊 [TODOS-RESULTADOS] Dados:', response.resultados);

      // Mapear dados da API para formato esperado pela página
      const resultadosMapeados = response.resultados.map((r: any) => ({
        id: r.id,
        teste_id: r.testeId,
        pontuacao_total: r.pontuacaoTotal,
        tempo_gasto: r.tempoGasto,
        data_realizacao: r.dataRealizacao,
        status: r.status,
        metadados: r.metadados,
        testes: {
          nome: r.nomeTeste || r.metadados?.teste_nome || 'Teste Personalizado',
          categoria: r.categoria || r.metadados?.teste_categoria || 'Geral',
        },
      }));

      setResultados(resultadosMapeados);
      setTotalResultados(response.total || response.resultados.length);
      
      // Calcular estatísticas
      if (response.resultados && response.resultados.length > 0) {
        const pontuacoes = response.resultados
          .map(r => r.pontuacaoTotal)
          .filter(p => p !== null && p !== undefined);
        
        const tempos = response.resultados
          .map(r => r.tempoGasto)
          .filter(t => t !== null && t !== undefined);
        
        const pontuacaoMedia = pontuacoes.length > 0 
          ? Math.round(pontuacoes.reduce((a, b) => a + b, 0) / pontuacoes.length)
          : 0;
          
        const somaTempos = tempos.length > 0 ? tempos.reduce((a, b) => a + b, 0) : 0;
        const tempoMedio = somaTempos > 0
          ? Math.round(somaTempos / tempos.length)
          : 0;

        setEstatisticas({
          totalTestes: response.total || response.resultados.length,
          pontuacaoMedia,
          tempoMedio,
          tempoTotal: Math.round(somaTempos),
          testeMaisRealizado: 'Pesquisa de Clima Organizacional'
        });
      }
      
    } catch (error) {
      console.error('❌ [TODOS-RESULTADOS] Erro ao carregar dados:', error);
      setError(`Erro ao carregar resultados. ${error instanceof Error ? error.message : 'Tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = (novosFiltros: Partial<FiltrosTodosResultados>) => {
    setFiltros(prev => ({
      ...prev,
      ...novosFiltros,
      offset: 0
    }));
    setPaginaAtual(1);
  };

  const limparFiltros = () => {
    setFiltros({
      limite: ITENS_POR_PAGINA,
      offset: 0
    });
    setPaginaAtual(1);
  };

  const mudarPagina = (novaPagina: number) => {
    const novoOffset = (novaPagina - 1) * (filtros.limite || 20);
    setFiltros(prev => ({ ...prev, offset: novoOffset }));
    setPaginaAtual(novaPagina);
  };

  const visualizarResultado = (resultado: Resultado) => {
    // Verificar se é um resultado do teste Karasek-Siegrist
    const isKarasekSiegrist = 
      resultado.teste_id === 'karasek-siegrist' ||
      resultado.metadados?.tipo_teste === 'karasek-siegrist' ||
      resultado.metadados?.teste_nome?.includes('Karasek-Siegrist') ||
      resultado.testes?.nome?.includes('Karasek-Siegrist');
    
    // Verificar se é um resultado do teste de Estresse Ocupacional (HumaniQ EO)
    const isEstresseOcupacional = 
      resultado.teste_id === 'estresse-ocupacional' ||
      resultado.metadados?.tipo_teste === 'estresse-ocupacional' ||
      resultado.metadados?.teste_nome?.includes('Estresse Ocupacional') ||
      resultado.metadados?.teste_nome?.includes('HumaniQ EO') ||
      resultado.testes?.nome?.includes('Estresse Ocupacional') ||
      resultado.testes?.nome?.includes('HumaniQ EO');
    
    // Verificar se é um resultado do teste MGRP (Maturidade em Gestão de Riscos Psicossociais)
    const isMGRP = 
      resultado.teste_id === 'maturidade-riscos-psicossociais' ||
      resultado.teste_id === 'mgrp' ||
      resultado.metadados?.tipo_teste === 'maturidade-riscos-psicossociais' ||
      resultado.metadados?.teste_nome?.includes('MGRP') ||
      resultado.metadados?.teste_nome?.includes('Maturidade') ||
      resultado.testes?.nome?.includes('MGRP') ||
      resultado.testes?.nome?.includes('Maturidade');
    
    // Verificar se é um resultado do teste PAS (Percepção de Assédio Moral e Sexual)
    const isPAS = 
      resultado.teste_id === 'percepcao-assedio' ||
      resultado.metadados?.tipo_teste === 'percepcao-assedio' ||
      resultado.metadados?.teste_nome?.includes('PAS') ||
      resultado.metadados?.teste_nome?.includes('Percepção de Assédio') ||
      resultado.testes?.nome?.includes('PAS') ||
      resultado.testes?.nome?.includes('Percepção de Assédio');
    
    // Verificar se é um resultado do teste QVT (Qualidade de Vida no Trabalho)
    const isQVT = 
      resultado.teste_id === 'qualidade-vida-trabalho' ||
      resultado.metadados?.tipo_teste === 'qualidade-vida-trabalho' ||
      resultado.metadados?.teste_nome?.includes('QVT') ||
      resultado.metadados?.teste_nome?.includes('Qualidade de Vida') ||
      resultado.testes?.nome?.includes('QVT') ||
      resultado.testes?.nome?.includes('Qualidade de Vida no Trabalho') ||
      // Verificar se tem campos específicos do QVT
      resultado.indice_geral !== undefined ||
      resultado.satisfacao_funcao !== undefined;
    
    // Verificar se é um resultado do teste RPO (Riscos Psicossociais Ocupacionais)
    const isRPO = 
      resultado.teste_id === 'rpo' ||
      resultado.metadados?.tipo_teste === 'rpo' ||
      resultado.metadados?.teste_nome?.includes('RPO') ||
      resultado.metadados?.teste_nome?.includes('Riscos Psicossociais Ocupacionais') ||
      resultado.metadados?.teste_nome?.includes('HumaniQ RPO') ||
      resultado.testes?.nome?.includes('RPO') ||
      resultado.testes?.nome?.includes('Riscos Psicossociais Ocupacionais');
    
    if (isKarasekSiegrist) {
      navigate(`/resultado/karasek-siegrist/${resultado.id}`);
    } else if (isEstresseOcupacional) {
      navigate(`/resultado/estresse-ocupacional/${resultado.id}`);
    } else if (isMGRP) {
      navigate(`/resultado/maturidade-riscos-psicossociais/${resultado.id}`);
    } else if (isPAS) {
      navigate(`/resultado/percepcao-assedio/${resultado.id}`);
    } else if (isQVT) {
      navigate(`/resultado/qualidade-vida-trabalho/${resultado.id}`);
    } else if (isRPO) {
      navigate(`/resultado/rpo/${resultado.id}`);
    } else {
      navigate(`/resultado/${resultado.id}`);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarTempo = (segundos: number) => {
    if (segundos === null || segundos === undefined || isNaN(segundos as any)) return '00:00:00';
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const seg = Math.floor(segundos % 60);
    const hh = String(horas).padStart(2, '0');
    const mm = String(minutos).padStart(2, '0');
    const ss = String(seg).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const getBadgeColor = (pontuacao: number) => {
    if (pontuacao >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (pontuacao >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  // Label de nível a partir da pontuação (0-100)
  const getScoreLabel = (pontuacao?: number) => {
    if (pontuacao === undefined || pontuacao === null) return 'N/A';
    if (pontuacao >= 80) return 'Alto';
    if (pontuacao >= 60) return 'Médio';
    return 'Baixo';
  };

  // Geração de recomendações personalizadas com base nos resultados atuais
  const gerarRecomendacoes = (lista: Resultado[]) => {
    const recs: { titulo: string; descricao: string; prioridade: 'alta' | 'media' | 'baixa'; categoria?: string }[] = [];

    if (!lista || lista.length === 0) {
      recs.push({
        titulo: 'Sem dados suficientes',
        descricao: 'Realize novos testes para obter recomendações personalizadas mais precisas.',
        prioridade: 'baixa',
        categoria: 'geral'
      });
      return recs;
    }

    // Agrupar pontuações por tipo de teste
    const normalizarTipo = (r: Resultado) => (r.testes?.nome || r.metadados?.teste_nome || r.teste_id || 'desconhecido').toString().toLowerCase();
    const grupos: Record<string, { soma: number; count: number }> = {};
    lista.forEach((r) => {
      const tipo = normalizarTipo(r);
      const score = typeof r.pontuacao_total === 'number'
        ? r.pontuacao_total
        : ((r as any).indice_geral ?? (r.metadados?.analise_completa?.pontuacaoGeral as number | undefined));
      if (typeof score === 'number') {
        if (!grupos[tipo]) grupos[tipo] = { soma: 0, count: 0 };
        grupos[tipo].soma += score;
        grupos[tipo].count += 1;
      }
    });

    const mediaPorTipo: Record<string, number> = {};
    Object.entries(grupos).forEach(([tipo, { soma, count }]) => {
      mediaPorTipo[tipo] = Math.round(soma / count);
    });

    // Risco psicossocial geral
    const risco = calcularRiscoPsicossocial(lista.slice(0, 20));

    // Regras de recomendação
    if (risco.nivel === 'Alto') {
      recs.push(
        {
          titulo: 'Reduzir sobrecarga e reorganizar tarefas',
          descricao: 'Priorize atividades essenciais, redistribua demandas e garanta pausas programadas para mitigar o risco elevado.',
          prioridade: 'alta',
          categoria: 'saúde ocupacional'
        },
        {
          titulo: 'Apoio psicológico e canais de escuta',
          descricao: 'Disponibilize apoio psicológico e crie espaços de escuta ativa; incentive o uso de canais formais de suporte.',
          prioridade: 'alta',
          categoria: 'suporte'
        },
        {
          titulo: 'Plano de ação de curto prazo',
          descricao: 'Defina metas semanais de bem-estar, monitorando evolução com novos testes e feedback contínuo.',
          prioridade: 'media',
          categoria: 'gestão'
        }
      );
    } else if (risco.nivel === 'Médio') {
      recs.push(
        {
          titulo: 'Rotina de pausas e micro-recuperação',
          descricao: 'Implemente pausas curtas regulares e técnicas de respiração/alongamento para manter equilíbrio diário.',
          prioridade: 'media',
          categoria: 'saúde ocupacional'
        },
        {
          titulo: 'Check-ins quinzenais',
          descricao: 'Realize check-ins quinzenais com a equipe para identificar sinais precoces de desgaste e ajustar rotas.',
          prioridade: 'media',
          categoria: 'gestão'
        }
      );
    }

    // Recomendações específicas por tipo
    const qvtKey = Object.keys(mediaPorTipo).find((k) => k.includes('qvt') || k.includes('qualidade de vida'));
    if (qvtKey && mediaPorTipo[qvtKey] < 60) {
      recs.push({
        titulo: 'Melhorar fatores de QVT',
        descricao: 'Atue em autonomia, reconhecimento e ambiente físico; avalie flexibilidade de horários e ergonomia.',
        prioridade: 'media',
        categoria: 'qvt'
      });
    }

    const pasKey = Object.keys(mediaPorTipo).find((k) => k.includes('pas') || k.includes('assédio'));
    if (pasKey && mediaPorTipo[pasKey] < 70) {
      recs.push({
        titulo: 'Fortalecer prevenção e canais de denúncia',
        descricao: 'Promova treinamentos de respeito no ambiente de trabalho e garanta canais confidenciais de suporte.',
        prioridade: 'alta',
        categoria: 'pas'
      });
    }

    const eoKey = Object.keys(mediaPorTipo).find((k) => k.includes('estresse') || k.includes('eo'));
    if (eoKey && mediaPorTipo[eoKey] < 65) {
      recs.push({
        titulo: 'Gestão do estresse ocupacional',
        descricao: 'Ajuste prazos, evite multitarefas excessivas e adote práticas de mindfulness ou pausas estruturadas.',
        prioridade: 'media',
        categoria: 'estresse'
      });
    }

    const rpoKey = Object.keys(mediaPorTipo).find((k) => k.includes('rpo') || k.includes('psicossociais'));
    if (rpoKey && mediaPorTipo[rpoKey] < 65) {
      recs.push({
        titulo: 'Mapeamento e mitigação de riscos',
        descricao: 'Realize avaliações periódicas dos fatores psicossociais e implemente medidas de mitigação segmentadas.',
        prioridade: 'media',
        categoria: 'rpo'
      });
    }

    // Tendência negativa recente
    if (typeof variacaoPontuacao === 'number' && variacaoPontuacao < 0) {
      recs.push({
        titulo: 'Reverter queda de pontuação',
        descricao: 'Investigue causas da queda recente e crie um plano de melhoria com metas claras e acompanhamento semanal.',
        prioridade: 'media',
        categoria: 'tendência'
      });
    }

    // Garantir ao menos 3 recomendações
    if (recs.length < 3) {
      recs.push(
        {
          titulo: 'Rotina de bem-estar',
          descricao: 'Estabeleça rotina de pausas, alongamentos e desconexão fora do expediente para recuperação adequada.',
          prioridade: 'baixa'
        },
        {
          titulo: 'Feedback contínuo',
          descricao: 'Crie ciclos de feedback e reconhecimento para aumentar engajamento e percepção de suporte.',
          prioridade: 'baixa'
        }
      );
    }

    return recs;
  };

  // Cálculo simplificado de risco psicossocial com base nos resultados recentes
  const calcularRiscoPsicossocial = (lista: Resultado[]) => {
    if (!lista || lista.length === 0) return { nivel: 'N/A', cor: 'text-gray-600', valor: 0 };

    const getWeight = (tipo: string) => {
      const t = tipo.toLowerCase();
      if (t.includes('assédio') || t.includes('pas')) return 1.3; // maior impacto
      if (t.includes('rpo') || t.includes('psicossocial')) return 1.2;
      if (t.includes('estresse') || t.includes('eo')) return 1.15;
      if (t.includes('karasek') || t.includes('siegrist')) return 1.1;
      if (t.includes('mgrp') || t.includes('maturidade')) return 0.95; // maturidade tende a reduzir risco
      if (t.includes('qvt') || t.includes('qualidade de vida')) return 1.0;
      return 1.0;
    };

    let somaPonderada = 0;
    let somaPesos = 0;

    lista.forEach((r) => {
      const tipo = (r.testes?.nome || r.metadados?.teste_nome || r.teste_id || '').toString();
      const peso = getWeight(tipo);

      let baseScore: number | undefined = typeof r.pontuacao_total === 'number' ? r.pontuacao_total : undefined;
      if (baseScore === undefined) {
        const indiceGeral = (r as any)?.indice_geral as number | undefined;
        baseScore = indiceGeral ?? (r.metadados?.analise_completa?.pontuacaoGeral as number | undefined);
      }

      if (baseScore === undefined) return; // sem pontuação, ignora

      const riscoBruto = 100 - Math.max(0, Math.min(100, baseScore));
      const riscoPonderado = Math.max(0, Math.min(100, Math.round(riscoBruto * peso)));
      somaPonderada += riscoPonderado * peso;
      somaPesos += peso;
    });

    if (somaPesos === 0) return { nivel: 'N/A', cor: 'text-gray-600', valor: 0 };

    const mediaPonderada = Math.round(somaPonderada / somaPesos);
    const nivel = mediaPonderada >= 70 ? 'Alto' : mediaPonderada >= 40 ? 'Médio' : 'Baixo';
    const cor = nivel === 'Alto' ? 'text-red-600' : nivel === 'Médio' ? 'text-yellow-600' : 'text-green-600';
    return { nivel, cor, valor: mediaPonderada };
  };

  const totalPaginas = Math.ceil(totalResultados / (filtros.limite || 20));

  // Preparar dados de insights
  const ultimoResultado = resultados[0];
  const ultimaPontuacao = ultimoResultado
    ? (typeof ultimoResultado.pontuacao_total === 'number'
        ? ultimoResultado.pontuacao_total
        : ((ultimoResultado as any).indice_geral ?? (ultimoResultado.metadados?.analise_completa?.pontuacaoGeral as number | undefined)))
    : undefined;
  const anteriorMesmoTeste = ultimoResultado
    ? resultados.slice(1).find((r) => (r.testes?.nome || r.teste_id) === (ultimoResultado.testes?.nome || ultimoResultado.teste_id))
    : undefined;
  const pontuacaoAnterior = anteriorMesmoTeste
    ? (typeof anteriorMesmoTeste.pontuacao_total === 'number'
        ? anteriorMesmoTeste.pontuacao_total
        : ((anteriorMesmoTeste as any).indice_geral ?? (anteriorMesmoTeste.metadados?.analise_completa?.pontuacaoGeral as number | undefined)))
    : undefined;
  const variacaoPontuacao =
    ultimaPontuacao !== undefined && pontuacaoAnterior !== undefined
      ? Math.round(ultimaPontuacao - pontuacaoAnterior)
      : undefined;
  const riscoPsicossocial = calcularRiscoPsicossocial(resultados.slice(0, 20));
  const totalUltimos30Dias = resultados.filter((r) => new Date(r.data_realizacao).getTime() >= Date.now() - 30 * 24 * 60 * 60 * 1000).length;

  // Agrupar recomendações por categoria para orientar visualização detalhada
  const categoriasAgrupadas: Record<string, { titulo: string; descricao: string; prioridade: 'alta' | 'media' | 'baixa'; categoria?: string }[]> =
    (recomendacoes || []).reduce((acc, rec) => {
      const key = (rec.categoria || 'geral').toLowerCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(rec);
      return acc;
    }, {} as Record<string, { titulo: string; descricao: string; prioridade: 'alta' | 'media' | 'baixa'; categoria?: string }[]>);

  const labelCategoria = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes('qvt')) return 'Qualidade de Vida no Trabalho';
    if (k.includes('pas') || k.includes('assédio')) return 'Prevenção ao Assédio';
    if (k.includes('estresse') || k.includes('eo')) return 'Estresse Ocupacional';
    if (k.includes('rpo') || k.includes('psicossociais')) return 'Riscos Psicossociais';
    if (k.includes('saúde')) return 'Saúde Ocupacional';
    if (k.includes('suporte')) return 'Suporte e Escuta';
    if (k.includes('gestão')) return 'Gestão e Rotinas';
    if (k.includes('tendência')) return 'Tendências de Pontuação';
    return 'Geral';
  };

  const [mostrarOrientacoes, setMostrarOrientacoes] = useState(false);

  // Atualizar recomendações quando os resultados mudarem
  useEffect(() => {
    const novas = gerarRecomendacoes(resultados);
    setRecomendacoes(novas);
  }, [resultados]);

  if (loading && resultados.length === 0) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">Todos os Resultados</h1>
          <p className="text-muted-foreground mt-1">
            Visualize e explore todos os resultados de testes realizados na plataforma
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          
          <Button
            onClick={carregarDados}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-primary text-white shadow-glow"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Resultados</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.totalTestes}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pontuação Média</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.pontuacaoMedia}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        
      </div>

      {/* Insights Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Nível de Risco Psicossocial */}
        <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nível de Risco Psicossocial</p>
                <p className={`text-2xl font-bold ${riscoPsicossocial.cor}`}>
                  {riscoPsicossocial.nivel}
                </p>
                <p className="text-xs text-gray-500">Baseado na média dos últimos resultados</p>
              </div>
              {riscoPsicossocial.nivel === 'Alto' ? (
                <AlertTriangle className="h-8 w-8 text-red-600" />
              ) : riscoPsicossocial.nivel === 'Médio' ? (
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              ) : (
                <Shield className="h-8 w-8 text-green-600" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progresso nos últimos 30 dias */}
        <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progresso (últimos 30 dias)</p>
                <p className="text-2xl font-bold text-gray-900">{totalUltimos30Dias} testes</p>
                <p className="text-xs text-gray-500">Atividade recente na plataforma</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <Progress value={Math.min(100, Math.round((totalUltimos30Dias / 30) * 100))} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recomendações Personalizadas */}
      <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Recomendações Personalizadas
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => setMostrarOrientacoes(true)}>
            Ver orientações detalhadas
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {recomendacoes.length === 0 ? (
            <p className="text-sm text-gray-600">Sem recomendações no momento.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recomendacoes.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-lg border border-border/50 bg-white/60 p-4">
                  <div className={`h-8 w-8 rounded-md flex items-center justify-center ${rec.prioridade === 'alta' ? 'bg-red-100' : rec.prioridade === 'media' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                    <CheckCircle2 className={`h-5 w-5 ${rec.prioridade === 'alta' ? 'text-red-600' : rec.prioridade === 'media' ? 'text-yellow-600' : 'text-green-600'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{rec.titulo}</p>
                    <p className="text-sm text-gray-600">{rec.descricao}</p>
                    {rec.categoria && <p className="text-xs text-gray-500 mt-1">Categoria: {rec.categoria}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500">Baseado nos testes realizados e atualizado automaticamente quando novos resultados são concluídos.</p>
        </CardContent>
      </Card>

      {/* Dialog: Orientações detalhadas */}
      <Dialog open={mostrarOrientacoes} onOpenChange={setMostrarOrientacoes}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Orientações detalhadas</DialogTitle>
            <DialogDescription>
              Baseadas nos seus resultados recentes e prioridades identificadas.
            </DialogDescription>
          </DialogHeader>

          {recomendacoes.length === 0 ? (
            <p className="text-sm text-gray-600">No momento, não há orientações adicionais. Realize novos testes para obter recomendações mais precisas.</p>
          ) : (
            <div className="space-y-6">
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(categoriasAgrupadas).map(([cat, recs]) => (
                  <AccordionItem key={cat} value={cat}>
                    <AccordionTrigger className="text-base font-semibold">
                      {labelCategoria(cat)}
                      <span className="ml-2 text-xs text-muted-foreground">({recs.length})</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {recs.map((rec, i) => (
                          <div key={i} className="rounded-md border border-border/50 bg-white/70 p-3">
                            <div className="flex items-start gap-2">
                              <Badge variant="outline" className={`${rec.prioridade === 'alta' ? 'text-red-600 border-red-200' : rec.prioridade === 'media' ? 'text-yellow-700 border-yellow-200' : 'text-green-700 border-green-200'}`}>{rec.prioridade.toUpperCase()}</Badge>
                              <p className="font-medium text-gray-900">{rec.titulo}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-700">{rec.descricao}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="rounded-lg border border-border/50 bg-white/70 p-4">
                <p className="font-semibold text-gray-900 mb-2">Próximos passos sugeridos</p>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  <li>Agende check-ins regulares para acompanhar bem‑estar e ajustar rotas.</li>
                  <li>Estabeleça pausas programadas e micro‑recuperações ao longo do dia.</li>
                  <li>Monitore indicadores com novos testes e feedback contínuo.</li>
                  <li>Fortaleça canais de escuta e apoio, garantindo confidencialidade.</li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Filtros */}
      {mostrarFiltros && (
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Busca
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Buscar por texto
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Nome do teste, observações..."
                    value={filtros.busca || ''}
                    onChange={(e) => aplicarFiltros({ busca: e.target.value || undefined })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Tipo de Teste
                </label>
                <Select
                  value={filtros.tipoTeste || ''}
                  onValueChange={(value) => aplicarFiltros({ tipoTeste: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os tipos</SelectItem>
                    {tiposTeste.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Data Início
                </label>
                <Input
                  type="date"
                  value={filtros.dataInicio || ''}
                  onChange={(e) => aplicarFiltros({ dataInicio: e.target.value || undefined })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Data Fim
                </label>
                <Input
                  type="date"
                  value={filtros.dataFim || ''}
                  onChange={(e) => aplicarFiltros({ dataFim: e.target.value || undefined })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Pontuação Mínima
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={filtros.pontuacaoMin || ''}
                  onChange={(e) => aplicarFiltros({ pontuacaoMin: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Pontuação Máxima
                </label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="100"
                  value={filtros.pontuacaoMax || ''}
                  onChange={(e) => aplicarFiltros({ pontuacaoMax: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button onClick={limparFiltros} variant="outline">
                Limpar Filtros
              </Button>
              <Button className="bg-gradient-primary text-white shadow-glow" onClick={carregarDados} disabled={loading}>
                Aplicar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem de erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Lista de Resultados */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Resultados Encontrados ({totalResultados})</span>
            {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {resultados.length === 0 && !loading ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum resultado encontrado</p>
              <p className="text-sm text-gray-500 mt-1">
                Tente ajustar os filtros ou realizar alguns testes
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {resultados.map((resultado) => (
                <Card
                  key={resultado.id}
                  className="bg-gradient-card border-border/50 hover:shadow-glow transition-all cursor-pointer"
                  onClick={() => visualizarResultado(resultado)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {resultado.testes?.nome}
                          </h3>
                          <Badge className={getBadgeColor(resultado.pontuacao_total)}>
                            {resultado.pontuacao_total} pontos
                          </Badge>
                          <Badge variant="outline">
                            {resultado.testes?.categoria || 'Geral'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatarData(resultado.data_realizacao)}
                          </div>
                          
                          {resultado.tempo_gasto && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatarTempo(resultado.tempo_gasto)}
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500">
                            ID: {resultado.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {((paginaAtual - 1) * (filtros.limite || 20)) + 1} a{' '}
            {Math.min(paginaAtual * (filtros.limite || 20), totalResultados)} de {totalResultados} resultados
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => mudarPagina(paginaAtual - 1)}
              disabled={paginaAtual === 1}
            >
              Anterior
            </Button>
            
            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPaginas))].map((_, i) => {
                const pagina = i + 1;
                return (
                  <Button
                    key={pagina}
                    className={`${pagina === paginaAtual ? 'bg-gradient-primary text-white shadow-glow' : ''}`}
                    variant={pagina === paginaAtual ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => mudarPagina(pagina)}
                  >
                    {pagina}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => mudarPagina(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}