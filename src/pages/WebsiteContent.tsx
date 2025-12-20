import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
    FileText,
    Calendar,
    TrendingUp,
    CheckCircle2,
    Clock,
    Archive,
    RefreshCw,
    Eye,
    Send,
    Trash2
} from "lucide-react";

interface ContentPost {
    id: string;
    route: string;
    slug: string;
    title: string;
    excerpt: string;
    image_url: string | null;
    image_alt: string | null;
    status: 'draft' | 'scheduled' | 'published' | 'archived';
    priority: 'maximum' | 'high' | 'medium';
    created_at: string;
    published_at: string | null;
    scheduled_for: string | null;
}

interface ContentSchedule {
    route: string;
    frequency: string;
    priority: string;
    last_generated_at: string | null;
    next_scheduled_at: string | null;
    auto_generate_enabled: boolean;
}

const ROUTE_LABELS: Record<string, string> = {
    blog: "Blog",
    nr01: "NR01",
    "riscos-psicossociais": "Riscos Psicossociais",
    "software-nr01": "Software NR01",
    faq: "FAQ"
};

const STATUS_COLORS: Record<string, string> = {
    draft: "bg-gray-500",
    scheduled: "bg-blue-500",
    published: "bg-green-500",
    archived: "bg-yellow-500"
};

const PRIORITY_COLORS: Record<string, string> = {
    maximum: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500"
};

