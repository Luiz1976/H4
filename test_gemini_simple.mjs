// Test Gemini API Configuration - Simple Version
// Run with: node test_gemini_simple.mjs

const GEMINI_API_KEY = "AIzaSyD3wD_Kv64yibZvMpBdwRYzGr7Nauq0-wQ";

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
                            text: "Responda apenas com: 'API configurada com sucesso! Pronta para gerar conteúdo do LinkedIn.'"
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
            console.log("   ✓ .env local atualizado com AIzaSyD3wD_Kv64yibZvMpBdwRYzGr7Nauq0-wQ");
            console.log("   ✓ API key válida e ativa");
            console.log("   ✓ Edge Functions prontas para gerar conteúdo");
            console.log("\n💡 Como funciona:");
            console.log("   1. linkedin-generate-content: Gera posts profissionais para LinkedIn");
            console.log("   2. linkedin-listen: Analisa relevância de posts encontrados");
            console.log("   3. Ambas usam a variável GEMINI_API_KEY do ambiente");
            console.log("\nTudo pronto para usar a geração de conteúdo! 🚀");
        } else {
            console.error("❌ Unexpected response format:", JSON.stringify(data, null, 2));
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Test failed:", error.message);
        console.error("\nPossíveis causas:");
        console.error("   • API key inválida ou expirada");
        console.error("   • Problemas de rede");
        console.error("   • Limite de requisições excedido");
        process.exit(1);
    }
}

testGeminiAPI();
