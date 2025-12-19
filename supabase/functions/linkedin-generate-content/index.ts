
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CONTENT_THEMES = [
  "Implementação da NR01 e gestão de riscos psicossociais",
  "Benefícios do mapeamento de saúde mental no trabalho",
  "Como identificar e prevenir riscos psicossociais",
  "A importância do bem-estar corporativo na produtividade",
  "Conformidade com NR01: guia prático para empresas",
  "Transformação digital na gestão de saúde ocupacional",
  "Indicadores de saúde mental e clima organizacional",
  "Cases de sucesso em gestão de riscos psicossociais",
  "Tendências em saúde ocupacional para 2025",
  "O papel da liderança na promoção do bem-estar",
  "Ferramentas digitais para avaliação psicossocial",
  "Como engajar colaboradores em programas de saúde",
];

serve(async (req) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Health Check (GET)
  if (req.method === "GET") {
    return new Response(JSON.stringify({
      status: "online",
      time: new Date().toISOString(),
      keys_configured: {
        has_gemini: !!Deno.env.get("GEMINI_API_KEY"),
        has_supabase: !!(Deno.env.get("SUPABASE_URL") ?? Deno.env.get("CUSTOM_SUPABASE_URL"))
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    // Load multiple API keys for rotation
    const GEMINI_API_KEYS: string[] = [];
    for (let i = 1; i <= 10; i++) {
      const key = Deno.env.get(`GEMINI_API_KEY_${i}`) || (i === 1 ? Deno.env.get("GEMINI_API_KEY") : null);
      if (key) GEMINI_API_KEYS.push(key);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("CUSTOM_SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("CUSTOM_SERVICE_ROLE_KEY");

    if (GEMINI_API_KEYS.length === 0) throw new Error("No Gemini API keys configured. Set GEMINI_API_KEY or GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.");
    if (!SUPABASE_URL) throw new Error("SUPABASE_URL not configured");
    if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");

    console.log(`✅ Loaded ${GEMINI_API_KEYS.length} Gemini API key(s) for rotation`);

    const reqBody = await req.json().catch(err => {
      throw new Error(`Failed to parse request body JSON: ${err.message}`);
    });

    const { account_id, count = 1 } = reqBody;

    if (!account_id) {
      throw new Error("account_id is required in body");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get existing posts
    const { data: existingPosts } = await supabase
      .from("linkedin_posts")
      .select("title")
      .eq("account_id", account_id);

    const existingTitles = existingPosts?.map(p => p.title) || [];

    const generatedPosts = [];
    let currentKeyIndex = 0;

    // Helper function to call Gemini with retry logic
    async function callGeminiWithRetry(prompt: string, maxRetries = GEMINI_API_KEYS.length): Promise<any> {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const apiKey = GEMINI_API_KEYS[currentKeyIndex];
        const keyLabel = GEMINI_API_KEYS.length > 1 ? `Key ${currentKeyIndex + 1}/${GEMINI_API_KEYS.length}` : "Key";

        console.log(`🔑 Attempting with ${keyLabel} (Attempt ${attempt + 1}/${maxRetries})`);

        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey.trim()}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
              }),
            }
          );

          if (response.ok) {
            console.log(`✅ Success with ${keyLabel}`);
            return await response.json();
          }

          const errorText = await response.text();

          // Check if it's a quota error (429)
          if (response.status === 429) {
            console.warn(`⚠️ Quota exceeded for ${keyLabel}, trying next key...`);
            currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
            lastError = new Error(`Quota exceeded: ${errorText}`);
            continue;
          }

          // For other errors, throw immediately
          throw new Error(`Gemini API returned error ${response.status}: ${errorText}`);
        } catch (error) {
          if (error instanceof Error && error.message.includes("Quota exceeded")) {
            lastError = error;
            continue;
          }
          throw error;
        }
      }

      // All keys failed
      throw lastError || new Error("All API keys exhausted");
    }

    for (let i = 0; i < count; i++) {
      const theme = CONTENT_THEMES[Math.floor(Math.random() * CONTENT_THEMES.length)];
      const imageIndex = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3

      console.log(`\n📝 Generating post ${i + 1}/${count} - Theme: "${theme}"`);

      const prompt = `Você é um especialista em marketing de conteúdo B2B para LinkedIn, especializado em saúde ocupacional e conformidade com NR01.
        
        Crie uma postagem profissional para LinkedIn sobre o tema: "${theme}"
        
        A postagem deve:
        1. Ter um gancho inicial impactante
        2. Apresentar dados ou insights relevantes
        3. Mencionar a HumaniQ AI como solução inovadora para mapeamento de riscos psicossociais
        4. Incluir um call-to-action sutil para conhecer www.humaniqai.com.br
        5. Usar emojis de forma moderada e profissional
        6. Ter entre 150-250 palavras
        7. Incluir 3-5 hashtags relevantes no final
        
        Evite estes títulos que já foram usados: ${existingTitles.join(", ")}
        
        Responda EXCLUSIVAMENTE com um JSON válido do seguinte formato (SEM MARKDOWN, APENAS O JSON, IMPORTANTE):
        {
          "title": "título curto para identificação interna",
          "content": "texto completo da postagem"
        }`;

      // Add delay to respect rate limits (4 seconds between posts)
      if (i > 0) await new Promise(r => setTimeout(r, 4000));

      // Call Gemini with automatic retry/rotation
      const data = await callGeminiWithRetry(prompt);

      // Rotate to next key for next request (round-robin)
      currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;

      const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawContent) {
        console.error("Gemini Empty Response:", JSON.stringify(data));
        throw new Error(`Gemini returned empty content. Response: ${JSON.stringify(data)}`);
      }

      let postData;
      try {
        const cleanJson = rawContent.replace(/```json\n?|\n?```/g, "").trim();
        postData = JSON.parse(cleanJson);
      } catch (e) {
        console.error("Failed to parse JSON:", rawContent);
        postData = { title: `Post sobre ${theme}`, content: rawContent };
      }

      // Save to database
      const { data: newPost, error } = await supabase
        .from("linkedin_posts")
        .insert({
          account_id,
          title: postData.title,
          content: postData.content,
          image_index: imageIndex,
          status: "ready",
        })
        .select()
        .single();

      if (error) throw error;

      generatedPosts.push(newPost);
      existingTitles.push(postData.title);

      await supabase.from("linkedin_activity_logs").insert({
        account_id,
        log_type: "success",
        action: "generate",
        message: `Post gerado: "${postData.title}"`,
        details: { post_id: newPost.id },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      posts: generatedPosts,
      count: generatedPosts.length,
    }), {
      status: 200, // Explicit 200
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Handler Error:", error);

    // Ensure error message is always a string
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "object" && error !== null) {
      errorMessage = JSON.stringify(error);
    } else {
      errorMessage = String(error);
    }

    // Ensure stack trace is a string
    const stackTrace = error instanceof Error && error.stack ? String(error.stack) : undefined;

    // RETURN 200 WITH ERROR FIELD -> Allows frontend to read the message!
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      details: stackTrace
    }), {
      status: 200, // IMPORTANT: Sending 200 to bypass client side exceptions
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
