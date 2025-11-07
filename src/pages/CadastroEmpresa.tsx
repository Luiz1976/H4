import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, User, Eye, EyeOff, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { hybridInvitationService } from '../services/invitationServiceHybrid';
import { authService } from '../services/authService';
import { toast } from 'sonner';

// ========================================
// INTERFACES
// ========================================

interface ConviteEmpresa {
  id: string;
  token: string;
  nome_empresa: string;
  email_empresa: string;
  usado: boolean;
  data_expiracao: string;
  data_uso?: string;
  created_at: string;
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

const CadastroEmpresa: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [validandoToken, setValidandoToken] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [tokenValido, setTokenValido] = useState(false);
  const [convite, setConvite] = useState<ConviteEmpresa | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  
  const [formData, setFormData] = useState({
    nome_empresa: '',
    email_empresa: '',
    senha: '',
    confirmar_senha: '',
    nome_responsavel: '',
    cargo_responsavel: '',
    telefone: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: ''
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

      const response = await hybridInvitationService.validarConvite(token, 'empresa');
      
      if (response.success && response.data) {
        setTokenValido(true);
        setConvite(response.data);
        
        // Pré-preencher dados do convite
        setFormData(prev => ({
          ...prev,
          nome_empresa: response.data.nome_empresa || '',
          email_empresa: response.data.email_empresa || ''
        }));
      } else {
        setTokenValido(false);
        toast.error(response.message || 'Token inválido ou expirado');
      }
    } catch (error) {
      console.error('Erro ao validar token:', error);
      setTokenValido(false);
      toast.error('Erro ao validar convite');
    } finally {
      setValidandoToken(false);
      setLoading(false);
    }
  };

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};

    // Validações obrigatórias
    if (!formData.nome_empresa.trim()) {
      novosErros.nome_empresa = 'Nome da empresa é obrigatório';
    }

    if (!formData.email_empresa.trim()) {
      novosErros.email_empresa = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_empresa)) {
      novosErros.email_empresa = 'Email inválido';
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

    if (!formData.nome_responsavel.trim()) {
      novosErros.nome_responsavel = 'Nome do responsável é obrigatório';
    }

    // Validação de CNPJ (básica)
    if (formData.cnpj && !/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(formData.cnpj)) {
      novosErros.cnpj = 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX';
    }

    // Validação de CEP (básica)
    if (formData.cep && !/^\d{5}-?\d{3}$/.test(formData.cep)) {
      novosErros.cep = 'CEP deve estar no formato XXXXX-XXX';
    }

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

    try {
      setSalvando(true);

      // Criar empresa no Supabase
      const empresaResponse = await authService.criarEmpresa({
        nome: formData.nome_empresa,
        email: formData.email_empresa,
        senha: formData.senha,
        nome_responsavel: formData.nome_responsavel,
        cargo_responsavel: formData.cargo_responsavel,
        telefone: formData.telefone,
        cnpj: formData.cnpj,
        endereco: formData.endereco,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep
      });

      if (!empresaResponse.success) {
        toast.error(empresaResponse.message || 'Erro ao criar empresa');
        return;
      }

      // Marcar convite como usado
      if (token) {
        const marcarResponse = await hybridInvitationService.usarConvite(token, 'empresa');
        
        if (!marcarResponse.success) {
          console.warn('Erro ao marcar convite como usado:', marcarResponse.message);
        }
      }

      toast.success('Empresa cadastrada com sucesso!');
      
      // Fazer login automático
      const loginResponse = await authService.login(formData.email_empresa, formData.senha);
      
      if (loginResponse.success) {
        navigate('/empresa');
      } else {
        navigate('/login');
      }

    } catch (error) {
      console.error('Erro ao cadastrar empresa:', error);
      toast.error('Erro interno. Tente novamente.');
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

  const formatarCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatarCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatarTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  // ========================================
  // RENDERIZAÇÃO
  // ========================================

  if (loading || validandoToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Cadastro de Empresa</h1>
          <p className="mt-2 text-gray-600">
            Complete seu cadastro para acessar a plataforma HumaniQ
          </p>
          
          {convite && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-green-800">
                  Convite válido para: <strong>{convite.nome_empresa}</strong>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações da Empresa */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Informações da Empresa
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    value={formData.nome_empresa}
                    onChange={(e) => handleInputChange('nome_empresa', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      erros.nome_empresa ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Digite o nome da empresa"
                    disabled={!!convite?.nome_empresa}
                  />
                  {erros.nome_empresa && (
                    <p className="mt-1 text-sm text-red-600">{erros.nome_empresa}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Corporativo *
                  </label>
                  <input
                    type="email"
                    value={formData.email_empresa}
                    onChange={(e) => handleInputChange('email_empresa', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      erros.email_empresa ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="empresa@exemplo.com"
                    disabled={!!convite?.email_empresa}
                  />
                  {erros.email_empresa && (
                    <p className="mt-1 text-sm text-red-600">{erros.email_empresa}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => handleInputChange('cnpj', formatarCNPJ(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      erros.cnpj ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="XX.XXX.XXX/XXXX-XX"
                    maxLength={18}
                  />
                  {erros.cnpj && (
                    <p className="mt-1 text-sm text-red-600">{erros.cnpj}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', formatarTelefone(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(XX) XXXXX-XXXX"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>

            {/* Informações do Responsável */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Responsável pela Conta
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome_responsavel}
                    onChange={(e) => handleInputChange('nome_responsavel', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      erros.nome_responsavel ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Digite o nome completo"
                  />
                  {erros.nome_responsavel && (
                    <p className="mt-1 text-sm text-red-600">{erros.nome_responsavel}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.cargo_responsavel}
                    onChange={(e) => handleInputChange('cargo_responsavel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Gerente de RH"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Endereço (Opcional)
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => handleInputChange('endereco', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Rua, número, complemento"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite a cidade"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => handleInputChange('estado', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={formData.cep}
                      onChange={(e) => handleInputChange('cep', formatarCEP(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        erros.cep ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="XXXXX-XXX"
                      maxLength={9}
                    />
                    {erros.cep && (
                      <p className="mt-1 text-sm text-red-600">{erros.cep}</p>
                    )}
                  </div>
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
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Fazer login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CadastroEmpresa;