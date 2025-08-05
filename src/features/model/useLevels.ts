import { create } from 'zustand';

type LevelStore = {
    completedLevels: number;
    setCompletedLevels: (level: number) => void;
    goToNextLevel: () => number | null;
    canAccessLevel: (level: number) => boolean;
};

export const useCompletedLevels = create<LevelStore>((set, get) => ({
    completedLevels: 0,
    setCompletedLevels: (level) => set({ completedLevels: level }),
    goToNextLevel: () => {
        const { completedLevels } = get();
        const nextLevel = completedLevels + 1;
        
        // Максимум 5 уровней
        if (nextLevel <= 5) {
            return nextLevel;
        }
        
        return null; // Все уровни пройдены
    },
    canAccessLevel: (level) => {
        const { completedLevels } = get();
        return level <= completedLevels + 1; // Можно играть текущий + следующий
    }
}));