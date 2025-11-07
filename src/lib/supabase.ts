// NOTA: Supabase desabilitado - usando API local PostgreSQL

// Criação de um cliente mock para evitar erros em código legado
export const supabase = {
  from: () => ({
    select: () => ({ data: null, error: new Error('Supabase desabilitado - use a API local') }),
    insert: () => ({ data: null, error: new Error('Supabase desabilitado - use a API local') }),
    update: () => ({ data: null, error: new Error('Supabase desabilitado - use a API local') }),
    delete: () => ({ data: null, error: new Error('Supabase desabilitado - use a API local') }),
  }),
  auth: {
    signIn: () => Promise.resolve({ data: null, error: new Error('Supabase desabilitado - use a API local') }),
    signOut: () => Promise.resolve({ error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
  },
};

// Função utilitária para retry com backoff exponencial
export const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        console.error(`❌ [RETRY] Falha após ${maxRetries + 1} tentativas:`, lastError);
        throw lastError;
      }
      
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      console.warn(`⚠️ [RETRY] Tentativa ${attempt + 1} falhou, tentando novamente em ${delay}ms:`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// Função para verificar conexão (desabilitada)
export const testConnection = async () => {
  return { success: false, message: 'Supabase desabilitado - usando API local PostgreSQL' };
};
