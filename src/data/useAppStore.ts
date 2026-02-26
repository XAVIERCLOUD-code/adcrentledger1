import { create } from 'zustand';
import { Tenant, BillRecord, Staff, BuildingRequirement, CalendarEvent, CashTransaction, FinanceTotals } from './types';
import { supabase } from '../utils/supabaseClient';

interface AppState {
    tenants: Tenant[];
    bills: BillRecord[];
    staff: Staff[];
    requirements: BuildingRequirement[];
    events: CalendarEvent[];
    cashTransactions: CashTransaction[];
    isLoading: boolean;
    error: string | null;
    user: { id: string, name: string, role: string } | null;

    // Auth
    logout: () => void;

    // Computed
    financeTotals: FinanceTotals;
    financeTotalsOverride?: FinanceTotalsOverride;

    // Actions
    fetchData: () => Promise<void>;

    // Tenants & Bills
    addTenant: (tenant: Tenant) => Promise<void>;
    updateTenant: (tenant: Tenant) => Promise<void>;
    removeTenant: (id: string) => Promise<void>;
    toggleBillPaid: (billId: string) => Promise<void>;
    addBill: (bill: BillRecord) => Promise<void>;

    // Staff
    addStaff: (staff: Staff) => Promise<void>;
    updateStaff: (staff: Staff) => Promise<void>;
    removeStaff: (id: string) => Promise<void>;

    // Requirements
    addRequirement: (req: BuildingRequirement) => Promise<void>;
    updateRequirement: (req: BuildingRequirement) => Promise<void>;
    toggleRequirementStatus: (id: string) => Promise<void>;
    removeRequirement: (id: string) => Promise<void>;

    // Events
    addEvent: (event: CalendarEvent) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;

    // Misc
    checkAndGenerateMonthlyBills: () => Promise<void>;

    // Cash Transactions
    addCashTransaction: (transaction: CashTransaction) => Promise<void>;
    updateCashTransaction: (transaction: CashTransaction) => Promise<void>;
    deleteCashTransaction: (id: string) => Promise<void>;

    updateFinanceTotals: (totals: Partial<FinanceTotalsOverride>) => Promise<void>;
}

export interface FinanceTotalsOverride {
    id: string;
    cash_in_bank: number;
    total_receipts: number;
    total_disbursements: number;
    is_manual_override: boolean;
}

const calculateFinanceTotals = (transactions: CashTransaction[], override?: FinanceTotalsOverride): FinanceTotals => {
    if (override && override.is_manual_override) {
        return {
            cashInBank: override.cash_in_bank,
            totalReceipts: override.total_receipts,
            totalDisbursements: override.total_disbursements
        };
    }

    const receipts = transactions.filter(t => t.type === 'receipt').reduce((sum, t) => sum + Number(t.amount), 0);
    const disbursements = transactions.filter(t => t.type === 'disbursement').reduce((sum, t) => sum + Number(t.amount), 0);
    return {
        totalReceipts: receipts,
        totalDisbursements: disbursements,
        cashInBank: receipts - disbursements
    };
};

