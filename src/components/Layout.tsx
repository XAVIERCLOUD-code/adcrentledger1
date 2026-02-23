import { Outlet } from "react-router-dom";
import Sidebar, { SidebarContent } from "./Sidebar";
import { useEffect, useState } from "react";
import { getRequirements } from "@/data/store";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export const Layout = () => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Check for expiring compliance items
        const timer = setTimeout(() => {
            const reqs = getRequirements();
            const expiring = reqs.filter(r => r.status === "Expiring Soon" || r.status === "Expired");

            if (expiring.length > 0) {
                toast.warning("Compliance Alert", {
                    description: `You have ${expiring.length} compliance item(s) that are expiring soon or expired.`,
                    action: {
                        label: "View",
                        onClick: () => window.location.href = "/compliance"
                    },
                    duration: Infinity,
                    cancel: {
                        label: "Dismiss",
                        onClick: () => { }
                    }
                });
            } else {
                // For testing purposes: Show a success toast so user knows check ran
                // toast.success("Compliance Check Complete", {
                //   description: "No expiring items found. All systems operational.",
                //   duration: 3000,
                // });
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Mobile Sidebar & Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
                        <img src="/favicon.ico" alt="ADC Logo" className="h-full w-full object-cover" />
                    </div>
                    <span className="font-bold text-sm">ADC Building</span>
                </div>

                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <button className="p-2 rounded-md hover:bg-muted transition-colors">
                            <Menu className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r border-border/50 w-72">
                        <SidebarContent onNavigate={() => setOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>

            <main className="md:pl-64 transition-all duration-300">
                <div className="mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