export default function WebsiteContent() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<ContentPost[]>([]);
    const [schedules, setSchedules] = useState<ContentSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeRoute, setActiveRoute] = useState<string>("all");
    const [generating, setGenerating] = useState(false);
    const [activeSidebarTab, setActiveSidebarTab] = useState("blog");
    const { toast } = useToast();

    // Handle sidebar navigation
    const handleTabChange = (tab: string) => {
        if (tab === "blog") {
            setActiveSidebarTab(tab);
        } else {
            navigate(`/?tab=${tab}`);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [postsResult, schedulesResult] = await Promise.all([
                supabase
                    .from("website_content_posts")
                    .select("*")
                    .order("created_at", { ascending: false }),
                supabase
                    .from("website_content_schedule")
                    .select("*")
                    .order("route")
            ]);

            if (postsResult.data) setPosts(postsResult.data);
            if (schedulesResult.data) setSchedules(schedulesResult.data);
        } catch (error) {
            toast({
                title: "Erro",
                description: "Falha ao carregar dados",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const generateContent = async (route: string) => {
        setGenerating(true);
        try {
            const { data, error } = await supabase.functions.invoke("website-generate-content", {
                body: { route, count: 1 }
            });

            if (error) throw error;

            if (data?.success) {
                toast({
                    title: "Sucesso!",
                    description: `Conteúdo gerado para ${ROUTE_LABELS[route]}`
                });
                fetchData();
            } else {
                throw new Error(data?.error || "Erro desconhecido");
            }
        } catch (error) {
            toast({
                title: "Erro",
                description: error instanceof Error ? error.message : "Falha ao gerar conteúdo",
                variant: "destructive"
            });
        } finally {
            setGenerating(false);
        }
    };

    const publishPost = async (postId: string) => {
        try {
            const { data, error } = await supabase.functions.invoke("website-publish-content", {
                body: { post_id: postId }
            });

            if (error) throw error;

            if (data?.success) {
                toast({
                    title: "Publicado!",
                    description: "Conteúdo publicado com sucesso"
                });
                fetchData();
            }
        } catch (error) {
            toast({
                title: "Erro",
                description: "Falha ao publicar conteúdo",
                variant: "destructive"
            });
        }
    };

    const deletePost = async (postId: string) => {
        if (!confirm("Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.")) {
            return;
        }

        try {
            const { error } = await (supabase as any)
                .from("website_content_posts")
                .delete()
                .eq("id", postId);

            if (error) throw error;

            // Immediately update UI by filtering out the deleted post
            setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));

            toast({
                title: "Post excluído",
                description: "O post foi excluído com sucesso",
            });

            // Also fetch fresh data
            fetchData();
        } catch (error: any) {
            toast({
                title: "Erro ao excluir",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const filteredPosts = activeRoute === "all"
        ? posts
        : posts.filter(p => p.route === activeRoute);

    const getStats = () => {
        return {
            total: posts.length,
            draft: posts.filter(p => p.status === 'draft').length,
            scheduled: posts.filter(p => p.status === 'scheduled').length,
            published: posts.filter(p => p.status === 'published').length
        };
    };

    const stats = getStats();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar activeTab={activeSidebarTab} onTabChange={handleTabChange} />
            <main className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold">Conteúdo do Website</h1>
                                <p className="text-muted-foreground">
                                    Gestão automatizada de conteúdo para www.humaniqai.com.br
                                </p>
                            </div>
                            <Button onClick={fetchData} variant="outline">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Atualizar
                            </Button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total</CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.total}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
                                    <FileText className="h-4 w-4 text-gray-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.draft}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Agendados</CardTitle>
                                    <Clock className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.scheduled}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Publicados</CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.published}</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Schedules */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuração de Agendamento</CardTitle>
                                <CardDescription>
                                    Cronograma de geração automática por rota
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {schedules.map(schedule => (
                                        <div key={schedule.route} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{ROUTE_LABELS[schedule.route]}</span>
                                                    <Badge className={PRIORITY_COLORS[schedule.priority]}>
                                                        {schedule.priority}
                                                    </Badge>
                                                    <Badge variant="outline">{schedule.frequency}</Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {schedule.next_scheduled_at
                                                        ? `Próximo: ${new Date(schedule.next_scheduled_at).toLocaleDateString('pt-BR')}`
                                                        : "Não agendado"}
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => generateContent(schedule.route)}
                                                disabled={generating}
                                                size="sm"
                                            >
                                                <TrendingUp className="h-4 w-4 mr-2" />
                                                Gerar Agora
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Posts List */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Conteúdos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={activeRoute} onValueChange={setActiveRoute}>
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="all">Todos</TabsTrigger>
                                        {Object.entries(ROUTE_LABELS).map(([route, label]) => (
                                            <TabsTrigger key={route} value={route}>
                                                {label}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    <ScrollArea className="h-[500px]">
                                        <div className="space-y-4">
                                            {filteredPosts.map(post => (
                                                <div key={post.id} className="border rounded-lg overflow-hidden">
                                                    <div className="flex gap-4 p-4">
                                                        {post.image_url && (
                                                            <div className="flex-shrink-0 w-48 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden flex items-center justify-center">
                                                                <img
                                                                    src={post.image_url}
                                                                    alt={post.image_alt || post.title}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                    }}
                                                                />
                                                                <span className="text-blue-600 text-sm font-medium">📷</span>
                                                            </div>
                                                        )}
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <Badge variant="outline">{ROUTE_LABELS[post.route]}</Badge>
                                                                        <Badge className={STATUS_COLORS[post.status]}>
                                                                            {post.status}
                                                                        </Badge>
                                                                        <Badge className={PRIORITY_COLORS[post.priority]} variant="outline">
                                                                            {post.priority}
                                                                        </Badge>
                                                                        {post.image_url && (
                                                                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                                                                📷 Com Imagem
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <h3 className="font-semibold text-lg">{post.title}</h3>
                                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                        {post.excerpt}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground mt-2">
                                                                        Criado: {new Date(post.created_at).toLocaleString('pt-BR')}
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-2 ml-4">
                                                                    {post.status === 'draft' && (
                                                                        <Button
                                                                            onClick={() => publishPost(post.id)}
                                                                            size="sm"
                                                                            variant="default"
                                                                        >
                                                                            <Send className="h-4 w-4 mr-1" />
                                                                            Publicar
                                                                        </Button>
                                                                    )}
                                                                    <Button
                                                                        onClick={() => deletePost(post.id)}
                                                                        size="sm"
                                                                        variant="destructive"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
