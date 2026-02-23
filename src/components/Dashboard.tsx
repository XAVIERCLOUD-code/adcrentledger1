import { useState, useMemo, useCallback, useEffect } from "react";
import { getTenants, getBills, removeTenant, getCurrentUser } from "@/data/store";
import { useAppStore } from "@/data/useAppStore";
import { Tenant, BillRecord } from "@/data/types";
import TenantCard from "./TenantCard";
import TenantProfile from "./TenantProfile";
import SummaryChart from "./SummaryChart";
import DashboardMetrics from "./DashboardMetrics";
import DashboardFilters from "./DashboardFilters";
import { getRequirements } from "@/data/store";
import AddTenantForm from "./AddTenantForm";
import { Button } from "@/components/ui/button";
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
import { Building2, Download, Users, Banknote, AlertTriangle, UserPlus, Trash2, ArrowUpRight, Filter, Loader2 } from "lucide-react";
import { exportToCSV } from "@/utils/export";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const floorOptions = [0, 1, 2, 3] as const;
const floorLabels: Record<number, string> = { 0: "All Floors", 1: "1st Floor", 2: "2nd Floor", 3: "3rd Floor" };

const Dashboard = () => {
  const { tenants, bills, isLoading, fetchData, removeTenant: storeRemoveTenant } = useAppStore();
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [floorFilter, setFloorFilter] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [tenantToRemove, setTenantToRemove] = useState<Tenant | null>(null);

  // Year Filter State
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  // Month Filter State
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const user = getCurrentUser();
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
    await storeRemoveTenant(tenantToRemove.id);
    toast({ title: "Tenant removed", description: `${tenantToRemove.name} and all their billing records have been removed.` });
    setTenantToRemove(null);
  };

  if (isLoading && tenants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground animate-fade-in space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
        <p className="font-medium animate-pulse">Syncing data...</p>
      </div>
    );
  }

  if (selectedTenant) {
    return (
      <TenantProfile
        tenant={selectedTenant}
        onBack={() => { setSelectedTenant(null); fetchData(); }}
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
        const expiringReqs = getRequirements().filter(
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

      {/* Add Tenant Form */}
      {showAddForm && (
        <AddTenantForm
          onAdded={() => { refresh(); setShowAddForm(false); }}
          onClose={() => setShowAddForm(false)}
        />
      )}

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
