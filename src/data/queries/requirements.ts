import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import { BuildingRequirement } from '../types';

export const requirementKeys = {
    all: ['requirements'] as const,
};

export function useRequirements() {
    return useQuery({
        queryKey: requirementKeys.all,
        queryFn: async () => {
            const { data, error } = await supabase.from('requirements').select('*');
            if (error) throw error;
            return data as BuildingRequirement[];
        },
    });
}

export function useAddRequirement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (req: BuildingRequirement) => {
            const { id, ...insertData } = req;
            const { data, error } = await supabase.from('requirements').insert([insertData]).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: requirementKeys.all });
        },
    });
}

export function useUpdateRequirement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (req: BuildingRequirement) => {
            const { id, ...updateData } = req;
            const { error } = await supabase.from('requirements').update(updateData).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: requirementKeys.all });
        },
    });
}

export function useToggleRequirementStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: string }) => {
            const isInactive = currentStatus === 'Inactive';
            const newStatus = isInactive ? 'Active' : 'Inactive';
            const activationDate = isInactive ? new Date().toISOString().split("T")[0] : null;

            const { error } = await supabase.from('requirements')
                .update({ status: newStatus, activationDate })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: requirementKeys.all });
        },
    });
}

export function useRemoveRequirement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('requirements').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: requirementKeys.all });
        },
    });
}
