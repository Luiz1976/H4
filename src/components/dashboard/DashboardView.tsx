import { StatCard } from "./StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  Eye,
  TrendingUp,
  Users,
  Activity,
  Zap
} from "lucide-react";

import { useLinkedIn } from "@/hooks/useLinkedIn";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function DashboardView() {
  const { detections, loading: liLoading } = useLinkedIn();

  // Calculate stats
  const today = new Date().toDateString();
  const commentsToday = detections.filter(d =>
    d.action_taken === "commented" && new Date(d.actioned_at || d.detected_at).toDateString() === today
  ).length;

  const scansToday = detections.filter(d =>
    new Date(d.detected_at).toDateString() === today
  ).length;

  const leads = detections.filter(d => (d.relevance_score || 0) >= 0.7).length;

  // Create Recent Activity from detections
  const recentActivity = detections.slice(0, 5).map(d => ({
    id: d.id,
    type: d.action_taken === "commented" ? "comment" : "scan",
    text: d.action_taken === "commented"
      ? `Comentário em post sobre ${d.detected_topic}`
      : `Detectado: ${d.detected_topic} (${d.source_author})`,
    time: formatDistanceToNow(new Date(d.detected_at), { addSuffix: true, locale: ptBR }),
    status: d.action_taken === "commented" ? "success" : "info" as "success" | "info" | "warning"
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral da automação HumaniQ Pulse</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Comentários Hoje"
          value={commentsToday.toString()}
          change="+12% vs ontem"
          changeType="positive"
          icon={MessageSquare}
          iconColor="text-primary"
          delay={0}
        />
        <StatCard
          title="Posts Escaneados"
          value={scansToday.toString()}
          change="Últimas 24h"
          changeType="neutral"
          icon={Eye}
          iconColor="text-accent"
          delay={100}
        />
        <StatCard
          title="Taxa de Engajamento"
          value="4.2%" // Need real calculation later, keeping hardcoded for now or removing if logic complex
          change="+0.8% esta semana"
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-success"
          delay={200}
        />
        <StatCard
          title="Leads Gerados"
          value={leads.toString()}
          change="Este mês"
          changeType="neutral"
          icon={Users}
          iconColor="text-warning"
          delay={300}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart Placeholder */}
        <Card className="lg:col-span-2 glass-card animate-fade-in" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Atividade Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full gradient-instagram mx-auto flex items-center justify-center mb-4 animate-pulse-slow">
                  <Zap className="w-8 h-8 text-primary-foreground" />
                </div>
                <p className="text-muted-foreground">Gráfico de atividade</p>
                <p className="text-sm text-muted-foreground/70">Conecte o Instagram para ver dados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-card animate-fade-in" style={{ animationDelay: "500ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  style={{ animationDelay: `${600 + index * 50}ms` }}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${activity.status === "success" ? "bg-success" :
                    activity.status === "warning" ? "bg-warning" :
                      "bg-accent"
                    }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{activity.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
