import { create } from 'zustand';

interface AppState {
    user: { id: string, name: string, role: string } | null;
    logout: () => void;
}

const getUserFromStorage = () => {
    try {
        const stored = localStorage.getItem('adc_user_v2');
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

export const useAppStore = create<AppState>((set) => ({
    user: getUserFromStorage(),

    logout: () => {
        localStorage.removeItem('adc_auth_token_v2');
        localStorage.removeItem('adc_user_v2');
        set({ user: null });
        window.location.href = '/login';
    },
}));
