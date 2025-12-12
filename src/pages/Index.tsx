import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { LinkedInView } from "@/components/linkedin/LinkedInView";
import { ListenerView } from "@/components/listener/ListenerView";
import { TemplatesView } from "@/components/templates/TemplatesView";
import { SettingsView } from "@/components/settings/SettingsView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  Search, 
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  Loader2
} from "lucide-react";

const mockLogs = [
  { id: 1, type: "success", message: "Comentário postado com sucesso em @empresa_rh", timestamp: "2024-01-15 14:32:15", details: "Post ID: 3245678901" },
  { id: 2, type: "info", message: "Iniciando scan de hashtag #NR01", timestamp: "2024-01-15 14:30:00", details: "Limite: 20 posts" },
  { id: 3, type: "success", message: "15 posts encontrados para #NR01", timestamp: "2024-01-15 14:30:05", details: "3 posts elegíveis para comentário" },
  { id: 4, type: "info", message: "Scan de hashtag #riscospsicossociais", timestamp: "2024-01-15 14:25:00", details: "Limite: 20 posts" },
  { id: 5, type: "success", message: "8 posts encontrados", timestamp: "2024-01-15 14:25:03", details: "2 posts elegíveis para comentário" },
  { id: 6, type: "warning", message: "Rate limit próximo - reduzindo frequência", timestamp: "2024-01-15 14:20:00", details: "8/10 comentários hoje" },
  { id: 7, type: "success", message: "Comentário postado em @saude_trabalho", timestamp: "2024-01-15 14:15:22", details: "Post ID: 3245678902" },
  { id: 8, type: "error", message: "Falha ao comentar - post deletado", timestamp: "2024-01-15 13:30:00", details: "Post ID: 3245678904" },
];

function LogsView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filter || log.type === filter;
    return matchesSearch && matchesFilter;
  });

  const getLogIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "error": return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "warning": return <AlertCircle className="w-4 h-4 text-warning" />;
      default: return <Info className="w-4 h-4 text-accent" />;
    }
  };

  const getLogBadge = (type: string) => {
    const styles: Record<string, string> = {
      success: "bg-success/20 text-success",
      error: "bg-destructive/20 text-destructive",
      warning: "bg-warning/20 text-warning",
      info: "bg-accent/20 text-accent"
    };
    return styles[type] || styles.info;
  };

  const stats = {
    total: mockLogs.length,
    success: mockLogs.filter(l => l.type === "success").length,
    errors: mockLogs.filter(l => l.type === "error").length,
    warnings: mockLogs.filter(l => l.type === "warning").length
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logs de Atividade</h1>
          <p className="text-muted-foreground mt-1">Histórico das operações</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <div>
                <p className="text-2xl font-bold text-success">{stats.success}</p>
                <p className="text-sm text-muted-foreground">Sucesso</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-warning" />
              <div>
                <p className="text-2xl font-bold text-warning">{stats.warnings}</p>
                <p className="text-sm text-muted-foreground">Avisos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-destructive">{stats.errors}</p>
                <p className="text-sm text-muted-foreground">Erros</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Histórico
            </CardTitle>
            <div className="relative md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="mt-0.5">
                    {getLogIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getLogBadge(log.type)}>
                        {log.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.timestamp}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{log.message}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "dashboard");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const renderView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "linkedin":
        return <LinkedInView />;
      case "listener":
        return <ListenerView />;
      case "templates":
        return <TemplatesView />;
      case "logs":
        return <LogsView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default Index;
