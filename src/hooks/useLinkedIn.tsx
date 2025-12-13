import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LinkedInAccount {
  id: string;
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  profile_url: string | null;
  linkedin_user_id: string | null;
  connected_at: string;
}

interface LinkedInPost {
  id: string;
  account_id: string | null;
  title: string;
  content: string;
  image_index: number | null;
  status: string;
  published_at: string | null;
  engagement_likes: number | null;
  engagement_comments: number | null;
  engagement_shares: number | null;
  created_at: string;
}

interface LinkedInDetection {
  id: string;
  account_id: string | null;
  source_url: string | null;
  source_author: string | null;
  source_content: string | null;
  detected_topic: string | null;
  relevance_score: number | null;
  action_taken: string | null;
  response_content: string | null;
  detected_at: string;
  actioned_at: string | null;
}

interface LinkedInSettings {
  id: string;
  account_id: string | null;
  auto_post_enabled: boolean | null;
  post_start_hour: number | null;
  post_end_hour: number | null;
  post_interval_minutes: number | null;
  min_posts_ready: number | null;
  listening_keywords: string[] | null;
  auto_comment_enabled: boolean | null;
  auto_promote_enabled: boolean | null;
  last_post_at: string | null;
}

interface ActivityLog {
  id: string;
  account_id: string | null;
  log_type: string;
  action: string;
  message: string;
  details: unknown;
  created_at: string;
}

