import React from 'react';
import { useAuth } from '../../hooks/AuthContext';
import { Loader2 } from 'lucide-react';
import LandingPage from '../../pages/LandingPage';
import ModuleSelection from '../../pages/ModuleSelection';

/**
 * Componente que gerencia a rota raiz (/) baseada no status de autenticação
 * - Se não autenticado: mostra LandingPage
 * - Se autenticado: mostra ModuleSelection
 */
const HomeRoute: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  console.log('🏠 HomeRoute: Estado atual:', {
    isAuthenticated,
    isLoading,
    user: user?.email || 'NENHUM',
    userRole: user?.role || 'NENHUM',
    currentPath: window.location.pathname
  });

  // Aguardar o carregamento inicial
  if (isLoading) {
    console.log('⏳ HomeRoute: Ainda carregando...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Se não autenticado, mostrar landing page
  if (!isAuthenticated || !user) {
    console.log('🌟 HomeRoute: Usuário não autenticado, mostrando LandingPage');
    return <LandingPage />;
  }

  // Se autenticado, mostrar seleção de módulos
  console.log('✅ HomeRoute: Usuário autenticado, mostrando ModuleSelection');
  return <ModuleSelection />;
};

export default HomeRoute;