import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [status, setStatus] = useState("Processando autenticação...");

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get("code");

            if (!code) {
                setStatus("Erro: Código de autorização não encontrado.");
                return;
            }

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Usuário não autenticado.");

                setStatus("Trocando tokens com o Facebook...");

                const { data, error } = await supabase.functions.invoke('instagram-auth', {
                    body: {
                        code,
                        redirect_uri: window.location.origin + "/auth/callback",
                        user_id: user.id
                    }
                });

                if (error) throw error;
                if (data?.error) throw new Error(data.error);

                toast({
                    title: "Conexão Realizada!",
                    description: "Conta Instagram Business conectada com sucesso.",
                    variant: "default" // success
                });

                navigate("/?tab=settings");
            } catch (error) {
                console.error("Callback error:", error);
                setStatus(`Erro: ${error.message}`);
                toast({
                    title: "Falha na Conexão",
                    description: error.message,
                    variant: "destructive"
                });
            }
        };

        handleCallback();
    }, [searchParams, navigate, toast]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold">{status}</h2>
        </div>
    );
}
