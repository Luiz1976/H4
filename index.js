// ================================================
// HUMANIQ AI - BACKEND ENTRY POINT (RENDER.COM)
// ================================================
// Arquivo principal para deploy no Render.com
// Importa e executa o servidor TypeScript
// ================================================

// Carregar variáveis de ambiente
require('dotenv').config();

// Configurar ts-node para executar TypeScript
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs'
  }
});

// Importar e executar o servidor
require('./server/index.ts');