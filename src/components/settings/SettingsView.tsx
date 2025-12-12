import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, 
  Bell, 
  Shield, 
  Palette,
  Save,
  RotateCcw,
  Ban,
  Plus,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SettingsView() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    dailyReport: true,
    errorAlerts: true
  });

  const [blacklist, setBlacklist] = useState([
    "@concorrente1", "@concorrente2", "@spam_account"
  ]);
  const [newBlacklist, setNewBlacklist] = useState("");

  const [landingUrl, setLandingUrl] = useState("https://humaniq.com.br");

  const addToBlacklist = () => {
    if (newBlacklist && !blacklist.includes(newBlacklist)) {
      setBlacklist([...blacklist, newBlacklist.startsWith("@") ? newBlacklist : `@${newBlacklist}`]);
      setNewBlacklist("");
    }
  };

  const removeFromBlacklist = (account: string) => {
    setBlacklist(blacklist.filter(b => b !== account));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground mt-1">Personalize o funcionamento do HumaniQ Pulse</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Resetar
          </Button>
          <Button variant="default" className="gap-2">
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card className="glass-card animate-fade-in" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Configure como receber alertas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium">Notificações por Email</p>
                <p className="text-sm text-muted-foreground">Receba resumos por email</p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Alertas em tempo real</p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium">Relatório Diário</p>
                <p className="text-sm text-muted-foreground">Resumo das atividades às 20h</p>
              </div>
              <Switch
                checked={notifications.dailyReport}
                onCheckedChange={(checked) => setNotifications({...notifications, dailyReport: checked})}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium">Alertas de Erro</p>
                <p className="text-sm text-muted-foreground">Notificar falhas críticas</p>
              </div>
              <Switch
                checked={notifications.errorAlerts}
                onCheckedChange={(checked) => setNotifications({...notifications, errorAlerts: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Blacklist */}
        <Card className="glass-card animate-fade-in" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <Ban className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <CardTitle>Lista de Bloqueio</CardTitle>
                <CardDescription>Contas a serem ignoradas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="@usuario_para_bloquear"
                value={newBlacklist}
                onChange={(e) => setNewBlacklist(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addToBlacklist()}
                className="bg-secondary border-border"
              />
              <Button variant="secondary" size="icon" onClick={addToBlacklist}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {blacklist.map((account) => (
                <Badge 
                  key={account} 
                  variant="secondary"
                  className="px-3 py-1.5 text-sm hover:bg-destructive/20 cursor-pointer group"
                >
                  {account}
                  <X 
                    className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" 
                    onClick={() => removeFromBlacklist(account)}
                  />
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Posts dessas contas serão ignorados durante o monitoramento
            </p>
          </CardContent>
        </Card>

        {/* Landing Page */}
        <Card className="glass-card animate-fade-in" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Palette className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle>Landing Page</CardTitle>
                <CardDescription>URL de direcionamento dos leads</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>URL da Landing Page</Label>
              <Input
                value={landingUrl}
                onChange={(e) => setLandingUrl(e.target.value)}
                placeholder="https://sua-landing.com"
                className="bg-secondary border-border"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Esta URL será incluída nos comentários gerados automaticamente
            </p>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="glass-card animate-fade-in" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-success" />
              </div>
              <div>
                <CardTitle>Segurança</CardTitle>
                <CardDescription>Configurações de proteção</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sessão Instagram</span>
                <Badge className="bg-success/20 text-success">Ativa</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Última atualização</span>
                <span className="text-sm text-muted-foreground">Há 2 horas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Expira em</span>
                <span className="text-sm text-muted-foreground">22 horas</span>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              Renovar Sessão Manualmente
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
