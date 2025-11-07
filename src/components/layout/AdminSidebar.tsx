import { Building2, Mail, LogOut, BarChart3 } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/AuthContext";
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

const adminMenuItems = [
  { 
    title: "Dashboard", 
    url: "/admin", 
    icon: BarChart3 
  },
  { 
    title: "Empresas", 
    url: "/admin/empresas", 
    icon: Building2 
  },
  { 
    title: "Convites", 
    url: "/admin/convites", 
    icon: Mail 
  }
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (url: string) => {
    return currentPath === url || currentPath.startsWith(url + '/');
  };

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            {state === "expanded" && (
              <div>
                <h2 className="font-semibold text-gray-900">HumaniQ</h2>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            )}
          </div>
          <SidebarTrigger className="h-9 w-9 hover:bg-accent/50 rounded-xl transition-colors" />
        </div>

        {/* Navigation */}
        <SidebarContent className="flex-1 px-4 py-6">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {adminMenuItems.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                            active 
                              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <item.icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span className="font-medium">{item.title}</span>
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
        <div className="p-4 border-t border-gray-200">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors w-full"
                >
                  <LogOut className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">Sair</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </div>
    </Sidebar>
  );
}