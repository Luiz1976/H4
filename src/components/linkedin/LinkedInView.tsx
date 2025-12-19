import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Linkedin,
  Plus,
  Send,
  RefreshCw,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Share2,
  ThumbsUp,
  Radio,
  Zap,
  LogOut,
  Image as ImageIcon
} from "lucide-react";
import { useLinkedIn } from "@/hooks/useLinkedIn";
import { LinkedInConnectCard } from "./LinkedInConnectCard";
import { LinkedInPostCard } from "./LinkedInPostCard";
import { LinkedInDetectionCard } from "./LinkedInDetectionCard";
import arte01 from "@/assets/linkedin/arte-01.png";
import arte02 from "@/assets/linkedin/arte-02.png";
import arte03 from "@/assets/linkedin/arte-03.png";

const images = [arte01, arte02, arte03];

export function LinkedInView() {
  const {
    account,
    posts,
    detections,
    settings,
    loading,
    isConnected,
    readyPosts,
    publishedPosts,
    pendingDetections,
    connectLinkedIn,
    generatePosts,
    publishPost,
    runListeningScan,
    commentOnDetection,
    deletePost,
    disconnectAccount,
    refreshData,
  } = useLinkedIn();

  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    const toGenerate = Math.max(1, 10 - readyPosts.length);
    await generatePosts(toGenerate);
    setGenerating(false);
  };

  const handlePublish = async () => {
    setPublishing(true);
    await publishPost();
    setPublishing(false);
  };

  const handleScan = async () => {
    setScanning(true);
    await runListeningScan();
    setScanning(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isConnected) {
    return <LinkedInConnectCard onConnect={connectLinkedIn} />;
  }

  const portfolioProgress = Math.min(100, (readyPosts.length / 10) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Linkedin className="w-8 h-8 text-[#0A66C2]" />
            LinkedIn Automation
          </h1>
          <p className="text-muted-foreground mt-1">
            Automação inteligente de conteúdo e engajamento
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-[#0A66C2]">
            <AvatarImage src={account?.avatar_url || undefined} />
            <AvatarFallback>{account?.name?.[0] || "L"}</AvatarFallback>
          </Avatar>
          <div className="text-right">
            <p className="font-medium">{account?.name}</p>
            <p className="text-xs text-muted-foreground">Conectado</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={disconnectAccount}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[#0A66C2]">{readyPosts.length}</p>
                <p className="text-sm text-muted-foreground">Posts Prontos</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#0A66C2]/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#0A66C2]" />
              </div>
            </div>
            <Progress value={portfolioProgress} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {readyPosts.length}/10 no portfólio
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">{publishedPosts.length}</p>
                <p className="text-sm text-muted-foreground">Publicados</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-warning">{pendingDetections.length}</p>
                <p className="text-sm text-muted-foreground">Oportunidades</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Radio className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-accent">
                  {detections.filter(d => d.action_taken === "commented").length}
                </p>
                <p className="text-sm text-muted-foreground">Interações</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="gap-2 bg-[#0A66C2] hover:bg-[#004182]"
        >
          {generating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Gerar Conteúdo ({10 - readyPosts.length} faltando)
        </Button>

        <Button
          onClick={handlePublish}
          disabled={publishing || readyPosts.length === 0}
          variant="outline"
          className="gap-2"
        >
          {publishing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Publicar Agora
        </Button>

        <Button
          onClick={handleScan}
          disabled={scanning}
          variant="outline"
          className="gap-2"
        >
          {scanning ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Radio className="w-4 h-4" />
          )}
          Escanear Discussões
        </Button>

        <Button
          onClick={refreshData}
          variant="ghost"
          size="icon"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="portfolio" className="gap-2">
            <ImageIcon className="w-4 h-4" />
            Portfólio ({readyPosts.length})
          </TabsTrigger>
          <TabsTrigger value="published" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Publicados ({publishedPosts.length})
          </TabsTrigger>
          <TabsTrigger value="listening" className="gap-2">
            <Radio className="w-4 h-4" />
            Escuta Ativa ({detections.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#0A66C2]" />
                Posts Prontos para Publicação
              </CardTitle>
              <CardDescription>
                Mantenha sempre 10 posts prontos. O sistema publica automaticamente de hora em hora.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {readyPosts.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum post no portfólio. Clique em "Gerar Conteúdo" para começar.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="grid gap-4">
                    {readyPosts.map((post) => (
                      <LinkedInPostCard
                        key={post.id}
                        post={post}
                        image={images[(post.image_index || 1) - 1]}
                        onPublish={() => publishPost(post.id)}
                        onDelete={() => deletePost(post.id)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="published">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Posts Publicados
              </CardTitle>
              <CardDescription>
                Histórico de publicações e métricas de engajamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {publishedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum post publicado ainda.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="grid gap-4">
                    {publishedPosts.map((post) => (
                      <LinkedInPostCard
                        key={post.id}
                        post={post}
                        image={images[(post.image_index || 1) - 1]}
                        isPublished
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="listening">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-warning animate-pulse" />
                Escuta Ativa - Detecções
              </CardTitle>
              <CardDescription>
                Discussões detectadas sobre NR01, riscos psicossociais e temas correlatos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {detections.length === 0 ? (
                <div className="text-center py-12">
                  <Radio className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma discussão detectada. Clique em "Escanear Discussões" para buscar.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="grid gap-4">
                    {detections.map((detection) => (
                      <LinkedInDetectionCard
                        key={detection.id}
                        detection={detection}
                        onComment={(message) => commentOnDetection(detection.id, message)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
