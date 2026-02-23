import { cn } from "@/lib/utils";
import { BillRecord } from "@/data/types";
import { Home, Droplets, Zap } from "lucide-react";

interface StatusBadgeProps {
  isPaid: boolean;
  isPartial?: boolean;
  className?: string;
  animated?: boolean;
  label?: string;
}

export const StatusBadge = ({ isPaid, isPartial, className, animated = false, label }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase transition-all duration-300",
        isPaid
          ? "status-paid"
          : isPartial
            ? "bg-warning/15 text-warning border border-warning/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]"
            : "status-unpaid",
        animated && isPaid && "animate-pulse-glow",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isPaid
            ? "bg-paid-foreground"
            : isPartial
              ? "bg-warning"
              : "bg-unpaid-foreground"
        )}
      />
      {label ?? (isPaid ? "Paid" : isPartial ? "Partial" : "Unpaid")}
    </span>
  );
};

export const BillTypeIndicators = ({ bill }: { bill: BillRecord }) => {
  // If no breakdown exists, assume it's just Rent
  const hasBreakdown = bill.electricBill || bill.waterBill || (bill.rent && bill.rent !== bill.totalBill);

  if (!hasBreakdown) {
    return (
      <div className="flex items-center gap-1" title="Rent Only">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
          <Home className="h-3 w-3" />
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {(bill.rent || 0) > 0 && (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500" title={`Rent: ₱${bill.rent?.toLocaleString()}`}>
          <Home className="h-3 w-3" />
        </div>
      )}
      {(bill.electricBill || 0) > 0 && (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-amber-500" title={`Electric: ₱${bill.electricBill?.toLocaleString()}`}>
          <Zap className="h-3 w-3" />
        </div>
      )}
      {(bill.waterBill || 0) > 0 && (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500" title={`Water: ₱${bill.waterBill?.toLocaleString()}`}>
          <Droplets className="h-3 w-3" />
        </div>
      )}
    </div>
  );
};

export default StatusBadge;
