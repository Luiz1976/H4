
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

async function createDemoUser() {
    console.log("Creating/Updating demo user...");

    const email = "demo@humaniq.com";
    const password = "demo123456";

    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Auto-confirm email
        user_metadata: { name: "Demo User" }
    });

    if (createError) {
        console.error("Error creating user:", createError.message);
        if (createError.message.includes("already registered")) {
            console.log("User already exists. Attempting to update password just in case.");
            const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
            if (users) {
                const existingUser = users.find(u => u.email === email);
                if (existingUser) {
                    const { error: updateError } = await supabase.auth.admin.updateUserById(
                        existingUser.id,
                        { password: password, email_confirm: true }
                    );
                    if (updateError) console.error("Update failed:", updateError);
                    else console.log("User updated successfully.");
                }
            }
        }
    } else {
        console.log("User created successfully:", user);
    }
}

createDemoUser();
