import { BuildingRequirement } from "@/data/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, FileText, XCircle, UploadCloud, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComplianceWidgetProps {
    requirements: BuildingRequirement[];
    onRenew?: (id: string, validityYears: number) => void;
    onToggle?: (id: string) => void;
    onRemoveDocument?: (id: string, documentUrl: string) => void;
}

export const ComplianceWidget = ({ requirements, onRenew, onToggle, onRemoveDocument }: ComplianceWidgetProps) => {
    const getDaysRemaining = (expiryDate: string) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

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
                {requirements.map((req) => {
                    const daysRemaining = getDaysRemaining(req.expiryDate);
                    const validityDays = req.validityYears * 365;
                    const percentage = Math.max(0, Math.min(100, (daysRemaining / validityDays) * 100));

                    const pBarColor = daysRemaining < 0 || daysRemaining <= 14 ? "bg-destructive" : daysRemaining <= 60 ? "bg-warning" : "bg-paid";
                    const daysText = daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`;

                    return (
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
                                    <div className="space-y-2 w-full max-w-[200px] md:max-w-xs">
                                        <p className="font-medium leading-none text-foreground">{req.name}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>Exp: <span className="font-mono font-medium text-foreground">{req.expiryDate}</span></span>
                                            <span>·</span>
                                            <span>Valid: {req.validityYears} yrs</span>
                                        </div>

                                        {/* Risk Timeline Progress Bar */}
                                        {req.status !== "Inactive" && (
                                            <div className="mt-1 flex flex-col gap-1 w-full max-w-[200px]">
                                                <div className="flex justify-between items-center text-[10px] font-medium">
                                                    <span className={req.status === "Expired" || daysRemaining <= 14 ? "text-destructive" : daysRemaining <= 60 ? "text-warning" : "text-muted-foreground"}>
                                                        {daysText}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
                                                    <div
                                                        className={cn("h-full transition-all duration-500", pBarColor)}
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
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

                                {/* Document Actions */}
                                {req.documentUrl && (
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={req.documentUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline bg-primary/10 px-2 py-1 rounded-md"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <FileText className="h-3 w-3" />
                                            View Doc
                                        </a>
                                        {onRemoveDocument && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRemoveDocument(req.id, req.documentUrl!);
                                                }}
                                                className="text-muted-foreground hover:text-destructive p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                                                title="Remove Document"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
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

                            {/* Renewal / Upload Action - Show if expiring/expired OR if active but missing document */}
                            {onRenew && (req.status === "Expiring Soon" || req.status === "Expired" || (req.status === "Active" && !req.documentUrl)) && (
                                <div className="mt-2 flex justify-end">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRenew(req.id, req.validityYears);
                                        }}
                                        className="flex items-center gap-1 text-xs font-semibold text-primary/80 hover:text-primary transition-colors bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-md"
                                    >
                                        <UploadCloud className="h-3.5 w-3.5" />
                                        {req.status === "Active" && !req.documentUrl ? "Upload Document" : `Renew License (+${req.validityYears} yrs)`}
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default ComplianceWidget;
