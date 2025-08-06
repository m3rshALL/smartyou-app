'use client';

import { useEffect, useState } from 'react';
import Widget from '@/shared/ui/Widget';
import LevelView from '@/shared/ui/LevelView';
import { useConsole } from '@/features/model/useConsole';
import { Editor } from '@monaco-editor/react';
import { complete, run, spawnCactus } from '@/features/model/gameMechanics';
import { useLevelTransition } from '@/features/model/levelTransition';

export default function LevelOne() {
    const { addLog } = useConsole();
    const { completeLevel, showNextLevelOption, goToNext, hasNextLevel } = useLevelTransition();

    const [code, setCode] = useState<string>(`// Исправьте ошибки в коде контракта
pragma solidity ^0.8.0;

contract Wallet {
    address public owner;
    uint256 public balance;
    
    // TODO: Добавьте конструктор
    
    // TODO: Сделайте функцию payable
    function deposit() public {
        balance += msg.value;
    }
    
    function getBalance() public view returns (uint256) {
        return balance;
    }
}`);

    const [hints, setHints] = useState<string[]>([]);
    const [walletActive, setWalletActive] = useState(false);
    const [showNextLevelButton, setShowNextLevelButton] = useState(false);
    const [levelCompleted, setLevelCompleted] = useState(false);

    useEffect(() => {
        run();
        addLog('🎯 Миссия: Восстановите кошелёк!');
        addLog('💡 Подсказка: Нужно добавить constructor и сделать deposit() payable');
        
        setTimeout(() => {
            spawnCactus();
        }, 1000);
    }, []);

    const checkCode = () => {
        const hasConstructor = code.includes('constructor');
        const hasPayable = code.includes('payable');
        const hasContract = code.includes('contract');
        
        const newHints = [];
        
        if (!hasConstructor) {
            newHints.push('Добавьте функцию constructor для установки владельца');
        }
        if (!hasPayable) {
            newHints.push('Функция deposit() должна быть payable для получения ETH');
        }
        
        setHints(newHints);
        return hasConstructor && hasPayable && hasContract;
    };

    const handleCompile = () => {
        addLog('🔍 Проверка кода...');
        
        if (checkCode()) {
            addLog('✅ Код успешно скомпилирован!');
            addLog('🎉 Кошелёк восстановлен! Средства в безопасности!');
            setWalletActive(true);
            setLevelCompleted(true);
            
            // Завершаем уровень
            const isNewCompletion = completeLevel(1);
            
            // Показываем кнопку перехода через 2 секунды
            setTimeout(() => {
                setShowNextLevelButton(true);
                if (hasNextLevel) {
                    addLog('➡️ Следующий уровень разблокирован!');
                } else {
                    addLog('🎉 Поздравляем! Все уровни пройдены!');
                }
            }, 2000);
            
            complete();
        } else {
            addLog('❌ Ошибки в коде. Проверьте подсказки.');
            setHints(hints);
            hints.forEach(hint => addLog(`💡 ${hint}`));
        }
    };

    return (
        <LevelView>
            <Widget
                windowMode
                title="Уровень 1: Кошелёк в опасности"
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                        <path d="M280-240q-17 0-28.5-11.5T240-280v-280q0-17 11.5-28.5T280-600h40v-80q0-83 58.5-141.5T520-880q83 0 141.5 58.5T720-680v80h40q17 0 28.5 11.5T800-560v280q0 17-11.5 28.5T760-240H280Zm240-200q33 0 56.5-23.5T600-520q0-33-23.5-56.5T520-600q-33 0-56.5 23.5T440-520q0 33 23.5 56.5T520-440ZM360-600h320v-80q0-66-47-113t-113-47q-66 0-113 47t-47 113v80Z"/>
                    </svg>
                }
            >
                <div className="h-full w-full overflow-y-scroll relative pb-24">
                    <div className="absolute bottom-16 right-3 flex gap-2">
                        <div className={`px-3 py-1 rounded text-sm ${walletActive ? 'bg-green-600' : 'bg-red-600'}`}>
                            {walletActive ? '🔓 Кошелёк активен' : '🔒 Кошелёк заблокирован'}
                        </div>
                        
                        {/* Показываем кнопку следующего уровня или завершения */}
                        {showNextLevelButton ? (
                            hasNextLevel ? (
                                <button
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 animate-pulse"
                                    onClick={goToNext}
                                >
                                    Следующий уровень →
                                </button>
                            ) : (
                                <button
                                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                                    onClick={() => goToNext()}
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
                                {levelCompleted ? 'Выполнено ✓' : 'Запуск'}
                            </button>
                        )}
                    </div>

                    <div className="p-4">
                        <div className="text-2xl font-semibold">
                            🏦 Задача #1: Кошелёк в опасности
                        </div>
                        <div className="mt-2 text-lg">
                            Ваш смарт-контракт кошелька содержит критические ошибки! 
                            Исправьте код, чтобы восстановить доступ к средствам.
                        </div>

                        {/* Подсказки - показываем только если уровень не завершён */}
                        {hints.length > 0 && !levelCompleted && (
                            <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded">
                                <div className="font-semibold text-yellow-300">AI-наставник советует:</div>
                                {hints.map((hint, idx) => (
                                    <div key={idx} className="text-yellow-200">• {hint}</div>
                                ))}
                            </div>
                        )}

                        {/* Сообщение о завершении */}
                        {levelCompleted && (
                            <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded">
                                <div className="font-semibold text-green-300">🎉 Уровень пройден!</div>
                                <div className="text-green-200">
                                    Отлично! Вы исправили ошибки и восстановили кошелёк. 
                                    {hasNextLevel ? " Переходите к следующему испытанию!" : " Все уровни завершены!"}
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
