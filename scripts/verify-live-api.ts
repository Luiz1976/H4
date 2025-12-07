
// using native fetch

async function tryFetch(url: string, token: string | null) {
    console.log(`Checking ${url}...`);
    try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(url + (token ? '/api/empresas/estado-psicossocial' : '/api/auth/login'), {
            method: token ? 'GET' : 'POST',
            headers,
            body: token ? undefined : JSON.stringify({ email: 'luiz@humaniq.com', password: 'Luiz@1222' })
        });

        if (res.ok) {
            console.log(`✅ SUCCESS connecting to ${url}`);
            const data: any = await res.json();
            if (token) {
                console.log('--- DATA ---');
                console.log('Indice:', data.analise?.indiceGeralBemEstar);
                console.log('Status:', data.analise?.situacaoPsicossocial?.status);
            } else {
                return data.token;
            }
        } else {
            console.log(`❌ FAILED connecting to ${url}: ${res.status}`);
        }
    } catch (e: any) {
        console.log(`❌ ERROR connecting to ${url}: ${e.cause ? e.cause.code : e.message}`);
    }
    return null;
}

async function verify() {
    const ports = [3001, 10000, 5000];
    const hosts = ['127.0.0.1', '[::1]'];

    let token = null;

    // 1. Try to login on any port
    for (const port of ports) {
        for (const host of hosts) {
            const url = `http://${host}:${port}`;
            const t = await tryFetch(url, null);
            if (t) {
                token = t;
                console.log('🔑 Token obtained!');
                // Once token obtained, try to get data from that SAME host/port
                await tryFetch(url, token);
                return;
            }
        }
    }

    if (!token) {
        console.error('❌ Could not login on any candidate port (3001, 10000, 5000) with IPv4 or IPv6.');
    }
}

verify();
