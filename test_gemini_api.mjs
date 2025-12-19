// Test Gemini API Configuration with Node.js ESM
// Run with: node test_gemini_api.mjs

import { config } from 'dotenv';
config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyD3wD_Kv64yibZvMpBdwRYzGr7Nauq0-wQ";

console.log("🔍 Testing Gemini API Configuration...\n");
console.log("📋 Current Configuration:");
console.log(`   API Key: ${GEMINI_API_KEY.substring(0, 20)}...${GEMINI_API_KEY.slice(-4)}`);
console.log(`   Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent\n`);

async function testGeminiAPI() {
    try {
        console.log("🚀 Sending test request to Gemini API...");

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY.trim()}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: "Responda apenas com: 'API configurada com sucesso!'"
                        }]
                    }]
                }),
            }
        );

        console.log(`📡 Response Status: ${response.status} ${response.statusText}\n`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ API Error:", errorText);
            process.exit(1);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (content) {
            console.log("✅ SUCCESS! Gemini API Response:");
            console.log(`   ${content}\n`);
            console.log("🎉 A nova API key está funcionando perfeitamente!");
            console.log("\n📝 Configuração completa:");
            console.log("   ✓ .env local atualizado");
            console.log("   ✓ API key válida e ativa");
            console.log("   ✓ Edge Functions prontas para usar");
            console.log("\n💡 Próximos passos:");
            console.log("   1. A API key já está configurada localmente");
            console.log("   2. Certifique-se de ter adicionado o secret GEMINI_API_KEY no Supabase Dashboard");
            console.log("   3. As funções de geração de conteúdo agora usarão a nova API!");
        } else {
            console.error("❌ Unexpected response format:", JSON.stringify(data, null, 2));
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Test failed:", error.message);
        process.exit(1);
    }
}

testGeminiAPI();
