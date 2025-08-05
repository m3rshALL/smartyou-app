import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type LevelStore = {
    completedLevels: number;
    setCompletedLevels: (level: number) => void;
    goToNextLevel: (currentLevel: number) => number | null;
    canAccessLevel: (level: number) => boolean;
};

export const useCompletedLevels = create<LevelStore>()(
    persist(
        (set, get) => ({
            completedLevels: 0,
            setCompletedLevels: (level) => {
                const { completedLevels: current } = get();
                // Обновляем только если новый уровень больше текущего
                if (level > current) {
                    set({ completedLevels: level });
                }
            },
            goToNextLevel: (currentLevel) => {
                const nextLevel = currentLevel + 1;
                
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
        }),
        {
            name: 'smartyou-levels-storage'
        }
    )
);