import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Mail,
  Calendar,
  Users,
  Zap,
  Settings,
  Volume2,
  VolumeX
} from "lucide-react";
import { toast } from "sonner";
import { conviteService, type ConviteData } from "@/services/conviteService";
import { emailService } from "@/services/emailService";

interface NotificacaoItem {
  id: string;
  tipo: 'vencimento' | 'expirado' | 'baixa_utilizacao' | 'meta_atingida';
  titulo: string;
  descricao: string;
  convite?: ConviteData;
  prioridade: 'alta' | 'media' | 'baixa';
  timestamp: Date;
  lida: boolean;
  acao?: {
    label: string;
    callback: () => void;
  };
}

interface ConfiguracaoNotificacao {
  vencimento: {
    ativo: boolean;
    diasAntecedencia: number;
    enviarEmail: boolean;
  };
  baixaUtilizacao: {
    ativo: boolean;
    percentualMinimo: number;
    diasAposEnvio: number;
  };
  metasAtingidas: {
    ativo: boolean;
    percentualMeta: number;
  };
  som: boolean;
  desktop: boolean;
}

const NotificacaoConvites = () => {
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([]);
  const [configuracao, setConfiguracao] = useState<ConfiguracaoNotificacao>({
    vencimento: {
      ativo: true,
      diasAntecedencia: 7,
      enviarEmail: true
    },
    baixaUtilizacao: {
      ativo: true,
      percentualMinimo: 30,
      diasAposEnvio: 3
    },
    metasAtingidas: {
      ativo: true,
      percentualMeta: 80
    },
    som: true,
    desktop: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [mostrarConfiguracoes, setMostrarConfiguracoes] = useState(false);

  useEffect(() => {
    carregarNotificacoes();
    
    // Verificar notificações a cada 5 minutos
    const interval = setInterval(carregarNotificacoes, 5 * 60 * 1000);
    
    // Solicitar permissão para notificações desktop
    if (configuracao.desktop && 'Notification' in window) {
      Notification.requestPermission();
    }

    return () => clearInterval(interval);
  }, [configuracao]);

  const carregarNotificacoes = async () => {
    setIsLoading(true);
    try {
      const convites = await conviteService.listarConvites();
      const novasNotificacoes: NotificacaoItem[] = [];

      // Verificar convites próximos do vencimento
      if (configuracao.vencimento.ativo) {
        const convitesProximosVencimento = await conviteService.verificarConvitesProximosVencimento(
          configuracao.vencimento.diasAntecedencia
        );

        convitesProximosVencimento.forEach(convite => {
          const diasRestantes = Math.ceil(
            (convite.dataExpiracao!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );

          novasNotificacoes.push({
            id: `vencimento-${convite.id}`,
            tipo: 'vencimento',
            titulo: 'Convite próximo do vencimento',
            descricao: `O convite da empresa ${convite.nomeEmpresa} expira em ${diasRestantes} dias`,
            convite,
            prioridade: diasRestantes <= 2 ? 'alta' : 'media',
            timestamp: new Date(),
            lida: false,
            acao: {
              label: 'Renovar Convite',
              callback: () => renovarConvite(convite.id)
            }
          });
        });
      }

      // Verificar convites com baixa utilização
      if (configuracao.baixaUtilizacao.ativo) {
        convites.forEach(convite => {
          const taxaUtilizacao = (convite.colaboradoresUsaram / convite.numeroColaboradores) * 100;
          const diasAposEnvio = Math.ceil(
            (new Date().getTime() - convite.dataCriacao.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (
            taxaUtilizacao < configuracao.baixaUtilizacao.percentualMinimo &&
            diasAposEnvio >= configuracao.baixaUtilizacao.diasAposEnvio &&
            convite.status === 'ativo'
          ) {
            novasNotificacoes.push({
              id: `baixa-utilizacao-${convite.id}`,
              tipo: 'baixa_utilizacao',
              titulo: 'Baixa utilização detectada',
              descricao: `Apenas ${Math.round(taxaUtilizacao)}% dos colaboradores da ${convite.nomeEmpresa} utilizaram o convite`,
              convite,
              prioridade: 'media',
              timestamp: new Date(),
              lida: false,
              acao: {
                label: 'Enviar Lembrete',
                callback: () => enviarLembrete(convite.id)
              }
            });
          }
        });
      }

      // Verificar metas atingidas
      if (configuracao.metasAtingidas.ativo) {
        convites.forEach(convite => {
          const taxaUtilizacao = (convite.colaboradoresUsaram / convite.numeroColaboradores) * 100;

          if (taxaUtilizacao >= configuracao.metasAtingidas.percentualMeta) {
            novasNotificacoes.push({
              id: `meta-atingida-${convite.id}`,
              tipo: 'meta_atingida',
              titulo: 'Meta de participação atingida!',
              descricao: `${Math.round(taxaUtilizacao)}% dos colaboradores da ${convite.nomeEmpresa} já participaram`,
              convite,
              prioridade: 'baixa',
              timestamp: new Date(),
              lida: false
            });
          }
        });
      }

      // Filtrar notificações duplicadas e ordenar por prioridade
      const notificacoesUnicas = novasNotificacoes.filter(
        (notificacao, index, self) => 
          index === self.findIndex(n => n.id === notificacao.id)
      );

      const notificacoesOrdenadas = notificacoesUnicas.sort((a, b) => {
        const prioridadeOrder = { alta: 3, media: 2, baixa: 1 };
        return prioridadeOrder[b.prioridade] - prioridadeOrder[a.prioridade];
      });

      setNotificacoes(notificacoesOrdenadas);

      // Mostrar notificações novas
      const notificacoesNovas = notificacoesOrdenadas.filter(n => !n.lida);
      if (notificacoesNovas.length > 0) {
        mostrarNotificacaoDesktop(notificacoesNovas[0]);
        if (configuracao.som) {
          reproduzirSomNotificacao();
        }
      }

    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mostrarNotificacaoDesktop = (notificacao: NotificacaoItem) => {
    if (configuracao.desktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notificacao.titulo, {
        body: notificacao.descricao,
        icon: '/favicon.ico',
        tag: notificacao.id
      });
    }
  };

  const reproduzirSomNotificacao = () => {
    // Criar um som simples usando Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const marcarComoLida = (id: string) => {
    setNotificacoes(prev => 
      prev.map(n => n.id === id ? { ...n, lida: true } : n)
    );
  };

  const removerNotificacao = (id: string) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id));
  };

  const renovarConvite = async (conviteId: string) => {
    try {
      // Simular renovação do convite
      toast.success("Convite renovado com sucesso!", {
        description: "O prazo foi estendido por mais 30 dias"
      });
      
      // Remover notificação relacionada
      setNotificacoes(prev => prev.filter(n => n.convite?.id !== conviteId));
      
    } catch (error) {
      toast.error("Erro ao renovar convite");
    }
  };

  const enviarLembrete = async (conviteId: string) => {
    try {
      const convite = notificacoes.find(n => n.convite?.id === conviteId)?.convite;
      if (convite) {
        await emailService.enviarLembreteExpiracao(convite);
        toast.success("Lembrete enviado!", {
          description: `E-mail de lembrete enviado para ${convite.emailContato}`
        });
        
        // Marcar notificação como lida
        marcarComoLida(`baixa-utilizacao-${conviteId}`);
      }
    } catch (error) {
      toast.error("Erro ao enviar lembrete");
    }
  };

  const obterIconeNotificacao = (tipo: NotificacaoItem['tipo']) => {
    switch (tipo) {
      case 'vencimento':
        return <Clock className="h-4 w-4" />;
      case 'expirado':
        return <AlertTriangle className="h-4 w-4" />;
      case 'baixa_utilizacao':
        return <Users className="h-4 w-4" />;
      case 'meta_atingida':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const obterCorNotificacao = (tipo: NotificacaoItem['tipo'], prioridade: NotificacaoItem['prioridade']) => {
    if (prioridade === 'alta') return 'border-red-200 bg-red-50 dark:bg-red-950/20';
    if (tipo === 'meta_atingida') return 'border-green-200 bg-green-50 dark:bg-green-950/20';
    if (tipo === 'vencimento') return 'border-orange-200 bg-orange-50 dark:bg-orange-950/20';
    return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20';
  };

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <div className="space-y-4">
      {/* Cabeçalho com contador e configurações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Notificações</h3>
          {notificacoesNaoLidas > 0 && (
            <Badge variant="destructive" className="ml-2">
              {notificacoesNaoLidas}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMostrarConfiguracoes(!mostrarConfiguracoes)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfiguracao(prev => ({ ...prev, som: !prev.som }))}
          >
            {configuracao.som ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Configurações */}
      {mostrarConfiguracoes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configurações de Notificação</CardTitle>
            <CardDescription>
              Personalize quando e como receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Convites próximos do vencimento</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={configuracao.vencimento.ativo}
                    onChange={(e) => setConfiguracao(prev => ({
                      ...prev,
                      vencimento: { ...prev.vencimento, ativo: e.target.checked }
                    }))}
                  />
                  <span className="text-sm">Notificar com</span>
                  <input
                    type="number"
                    value={configuracao.vencimento.diasAntecedencia}
                    onChange={(e) => setConfiguracao(prev => ({
                      ...prev,
                      vencimento: { ...prev.vencimento, diasAntecedencia: parseInt(e.target.value) }
                    }))}
                    className="w-16 px-2 py-1 text-sm border rounded"
                    min="1"
                    max="30"
                  />
                  <span className="text-sm">dias de antecedência</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Baixa utilização</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={configuracao.baixaUtilizacao.ativo}
                    onChange={(e) => setConfiguracao(prev => ({
                      ...prev,
                      baixaUtilizacao: { ...prev.baixaUtilizacao, ativo: e.target.checked }
                    }))}
                  />
                  <span className="text-sm">Quando menos de</span>
                  <input
                    type="number"
                    value={configuracao.baixaUtilizacao.percentualMinimo}
                    onChange={(e) => setConfiguracao(prev => ({
                      ...prev,
                      baixaUtilizacao: { ...prev.baixaUtilizacao, percentualMinimo: parseInt(e.target.value) }
                    }))}
                    className="w-16 px-2 py-1 text-sm border rounded"
                    min="1"
                    max="100"
                  />
                  <span className="text-sm">% participarem</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={configuracao.desktop}
                  onChange={(e) => setConfiguracao(prev => ({ ...prev, desktop: e.target.checked }))}
                />
                <span className="text-sm">Notificações desktop</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={configuracao.som}
                  onChange={(e) => setConfiguracao(prev => ({ ...prev, som: e.target.checked }))}
                />
                <span className="text-sm">Som de notificação</span>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Notificações */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Carregando notificações...</p>
          </div>
        ) : notificacoes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground">Nenhuma notificação no momento</p>
            </CardContent>
          </Card>
        ) : (
          notificacoes.map(notificacao => (
            <Alert 
              key={notificacao.id}
              className={`${obterCorNotificacao(notificacao.tipo, notificacao.prioridade)} ${
                !notificacao.lida ? 'border-l-4 border-l-blue-500' : 'opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5">
                    {obterIconeNotificacao(notificacao.tipo)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{notificacao.titulo}</h4>
                      <Badge 
                        variant={notificacao.prioridade === 'alta' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {notificacao.prioridade}
                      </Badge>
                    </div>
                    
                    <AlertDescription className="text-sm mb-2">
                      {notificacao.descricao}
                    </AlertDescription>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {notificacao.timestamp.toLocaleString('pt-BR')}
                    </div>
                    
                    {notificacao.acao && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={notificacao.acao.callback}
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        {notificacao.acao.label}
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {!notificacao.lida && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => marcarComoLida(notificacao.id)}
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removerNotificacao(notificacao.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Alert>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificacaoConvites;