import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Eye, 
  MoreVertical, 
  Search, 
  Filter,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { apiService } from '@/services/apiService';

interface Empresa {
  id: string;
  nome_empresa: string;
  email_contato: string;
  telefone?: string;
  ativo: boolean;
  created_at: string;
  total_colaboradores?: number;
}

interface NovoConvite {
  email: string;
  nome: string;
  dias_expiracao: number;
}

export default function AdminEmpresas() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filtroEmpresas, setFiltroEmpresas] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [showConviteModal, setShowConviteModal] = useState(false);
  const [novoConvite, setNovoConvite] = useState<NovoConvite>({
    email: '',
    nome: '',
    dias_expiracao: 7
  });

  useEffect(() => {
    carregarEmpresas();
  }, []);

  const carregarEmpresas = async () => {
    try {
      console.log('🔍 [ADMIN] Carregando empresas...');
      const response = await authService.getEmpresas();
      
      console.log('🔍 [ADMIN] Resposta recebida:', response);
      
      if (response.success && response.data) {
        console.log('🔍 [ADMIN] Empresas recebidas:', response.data);
        console.log('🔍 [ADMIN] Primeira empresa:', response.data[0]);
        setEmpresas(response.data);
      } else {
        console.error('🔍 [ADMIN] Erro na resposta:', response.message);
        toast.error(response.message || 'Erro ao carregar empresas');
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast.error('Erro ao carregar empresas');
    }
  };

  const criarConviteEmpresa = async () => {
    try {
      if (!novoConvite.email || !novoConvite.nome) {
        toast.error('Email e nome são obrigatórios');
        return;
      }

      const convite = await apiService.criarConviteEmpresa({
        nomeEmpresa: novoConvite.nome,
        emailContato: novoConvite.email,
        diasValidade: novoConvite.dias_expiracao
      });

      toast.success('Convite criado com sucesso!');
      
      // Gerar URL do convite
      const baseUrl = window.location.origin;
      const urlConvite = `${baseUrl}/aceitar-convite/${convite.token}?tipo=empresa`;
      
      // Copiar para clipboard
      navigator.clipboard.writeText(urlConvite);
      toast.info('URL do convite copiada para a área de transferência');
      
      setShowConviteModal(false);
      setNovoConvite({ email: '', nome: '', dias_expiracao: 7 });
      
      // Redirecionar para a página de convites
      navigate('/admin/convites');
    } catch (error) {
      console.error('Erro ao criar convite:', error);
      toast.error('Erro ao criar convite');
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const empresasFiltradas = empresas.filter(empresa => {
    const matchesSearch = (empresa.nome_empresa?.toLowerCase() || '').includes(filtroEmpresas.toLowerCase()) ||
                         (empresa.email_contato?.toLowerCase() || '').includes(filtroEmpresas.toLowerCase());
    
    const matchesStatus = statusFiltro === 'todos' || 
                         (statusFiltro === 'ativo' && empresa.ativo) ||
                         (statusFiltro === 'inativo' && !empresa.ativo);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-600">Gerencie todas as empresas cadastradas no sistema</p>
        </div>
        <button
          onClick={() => setShowConviteModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Convidar Empresa</span>
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
                placeholder="Buscar empresas..."
                value={filtroEmpresas}
                onChange={(e) => setFiltroEmpresas(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativas</option>
              <option value="inativo">Inativas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Empresas */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cadastro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Colaboradores
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {empresasFiltradas.map((empresa) => (
                <tr key={empresa.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {empresa.nome_empresa}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {empresa.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{empresa.email_contato}</div>
                    {empresa.telefone && (
                      <div className="text-sm text-gray-500">{empresa.telefone}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      empresa.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {empresa.ativo ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatarData(empresa.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-1" />
                      {empresa.total_colaboradores || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/admin/empresas/${empresa.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Visualizar indicadores"
                        data-testid={`button-visualizar-${empresa.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        title="Mais opções"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {empresasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma empresa encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filtroEmpresas || statusFiltro !== 'todos' 
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece convidando uma nova empresa.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Convite */}
      {showConviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Convidar Nova Empresa</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={novoConvite.nome}
                  onChange={(e) => setNovoConvite({...novoConvite, nome: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite o nome da empresa"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de Contato
                </label>
                <input
                  type="email"
                  value={novoConvite.email}
                  onChange={(e) => setNovoConvite({...novoConvite, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@empresa.com"
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
                onClick={criarConviteEmpresa}
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