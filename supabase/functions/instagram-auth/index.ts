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

    try {
        const { code, redirect_uri, user_id } = await req.json();

        if (!code || !redirect_uri) {
            throw new Error("Missing code or redirect_uri");
        }

        const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const FACEBOOK_APP_ID = Deno.env.get("FACEBOOK_APP_ID")!;
        const FACEBOOK_APP_SECRET = Deno.env.get("FACEBOOK_APP_SECRET")!;

        // 1. Exchange code for short-lived token
        const tokenParams = new URLSearchParams({
            client_id: FACEBOOK_APP_ID,
            client_secret: FACEBOOK_APP_SECRET,
            redirect_uri: redirect_uri,
            code: code,
        });

        const tokenRes = await fetch(
            `https://graph.facebook.com/v19.0/oauth/access_token?${tokenParams}`,
        );
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            throw new Error(`FB Token Error: ${tokenData.error.message}`);
        }

        const shortLivedToken = tokenData.access_token;

        // 2. Exchange for long-lived token
        const longTokenParams = new URLSearchParams({
            grant_type: "fb_exchange_token",
            client_id: FACEBOOK_APP_ID,
            client_secret: FACEBOOK_APP_SECRET,
            fb_exchange_token: shortLivedToken,
        });

        const longTokenRes = await fetch(
            `https://graph.facebook.com/v19.0/oauth/access_token?${longTokenParams}`,
        );
        const longTokenData = await longTokenRes.json();

        if (longTokenData.error) {
            throw new Error(`FB Long Token Error: ${longTokenData.error.message}`);
        }

        const accessToken = longTokenData.access_token;
        // Calculate expiry (usually 60 days)
        const expiresIn = longTokenData.expires_in ? parseInt(longTokenData.expires_in) : 5184000;
        const expiresAt = new Date(Date.now() + expiresIn * 1000);

        // 3. Get Pages and connected Instagram Business Accounts
        const pagesRes = await fetch(
            `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,instagram_business_account&access_token=${accessToken}`,
        );
        const pagesData = await pagesRes.json();

        if (pagesData.error) {
            throw new Error(`FB Pages Error: ${pagesData.error.message}`);
        }

        // Find the first Page with a connected Instagram Business Account
        const connectedPage = pagesData.data.find((p: any) => p.instagram_business_account);

        if (!connectedPage) {
            throw new Error("Nenhuma conta do Instagram Business encontrada vinculada às suas páginas do Facebook.");
        }

        const instagramBusinessId = connectedPage.instagram_business_account.id;
        const pageId = connectedPage.id;

        // 4. Save to Database
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        const { error: dbError } = await supabase
            .from("instagram_accounts")
            .upsert({
                user_id: user_id, // Passed from client or extracted from JWT context if verified
                access_token: accessToken,
                instagram_business_id: instagramBusinessId,
                page_id: pageId,
                token_expires_at: expiresAt.toISOString(),
                is_active: true,
                updated_at: new Date().toISOString(),
            }, { onConflict: "user_id" });

        if (dbError) {
            throw dbError;
        }

        // Log the successful connection
        await supabase.from("instagram_logs").insert({
            account_id: null, // We'd need to fetch the ID first to link it, or just use user_id context if we had it
            action: "connect_account",
            status: "success",
            details: { business_id: instagramBusinessId, page: connectedPage.name }
        });

        return new Response(
            JSON.stringify({ success: true, instagram_id: instagramBusinessId }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    } catch (error) {
        console.error("Instagram Auth Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    }
});
