import { Tenant, BillRecord } from "@/data/types";
import StatusBadge, { BillTypeIndicators } from "./StatusBadge";
import { User, MapPin } from "lucide-react";

interface TenantCardProps {
  tenant: Tenant;
  latestBill?: BillRecord;
  onClick: () => void;
}

const TenantCard = ({ tenant, latestBill, onClick }: TenantCardProps) => {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/60 dark:border-white/5 bg-card dark:bg-card/40 p-5 shadow-sm transition-all duration-300 hover:border-primary/50 dark:hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 glass-panel"
    >
      <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-primary/10 dark:from-primary/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 blur-2xl" />

      <div className="mb-4 flex items-start justify-between relative z-10">
        <div>
          <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
            {tenant.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <div className="flex h-5 items-center rounded bg-muted/50 dark:bg-black/30 px-1.5 py-0.5 border border-border/50 dark:border-white/5">
              <MapPin className="mr-1 h-3 w-3 text-primary/70" />
              Unit {tenant.unit}
            </div>
            <span className="opacity-50">•</span>
            <span>{tenant.floor === 0 ? "G/F" : `${tenant.floor}${tenant.floor === 1 ? 'st' : tenant.floor === 2 ? 'nd' : 'rd'} Flr`}</span>
          </div>
        </div>
        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-secondary/50 dark:bg-black/40 text-muted-foreground border border-border/50 dark:border-white/5 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all duration-300 group-hover:glow-primary z-10">
          <User className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between rounded-lg bg-muted/30 dark:bg-black/20 px-3 py-2 border border-border/50 dark:border-white/5">
          <span className="text-xs font-medium text-muted-foreground">Status</span>
          {latestBill ? (
            <StatusBadge isPaid={latestBill.isPaid} />
          ) : (
            <span className="text-xs text-muted-foreground font-mono bg-black/10 dark:bg-white/5 px-2 py-0.5 rounded border border-border/50 dark:border-white/10">No History</span>
          )}
        </div>

        <div className="flex items-center justify-between px-1 pt-1">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Latest Bill</span>
          <div className="text-right">
            <p className="font-mono text-lg font-bold text-foreground tracking-tight">
              ₱{latestBill?.totalBill ? latestBill.totalBill.toLocaleString() : "0.00"}
            </p>
            {latestBill && (
              <div className="flex justify-end mt-1">
                <BillTypeIndicators bill={latestBill} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantCard;
