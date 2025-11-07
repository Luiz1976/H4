import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Settings,
  Volume2,
  VolumeX,
  Monitor
} from "lucide-react";
import { toast } from "sonner";
import { conviteService } from "@/services/conviteService";

interface NotificacaoConfig {
  convitesVencendo: boolean;
  baixaUtilizacao: boolean;
  metasAlcancadas: boolean;
  somAtivado: boolean;
  notificacaoDesktop: boolean;
}

interface NotificacaoItem {
  id: string;
  tipo: 'vencimento' | 'baixa_utilizacao' | 'meta_alcancada';
  titulo: string;
  descricao: string;
  prioridade: 'alta' | 'media' | 'baixa';
  timestamp: Date;
  lida: boolean;
}

const NotificacaoConvites: React.FC = () => {
  const [notificacoes, setNotificacoes] = useState<NotificacaoItem[]>([]);
  const [configuracao, setConfiguracao] = useState<NotificacaoConfig>({
    convitesVencendo: true,
    baixaUtilizacao: true,
    metasAlcancadas: true,
    somAtivado: true,
    notificacaoDesktop: false
  });
  const [mostrarConfiguracoes, setMostrarConfiguracoes] = useState(false);

  useEffect(() => {
    verificarNotificacoes();
    const interval = setInterval(verificarNotificacoes, 60000); // Verifica a cada minuto
    return () => clearInterval(interval);
  }, [configuracao]);

  const verificarNotificacoes = async () => {
    try {
      const novasNotificacoes: NotificacaoItem[] = [];

      // Verificar convites vencendo
      if (configuracao.convitesVencendo) {
        const convitesVencendo = await conviteService.verificarConvitesProximosVencimento(3);
        convitesVencendo.forEach(convite => {
          novasNotificacoes.push({
            id: `vencimento-${convite.id}`,
            tipo: 'vencimento',
            titulo: 'Convite próximo do vencimento',
            descricao: `O convite para ${convite.nomeEmpresa} vence em breve`,
            prioridade: 'alta',
            timestamp: new Date(),
            lida: false
          });
        });
      }

      // Verificar baixa utilização
      if (configuracao.baixaUtilizacao) {
        const convites = await conviteService.listarConvites();
        const convitesBaixaUtilizacao = convites.filter(convite => {
          const utilizacao = (convite.colaboradoresUsaram / convite.numeroColaboradores) * 100;
          const diasAtivos = Math.floor((Date.now() - convite.dataCriacao.getTime()) / (1000 * 60 * 60 * 24));
          return utilizacao < 30 && diasAtivos > 3 && convite.status === 'ativo';
        });

        convitesBaixaUtilizacao.forEach(convite => {
          novasNotificacoes.push({
            id: `baixa-utilizacao-${convite.id}`,
            tipo: 'baixa_utilizacao',
            titulo: 'Baixa utilização detectada',
            descricao: `Apenas ${convite.colaboradoresUsaram} de ${convite.numeroColaboradores} colaboradores usaram o convite de ${convite.nomeEmpresa}`,
            prioridade: 'media',
            timestamp: new Date(),
            lida: false
          });
        });
      }

      // Verificar metas alcançadas
      if (configuracao.metasAlcancadas) {
        const convites = await conviteService.listarConvites();
        const convitesCompletos = convites.filter(convite => 
          convite.colaboradoresUsaram >= convite.numeroColaboradores && convite.status === 'ativo'
        );

        convitesCompletos.forEach(convite => {
          novasNotificacoes.push({
            id: `meta-alcancada-${convite.id}`,
            tipo: 'meta_alcancada',
            titulo: 'Meta de participação alcançada!',
            descricao: `Todos os ${convite.numeroColaboradores} colaboradores de ${convite.nomeEmpresa} completaram os testes`,
            prioridade: 'baixa',
            timestamp: new Date(),
            lida: false
          });
        });
      }

      // Filtrar notificações já existentes
      const notificacoesNovas = novasNotificacoes.filter(nova => 
        !notificacoes.some(existente => existente.id === nova.id)
      );

      if (notificacoesNovas.length > 0) {
        setNotificacoes(prev => [...notificacoesNovas, ...prev].slice(0, 20)); // Manter apenas as 20 mais recentes
        
        // Tocar som se configurado
        if (configuracao.somAtivado) {
          // Simular som de notificação
          console.log('🔔 Som de notificação');
        }

        // Mostrar notificação desktop se configurado
        if (configuracao.notificacaoDesktop && 'Notification' in window) {
          notificacoesNovas.forEach(notificacao => {
            new Notification(notificacao.titulo, {
              body: notificacao.descricao,
              icon: '/favicon.ico'
            });
          });
        }

        // Mostrar toast para notificações de alta prioridade
        notificacoesNovas
          .filter(n => n.prioridade === 'alta')
          .forEach(notificacao => {
            toast.warning(notificacao.titulo, {
              description: notificacao.descricao
            });
          });
      }
    } catch (error) {
      console.error('Erro ao verificar notificações:', error);
    }
  };

  const marcarComoLida = (id: string) => {
    setNotificacoes(prev => 
      prev.map(notificacao => 
        notificacao.id === id ? { ...notificacao, lida: true } : notificacao
      )
    );
  };

  const marcarTodasComoLidas = () => {
    setNotificacoes(prev => 
      prev.map(notificacao => ({ ...notificacao, lida: true }))
    );
  };

  const limparNotificacoes = () => {
    setNotificacoes([]);
  };

  const solicitarPermissaoDesktop = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setConfiguracao(prev => ({ ...prev, notificacaoDesktop: true }));
        toast.success('Permissão para notificações concedida!');
      }
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'vencimento': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'baixa_utilizacao': return <TrendingUp className="h-4 w-4 text-yellow-500" />;
      case 'meta_alcancada': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const notificacaoNaoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            <CardTitle>Notificações</CardTitle>
            {notificacaoNaoLidas > 0 && (
              <Badge variant="destructive" className="ml-2">
                {notificacaoNaoLidas}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrarConfiguracoes(!mostrarConfiguracoes)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            {notificacoes.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={marcarTodasComoLidas}
                >
                  Marcar todas como lidas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={limparNotificacoes}
                >
                  Limpar
                </Button>
              </>
            )}
          </div>
        </div>
        <CardDescription>
          Sistema de notificações para acompanhar o status dos convites
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {mostrarConfiguracoes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações de Notificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="convites-vencendo">Convites próximos do vencimento</Label>
                <Switch
                  id="convites-vencendo"
                  checked={configuracao.convitesVencendo}
                  onCheckedChange={(checked) => 
                    setConfiguracao(prev => ({ ...prev, convitesVencendo: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="baixa-utilizacao">Baixa utilização de convites</Label>
                <Switch
                  id="baixa-utilizacao"
                  checked={configuracao.baixaUtilizacao}
                  onCheckedChange={(checked) => 
                    setConfiguracao(prev => ({ ...prev, baixaUtilizacao: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="metas-alcancadas">Metas de participação alcançadas</Label>
                <Switch
                  id="metas-alcancadas"
                  checked={configuracao.metasAlcancadas}
                  onCheckedChange={(checked) => 
                    setConfiguracao(prev => ({ ...prev, metasAlcancadas: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="som-ativado" className="flex items-center gap-2">
                  {configuracao.somAtivado ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  Som de notificação
                </Label>
                <Switch
                  id="som-ativado"
                  checked={configuracao.somAtivado}
                  onCheckedChange={(checked) => 
                    setConfiguracao(prev => ({ ...prev, somAtivado: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="notificacao-desktop" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Notificações do sistema
                </Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="notificacao-desktop"
                    checked={configuracao.notificacaoDesktop}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        solicitarPermissaoDesktop();
                      } else {
                        setConfiguracao(prev => ({ ...prev, notificacaoDesktop: false }));
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {notificacoes.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhuma notificação no momento. Tudo está funcionando perfeitamente!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notificacoes.map((notificacao) => (
              <Card 
                key={notificacao.id} 
                className={`cursor-pointer transition-colors ${
                  notificacao.lida ? 'opacity-60' : 'border-l-4 border-l-blue-500'
                }`}
                onClick={() => marcarComoLida(notificacao.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getTipoIcon(notificacao.tipo)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{notificacao.titulo}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPrioridadeColor(notificacao.prioridade)}`}
                          >
                            {notificacao.prioridade}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{notificacao.descricao}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notificacao.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!notificacao.lida && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificacaoConvites;