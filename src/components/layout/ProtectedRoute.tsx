// src/components/layout/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'empresa' | 'colaborador';
  allowedRoles?: ('admin' | 'empresa' | 'colaborador')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  allowedRoles 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('🛡️ ProtectedRoute: Estado atual:', {
    isAuthenticated,
    isLoading,
    user: user?.email || 'NENHUM',
    userRole: user?.role || 'NENHUM',
    requiredRole,
    allowedRoles,
    currentPath: window.location.pathname
  });

  // Aguardar o carregamento inicial
  if (isLoading) {
    console.log('⏳ ProtectedRoute: Ainda carregando...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Verificar autenticação - só redirecionar se realmente não há usuário
  if (!isAuthenticated || !user) {
    console.log('❌ ProtectedRoute: Usuário não autenticado, redirecionando para /login');
    
    // Verificar uma última vez se há dados no localStorage antes de redirecionar
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      console.log('🔄 ProtectedRoute: Encontrado usuário no localStorage, aguardando re-inicialização...');
      // Dar mais uma chance para o AuthContext se atualizar
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    
    return <Navigate to="/login" replace />;
  }

  // Verificar role específico
  if (requiredRole && user.role !== requiredRole) {
    console.log('🚫 ProtectedRoute: Role não autorizado, redirecionando...');
    const redirectPath = getRedirectPath(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  // Verificar roles permitidos
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('🚫 ProtectedRoute: Role não está na lista permitida, redirecionando...');
    const redirectPath = getRedirectPath(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  console.log('✅ ProtectedRoute: Acesso autorizado');
  return <>{children}</>;
};

// Função auxiliar para determinar o redirecionamento baseado no role
const getRedirectPath = (role?: string): string => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'empresa':
      return '/empresa';
    case 'colaborador':
      return '/Colaborador';
    default:
      return '/login';
  }
};

export default ProtectedRoute;