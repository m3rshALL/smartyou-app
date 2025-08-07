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

export default function LevelFour() {
    const { addLog } = useConsole();
    const { completeLevel, hasNextLevel } = useLevelTransition();
    const { initializePlayer, startGameSession, endGameSession, updatePlayerStats, unlockAchievement, setCurrentLevel } = useExtendedGameStore();
    const { playSound } = useSoundManager();
    const [levelCompleted, setLevelCompleted] = useState(false);

    const currentLevelNumber = 4;
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
        addLog('🎯 Добро пожаловать на уровень 4!');
        addLog('🏛️ Цель: Создайте DAO организацию');
        addLog('💡 Подсказки:');
        addLog('• Используйте токены для голосования');
        addLog('• Добавьте функции создания и голосования за предложения');
        addLog('• Реализуйте автоматическое исполнение предложений');
        
        setTimeout(() => {
            spawnCactus();
        }, 1000);
    }, [initializePlayer, setCurrentLevel, startGameSession, addLog, currentLevelNumber]);

    const handleSuccess = () => {
        if (levelCompleted) return;
        
        setLevelCompleted(true);
        playSound('success');
        addLog('✅ DAO организация успешно создана!');
        addLog('🏛️ Отличная работа с децентрализованным управлением!');
        addLog('💻 Уровень 4 пройден!');
        
        // Завершаем игровую сессию
        endGameSession(true, 'excellent');
        
        // Обновляем статистику игрока
        const stars = 3;
        const sessionTime = Date.now() - (Date.now() - 120000);
        updatePlayerStats(currentLevelNumber, stars, sessionTime);
        
        // Разблокируем достижение
        unlockAchievement('dao_architect');
        
        // Завершаем уровень
        completeLevel(currentLevelNumber);
        
        complete();
        
        setTimeout(() => {
            if (hasNext) {
                addLog('➡️ Следующий уровень разблокирован!');
                addLog('💡 Перейдите в раздел "Уровни" для продолжения');
            }
        }, 2000);
    };

    return (
        <LevelView>
            <div className="flex flex-col gap-3">
                {/* Информация об уровне */}
                <Widget 
                    title="🏛️ Уровень 4: DAO Организация" 
                    icon="⚖️"
                >
                    <div className="space-y-3">
                        <p className="text-gray-300">
                            Создайте децентрализованную автономную организацию (DAO). 
                            Изучите продвинутые концепции управления и голосования в блокчейне!
                        </p>
                        
                        <div className="bg-indigo-900/30 border border-indigo-500/50 rounded-lg p-3">
                            <h4 className="text-indigo-400 font-semibold mb-2">🎯 Задачи:</h4>
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li>• Создайте токены для участников DAO</li>
                                <li>• Реализуйте систему предложений</li>
                                <li>• Добавьте голосование с весом токенов</li>
                                <li>• Разверните контракт для завершения уровня</li>
                            </ul>
                        </div>

                        {levelCompleted && (
                            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 text-center">
                                <div className="text-green-400 font-semibold">
                                    🎉 Уровень пройден! 🎉
                                </div>
                                <div className="text-green-300 text-sm mt-1">
                                    Вы создали DAO организацию!
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

contract DAO {
    // Создайте токены и систему голосования DAO
    
}`}
                    />
                </Widget>
            </div>
        </LevelView>
    );
}