const getUserFromStorage = () => {
    try {
        const stored = localStorage.getItem('adc_user_v2');
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

export const useAppStore = create<AppState>((set, get) => ({
    tenants: [],
    bills: [],
    staff: [],
    requirements: [],
    events: [],
    cashTransactions: [],
    financeTotalsOverride: undefined,
    financeTotals: { cashInBank: 0, totalReceipts: 0, totalDisbursements: 0 },
    isLoading: true, // Start as true to show skeletons immediately on app load
    error: null,
    user: getUserFromStorage(), // Initialize from local storage

    logout: () => {
        localStorage.removeItem('adc_auth_token_v2');
        localStorage.removeItem('adc_user_v2');
        set({ user: null });
        window.location.href = '/login';
    },

    fetchData: async () => {
        // Only show hard loading state if we have no data yet (prevents skeleton flashing on navigation)
        const isInitialLoad = get().tenants.length === 0;
        if (isInitialLoad) {
            set({ isLoading: true, error: null });
        }

        try {
            const [
                tenantsRes,
                billsRes,
                staffRes,
                reqsRes,
                eventsRes,
                cashRes,
                financeTotalsRes
            ] = await Promise.all([
                supabase.from('tenants').select('*'),
                supabase.from('bills').select('*'),
                supabase.from('staff').select('*'),
                supabase.from('requirements').select('*'),
                supabase.from('events').select('*'),
                supabase.from('cash_transactions').select('*'),
                supabase.from('finance_totals').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle()
            ]);

            if (tenantsRes.error) throw tenantsRes.error;
            if (billsRes.error) throw billsRes.error;
            if (staffRes.error) throw staffRes.error;
            if (reqsRes.error) throw reqsRes.error;
            if (eventsRes.error) throw eventsRes.error;
            if (cashRes.error) throw cashRes.error;
            if (financeTotalsRes.error && financeTotalsRes.error.code !== 'PGRST116') {
                throw financeTotalsRes.error;
            }

            const cashTransactions = cashRes.data || [];

            // Add dynamic holidays to events (simulating the old logic but keeping it purely client-side generated over the DB events)
            const currentYear = new Date().getFullYear();
            const years = [currentYear - 1, currentYear, currentYear + 1];
            const defaultHolidays = [
                { title: "New Year's Day", date: "*-01-01", type: "holiday" },
                { title: "Chinese New Year", date: "2026-02-17", type: "holiday" },
                { title: "EDSA Revolution Anniversary", date: "*-02-25", type: "holiday" },
                { title: "Araw ng Kagitingan", date: "*-04-09", type: "holiday" },
                { title: "Maundy Thursday", date: "2026-04-02", type: "holiday" },
                { title: "Good Friday", date: "2026-04-03", type: "holiday" },
                { title: "Labor Day", date: "*-05-01", type: "holiday" },
                { title: "Independence Day", date: "*-06-12", type: "holiday" },
                { title: "National Heroes Day", date: "2026-08-31", type: "holiday" },
                { title: "Bonifacio Day", date: "*-11-30", type: "holiday" },
                { title: "Christmas Day", date: "*-12-25", type: "holiday" },
                { title: "Rizal Day", date: "*-12-30", type: "holiday" },
                { title: "New Year's Eve", date: "*-12-31", type: "holiday" }
            ];

            const formatDateLocal = (d: Date) => {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${day}`;
            };

            const dynamicEvents: any[] = [];
            years.forEach(year => {
                defaultHolidays.forEach((h, idx) => {
                    let date = h.date;
                    if (date.startsWith("*-")) date = `${year}${date.substring(1)}`;
                    dynamicEvents.push({ id: `holiday-${year}-${idx}`, title: h.title, date, type: 'holiday', description: 'Public Holiday' });
                });
                for (let month = 0; month < 12; month++) {
                    const fifteen = new Date(year, month, 15);
                    if (fifteen.getDay() === 0) fifteen.setDate(fifteen.getDate() - 1);
                    dynamicEvents.push({ id: `payroll-mid-${year}-${month}`, title: "Payroll", date: formatDateLocal(fifteen), type: 'payroll', description: 'Staff Salaries Release' });

                    const end = new Date(year, month + 1, 0);
                    if (end.getDay() === 0) end.setDate(end.getDate() - 1);
                    dynamicEvents.push({ id: `payroll-end-${year}-${month}`, title: "Payroll", date: formatDateLocal(end), type: 'payroll', description: 'Staff Salaries Release' });
                }
            });

            set({
                tenants: tenantsRes.data || [],
                bills: billsRes.data || [],
                staff: staffRes.data || [],
                requirements: reqsRes.data || [],
                events: [...(eventsRes.data || []), ...dynamicEvents],
                cashTransactions,
                financeTotalsOverride: financeTotalsRes.data || undefined,
                financeTotals: calculateFinanceTotals(cashTransactions, financeTotalsRes.data || undefined),
                isLoading: false
            });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    addTenant: async (tenant) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('tenants').insert([tenant]);
            if (error) throw error;

            const currentTenants = get().tenants;
            set({ tenants: [...currentTenants, tenant], isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    updateTenant: async (updatedTenant) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase
                .from('tenants')
                .update(updatedTenant)
                .eq('id', updatedTenant.id);

            if (error) {
                console.error("Supabase Update Error (Check if 'email' column exists):", error);
                throw error;
            }

            const currentTenants = get().tenants;
            const newTenants = currentTenants.map(t =>
                t.id === updatedTenant.id ? updatedTenant : t
            );
            set({ tenants: newTenants, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
            // Let the user see the exact error
            alert("Database Error: " + err.message + "\n\nIf it mentions 'email', you need to run the SQL command in Supabase.");
        }
    },

    removeTenant: async (id) => {
        set({ isLoading: true, error: null });
        try {
            // Because of ON DELETE CASCADE in SQL, deleting the tenant also deletes bills.
            const { error } = await supabase.from('tenants').delete().eq('id', id);

            if (error) throw error;

            const newTenants = get().tenants.filter(t => t.id !== id);
            const newBills = get().bills.filter(b => b.tenantId !== id);
            set({ tenants: newTenants, bills: newBills, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    toggleBillPaid: async (billId) => {
        try {
            const currentBills = get().bills;
            const billToUpdate = currentBills.find(b => b.id === billId);
            if (!billToUpdate) return;

            const newVal = !billToUpdate.isPaid;
            const paidDate = newVal ? new Date().toISOString().split('T')[0] : null;

            // Optimistic UI Update
            const newBills = currentBills.map(b =>
                b.id === billId ? { ...b, isPaid: newVal, paidDate: paidDate || undefined } : b
            );
            set({ bills: newBills });

            // Supabase API Call
            const { error } = await supabase
                .from('bills')
                .update({ isPaid: newVal, paidDate: paidDate })
                .eq('id', billId);

            if (error) throw error;

        } catch (err: any) {
            set({ error: err.message });
            get().fetchData(); // Rollback on fail
        }
    },

    addBill: async (bill) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('bills').insert([bill]);
            if (error) throw error;

            const currentBills = get().bills;
            set({ bills: [...currentBills, bill], isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    // --- STAFF ---
    addStaff: async (staff) => {
        set({ isLoading: true, error: null });
        try {
            const { id, ...insertData } = staff; // Remove ID to let DB generate UUID if it's new
            const { data, error } = await supabase.from('staff').insert([insertData]).select().single();
            if (error) throw error;
            set({ staff: [...get().staff, data as Staff], isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    updateStaff: async (updatedStaff) => {
        set({ isLoading: true, error: null });
        try {
            const { id, ...updateData } = updatedStaff;
            const { error } = await supabase.from('staff').update(updateData).eq('id', id);
            if (error) throw error;
            set({
                staff: get().staff.map(s => s.id === id ? updatedStaff : s),
                isLoading: false
            });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    removeStaff: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('staff').delete().eq('id', id);
            if (error) throw error;
            set({ staff: get().staff.filter(s => s.id !== id), isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    // --- REQUIREMENTS ---
    addRequirement: async (req) => {
        set({ isLoading: true, error: null });
        try {
            const { id, ...insertData } = req;
            const { data, error } = await supabase.from('requirements').insert([insertData]).select().single();
            if (error) throw error;
            set({ requirements: [...get().requirements, data as BuildingRequirement], isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    updateRequirement: async (req) => {
        set({ isLoading: true, error: null });
        try {
            const { id, ...updateData } = req;
            const { error } = await supabase.from('requirements').update(updateData).eq('id', id);
            if (error) throw error;
            set({
                requirements: get().requirements.map(r => r.id === id ? req : r),
                isLoading: false
            });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    toggleRequirementStatus: async (id) => {
        try {
            const req = get().requirements.find(r => r.id === id);
            if (!req) return;

            const isInactive = req.status === 'Inactive';
            const newStatus = isInactive ? 'Active' : 'Inactive';
            const activationDate = isInactive ? new Date().toISOString().split("T")[0] : null;

            // Optimistic UI Update
            const newReqs = get().requirements.map(r =>
                r.id === id ? { ...r, status: newStatus as any, activationDate: activationDate || undefined } : r
            );
            set({ requirements: newReqs });

            const { error } = await supabase.from('requirements')
                .update({ status: newStatus, activationDate })
                .eq('id', id);

            if (error) throw error;
        } catch (err: any) {
            set({ error: err.message });
            get().fetchData(); // Rollback
        }
    },

    removeRequirement: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('requirements').delete().eq('id', id);
            if (error) throw error;
            set({ requirements: get().requirements.filter(r => r.id !== id), isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    // --- EVENTS ---
    addEvent: async (event) => {
        set({ isLoading: true, error: null });
        try {
            const { id, ...insertData } = event;
            const { data, error } = await supabase.from('events').insert([insertData]).select().single();
            if (error) throw error;
            set({ events: [...get().events, data as CalendarEvent], isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    deleteEvent: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('events').delete().eq('id', id);
            if (error) throw error;
            set({ events: get().events.filter(e => e.id !== id), isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    // --- CASH TRANSACTIONS ---
    addCashTransaction: async (transaction) => {
        set({ isLoading: true, error: null });
        try {
            const { id, ...insertData } = transaction;
            const { data, error } = await supabase.from('cash_transactions').insert([insertData]).select().single();
            if (error) throw error;

            const newTransactions = [...get().cashTransactions, data as CashTransaction];
            set({
                cashTransactions: newTransactions,
                financeTotals: calculateFinanceTotals(newTransactions, get().financeTotalsOverride),
                isLoading: false
            });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    updateCashTransaction: async (transaction) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('cash_transactions').update(transaction).eq('id', transaction.id);
            if (error) throw error;

            const newTransactions = get().cashTransactions.map(t => t.id === transaction.id ? transaction : t);
            set({
                cashTransactions: newTransactions,
                financeTotals: calculateFinanceTotals(newTransactions, get().financeTotalsOverride),
                isLoading: false
            });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    deleteCashTransaction: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const { error } = await supabase.from('cash_transactions').delete().eq('id', id);
            if (error) throw error;

            const newTransactions = get().cashTransactions.filter(t => t.id !== id);
            set({
                cashTransactions: newTransactions,
                financeTotals: calculateFinanceTotals(newTransactions, get().financeTotalsOverride),
                isLoading: false
            });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    updateFinanceTotals: async (totals) => {
        set({ isLoading: true, error: null });
        try {
            let currentOverride = get().financeTotalsOverride as any;

            // If the row doesn't exist yet we must insert vs update
            if (!currentOverride || !currentOverride.id) {
                const { data, error } = await supabase.from('finance_totals').insert([{ ...totals, is_manual_override: true }]).select().single();
                if (error) throw error;
                currentOverride = data;
            } else {
                const { data, error } = await supabase.from('finance_totals').update({ ...totals, is_manual_override: true }).eq('id', currentOverride.id).select().single();
                if (error) throw error;
                currentOverride = data;
            }

            set({
                financeTotalsOverride: currentOverride,
                financeTotals: calculateFinanceTotals(get().cashTransactions, currentOverride),
                isLoading: false
            });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    // --- MISC ---
    checkAndGenerateMonthlyBills: async () => {
        // Mock implementation for now to prevent app crash
        console.log("checkAndGenerateMonthlyBills called");
    }
}));
