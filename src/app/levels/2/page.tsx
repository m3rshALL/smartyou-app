'use client';

import { useEffect } from 'react';
import { useConsole } from '@/features/model/useConsole';
import { complete, run, spawnCactus } from '@/features/model/gameMechanics';
import { useLevelTransition } from '@/features/model/levelTransition';
import { useExtendedGameStore } from '@/features/model/useExtendedGameStore';
import { useSoundManager } from '@/features/model/useSoundManager';
import RemixLevelIDE from '@/features/ui/RemixLevelIDE';

export default function LevelTwo() {
    const { addLog } = useConsole();
    const { completeLevel, hasNextLevel } = useLevelTransition();
    const { initializePlayer, startGameSession, endGameSession, updatePlayerStats, unlockAchievement, setCurrentLevel } = useExtendedGameStore();
    const { playSound } = useSoundManager();

    const currentLevelNumber = 2;
    const hasNext = hasNextLevel(currentLevelNumber);

    useEffect(() => {
        // Инициализируем игрока если нужно
        const name = document.cookie
            .split('; ')
            .find(row => row.startsWith('name='))
            ?.split('=')[1];
        
        if (name) {
            initializePlayer(decodeURIComponent(name));
        }
        
        setCurrentLevel(currentLevelNumber);
        startGameSession(currentLevelNumber);
        
        run();
        addLog('🗳️ Миссия: Создайте безопасную систему голосования!');
        addLog('⚠️ Внимание: нужно предотвратить повторное голосование');
        
        setTimeout(() => {
            spawnCactus();
        }, 1000);
    }, [initializePlayer, setCurrentLevel, startGameSession, addLog, currentLevelNumber]);

    const handleSuccess = () => {
        playSound('success');
        addLog('✅ Контракт успешно скомпилирован!');
        addLog('🎉 Система голосования защищена от злоупотреблений!');
        
        // Завершаем игровую сессию
        endGameSession(true, 'excellent');
        
        // Обновляем статистику игрока
        const stars = 3;
        const sessionTime = Date.now() - (Date.now() - 45000);
        updatePlayerStats(currentLevelNumber, stars, sessionTime);
        
        // Разблокируем достижение
        unlockAchievement('democratic_ninja');
        
        // Завершаем уровень
        completeLevel(currentLevelNumber);
        
        complete();
        
        setTimeout(() => {
            if (hasNext) {
                addLog('➡️ Следующий уровень разблокирован!');
            } else {
                addLog('🎉 Поздравляем! Все уровни пройдены!');
            }
        }, 2000);
    };

    return (
        <RemixLevelIDE
            levelNumber={2}
            title="🗳️ Уровень 2: Электронное голосование"
            description="Создайте безопасную систему голосования, которая предотвращает повторное голосование"
            hints={[
                "Добавьте проверку require(!hasVoted[msg.sender], \"Already voted\")",
                "Не забудьте установить hasVoted[msg.sender] = true после голосования",
                "Используйте события для логирования голосов",
                "Рассмотрите добавление временных ограничений на голосование"
            ]}
            onSuccess={handleSuccess}
            successMessage="Превосходно! Вы создали надёжную систему голосования."
        />
    );
}