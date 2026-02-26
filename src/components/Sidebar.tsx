import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileCheck2, CalendarDays, LogOut, User, Users, Wallet } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import { NotificationBell } from "./NotificationBell";
import { useAppStore } from "@/data/useAppStore";

interface SidebarContentProps {
    onNavigate?: () => void;
}

export const SidebarContent = ({ onNavigate }: SidebarContentProps) => {
    const location = useLocation();
    const { requirements, user, logout } = useAppStore();

    const handleLogout = () => {
        logout();
    };

    // Calculate if there are any urgent requirements (Expiring Soon or Expired)
    const notificationCount = requirements.filter(
        (r) => r.status === "Expiring Soon" || r.status === "Expired"
    ).length;

    const links = [
        {
            name: "Dashboard",
            href: "/",
            icon: LayoutDashboard,
        },
        {
            name: "Compliance",
            href: "/compliance",
            icon: FileCheck2,
            notification: notificationCount > 0,
        },
        {
            name: "Building Staff",
            href: "/staff",
            icon: Users,
        },
        {
            name: "Calendar",
            href: "/calendar",
            icon: CalendarDays,
        },
        {
            name: "Finance",
            href: "/finance",
            icon: Wallet,
        },
    ];

    return (
        <div className="flex h-full flex-col">
            <div className="flex h-20 items-center gap-3 border-b border-border/50 px-6 glass-card-header shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 overflow-hidden shrink-0">
                    <img src="/favicon.ico" alt="ADC Logo" className="h-full w-full object-cover" />
                </div>
                <div className="overflow-hidden">
                    <h1 className="text-sm font-bold tracking-tight text-foreground truncate">ADC Building</h1>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground truncate">Admin Portal</p>
                </div>
            </div>

            <nav className="space-y-1.5 p-4 mt-2 flex-1 overflow-y-auto custom-scrollbar">
                {links.map((link) => {
                    const isActive = location.pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            to={link.href}
                            onClick={onNavigate}
                            className={cn(
                                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <link.icon className={cn("h-4 w-4 transition-colors shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                            <span className="flex-1 truncate">{link.name}</span>
                            {link.notification && (
                                <span className="flex h-2 w-2 rounded-full bg-destructive shadow-sm animate-pulse ring-2 ring-background shrink-0" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 space-y-4 border-t border-border/50 bg-muted/10 shrink-0">
                {/* User Info & Toggles */}
                <div className="flex items-center gap-2">
                    <div className="group flex flex-1 items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-2 shadow-inner hover:bg-muted/50 transition-colors">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background border border-border shrink-0">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold truncate text-foreground">{user?.name || "User"}</p>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground truncate">{user?.role || "Guest"}</p>
                        </div>
                    </div>

                    <NotificationBell onNavigate={onNavigate} />
                    <ModeToggle />
                </div>

                <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 border border-transparent"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                </button>

                <p className="text-[10px] text-center text-muted-foreground/40 font-mono tracking-widest pt-2">
                    {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
            </div>
        </div>
    );
};

export const Sidebar = () => {
    return (
        <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-border/50 bg-card/95 backdrop-blur-xl z-50 shadow-2xl shadow-primary/5">
            <SidebarContent />
        </aside>
    );
};

export default Sidebar;
