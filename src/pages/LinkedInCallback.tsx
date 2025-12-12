import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Linkedin, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LinkedInCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Conectando sua conta LinkedIn...");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        setMessage(`Erro: ${searchParams.get("error_description") || error}`);
        return;
      }

      if (!code) {
        setStatus("error");
        setMessage("Código de autorização não encontrado");
        return;
      }

      // Verify state
      const savedState = localStorage.getItem("linkedin_oauth_state");
      const userId = localStorage.getItem("linkedin_oauth_user");

      if (state !== savedState) {
        setStatus("error");
        setMessage("Estado de segurança inválido. Tente novamente.");
        return;
      }

      if (!userId) {
        setStatus("error");
        setMessage("Sessão expirada. Faça login novamente.");
        return;
      }

      try {
        setMessage("Trocando código por token...");

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/linkedin-oauth?action=exchange`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code,
              redirect_uri: `${window.location.origin}/linkedin-callback`,
              user_id: userId,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || "Falha ao conectar");
        }

        // Clean up
        localStorage.removeItem("linkedin_oauth_state");
        localStorage.removeItem("linkedin_oauth_user");

        setStatus("success");
        setMessage(`Conta "${data.account.name}" conectada com sucesso!`);

        // Redirect after success
        setTimeout(() => {
          navigate("/?tab=linkedin");
        }, 2000);
      } catch (err) {
        console.error("OAuth callback error:", err);
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Erro desconhecido");
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full glass-card">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#0A66C2]/10 flex items-center justify-center">
              {status === "loading" && (
                <Loader2 className="w-10 h-10 text-[#0A66C2] animate-spin" />
              )}
              {status === "success" && (
                <CheckCircle2 className="w-10 h-10 text-success" />
              )}
              {status === "error" && (
                <AlertCircle className="w-10 h-10 text-destructive" />
              )}
            </div>

            <div>
              <h1 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                {status === "loading" && "Conectando..."}
                {status === "success" && "Conectado!"}
                {status === "error" && "Erro na Conexão"}
              </h1>
              <p className="text-muted-foreground">{message}</p>
            </div>

            {status === "error" && (
              <Button onClick={() => navigate("/")} className="w-full">
                Voltar ao Início
              </Button>
            )}

            {status === "success" && (
              <p className="text-sm text-muted-foreground">
                Redirecionando...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
