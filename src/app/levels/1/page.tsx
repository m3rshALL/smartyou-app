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

export default function LevelOne() {
    const { addLog } = useConsole();
    const { completeLevel, goToNext, hasNextLevel } = useLevelTransition();
    const { initializePlayer, startGameSession, endGameSession, updatePlayerStats, unlockAchievement, setCurrentLevel } = useExtendedGameStore();
    const { playSound } = useSoundManager();

    const currentLevelNumber = 1;
    const hasNext = hasNextLevel(currentLevelNumber);

    const [code, setCode] = useState<string>(`// Исправьте критические ошибки в смарт-контракте
pragma solidity ^0.8.0;

contract Wallet {
    address public owner;
    mapping(address => uint256) public balances;
    
    constructor() {
        owner = msg.sender;
        balances[owner] = 1000 ether;
    }
    
    // ОШИБКА 1: нет проверки владельца
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
    
    // ОШИБКА 2: любой может пополнить любому
    function deposit(address to) public payable {
        balances[to] += msg.value;
    }
    
    // ОШИБКА 3: нет ограничений доступа
    function emergency() public {
        selfdestruct(payable(msg.sender));
    }
}`);

    const [balance, setBalance] = useState(1000);
    const [transactions, setTransactions] = useState<string[]>([]);
    const [isSecure, setIsSecure] = useState(false);
    const [showNextLevelButton, setShowNextLevelButton] = useState(false);
    const [levelCompleted, setLevelCompleted] = useState(false);

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

    const checkSecurity = () => {
        const hasOwnerCheck = code.includes('msg.sender == owner') || code.includes('onlyOwner');
        const hasModifier = code.includes('modifier onlyOwner');
        const hasDepositFix = !code.includes('balances[to] += msg.value') || code.includes('balances[msg.sender] += msg.value');
        
        return hasOwnerCheck && hasModifier && hasDepositFix;
    };

    const simulateAttacks = () => {
        addLog('🚨 Хакеры атакуют контракт...');
        
        const attacks = [
            { name: 'Попытка вывода чужих средств', success: !isSecure },
            { name: 'Попытка уничтожения контракта', success: !isSecure },
            { name: 'Попытка пополнения чужого счёта', success: !isSecure }
        ];
        
        attacks.forEach((attack, index) => {
            setTimeout(() => {
                if (attack.success) {
                    addLog(`❌ ${attack.name}: УСПЕШНО (уязвимость!)`);
                    setBalance(prev => Math.max(0, prev - 100));
                    setTransactions(prev => [...prev, `💸 -100 ETH (${attack.name})`]);
                } else {
                    addLog(`✅ ${attack.name}: ЗАБЛОКИРОВАНО`);
                }
            }, index * 1000);
        });
    };

    const handleCompile = () => {
        addLog('🔍 Анализ безопасности контракта...');
        playSound('run');
        
        const secure = checkSecurity();
        setIsSecure(secure);
        
        if (secure) {
            playSound('success');
            addLog('✅ Все уязвимости устранены!');
            addLog('🛡️ Контракт защищён от атак!');
            setLevelCompleted(true);
            
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
            
            // Показываем кнопку перехода через 2 секунды
            setTimeout(() => {
                setShowNextLevelButton(true);
                if (hasNext) {
                    addLog('➡️ Следующий уровень разблокирован!');
                } else {
                    addLog('🎉 Поздравляем! Все уровни пройдены!');
                }
            }, 2000);
            
            complete();
        } else {
            playSound('error');
            addLog('❌ Контракт всё ещё уязвим!');
            addLog('💡 Добавьте modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }');
            addLog('💡 Примените modifier к функциям withdraw и emergency');
            addLog('💡 В deposit() используйте balances[msg.sender] вместо balances[to]');
        }
        
        setTimeout(() => {
            simulateAttacks();
        }, 2000);
    };

    const handleNextLevel = () => {
        goToNext(currentLevelNumber);
    };

    const handleBackToLevels = () => {
        goToNext(5); // Передаём максимальный уровень, чтобы попасть в список
    };

    return (
        <LevelView>
            <Widget
                windowMode
                title="🏦 Уровень 1: Кошелёк в опасности"
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                        <path d="M240-80q-50 0-85-35t-35-85v-120h120v-560l60-80h240l60 80v560h120v120q0 50-35 85t-85 35H240Z"/>
                    </svg>
                }
            >
                <div className="h-full w-full overflow-y-scroll relative pb-24">
                    <div className="absolute bottom-16 right-3 flex gap-2">
                        <div className={`px-3 py-1 rounded text-sm ${isSecure ? 'bg-green-600' : 'bg-red-600'}`}>
                            {isSecure ? '🛡️ Защищён' : '⚠️ Уязвим'}
                        </div>
                        
                        {/* Показываем кнопку следующего уровня или завершения */}
                        {showNextLevelButton ? (
                            hasNext ? (
                                <button
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 animate-pulse"
                                    onClick={handleNextLevel}
                                >
                                    Следующий уровень →
                                </button>
                            ) : (
                                <button
                                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                                    onClick={handleBackToLevels}
                                >
                                    К списку уровней
                                </button>
                            )
                        ) : (
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={handleCompile}
                                disabled={levelCompleted}
                            >
                                {levelCompleted ? 'Выполнено ✓' : 'Проверить безопасность'}
                            </button>
                        )}
                    </div>

                    <div className="p-4">
                        <div className="text-2xl font-semibold">
                            🏦 Задача #1: Кошелёк в опасности
                        </div>
                        <div className="mt-2 text-lg">
                            Исправьте критические ошибки в смарт-контракте кошелька, чтобы обеспечить безопасность средств.
                        </div>

                        {/* Панель состояния */}
                        <div className="mt-4 space-y-3">
                            {/* Баланс */}
                            <div className={`p-3 border rounded ${balance > 800 ? 'bg-green-900/30 border-green-600' : 'bg-red-900/30 border-red-600'}`}>
                                <div className="font-semibold text-white">Баланс кошелька:</div>
                                <div className="text-2xl font-bold">💰 {balance} ETH</div>
                                {balance < 800 && (
                                    <div className="text-red-300 text-sm">⚠️ Средства украдены хакерами!</div>
                                )}
                            </div>

                            {/* Транзакции */}
                            {transactions.length > 0 && (
                                <div className="p-3 bg-gray-900/30 border border-gray-600 rounded max-h-32 overflow-y-auto">
                                    <div className="font-semibold text-gray-300">📊 Последние транзакции:</div>
                                    {transactions.map((tx, index) => (
                                        <div key={index} className="text-sm text-gray-400">{tx}</div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Сообщение о завершении */}
                        {levelCompleted && (
                            <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded">
                                <div className="font-semibold text-green-300">🎉 Уровень пройден!</div>
                                <div className="text-green-200">
                                    Отлично! Кошелёк восстановлен и средства в безопасности! 
                                    {hasNext ? " Переходите к следующему вызову!" : " Все уровни завершены!"}
                                </div>
                            </div>
                        )}

                        {/* Подсказки для исправления */}
                        {!levelCompleted && (
                            <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded">
                                <div className="font-semibold text-yellow-300">💡 Подсказки для исправления:</div>
                                <div className="text-yellow-200 text-sm space-y-1 mt-2">
                                    <div>• Добавьте modifier onlyOwner() с проверкой msg.sender == owner</div>
                                    <div>• Примените onlyOwner к функциям withdraw и emergency</div>
                                    <div>• В deposit() пополняйте баланс отправителя: balances[msg.sender]</div>
                                    <div>• Рассмотрите использование require() для дополнительных проверок</div>
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
                                    readOnly: levelCompleted,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </Widget>
        </LevelView>
    );
}
