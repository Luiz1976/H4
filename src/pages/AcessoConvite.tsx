import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Building2, 
  Users, 
  Mail,
  ArrowRight,
  Shield,
  Calendar,
  Eye,
  EyeOff,
  Key,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/apiService";
import { authService } from "@/services/authService";

interface ConviteInfo {
  id: string;
  token: string;
  nomeEmpresa?: string; // Para convites de empresa (camelCase da API)
  emailContato?: string; // Para convites de empresa (camelCase da API)
  email?: string; // Para convites de colaborador
  nome?: string; // Para convites de colaborador
  adminId?: string;
  status: 'pendente' | 'usado';
  validade: string;
  createdAt: string;
  metadados?: any;
}

interface ColaboradorData {
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
}

interface EmpresaSenhaData {
  email: string;
  senha: string;
  confirmarSenha: string;
  logoBase64?: string;
}

const AcessoConvite = () => {
  const { codigo, token } = useParams<{ codigo?: string; token?: string }>();
  const navigate = useNavigate();
  
  // Usar token se disponível, senão usar codigo
  const codigoConvite = token || codigo;
  const [conviteInfo, setConviteInfo] = useState<ConviteInfo | null>(null);
  const [colaboradorData, setColaboradorData] = useState<ColaboradorData>({
    nome: '',
    email: '',
    cargo: '',
    departamento: ''
  });
  const [empresaSenhaData, setEmpresaSenhaData] = useState<EmpresaSenhaData>({
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conviteValido, setConviteValido] = useState<boolean | null>(null);
  const [etapaAtual, setEtapaAtual] = useState<'validacao' | 'form' | 'confirmacao'>('validacao');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [errosValidacao, setErrosValidacao] = useState<string[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Validar convite usando dados reais
  useEffect(() => {
    const validarConvite = async () => {
      setIsLoading(true);
      
      try {
        if (codigoConvite) {
          // Primeiro tenta como empresa
          try {
            const conviteEmpresa = await apiService.buscarConvitePorToken(codigoConvite, 'empresa');
            setConviteInfo(conviteEmpresa);
            setConviteValido(true);
            setEtapaAtual('form');
            
            // Removido: não pré-preencher o e-mail da empresa
          } catch (error) {
            // Se não encontrar como empresa, tenta como colaborador
            try {
              const conviteColaborador = await apiService.buscarConvitePorToken(codigoConvite, 'colaborador');
              // Redirecionar diretamente para o cadastro de colaborador
              navigate(`/cadastro/colaborador/${codigoConvite}`);
              return;
            } catch (errorColab) {
              setConviteValido(false);
              toast.error("Convite inválido", {
                description: "Token de convite não encontrado ou expirado"
              });
            }
          }
        } else {
          setConviteValido(false);
        }
      } catch (error) {
        setConviteValido(false);
        toast.error("Erro ao validar convite", {
          description: "Tente novamente em alguns instantes"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (codigoConvite) {
      validarConvite();
    } else {
      setIsLoading(false);
      setConviteValido(false);
    }
  }, [codigoConvite, navigate]);

  // Submit único do formulário: dados + senha + logo
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrosValidacao([]);

    try {
      // Validação das senhas
      if (empresaSenhaData.senha !== empresaSenhaData.confirmarSenha) {
        setErrosValidacao(['As senhas não coincidem']);
        return;
      }

      if (!codigoConvite) {
        toast.error('Token de convite inválido');
        return;
      }

      // Campos obrigatórios do colaborador
      const camposObrigatorios = [
        colaboradorData.nome,
        colaboradorData.email,
        colaboradorData.cargo,
        colaboradorData.departamento,
      ];
      if (camposObrigatorios.some((v) => !v || !String(v).trim())) {
        toast.error('Preencha todos os campos obrigatórios.');
        return;
      }

      // Aceitar convite (senha + logo)
      await apiService.aceitarConviteEmpresa(
        codigoConvite,
        empresaSenhaData.senha,
        empresaSenhaData.logoBase64
      );

      setEtapaAtual('confirmacao');
      toast.success('Empresa cadastrada com sucesso!', {
        description: 'Você pode agora fazer login com suas credenciais',
      });
    } catch (error) {
      setErrosValidacao(['Erro interno do servidor']);
      toast.error('Erro ao cadastrar empresa', {
        description: 'Tente novamente em alguns instantes',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrosValidacao([]);

    try {
      // Validar se as senhas coincidem
      if (empresaSenhaData.senha !== empresaSenhaData.confirmarSenha) {
        setErrosValidacao(['As senhas não coincidem']);
        return;
      }

      if (!codigoConvite) {
        toast.error("Token de convite inválido");
        return;
      }

      // Aceitar convite usando a API (inclui logo se existir)
      await apiService.aceitarConviteEmpresa(
        codigoConvite,
        empresaSenhaData.senha,
        empresaSenhaData.logoBase64
      );

      setEtapaAtual('confirmacao');
      toast.success("Empresa cadastrada com sucesso!", {
        description: "Você pode agora fazer login com suas credenciais"
      });
    } catch (error) {
      setErrosValidacao(['Erro interno do servidor']);
      toast.error("Erro ao cadastrar empresa", {
        description: "Tente novamente em alguns instantes"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validar tipos básicos
    const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato de logo inválido. Use PNG, JPG ou GIF.');
      return;
    }
    // Converter para base64 para envio simples ao backend
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setEmpresaSenhaData(prev => ({ ...prev, logoBase64: result }));
      setLogoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const removerLogo = () => {
    setEmpresaSenhaData(prev => ({ ...prev, logoBase64: undefined }));
    setLogoPreview(null);
  };

  const iniciarTestes = () => {
    // Redirecionar para a página de testes
    navigate('/testes');
  };

  const irParaLogin = () => {
    // Redirecionar para a página de login
    navigate('/login');
  };

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calcularDiasRestantes = (dataExpiracao: Date) => {
    const hoje = new Date();
    const diffTime = dataExpiracao.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Validando Convite</h3>
            <p className="text-muted-foreground">Aguarde enquanto verificamos seu código de acesso...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (conviteValido === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950 dark:to-pink-900 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
              Convite Inválido
            </h3>
            <p className="text-muted-foreground mb-6">
              O código de convite fornecido não é válido ou pode ter expirado.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-green-950 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-foreground">
              Acesso Autorizado
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Bem-vindo ao sistema de Inteligência Psicossocial da HumaniQ AI
          </p>
        </div>

        {/* Informações do Convite */}
        {conviteInfo && (
          <Card className="mb-8 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informações do Convite
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Empresa</h4>
                  <p className="text-lg">{conviteInfo.nomeEmpresa || 'Empresa não identificada'}</p>
                  <p className="text-sm text-muted-foreground">{conviteInfo.emailContato || conviteInfo.email || ''}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Status</h4>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    {conviteInfo.status === 'pendente' ? 'Pendente' : 'Usado'}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Token</h4>
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{conviteInfo.token}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2">Validade</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Até {new Date(conviteInfo.validade).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Formulário Único: Dados + Senha + Logo */}
        {etapaAtual === 'form' && (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Cadastro da Empresa e Seus Dados
              </CardTitle>
              <CardDescription>
                Preencha todos os campos para concluir seu acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitForm} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={colaboradorData.nome}
                      onChange={(e) => setColaboradorData(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Digite seu nome completo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={colaboradorData.email}
                      onChange={(e) => setColaboradorData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="seu.email@empresa.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo *</Label>
                    <Input
                      id="cargo"
                      value={colaboradorData.cargo}
                      onChange={(e) => setColaboradorData(prev => ({ ...prev, cargo: e.target.value }))}
                      placeholder="Ex: Analista, Gerente, Coordenador"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departamento">Departamento *</Label>
                    <Input
                      id="departamento"
                      value={colaboradorData.departamento}
                      onChange={(e) => setColaboradorData(prev => ({ ...prev, departamento: e.target.value }))}
                      placeholder="Ex: RH, TI, Vendas, Financeiro"
                      required
                    />
                  </div>
                </div>

                <Separator />

                {/* Upload de Logo da Empresa (opcional) */}
                <div className="space-y-2">
                  <Label htmlFor="logo-empresa">Logo da Empresa (opcional)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="logo-empresa"
                      type="file"
                      accept="image/png, image/jpeg, image/gif"
                      onChange={handleLogoFileChange}
                    />
                    {logoPreview && (
                      <div className="flex items-center gap-2">
                        <img
                          src={logoPreview}
                          alt="Preview do logo"
                          className="h-12 w-12 rounded-md object-cover border"
                        />
                        <Button type="button" variant="outline" onClick={removerLogo}>
                          Remover
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Formatos aceitos: PNG, JPG, GIF. Tamanho recomendado: 256x256.
                  </p>
                </div>

                {/* Campos de Senha */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email-empresa">E-mail da Empresa</Label>
                    <Input
                      id="email-empresa"
                      type="email"
                      value={empresaSenhaData.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      Este será o e-mail usado para fazer login no sistema
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="senha"
                        type={mostrarSenha ? 'text' : 'password'}
                        value={empresaSenhaData.senha}
                        onChange={(e) => setEmpresaSenhaData(prev => ({ ...prev, senha: e.target.value }))}
                        placeholder="Digite uma senha segura"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="absolute right-1 top-1 h-8 w-8"
                        onClick={() => setMostrarSenha((v) => !v)}
                        aria-label="Mostrar/ocultar senha"
                      >
                        {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use no mínimo 8 caracteres e misture letras, números e símbolos.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmar-senha">Confirmar Senha *</Label>
                    <div className="relative">
                      <Input
                        id="confirmar-senha"
                        type={mostrarConfirmarSenha ? 'text' : 'password'}
                        value={empresaSenhaData.confirmarSenha}
                        onChange={(e) => setEmpresaSenhaData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                        placeholder="Repita a senha"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="absolute right-1 top-1 h-8 w-8"
                        onClick={() => setMostrarConfirmarSenha((v) => !v)}
                        aria-label="Mostrar/ocultar senha"
                      >
                        {mostrarConfirmarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Privacidade garantida:</strong> Seus dados são protegidos e utilizados apenas para fins de análise psicossocial. 
                    Os resultados são confidenciais e seguem as normas da LGPD.
                  </AlertDescription>
                </Alert>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando cadastro...
                    </>
                  ) : (
                    <>
                      Concluir Cadastro
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Etapa única implementada acima */}

        {/* Etapa: Confirmação e Acesso aos Testes */}
        {etapaAtual === 'confirmacao' && (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Cadastro Concluído!
              </CardTitle>
              <CardDescription>
                Empresa cadastrada com sucesso. Você pode agora fazer login ou continuar com os testes.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-6">
                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-6">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 dark:text-green-400 mb-2">
                    Bem-vindo, {colaboradorData.nome}!
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    A empresa {conviteInfo?.empresa?.nome_empresa || conviteInfo?.nome_empresa} foi cadastrada com sucesso no sistema
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Credenciais de Acesso</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>E-mail:</strong> {empresaSenhaData.email}<br />
                      <strong>Empresa:</strong> {conviteInfo?.empresa?.nome_empresa || conviteInfo?.nome_empresa}<br />
                      <strong>Senha:</strong> Configurada com segurança
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-400 mb-2">Próximos Passos</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      • Faça login na área empresarial<br />
                      • Gerencie convites e colaboradores<br />
                      • Visualize relatórios e resultados<br />
                      • Acompanhe o progresso dos testes
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={irParaLogin}
                    size="lg"
                    className="px-8"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Fazer Login da Empresa
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AcessoConvite;