import logoTransparentImage from '@/assets/logo-transparent.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

// Tamanhos ajustados para o logo HQ com fundo transparente
const sizeClasses = {
  sm: 'h-8 w-auto',     // Pequeno - sidebars, headers compactos
  md: 'h-12 w-auto',    // Médio - headers padrão
  lg: 'h-16 w-auto',    // Grande - páginas de destaque
  xl: 'h-24 w-auto',    // Extra grande - landing pages, relatórios
};

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`} data-testid="logo-humaniq">
      <img 
        src={logoTransparentImage} 
        alt="HumaniQ AI - Plataforma de Avaliação Psicossocial" 
        className={`${sizeClasses[size]} object-contain`}
        data-testid="img-logo"
      />
    </div>
  );
}
