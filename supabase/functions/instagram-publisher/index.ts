import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    try {
        // 1. Fetch scheduled posts that are due
        const { data: posts, error: postsError } = await supabase
            .from("instagram_posts")
            .select(`
        *,
        instagram_accounts (
            instagram_business_id,
            access_token
        )
      `)
            .eq("status", "scheduled")
            .lte("scheduled_at", new Date().toISOString());

        if (postsError) throw postsError;

        const results = [];

        for (const post of posts || []) {
            const account = post.instagram_accounts;
            if (!account || !account.instagram_business_id || !account.access_token) {
                await updatePostStatus(supabase, post.id, "failed", "Account credentials missing");
                continue;
            }

            try {
                // 2 Create Media Container
                const containerUrl = `https://graph.facebook.com/v19.0/${account.instagram_business_id}/media`;
                const containerParams = new URLSearchParams({
                    image_url: post.image_url,
                    caption: post.caption || "",
                    access_token: account.access_token,
                });

                const containerRes = await fetch(`${containerUrl}?${containerParams}`, { method: "POST" });
                const containerData = await containerRes.json();

                if (containerData.error) {
                    throw new Error(`Container Error: ${containerData.error.message}`);
                }

                const creationId = containerData.id;

                // 3. Publish Media
                const publishUrl = `https://graph.facebook.com/v19.0/${account.instagram_business_id}/media_publish`;
                const publishParams = new URLSearchParams({
                    creation_id: creationId,
                    access_token: account.access_token,
                });

                const publishRes = await fetch(`${publishUrl}?${publishParams}`, { method: "POST" });
                const publishData = await publishRes.json();

                if (publishData.error) {
                    throw new Error(`Publish Error: ${publishData.error.message}`);
                }

                // 4. Update Status to Published
                await updatePostStatus(supabase, post.id, "published", undefined, new Date().toISOString());

                // Log success
                await logAction(supabase, post.account_id, "publish_post", "success", { post_id: post.id, ig_id: publishData.id });

                results.push({ id: post.id, status: "published" });

            } catch (err) {
                console.error(`Failed to publish post ${post.id}:`, err);
                await updatePostStatus(supabase, post.id, "failed", err.message);
                await logAction(supabase, post.account_id, "publish_post", "failed", { post_id: post.id, error: err.message });
                results.push({ id: post.id, status: "failed", error: err.message });
            }
        }

        return new Response(
            JSON.stringify({ processed: results.length, details: results }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );

    } catch (error) {
        console.error("Instagram Publisher Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    }
});

async function updatePostStatus(supabase: any, id: string, status: string, errorMsg?: string, publishedAt?: string) {
    const updates: any = { status, updated_at: new Date().toISOString() };
    if (errorMsg) updates.error_message = errorMsg;
    if (publishedAt) updates.published_at = publishedAt;

    await supabase.from("instagram_posts").update(updates).eq("id", id);
}

async function logAction(supabase: any, accountId: string, action: string, status: string, details: any) {
    await supabase.from("instagram_logs").insert({
        account_id: accountId,
        action,
        status,
        details
    });
}
