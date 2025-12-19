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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { account_id, post_id } = await req.json();

    // Get account with access token
    const { data: account, error: accountError } = await supabase
      .from("linkedin_accounts")
      .select("*")
      .eq("id", account_id)
      .single();

    if (accountError || !account) {
      throw new Error("LinkedIn account not found");
    }

    // Get the post to publish
    let post;
    if (post_id) {
      const { data, error } = await supabase
        .from("linkedin_posts")
        .select("*")
        .eq("id", post_id)
        .eq("status", "ready")
        .single();

      if (error || !data) {
        throw new Error("Post not found or already published");
      }
      post = data;
    } else {
      // Get oldest ready post
      const { data, error } = await supabase
        .from("linkedin_posts")
        .select("*")
        .eq("account_id", account_id)
        .eq("status", "ready")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        throw new Error("No posts ready for publishing");
      }
      post = data;
    }

    console.log(`Publishing post: ${post.title}`);

    // Get author URN
    const authorUrn = `urn:li:person:${account.linkedin_user_id}`;

    // TODO: Re-enable image upload after debugging OAuth permissions
    let shareMediaCategory = "NONE";
    let media = undefined;
    let imageErrorLog = null; // Para capturar erro de upload de imagem

    /* Image upload code - Re-enabled with Fallback */
    try {
      const promoImages = [
        "https://raw.githubusercontent.com/Luiz1976/humaniq-assets/main/ARTE%2001-1.png",
        "https://raw.githubusercontent.com/Luiz1976/humaniq-assets/main/ARTE%2002-1.png",
        "https://raw.githubusercontent.com/Luiz1976/humaniq-assets/main/ARTE%2003-1.png"
      ];
      const imageUrl = promoImages[(post.image_index || 1) - 1];
      console.log(`Uploading image: ${imageUrl}`);

      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.statusText}`);
      }
      const imageBlob = await imageResponse.arrayBuffer();

      const registerResponse = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
            owner: authorUrn,
            serviceRelationships: [
              {
                relationshipType: "OWNER",
                identifier: "urn:li:userGeneratedContent"
              }
            ]
          }
        }),
      });

      if (!registerResponse.ok) {
        const error = await registerResponse.text();
        console.error("LinkedIn register upload error:", error);
        throw new Error(`Failed to register image upload: ${error}`);
      }

      const registerData = await registerResponse.json();
      const uploadUrl = registerData.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl;
      const asset = registerData.value.asset;

      console.log(`Uploading to LinkedIn asset: ${asset}`);

      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${account.access_token}`,
          "Content-Type": "application/octet-stream",
        },
        body: imageBlob,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.text();
        console.error("LinkedIn image upload error:", error);
        throw new Error(`Failed to upload image: ${error}`);
      }

      console.log("Image uploaded successfully, using media...");
      shareMediaCategory = "IMAGE";
      media = [
        {
          status: "READY",
          media: asset,
        }
      ];

    } catch (imageError) {
      console.error("Image upload failed, falling back to text-only:", imageError);
      imageErrorLog = imageError instanceof Error ? imageError.message : String(imageError);
      // Fallback enabled implicitly as variables remain defaults
    }

    // Publish to LinkedIn
    const publishResponse = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: authorUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: post.content,
            },
            shareMediaCategory: shareMediaCategory,
            media: media,
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    });

    if (!publishResponse.ok) {
      const error = await publishResponse.text();
      console.error("LinkedIn publish error:", error);

      // Mark post as failed
      await supabase
        .from("linkedin_posts")
        .update({ status: "failed" })
        .eq("id", post.id);

      // Log the failure
      await supabase.from("linkedin_activity_logs").insert({
        account_id,
        log_type: "error",
        action: "publish",
        message: `Falha ao publicar: "${post.title}"`,
        details: { error, post_id: post.id },
      });

      throw new Error(`Failed to publish: ${error}`);
    }

    const publishData = await publishResponse.json();
    const linkedinPostId = publishData.id;

    console.log("Post published successfully:", linkedinPostId);

    // Update post status
    await supabase
      .from("linkedin_posts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        linkedin_post_id: linkedinPostId,
      })
      .eq("id", post.id);

    // Update settings with last post time
    await supabase
      .from("linkedin_settings")
      .update({
        last_post_at: new Date().toISOString(),
      })
      .eq("account_id", account_id);

    // Log success
    await supabase.from("linkedin_activity_logs").insert({
      account_id,
      log_type: "success",
      action: "publish",
      message: `Post publicado: "${post.title}"`,
      details: { linkedin_post_id: linkedinPostId, post_id: post.id },
    });

    // Check if we need to generate more posts
    const { data: readyPosts, error: countError } = await supabase
      .from("linkedin_posts")
      .select("id")
      .eq("account_id", account_id)
      .eq("status", "ready");

    const readyCount = readyPosts?.length || 0;

    // Get settings for min posts
    const { data: settings } = await supabase
      .from("linkedin_settings")
      .select("min_posts_ready")
      .eq("account_id", account_id)
      .single();

    const minPosts = settings?.min_posts_ready || 10;

    let generated = 0;
    if (readyCount < minPosts) {
      const toGenerate = minPosts - readyCount;
      console.log(`Generating ${toGenerate} new posts to maintain minimum`);

      // Call generate function
      const generateResponse = await fetch(`${SUPABASE_URL}/functions/v1/linkedin-generate-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ account_id, count: toGenerate }),
      });

      if (generateResponse.ok) {
        const genData = await generateResponse.json();
        generated = genData.count || 0;
      }
    }

    /* Modificação para Debug: Retornar erro de imagem se houver */
    const responseData = {
      success: true,
      linkedin_post_id: linkedinPostId,
      post_id: post.id,
      ready_count: readyCount + generated - 1,
      generated,
    };

    if (imageErrorLog) {
      responseData.warning = "Image upload failed";
      responseData.imageError = imageErrorLog; // Retorna o erro exato para o frontend!
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Post publishing error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
