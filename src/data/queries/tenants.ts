import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import { Tenant } from '../types';

export const tenantKeys = {
    all: ['tenants'] as const,
};

export function useTenants() {
    return useQuery({
        queryKey: tenantKeys.all,
        queryFn: async () => {
            const { data, error } = await supabase.from('tenants').select('*');
            if (error) throw error;
            return data as Tenant[];
        },
    });
}

export function useAddTenant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (tenant: Tenant) => {
            const { error } = await supabase.from('tenants').insert([tenant]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantKeys.all });
        },
    });
}

export function useUpdateTenant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (updatedTenant: Tenant) => {
            const { error } = await supabase
                .from('tenants')
                .update(updatedTenant)
                .eq('id', updatedTenant.id);

            if (error) {
                throw new Error(error.message + "\n\nIf it mentions 'email', you need to run the SQL command in Supabase.");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantKeys.all });
        },
    });
}

export function useRemoveTenant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('tenants').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantKeys.all });
            // We also invalidate bills since deleting a tenant cascades to bills
            queryClient.invalidateQueries({ queryKey: ['bills'] });
        },
    });
}
