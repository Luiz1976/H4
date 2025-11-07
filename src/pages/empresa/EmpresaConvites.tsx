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
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { hybridInvitationService } from '@/services/invitationServiceHybrid';

interface ConviteColaborador {
  id: string;
  token: string;
  email: string;
  nome: string;
  status: string;
  validade: string;
  created_at: string;
}

export default function EmpresaConvites() {
  const [convites, setConvites] = useState<ConviteColaborador[]>([]);
  const [filtroConvites, setFiltroConvites] = useState('');
  const [statusConviteFiltro, setStatusConviteFiltro] = useState<'todos' | 'pendente' | 'usado' | 'expirado'>('todos');
  const [showConviteModal, setShowConviteModal] = useState(false);
  const [novoConvite, setNovoConvite] = useState({
    email: '',
    nome: '',
    cargo: '',
    departamento: '',
    dias_expiracao: 7
  });

  useEffect(() => {
    carregarConvites();
  }, []);

  const carregarConvites = async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user?.empresaId) return;

      const response = await hybridInvitationService.listarConvites('colaborador', user.empresaId);
      
      if (response.success && response.data) {
        setConvites(response.data);
      } else {
        toast.error(response.message || 'Erro ao carregar convites');
      }
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
      toast.error('Erro ao carregar convites');
    }
  };

  const criarConviteColaborador = async () => {
    try {
      if (!novoConvite.email || !novoConvite.nome) {
        toast.error('Email e nome são obrigatórios');
        return;
      }

      const user = authService.getCurrentUser();
      if (!user?.empresaId) return;

      const response = await hybridInvitationService.criarConviteColaborador({
        email: novoConvite.email,
        nome: novoConvite.nome,
        empresa_id: user.empresaId,
        dias_expiracao: novoConvite.dias_expiracao
      });

      if (response.success) {
        toast.success('Convite criado com sucesso!');
        
        // Gerar URL do convite
        const urlConvite = hybridInvitationService.gerarUrlConvite(response.token!, 'colaborador');
        
        // Copiar para clipboard
        navigator.clipboard.writeText(urlConvite);
        toast.info('URL do convite copiada para a área de transferência');
        
        setShowConviteModal(false);
        setNovoConvite({ email: '', nome: '', cargo: '', departamento: '', dias_expiracao: 7 });
        carregarConvites();
      } else {
        toast.error(response.message || 'Erro ao criar convite');
      }
    } catch (error) {
      console.error('Erro ao criar convite:', error);
      toast.error('Erro ao criar convite');
    }
  };

  const cancelarConvite = async (token: string) => {
    try {
      const response = await hybridInvitationService.cancelarConvite(token, 'colaborador');
      
      if (response.success) {
        toast.success('Convite cancelado com sucesso');
        carregarConvites();
      } else {
        toast.error(response.message || 'Erro ao cancelar convite');
      }
    } catch (error) {
      console.error('Erro ao cancelar convite:', error);
      toast.error('Erro ao cancelar convite');
    }
  };

  const copiarUrlConvite = (token: string) => {
    const url = hybridInvitationService.gerarUrlConvite(token, 'colaborador');
    navigator.clipboard.writeText(url);
    toast.success('URL copiada para a área de transferência');
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

  const getStatusConvite = (convite: ConviteColaborador) => {
    // Tratar 'aceito' como equivalente a 'usado' para refletir o status do banco
    if (convite.status === 'usado' || convite.status === 'aceito') return 'usado';
    if (new Date(convite.validade) < new Date()) return 'expirado';
    return 'pendente';
  };

  const convitesFiltrados = convites.filter(convite => {
    const matchesSearch = convite.nome.toLowerCase().includes(filtroConvites.toLowerCase()) ||
                         convite.email.toLowerCase().includes(filtroConvites.toLowerCase());
    
    const status = getStatusConvite(convite);
    const matchesStatus = statusConviteFiltro === 'todos' || status === statusConviteFiltro;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (convite: ConviteColaborador) => {
    const status = getStatusConvite(convite);
    
    switch (status) {
      case 'usado':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Usado
          </span>
        );
      case 'expirado':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Expirado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </span>
        );
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Convites</h1>
          <p className="text-gray-600">Gerencie os convites enviados para colaboradores</p>
        </div>
        <button
          onClick={() => setShowConviteModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Convite</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar convites..."
                value={filtroConvites}
                onChange={(e) => setFiltroConvites(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusConviteFiltro}
              onChange={(e) => setStatusConviteFiltro(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os status</option>
              <option value="pendente">Pendentes</option>
              <option value="usado">Usados</option>
              <option value="expirado">Expirados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Convites */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Colaborador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expira em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {convitesFiltrados.map((convite) => (
                <tr key={convite.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {convite.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {convite.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{convite.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(convite)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                      {formatarData(convite.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-1" />
                      {formatarData(convite.validade)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {getStatusConvite(convite) === 'pendente' && (
                        <>
                          <button
                            onClick={() => copiarUrlConvite(convite.token)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Copiar URL do convite"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => cancelarConvite(convite.token)}
                            className="text-red-600 hover:text-red-900"
                            title="Cancelar convite"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {convitesFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum convite encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filtroConvites || statusConviteFiltro !== 'todos' 
                ? 'Tente ajustar os filtros de busca.' 
                : 'Nenhum convite foi enviado ainda.'}
            </p>
          </div>
        )}
      </div>

      {/* Resumo */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Mail className="h-8 w-8 text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-lg font-semibold text-gray-900">{convites.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pendentes</p>
              <p className="text-lg font-semibold text-gray-900">
                {convites.filter(c => getStatusConvite(c) === 'pendente').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Usados</p>
              <p className="text-lg font-semibold text-gray-900">
                {convites.filter(c => c.status === 'usado').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Expirados</p>
              <p className="text-lg font-semibold text-gray-900">
                {convites.filter(c => getStatusConvite(c) === 'expirado').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Convite */}
      {showConviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Convidar Novo Colaborador</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Colaborador
                </label>
                <input
                  type="text"
                  value={novoConvite.nome}
                  onChange={(e) => setNovoConvite({...novoConvite, nome: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o nome do colaborador"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={novoConvite.email}
                  onChange={(e) => setNovoConvite({...novoConvite, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@colaborador.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo (Opcional)
                </label>
                <input
                  type="text"
                  value={novoConvite.cargo}
                  onChange={(e) => setNovoConvite({...novoConvite, cargo: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Analista, Gerente, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento (Opcional)
                </label>
                <input
                  type="text"
                  value={novoConvite.departamento}
                  onChange={(e) => setNovoConvite({...novoConvite, departamento: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: RH, TI, Vendas, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dias para Expiração
                </label>
                <select
                  value={novoConvite.dias_expiracao}
                  onChange={(e) => setNovoConvite({...novoConvite, dias_expiracao: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={3}>3 dias</option>
                  <option value={7}>7 dias</option>
                  <option value={15}>15 dias</option>
                  <option value={30}>30 dias</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowConviteModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={criarConviteColaborador}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Criar Convite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}