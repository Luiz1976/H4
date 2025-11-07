import { Sparkles, BarChart3, User, Menu, Database, Home, LogOut, GraduationCap } from "lucide-react";
import Logo from "@/components/Logo";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/AuthContext";
import { useState, useEffect } from "react";
import { colaboradorService, ColaboradorCompleto } from "@/services/colaboradorService";
import AvatarSelector from "@/components/AvatarSelector";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { 
    title: "Início", 
    url: "/Colaborador", 
    icon: Home,
  },
  { 
    title: "Testes", 
    url: "/testes", 
    icon: Sparkles,
  },
  { 
    title: "Todos os Resultados", 
    url: "/todos-resultados", 
    icon: Database,
  },
  { 
    title: "Cursos", 
    url: "/colaborador/cursos", 
    icon: GraduationCap,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [colaborador, setColaborador] = useState<ColaboradorCompleto | null>(null);
  const [loadingColaborador, setLoadingColaborador] = useState(true);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Buscar dados do colaborador logado
  useEffect(() => {
    const carregarDadosColaborador = async () => {
      console.log('🔄 [AppSidebar] Iniciando carregamento de dados do colaborador...');
      console.log('👤 [AppSidebar] Usuário atual:', user);
      
      if (user) {
        setLoadingColaborador(true);
        try {
          console.log('📞 [AppSidebar] Chamando colaboradorService.getDadosColaboradorLogado()...');
          const dadosColaborador = await colaboradorService.getDadosColaboradorLogado();
          console.log('📋 [AppSidebar] Dados do colaborador recebidos:', dadosColaborador);
          setColaborador(dadosColaborador);
        } catch (error) {
          console.error('❌ [AppSidebar] Erro ao carregar dados do colaborador:', error);
        } finally {
          setLoadingColaborador(false);
          console.log('✅ [AppSidebar] Carregamento finalizado');
        }
      } else {
        console.log('⚠️ [AppSidebar] Usuário não autenticado, limpando dados do colaborador');
        setColaborador(null);
        setLoadingColaborador(false);
      }
    };

    carregarDadosColaborador();
  }, [user]);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarUpdate = async (newAvatar: string | File) => {
    if (!colaborador) return;

    try {
      let base64String: string;

      // Verificar se é um File ou uma string
      if (newAvatar instanceof File) {
        // Validar se é realmente um arquivo de imagem
        if (!newAvatar.type.startsWith('image/')) {
          toast.error('Por favor, selecione apenas arquivos de imagem.');
          return;
        }

        // Converter arquivo para base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const result = reader.result as string;
          
          try {
            // Atualizar no banco de dados
            await colaboradorService.atualizarColaborador(colaborador.id, {
              avatar: result
            });

            // Atualizar estado local
            setColaborador(prev => prev ? { ...prev, avatar: result } : null);
            
            toast.success('Avatar atualizado com sucesso!');
            setShowAvatarSelector(false);
          } catch (error) {
            console.error('Erro ao atualizar avatar:', error);
            toast.error('Erro ao atualizar avatar. Tente novamente.');
          }
        };
        reader.readAsDataURL(newAvatar);
      } else if (typeof newAvatar === 'string') {
        // É uma string (base64 ou URL), usar diretamente
        base64String = newAvatar;
        
        try {
          // Atualizar no banco de dados
          await colaboradorService.atualizarColaborador(colaborador.id, {
            avatar: base64String
          });

          // Atualizar estado local
          setColaborador(prev => prev ? { ...prev, avatar: base64String } : null);
          
          toast.success('Avatar atualizado com sucesso!');
          setShowAvatarSelector(false);
        } catch (error) {
          console.error('Erro ao atualizar avatar:', error);
          toast.error('Erro ao atualizar avatar. Tente novamente.');
        }
      } else {
        throw new Error('Tipo de avatar inválido. Esperado File ou string.');
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error('Erro ao processar arquivo. Tente novamente.');
    }
  };

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path);
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      className="border-r border-gray-200 bg-white"
      collapsible="icon"
    >
      <div className="flex h-full flex-col">
        {/* Header - Logo e Toggle */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-border/10">
          {!isCollapsed && (
            <Logo size="xl" showText={true} />
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center w-full">
              <Logo size="lg" showText={false} />
            </div>
          )}
          <SidebarTrigger className="h-9 w-9 hover:bg-accent/50 rounded-xl transition-colors" />
        </div>

        {/* Identificação do Usuário */}
        {!isCollapsed && (
          <div className="px-6 py-4 border-b border-border/10">
            {loadingColaborador ? (
              <div className="flex flex-col items-center gap-3 animate-pulse">
                <div className="h-20 w-20 rounded-full bg-muted"></div>
                <div className="text-center">
                  <div className="h-4 bg-muted rounded mb-1 w-24"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => setShowAvatarSelector(true)}
                  className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 hover:from-primary/30 hover:to-primary/20 transition-all duration-200 cursor-pointer"
                  title="Clique para alterar avatar"
                >
                  {colaborador?.avatar ? (
                    <img 
                      src={colaborador.avatar} 
                      alt={colaborador.nome} 
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-primary" />
                  )}
                </button>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground truncate">
                    {colaborador?.nome || user?.name || 'Carregando...'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {colaborador?.cargo || 'Cargo não informado'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <SidebarContent className="flex-1 px-4 py-6">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {items.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          className={`group relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${
                            active 
                              ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25" 
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                          }`}
                          title={item.title}
                        >
                          <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                            active ? "scale-110" : "group-hover:scale-105"
                          }`} />
                          {!isCollapsed && (
                            <span className="font-medium text-sm">
                              {item.title}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <div className="p-4 border-t border-border/10">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className="group relative flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 text-muted-foreground hover:text-foreground hover:bg-accent/40"
                title="Sair"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium text-sm">
                    Sair
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </div>
      
      {/* AvatarSelector Modal */}
      {showAvatarSelector && colaborador && (
        <AvatarSelector
          currentAvatar={colaborador.avatar}
          onAvatarChange={handleAvatarUpdate}
          onClose={() => setShowAvatarSelector(false)}
          isOnline={isOnline}
        />
      )}
    </Sidebar>
  );
}
