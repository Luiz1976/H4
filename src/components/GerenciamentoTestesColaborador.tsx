import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Lock, Unlock, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TesteInfo {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: string | null;
  tempoEstimado: number | null;
  ativo: boolean;
  disponibilidade: {
    id: string;
    disponivel: boolean;
    periodicidadeDias: number | null;
    ultimaLiberacao: string | null;
    proximaDisponibilidade: string | null;
  } | null;
  ultimoResultado: {
    id: string;
    pontuacaoTotal: number | null;
    dataRealizacao: string;
  } | null;
  foiConcluido: boolean;
}

interface GerenciamentoTestesColaboradorProps {
  colaboradorId: string;
  colaboradorNome: string;
}

export function GerenciamentoTestesColaborador({
  colaboradorId,
  colaboradorNome,
}: GerenciamentoTestesColaboradorProps) {
  const [testes, setTestes] = useState<TesteInfo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [showPeriodicidadeModal, setShowPeriodicidadeModal] = useState(false);
  const [testeAtual, setTesteAtual] = useState<TesteInfo | null>(null);
  const [periodicidade, setPeriodicidade] = useState<number | null>(null);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    carregarTestes();
  }, [colaboradorId]);

  const carregarTestes = async () => {
    try {
      setCarregando(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        `/api/teste-disponibilidade/empresa/colaborador/${colaboradorId}/testes`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar testes');
      }

      const data = await response.json();
      setTestes(data.testes || []);
    } catch (error) {
      console.error('Erro ao carregar testes:', error);
      toast.error('Erro ao carregar testes');
    } finally {
      setCarregando(false);
    }
  };

  const liberarTeste = async (testeId: string) => {
    try {
      setProcessando(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        `/api/teste-disponibilidade/empresa/colaborador/${colaboradorId}/teste/${testeId}/liberar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao liberar teste');
      }

      toast.success('Teste liberado com sucesso');
      await carregarTestes();
    } catch (error) {
      console.error('Erro ao liberar teste:', error);
      toast.error('Erro ao liberar teste');
    } finally {
      setProcessando(false);
    }
  };

  const configurarPeriodicidade = async () => {
    if (!testeAtual) return;

    try {
      setProcessando(true);
      const token = localStorage.getItem('authToken');

      const response = await fetch(
        `/api/teste-disponibilidade/empresa/colaborador/${colaboradorId}/teste/${testeAtual.id}/periodicidade`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            periodicidadeDias: periodicidade,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao configurar periodicidade');
      }

      toast.success('Periodicidade configurada com sucesso');
      setShowPeriodicidadeModal(false);
      setTesteAtual(null);
      setPeriodicidade(null);
      await carregarTestes();
    } catch (error) {
      console.error('Erro ao configurar periodicidade:', error);
      toast.error('Erro ao configurar periodicidade');
    } finally {
      setProcessando(false);
    }
  };

  const abrirModalPeriodicidade = (teste: TesteInfo) => {
    setTesteAtual(teste);
    setPeriodicidade(teste.disponibilidade?.periodicidadeDias || null);
    setShowPeriodicidadeModal(true);
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando testes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Gerenciar Testes - {colaboradorNome}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure a disponibilidade e periodicidade dos testes para este colaborador
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testes.map((teste) => (
          <Card
            key={teste.id}
            className={`${
              teste.disponibilidade?.disponivel === false
                ? 'bg-gray-50 dark:bg-gray-800/50'
                : 'bg-white dark:bg-gray-800'
            } border border-gray-200 dark:border-gray-700`}
            data-testid={`card-teste-${teste.id}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base font-semibold flex-1">
                  {teste.nome}
                </CardTitle>
                {teste.foiConcluido && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Concluído
                  </Badge>
                )}
              </div>
              {teste.categoria && (
                <Badge variant="secondary" className="w-fit text-xs">
                  {teste.categoria}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Status do Teste */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {teste.disponibilidade?.disponivel ? (
                    <>
                      <Unlock className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium" data-testid={`status-${teste.id}`}>
                        Disponível
                      </span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600 font-medium" data-testid={`status-${teste.id}`}>
                        Indisponível
                      </span>
                    </>
                  )}
                </div>

                {/* Informações adicionais */}
                {teste.ultimoResultado && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>
                      Último teste:{' '}
                      {format(new Date(teste.ultimoResultado.dataRealizacao), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                )}

                {teste.disponibilidade?.periodicidadeDias && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span>Periodicidade: {teste.disponibilidade.periodicidadeDias} dias</span>
                  </div>
                )}

                {teste.disponibilidade?.proximaDisponibilidade && (
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>
                      Próxima disponibilidade:{' '}
                      {format(
                        new Date(teste.disponibilidade.proximaDisponibilidade),
                        "dd/MM/yyyy",
                        { locale: ptBR }
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => liberarTeste(teste.id)}
                  disabled={processando || teste.disponibilidade?.disponivel}
                  className="w-full"
                  data-testid={`button-liberar-${teste.id}`}
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Liberar Novamente
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => abrirModalPeriodicidade(teste)}
                  disabled={processando}
                  className="w-full"
                  data-testid={`button-periodicidade-${teste.id}`}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Configurar Periodicidade
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Periodicidade */}
      <Dialog open={showPeriodicidadeModal} onOpenChange={setShowPeriodicidadeModal}>
        <DialogContent data-testid="modal-periodicidade">
          <DialogHeader>
            <DialogTitle>Configurar Periodicidade</DialogTitle>
            <DialogDescription>
              Defina o intervalo de tempo (em dias) para que o teste "{testeAtual?.nome}" fique
              disponível novamente após a conclusão.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="periodicidade" className="text-sm font-medium">
              Periodicidade (dias)
            </Label>
            <Input
              id="periodicidade"
              type="number"
              min="1"
              value={periodicidade || ''}
              onChange={(e) => setPeriodicidade(e.target.value ? Number(e.target.value) : null)}
              placeholder="Ex: 30, 90, 180..."
              className="mt-2"
              data-testid="input-periodicidade"
            />
            <p className="text-xs text-gray-500 mt-2">
              Deixe vazio para desabilitar a liberação automática
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPeriodicidadeModal(false);
                setTesteAtual(null);
                setPeriodicidade(null);
              }}
              disabled={processando}
              data-testid="button-cancelar"
            >
              Cancelar
            </Button>
            <Button
              onClick={configurarPeriodicidade}
              disabled={processando}
              data-testid="button-salvar"
            >
              {processando ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
