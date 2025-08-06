'use client';

import { useEffect, useState } from 'react';
import Widget from '@/shared/ui/Widget';
import LevelView from '@/shared/ui/LevelView';
import { useConsole } from '@/features/model/useConsole';
import { Editor } from '@monaco-editor/react';
import { complete, run, spawnCactus } from '@/features/model/gameMechanics';
import { useLevelTransition } from '@/features/model/levelTransition';
import { useExtendedGameStore } from '@/features/model/useExtendedGameStore';
import { useSoundManager } from '@/features/model/useSoundManager';

export default function LevelFive() {
    const { addLog } = useConsole();
    const { completeLevel } = useLevelTransition();
    const { initializePlayer, startGameSession, endGameSession, updatePlayerStats, unlockAchievement, setCurrentLevel } = useExtendedGameStore();
    const { playSound } = useSoundManager();

    const currentLevelNumber = 5;

    const [code, setCode] = useState<string>(`// Защитите контракт от реентранси атак
pragma solidity ^0.8.0;

contract VulnerableBank {
    mapping(address => uint256) public balances;
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // УЯЗВИМОСТЬ: перевод до обновления баланса!
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        balances[msg.sender] -= amount;
    }
    
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}`);

    const [securityStatus, setSecurityStatus] = useState({
        reentrancyFixed: false,
        attackBlocked: false,
        fundsSecure: false
    });

    const [showCompletionButton, setShowCompletionButton] = useState(false);
    const [levelCompleted, setLevelCompleted] = useState(false);
    const [hackingInProgress, setHackingInProgress] = useState(false);
    const [attackAttempts, setAttackAttempts] = useState(0);

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
        addLog('🛡️ ФИНАЛЬНАЯ МИССИЯ: Защитите контракт от хакерской атаки!');
        addLog('⚠️ Обнаружена уязвимость реентранси в функции withdraw()');
        
        setTimeout(() => {
            spawnCactus();
        }, 1000);

        // Симуляция атак хакеров
        const attackInterval = setInterval(() => {
            if (!levelCompleted) {
                setAttackAttempts(prev => prev + 1);
                const attacks = [
                    "🔴 Попытка реентранси атаки!",
                    "🔴 Хакер пытается вывести средства!",
                    "🔴 Обнаружена попытка двойного расходования!",
                    "🔴 Атака на функцию withdraw()!"
                ];
                const randomAttack = attacks[Math.floor(Math.random() * attacks.length)];
                addLog(randomAttack);
                
                if (Math.random() > 0.7) {
                    setHackingInProgress(true);
                    setTimeout(() => setHackingInProgress(false), 2000);
                }
            }
        }, 5000);

        return () => clearInterval(attackInterval);
    }, [initializePlayer, setCurrentLevel, startGameSession, addLog, currentLevelNumber, levelCompleted]);

    const checkCode = () => {
        // Проверяем правильный порядок операций (CEI pattern)
        const ceiPattern = code.includes('balances[msg.sender] -= amount') && 
                          code.indexOf('balances[msg.sender] -= amount') < code.indexOf('call{value: amount}');
        
        // Проверяем наличие ReentrancyGuard или аналогичной защиты
        const hasReentrancyGuard = code.includes('nonReentrant') || 
                                  code.includes('ReentrancyGuard') || 
                                  ceiPattern;

        return {
            reentrancyFixed: hasReentrancyGuard,
            attackBlocked: hasReentrancyGuard,
            fundsSecure: hasReentrancyGuard
        };
    };

    const simulateSecureOperations = () => {
        addLog('🛡️ Контракт защищён! Хакерские атаки заблокированы!');
        addLog('✅ Реентранси атака предотвращена');
        addLog('💰 Средства пользователей в безопасности');
        addLog('🏆 КУРС ЗАВЕРШЁН! Вы настоящий мастер Solidity!');
        
        // Показать успешные операции
        const secureOps = [
            "✅ Депозит: 10 ETH безопасно размещён",
            "✅ Вывод: 3 ETH успешно выведен",
            "✅ Попытка повторного вызова заблокирована",
            "✅ Все средства под защитой"
        ];

        secureOps.forEach((op, index) => {
            setTimeout(() => {
                addLog(op);
            }, index * 1500);
        });
    };

    const handleCompile = () => {
        addLog('🔍 Анализ защиты от реентранси...');
        playSound('run');
        
        const analysis = checkCode();
        setSecurityStatus(analysis);
        
        if (analysis.reentrancyFixed) {
            playSound('success');
            addLog('✅ АТАКА ОТРАЖЕНА! Контракт защищён!');
            addLog('🎉 Хакер не смог украсть средства!');
            setLevelCompleted(true);
            
            // Завершаем игровую сессию
            endGameSession(true, 'excellent');
            
            // Обновляем статистику игрока
            const stars = 3;
            const sessionTime = Date.now() - (Date.now() - 80000);
            updatePlayerStats(currentLevelNumber, stars, sessionTime);
            
            // Разблокируем достижение
            unlockAchievement('security_expert');
            
            // Завершаем уровень
            completeLevel(currentLevelNumber);
            
            // Показываем кнопку завершения через 3 секунды
            setTimeout(() => {
                setShowCompletionButton(true);
            }, 3000);
            
            simulateSecureOperations();
            complete();
        } else {
            playSound('error');
            addLog('❌ Контракт всё ещё уязвим!');
            addLog('💡 Используйте паттерн CEI: Проверка → Эффект → Взаимодействие');
            addLog('💡 Переместите balances[msg.sender] -= amount ПЕРЕД вызовом call');
            addLog('💡 Или добавьте modifier nonReentrant');
        }
    };

    const handleGameCompleted = () => {
        // Переходим к экрану достижений
        window.location.href = '/achievements';
    };

    return (
        <LevelView>
            <Widget
                windowMode
                title="Уровень 5: Испытание хакера"
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                        <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-680v80h40q33 0 56.5 23.5T800-520v360q0 33-23.5 56.5T720-80H240Zm0-80h480v-360H240v360Zm120-180q0 17 11.5 28.5T400-300q17 0 28.5-11.5T440-340q0-17-11.5-28.5T400-380q-17 0-28.5 11.5T360-340Zm120 0q0 17 11.5 28.5T520-300q17 0 28.5-11.5T560-340q0-17-11.5-28.5T520-380q-17 0-28.5 11.5T480-340ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z"/>
                    </svg>
                }
            >
                <div className="h-full w-full overflow-y-scroll relative pb-24">
                    <div className="absolute bottom-16 right-3 flex gap-2">
                        <div className={`px-3 py-1 rounded text-sm ${
                            levelCompleted ? 'bg-green-600' : hackingInProgress ? 'bg-red-600 animate-pulse' : 'bg-yellow-600'
                        }`}>
                            {levelCompleted ? '🛡️ Защищён' : hackingInProgress ? '🔴 Атака!' : `⚠️ ${attackAttempts} попыток`}
                        </div>
                        
                        {showCompletionButton ? (
                            <button
                                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 animate-pulse"
                                onClick={handleGameCompleted}
                            >
                                🏆 Курс завершён!
                            </button>
                        ) : (
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                onClick={handleCompile}
                                disabled={levelCompleted}
                            >
                                {levelCompleted ? 'Выполнено ✓' : 'Активировать защиту'}
                            </button>
                        )}
                    </div>

                    <div className="p-4">
                        <div className="text-2xl font-semibold">
                            🛡️ Финальный уровень: Испытание хакера
                        </div>
                        <div className="mt-2 text-lg">
                            Защитите банковский контракт от реентранси атаки. Это финальное испытание!
                        </div>

                        {/* Сообщение о завершении */}
                        {levelCompleted && (
                            <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded">
                                <div className="font-semibold text-green-300">🏆 КУРС ЗАВЕРШЁН!</div>
                                <div className="text-green-200">
                                    ПРЕВОСХОДНО! Вы успешно защитили контракт от хакерской атаки и стали настоящим мастером Solidity!
                                </div>
                            </div>
                        )}

                        {/* Панель безопасности */}
                        <div className="mt-4 p-3 bg-red-900/30 border border-red-600 rounded">
                            <div className="font-semibold text-red-300">🚨 Статус безопасности контракта:</div>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                                <div className={`flex items-center justify-between p-2 rounded text-sm ${
                                    securityStatus.reentrancyFixed 
                                        ? 'bg-green-800/30 border border-green-600/30' 
                                        : 'bg-red-800/30 border border-red-600/30'
                                }`}>
                                    <span>Защита от реентранси</span>
                                    <span className={securityStatus.reentrancyFixed ? 'text-green-300' : 'text-red-300'}>
                                        {securityStatus.reentrancyFixed ? '✅ Активна' : '🔴 Уязвимо'}
                                    </span>
                                </div>
                                
                                <div className={`flex items-center justify-between p-2 rounded text-sm ${
                                    securityStatus.attackBlocked 
                                        ? 'bg-green-800/30 border border-green-600/30' 
                                        : 'bg-red-800/30 border border-red-600/30'
                                }`}>
                                    <span>Блокировка атак</span>
                                    <span className={securityStatus.attackBlocked ? 'text-green-300' : 'text-red-300'}>
                                        {securityStatus.attackBlocked ? '✅ Активна' : '🔴 Отключена'}
                                    </span>
                                </div>
                                
                                <div className={`flex items-center justify-between p-2 rounded text-sm ${
                                    securityStatus.fundsSecure 
                                        ? 'bg-green-800/30 border border-green-600/30' 
                                        : 'bg-red-800/30 border border-red-600/30'
                                }`}>
                                    <span>Безопасность средств</span>
                                    <span className={securityStatus.fundsSecure ? 'text-green-300' : 'text-red-300'}>
                                        {securityStatus.fundsSecure ? '✅ Защищены' : '🔴 В опасности'}
                                    </span>
                                </div>
                            </div>
                            
                            {attackAttempts > 0 && !levelCompleted && (
                                <div className="mt-3 text-center">
                                    <div className="text-red-200 text-sm animate-pulse">
                                        ⚠️ Обнаружено {attackAttempts} попыток взлома!
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Подсказки для исправления */}
                        {!levelCompleted && (
                            <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded">
                                <div className="font-semibold text-yellow-300">🔧 Подсказки для защиты:</div>
                                <div className="text-yellow-200 text-sm space-y-1 mt-2">
                                    <div>• 🛡️ Используйте паттерн CEI: Проверка → Эффект → Взаимодействие</div>
                                    <div>• 💡 Переместите balances[msg.sender] -= amount ПЕРЕД вызовом call</div>
                                    <div>• 💡 Или используйте modifier nonReentrant</div>
                                    <div>• 💡 Импортируйте ReentrancyGuard из OpenZeppelin</div>
                                    <div>• ⚠️ Защитите от повторных вызовов withdraw() в одной транзакции</div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 h-[500px] flex flex-col gap-4">
                            <Editor
                                language="solidity"
                                theme="vs-dark"
                                value={code}
                                onChange={(value?: string) => setCode(value ?? '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    readOnly: levelCompleted, // Заблокировать редактирование после завершения
                                }}
                            />
                        </div>
                    </div>
                </div>
            </Widget>
        </LevelView>
    );
}