import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import { CashTransaction, FinanceTotals } from '../types';

export const financeKeys = {
    all: ['finance'] as const,
};

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

export function useFinance() {
    return useQuery({
        queryKey: financeKeys.all,
        queryFn: async () => {
            const [cashRes, overrideRes] = await Promise.all([
                supabase.from('cash_transactions').select('*'),
                supabase.from('finance_totals').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle()
            ]);

            if (cashRes.error) throw cashRes.error;
            if (overrideRes.error && overrideRes.error.code !== 'PGRST116') throw overrideRes.error;

            const cashTransactions = (cashRes.data as CashTransaction[]) || [];
            const override = (overrideRes.data as FinanceTotalsOverride) || undefined;
            const totals = calculateFinanceTotals(cashTransactions, override);

            return {
                cashTransactions,
                override,
                totals
            };
        },
    });
}

export function useAddCashTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (transaction: CashTransaction) => {
            const { id, ...insertData } = transaction;
            const { data, error } = await supabase.from('cash_transactions').insert([insertData]).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: financeKeys.all });
        },
    });
}

export function useUpdateCashTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (transaction: CashTransaction) => {
            const { error } = await supabase.from('cash_transactions').update(transaction).eq('id', transaction.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: financeKeys.all });
        },
    });
}

export function useDeleteCashTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('cash_transactions').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: financeKeys.all });
        },
    });
}

export function useUpdateFinanceTotals() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ totals, overrideId }: { totals: Partial<FinanceTotalsOverride>, overrideId?: string }) => {
            if (!overrideId) {
                const { error } = await supabase.from('finance_totals').insert([{ ...totals, is_manual_override: true }]);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('finance_totals').update({ ...totals, is_manual_override: true }).eq('id', overrideId);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: financeKeys.all });
        },
    });
}
