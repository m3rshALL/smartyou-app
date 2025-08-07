'use client';

import { useEffect } from 'react';
import { useConsole } from '@/features/model/useConsole';
import { complete, run, spawnCactus } from '@/features/model/gameMechanics';
import { useLevelTransition } from '@/features/model/levelTransition';
import { useExtendedGameStore } from '@/features/model/useExtendedGameStore';
import { useSoundManager } from '@/features/model/useSoundManager';
import RemixLevelIDE from '@/features/ui/RemixLevelIDE';

export default function LevelOne() {
    const { addLog } = useConsole();
    const { completeLevel, goToNext, hasNextLevel } = useLevelTransition();
    const { initializePlayer, startGameSession, endGameSession, updatePlayerStats, unlockAchievement, setCurrentLevel } = useExtendedGameStore();
    const { playSound } = useSoundManager();

    const currentLevelNumber = 1;
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
        addLog('🏦 Миссия: Исправьте критические ошибки в кошельке!');
        addLog('⚠️ Внимание: контракт имеет 3 серьёзных уязвимости');
        
        setTimeout(() => {
            spawnCactus();
        }, 1000);
    }, [initializePlayer, setCurrentLevel, startGameSession, addLog, currentLevelNumber]);

    const handleSuccess = () => {
        playSound('success');
        addLog('✅ Все уязвимости устранены!');
        addLog('🛡️ Контракт защищён от атак!');
        
        // Завершаем игровую сессию
        endGameSession(true, 'excellent');
        
        // Обновляем статистику игрока
        const stars = 3;
        const sessionTime = Date.now() - (Date.now() - 30000);
        updatePlayerStats(currentLevelNumber, stars, sessionTime);
        
        // Разблокируем достижение
        unlockAchievement('first_steps');
        
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
            levelNumber={1}
            title="🏦 Уровень 1: Кошелёк в опасности"
            description="Исправьте критические ошибки безопасности в смарт-контракте кошелька"
            hints={[
                "Добавьте modifier onlyOwner() с проверкой msg.sender == owner",
                "Примените onlyOwner к функциям withdraw и emergency", 
                "В deposit() пополняйте баланс отправителя: balances[msg.sender]",
                "Рассмотрите использование require() для дополнительных проверок"
            ]}
            onSuccess={handleSuccess}
            successMessage="Отлично! Кошелёк восстановлен и средства в безопасности!"
        />
    );
}
