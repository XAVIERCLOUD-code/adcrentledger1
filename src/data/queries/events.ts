import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import { CalendarEvent } from '../types';

export const eventKeys = {
    all: ['events'] as const,
};

export function useEvents() {
    return useQuery({
        queryKey: eventKeys.all,
        queryFn: async () => {
            const { data, error } = await supabase.from('events').select('*');
            if (error) throw error;

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

            return [...(data as CalendarEvent[]), ...dynamicEvents] as CalendarEvent[];
        },
    });
}

export function useAddEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (event: CalendarEvent) => {
            const { id, ...insertData } = event;
            const { data, error } = await supabase.from('events').insert([insertData]).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: eventKeys.all });
        },
    });
}

export function useDeleteEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('events').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: eventKeys.all });
        },
    });
}
