import { BuildingRequirement } from "@/data/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, FileText, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComplianceWidgetProps {
    requirements: BuildingRequirement[];
    onRenew?: (id: string, validityYears: number) => void;
    onToggle?: (id: string) => void;
}

export const ComplianceWidget = ({ requirements, onRenew, onToggle }: ComplianceWidgetProps) => {
    return (
        <div className="rounded-xl border border-border bg-card p-5 animate-fade-in shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-semibold text-card-foreground">
                    <FileText className="h-5 w-5 text-primary" />
                    Building Requirements
                </h3>
                <span className="text-xs text-muted-foreground">{requirements.length} item(s)</span>
            </div>

            <div className="space-y-3">
                {requirements.map((req) => (
                    <div
                        key={req.id}
                        className={cn(
                            "flex flex-col gap-2 rounded-lg border p-3 transition-colors",
                            req.status === "Active"
                                ? "border-border bg-card hover:bg-accent/50"
                                : req.status === "Expiring Soon"
                                    ? "border-warning/50 bg-warning/10 hover:bg-warning/20"
                                    : req.status === "Inactive"
                                        ? "border-dashed border-muted-foreground/30 bg-muted/20"
                                        : "border-destructive/50 bg-destructive/10 hover:bg-destructive/20"
                        )}
                    >
                        <div className="flex items-start justify-between w-full">
                            <div className="flex gap-3">
                                <div
                                    className={cn(
                                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                                        req.status === "Active"
                                            ? "border-paid/30 bg-paid/10 text-paid"
                                            : req.status === "Expiring Soon"
                                                ? "border-warning/30 bg-warning/10 text-warning"
                                                : "border-destructive/30 bg-destructive/10 text-destructive"
                                    )}
                                >
                                    {req.status === "Active" && <CheckCircle2 className="h-4 w-4" />}
                                    {req.status === "Expiring Soon" && <AlertTriangle className="h-4 w-4" />}
                                    {req.status === "Expired" && <XCircle className="h-4 w-4" />}
                                    {req.status === "Inactive" && <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />}
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium leading-none text-foreground">{req.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>Exp: <span className="font-mono font-medium text-foreground">{req.expiryDate}</span></span>
                                        <span>·</span>
                                        <span>Valid: {req.validityYears} yrs</span>
                                    </div>
                                </div>
                            </div>

                            <span
                                className={cn(
                                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                                    req.status === "Active"
                                        ? "bg-paid/15 text-paid"
                                        : req.status === "Expiring Soon"
                                            ? "bg-warning/15 text-warning animate-pulse"
                                            : "bg-destructive/15 text-destructive"
                                )}
                            >
                                {req.status}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Activation Date (if Active) */}
                            {req.status === "Active" && req.activationDate && (
                                <div className="text-xs text-muted-foreground font-mono">
                                    Activated: {req.activationDate}
                                </div>
                            )}

                            {/* Status Toggle */}
                            {onToggle && (
                                <Button
                                    variant={req.status === "Inactive" ? "outline" : "ghost"}
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation(); // prevent card click if any
                                        onToggle(req.id);
                                    }}
                                    className={cn(
                                        "h-7 text-xs font-medium z-10 relative",
                                        req.status === "Inactive"
                                            ? "border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40"
                                            : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    )}
                                >
                                    {req.status === "Inactive" ? "Activate" : "Deactivate"}
                                </Button>
                            )}
                        </div>

                        {/* Renewal Action - Only show if renewable and callback provided */}
                        {(req.status === "Expiring Soon" || req.status === "Expired") && onRenew && (
                            <div className="mt-2 flex justify-end">
                                <button
                                    onClick={() => onRenew(req.id, req.validityYears)}
                                    className="text-xs font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
                                >
                                    Renew License (+{req.validityYears} yrs)
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ComplianceWidget;
