import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building2, ArrowRight, Bot } from "lucide-react";
import Logo from "@/components/Logo";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/AuthContext";

export default function ModuleSelection() {
  const { user } = useAuth();

  // Se o usuário já está logado, redirecionar para sua página específica
  if (user) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'empresa':
        return <Navigate to="/empresa" replace />;
      case 'colaborador':
        return <Navigate to="/Colaborador" replace />;
      default:
        break;
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
              <Logo size="sm" showText={false} />
            </div>
            <div className="flex flex-col items-start">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HumaniQ
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Plataforma de Avaliação Psicossocial
              </p>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Selecione o Módulo de Acesso
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Escolha o módulo apropriado para acessar as funcionalidades específicas da plataforma HumaniQ.
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Módulo Colaborador */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <User className="h-10 w-10" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Módulo Colaborador
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Acesso para colaboradores realizarem testes psicossociais e visualizarem seus resultados
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Realizar testes psicossociais
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Visualizar resultados pessoais
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Acompanhar histórico de avaliações
                </div>
              </div>
              
              <Button 
                asChild 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg group-hover:shadow-xl transition-all duration-300"
              >
                <Link to="/Colaborador" className="flex items-center justify-center gap-2">
                  Acessar Módulo Colaborador
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Módulo Empresa */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-10 w-10" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Módulo Empresa
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Acesso para gestores e RH gerenciarem colaboradores e visualizarem relatórios organizacionais
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Gestão de convites e colaboradores
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Relatórios organizacionais
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Análises de clima organizacional
                </div>
              </div>
              
              <Button 
                asChild 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg group-hover:shadow-xl transition-all duration-300"
              >
                <Link to="/Empresa" className="flex items-center justify-center gap-2">
                  Acessar Módulo Empresa
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Módulo Gestão do HumaniQ AI */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Bot className="h-10 w-10" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Gestão do HumaniQ AI
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Acesso para administração e configuração da inteligência artificial do HumaniQ
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Configuração de modelos de IA
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Análises preditivas avançadas
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Gestão de algoritmos psicossociais
                </div>
              </div>
              
              <Button 
                asChild 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg group-hover:shadow-xl transition-all duration-300"
              >
                <Link to="/GestaoAI" className="flex items-center justify-center gap-2">
                  Acessar Gestão do HumaniQ AI
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 HumaniQ - Plataforma de Avaliação Psicossocial
          </p>
        </div>
      </div>
    </div>
  );
}