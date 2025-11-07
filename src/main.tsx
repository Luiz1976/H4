import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🔍 [MAIN] Iniciando aplicação React');
console.log('🔍 [MAIN] Procurando elemento root...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ [MAIN] Elemento root não encontrado!');
  throw new Error('Elemento root não encontrado');
}

console.log('🔍 [MAIN] Elemento root encontrado:', rootElement);
console.log('🔍 [MAIN] Criando root React...');

try {
  const root = createRoot(rootElement);
  console.log('🔍 [MAIN] Root criado com sucesso, renderizando App...');
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  
  console.log('✅ [MAIN] App renderizado com sucesso');
} catch (error) {
  console.error('❌ [MAIN] Erro ao renderizar App:', error);
  throw error;
}
