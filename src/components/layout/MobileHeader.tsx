import { Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Logo from "@/components/Logo";

interface MobileHeaderProps {
  title?: string;
  showLogo?: boolean;
}

export function MobileHeader({ title, showLogo = true }: MobileHeaderProps) {
  return (
    <header className="md:hidden sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        <SidebarTrigger 
          className="h-10 w-10" 
          data-testid="button-mobile-menu"
        >
          <Menu className="h-6 w-6" />
        </SidebarTrigger>
        
        {showLogo && (
          <div className="flex-1 flex items-center justify-center">
            <Logo size="sm" showText={true} />
          </div>
        )}
        
        {title && !showLogo && (
          <h1 className="flex-1 text-lg font-semibold">{title}</h1>
        )}
        
        <div className="w-10" />
      </div>
    </header>
  );
}
