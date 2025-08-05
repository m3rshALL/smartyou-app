import { Log } from '@/entities/log/types';
import { create } from 'zustand';

type ConsoleStore = {
    logs: Log[];
    addLog: (message: string) => void;
    clearLogs: () => void;
};

export const useConsole = create<ConsoleStore>((set) => ({
    logs: [],
    addLog: (message) => set((state) => ({
        logs: [
            ...state.logs,
            { message, timestamp: new Date() }
        ]
    })),
    clearLogs: () => set({ logs: [] }),
}))