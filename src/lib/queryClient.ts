import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Dados sempre considerados desatualizados
      refetchOnWindowFocus: true, // Recarregar ao focar na janela
      refetchOnMount: true, // Recarregar ao montar o componente
      retry: 1,
      queryFn: async ({ queryKey }) => {
        // Usar a primeira chave como endpoint
        const endpoint = queryKey[0] as string;
        return await apiRequest(endpoint);
      },
    },
  },
});

// Função helper para fazer requisições autenticadas
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('authToken');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.statusText}`);
  }

  return response.json();
}
