'use client';

import { useEffect, useState } from 'react';
import { useConsole } from '@/features/model/useConsole';
import { complete, run, spawnCactus } from '@/features/model/gameMechanics';
import { useLevelTransition } from '@/features/model/levelTransition';
import { useExtendedGameStore } from '@/features/model/useExtendedGameStore';
import { useSoundManager } from '@/features/model/useSoundManager';
import LevelView from '@/shared/ui/LevelView';
import Widget from '@/shared/ui/Widget';
import MonacoEditor from '@/features/ui/MonacoEditor';

export default function LevelFive() {
    const { addLog } = useConsole();
    const { completeLevel, hasNextLevel } = useLevelTransition();
    const { initializePlayer, startGameSession, endGameSession, updatePlayerStats, unlockAchievement, setCurrentLevel } = useExtendedGameStore();
    const { playSound } = useSoundManager();
    const [levelCompleted, setLevelCompleted] = useState(false);

    const currentLevelNumber = 5;
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
        addLog('🛡️ Миссия: Создайте защищенный банк!');
        addLog('⚠️ КРИТИЧНО: защитите от реентранси атак!');
        addLog('🔐 Используйте паттерн Checks-Effects-Interactions');
        addLog('💡 Подсказки:');
        addLog('• Используйте модификатор nonReentrant');
        addLog('• Применяйте паттерн: Checks → Effects → Interactions');
        addLog('• Обновляйте состояние ПЕРЕД внешними вызовами');
        
        setTimeout(() => {
            spawnCactus();
        }, 1000);
    }, [initializePlayer, setCurrentLevel, startGameSession, addLog, currentLevelNumber]);

    const handleSuccess = () => {
        if (levelCompleted) return;
        
        setLevelCompleted(true);
        playSound('success');
        addLog('✅ Контракт успешно скомпилирован!');
        addLog('🛡️ Банк защищен от всех известных атак!');
        addLog('🎖️ Вы стали экспертом по безопасности блокчейна!');
        addLog('💻 Уровень 5 пройден!');
        
        // Завершаем игровую сессию
        endGameSession(true, 'excellent');
        
        // Обновляем статистику игрока
        const stars = 3;
        const sessionTime = Date.now() - (Date.now() - 70000);
        updatePlayerStats(currentLevelNumber, stars, sessionTime);
        
        // Разблокируем финальное достижение
        unlockAchievement('security_master');
        
        // Завершаем уровень
        completeLevel(currentLevelNumber);
        
        complete();
        
        setTimeout(() => {
            if (hasNext) {
                addLog('➡️ Следующий уровень разблокирован!');
                addLog('💡 Перейдите в раздел "Уровни" для продолжения');
            } else {
                addLog('🎉 ПОЗДРАВЛЯЕМ! ВЫ ПРОШЛИ ВСЕ УРОВНИ!');
                addLog('🏆 Вы стали мастером безопасности смарт-контрактов!');
            }
        }, 2000);
    };

    return (
        <LevelView>
            <div className="flex flex-col gap-3">
                {/* Информация об уровне */}
                <Widget 
                    title="🛡️ Уровень 5: Матрица Безопасности" 
                    icon="🎯"
                >
                    <div className="space-y-3">
                        <p className="text-gray-300">
                            Создайте защищенный банк с защитой от реентранси атак - 
                            финальный уровень мастерства в безопасности блокчейна.
                        </p>
                        
                        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                            <h4 className="text-red-400 font-semibold mb-2">⚠️ КРИТИЧЕСКИЕ задачи:</h4>
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li>• Реализовать защиту от реентранси</li>
                                <li>• Использовать паттерн Checks-Effects-Interactions</li>
                                <li>• Обеспечить безопасные внешние вызовы</li>
                                <li>• Развернуть контракт для завершения курса</li>
                            </ul>
                        </div>

                        {levelCompleted && (
                            <div className="bg-gradient-to-r from-green-900/30 via-blue-900/30 to-purple-900/30 border border-green-500/50 rounded-lg p-3 text-center">
                                <div className="text-green-400 font-semibold text-lg">
                                    🎉 ВСЕ УРОВНИ ПРОЙДЕНЫ! 🎉
                                </div>
                                <div className="text-purple-300 mt-1">
                                    Вы стали мастером безопасности блокчейна!
                                </div>
                            </div>
                        )}
                    </div>
                </Widget>

                {/* Monaco Editor для разработки */}
                <Widget 
                    title="💻 Monaco Editor" 
                    icon="⚒️"
                    className="flex-1"
                >
                    <MonacoEditor 
                        onContractDeployed={() => {
                            // При успешном развертывании контракта
                            handleSuccess();
                        }}
                        defaultValue={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SecureBank {
    // Создайте защищенный банк с защитой от реентранси
    
}`}
                    />
                </Widget>
            </div>
        </LevelView>
    );
}
