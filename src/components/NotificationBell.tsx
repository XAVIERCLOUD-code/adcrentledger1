import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, AlertTriangle, FileCheck2, Banknote, CalendarClock, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppStore } from "@/data/useAppStore";
import { getRequirements } from "@/data/store";
import { cn } from "@/lib/utils";

interface NotificationAlert {
    id: string;
    title: string;
    description: string;
    type: "compliance" | "rent" | "escalation";
    link: string;
    date?: string;
}

interface NotificationBellProps {
    onNavigate?: () => void;
}

export function NotificationBell({ onNavigate }: NotificationBellProps = {}) {
    const { tenants, bills } = useAppStore();
    const requirements = getRequirements();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const alerts = useMemo(() => {
        // ... preserving lines 24-84
        const newAlerts: NotificationAlert[] = [];
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonthString = `${currentYear}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;

        // 1. Compliance Alerts
        const expiringReqs = requirements.filter(r => r.status === "Expiring Soon" || r.status === "Expired");
        expiringReqs.forEach(req => {
            newAlerts.push({
                id: `comp-${req.id}`,
                title: `${req.name} ${req.status === "Expired" ? "Expired" : "Expiring"}`,
                description: `Building requirement needs renewal.`,
                type: "compliance",
                link: "/compliance",
                date: req.expiryDate
            });
        });

        // 2. Unpaid Rent Alerts (Current Month)
        const currentMonthBills = bills.filter(b => b.month === currentMonthString);
        const unpaidBills = currentMonthBills.filter(b => !b.isPaid);
        unpaidBills.forEach(bill => {
            const tenant = tenants.find(t => t.id === bill.tenantId);
            if (tenant) {
                newAlerts.push({
                    id: `rent-${bill.id}`,
                    title: `Unpaid Rent: ${tenant.name}`,
                    description: `₱${bill.totalBill?.toLocaleString()} due for ${currentMonthString}`,
                    type: "rent",
                    link: "/",
                });
            }
        });

        // 3. Rent Escalation Alerts
        tenants.forEach(tenant => {
            if (!tenant.leaseStart || !tenant.escalationDetails || tenant.escalationDetails.toLowerCase() === "none") return;

            const leaseStart = new Date(tenant.leaseStart);
            const yearsActive = currentYear - leaseStart.getFullYear();

            if (yearsActive >= 3) {
                const anniversaryDate = new Date(currentYear, leaseStart.getMonth(), leaseStart.getDate());
                const diffTime = anniversaryDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Trigger alert 30 days BEFORE the anniversary
                if (diffDays >= 0 && diffDays <= 30) {
                    newAlerts.push({
                        id: `esc-${tenant.id}`,
                        title: `Upcoming Rent Escalation`,
                        description: `${tenant.name} anniversary on ${anniversaryDate.toLocaleDateString()}`,
                        type: "escalation",
                        link: "/"
                    });
                }
            }
        });

        return newAlerts;
    }, [tenants, bills, requirements]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="relative p-2 rounded-full hover:bg-muted transition-colors border border-transparent hover:border-border">
                    <Bell className="h-5 w-5 text-foreground/80" />
                    {alerts.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-destructive ring-2 ring-background">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0 mr-4 mt-2 sm:mr-0 rounded-xl overflow-hidden glass-panel border border-border/50 shadow-2xl shadow-primary/5"
                align="end"
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/20">
                    <h3 className="font-semibold flex items-center gap-2">
                        Notifications
                        <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                            {alerts.length}
                        </span>
                    </h3>
                </div>

                <div className="max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col">
                    {alerts.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground/50">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm font-medium">All caught up!</p>
                            <p className="text-xs">No active alerts at the moment.</p>
                        </div>
                    ) : (
                        alerts.map((alert) => (
                            <button
                                key={alert.id}
                                onClick={() => {
                                    setOpen(false);
                                    if (onNavigate) onNavigate(); // Close mobile sidebar if applicable
                                    navigate(alert.link);
                                }}
                                className="flex text-left gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/10 last:border-0 group w-full"
                            >
                                <div className={cn(
                                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                                    alert.type === "compliance" ? "bg-warning/10 text-warning border-warning/20" :
                                        alert.type === "rent" ? "bg-destructive/10 text-destructive border-destructive/20" :
                                            "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                )}>
                                    {alert.type === "compliance" && <FileCheck2 className="h-4 w-4" />}
                                    {alert.type === "rent" && <Banknote className="h-4 w-4" />}
                                    {alert.type === "escalation" && <CalendarClock className="h-4 w-4" />}
                                </div>
                                <div className="space-y-1 overflow-hidden">
                                    <p className="text-sm font-medium leading-none text-foreground group-hover:text-primary transition-colors truncate">
                                        {alert.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {alert.description}
                                    </p>
                                    {alert.date && (
                                        <p className="text-[10px] font-mono text-muted-foreground/70 pt-1">
                                            Due: {alert.date}
                                        </p>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
                {alerts.length > 0 && (
                    <div className="p-2 border-t border-border/50 bg-muted/10">
                        <button
                            className="w-full text-center text-xs text-muted-foreground hover:text-foreground font-medium py-1.5 transition-colors"
                            onClick={() => setOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
