import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Radio, 
  Hash, 
  Search, 
  Clock, 
  MessageSquare, 
  Play,
  Pause,
  Plus,
  X,
  Zap
} from "lucide-react";

export function ListenerView() {
  const [isActive, setIsActive] = useState(false);
  const [hashtags, setHashtags] = useState([
    "#NR01", "#novaNR01", "#riscospsicossociais", "#saudemental", 
    "#SST", "#segurancadotrabalho", "#RH", "#climaorganizacional"
  ]);
  const [keywords, setKeywords] = useState([
    "nova nr01", "riscos psicossociais", "saúde mental trabalho"
  ]);
  const [newHashtag, setNewHashtag] = useState("");
  const [newKeyword, setNewKeyword] = useState("");

  const [config, setConfig] = useState({
    delayMinutes: 30,
    maxCommentsDay: 10,
    postsPerSearch: 20,
    retroactiveDays: 14
  });

  const addHashtag = () => {
    if (newHashtag && !hashtags.includes(newHashtag)) {
      setHashtags([...hashtags, newHashtag.startsWith("#") ? newHashtag : `#${newHashtag}`]);
      setNewHashtag("");
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(h => h !== tag));
  };

  const addKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      setKeywords([...keywords, newKeyword.toLowerCase()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold">Escuta Ativa Instagram</h1>
        <p className="text-muted-foreground mt-1">Monitore hashtags e palavras-chave automaticamente</p>
      </div>

      {/* Main Control */}
      <Card className="glass-card animate-fade-in glow-primary" style={{ animationDelay: "100ms" }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isActive ? "gradient-instagram animate-pulse-slow" : "bg-secondary"
              }`}>
                <Radio className={`w-7 h-7 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {isActive ? "Escuta Ativa Ligada" : "Escuta Ativa Desligada"}
                </h2>
                <p className="text-muted-foreground">
                  {isActive 
                    ? "Monitorando posts em tempo real" 
                    : "Clique para iniciar o monitoramento"
                  }
                </p>
              </div>
            </div>
            <Button
              variant={isActive ? "destructive" : "default"}
              size="lg"
              onClick={() => setIsActive(!isActive)}
              className="gap-2"
            >
              {isActive ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Iniciar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hashtags */}
        <Card className="glass-card animate-fade-in" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Hash className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Hashtags Monitoradas</CardTitle>
                <CardDescription>{hashtags.length} hashtags configuradas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nova hashtag..."
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addHashtag()}
                className="bg-secondary border-border"
              />
              <Button variant="secondary" size="icon" onClick={addHashtag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="px-3 py-1.5 text-sm hover:bg-secondary/80 cursor-pointer group"
                >
                  {tag}
                  <X 
                    className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" 
                    onClick={() => removeHashtag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Keywords */}
        <Card className="glass-card animate-fade-in" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Search className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle>Palavras-chave</CardTitle>
                <CardDescription>{keywords.length} keywords configuradas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nova palavra-chave..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                className="bg-secondary border-border"
              />
              <Button variant="secondary" size="icon" onClick={addKeyword}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <Badge 
                  key={kw} 
                  variant="outline"
                  className="px-3 py-1.5 text-sm hover:bg-secondary cursor-pointer group border-accent/30"
                >
                  {kw}
                  <X 
                    className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" 
                    onClick={() => removeKeyword(kw)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration */}
      <Card className="glass-card animate-fade-in" style={{ animationDelay: "400ms" }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
              <Zap className="w-5 h-5 text-warning" />
            </div>
            <div>
              <CardTitle>Configurações de Rate Limit</CardTitle>
              <CardDescription>Ajuste para evitar bloqueios do Instagram</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Delay entre comentários
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={config.delayMinutes}
                  onChange={(e) => setConfig({...config, delayMinutes: parseInt(e.target.value)})}
                  className="bg-secondary border-border"
                />
                <span className="text-sm text-muted-foreground">min</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                Máx. comentários/dia
              </Label>
              <Input
                type="number"
                value={config.maxCommentsDay}
                onChange={(e) => setConfig({...config, maxCommentsDay: parseInt(e.target.value)})}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                Posts por busca
              </Label>
              <Input
                type="number"
                value={config.postsPerSearch}
                onChange={(e) => setConfig({...config, postsPerSearch: parseInt(e.target.value)})}
                className="bg-secondary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Scan retroativo
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={config.retroactiveDays}
                  onChange={(e) => setConfig({...config, retroactiveDays: parseInt(e.target.value)})}
                  className="bg-secondary border-border"
                />
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
