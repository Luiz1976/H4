import { supabase } from "@/integrations/supabase/client";

const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID || "2273465476473882";
const REDIRECT_URI = `${window.location.origin}/auth/callback`; // We need to handle this route

export const connectInstagram = async () => {
    const scope = "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,business_management";
    const state = (await supabase.auth.getUser()).data.user?.id;

    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}&scope=${scope}&response_type=code&auth_type=reauthenticate`;

    window.location.href = authUrl;
};

export const checkInstagramConnection = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('instagram_accounts' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

    if (error) return null;
    return data;
};
