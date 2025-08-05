import { useRouter } from 'next/navigation';
import { useCompletedLevels } from './useLevels';
import { useConsole } from './useConsole';

export const useLevelTransition = () => {
    const router = useRouter();
    const { setCompletedLevels, completedLevels, goToNextLevel } = useCompletedLevels();
    const { addLog } = useConsole();

    const completeLevel = (currentLevel: number) => {
        if (completedLevels < currentLevel) {
            setCompletedLevels(currentLevel);
            addLog(`🏆 Уровень ${currentLevel} завершён!`);
            
            // Получение награды
            const rewards = {
                1: { xp: 10, badge: "Новичок в коде" },
                2: { xp: 15, badge: "Защитник демократии" },
                3: { xp: 20, badge: "Торговец артефактов" },
                4: { xp: 25, badge: "DAO участник" },
                5: { xp: 30, badge: "Страж блокчейна" }
            };

            const reward = rewards[currentLevel as keyof typeof rewards];
            if (reward) {
                addLog(`🎖️ Получен значок: "${reward.badge}" (+${reward.xp} XP)`);
            }

            return true; // Новое завершение
        }
        return false; // Уже был завершён
    };

    const showNextLevelOption = (currentLevel: number, onShowButton: (show: boolean) => void) => {
        setTimeout(() => {
            onShowButton(true);
            if (currentLevel < 5) {
                addLog('➡️ Следующий уровень разблокирован!');
                addLog('💡 Нажмите кнопку "Следующий уровень" для продолжения');
            } else {
                addLog('🎉 Поздравляем! Все уровни пройдены!');
            }
        }, 2000);
    };

    const goToNext = () => {
        const nextLevel = goToNextLevel();
        if (nextLevel) {
            addLog(`🚀 Переход на уровень ${nextLevel}...`);
            router.push(`/levels/${nextLevel}`);
        } else {
            addLog('🎉 Поздравляем! Все уровни пройдены!');
            router.push('/levels/');
        }
    };

    const hasNextLevel = () => {
        return completedLevels < 5;
    };

    return {
        completeLevel,
        showNextLevelOption,
        goToNext,
        hasNextLevel: hasNextLevel()
    };
};