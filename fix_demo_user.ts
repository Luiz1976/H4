
import { createClient } from "@supabase/supabase-js";

// User provided keys
const PROJECT_URL = "https://wdjggjsxsvexqrhyizrn.supabase.co";
const SERVICE_ROLE_KEY = "sb_secret_8RTarORmDW09ixpZrcbgCw_lX0OZHw0";

const supabase = createClient(PROJECT_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function fixUser() {
    console.log("Listing users...");
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error("List error:", error);
        return;
    }

    const demoUser = users.find(u => u.email === "demo@humaniq.com");

    if (demoUser) {
        console.log("Found user:", demoUser.id, "Confirmed:", demoUser.email_confirmed_at);

        // Force update password and confirm email
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            demoUser.id,
            {
                password: "demo123456",
                email_confirm: true,
                user_metadata: { name: "Demo User" }
            }
        );

        if (updateError) {
            console.error("Update failed:", updateError);
        } else {
            console.log("User updated and confirmed successfully!");
        }
    } else {
        console.log("User NOT found. Creating...");
        const { data, error: createError } = await supabase.auth.admin.createUser({
            email: "demo@humaniq.com",
            password: "demo123456",
            email_confirm: true,
            user_metadata: { name: "Demo User" }
        });
        if (createError) console.error("Create failed:", createError);
        else console.log("User created!");
    }
}

fixUser();
