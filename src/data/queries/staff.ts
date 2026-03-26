import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import { Staff } from '../types';

export const staffKeys = {
    all: ['staff'] as const,
};

export function useStaff() {
    return useQuery({
        queryKey: staffKeys.all,
        queryFn: async () => {
            const { data, error } = await supabase.from('staff').select('*');
            if (error) throw error;
            return data as Staff[];
        },
    });
}

export function useAddStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (staff: Staff) => {
            const { id, ...insertData } = staff; // Remove ID to let DB generate UUID if it's new
            const { data, error } = await supabase.from('staff').insert([insertData]).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: staffKeys.all });
        },
    });
}

export function useUpdateStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updatedStaff: Staff) => {
            const { id, ...updateData } = updatedStaff;
            const { error } = await supabase.from('staff').update(updateData).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: staffKeys.all });
        },
    });
}

export function useRemoveStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('staff').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: staffKeys.all });
        },
    });
}
