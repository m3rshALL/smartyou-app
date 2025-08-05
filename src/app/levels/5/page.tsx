'use client';

import { useEffect, useState } from 'react';
import Widget from '@/shared/ui/Widget';
import LevelView from '@/shared/ui/LevelView';
import { useConsole } from '@/features/model/useConsole';
import { useLevelTransition } from '@/features/model/levelTransition';
import { Editor } from '@monaco-editor/react';
import { complete, run, spawnCactus } from '@/features/model/gameMechanics';
import { useRouter } from 'next/navigation';

export default function LevelFive() {
    const router = useRouter();
    const { addLog } = useConsole();
    const { completeLevel } = useLevelTransition();

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

    const [contractBalance, setContractBalance] = useState(1000);
    const [attackInProgress, setAttackInProgress] = useState(false);
    const [isSecure, setIsSecure] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);

    useEffect(() => {
        run();
        addLog('🛡️ ФИНАЛЬНАЯ МИССИЯ: Защитите контракт от хакерской атаки!');
        addLog('⚠️ Обнаружена уязвимость реентранси в функции withdraw()');
        
        setTimeout(() => {
            spawnCactus();
        }, 1000);
    }, []);

    const checkSecurity = () => {
        const hasBalanceUpdateBeforeTransfer = code.indexOf('balances[msg.sender] -= amount') < 
                                              code.indexOf('call{value: amount}');
        const hasReentrancyGuard = code.includes('nonReentrant') || 
                                  code.includes('_status') ||
                                  code.includes('require(!locked');
        const hasOpenZeppelin = code.includes('ReentrancyGuard');
        
        return hasBalanceUpdateBeforeTransfer || hasReentrancyGuard || hasOpenZeppelin;
    };

    const simulateAttack = () => {
        setAttackInProgress(true);
        addLog('🚨 АТАКА НАЧАЛАСЬ!');
        addLog('👤 Хакер вызывает withdraw()...');
        
        let withdrawCount = 0;
        const maxWithdraws = isSecure ? 1 : 5;
        
        const attackInterval = setInterval(() => {
            withdrawCount++;
            const stolenAmount = 100;
            
            if (withdrawCount <= maxWithdraws) {
                if (isSecure) {
                    addLog(`❌ Попытка ${withdrawCount}: Реентранси заблокирована!`);
                } else {
                    setContractBalance(prev => Math.max(0, prev - stolenAmount));
                    addLog(`💸 Попытка ${withdrawCount}: Украдено ${stolenAmount} ETH`);
                }
            }
            
            if (withdrawCount >= maxWithdraws) {
                clearInterval(attackInterval);
                setAttackInProgress(false);
                
                if (isSecure) {
                    addLog('✅ АТАКА ОТРАЖЕНА! Контракт защищён!');
                    addLog('🎉 Хакер не смог украсть средства!');
                    
                    // Завершаем игру
                    setTimeout(() => {
                        setGameCompleted(true);
                        completeLevel(5);
                        addLog('🏆 КУРС ЗАВЕРШЁН! Вы настоящий мастер Solidity!');
                    }, 2000);
                } else {
                    addLog('💀 КОНТРАКТ ВЗЛОМАН! Баланс опустошён!');
                    addLog('❌ Реентранси атака сработала!');
                }
            }
        }, 800);
    };

    const handleCompile = () => {
        addLog('🔍 Анализ безопасности контракта...');
        
        const secure = checkSecurity();
        setIsSecure(secure);
        
        if (secure) {
            addLog('✅ Контракт защищён от реентранси атак!');
            addLog('🛡️ Применён паттерн: Проверка → Эффект → Взаимодействие');
            complete();
        } else {
            addLog('❌ Контракт всё ещё уязвим!');
            addLog('💡 Переместите balances[msg.sender] -= amount ПЕРЕД вызовом call');
            addLog('💡 Или используйте modifier nonReentrant');
            addLog('💡 Импортируйте ReentrancyGuard из OpenZeppelin');
        }
        
        setTimeout(() => {
            simulateAttack();
        }, 2000);
    };

    const handleGameComplete = (action: string) => {
        switch (action) {
            case 'restart':
                router.push('/levels/1');
                break;
            case 'levels':
                router.push('/levels/');
                break;
            case 'certificate':
                router.push('/certificate');
                break;
            case 'leaderboard':
                router.push('/leaderboard');
                break;
            case 'home':
                router.push('/');
                break;
            default:
                router.push('/');
        }
    };

    // Экран завершения игры
    if (gameCompleted) {
        return (
            <LevelView>
                <Widget
                    windowMode
                    title="🎉 Поздравляем! Курс завершён!"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                            <path d="M480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Z"/>
                        </svg>
                    }
                >
                    <div className="h-full w-full flex items-center justify-center p-8">
                        <div className="text-center max-w-2xl">
                            {/* Анимированная корона */}
                            <div className="text-8xl mb-6 animate-bounce">👑</div>
                            
                            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                МАСТЕР SOLIDITY
                            </h1>
                            
                            <div className="text-xl text-gray-300 mb-8">
                                Вы успешно прошли все 5 уровней Smart You и получили звание 
                                <span className="font-bold text-yellow-400"> &quot;Страж блокчейна&quot;</span>!
                            </div>

                            {/* Статистика */}
                            <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-purple-900/30 border border-purple-600 rounded-lg">
                                <div>
                                    <div className="text-3xl font-bold text-blue-400">5</div>
                                    <div className="text-sm text-gray-300">Уровней пройдено</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-yellow-400">100</div>
                                    <div className="text-sm text-gray-300">XP заработано</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-purple-400">5</div>
                                    <div className="text-sm text-gray-300">Бейджей получено</div>
                                </div>
                            </div>

                            {/* Достижения */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4">🏆 Ваши достижения:</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span>🥇</span>
                                        <span>Новичок в коде</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>🗳️</span>
                                        <span>Защитник демократии</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>🏪</span>
                                        <span>Торговец артефактов</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>🏛️</span>
                                        <span>DAO участник</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>🛡️</span>
                                        <span>Страж блокчейна</span>
                                    </div>
                                </div>
                            </div>

                            {/* Кнопки действий */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleGameComplete('certificate')}
                                        className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 font-semibold"
                                    >
                                        📜 Получить сертификат
                                    </button>
                                    <button
                                        onClick={() => handleGameComplete('leaderboard')}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold"
                                    >
                                        🏆 Таблица лидеров
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => handleGameComplete('restart')}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                    >
                                        🔄 Начать заново
                                    </button>
                                    <button
                                        onClick={() => handleGameComplete('levels')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                        📚 К уровням
                                    </button>
                                    <button
                                        onClick={() => handleGameComplete('home')}
                                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                    >
                                        🏠 На главную
                                    </button>
                                </div>
                            </div>

                            {/* Дополнительная информация */}
                            <div className="mt-8 p-4 bg-blue-900/30 border border-blue-600 rounded-lg text-sm">
                                <div className="font-semibold text-blue-300 mb-2">🚀 Что дальше?</div>
                                <div className="text-blue-200">
                                    Продолжайте изучать Solidity, участвуйте в хакатонах, создавайте собственные DeFi проекты 
                                    и присоединяйтесь к сообществу блокчейн-разработчиков!
                                </div>
                            </div>
                        </div>
                    </div>
                </Widget>
            </LevelView>
        );
    }

    return (
        <LevelView>
            <Widget
                windowMode
                title="Уровень 5: Испытание хакера"
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                        <path d="M280-240q-17 0-28.5-11.5T240-280v-280q0-17 11.5-28.5T280-600h40v-80q0-83 58.5-141.5T520-880q83 0 141.5 58.5T720-680v80h40q17 0 28.5 11.5T800-560v280q0 17-11.5 28.5T760-240H280Z"/>
                    </svg>
                }
            >
                <div className="h-full w-full overflow-y-scroll relative pb-24">
                    <div className="absolute bottom-16 right-3 flex gap-2 items-center">
                        <div className={`px-3 py-1 rounded text-sm ${isSecure ? 'bg-green-600' : 'bg-red-600'}`}>
                            {isSecure ? '🛡️ Защищён' : '⚠️ Уязвим'}
                        </div>
                        <button
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            onClick={handleCompile}
                            disabled={attackInProgress}
                        >
                            {attackInProgress ? 'Атака...' : 'Тест защиты'}
                        </button>
                    </div>

                    <div className="p-4">
                        <div className="text-2xl font-semibold">
                            🚨 Задача #5: Испытание хакера
                        </div>
                        <div className="mt-2 text-lg">
                            Защитите банковский контракт от реентранси атаки. Это финальное испытание!
                        </div>

                        {/* Панель безопасности */}
                        <div className="mt-4 space-y-3">
                            {/* Баланс контракта */}
                            <div className={`p-3 border rounded ${contractBalance > 500 ? 'bg-green-900/30 border-green-600' : 'bg-red-900/30 border-red-600'}`}>
                                <div className="font-semibold text-white">Баланс контракта:</div>
                                <div className="text-2xl font-bold">💰 {contractBalance} ETH</div>
                                {contractBalance < 500 && (
                                    <div className="text-red-300 text-sm">⚠️ Средства украдены хакером!</div>
                                )}
                            </div>

                            {/* Статус атаки */}
                            {attackInProgress && (
                                <div className="p-3 bg-red-900/50 border border-red-500 rounded animate-pulse">
                                    <div className="font-semibold text-red-300">🚨 АТАКА В ПРОЦЕССЕ</div>
                                    <div className="text-red-200">Хакер многократно вызывает withdraw()...</div>
                                </div>
                            )}

                            {/* Подсказки */}
                            <div className="p-3 bg-yellow-900/30 border border-yellow-600 rounded">
                                <div className="font-semibold text-yellow-300">🛡️ Методы защиты:</div>
                                <div className="text-yellow-200 text-sm space-y-1">
                                    <div>• Паттерн: Проверка → Эффект → Взаимодействие</div>
                                    <div>• Использовать modifier nonReentrant</div>
                                    <div>• Импортировать ReentrancyGuard</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 h-[400px] flex flex-col gap-4">
                            <Editor
                                language="solidity"
                                theme="vs-dark"
                                value={code}
                                onChange={(value?: string) => setCode(value ?? '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </Widget>
        </LevelView>
    );
}