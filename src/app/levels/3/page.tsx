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

export default function LevelThree() {
    const { addLog } = useConsole();
    const { completeLevel, goToNext, hasNextLevel } = useLevelTransition();
    const { initializePlayer, startGameSession, endGameSession, updatePlayerStats, unlockAchievement, setCurrentLevel } = useExtendedGameStore();
    const { playSound } = useSoundManager();

    const currentLevelNumber = 3;
    const hasNext = hasNextLevel(currentLevelNumber);

    const [code, setCode] = useState<string>(`// Создайте рынок магических артефактов
pragma solidity ^0.8.0;

contract MagicMarket {
    // TODO: Создайте структуру Item
    // struct Item { ... }
    
    mapping(uint256 => Item) public items;
    uint256 public itemCount;
    
    event ItemPurchased(uint256 itemId, address buyer, uint256 price);
    
    constructor() {
        // Добавляем начальные артефакты
        createItem("Магический меч", 100);
        createItem("Зелье исцеления", 50);
        createItem("Кольцо невидимости", 200);
    }
    
    function createItem(string memory name, uint256 price) public {
        itemCount++;
        // TODO: Создайте item в mapping
    }
    
    function purchase(uint256 itemId) public payable {
        // TODO: Проверьте существование item
        // TODO: Проверьте достаточность средств
        // TODO: Переведите владение
        // TODO: Отправьте событие
    }
}`);

    const [marketplace, setMarketplace] = useState([
        { id: 1, name: "Магический меч", price: 100, owner: "Магазин", sold: false },
        { id: 2, name: "Зелье исцеления", price: 50, owner: "Магазин", sold: false },
        { id: 3, name: "Кольцо невидимости", price: 200, owner: "Магазин", sold: false }
    ]);

    const [showNextLevelButton, setShowNextLevelButton] = useState(false);
    const [levelCompleted, setLevelCompleted] = useState(false);
    const [marketplaceActive, setMarketplaceActive] = useState(false);

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
        addLog('🏪 Миссия: Создайте магический рынок!');
        addLog('⚡ Реализуйте торговлю артефактами через struct и события');
        
        setTimeout(() => {
            spawnCactus();
        }, 1000);
    }, [initializePlayer, setCurrentLevel, startGameSession, addLog, currentLevelNumber]);

    const checkCode = () => {
        const hasStruct = code.includes('struct Item') && 
                         code.includes('string') && 
                         code.includes('uint256') && 
                         code.includes('address');
        const hasPurchaseLogic = code.includes('msg.value') && 
                               code.includes('owner') &&
                               code.includes('require');
        const hasEvent = code.includes('emit ItemPurchased');
        
        return hasStruct && hasPurchaseLogic && hasEvent;
    };

    const simulateMarketplace = () => {
        const buyers = ["Алиса", "Боб", "Чарли"];
        
        marketplace.forEach((item, index) => {
            if (!item.sold) {
                setTimeout(() => {
                    const buyer = buyers[Math.floor(Math.random() * buyers.length)];
                    
                    setMarketplace(prev => prev.map(i => 
                        i.id === item.id 
                            ? { ...i, owner: buyer, sold: true }
                            : i
                    ));
                    
                    addLog(`💰 ${buyer} купил "${item.name}" за ${item.price} токенов`);
                    addLog(`📡 Event: ItemPurchased(${item.id}, ${buyer}, ${item.price})`);
                }, index * 1500);
            }
        });
    };

    const handleCompile = () => {
        addLog('🔍 Компиляция контракта рынка...');
        playSound('run');
        
        if (checkCode()) {
            playSound('success');
            addLog('✅ Контракт магического рынка развёрнут!');
            addLog('🎉 Торговля артефактами активирована!');
            setMarketplaceActive(true);
            setLevelCompleted(true);
            
            // Завершаем игровую сессию
            endGameSession(true, 'excellent');
            
            // Обновляем статистику игрока
            const stars = 3;
            const sessionTime = Date.now() - (Date.now() - 50000);
            updatePlayerStats(currentLevelNumber, stars, sessionTime);
            
            // Разблокируем достижение
            unlockAchievement('market_master');
            
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
            
            simulateMarketplace();
            complete();
        } else {
            playSound('error');
            addLog('❌ Ошибки в реализации рынка!');
            addLog('💡 Создайте struct Item с полями: string name, uint256 price, address owner');
            addLog('💡 В purchase() проверьте msg.value >= item.price');
            addLog('💡 Не забудьте emit ItemPurchased после покупки');
        }
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
                title="Уровень 3: Рынок магии"
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                        <path d="M280-600v-80q0-83 58.5-141.5T480-880q83 0 141.5 58.5T680-680v80h40q33 0 56.5 23.5T800-520v360q0 33-23.5 56.5T720-80H240q-33 0-56.5-23.5T160-160v-360q0-33 23.5-56.5T240-600h40Zm80 0h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80Z"/>
                    </svg>
                }
            >
                <div className="h-full w-full overflow-y-scroll relative pb-24">
                    <div className="absolute bottom-16 right-3 flex gap-2">
                        <div className={`px-3 py-1 rounded text-sm ${marketplaceActive ? 'bg-green-600' : 'bg-purple-600'}`}>
                            {marketplaceActive ? '🏪 Рынок активен' : '🔒 Рынок закрыт'}
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
                                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                                onClick={handleCompile}
                                disabled={levelCompleted}
                            >
                                {levelCompleted ? 'Выполнено ✓' : 'Открыть рынок'}
                            </button>
                        )}
                    </div>

                    <div className="p-4">
                        <div className="text-2xl font-semibold">
                            🏪 Задача #3: Рынок магии
                        </div>
                        <div className="mt-2 text-lg">
                            Создайте смарт-контракт для торговли магическими артефактами с использованием структур и событий.
                        </div>

                        {/* Сообщение о завершении */}
                        {levelCompleted && (
                            <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded">
                                <div className="font-semibold text-green-300">🎉 Уровень пройден!</div>
                                <div className="text-green-200">
                                    Отлично! Вы создали рабочий рынок магических артефактов. 
                                    {hasNext ? " Следующий вызов ждёт вас - создание DAO!" : " Все уровни завершены!"}
                                </div>
                            </div>
                        )}

                        {/* Витрина рынка */}
                        <div className="mt-4 p-3 bg-purple-900/30 border border-purple-600 rounded">
                            <div className="font-semibold text-purple-300">Витрина магического рынка:</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                                {marketplace.map((item) => (
                                    <div key={item.id} className={`p-2 rounded transition-all duration-300 ${
                                        item.sold ? 'bg-gray-700 border border-gray-600' : 'bg-purple-800/30 border border-purple-500/30'
                                    }`}>
                                        <div className="font-semibold">{item.name}</div>
                                        <div className="text-sm">💰 {item.price} токенов</div>
                                        <div className="text-xs">👤 Владелец: {item.owner}</div>
                                        <div className={`text-xs font-medium ${item.sold ? 'text-red-300' : 'text-green-300'}`}>
                                            {item.sold ? '❌ Продано' : '✅ В продаже'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Подсказки для реализации */}
                        {!levelCompleted && (
                            <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded">
                                <div className="font-semibold text-yellow-300">💡 Подсказки для реализации:</div>
                                <div className="text-yellow-200 text-sm space-y-1 mt-2">
                                    <div>• Создайте struct Item с полями: string name, uint256 price, address owner</div>
                                    <div>• В createItem() сохраните item в mapping: items[itemCount] = Item(...)</div>
                                    <div>• В purchase() проверьте: require(msg.value {'>='}= items[itemId].price)</div>
                                    <div>• Обновите владельца: items[itemId].owner = msg.sender</div>
                                    <div>• Добавьте событие: emit ItemPurchased(itemId, msg.sender, price)</div>
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