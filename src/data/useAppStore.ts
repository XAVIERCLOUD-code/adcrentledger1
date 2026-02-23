import { create } from 'zustand';
import { Tenant, BillRecord } from './types';
import {
    getTenants as getLocalTenants,
    getBills as getLocalBills,
    saveTenants as saveLocalTenants,
    saveBills as saveLocalBills
} from './store';

// This simulates network latency like querying Supabase
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface AppState {
    tenants: Tenant[];
    bills: BillRecord[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchData: () => Promise<void>;
    addTenant: (tenant: Tenant) => Promise<void>;
    updateTenant: (tenant: Tenant) => Promise<void>;
    removeTenant: (id: string) => Promise<void>;
    toggleBillPaid: (billId: string) => Promise<void>;
    addBill: (bill: BillRecord) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
    tenants: [],
    bills: [],
    isLoading: false,
    error: null,

    fetchData: async () => {
        set({ isLoading: true, error: null });
        try {
            // In the future: const { data } = await supabase.from('tenants').select('*');
            await delay(600);
            const tenants = getLocalTenants();
            const bills = getLocalBills();
            set({ tenants, bills, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    addTenant: async (tenant) => {
        set({ isLoading: true, error: null });
        try {
            await delay(400);
            const currentTenants = get().tenants;
            const newTenants = [...currentTenants, tenant];
            saveLocalTenants(newTenants); // Persist
            set({ tenants: newTenants, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    updateTenant: async (updatedTenant) => {
        set({ isLoading: true, error: null });
        try {
            await delay(400);
            const currentTenants = get().tenants;
            const newTenants = currentTenants.map(t =>
                t.id === updatedTenant.id ? updatedTenant : t
            );
            saveLocalTenants(newTenants);
            set({ tenants: newTenants, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    removeTenant: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await delay(400);
            const newTenants = get().tenants.filter(t => t.id !== id);
            const newBills = get().bills.filter(b => b.tenantId !== id);
            saveLocalTenants(newTenants);
            saveLocalBills(newBills);
            set({ tenants: newTenants, bills: newBills, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    toggleBillPaid: async (billId) => {
        try {
            // Optimistic update
            const currentBills = get().bills;
            const newBills = currentBills.map(b => {
                if (b.id === billId) {
                    const newVal = !b.isPaid;
                    return {
                        ...b,
                        isPaid: newVal,
                        paidDate: newVal ? new Date().toISOString().split('T')[0] : undefined
                    };
                }
                return b;
            });

            set({ bills: newBills });
            // In the future, this is where the supabase update query goes
            await delay(300);
            saveLocalBills(newBills);
        } catch (err: any) {
            set({ error: err.message });
            // Revert optimistic update on failure by re-fetching
            get().fetchData();
        }
    },

    addBill: async (bill) => {
        set({ isLoading: true, error: null });
        try {
            await delay(400); // simulate network
            const currentBills = get().bills;
            const newBills = [...currentBills, bill];
            saveLocalBills(newBills);
            set({ bills: newBills, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    }
}));
