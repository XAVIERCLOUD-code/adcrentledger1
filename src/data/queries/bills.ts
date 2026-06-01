import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import { BillRecord } from '../types';

export const billKeys = {
    all: ['bills'] as const,
};

export function useBills() {
    return useQuery({
        queryKey: billKeys.all,
        queryFn: async () => {
            const { data, error } = await supabase.from('bills').select('*');
            if (error) throw error;
            return data as BillRecord[];
        },
    });
}

export function useAddBill() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (bill: BillRecord) => {
            const { error } = await supabase.from('bills').insert([bill]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: billKeys.all });
        },
    });
}

export function useToggleBillPaid() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ billId, isPaid }: { billId: string; isPaid: boolean }) => {
            const paidDate = isPaid ? new Date().toISOString().split('T')[0] : null;

            const { error } = await supabase
                .from('bills')
                .update({ isPaid, paidDate })
                .eq('id', billId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: billKeys.all });
        },
    });
}

export function useUpdateBill() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updatedBill: BillRecord) => {
            const { error } = await supabase
                .from('bills')
                .update(updatedBill)
                .eq('id', updatedBill.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: billKeys.all });
        },
    });
}

export function useRemoveBill() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('bills')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: billKeys.all });
        },
    });
}
