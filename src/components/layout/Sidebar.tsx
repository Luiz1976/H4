import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Radio, 
  MessageSquare, 
  Settings, 
  Activity,
  ChevronLeft,
  Zap
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "listener", label: "Escuta Ativa", icon: Radio },
  { id: "templates", label: "Templates", icon: MessageSquare },
  { id: "logs", label: "Logs", icon: Activity },
  { id: "settings", label: "Configurações", icon: Settings },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-instagram flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-lg gradient-instagram-text">HumaniQ</h1>
              <p className="text-xs text-muted-foreground">Pulse</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
              activeTab === item.id
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-colors",
              activeTab === item.id && "text-sidebar-primary"
            )} />
            {!collapsed && (
              <span className="font-medium">{item.label}</span>
            )}
            {activeTab === item.id && !collapsed && (
              <div className="ml-auto w-2 h-2 rounded-full bg-sidebar-primary animate-pulse" />
            )}
          </button>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <ChevronLeft className={cn(
            "w-5 h-5 transition-transform duration-300",
            collapsed && "rotate-180"
          )} />
          {!collapsed && <span className="text-sm">Recolher</span>}
        </button>
      </div>
    </aside>
  );
}
