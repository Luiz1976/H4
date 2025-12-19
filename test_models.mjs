
const GEMINI_API_KEY = "AIzaSyD2HhuQN79zM-2Qfa2GteIDqEqY-wbwAx8";

const models = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash-lite", // Maybe this one is good too?
];

async function testModel(model) {
    console.log(`\nTesting model: ${model}...`);
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Hello, answer nicely." }] }]
                }),
            }
        );

        if (response.ok) {
            console.log(`✅ SUCCESS with ${model}`);
            const data = await response.json();
            // console.log(JSON.stringify(data, null, 2));
            return true;
        } else {
            console.log(`❌ FAILED with ${model}: ${response.status}`);
            try {
                const err = await response.json();
                console.log(JSON.stringify(err, null, 2));
            } catch (e) {
                console.log(await response.text());
            }
            return false;
        }
    } catch (error) {
        console.error(`ERROR with ${model}:`, error.message);
        return false;
    }
}

async function run() {
    for (const model of models) {
        await testModel(model);
    }
}

run();
