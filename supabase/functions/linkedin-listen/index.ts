
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("CUSTOM_SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("CUSTOM_SERVICE_ROLE_KEY");

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { account_id, action = "scan", scan_type = "recent" } = await req.json();

    // CLEANUP ACTION (Removes all data)
    if (action === "cleanup") {
      console.log("Executing Database Cleanup...");

      // Delete all records from listening and logs
      const { error: err1 } = await supabase.from("linkedin_listening").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const { error: err2 } = await supabase.from("linkedin_activity_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      if (err1 || err2) {
        throw new Error("Failed to clean database: " + (err1?.message || err2?.message));
      }

      return new Response(JSON.stringify({
        success: true,
        message: "Database cleaned successfully. All fake data removed."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!account_id) {
      throw new Error("account_id is required");
    }

    // Get account and settings
    const { data: account, error: accountError } = await supabase
      .from("linkedin_accounts")
      .select("*")
      .eq("id", account_id)
      .single();

    if (accountError || !account) {
      throw new Error("LinkedIn account not found");
    }

    const { data: settings } = await supabase
      .from("linkedin_settings")
      .select("*")
      .eq("account_id", account_id)
      .single();

    const keywords = settings?.listening_keywords || [
      "NR01",
      "riscos psicossociais",
      "saúde mental trabalho",
      "bem-estar corporativo"
    ];

    // Date Logic for Deep Scan
    let dateFilter = "";
    if (scan_type === "deep") {
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const formattedDate = sixtyDaysAgo.toISOString().split("T")[0]; // YYYY-MM-DD
      dateFilter = ` after:${formattedDate}`;
      console.log(`Deep Scan enabled. Filtering posts after ${formattedDate}`);
    }

    // SERPER API Integration for Real Listening
    const SERPER_API_KEY = Deno.env.get("SERPER_API_KEY");
    let detected = [];

    if (SERPER_API_KEY) {
      console.log(`Executing Real Search via Serper (${scan_type})...`);
      for (const keyword of keywords) {
        try {
          const searchResponse = await fetch("https://google.serper.dev/search", {
            method: "POST",
            headers: {
              "X-API-KEY": SERPER_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              q: `site:linkedin.com/posts ${keyword}${dateFilter}`,
              num: scan_type === "deep" ? 10 : 5,
              gl: "br",
              hl: "pt-br"
            }),
          });

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            const items = searchData.organic || [];

            items.forEach((item: any) => {
              detected.push({
                source_url: item.link,
                source_author: item.title.split(" | ")[0] || "Unknown Author",
                source_content: item.snippet,
                detected_topic: keyword,
              });
            });
          }
        } catch (e) {
          console.error(`Search error for ${keyword}:`, e);
        }
      }
    } else {
      console.warn("SERPER_API_KEY not found. Detailed listening unavailable.");
    }

    // Filter duplicates
    detected = detected.filter((v, i, a) => a.findIndex(v2 => (v2.source_url === v.source_url)) === i);

    const savedDetections = [];

    // Promo Images
    const promoImages = [
      "https://raw.githubusercontent.com/alicebella/humaniq-assets/main/arte-01.png",
      "https://raw.githubusercontent.com/alicebella/humaniq-assets/main/arte-02.png"
    ];

    for (const discussion of detected) {
      // Add delay to respect rate limits (4 seconds)
      if (detected.indexOf(discussion) > 0) await new Promise(r => setTimeout(r, 4000));
      let analysis;

      // Calculate relevance score using AI (Gemini)
      if (GEMINI_API_KEY) {
        const scorePrompt = `Analise o seguinte post do LinkedIn e determine:
            1. Relevância para riscos psicossociais e NR01 (0-1)
            2. Se é uma oportunidade de interação comercial
            3. Se menciona necessidade de ajuda
            
            Post: "${discussion.source_content}"
            
            Responda EXCLUSIVAMENTE em JSON (sem markdown):
            {
            "relevance_score": 0.0-1.0,
            "is_opportunity": boolean,
            "needs_help": boolean,
            "suggested_response": "texto de resposta contextualizada mencionando HumaniQ AI"
            }`;

        try {
          // Updated to use gemini-flash-latest for stable free tier
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY.trim()}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: scorePrompt }]
              }]
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (rawContent) {
              const cleanJson = rawContent.replace(/```json\n?|\n?```/g, "").trim();
              analysis = JSON.parse(cleanJson);
            }
          }
        } catch (e) {
          console.error("AI analysis error:", e);
        }
      }

      // Attach Random Image Logic
      const randomImage = promoImages[Math.floor(Math.random() * promoImages.length)];
      const responseWithImage = `${analysis?.suggested_response || "Olá! A HumaniQ AI pode ajudar."}\n\nConfira: ${randomImage}`;

      analysis = analysis || {
        relevance_score: 0.5,
        is_opportunity: false,
        needs_help: false,
        suggested_response: responseWithImage,
      };

      // Force image into response if not present
      if (!analysis.suggested_response.includes("http")) {
        analysis.suggested_response += `\n\n${randomImage}`;
      }

      // Save detection
      const { data: detection, error } = await supabase
        .from("linkedin_listening")
        .insert({
          account_id,
          source_url: discussion.source_url,
          source_author: discussion.source_author,
          source_content: discussion.source_content,
          detected_topic: discussion.detected_topic,
          relevance_score: analysis.relevance_score,
          action_taken: "pending",
          response_content: analysis.suggested_response,
        })
        .select()
        .single();

      if (!error && detection) {
        savedDetections.push(detection);

        // Log the detection
        await supabase.from("linkedin_activity_logs").insert({
          account_id,
          log_type: "info",
          action: "listen",
          message: `Detectado (Real): "${discussion.detected_topic}"`,
          details: {
            detection_id: detection.id,
            relevance: analysis.relevance_score,
            post_url: discussion.source_url
          },
        });
      }
    }

    console.log(`Detected ${savedDetections.length} relevant discussions from Real Web Search`);

    return new Response(JSON.stringify({
      success: true,
      detected: savedDetections.length,
      detections: savedDetections,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Listening error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
