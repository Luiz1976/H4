// NOTA: Supabase desabilitado - usando API local PostgreSQL

// Cliente mock para evitar erros em código legado
export const supabaseAdmin = {
  from: () => ({
    select: () => ({ data: null, error: new Error('Supabase desabilitado - use a API local') }),
    insert: () => ({ data: null, error: new Error('Supabase desabilitado - use a API local') }),
    update: () => ({ data: null, error: new Error('Supabase desabilitado - use a API local') }),
    delete: () => ({ data: null, error: new Error('Supabase desabilitado - use a API local') }),
  }),
  auth: {
    admin: {
      createUser: () => Promise.resolve({ data: null, error: new Error('Supabase desabilitado') }),
      deleteUser: () => Promise.resolve({ data: null, error: null }),
    },
  },
};

export const isServiceRoleAvailable = (): boolean => {
  return false;
};

export const executeAdminOperation = async <T>(
  adminOperation: () => Promise<T>,
  fallbackOperation?: () => Promise<T>
): Promise<T> => {
  if (fallbackOperation) {
    return await fallbackOperation();
  }
  throw new Error('Operação administrativa não disponível - Supabase desabilitado');
};
