import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Calendar, Clock, CheckCircle, AlertTriangle, Copy, Send, Eye, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { hybridInvitationService } from '../../services/invitationServiceHybrid';
import { useAuth } from '../../hooks/AuthContext';
import { StatusConvite } from '../../lib/enums';

interface ConviteColaborador {
  id: string;
  token: string;
  email: string;
  nome: string;
  status: StatusConvite;
  validade: string;
  created_at: string;
}

const EmpresaGestaoConvites: React.FC = () => {
  const [convites, setConvites] = useState<ConviteColaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNovoConviteModal, setShowNovoConviteModal] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<'todos' | StatusConvite>('todos');
  const [novoConvite, setNovoConvite] = useState({
    email: '',
    nome: '',
    cargo: '',
    departamento: '',
    dias_expiracao: 7
  });
  const [enviandoConvite, setEnviandoConvite] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    carregarConvites();
  }, []);

  const carregarConvites = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando convites da empresa...');
      
      if (!user?.empresaId) {
        console.error('❌ ID da empresa não encontrado');
        toast.error('Erro ao carregar convites', {
          description: 'ID da empresa não encontrado'
        });
        return;
      }

      const response = await hybridInvitationService.listarConvites('colaborador', user.empresaId);
      console.log('✅ Convites carregados:', response);
      
      if (response.success && response.data) {
        setConvites(response.data as ConviteColaborador[]);
      } else {
        console.error('❌ Erro na resposta:', response.message);
        setConvites([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar convites:', error);
      toast.error('Erro ao carregar convites', {
        description: 'Tente novamente em alguns instantes'
      });
    } finally {
      setLoading(false);
    }
  };

  const criarConvite = async () => {
    try {
      setEnviandoConvite(true);
      console.log('🔄 Criando novo convite...', novoConvite);

      if (!user?.empresaId) {
        toast.error('Erro', { description: 'ID da empresa não encontrado' });
        return;
      }

      const response = await hybridInvitationService.criarConviteColaborador({
        empresa_id: user.empresaId,
        email: novoConvite.email,
        nome: novoConvite.nome,
        dias_expiracao: novoConvite.dias_expiracao
      });

      console.log('✅ Convite criado:', response);
      
      if (response.success) {
        toast.success('Convite criado com sucesso!', {
          description: `Convite enviado para ${novoConvite.nome}`
        });

        setNovoConvite({
          email: '',
          nome: '',
          cargo: '',
          departamento: '',
          dias_expiracao: 7
        });

        setShowNovoConviteModal(false);
        carregarConvites();
      } else {
        toast.error('Erro ao criar convite', {
          description: response.message
        });
      }

    } catch (error) {
      console.error('❌ Erro ao criar convite:', error);
      toast.error('Erro ao criar convite', {
        description: 'Tente novamente em alguns instantes'
      });
    } finally {
      setEnviandoConvite(false);
    }
  };

  const copiarLinkConvite = (token: string) => {
    const link = `${window.location.origin}/convite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado!', {
      description: 'Link do convite copiado para a área de transferência'
    });
  };

  const reenviarConvite = async (conviteId: string) => {
    try {
      toast.info('Funcionalidade em desenvolvimento', {
        description: 'O reenvio de convites será implementado em breve'
      });
    } catch (error) {
      console.error('❌ Erro ao reenviar convite:', error);
      toast.error('Erro ao reenviar convite', {
        description: 'Tente novamente em alguns instantes'
      });
    }
  };

  const excluirConvite = async (conviteToken: string) => {
    try {
      console.log('🗑️ Excluindo convite com token:', conviteToken);
      
      const response = await hybridInvitationService.cancelarConvite(conviteToken, 'colaborador');
      
      if (response.success) {
        toast.success('Convite excluído com sucesso', {
          description: 'O convite foi cancelado e não poderá mais ser usado'
        });
        
        await carregarConvites();
      } else {
        console.error('❌ Erro na resposta:', response.message);
        toast.error('Erro ao excluir convite', {
          description: response.message || 'Tente novamente em alguns instantes'
        });
      }
    } catch (error) {
      console.error('❌ Erro ao excluir convite:', error);
      toast.error('Erro ao excluir convite', {
        description: 'Tente novamente em alguns instantes'
      });
    }
  };

  const getStatusConvite = (convite: ConviteColaborador): StatusConvite => {
    // Verificar se foi cancelado primeiro
    if (convite.status === 'cancelado') return 'cancelado' as StatusConvite;
    if (convite.status === StatusConvite.ACEITO) return StatusConvite.ACEITO;
    if (new Date(convite.validade) < new Date()) return StatusConvite.EXPIRADO;
    return StatusConvite.PENDENTE;
  };

  const getStatusBadge = (status: StatusConvite) => {
    switch (status) {
      case StatusConvite.ACEITO:
        return <Badge variant="default" className="bg-green-100 text-green-800">Usado</Badge>;
      case StatusConvite.EXPIRADO:
        return <Badge variant="destructive">Expirado</Badge>;
      case 'cancelado' as StatusConvite:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Cancelado</Badge>;
      case StatusConvite.PENDENTE:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const convitesFiltrados = convites.filter(convite => {
    const matchesSearch = convite.nome.toLowerCase().includes(filtro.toLowerCase()) ||
                         convite.email.toLowerCase().includes(filtro.toLowerCase());
    
    const status = getStatusConvite(convite);
    const matchesStatus = statusFiltro === 'todos' || status === statusFiltro;
    
    return matchesSearch && matchesStatus;
  });

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando convites...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Convites</h1>
            <p className="text-gray-600">Gerencie convites para colaboradores</p>
          </div>
        </div>

        <Dialog open={showNovoConviteModal} onOpenChange={setShowNovoConviteModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Convite
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Convite</DialogTitle>
              <DialogDescription>
                Preencha os dados do colaborador para enviar um convite
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Colaborador *</Label>
                <Input
                  id="nome"
                  value={novoConvite.nome}
                  onChange={(e) => setNovoConvite(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Digite o nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={novoConvite.email}
                  onChange={(e) => setNovoConvite(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="colaborador@empresa.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={novoConvite.cargo}
                  onChange={(e) => setNovoConvite(prev => ({ ...prev, cargo: e.target.value }))}
                  placeholder="Ex: Analista, Gerente..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento</Label>
                <Input
                  id="departamento"
                  value={novoConvite.departamento}
                  onChange={(e) => setNovoConvite(prev => ({ ...prev, departamento: e.target.value }))}
                  placeholder="Ex: TI, RH, Vendas..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dias">Dias para Expiração</Label>
                <Select
                  value={novoConvite.dias_expiracao.toString()}
                  onValueChange={(value) => setNovoConvite(prev => ({ ...prev, dias_expiracao: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 dias</SelectItem>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowNovoConviteModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={criarConvite}
                  disabled={enviandoConvite || !novoConvite.nome || !novoConvite.email}
                >
                  {enviandoConvite ? 'Enviando...' : 'Criar Convite'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome ou email..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFiltro} onValueChange={(value: any) => setStatusFiltro(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value={StatusConvite.PENDENTE}>Pendentes</SelectItem>
                <SelectItem value={StatusConvite.ACEITO}>Usados</SelectItem>
                <SelectItem value={StatusConvite.EXPIRADO}>Expirados</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Convites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Convites Enviados ({convitesFiltrados.length})
          </CardTitle>
          <CardDescription>
            Acompanhe o status dos convites enviados aos colaboradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {convitesFiltrados.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {convites.length === 0 
                  ? 'Nenhum convite foi enviado ainda. Clique em "Novo Convite" para começar.'
                  : 'Nenhum convite encontrado com os filtros aplicados.'
                }
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {convitesFiltrados.map((convite) => (
                <div key={convite.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{convite.nome}</h3>
                        {getStatusBadge(getStatusConvite(convite))}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{convite.email}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Criado: {formatarData(convite.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expira: {formatarData(convite.validade)}
                        </span>
                        {getStatusConvite(convite) === StatusConvite.ACEITO && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Usado
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copiarLinkConvite(convite.token)}
                        title="Copiar link do convite"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {convite.status === StatusConvite.PENDENTE && getStatusConvite(convite) !== StatusConvite.EXPIRADO && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => reenviarConvite(convite.id)}
                          title="Reenviar convite"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => excluirConvite(convite.token)}
                        title="Excluir convite"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{convites.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold">
                  {convites.filter(c => getStatusConvite(c) === StatusConvite.PENDENTE).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Usados</p>
                <p className="text-2xl font-bold">
                  {convites.filter(c => getStatusConvite(c) === StatusConvite.ACEITO).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Expirados</p>
                <p className="text-2xl font-bold">
                  {convites.filter(c => getStatusConvite(c) === StatusConvite.EXPIRADO).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmpresaGestaoConvites;