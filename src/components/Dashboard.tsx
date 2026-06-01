import { useState, useMemo } from "react";
import { useAppStore } from "@/data/useAppStore";
import { useTenants, useRemoveTenant, useUpdateTenant } from "@/data/queries/tenants";
import { useBills } from "@/data/queries/bills";
import { useRequirements } from "@/data/queries/requirements";
import { Tenant } from "@/data/types";
import TenantCard from "./TenantCard";
import TenantProfile from "./TenantProfile";
import SummaryChart from "./SummaryChart";
import DashboardMetrics from "./DashboardMetrics";
import DashboardFilters from "./DashboardFilters";
import AddTenantForm from "./AddTenantForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Building2, Download, Users, AlertTriangle, UserPlus, Trash2, ArrowUpRight, CalendarClock, TrendingUp, Sparkles } from "lucide-react";
import { exportToCSV } from "@/utils/export";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const floorOptions = [0, 1, 2, 3] as const;
const floorLabels: Record<number, string> = { 0: "All Floors", 1: "1st Floor", 2: "2nd Floor", 3: "3rd Floor" };

// Generic rent escalation calculation utility
function getNextEscalation(tenant: Tenant): { nextMonth: string; rate: number; suggestedRent: number; isDue: boolean } | null {
  if (!tenant.escalationRate || !tenant.rentGross) return null;

  const details = tenant.escalationDetails || "";
  const monthsMap: { [key: string]: string } = {
    january: "01", feb: "02", february: "02", mar: "03", march: "03", apr: "04", april: "04",
    may: "05", jun: "06", june: "06", jul: "07", july: "07", aug: "08", august: "08",
    sep: "09", september: "09", oct: "10", october: "10", nov: "11", november: "11", dec: "12", december: "12"
  };

  let year: number | null = null;
  let monthStr: string | null = null;

  // 1. Search for 4 digit year inside details (e.g. 2025, 2026)
  const yearMatch = details.match(/\b(202\d)\b/);
  if (yearMatch) {
    year = parseInt(yearMatch[1], 10);
  }

  // 2. Search for month name in details
  for (const mName of Object.keys(monthsMap)) {
    const regex = new RegExp(`\\b${mName}\\b`, "i");
    if (regex.test(details)) {
      monthStr = monthsMap[mName];
      break;
    }
  }

  // 3. Fallback to anniversary of lease start if no date found in details
  if (!year || !monthStr) {
    if (tenant.leaseStart) {
      const leaseStartDate = new Date(tenant.leaseStart);
      if (!isNaN(leaseStartDate.getTime())) {
        const today = new Date();
        const startMonth = leaseStartDate.getMonth(); // 0-indexed
        monthStr = String(startMonth + 1).padStart(2, "0");
        
        const currentMonthVal = today.getMonth() + 1;
        const targetMonthVal = startMonth + 1;
        
        if (currentMonthVal >= targetMonthVal) {
          year = today.getFullYear();
        } else {
          year = today.getFullYear() - 1;
        }
      }
    }
  }

  if (!year || !monthStr) return null;

  const nextMonth = `${year}-${monthStr}`;
  const today = new Date();
  const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM
  
  const isDue = currentMonth >= nextMonth;
  const rate = tenant.escalationRate;
  const suggestedRent = Math.round((tenant.rentGross * (1 + rate / 100)) * 100) / 100;

  return {
    nextMonth,
    rate,
    suggestedRent,
    isDue
  };
}

const Dashboard = () => {
  const { user } = useAppStore();
  const { data: tenants = [], isLoading: isTenantsLoading } = useTenants();
  const { data: bills = [], isLoading: isBillsLoading } = useBills();
  const { data: requirements = [], isLoading: isReqLoading } = useRequirements();
  const removeTenantMutation = useRemoveTenant();
  const updateTenantMutation = useUpdateTenant();

  const isLoading = isTenantsLoading || isBillsLoading || isReqLoading;

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [floorFilter, setFloorFilter] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [tenantToRemove, setTenantToRemove] = useState<Tenant | null>(null);

  // Year Filter State
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  // Month Filter State
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));

  const isViewer = user?.role === 'viewer';


  const filteredTenants = useMemo(
    () => (floorFilter === 0 ? tenants : tenants.filter((t) => t.floor === floorFilter)),
    [tenants, floorFilter]
  );

  // Year Filter Logic
  const uniqueYears = useMemo(() => {
    const years = new Set(bills.map((b) => b.month.split("-")[0]));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [bills]);

  const filteredBills = useMemo(() => {
    let filtered = bills;

    // Filter by Year
    if (selectedYear !== "all") {
      filtered = filtered.filter((b) => b.month.startsWith(selectedYear));
    }

    // Filter by Month
    if (selectedMonth !== "all") {
      // Month format in bill is YYYY-MM. selectedMonth is "01", "02", etc.
      filtered = filtered.filter((b) => b.month.endsWith(`-${selectedMonth}`));
    }

    return filtered;
  }, [bills, selectedYear, selectedMonth]);

  const stats = useMemo(() => {
    // Use filteredBills for stats
    const totalBilled = filteredBills.reduce((s, b) => s + (b.totalBill || 0), 0);
    const totalPaid = filteredBills.filter((b) => b.isPaid).reduce((s, b) => s + (b.totalBill || 0), 0);
    const unpaidCount = filteredBills.filter((b) => !b.isPaid).length;
    return { totalBilled, totalPaid, unpaidCount, tenantCount: tenants.length };
  }, [filteredBills, tenants]);

  const getLatestBill = (tenantId: string) =>
    bills.filter((b) => b.tenantId === tenantId).sort((a, b) => b.month.localeCompare(a.month))[0];

  const handleRemoveTenant = async () => {
    if (!tenantToRemove) return;
    await removeTenantMutation.mutateAsync(tenantToRemove.id);
    toast({ title: "Tenant removed", description: `${tenantToRemove.name} and all their billing records have been removed.` });
    setTenantToRemove(null);
  };

  const handleApplyEscalation = async (tenant: Tenant, suggestedRent: number) => {
    const rate = tenant.escalationRate || 5;
    const nextRentGross = suggestedRent;
    
    const vatPercent = tenant.vatPercent || 12;
    const ewtPercent = tenant.ewtPercent || 5;
    
    const rentNet = Math.round((nextRentGross / (1 + vatPercent / 100)) * 100) / 100;
    const vat = Math.round((rentNet * (vatPercent / 100)) * 100) / 100;
    const ewt = Math.round((rentNet * (ewtPercent / 100)) * 100) / 100;
    
    let nextEscalationDetails = tenant.escalationDetails || "";
    let escalationMonth = "";
    
    const escalationInfo = getNextEscalation(tenant);
    if (escalationInfo) {
      escalationMonth = escalationInfo.nextMonth;
    }
    
    const yearMatch = nextEscalationDetails.match(/\b(202\d)\b/);
    if (yearMatch) {
      const currentYearVal = parseInt(yearMatch[1], 10);
      nextEscalationDetails = nextEscalationDetails.replace(yearMatch[1], String(currentYearVal + 1));
    } else {
      nextEscalationDetails = `${rate}% starting March ${new Date().getFullYear() + 1}`;
    }
    
    const updatedTenant = {
      ...tenant,
      rentGross: nextRentGross,
      totalDue: nextRentGross,
      rentNet,
      vat,
      ewt,
      escalationDetails: nextEscalationDetails
    };

    try {
      // 1. Update Tenant Profile
      await updateTenantMutation.mutateAsync(updatedTenant);
      
      // 2. Retrospectively update any existing bills generated since the escalation month
      if (escalationMonth) {
        const { supabase } = await import("@/utils/supabaseClient");
        const { error: billsError } = await supabase
          .from('bills')
          .update({
            rent: nextRentGross,
            totalBill: nextRentGross
          })
          .eq('tenantId', tenant.id)
          .gte('month', escalationMonth);

        if (billsError) {
          console.error("Error updating retrospective bills:", billsError);
        }
      }
      
      toast({ 
        title: "Rent Escalated & Bills Corrected!", 
        description: `Rent for ${tenant.name} increased to ₱${nextRentGross.toLocaleString()} and past bills starting from ${escalationMonth} have been automatically corrected.` 
      });
    } catch (err: any) {
      toast({ 
        title: "Error Applying Escalation", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  if (isLoading && tenants.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in p-2 md:p-6 pb-20 w-full">
        {/* Skeleton Filters */}
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>

        {/* Skeleton Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>

        {/* Skeleton Cards Header */}
        <div className="flex justify-between items-center mb-6 mt-12">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-64 rounded-lg hidden md:block" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>

        {/* Skeleton Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (selectedTenant) {
    // Get the freshest version of the tenant from the store, fallback to local state if missing
    const activeTenant = tenants.find(t => t.id === selectedTenant.id) || selectedTenant;
    return (
      <TenantProfile
        tenant={activeTenant}
        onBack={() => { setSelectedTenant(null); }}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in p-2 md:p-6 pb-20">
      <DashboardFilters
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        uniqueYears={uniqueYears}
      />

      {/* Compliance Alert */}
      {(() => {
        const expiringReqs = requirements.filter(
          (r) => r.status === "Expiring Soon" || r.status === "Expired"
        );

        if (expiringReqs.length === 0) return null;

        return (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-warning-foreground shadow-sm flex items-start gap-4 hover:bg-warning/10 transition-colors">
            <div className="p-2 bg-warning/20 rounded-full shrink-0">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                Action Required
                <span className="text-xs font-medium bg-warning/20 px-2 py-0.5 rounded-full text-warning-foreground border border-warning/30">
                  {expiringReqs.length} item(s) expiring
                </span>
              </h3>
              <p className="text-sm opacity-90 max-w-2xl">
                The following compliance items require attention: {expiringReqs.map(r => r.name).join(", ")}.
              </p>
              <button
                onClick={() => window.location.href = '/compliance'}
                className="text-sm font-semibold text-warning hover:underline mt-2 flex items-center gap-1 group"
              >
                View Details <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* Escalation Alert */}
      {!isViewer && (() => {
        const escalatingTenants = tenants.map(t => {
          const escalation = getNextEscalation(t);
          return escalation && escalation.isDue ? { tenant: t, escalation } : null;
        }).filter(Boolean) as { tenant: Tenant; escalation: { nextMonth: string; rate: number; suggestedRent: number; isDue: boolean } }[];

        if (escalatingTenants.length === 0) return null;

        return (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-amber-400 shadow-sm flex items-start gap-4 hover:bg-amber-500/10 transition-colors animate-pulse-glow">
            <div className="p-2 bg-amber-500/20 rounded-full shrink-0">
              <CalendarClock className="h-5 w-5 text-amber-400" />
            </div>
            <div className="space-y-2 w-full">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-amber-300">
                🔔 Rent Escalation Due!
                <span className="text-xs font-medium bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-300 border border-amber-500/30">
                  {escalatingTenants.length} tenant(s)
                </span>
              </h3>
              <p className="text-sm opacity-90 text-muted-foreground">
                The following tenants are currently due or past due for their rent escalation. Recalculate their rents instantly:
              </p>
              <div className="grid gap-3 mt-3">
                {escalatingTenants.map(({ tenant: t, escalation: esc }) => {
                  const [yearStr, monthStr] = esc.nextMonth.split('-');
                  const monthsNames: { [key: string]: string } = {
                    "01": "January", "02": "February", "03": "March", "04": "April",
                    "05": "May", "06": "June", "07": "July", "08": "August",
                    "09": "September", "10": "October", "11": "November", "12": "December"
                  };
                  const monthName = monthsNames[monthStr] || monthStr;
                  const formattedMonth = `${monthName} ${yearStr}`;
                  return (
                    <div key={t.id} className="bg-background/40 backdrop-blur-sm p-4 rounded-xl border border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm hover:border-amber-500/30 transition-all duration-300">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-base">{t.name} <span className="text-muted-foreground font-normal text-sm">({t.unit})</span></span>
                        <span className="text-muted-foreground text-xs mt-0.5 flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                          Escalation of <span className="font-bold text-amber-400">{esc.rate}%</span> due: <span className="font-semibold text-foreground bg-muted/50 px-1.5 py-0.5 rounded">{formattedMonth}</span>
                        </span>
                        <span className="font-mono text-xs mt-1.5 text-muted-foreground">
                          Current Rent: ₱{t.rentGross.toLocaleString(undefined, { minimumFractionDigits: 2 })} → Suggested Rent: <span className="font-bold text-emerald-400">₱{esc.suggestedRent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedTenant(t)}
                          className="h-8 text-xs border-dashed flex-1 sm:flex-none"
                        >
                          View Profile
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleApplyEscalation(t, esc.suggestedRent)} 
                          className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold flex-1 sm:flex-none"
                          disabled={updateTenantMutation.isPending}
                        >
                          Apply {esc.rate}%
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Metrics */}
      <DashboardMetrics
        stats={stats}
        isViewer={isViewer}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      {/* Chart - Only for Admin */}
      {!isViewer && (
        <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden glass-panel">
          <div className="p-6 border-b border-border/50 glass-card-header flex items-center justify-between">
            <h3 className="font-semibold text-lg">Financial Overview</h3>
            {(selectedYear !== 'all' || selectedMonth !== 'all') && (
              <span className="text-sm font-medium text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                {selectedMonth !== 'all' ? new Date(2000, parseInt(selectedMonth) - 1).toLocaleString('default', { month: 'short' }) + ' ' : ''}
                {selectedYear === 'all' ? 'All Time' : selectedYear}
              </span>
            )}
          </div>
          <div className="p-6">
            <SummaryChart bills={filteredBills} />
          </div>
        </div>
      )}

      {/* Add Tenant Form Modal */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none w-[95vw] md:max-w-xl">
          <AddTenantForm
            onAdded={() => { setShowAddForm(false); }}
            onClose={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Tenant List Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Tenants</h2>
            <p className="text-sm text-muted-foreground">Manage occupancy and billing</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Control Floor Filter */}
          <div className="flex rounded-lg border border-border bg-muted/50 p-1 shadow-inner">
            {floorOptions.map((f) => (
              <button
                key={f}
                onClick={() => setFloorFilter(f)}
                className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${floorFilter === f
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
              >
                {floorLabels[f]}
              </button>
            ))}
          </div>

          <div className="h-8 w-px bg-border/50 mx-2 hidden md:block"></div>

          {!isViewer && (
            <Button
              className="btn-transition gap-2 shadow-lg shadow-primary/20"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Tenant</span>
            </Button>
          )}

          <Button
            variant="outline"
            className="btn-transition gap-2 bg-card hover:bg-muted"
            onClick={() => {
              const currentYear = new Date().getFullYear().toString();
              const currentYearBills = bills.filter(b => b.month.startsWith(currentYear));
              exportToCSV(currentYearBills, tenants);
            }}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Tenant Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTenants.map((tenant, i) => (
          <div key={tenant.id} className="group/card relative animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <TenantCard
              tenant={tenant}
              latestBill={getLatestBill(tenant.id)}
              onClick={() => setSelectedTenant(tenant)}
            />
            {!isViewer && (
              <button
                onClick={(e) => { e.stopPropagation(); setTenantToRemove(tenant); }}
                className="absolute right-3 top-3 rounded-md p-2 text-muted-foreground/50 opacity-0 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive group-hover/card:opacity-100 z-10"
                title="Remove tenant"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredTenants.length === 0 && (
        <div className="py-20 text-center rounded-xl border border-dashed border-border bg-muted/10">
          <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No tenants found for this filter.</p>
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!tenantToRemove} onOpenChange={(open) => !open && setTenantToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Tenant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-semibold text-foreground">{tenantToRemove?.name}</span> (Unit {tenantToRemove?.unit})? This will permanently delete all their billing records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveTenant} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
