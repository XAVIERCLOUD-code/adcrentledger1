import { create } from 'zustand';
import { Tenant, BillRecord } from './types';
import { supabase } from '../utils/supabaseClient';

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
            const [tenantsRes, billsRes] = await Promise.all([
                supabase.from('tenants').select('*'),
                supabase.from('bills').select('*')
            ]);

            if (tenantsRes.error) throw tenantsRes.error;
            if (billsRes.error) throw billsRes.error;

            set({ tenants: tenantsRes.data || [], bills: billsRes.data || [], isLoading: false });
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

            if (error) throw error;

            const currentTenants = get().tenants;
            const newTenants = currentTenants.map(t =>
                t.id === updatedTenant.id ? updatedTenant : t
            );
            set({ tenants: newTenants, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
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
    }
}));
