import { Outlet, useLocation } from "react-router-dom";
import Sidebar, { SidebarContent } from "./Sidebar";
import { useState, useEffect } from "react";
import { useAppStore } from "@/data/useAppStore";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Layout = () => {
    const [open, setOpen] = useState(false);
    const { requirements } = useAppStore();

    useEffect(() => {
        // Check for expiring compliance items
        const timer = setTimeout(() => {
            const expiring = requirements.filter(r => r.status === "Expiring Soon" || r.status === "Expired");

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
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Mobile Sidebar & Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
                        <img src="/favicon.ico" alt="ADC Logo" className="h-full w-full object-cover" />
                    </div>
                    <span className="font-bold text-sm tracking-tight text-foreground">ADC Building</span>
                </div>

                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <button className="p-2 rounded-md hover:bg-muted transition-colors">
                            <Menu className="h-5 w-5 text-foreground/80" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r border-border/50 w-72 glass-panel">
                        <SidebarContent onNavigate={() => setOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>

            <main className="md:pl-64 transition-all duration-300 relative">
                <div className="mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-8 overflow-hidden min-h-screen">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="h-full w-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default Layout;
