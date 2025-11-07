import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { 
  Building2, 
  Users, 
  BarChart3, 
  Settings, 
  Shield, 
  TrendingUp,
  Calendar,
  AlertTriangle,
  Plus,
  Mail
} from "lucide-react";

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
          <Button variant="ghost" className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 border border-purple-200/20">
            <BarChart3 className="h-5 w-5" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-muted-foreground hover:text-foreground" asChild>
            <a href="/Empresa">
              <Building2 className="h-5 w-5" />
              Empresas
            </a>
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
          
          <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-muted-foreground hover:text-foreground" asChild>
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

export default function GestaoAI() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <GestaoAISidebar />
        <SidebarInset className="flex-1">
          <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Painel Administrativo SAAS
              </h1>
              <p className="text-muted-foreground">
                Gestão completa das empresas cadastradas no HumaniQ AI
              </p>
            </div>
          </div>
        </div>

            {/* Dashboard - Estatísticas Gerais (sem dados simulados) */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total de Empresas</p>
                      <p className="text-2xl font-bold">-</p>
                      <p className="text-xs text-muted-foreground mt-1">Aguardando dados reais</p>
                    </div>
                    <Building2 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Empresas Ativas</p>
                      <p className="text-2xl font-bold text-green-600">-</p>
                      <p className="text-xs text-muted-foreground mt-1">Aguardando dados reais</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Colaboradores Total</p>
                      <p className="text-2xl font-bold">-</p>
                      <p className="text-xs text-muted-foreground mt-1">Aguardando dados reais</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Testes Este Mês</p>
                      <p className="text-2xl font-bold">-</p>
                      <p className="text-xs text-muted-foreground mt-1">Aguardando dados reais</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-pink-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Empresas Cadastradas (sem dados simulados) */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Empresas Cadastradas
                </CardTitle>
                <CardDescription>
                  Gerencie todas as empresas cadastradas no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    Nenhuma empresa cadastrada
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md">
                    Quando empresas se cadastrarem no sistema, elas aparecerão aqui para você gerenciar.
                  </p>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Cadastrar Nova Empresa
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ações Administrativas */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Relatórios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      Relatório Mensal
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Análise de Uso
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Estatísticas de Colaboradores
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configurações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Segurança do Sistema
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Building2 className="h-4 w-4 mr-2" />
                      Configurar Planos
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Logs do Sistema
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Gestão de Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Visualizar Todos
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Gerenciar Permissões
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Auditoria de Acesso
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mensagem de Boas-vindas */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Painel Administrativo do HumaniQ AI
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Como administrador do SAAS HumaniQ AI, você tem controle total sobre todas as empresas 
                      que se cadastrarem no sistema. Este painel será preenchido com dados reais conforme 
                      empresas utilizarem a plataforma.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}