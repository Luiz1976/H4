import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Zap, Shield } from "lucide-react";
import Logo from "@/components/Logo";

const Index = () => {
  const navigate = useNavigate();

  // Redireciona automaticamente para testes
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/testes');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Logo e Título */}
        <div className="space-y-4">
          <Logo size="xl" showText={false} className="mx-auto" />
          <h1 className="text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            HumaniQ AI
          </h1>
          <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
            Plataforma de avaliação psicológica e análise comportamental baseada em ciência
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300">
            <CardHeader className="text-center">
              <Logo size="md" showText={false} className="mx-auto mb-2" />
              <CardTitle>Testes Científicos</CardTitle>
              <CardDescription>
                8 testes psicológicos validados cientificamente
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300">
            <CardHeader className="text-center">
              <BarChart3 className="h-8 w-8 mx-auto text-primary mb-2" />
              <CardTitle>Relatórios Detalhados</CardTitle>
              <CardDescription>
                Análises completas com insights personalizados
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card border-border/50 hover:shadow-glow transition-all duration-300">
            <CardHeader className="text-center">
              <Shield className="h-8 w-8 mx-auto text-primary mb-2" />
              <CardTitle>Segurança Total</CardTitle>
              <CardDescription>
                Dados protegidos com criptografia avançada
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA */}
        <div className="space-y-6 pt-8">
          <Button 
            size="lg"
            className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-6 shadow-glow"
            onClick={() => navigate('/testes')}
          >
            <Zap className="h-5 w-5 mr-2" />
            Começar Agora
          </Button>
          <p className="text-sm text-muted-foreground">
            Redirecionando automaticamente em alguns segundos...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
