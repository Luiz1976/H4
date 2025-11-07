import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Calendar, 
  ExternalLink, 
  Download, 
  Loader2, 
  Search, 
  Filter,
  TrendingUp,
  BarChart3,
  Clock,
  Trophy,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { resultadosService } from "@/lib/database";
import { useSession } from "@/lib/services/session-service";
import type { Resultado } from "@/lib/types";
import { TestResultVerification } from "@/components/TestResultVerification";

interface FiltrosResultados {
  tipoTeste?: string;
  dataInicio?: string;
  dataFim?: string;
  pontuacaoMin?: number;
  pontuacaoMax?: number;
  busca?: string;
}

interface EstatisticasSessao {
  totalTestes: number;
  pontuacaoMedia: number;
  tempoMedio: number;
  testesFavoritos: Array<{ nome: string; quantidade: number }>;
  evolucaoMensal: Array<{ mes: string; quantidade: number; pontuacaoMedia: number }>;
}

export default function Resultados() {
  const navigate = useNavigate();
  const { sessionId } = useSession();
  
  console.log('🔍 [RESULTADOS] Página carregada, sessionId:', sessionId);
  
  // Estados principais
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasSessao | null>(null);
  const [tiposTeste, setTiposTeste] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de filtros e paginação
  const [filtros, setFiltros] = useState<FiltrosResultados>({});
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  const ITENS_POR_PAGINA = 10;

  useEffect(() => {
    console.log('🔍 [RESULTADOS] useEffect triggered, sessionId:', sessionId);
    if (sessionId) {
      carregarDados();
    }
  }, [sessionId, filtros, paginaAtual]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [RESULTADOS] Carregando dados para sessão:', sessionId);
      
      // Carregar resultados com filtros e paginação
      const offset = (paginaAtual - 1) * ITENS_POR_PAGINA;
      const resultadosResponse = await resultadosService.buscarResultadosPorSessao(
        sessionId, 
        {
          ...filtros,
          limite: ITENS_POR_PAGINA,
          offset
        }
      );
      
      // Carregar estatísticas
      const estatisticasData = await resultadosService.buscarEstatisticasSessao(sessionId);
      
      // Carregar tipos de teste disponíveis
      const tiposData = await resultadosService.buscarTiposTeste();
      
      // Extrair o array de resultados do objeto de resposta
      setResultados(resultadosResponse.resultados || []);
      setEstatisticas(estatisticasData);
      setTiposTeste(tiposData);
      
      // Calcular total de páginas usando o total real retornado
      const totalReal = resultadosResponse.total || 0;
      setTotalPaginas(Math.ceil(totalReal / ITENS_POR_PAGINA));
      
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
      setResultados([]);
      setEstatisticas(null);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = (novosFiltros: Partial<FiltrosResultados>) => {
    setFiltros(prev => ({ ...prev, ...novosFiltros }));
    setPaginaAtual(1); // Reset para primeira página
  };

  const limparFiltros = () => {
    setFiltros({});
    setPaginaAtual(1);
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
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}m ${segs}s`;
  };

  const getCorPontuacao = (pontuacao: number) => {
    if (pontuacao >= 80) return "text-green-600";
    if (pontuacao >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getBadgeStatus = (status: string) => {
    switch (status) {
      case 'concluido':
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'em_andamento':
        return <Badge variant="secondary">Em Andamento</Badge>;
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const handleVerResultado = (id: string, resultado?: Resultado) => {
    // Se temos informações do resultado, verificar o tipo de teste
    if (resultado) {
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
      
      if (isKarasekSiegrist) {
        navigate(`/resultado/karasek-siegrist/${id}`);
        return;
      } else if (isEstresseOcupacional) {
        navigate(`/resultado/estresse-ocupacional/${id}`);
        return;
      }
    }
    
    // Fallback para rota genérica
    navigate(`/resultado/${id}`);
  };

  const exportarResultados = async () => {
    try {
      // Implementar exportação futura
      console.log('Exportar resultados...');
    } catch (err) {
      console.error('Erro ao exportar:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Meus Resultados
          </h1>
          <p className="text-xl text-muted-foreground">
            Acesse e gerencie todos os seus resultados de testes
          </p>
        </div>
        
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
            <h3 className="text-lg font-medium mb-2">Carregando resultados...</h3>
            <p className="text-muted-foreground">
              Aguarde enquanto buscamos seus dados.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Meus Resultados
          </h1>
          <p className="text-xl text-muted-foreground">
            Acesse e gerencie todos os seus resultados de testes
          </p>
        </div>
        
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Erro ao carregar resultados</h3>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <Button 
              className="bg-gradient-primary hover:opacity-90"
              onClick={carregarDados}
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
          Meus Resultados
        </h1>
        <p className="text-xl text-muted-foreground">
          Acesse e gerencie todos os seus resultados de testes
        </p>
      </div>

      {/* Estatísticas Visuais */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <div className="text-sm font-medium text-muted-foreground">Total de Testes</div>
              </div>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                {estatisticas.totalTestes}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div className="text-sm font-medium text-muted-foreground">Pontuação Média</div>
              </div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {estatisticas.pontuacaoMedia}%
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div className="text-sm font-medium text-muted-foreground">Tempo Médio</div>
              </div>
              <div className="text-3xl font-bold text-orange-600 mt-2">
                {formatarTempo(estatisticas.tempoMedio)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-purple-600" />
                <div className="text-sm font-medium text-muted-foreground">Teste Favorito</div>
              </div>
              <div className="text-lg font-bold text-purple-600 mt-2">
                {estatisticas.testesFavoritos[0]?.nome || 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros e Busca */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros e Busca</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
            >
              {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Busca Principal */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome do teste, interpretação ou recomendações..."
              className="pl-10"
              value={filtros.busca || ''}
              onChange={(e) => aplicarFiltros({ busca: e.target.value })}
            />
          </div>

          {/* Filtros Avançados */}
          {mostrarFiltros && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Teste</label>
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
                        {tipo.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Data Início</label>
                <Input
                  type="date"
                  value={filtros.dataInicio || ''}
                  onChange={(e) => aplicarFiltros({ dataInicio: e.target.value || undefined })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Data Fim</label>
                <Input
                  type="date"
                  value={filtros.dataFim || ''}
                  onChange={(e) => aplicarFiltros({ dataFim: e.target.value || undefined })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pontuação Mínima</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  value={filtros.pontuacaoMin || ''}
                  onChange={(e) => aplicarFiltros({ pontuacaoMin: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
            </div>
          )}

          {/* Ações dos Filtros */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={limparFiltros}
              >
                Limpar Filtros
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportarResultados}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {resultados.length} resultado(s) encontrado(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Resultados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Histórico de Testes</h2>
          
          {/* Paginação Superior */}
          {totalPaginas > 1 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                disabled={paginaAtual === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {paginaAtual} de {totalPaginas}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))}
                disabled={paginaAtual === totalPaginas}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {resultados.length === 0 ? (
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum resultado encontrado</h3>
              <p className="text-muted-foreground mb-6">
                {Object.keys(filtros).length > 0 
                  ? 'Nenhum resultado corresponde aos filtros aplicados. Tente ajustar os critérios de busca.'
                  : 'Você ainda não realizou nenhum teste. Que tal começar agora?'
                }
              </p>
              <div className="flex items-center justify-center space-x-4">
                {Object.keys(filtros).length > 0 && (
                  <Button 
                    variant="outline"
                    onClick={limparFiltros}
                  >
                    Limpar Filtros
                  </Button>
                )}
                <Button 
                  className="bg-gradient-primary hover:opacity-90"
                  onClick={() => navigate('/testes')}
                >
                  {Object.keys(filtros).length > 0 ? 'Ver Todos os Testes' : 'Fazer Primeiro Teste'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {resultados.map((resultado) => (
              <Card 
                key={resultado.id}
                className="hover:shadow-glow transition-all duration-300 bg-gradient-card border-border/50"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {resultado.metadados?.teste_nome || `Teste ${resultado.teste_id}`}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatarData(resultado.data_realizacao)}</span>
                      </span>
                      {resultado.tempo_gasto > 0 && (
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatarTempo(resultado.tempo_gasto)}</span>
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getBadgeStatus(resultado.status)}
                    <div className={`text-2xl font-bold ${getCorPontuacao(resultado.pontuacao_total)}`}>
                      {resultado.pontuacao_total}%
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Interpretação Resumida */}
                  {resultado.metadados?.interpretacao && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Interpretação:</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {resultado.metadados.interpretacao}
                      </p>
                    </div>
                  )}

                  {/* Pontuações por Dimensão */}
                  {resultado.pontuacoes_dimensoes && Object.keys(resultado.pontuacoes_dimensoes).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Dimensões Avaliadas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(resultado.pontuacoes_dimensoes).slice(0, 4).map(([dimensao, pontuacao]) => (
                          <Badge key={dimensao} variant="secondary" className="text-xs">
                            {dimensao.replace('-', ' ')}: {typeof pontuacao === 'number' ? pontuacao.toFixed(1) : pontuacao}
                          </Badge>
                        ))}
                        {Object.keys(resultado.pontuacoes_dimensoes).length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{Object.keys(resultado.pontuacoes_dimensoes).length - 4} mais
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-muted-foreground">
                      ID: {resultado.id.slice(0, 8)}...
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerResultado(resultado.id, resultado)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Paginação Inferior */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-center space-x-2 pt-6">
            <Button
              variant="outline"
              onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
              disabled={paginaAtual === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={paginaAtual === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPaginaAtual(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {totalPaginas > 5 && (
                <>
                  <span className="text-muted-foreground">...</span>
                  <Button
                    variant={paginaAtual === totalPaginas ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPaginaAtual(totalPaginas)}
                  >
                    {totalPaginas}
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))}
              disabled={paginaAtual === totalPaginas}
            >
              Próxima
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      {/* Componente de Debug para Verificação de Resultado Específico */}
      <TestResultVerification />
      
      {/* Log adicional para verificar renderização */}
      {console.log('🔍 Renderizando TestResultVerification na página Resultados')}
    </div>
  );
}