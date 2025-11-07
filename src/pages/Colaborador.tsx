import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BarChart3, Zap, Shield, Users, Building2, Heart, Target, TrendingUp, Award, ClipboardCheck } from "lucide-react";
import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { colaboradorService, ColaboradorCompleto } from "@/services/colaboradorService";
import { toast } from "sonner";

const Colaborador = () => {
  const navigate = useNavigate();
  const [colaborador, setColaborador] = useState<ColaboradorCompleto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do colaborador
  useEffect(() => {
    const carregarDadosColaborador = async () => {
      try {
        setIsLoading(true);
        const dados = await colaboradorService.getDadosColaboradorLogado();
        setColaborador(dados);
      } catch (error) {
        console.error('Erro ao carregar dados do colaborador:', error);
        toast.error('Erro ao carregar dados do perfil');
      } finally {
        setIsLoading(false);
      }
    };

    carregarDadosColaborador();
  }, []);

  const features = [
    {
      icon: Sparkles,
      title: "Testes Científicos",
      description: "8 testes psicológicos validados cientificamente",
      color: "text-blue-500"
    },
    {
      icon: BarChart3,
      title: "Relatórios Detalhados",
      description: "Análises completas com insights personalizados",
      color: "text-green-500"
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Dados protegidos com criptografia avançada",
      color: "text-purple-500"
    },
    {
      icon: Users,
      title: "Suporte Especializado",
      description: "Equipe de psicólogos disponível para orientação",
      color: "text-orange-500"
    }
  ];

  const stats = [
    { label: "Testes Disponíveis", value: "8", icon: Target },
    { label: "Colaboradores Atendidos", value: "1.2K+", icon: Users },
    { label: "Relatórios Gerados", value: "3.5K+", icon: BarChart3 },
    { label: "Taxa de Satisfação", value: "98%", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header com Avatar - Aprimorado */}
        <div className="text-center space-y-8 relative">
          {/* Elementos decorativos de fundo */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-10 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-20 right-1/4 w-24 h-24 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="flex flex-col items-center space-y-6">
            {/* Avatar melhorado com animação */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              {colaborador?.avatar ? (
                <img 
                  src={colaborador.avatar} 
                  alt={colaborador.nome}
                  className="relative mx-auto h-24 w-24 rounded-full object-cover shadow-2xl transform group-hover:scale-105 transition-all duration-300"
                />
              ) : (
                <div className="relative mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-all duration-300">
                  <Logo size="md" showText={false} />
                </div>
              )}
            </div>
            
            {/* Título com gradiente aprimorado */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent animate-gradient bg-300% leading-tight">
                {isLoading ? (
                  <span className="animate-pulse">Carregando...</span>
                ) : colaborador ? (
                  `Olá, ${colaborador.nome}!`
                ) : (
                  'HumaniQ'
                )}
              </h1>
              
              {/* Subtítulo melhorado */}
              <div className="relative">
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium">
                  Sua plataforma completa de 
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold"> avaliação psicológica </span>
                  organizacional
                </p>
              </div>
              
              {/* Informações do colaborador com badges */}
              {colaborador && (
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
                  <div className="flex items-center gap-3">
                    {colaborador.cargo && (
                      <Badge variant="outline" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300" data-testid="badge-cargo">
                        <Users className="h-4 w-4 mr-2" />
                        {colaborador.cargo}
                      </Badge>
                    )}
                    {colaborador.departamento && (
                      <Badge variant="outline" className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-50 to-green-50 dark:from-purple-900/20 dark:to-green-900/20 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300" data-testid="badge-departamento">
                        <Building2 className="h-4 w-4 mr-2" />
                        {colaborador.departamento}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats - Modernizados */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="relative group bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Gradiente decorativo */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"></div>
              
              <CardContent className="p-8 text-center relative z-10">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <stat.icon className="relative h-10 w-10 mx-auto text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
                </div>
                
                <div className="space-y-2">
                  <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features - Modernizados */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="relative group bg-gradient-to-br from-white via-white to-gray-50/30 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900/30 border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:rotate-1 overflow-hidden">
              {/* Efeito de borda animada */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              
              {/* Padrão decorativo de fundo */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-green-500/5 rounded-full blur-3xl"></div>
              
              <CardHeader className="text-center pb-6 pt-8 px-8 relative z-10">
                {/* Ícone com efeito especial */}
                <div className="relative mb-6 mx-auto w-fit">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-green-500/30 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-2xl shadow-inner">
                    <feature.icon className={`h-12 w-12 ${feature.color} group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 drop-shadow-lg`} />
                  </div>
                </div>
                
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {feature.title}
                </CardTitle>
                
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Main Actions - Modernizados */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Realizar Testes */}
          <Card className="relative group bg-gradient-to-br from-blue-50 via-white to-purple-50/50 dark:from-blue-900/20 dark:via-gray-800 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden cursor-pointer">
            {/* Efeito de brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {/* Gradiente decorativo superior */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600"></div>
            
            {/* Padrão de fundo decorativo */}
            <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-xl"></div>
            
            <CardHeader className="text-center pb-6 pt-8 px-8 relative z-10">
              {/* Ícone com efeito especial */}
              <div className="relative mb-8 mx-auto w-fit">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-3xl shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-500">
                   <ClipboardCheck className="h-16 w-16 text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 drop-shadow-lg" />
                 </div>
              </div>
              
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">
                Realizar Testes
              </CardTitle>
              
              <CardDescription className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                Acesse nossa biblioteca de testes psicológicos validados cientificamente. Avalie aspectos como estresse ocupacional, qualidade de vida no trabalho, clima organizacional e muito mais.
              </CardDescription>
              
              {/* Botão de ação */}
              <Button 
                 size="lg" 
                 className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group-hover:shadow-blue-500/25"
                 onClick={() => navigate('/testes')}
               >
                 <span className="flex items-center justify-center gap-3">
                   Começar Agora
                   <Zap className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                 </span>
               </Button>
            </CardHeader>
          </Card>

          {/* Meus Resultados */}
          <Card
            className="relative group bg-gradient-to-br from-green-50 via-white to-emerald-50/50 dark:from-green-900/20 dark:via-gray-800 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-700/50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden cursor-pointer"
            onClick={() => navigate('/todos-resultados')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/todos-resultados'); }}
          >
            {/* Efeito de brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {/* Gradiente decorativo superior */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600"></div>
            
            {/* Padrão de fundo decorativo */}
            <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-full blur-xl"></div>
            
            <CardHeader className="text-center pb-6 pt-8 px-8 relative z-10">
              {/* Ícone com efeito especial */}
              <div className="relative mb-8 mx-auto w-fit">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/40 to-emerald-500/40 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-3xl shadow-2xl group-hover:shadow-green-500/25 transition-all duration-500">
                  <BarChart3 className="h-16 w-16 text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 drop-shadow-lg" />
                </div>
              </div>
              
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 group-hover:from-green-500 group-hover:to-emerald-500 transition-all duration-300">
                Meus Resultados
              </CardTitle>
              
              <CardDescription className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                Visualize e analise seus resultados anteriores. Acompanhe sua evolução ao longo do tempo e obtenha insights personalizados para seu desenvolvimento pessoal e profissional.
              </CardDescription>
              
              {/* Botão de ação */}
              <Button 
                 size="lg" 
                 className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group-hover:shadow-green-500/25"
                 onClick={(e) => { e.stopPropagation(); navigate('/todos-resultados'); }}
               >
                 <span className="flex items-center justify-center gap-3">
                   Ver Resultados
                   <TrendingUp className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                 </span>
               </Button>
            </CardHeader>
          </Card>
        </div>

        {/* Info Section - Modernizada */}
        <Card className="relative bg-gradient-to-br from-white/90 via-white/70 to-gray-50/50 dark:from-gray-800/90 dark:via-gray-800/70 dark:to-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Padrão decorativo de fundo */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 to-blue-500"></div>
          <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-green-500/5 rounded-full blur-3xl"></div>
          
          <CardHeader className="text-center pb-8 pt-12 px-8 relative z-10">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-6">
              Sobre a Plataforma HumaniQ
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-4xl mx-auto">
              O HumaniQ é uma plataforma inovadora que combina tecnologia avançada com conhecimento 
              científico em psicologia organizacional. Nossa missão é promover o bem-estar e a 
              qualidade de vida no ambiente de trabalho através de avaliações precisas e 
              recomendações personalizadas.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-8 pb-12 relative z-10">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div className="group">
                <div className="relative mb-6 mx-auto w-fit">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4 rounded-2xl">
                    <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  Cientificamente Validado
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Testes baseados em pesquisas científicas rigorosas
                </p>
              </div>
              
              <div className="group">
                <div className="relative mb-6 mx-auto w-fit">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4 rounded-2xl">
                    <Shield className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                  Dados Seguros
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Proteção com os mais altos padrões de segurança
                </p>
              </div>
              
              <div className="group">
                <div className="relative mb-6 mx-auto w-fit">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4 rounded-2xl">
                    <BarChart3 className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                  Relatórios Personalizados
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Insights detalhados para seu desenvolvimento
                </p>
              </div>
              
              <div className="group">
                <div className="relative mb-6 mx-auto w-fit">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative bg-gradient-to-br from-orange-500/10 to-red-500/10 p-4 rounded-2xl">
                    <Users className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                  Suporte Especializado
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Equipe de psicólogos para orientação
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Colaborador;