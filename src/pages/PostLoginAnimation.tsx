import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';
import HumaniQLogoAnimation from '@/components/HumaniQLogoAnimation';

const PostLoginAnimation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Se não há usuário autenticado, redirecionar para login
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
  }, [user, navigate]);

  const handleAnimationComplete = () => {
    // Após a animação, redirecionar para a página apropriada baseada no papel do usuário
    if (user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        case 'empresa':
          navigate('/empresa', { replace: true });
          break;
        case 'colaborador':
          navigate('/colaborador', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
          break;
      }
    } else {
      navigate('/', { replace: true });
    }
  };

  // Se não há usuário, não renderizar nada (será redirecionado)
  if (!user) {
    return null;
  }

  return (
    <HumaniQLogoAnimation onComplete={handleAnimationComplete} />
  );
};

export default PostLoginAnimation;