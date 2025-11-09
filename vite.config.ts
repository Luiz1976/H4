/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Nota: "lovable-tagger" é ESM-only e pode causar erro quando carregado via require.
// Para evitar quebra no dev, carregamos opcionalmente via import dinâmico.

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  let taggerPlugin: any = null;
  if (mode === "development") {
    try {
      const mod = await import("lovable-tagger");
      if (mod && typeof mod.componentTagger === "function") {
        taggerPlugin = mod.componentTagger();
      }
    } catch (err) {
      console.warn("[vite] Plugin 'lovable-tagger' não pôde ser carregado:", err?.message || err);
    }
  }

  return ({
    server: {
      host: "0.0.0.0",
      port: 5000,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
        '/health': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react(), taggerPlugin].filter(Boolean),
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/lib/testes/setup.ts',
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  });
});
