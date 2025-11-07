import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Lock, Calendar, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Logo from "@/components/Logo";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TesteDisponibilidade {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: string | null;
  tempoEstimado: number | null;
  ativo: boolean;
  disponivel: boolean;
  motivo: string | null;
  proximaDisponibilidade: string | null;
  dataConclusao: string | null;
  pontuacao: number | null;
  periodicidadeDias: number | null;
}

export default function ColaboradorTestes() {
  const navigate = useNavigate();
  const [testes, setTestes] = useState<TesteDisponibilidade[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarTestesDisponiveis();
  }, []);

  const carregarTestesDisponiveis = async () => {
    try {
      setCarregando(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch('/api/teste-disponibilidade/colaborador/testes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar testes');
      }

      const data = await response.json();
      setTestes(data.testes || []);
    } catch (error) {
      console.error('Erro ao carregar testes:', error);
      toast.error('Erro ao carregar testes disponíveis');
    } finally {
      setCarregando(false);
    }
  };

  const getMotivoTexto = (motivo: string | null, proximaDisponibilidade: string | null) => {
    if (motivo === 'teste_concluido') {
      return 'Teste já concluído';
    } else if (motivo === 'bloqueado_empresa') {
      return 'Aguardando liberação da empresa';
    } else if (motivo === 'aguardando_periodicidade' && proximaDisponibilidade) {
      const data = new Date(proximaDisponibilidade);
      return `Disponível em ${format(data, "dd 'de' MMMM", { locale: ptBR })}`;
    }
    return 'Indisponível';
  };

  const getTesteUrl = (nome: string) => {
    const nomeNorm = nome.toLowerCase();
    if (nomeNorm.includes('humaniq insight') || nomeNorm.includes('humaniq-insight')) return '/teste/humaniq-insight';
    if (nomeNorm.includes('clima organizacional')) return '/teste/clima-organizacional';
    if (nomeNorm.includes('karasek') || nomeNorm.includes('siegrist')) return '/teste/karasek-siegrist';
    if (nomeNorm.includes('estresse ocupacional')) return '/teste/estresse-ocupacional';
    if (nomeNorm.includes('clima e bem-estar')) return '/teste/clima-bem-estar';
    if (nomeNorm.includes('maturidade')) return '/teste/maturidade-riscos-psicossociais';
    if (nomeNorm.includes('assédio')) return '/teste/percepcao-assedio';
    if (nomeNorm.includes('qualidade de vida')) return '/teste/qualidade-vida-trabalho';
    if (nomeNorm.includes('rpo') || nomeNorm.includes('riscos psicossociais')) return '/teste/rpo';
    return '/testes';
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando testes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Meus Testes</h1>
        <p className="text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto">
          Veja os testes disponíveis e os que você já completou
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {testes.map((teste) => (
          <Card
            key={teste.id}
            className={`${
              !teste.disponivel ? 'bg-gray-50 dark:bg-gray-800/50 opacity-75' : 'bg-white dark:bg-gray-800'
            } border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300`}
            data-testid={`card-teste-${teste.id}`}
          >
            <CardHeader className="space-y-4">
              <div className="flex justify-center">
                <div
                  className={`w-16 h-16 rounded-full ${
                    teste.disponivel ? 'bg-blue-500' : 'bg-gray-400'
                  } flex items-center justify-center shadow-sm`}
                >
                  {teste.disponivel ? (
                    <Logo size="sm" showText={false} />
                  ) : (
                    <Lock className="h-8 w-8 text-white" />
                  )}
                </div>
              </div>

              <div className="text-center space-y-3">
                <div className="flex justify-center gap-2 flex-wrap">
                  {teste.categoria && (
                    <Badge variant="outline" className="text-xs">
                      {teste.categoria}
                    </Badge>
                  )}
                  {!teste.disponivel && (
                    <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700">
                      <Lock className="h-3 w-3 mr-1" />
                      Indisponível
                    </Badge>
                  )}
                  {teste.dataConclusao && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Concluído
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  {teste.nome}
                </CardTitle>

                {teste.descricao && (
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed px-2">
                    {teste.descricao}
                  </CardDescription>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {teste.tempoEstimado && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Clock className="h-4 w-4" />
                  <span>{teste.tempoEstimado} minutos</span>
                </div>
              )}

              {!teste.disponivel && teste.motivo && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    {getMotivoTexto(teste.motivo, teste.proximaDisponibilidade)}
                  </p>
                </div>
              )}

              {teste.dataConclusao && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Concluído em{' '}
                    {format(new Date(teste.dataConclusao), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              )}

              <Button
                className={`w-full rounded-xl py-3 font-medium transition-colors duration-200 ${
                  teste.disponivel
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 cursor-not-allowed text-gray-600'
                }`}
                onClick={() => teste.disponivel && navigate(getTesteUrl(teste.nome))}
                disabled={!teste.disponivel}
                data-testid={`button-iniciar-${teste.id}`}
              >
                {teste.disponivel ? 'Iniciar Teste' : 'Indisponível'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {testes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Nenhum teste disponível no momento.
          </p>
        </div>
      )}
    </div>
  );
}
