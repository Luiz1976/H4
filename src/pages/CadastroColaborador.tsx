import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Mail, Lock, User, Eye, EyeOff, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { apiService } from '../services/apiService';
import { authService } from '../services/authService';
import { toast } from 'sonner';
import AvatarSelector from '../components/AvatarSelector';

// ========================================
// INTERFACES
// ========================================

interface ConviteColaborador {
  id: string;
  token: string;
  nome_colaborador?: string; // Campo opcional para compatibilidade
  nome?: string; // Campo real do banco
  email_colaborador?: string; // Campo opcional para compatibilidade  
  email?: string; // Campo real do banco
  empresa_id: string;
  usado?: boolean;
  status?: string; // Campo real do banco
  data_expiracao?: string;
  validade?: string; // Campo real do banco
  data_uso?: string;
  created_at: string;
  empresa?: {
    nome: string;
    email: string;
  };
  empresas?: {
    nome_empresa: string;
  };
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

const CadastroColaborador: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [validandoToken, setValidandoToken] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [tokenValido, setTokenValido] = useState(false);
  const [convite, setConvite] = useState<ConviteColaborador | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmar_senha: '',
    cargo: '',
    departamento: '',
    avatar: ''
  });
  
  const [erros, setErros] = useState<Record<string, string>>({});

  // ========================================
  // EFEITOS
  // ========================================

  useEffect(() => {
    if (token) {
      validarToken();
    } else {
      setLoading(false);
      setTokenValido(false);
    }
  }, [token]);

  // Detectar mudanças no status de conexão online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ========================================
  // FUNÇÕES DE VALIDAÇÃO
  // ========================================

  const validarToken = async () => {
    try {
      setValidandoToken(true);
      
      if (!token) {
        setTokenValido(false);
        return;
      }

      const conviteData = await apiService.buscarConvitePorToken(token, 'colaborador');
      
      setTokenValido(true);
      setConvite(conviteData as any);
      
      // Pré-preencher dados do convite
      setFormData(prev => ({
        ...prev,
        nome: conviteData.nome || '',
        email: conviteData.email || ''
      }));
    } catch (error) {
      console.error('Erro ao validar token:', error);
      setTokenValido(false);
      toast.error('Convite inválido, expirado ou já utilizado');
    } finally {
      setValidandoToken(false);
      setLoading(false);
    }
  };

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      novosErros.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      novosErros.email = 'Email inválido';
    }

    if (!formData.senha) {
      novosErros.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 8) {
      novosErros.senha = 'Senha deve ter pelo menos 8 caracteres';
    }

    if (!formData.confirmar_senha) {
      novosErros.confirmar_senha = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmar_senha) {
      novosErros.confirmar_senha = 'Senhas não coincidem';
    }

    // Validação de CEP (básica) - REMOVIDA
    // if (formData.cep && !/^\d{5}-?\d{3}$/.test(formData.cep)) {
    //   novosErros.cep = 'CEP deve estar no formato XXXXX-XXX';
    // }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // ========================================
  // FUNÇÕES DE CADASTRO
  // ========================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    if (!token) {
      toast.error('Token de convite não encontrado');
      return;
    }

    try {
      setSalvando(true);

      // Aceitar convite (cria colaborador e marca como aceito)
      await apiService.aceitarConviteColaborador(token, formData.senha);

      toast.success('Cadastro realizado com sucesso!');
      
      // Fazer login automático
      const loginResponse = await authService.login(formData.email, formData.senha);
      
      if (loginResponse.success) {
        navigate('/colaborador');
      } else {
        navigate('/login');
      }

    } catch (error) {
      console.error('Erro ao cadastrar colaborador:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar cadastro');
    } finally {
      setSalvando(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (erros[field]) {
      setErros(prev => ({ ...prev, [field]: '' }));
    }
  };

  // ========================================
  // FUNÇÕES UTILITÁRIAS
  // ========================================

  // ========================================
  // RENDERIZAÇÃO
  // ========================================

  if (loading || validandoToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {validandoToken ? 'Validando convite...' : 'Carregando...'}
          </p>
        </div>
      </div>
    );
  }

  if (!tokenValido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Convite Inválido</h1>
          <p className="text-gray-600 mb-6">
            Este convite não é válido, já foi utilizado ou expirou.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Cadastro de Colaborador</h1>
          <p className="mt-2 text-gray-600">
            Complete seu cadastro para acessar a plataforma HumaniQ
          </p>
          
          {convite && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <div className="text-sm text-green-800">
                  <p>
                    <strong>Convite válido para:</strong> {convite.nome_colaborador}
                  </p>
                  {convite.empresa && (
                    <p className="flex items-center justify-center mt-1">
                      <Building2 className="h-4 w-4 mr-1" />
                      <strong>Empresa:</strong> {convite.empresa.nome}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Avatar</h3>
              <AvatarSelector
                currentAvatar={formData.avatar}
                isOnline={isOnline}
                onAvatarChange={(avatar) => {
                  if (typeof avatar === 'string') {
                    setFormData(prev => ({ ...prev, avatar }));
                  } else {
                    // Para arquivos, convertemos para base64
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const result = e.target?.result as string;
                      setFormData(prev => ({ ...prev, avatar: result }));
                    };
                    reader.readAsDataURL(avatar);
                  }
                }}
              />
            </div>

            {/* Informações Pessoais */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações Pessoais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      erros.nome ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Digite seu nome completo"
                    disabled={!!convite?.nome_colaborador}
                  />
                  {erros.nome && (
                    <p className="mt-1 text-sm text-red-600">{erros.nome}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      erros.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="seu@email.com"
                    disabled={!!convite?.email_colaborador}
                  />
                  {erros.email && (
                    <p className="mt-1 text-sm text-red-600">{erros.email}</p>
                  )}
                </div>




              </div>
            </div>

            {/* Informações Profissionais */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Informações Profissionais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.cargo}
                    onChange={(e) => handleInputChange('cargo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Analista, Desenvolvedor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={formData.departamento}
                    onChange={(e) => handleInputChange('departamento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: TI, RH, Vendas"
                  />
                </div>
              </div>
            </div>

            {/* Senha */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Definir Senha de Acesso
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      value={formData.senha}
                      onChange={(e) => handleInputChange('senha', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        erros.senha ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {mostrarSenha ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {erros.senha && (
                    <p className="mt-1 text-sm text-red-600">{erros.senha}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarConfirmacao ? 'text' : 'password'}
                      value={formData.confirmar_senha}
                      onChange={(e) => handleInputChange('confirmar_senha', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        erros.confirmar_senha ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Digite a senha novamente"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmacao(!mostrarConfirmacao)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {mostrarConfirmacao ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {erros.confirmar_senha && (
                    <p className="mt-1 text-sm text-red-600">{erros.confirmar_senha}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={salvando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {salvando ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cadastrando...
                  </>
                ) : (
                  'Finalizar Cadastro'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Já possui uma conta?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-green-600 hover:text-green-800 font-medium"
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CadastroColaborador;