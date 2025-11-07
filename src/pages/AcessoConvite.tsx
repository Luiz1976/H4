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
  ExternalLink,
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
  const [etapaAtual, setEtapaAtual] = useState<'validacao' | 'dados' | 'cadastro-senha' | 'confirmacao'>('validacao');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [errosValidacao, setErrosValidacao] = useState<string[]>([]);

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
            setEtapaAtual('dados');
            
            // Pré-preencher email para cadastro de senha
            setEmpresaSenhaData(prev => ({
              ...prev,
              email: conviteEmpresa.emailContato || conviteEmpresa.email || ''
            }));
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

  const handleSubmitDados = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simular validação e registro dos dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Avançar para etapa de cadastro de senha
      setEtapaAtual('cadastro-senha');
      
      toast.success("Dados registrados com sucesso!", {
        description: "Agora configure a senha de acesso da empresa"
      });
    } catch (error) {
      toast.error("Erro ao registrar dados", {
        description: "Verifique as informações e tente novamente"
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

      // Aceitar convite usando a API
      await apiService.aceitarConviteEmpresa(codigoConvite, empresaSenhaData.senha);

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

        {/* Etapa: Dados do Colaborador */}
        {etapaAtual === 'dados' && (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Seus Dados
              </CardTitle>
              <CardDescription>
                Preencha suas informações para acessar os testes psicossociais
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitDados} className="space-y-6">
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
                      Registrando Dados...
                    </>
                  ) : (
                    <>
                      Confirmar e Continuar
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Etapa: Cadastro de Senha da Empresa */}
        {etapaAtual === 'cadastro-senha' && (
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Cadastro de Senha da Empresa
              </CardTitle>
              <CardDescription>
                Configure uma senha segura para que sua empresa possa acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitSenha} className="space-y-6">
                <div className="space-y-4">
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
                        type={mostrarSenha ? "text" : "password"}
                        value={empresaSenhaData.senha}
                        onChange={(e) => setEmpresaSenhaData(prev => ({ ...prev, senha: e.target.value }))}
                        placeholder="Digite uma senha segura"
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setMostrarSenha(!mostrarSenha)}
                      >
                        {mostrarSenha ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmar-senha">Confirmar Senha *</Label>
                    <div className="relative">
                      <Input
                        id="confirmar-senha"
                        type={mostrarConfirmarSenha ? "text" : "password"}
                        value={empresaSenhaData.confirmarSenha}
                        onChange={(e) => setEmpresaSenhaData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                        placeholder="Digite a senha novamente"
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                      >
                        {mostrarConfirmarSenha ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Critérios de Segurança:</strong>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>• Mínimo de 8 caracteres</li>
                      <li>• Pelo menos uma letra maiúscula</li>
                      <li>• Pelo menos uma letra minúscula</li>
                      <li>• Pelo menos um número</li>
                      <li>• Pelo menos um símbolo especial (!@#$%^&*)</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {errosValidacao.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="space-y-1">
                        {errosValidacao.map((erro, index) => (
                          <li key={index}>• {erro}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Cadastrando Empresa...
                    </>
                  ) : (
                    <>
                      Cadastrar Empresa
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

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
                  
                  <Button 
                    onClick={iniciarTestes}
                    variant="outline"
                    size="lg"
                    className="px-8"
                  >
                    Continuar com os Testes
                    <ExternalLink className="h-4 w-4 ml-2" />
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