import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Calendar, 
  Clock, 
  Copy, 
  X, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Plus,
  Building2,
  Send,
  Trash2,
  Eye,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Users,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { apiService } from '@/services/apiService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConviteEmpresa {
  id: string;
  emailContato?: string;
  nomeEmpresa?: string;
  email?: string;
  nome?: string;
  token: string;
  validade: string;
  status: string;
  linkConvite?: string;
  cargo?: string;
  departamento?: string;
  dataCriacao?: string;
}

interface NovoConvite {
  nomeEmpresa: string;
  emailContato: string;
  cnpj: string;
  numeroColaboradores: number;
  diasExpiracao: number;
}

export default function AdminConvites() {
  const [convites, setConvites] = useState<ConviteEmpresa[]>([]);
  const [filtroConvites, setFiltroConvites] = useState('');
  const [statusFiltroConvites, setStatusFiltroConvites] = useState<'todos' | 'pendente' | 'usado' | 'expirado'>('todos');
  const [showNovoConviteModal, setShowNovoConviteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [novoConvite, setNovoConvite] = useState<NovoConvite>({
    nomeEmpresa: '',
    emailContato: '',
    cnpj: '',
    numeroColaboradores: 50,
    diasExpiracao: 30
  });
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  useEffect(() => {
    carregarConvites();
  }, []);

  const carregarConvites = async () => {
    try {
      setLoading(true);
      
      // Buscar token de autenticação
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('Token de autenticação não encontrado');
        setConvites([]);
        setLoading(false);
        return;
      }
      
      // Buscar dados reais do banco de dados via API
      const response = await fetch('/api/convites/listar?tipo=empresa', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('📥 Resposta da API de convites:', data);

      if (data.success && data.convites) {
        // Mapear os dados do banco para o formato esperado pelo componente
        const convitesFormatados = data.convites.map((convite: any) => ({
          id: convite.id,
          token: convite.token,
          nomeEmpresa: convite.nome_empresa || convite.nomeEmpresa,
          emailContato: convite.email_contato || convite.emailContato,
          validade: convite.validade,
          status: convite.status,
          dataCriacao: convite.created_at || convite.dataCriacao
        }));
        
        console.log('✅ Convites formatados:', convitesFormatados);
        setConvites(convitesFormatados);
      } else {
        console.log('⚠️ Nenhum convite encontrado ou erro na resposta');
        setConvites([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar convites:', error);
      toast.error('Erro ao carregar convites do banco de dados');
      setConvites([]);
    } finally {
      setLoading(false);
    }
  };

  const criarConvite = async () => {
    if (!novoConvite.nomeEmpresa || !novoConvite.emailContato || !novoConvite.cnpj || !novoConvite.numeroColaboradores) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setLoading(true);
      const user = authService.getCurrentUser();
      
      const response = await fetch('/api/invitations/empresa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome_empresa: novoConvite.nomeEmpresa,
          email_contato: novoConvite.emailContato,
          cnpj: novoConvite.cnpj,
          numero_colaboradores: novoConvite.numeroColaboradores,
          dias_expiracao: novoConvite.diasExpiracao,
          admin_id: user?.id
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Convite criado com sucesso!', {
          description: `Enviado para ${novoConvite.emailContato}`
        });
        setShowNovoConviteModal(false);
        setNovoConvite({
          nomeEmpresa: '',
          emailContato: '',
          cnpj: '',
          numeroColaboradores: 50,
          diasExpiracao: 30
        });
        carregarConvites();
      } else {
        toast.error(data.message || 'Erro ao criar convite');
      }
    } catch (error) {
      console.error('Erro ao criar convite:', error);
      toast.error('Erro ao criar convite');
    } finally {
      setLoading(false);
    }
  };

  const cancelarConvite = async (token: string) => {
    try {
      const response = await fetch(`/api/invitations/empresa/${token}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Convite cancelado com sucesso');
        carregarConvites();
      } else {
        toast.error(data.message || 'Erro ao cancelar convite');
      }
    } catch (error) {
      console.error('Erro ao cancelar convite:', error);
      toast.error('Erro ao cancelar convite');
    }
  };

  const copiarUrlConvite = (token: string) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/aceitar-convite/${token}?tipo=empresa`;
    navigator.clipboard.writeText(url);
    toast.success('URL copiada!', {
      description: 'O link do convite foi copiado para a área de transferência'
    });
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatarDataCompleta = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isConviteExpirado = (dataExpiracao: string) => {
    return new Date(dataExpiracao) < new Date();
  };

  const getStatusConvite = (convite: ConviteEmpresa) => {
    // 'aceito' é o status do banco de dados, mapeamos para 'usado'
    if (convite.status === 'usado' || convite.status === 'aceito') return 'usado';
    if (isConviteExpirado(convite.validade)) return 'expirado';
    return 'pendente';
  };

  const getDiasRestantes = (dataExpiracao: string) => {
    const diff = new Date(dataExpiracao).getTime() - new Date().getTime();
    const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 0;
  };

  const convitesFiltrados = convites.filter(convite => {
    const nomeEmpresa = convite.nomeEmpresa || convite.nome || '';
    const emailContato = convite.emailContato || convite.email || '';
    const matchesSearch = nomeEmpresa.toLowerCase().includes(filtroConvites.toLowerCase()) ||
                         emailContato.toLowerCase().includes(filtroConvites.toLowerCase());
    
    const status = getStatusConvite(convite);
    const matchesStatus = statusFiltroConvites === 'todos' || status === statusFiltroConvites;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (convite: ConviteEmpresa) => {
    const status = getStatusConvite(convite);
    
    switch (status) {
      case 'usado':
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aceito
          </span>
        );
      case 'expirado':
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Expirado
          </span>
        );
      default:
        const dias = getDiasRestantes(convite.validade);
        return (
          <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
            dias <= 3 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
          }`}>
            <Clock className="w-3 h-3 mr-1" />
            {dias} dias restantes
          </span>
        );
    }
  };

  const totalConvites = convites.length;
  const pendentes = convites.filter(c => getStatusConvite(c) === 'pendente').length;
  const usados = convites.filter(c => getStatusConvite(c) === 'usado').length;
  const expirados = convites.filter(c => getStatusConvite(c) === 'expirado').length;
  const taxaConversao = totalConvites > 0 ? ((usados / totalConvites) * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      {/* Header com Ação */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Mail className="w-8 h-8 mr-3 text-blue-600" />
              Gestão de Convites
            </h1>
            <p className="text-gray-600">Crie e gerencie convites para novas empresas</p>
          </div>
          <Button
            onClick={() => setShowNovoConviteModal(true)}
            className="mt-4 md:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            data-testid="button-novo-convite"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Convite
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalConvites}</p>
            <p className="text-sm text-gray-500 mt-1">Total de Convites</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{pendentes}</p>
            <p className="text-sm text-gray-500 mt-1">Aguardando</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{usados}</p>
            <p className="text-sm text-gray-500 mt-1">Aceitos</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{expirados}</p>
            <p className="text-sm text-gray-500 mt-1">Expirados</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg p-5 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <p className="text-2xl font-bold">{taxaConversao}%</p>
            <p className="text-sm opacity-90 mt-1">Taxa de Conversão</p>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por empresa ou email..."
                  value={filtroConvites}
                  onChange={(e) => setFiltroConvites(e.target.value)}
                  className="pl-11 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  data-testid="input-busca-convites"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statusFiltroConvites}
                  onChange={(e) => setStatusFiltroConvites(e.target.value as any)}
                  className="bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700"
                  data-testid="select-filtro-status"
                >
                  <option value="todos">Todos</option>
                  <option value="pendente">Aguardando</option>
                  <option value="usado">Aceitos</option>
                  <option value="expirado">Expirados</option>
                </select>
              </div>
              
              <button
                onClick={carregarConvites}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Atualizar"
                data-testid="button-atualizar"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Grid de Cards de Convites */}
        {loading && convites.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Carregando convites...</p>
          </div>
        ) : convitesFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Mail className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum convite encontrado</h3>
            <p className="text-gray-500 mb-6">
              {filtroConvites || statusFiltroConvites !== 'todos' 
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece criando seu primeiro convite para uma empresa.'}
            </p>
            {!filtroConvites && statusFiltroConvites === 'todos' && (
              <Button
                onClick={() => setShowNovoConviteModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Convite
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {convitesFiltrados.map((convite) => {
              const status = getStatusConvite(convite);
              const diasRestantes = getDiasRestantes(convite.validade);
              
              return (
                <div
                  key={convite.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 group"
                  data-testid={`card-convite-${convite.id}`}
                >
                  {/* Header do Card */}
                  <div className={`p-4 ${
                    status === 'usado' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                    status === 'expirado' ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                    diasRestantes <= 3 ? 'bg-gradient-to-r from-orange-500 to-amber-600' :
                    'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">
                            {convite.nomeEmpresa || convite.nome || 'N/A'}
                          </h3>
                          <p className="text-xs text-white/80 mt-0.5">
                            {convite.emailContato || convite.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(convite)}
                    </div>
                  </div>

                  {/* Corpo do Card */}
                  <div className="p-5">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-xs">Criado em:</span>
                        <span className="ml-auto font-medium text-gray-900">
                          {formatarData(convite.dataCriacao || convite.validade)}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-xs">Expira em:</span>
                        <span className={`ml-auto font-medium ${
                          status === 'expirado' ? 'text-red-600' :
                          diasRestantes <= 3 ? 'text-orange-600' :
                          'text-gray-900'
                        }`}>
                          {formatarData(convite.validade)}
                        </span>
                      </div>

                      {status === 'pendente' && (
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Token:</span>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                              {convite.token.substring(0, 12)}...
                            </code>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    {status === 'pendente' && (
                      <div className="flex gap-2 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => copiarUrlConvite(convite.token)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium"
                          data-testid={`button-copiar-${convite.id}`}
                        >
                          <Copy className="w-4 h-4" />
                          Copiar Link
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Deseja realmente cancelar este convite?')) {
                              cancelarConvite(convite.token);
                            }
                          }}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                          title="Cancelar convite"
                          data-testid={`button-cancelar-${convite.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {status === 'usado' && (
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Convite aceito pela empresa
                        </div>
                      </div>
                    )}

                    {status === 'expirado' && (
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-center gap-2 text-red-600 text-sm font-medium">
                          <AlertCircle className="w-4 h-4" />
                          Convite expirado
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Novo Convite */}
      <Dialog open={showNovoConviteModal} onOpenChange={setShowNovoConviteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Criar Novo Convite
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da empresa para gerar um convite de acesso
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nomeEmpresa" className="text-sm font-medium">
                Nome da Empresa *
              </Label>
              <Input
                id="nomeEmpresa"
                placeholder="Ex: Tech Solutions Ltda"
                value={novoConvite.nomeEmpresa}
                onChange={(e) => setNovoConvite({ ...novoConvite, nomeEmpresa: e.target.value })}
                className="w-full"
                data-testid="input-nome-empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailContato" className="text-sm font-medium">
                Email de Contato *
              </Label>
              <Input
                id="emailContato"
                type="email"
                placeholder="contato@empresa.com"
                value={novoConvite.emailContato}
                onChange={(e) => setNovoConvite({ ...novoConvite, emailContato: e.target.value })}
                className="w-full"
                data-testid="input-email-contato"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj" className="text-sm font-medium">
                CNPJ *
              </Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={novoConvite.cnpj}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  const formatted = value
                    .replace(/^(\d{2})(\d)/, '$1.$2')
                    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                    .replace(/\.(\d{3})(\d)/, '.$1/$2')
                    .replace(/(\d{4})(\d)/, '$1-$2')
                    .slice(0, 18);
                  setNovoConvite({ ...novoConvite, cnpj: formatted });
                }}
                maxLength={18}
                className="w-full"
                data-testid="input-cnpj"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroColaboradores" className="text-sm font-medium">
                Número de Colaboradores *
              </Label>
              <Input
                id="numeroColaboradores"
                type="number"
                min="1"
                placeholder="50"
                value={novoConvite.numeroColaboradores}
                onChange={(e) => setNovoConvite({ ...novoConvite, numeroColaboradores: Number(e.target.value) })}
                className="w-full"
                data-testid="input-numero-colaboradores"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diasExpiracao" className="text-sm font-medium">
                Tempo de Acesso ao Sistema (dias) *
              </Label>
              <select
                id="diasExpiracao"
                value={novoConvite.diasExpiracao}
                onChange={(e) => setNovoConvite({ ...novoConvite, diasExpiracao: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid="select-dias-expiracao"
              >
                <option value={7}>7 dias</option>
                <option value={15}>15 dias</option>
                <option value={30}>30 dias</option>
                <option value={60}>60 dias</option>
                <option value={90}>90 dias</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Como funciona?</p>
                  <p className="text-blue-700">
                    Ao criar o convite, será gerado um link único que você poderá enviar para a empresa. 
                    Após aceitar o convite, a empresa terá acesso ao sistema pelo período definido.
                    <strong className="block mt-2">Ao término do período de acesso, a empresa e seus colaboradores serão bloqueados automaticamente.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowNovoConviteModal(false)}
              className="flex-1"
              disabled={loading}
              data-testid="button-cancelar-modal"
            >
              Cancelar
            </Button>
            <Button
              onClick={criarConvite}
              disabled={loading || !novoConvite.nomeEmpresa || !novoConvite.emailContato || !novoConvite.cnpj || !novoConvite.numeroColaboradores}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              data-testid="button-criar-convite"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Criar Convite
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
