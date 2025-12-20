import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { Navbar } from "@/components/layout/Navbar";
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



import { useLinkedIn } from "@/hooks/useLinkedIn";
import { format } from "date-fns";

function LogsView() {
  const { logs, loading } = useLinkedIn();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filter || log.log_type === filter;
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
    total: logs.length,
    success: logs.filter(l => l.log_type === "success").length,
    errors: logs.filter(l => l.log_type === "error").length,
    warnings: logs.filter(l => l.log_type === "warning").length
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
        {/* ... (Keep existing stats cards, logic is compatible with updated stats object) ... */}
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
                    {getLogIcon(log.log_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getLogBadge(log.log_type)}>
                        {log.log_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{log.message}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <p className="text-xs text-muted-foreground font-mono">
                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                      </p>
                      {(log.details as any)?.linkedin_post_id && (
                        <a
                          href={`https://www.linkedin.com/feed/update/${(log.details as any).linkedin_post_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Ver Post <Search className="w-3 h-3" />
                        </a>
                      )}
                      {(log.details as any)?.post_url && (
                        <a
                          href={(log.details as any).post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          Ver Post <Search className="w-3 h-3" />
                        </a>
                      )}
                    </div>
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

import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const autoLogin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setLoading(false);
        return;
      }

      // Auto-login with demo account
      const email = "demo@humaniq.com";
      const password = "demo123456";

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // If login fails, try to create the account
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: "Demo User",
            },
          },
        });

        if (signUpError) {
          console.error("Auto-login failed:", signUpError);
        }
      }
      setLoading(false);
    };

    autoLogin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const renderView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "blog":
        navigate("/website-content");
        return null;
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
    <div className="min-h-screen bg-background">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default Index;