export function useLinkedIn() {
  const { toast } = useToast();
  const [account, setAccount] = useState<LinkedInAccount | null>(null);
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [detections, setDetections] = useState<LinkedInDetection[]>([]);
  const [settings, setSettings] = useState<LinkedInSettings | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string } | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch account data
  const fetchAccount = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("linkedin_accounts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setAccount(data);
      return data;
    } catch (error) {
      console.error("Error fetching LinkedIn account:", error);
      return null;
    }
  }, [user?.id]);

  // Fetch posts
  const fetchPosts = useCallback(async (accountId: string) => {
    try {
      const { data, error } = await supabase
        .from("linkedin_posts")
        .select("*")
        .eq("account_id", accountId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }, []);

  // Fetch detections
  const fetchDetections = useCallback(async (accountId: string) => {
    try {
      const { data, error } = await supabase
        .from("linkedin_listening")
        .select("*")
        .eq("account_id", accountId)
        .order("detected_at", { ascending: false });

      if (error) throw error;
      setDetections(data || []);
    } catch (error) {
      console.error("Error fetching detections:", error);
    }
  }, []);

  // Fetch settings
  const fetchSettings = useCallback(async (accountId: string) => {
    try {
      const { data, error } = await supabase
        .from("linkedin_settings")
        .select("*")
        .eq("account_id", accountId)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  }, []);

  // Fetch logs
  const fetchLogs = useCallback(async (accountId: string) => {
    try {
      const { data, error } = await supabase
        .from("linkedin_activity_logs")
        .select("*")
        .eq("account_id", accountId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const acc = await fetchAccount();
      if (acc) {
        await Promise.all([
          fetchPosts(acc.id),
          fetchDetections(acc.id),
          fetchSettings(acc.id),
          fetchLogs(acc.id),
        ]);
      }
      setLoading(false);
    };

    if (user?.id) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.id, fetchAccount, fetchPosts, fetchDetections, fetchSettings, fetchLogs]);

  // Realtime subscriptions
  useEffect(() => {
    if (!account?.id) return;

    const logsChannel = supabase
      .channel("linkedin-logs")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "linkedin_activity_logs",
          filter: `account_id=eq.${account.id}`,
        },
        (payload) => {
          setLogs((prev) => [payload.new as ActivityLog, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    const detectionsChannel = supabase
      .channel("linkedin-detections")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "linkedin_listening",
          filter: `account_id=eq.${account.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setDetections((prev) => [payload.new as LinkedInDetection, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setDetections((prev) =>
              prev.map((d) => (d.id === payload.new.id ? (payload.new as LinkedInDetection) : d))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(logsChannel);
      supabase.removeChannel(detectionsChannel);
    };
  }, [account?.id]);

  // Connect LinkedIn
  const connectLinkedIn = useCallback(async () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para conectar o LinkedIn",
        variant: "destructive",
      });
      return;
    }

    try {
      const redirectUri = `${window.location.origin}/linkedin-callback`;



      // Get auth URL
      const authResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/linkedin-oauth?action=authorize&redirect_uri=${encodeURIComponent(redirectUri)}`,
        { method: "GET" }
      );

      if (!authResponse.ok) {
        throw new Error("Failed to get auth URL");
      }

      const { url, state } = await authResponse.json();

      // Store state for verification
      localStorage.setItem("linkedin_oauth_state", state);
      localStorage.setItem("linkedin_oauth_user", user.id);

      // Redirect to LinkedIn
      window.location.href = url;
    } catch (error) {
      console.error("LinkedIn connect error:", error);
      toast({
        title: "Erro ao conectar",
        description: "Não foi possível iniciar a conexão com LinkedIn",
        variant: "destructive",
      });
    }
  }, [user?.id, toast]);

  // Generate posts
  const generatePosts = useCallback(async (count: number = 1) => {
    if (!account?.id) return;

    try {
      toast({
        title: "Gerando conteúdo",
        description: `Gerando ${count} post${count > 1 ? "s" : ""}...`,
      });

      const response = await supabase.functions.invoke("linkedin-generate-content", {
        body: { account_id: account.id, count },
      });

      // Log full response for debugging
      console.log("Generate content response:", response);

      if (response.error) {
        const errorMessage = typeof response.error === "object"
          ? JSON.stringify(response.error, null, 2)
          : String(response.error);
        throw new Error(`Supabase client error: ${errorMessage}`);
      }

      // Check logical success for 200 OK errors
      if (response.data && !response.data.success && response.data.error) {
        const errorMessage = typeof response.data.error === "object"
          ? JSON.stringify(response.data.error, null, 2)
          : String(response.data.error);
        throw new Error(errorMessage);
      }

      toast({
        title: "Sucesso",
        description: `${response.data.count} post${response.data.count > 1 ? "s" : ""} gerado${response.data.count > 1 ? "s" : ""}`,
      });

      await fetchPosts(account.id);
      return response.data;
    } catch (error) {
      console.error("Generate posts error:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao gerar conteúdo",
        variant: "destructive",
      });
    }
  }, [account?.id, toast, fetchPosts]);

  // Publish post
  const publishPost = useCallback(async (postId?: string) => {
    if (!account?.id) return;

    try {
      toast({
        title: "Publicando",
        description: "Publicando post no LinkedIn...",
      });

      const response = await supabase.functions.invoke("linkedin-post", {
        body: { account_id: account.id, post_id: postId },
      });

      if (response.error) throw response.error;

      // Check if image upload failed
      if (response.data?.warning && response.data?.imageError) {
        console.warn("⚠️ Post published but image upload failed:");
        console.error("Image Error Details:", response.data.imageError);
        toast({
          title: "Publicado (sem imagem)",
          description: `Post publicado, mas imagem falhou. Veja console (F12)`,
          variant: "default",
        });
      } else {
        toast({
          title: "Publicado",
          description: "Post publicado com sucesso no LinkedIn",
        });
      }

      await fetchPosts(account.id);
      return response.data;
    } catch (error) {
      console.error("Publish post error:", error);
      toast({
        title: "Erro",
        description: "Falha ao publicar post",
        variant: "destructive",
      });
    }
  }, [account?.id, toast, fetchPosts]);

  // Run listening scan
  const runListeningScan = useCallback(async () => {
    if (!account?.id) return;

    try {
      toast({
        title: "Escaneando",
        description: "Buscando discussões relevantes...",
      });

      const response = await supabase.functions.invoke("linkedin-listen", {
        body: { account_id: account.id },
      });

      if (response.error) throw response.error;

      toast({
        title: "Escuta concluída",
        description: `${response.data.detected} discussões detectadas`,
      });

      await fetchDetections(account.id);
      return response.data;
    } catch (error) {
      console.error("Listening scan error:", error);
      toast({
        title: "Erro",
        description: "Falha na escuta ativa",
        variant: "destructive",
      });
    }
  }, [account?.id, toast, fetchDetections]);

  // Comment on detection
  const commentOnDetection = useCallback(async (detectionId: string, customMessage?: string) => {
    try {
      const response = await supabase.functions.invoke("linkedin-comment", {
        body: { detection_id: detectionId, custom_message: customMessage },
      });

      if (response.error) throw response.error;

      toast({
        title: "Comentário postado",
        description: "Resposta enviada com sucesso",
      });

      if (account?.id) {
        await fetchDetections(account.id);
      }
      return response.data;
    } catch (error) {
      console.error("Comment error:", error);
      toast({
        title: "Erro",
        description: "Falha ao postar comentário",
        variant: "destructive",
      });
    }
  }, [account?.id, toast, fetchDetections]);

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<LinkedInSettings>) => {
    if (!settings?.id) return;

    try {
      const { error } = await supabase
        .from("linkedin_settings")
        .update(updates)
        .eq("id", settings.id);

      if (error) throw error;

      setSettings((prev) => prev ? { ...prev, ...updates } : null);

      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas",
      });
    } catch (error) {
      console.error("Update settings error:", error);
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações",
        variant: "destructive",
      });
    }
  }, [settings?.id, toast]);

  // Delete post
  const deletePost = useCallback(async (postId: string) => {
    try {
      const { error } = await supabase
        .from("linkedin_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      setPosts((prev) => prev.filter((p) => p.id !== postId));

      toast({
        title: "Post excluído",
        description: "O post foi removido do portfólio",
      });
    } catch (error) {
      console.error("Delete post error:", error);
      toast({
        title: "Erro",
        description: "Falha ao excluir post",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Disconnect account
  const disconnectAccount = useCallback(async () => {
    if (!account?.id) return;

    try {
      const { error } = await supabase
        .from("linkedin_accounts")
        .delete()
        .eq("id", account.id);

      if (error) throw error;

      setAccount(null);
      setPosts([]);
      setDetections([]);
      setSettings(null);
      setLogs([]);

      toast({
        title: "Desconectado",
        description: "Conta LinkedIn desconectada",
      });
    } catch (error) {
      console.error("Disconnect error:", error);
      toast({
        title: "Erro",
        description: "Falha ao desconectar conta",
        variant: "destructive",
      });
    }
  }, [account?.id, toast]);

  return {
    account,
    posts,
    detections,
    settings,
    logs,
    loading,
    user,
    isConnected: !!account,
    readyPosts: posts.filter((p) => p.status === "ready"),
    publishedPosts: posts.filter((p) => p.status === "published"),
    pendingDetections: detections.filter((d) => d.action_taken === "pending"),
    connectLinkedIn,
    generatePosts,
    publishPost,
    runListeningScan,
    commentOnDetection,
    updateSettings,
    deletePost,
    disconnectAccount,
    refreshData: async () => {
      if (account?.id) {
        await Promise.all([
          fetchPosts(account.id),
          fetchDetections(account.id),
          fetchLogs(account.id),
        ]);
      }
    },
  };
}
