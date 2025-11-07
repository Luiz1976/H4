import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, Loader2, AlertTriangle } from "lucide-react";
import Logo from "@/components/Logo";
import { apiService } from "@/services/apiService";
import { ResultadoVisualizacao } from "@/components/ResultadoVisualizacao";

export default function Resultado() {
  const { resultadoId } = useParams();
  const navigate = useNavigate();
  const [resultado, setResultado] = useState<any>(null);
  const [dadosResultado, setDadosResultado] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarResultado();
  }, [resultadoId]);

  const carregarResultado = async () => {
    if (!resultadoId) {
      setErro("ID do resultado não fornecido");
      setCarregando(false);
      return;
    }

    console.log('🔍 [Resultado] Carregando resultado:', resultadoId);

    try {
      setCarregando(true);
      const response = await apiService.obterResultadoPorId(resultadoId);
      const dadosCompletos = response.resultado;
      
      console.log('✅ [Resultado] Dados recebidos:', dadosCompletos);

      if (!dadosCompletos) {
        setErro("Resultado não encontrado");
        return;
      }

      // Preparar objeto resultado simplificado para ResultadoVisualizacao
      const resultadoSimples = {
        id: dadosCompletos.id || resultadoId,
        nomeTest: dadosCompletos.metadados?.teste_nome || 
                  dadosCompletos.testes?.nome || 
                  'Resultado do Teste',
        categoria: dadosCompletos.testes?.categoria || '',
        pontuacao: dadosCompletos.pontuacao_total || 0,
        nivel: dadosCompletos.metadados?.classificacaoGeral || '',
        dataRealizacao: dadosCompletos.data_realizacao || new Date().toISOString(),
        tipoTabela: dadosCompletos.metadados?.tipo_teste || ''
      };

      setResultado(resultadoSimples);
      setDadosResultado(dadosCompletos);

    } catch (error) {
      console.error('❌ [Resultado] Erro ao carregar:', error);
      setErro("Erro ao carregar resultado. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  // Obter nome do teste de várias fontes
  const obterNomeTeste = (): string => {
    if (dadosResultado?.metadados?.teste_nome) return dadosResultado.metadados.teste_nome;
    if (dadosResultado?.testes?.nome) return dadosResultado.testes.nome;
    if (resultado?.nomeTest) return resultado.nomeTest;
    if (dadosResultado?.metadados?.tipo_teste) {
      const tipo = dadosResultado.metadados.tipo_teste;
      if (tipo === 'clima-organizacional') return 'Pesquisa de Clima Organizacional';
      if (tipo === 'rpo') return 'Riscos Psicossociais Ocupacionais';
      if (tipo === 'qvt') return 'Qualidade de Vida no Trabalho';
      if (tipo === 'karasek-siegrist') return 'Karasek-Siegrist';
    }
    return 'Resultado do Teste';
  };

  const handleDownload = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleShare = () => {
    console.log('Funcionalidade de compartilhamento em desenvolvimento');
  };

  // Estado de carregamento
  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 font-medium">Carregando resultado...</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (erro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-red-700">Erro</h2>
          <p className="text-gray-600 mb-6">{erro}</p>
          <div className="flex gap-3">
            <Button
              onClick={carregarResultado}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Tentar Novamente
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Sem resultado
  if (!resultado || !dadosResultado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <Logo size="lg" showText={false} className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Resultado não encontrado</h2>
          <p className="text-gray-600 mb-6">
            Não foi possível encontrar o resultado solicitado.
          </p>
          <Button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  // Página principal do resultado
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-white"
              data-testid="button-voltar"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {obterNomeTeste()}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Resultado ID: {resultadoId?.slice(0, 8)}...
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2 bg-white"
              data-testid="button-baixar"
            >
              <Download className="h-4 w-4" />
              Baixar PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2 bg-white"
              data-testid="button-compartilhar"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
          </div>
        </div>

        {/* Conteúdo do Resultado usando componente compartilhado */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <ResultadoVisualizacao 
            resultado={resultado}
            dadosResultado={dadosResultado}
            carregando={false}
            erro={null}
          />
        </div>
      </div>
    </div>
  );
}
