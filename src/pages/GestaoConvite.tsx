import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Copy, 
  Eye, 
  Calendar, 
  Users, 
  Mail, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Send,
  Building2,
  Shield,
  TrendingUp,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { conviteService, type ConviteData } from "@/services/conviteService";
import { emailService } from "@/services/emailService";
import NotificacaoConvites from "@/pages/NotificacaoConvites";

// Sidebar específico para Gestão AI
function GestaoAISidebar() {
  return (
    <div className="w-64 h-screen bg-card/50 backdrop-blur-xl border-r border-border/10 flex flex-col">
      {/* Header */}
      <div className="flex h-20 items-center px-6 border-b border-border/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              HumaniQ AI
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Administração
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-muted-foreground hover:text-foreground" asChild>
            <a href="/GestaoAI">
              <BarChart3 className="h-5 w-5" />
              Dashboard
            </a>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-muted-foreground hover:text-foreground">
            <Building2 className="h-5 w-5" />
            Empresas
          </Button>
          <a href="/GestaoAI/Dashboard" className="w-full">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-left hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <BarChart3 className="mr-3 h-4 w-4" />
              Dashboard de Métricas
            </Button>
          </a>
          
          <Button variant="ghost" className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 border border-purple-200/20" asChild>
            <a href="/GestaoAI/Convite">
              <Mail className="h-5 w-5" />
              Gestão de Convite
            </a>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-muted-foreground hover:text-foreground">
            <Users className="h-5 w-5" />
            Usuários
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-muted-foreground hover:text-foreground">
            <BarChart3 className="h-5 w-5" />
            Relatórios
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-muted-foreground hover:text-foreground">
            <Settings className="h-5 w-5" />
            Configurações
          </Button>
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-border/10 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-3 dark:from-purple-950/20 dark:to-pink-950/20">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <Shield className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              Admin SAAS
            </span>
            <span className="text-xs text-muted-foreground">
              Gestão Completa
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Convite {
  id: string;
  nomeEmpresa: string;
  emailContato: string;
  numeroColaboradores: number;
  tipoLiberacao: 'unico' | 'prazo';
  prazoDias?: number;
  dataCriacao: Date;
  dataExpiracao?: Date;
  status: 'ativo' | 'expirado' | 'usado';
  linkConvite: string;
  colaboradoresUsaram: number;
}

const GestaoConvite = () => {
  const [convites, setConvites] = useState<Convite[]>([]);
  const [formData, setFormData] = useState({
    nomeEmpresa: '',
    emailContato: '',
    numeroColaboradores: '',
    tipoLiberacao: 'unico',
    prazoDias: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simular dados iniciais (será substituído por dados reais)
  useEffect(() => {
    // Aguardando integração com dados reais
    setConvites([]);
  }, []);

  const gerarCodigoUnico = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dadosNovoConvite = {
        nomeEmpresa: formData.nomeEmpresa,
        emailContato: formData.emailContato,
        numeroColaboradores: parseInt(formData.numeroColaboradores),
        tipoLiberacao: formData.tipoLiberacao as 'unico' | 'prazo',
        prazoDias: formData.tipoLiberacao === 'prazo' ? parseInt(formData.prazoDias) : undefined,
      };

      // @ts-ignore
      const novoConvite = await conviteService.criarConvite(dadosNovoConvite);

      // Adiciona o link do convite para exibição
      const linkConvite = `${window.location.origin}/convite/${novoConvite.codigoConvite}`;
      const conviteParaExibicao = { ...novoConvite, linkConvite };

      // @ts-ignore
      setConvites(prev => [conviteParaExibicao, ...prev]);
      
      // Resetar formulário
      setFormData({
        nomeEmpresa: '',
        emailContato: '',
        numeroColaboradores: '',
        tipoLiberacao: 'unico',
        prazoDias: ''
      });

      toast.success("Convite gerado com sucesso!", {
        description: `Link criado para ${formData.nomeEmpresa}`
      });

    } catch (error) {
      toast.error("Erro ao gerar convite", {
        description: "Tente novamente em alguns instantes"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copiarLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copiado para a área de transferência!");
  };

  const reenviarConvite = (convite: Convite) => {
    // Implementar lógica de reenvio de email
    toast.success(`Convite reenviado para ${convite.emailContato}`);
  };

  const encerrarAcesso = (id: string) => {
    setConvites(prev => 
      prev.map(convite => 
        convite.id === id 
          ? { ...convite, status: 'expirado' as const }
          : convite
      )
    );
    toast.success("Acesso encerrado com sucesso!");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Ativo</Badge>;
      case 'expirado':
        return <Badge variant="secondary">Expirado</Badge>;
      case 'usado':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Usado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <GestaoAISidebar />
        <SidebarInset className="flex-1">
          <div className="container mx-auto px-6 py-8">
            {/* Cabeçalho */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Gestão de Convites para Empresas
                  </h1>
                  <p className="text-muted-foreground">
                    Gere convites de acesso temporário ou único para que seus colaboradores realizem os testes psicossociais.
                  </p>
                </div>
              </div>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Geração de Convites */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Gerar Novo Convite
              </CardTitle>
              <CardDescription>
                Preencha os dados para criar um convite de acesso aos testes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nomeEmpresa">Nome da Empresa *</Label>
                  <Input
                    id="nomeEmpresa"
                    value={formData.nomeEmpresa}
                    onChange={(e) => setFormData(prev => ({ ...prev, nomeEmpresa: e.target.value }))}
                    placeholder="Digite o nome da empresa"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailContato">E-mail de Contato *</Label>
                  <Input
                    id="emailContato"
                    type="email"
                    value={formData.emailContato}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailContato: e.target.value }))}
                    placeholder="contato@empresa.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroColaboradores">Número de Colaboradores *</Label>
                  <Input
                    id="numeroColaboradores"
                    type="number"
                    min="1"
                    value={formData.numeroColaboradores}
                    onChange={(e) => setFormData(prev => ({ ...prev, numeroColaboradores: e.target.value }))}
                    placeholder="Ex: 50"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <Label>Tipo de Liberação *</Label>
                  <RadioGroup
                    value={formData.tipoLiberacao}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipoLiberacao: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unico" id="unico" />
                      <Label htmlFor="unico" className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Acesso único - cada colaborador pode realizar os testes apenas uma vez
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="prazo" id="prazo" />
                      <Label htmlFor="prazo" className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        Acesso por prazo determinado - libera acesso por período configurável
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.tipoLiberacao === 'prazo' && (
                  <div className="space-y-2">
                    <Label htmlFor="prazoDias">Prazo de Liberação (em dias) *</Label>
                    <Input
                      id="prazoDias"
                      type="number"
                      min="1"
                      max="365"
                      value={formData.prazoDias}
                      onChange={(e) => setFormData(prev => ({ ...prev, prazoDias: e.target.value }))}
                      placeholder="Ex: 30"
                      required={formData.tipoLiberacao === 'prazo'}
                    />
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Gerando Convite...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Gerar Convite
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Convites Gerados */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Convites Gerados
              </CardTitle>
              <CardDescription>
                Acompanhe e gerencie os convites criados
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {convites.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum convite foi gerado ainda. Use o formulário ao lado para criar o primeiro convite.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {convites.map((convite) => (
                    <Card key={convite.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground">{convite.nomeEmpresa}</h4>
                            <p className="text-sm text-muted-foreground">{convite.emailContato}</p>
                          </div>
                          {getStatusBadge(convite.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Colaboradores:</span>
                            <p className="font-medium">{convite.colaboradoresUsaram}/{convite.numeroColaboradores}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tipo:</span>
                            <p className="font-medium">
                              {convite.tipoLiberacao === 'unico' ? 'Acesso Único' : `${convite.prazoDias} dias`}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Criado em:</span>
                            <p className="font-medium">{formatarData(convite.dataCriacao)}</p>
                          </div>
                          {convite.dataExpiracao && (
                            <div>
                              <span className="text-muted-foreground">Expira em:</span>
                              <p className="font-medium">{formatarData(convite.dataExpiracao)}</p>
                            </div>
                          )}
                        </div>

                        <Separator className="my-3" />

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copiarLink(convite.linkConvite)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copiar Link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => reenviarConvite(convite)}
                          >
                            <Send className="h-3 w-3 mr-1" />
                            Reenviar
                          </Button>
                          {convite.status === 'ativo' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => encerrarAcesso(convite.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Encerrar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabela Detalhada (para telas maiores) */}
        {convites.length > 0 && (
          <Card className="mt-8 shadow-lg hidden xl:block">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Painel de Acompanhamento Detalhado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Empresa</th>
                      <th className="text-left p-3">Tipo de Liberação</th>
                      <th className="text-left p-3">N° de Colaboradores</th>
                      <th className="text-left p-3">Data de Criação</th>
                      <th className="text-left p-3">Validade</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {convites.map((convite) => (
                      <tr key={convite.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{convite.nomeEmpresa}</p>
                            <p className="text-sm text-muted-foreground">{convite.emailContato}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          {convite.tipoLiberacao === 'unico' ? 'Acesso Único' : `${convite.prazoDias} dias`}
                        </td>
                        <td className="p-3">
                          {convite.colaboradoresUsaram}/{convite.numeroColaboradores}
                        </td>
                        <td className="p-3">{formatarData(convite.dataCriacao)}</td>
                        <td className="p-3">
                          {convite.dataExpiracao ? formatarData(convite.dataExpiracao) : 'Sem expiração'}
                        </td>
                        <td className="p-3">{getStatusBadge(convite.status)}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copiarLink(convite.linkConvite)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => reenviarConvite(convite)}
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                            {convite.status === 'ativo' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => encerrarAcesso(convite.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Componente de Notificações */}
        <NotificacaoConvites />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default GestaoConvite;