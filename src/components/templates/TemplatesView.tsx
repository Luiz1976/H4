import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Sparkles, 
  Copy,
  Check,
  Plus,
  Edit,
  Trash2
} from "lucide-react";

const defaultTemplates = [
  {
    id: 1,
    name: "Rapport Building",
    technique: "Rapport",
    content: "Que conteúdo incrível! 👏 A nova NR01 realmente está transformando a forma como as empresas cuidam da saúde mental. Nós da HumaniQ desenvolvemos uma solução completa para adequação. Quer conhecer?",
    active: true
  },
  {
    id: 2,
    name: "Mirroring",
    technique: "Espelhamento",
    content: "Concordo 100%! Os riscos psicossociais são um tema crucial para 2024. Nossa plataforma ajuda empresas a mapear e gerenciar esses riscos de forma simples. Veja mais em nosso perfil!",
    active: true
  },
  {
    id: 3,
    name: "Storytelling",
    technique: "Storytelling",
    content: "Uma empresa cliente nossa reduziu 40% dos afastamentos após implementar nossa solução de gestão de riscos psicossociais. A NR01 é uma oportunidade, não apenas uma obrigação! 🚀",
    active: true
  },
  {
    id: 4,
    name: "Question Hook",
    technique: "Pergunta",
    content: "Excelente post! Vocês já mediram o impacto dos riscos psicossociais na sua organização? Temos uma ferramenta gratuita de diagnóstico inicial. Interesse? 📊",
    active: true
  },
  {
    id: 5,
    name: "Authority",
    technique: "Autoridade",
    content: "Como especialistas em adequação à NR01, podemos afirmar: a gestão proativa de riscos psicossociais é o diferencial competitivo de 2024. Conheça nossa metodologia! ✨",
    active: false
  }
];

export function TemplatesView() {
  const [templates, setTemplates] = useState(defaultTemplates);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleTemplate = (id: number) => {
    setTemplates(templates.map(t => 
      t.id === id ? { ...t, active: !t.active } : t
    ));
  };

  const getTechniqueColor = (technique: string) => {
    const colors: Record<string, string> = {
      "Rapport": "bg-primary/20 text-primary",
      "Espelhamento": "bg-accent/20 text-accent",
      "Storytelling": "bg-success/20 text-success",
      "Pergunta": "bg-warning/20 text-warning",
      "Autoridade": "bg-purple-500/20 text-purple-400"
    };
    return colors[technique] || "bg-secondary text-muted-foreground";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Templates de Comentários</h1>
          <p className="text-muted-foreground mt-1">Geração inteligente com técnicas de NLP</p>
        </div>
        <Button variant="default" className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Template
        </Button>
      </div>

      {/* NLP Techniques Info */}
      <Card className="glass-card animate-fade-in" style={{ animationDelay: "100ms" }}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl gradient-instagram flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Técnicas de NLP Integradas</h3>
              <p className="text-sm text-muted-foreground">Comentários gerados com inteligência para máximo engajamento</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Rapport", "Espelhamento", "Storytelling", "Pergunta", "Autoridade"].map((tech) => (
              <Badge key={tech} className={getTechniqueColor(tech)}>
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map((template, index) => (
          <Card 
            key={template.id} 
            className={`glass-card animate-fade-in transition-all duration-300 ${
              !template.active && "opacity-60"
            }`}
            style={{ animationDelay: `${200 + index * 100}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge className={`mt-1 ${getTechniqueColor(template.technique)}`}>
                      {template.technique}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleTemplate(template.id)}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      template.active ? "bg-success" : "bg-muted-foreground"
                    }`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Textarea
                  value={template.content}
                  readOnly
                  className="min-h-[120px] bg-secondary/50 border-border resize-none text-sm"
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-background/50 hover:bg-background"
                    onClick={() => copyToClipboard(template.content, template.id)}
                  >
                    {copiedId === template.id ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-background/50 hover:bg-background"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <span>{template.content.length} caracteres</span>
                <span className={template.active ? "text-success" : "text-muted-foreground"}>
                  {template.active ? "Ativo" : "Inativo"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
