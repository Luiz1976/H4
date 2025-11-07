import { useEffect } from 'react';
import { resultadosService } from '@/lib/database';
import { sessionService } from '@/lib/services/session-service';

export function TestResultVerification() {
  console.log('🔍 [TEST-VERIFICATION] TestResultVerification component loaded!');
  
  useEffect(() => {
    console.log('🔍 [TEST-VERIFICATION] Componente TestResultVerification executando');
    
    const verificarResultado = async () => {
      console.log('🔍 [TEST-VERIFICATION] Iniciando verificação do resultado específico');
      
      // Primeiro, vamos verificar se o resultado específico existe
      const resultadoEspecifico = '965efe18-a576-4964-8770-31c58e978d21';
      console.log('🔍 [TEST-VERIFICATION] Verificando resultado ID:', resultadoEspecifico);
      
      // Obter session ID atual
      const sessionId = sessionService.getSessionId();
      console.log('🔍 [TEST-VERIFICATION] Session ID atual obtido:', sessionId);
      
      try {
        console.log('🔍 [TEST-VERIFICATION] Chamando database.verificarResultadoPorId...');
        const verificacao = await resultadosService.verificarResultadoPorId(resultadoEspecifico);
        console.log('🔍 [TEST-VERIFICATION] Resultado da verificação:', verificacao);
        
        if (verificacao.existe) {
          console.log('✅ [TEST-VERIFICATION] Resultado encontrado!');
          console.log('🔍 [TEST-VERIFICATION] Session ID do resultado:', verificacao.sessionId);
          console.log('🔍 [TEST-VERIFICATION] Session ID atual:', sessionId);
          
          if (verificacao.sessionId === sessionId) {
            console.log('✅ [TEST-VERIFICATION] Session IDs coincidem - resultado deveria aparecer');
          } else {
            console.log('❌ [TEST-VERIFICATION] Session IDs diferentes - resultado não aparecerá');
            console.log('🔍 [TEST-VERIFICATION] Esperado:', sessionId);
            console.log('🔍 [TEST-VERIFICATION] Encontrado:', verificacao.sessionId);
          }
        } else {
          console.log('❌ [TEST-VERIFICATION] Resultado não encontrado no banco de dados');
        }
      } catch (error) {
        console.error('❌ [TEST-VERIFICATION] Erro ao verificar resultado:', error);
      }
    };

    // Aguardar 3 segundos para garantir que a página carregou
    console.log('🔍 [TEST-VERIFICATION] Aguardando 3 segundos antes de executar verificação...');
    setTimeout(() => {
      console.log('🔍 [TEST-VERIFICATION] Timeout concluído, executando verificação...');
      verificarResultado();
    }, 3000);
  }, []);

  return (
    <div style={{ display: 'none' }}>
      {/* Componente de debug invisível */}
    </div>
  );
}