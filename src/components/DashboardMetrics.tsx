import { Users, Banknote, AlertTriangle } from "lucide-react";

interface DashboardMetricsProps {
    stats: {
        tenantCount: number;
        totalBilled: number;
        totalPaid: number;
        unpaidCount: number;
    };
    isViewer: boolean;
    selectedMonth: string;
    selectedYear: string;
}

const DashboardMetrics = ({ stats, isViewer, selectedMonth, selectedYear }: DashboardMetricsProps) => {
    const getMonthName = (monthStr: string) => {
        if (monthStr === 'all') return '';
        return new Date(2000, parseInt(monthStr) - 1).toLocaleString('default', { month: 'short' }) + ' ';
    };

    const periodLabel = `(${getMonthName(selectedMonth)}${selectedYear === 'all' ? 'All Time' : selectedYear})`;

    const metrics = [
        {
            label: "Total Tenants",
            value: stats.tenantCount,
            icon: Users,
            gradient: "from-blue-500/10 to-blue-500/5",
            text: "text-blue-600",
            border: "border-blue-200"
        },
        ...(!isViewer ? [{
            label: `Total Billed ${periodLabel}`,
            value: `₱${stats.totalBilled.toLocaleString()}`,
            icon: Banknote,
            gradient: "from-emerald-500/10 to-emerald-500/5",
            text: "text-emerald-600",
            border: "border-emerald-200"
        }] : []),
        {
            label: `Collected ${periodLabel}`,
            value: `₱${stats.totalPaid.toLocaleString()}`,
            icon: Banknote,
            gradient: "from-indigo-500/10 to-indigo-500/5",
            text: "text-indigo-600",
            border: "border-indigo-200"
        },
        {
            label: `Unpaid Bills ${periodLabel}`,
            value: stats.unpaidCount,
            icon: AlertTriangle,
            gradient: "from-rose-500/10 to-rose-500/5",
            text: "text-rose-600",
            border: "border-rose-200"
        },
    ];

    return (
        <div className={`grid gap-5 sm:grid-cols-2 ${!isViewer ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
            {metrics.map((stat) => (
                <div key={stat.label} className={`relative overflow-hidden rounded-xl border ${stat.border} dark:border-white/5 bg-gradient-soft p-6 shadow-sm card-hover group glass-panel`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500">
                        <stat.icon className={`h-24 w-24 ${stat.text} blur-[2px]`} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`p-2 rounded-lg bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-sm group-hover:glow-primary transition-all duration-300`}>
                                <stat.icon className={`h-4 w-4 ${stat.text}`} />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-400">{stat.label}</p>
                        </div>
                        <p className="text-3xl font-bold font-mono text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardMetrics;
