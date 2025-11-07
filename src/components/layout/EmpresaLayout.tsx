import { SidebarProvider } from "@/components/ui/sidebar";
import { EmpresaSidebar } from "./EmpresaSidebar";
import { MobileHeader } from "./MobileHeader";

interface EmpresaLayoutProps {
  children: React.ReactNode;
}

export function EmpresaLayout({ children }: EmpresaLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <EmpresaSidebar />
        <main className="flex-1 flex flex-col">
          <MobileHeader />
          <div className="flex-1 p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default EmpresaLayout;