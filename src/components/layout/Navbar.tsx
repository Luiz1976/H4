import { useState } from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import {
    LayoutDashboard,
    Linkedin,
    Radio,
    MessageSquare,
    Settings,
    Activity,
    Zap,
    FileText,
    Menu,
    X
} from "lucide-react";

interface NavbarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "blog", label: "Blog", icon: FileText },
    { id: "linkedin", label: "LinkedIn", icon: Linkedin },
    { id: "listener", label: "Escuta Ativa", icon: Radio },
    { id: "templates", label: "Templates", icon: MessageSquare },
    { id: "logs", label: "Logs", icon: Activity },
    { id: "settings", label: "Configurações", icon: Settings },
];

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-instagram flex items-center justify-center">
                            <Zap className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-bold text-lg gradient-instagram-text">HumaniQ</h1>
                            <p className="text-xs text-muted-foreground -mt-1">Pulse</p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                                    activeTab === item.id
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                <span>{item.label}</span>
                                {activeTab === item.id && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block">
                            <ModeToggle />
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-border bg-background">
                    <div className="px-4 py-4 space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onTabChange(item.id);
                                    setMobileMenuOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                                    activeTab === item.id
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                                {activeTab === item.id && (
                                    <div className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
                                )}
                            </button>
                        ))}
                        <div className="pt-4 border-t border-border">
                            <ModeToggle />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
