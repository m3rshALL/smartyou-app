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

export default function LevelFour() {
    const { addLog } = useConsole();
    const { completeLevel, goToNext, hasNextLevel } = useLevelTransition();
    const { initializePlayer, startGameSession, endGameSession, updatePlayerStats, unlockAchievement, setCurrentLevel } = useExtendedGameStore();
    const { playSound } = useSoundManager();

    const currentLevelNumber = 4;
    const hasNext = hasNextLevel(currentLevelNumber);

    const [code, setCode] = useState<string>(`// Создайте DAO для управления сообществом
pragma solidity ^0.8.0;

contract DefenderDAO {
    // TODO: Создайте структуру Proposal
    // struct Proposal { ... }
    
    mapping(address => uint256) public tokenBalance;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    Proposal[] public proposals;
    uint256 public proposalCount;
    
    constructor() {
        // Начальные токены участникам
        tokenBalance[0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2] = 5; // Алиса
        tokenBalance[0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db] = 3; // Боб  
        tokenBalance[0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB] = 2; // Чарли
    }
    
    function createProposal(string memory description) public {
        // TODO: Создайте предложение с таймером
    }
    
    function vote(uint256 proposalId, bool support) public {
        // TODO: Реализуйте взвешенное голосование
        // TODO: Учитывайте баланс токенов голосующего
    }
    
    function executeProposal(uint256 proposalId) public {
        // TODO: Проверьте истечение времени
        // TODO: Проверьте результат голосования
    }
}`);

    const [dao, setDao] = useState({
        members: [
            { address: "Алиса", tokens: 5, voted: false },
            { address: "Боб", tokens: 3, voted: false },
            { address: "Чарли", tokens: 2, voted: false }
        ],
        proposals: [
            { id: 1, description: "Увеличить бюджет на защиту", votesFor: 0, votesAgainst: 0, executed: false },
            { id: 2, description: "Добавить новых защитников", votesFor: 0, votesAgainst: 0, executed: false }
        ]
    });

    const [showNextLevelButton, setShowNextLevelButton] = useState(false);
    const [levelCompleted, setLevelCompleted] = useState(false);
    const [daoActive, setDaoActive] = useState(false);

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
        addLog('🏛️ Миссия: Создайте децентрализованную автономную организацию!');
        addLog('⚖️ Реализуйте взвешенное голосование по токенам');
        
        setTimeout(() => {
            spawnCactus();
        }, 1000);
    }, [initializePlayer, setCurrentLevel, startGameSession, addLog, currentLevelNumber]);

    const checkCode = () => {
        const hasStruct = code.includes('struct Proposal') && 
                         code.includes('description') && 
                         code.includes('votesFor') &&
                         code.includes('deadline');
        const hasCreateProposal = code.includes('proposals.push') && 
                                 code.includes('proposalCount++');
        const hasVote = code.includes('hasVoted') && 
                       code.includes('tokenBalance[msg.sender]') &&
                       code.includes('deadline');
        const hasExecute = code.includes('block.timestamp') && 
                          code.includes('executed = true');
        
        return hasStruct && hasCreateProposal && hasVote && hasExecute;
    };

    const simulateDAO = () => {
        addLog('👥 Участники DAO готовы к голосованию:');
        dao.members.forEach(member => {
            addLog(`  • ${member.address}: ${member.tokens} токенов`);
        });

        // Симуляция голосования
        setTimeout(() => {
            dao.proposals.forEach((proposal, index) => {
                setTimeout(() => {
                    const forVotes = Math.floor(Math.random() * 8) + 2;
                    const againstVotes = Math.floor(Math.random() * 3);
                    const executed = forVotes > againstVotes;
                    
                    setDao(prev => ({
                        ...prev,
                        proposals: prev.proposals.map(p => 
                            p.id === proposal.id 
                                ? { ...p, votesFor: forVotes, votesAgainst: againstVotes, executed }
                                : p
                        )
                    }));
                    
                    addLog(`🗳️ Предложение #${proposal.id}:`);
                    addLog(`   ✅ За: ${forVotes} | ❌ Против: ${againstVotes}`);
                    if (executed) {
                        addLog(`   🎉 Предложение принято и выполнено!`);
                    }
                }, index * 3000);
            });
        }, 2000);

        // Обновляем состояние участников
        setTimeout(() => {
            setDao(prev => ({
                ...prev,
                members: prev.members.map(m => ({ ...m, voted: true }))
            }));
        }, 1500);
    };

    const handleCompile = () => {
        addLog('🔍 Компиляция DAO контракта...');
        playSound('run');
        
        if (checkCode()) {
            playSound('success');
            addLog('✅ DAO контракт успешно развёрнут!');
            addLog('🎉 Совет защитников активирован!');
            setDaoActive(true);
            setLevelCompleted(true);
            
            // Завершаем игровую сессию
            endGameSession(true, 'excellent');
            
            // Обновляем статистику игрока
            const stars = 3;
            const sessionTime = Date.now() - (Date.now() - 60000);
            updatePlayerStats(currentLevelNumber, stars, sessionTime);
            
            // Разблокируем достижение
            unlockAchievement('dao_architect');
            
            // Завершаем уровень
            completeLevel(currentLevelNumber);
            
            // Показываем кнопку перехода через 2 секунды
            setTimeout(() => {
                setShowNextLevelButton(true);
                if (hasNext) {
                    addLog('➡️ ФИНАЛЬНЫЙ УРОВЕНЬ "Испытание хакера" разблокирован!');
                    addLog('⚠️ Приготовьтесь к серьёзному вызову!');
                } else {
                    addLog('🎉 Поздравляем! Все уровни пройдены!');
                }
            }, 2000);
            
            simulateDAO();
            complete();
        } else {
            playSound('error');
            addLog('❌ DAO содержит ошибки!');
            addLog('💡 Создайте struct Proposal: description, votesFor, votesAgainst, deadline, executed');
            addLog('💡 В createProposal(): proposals.push(Proposal(...)), proposalCount++');
            addLog('💡 В vote(): require(!hasVoted[proposalId][msg.sender]), проверить deadline');
            addLog('💡 В executeProposal(): проверить block.timestamp > deadline');
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
                title="Уровень 4: DAO — Совет защитников"
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                        <path d="M480-120q-151 0-255.5-46.5T120-280v-400q0-66 105.5-113T480-840q149 0 254.5 47T840-680v400q0 67-104.5 113.5T480-120Zm0-479q89 0 179-25.5T760-679q-11-29-100.5-55T480-760q-91 0-180.5 26T199-679q11 29 101 54.5T480-599Zm0 199q42 0 81-4t74.5-11.5q35.5-7.5 67-17.5t57.5-22v-120q-26 14-57.5 23.5t-67 17Q600-528 561-524t-81 4q-42 0-82-4t-75.5-11.5Q287-543 256-552.5T200-576v120q26 14 57.5 23.5t67 17Q360-408 399.5-404t80.5 4Zm0 200q46 0 93.5-7t84.5-18.5q37-11.5 67-26t32-29.5v-98q-26 14-57.5 23.5t-67 17Q600-328 561-324t-81 4q-42 0-82-4t-75.5-11.5Q287-343 256-352.5T200-376v99q2 12 32 27t67 26q37 11.5 84.5 18.5T480-200Z"/>
                    </svg>
                }
            >
                <div className="h-full w-full overflow-y-scroll relative pb-24">
                    <div className="absolute bottom-16 right-3 flex gap-2">
                        <div className={`px-3 py-1 rounded text-sm ${daoActive ? 'bg-green-600' : 'bg-blue-600'}`}>
                            {daoActive ? '🏛️ DAO активна' : '🔒 DAO не развёрнута'}
                        </div>
                        
                        {/* Показываем кнопку следующего уровня или завершения */}
                        {showNextLevelButton ? (
                            hasNext ? (
                                <button
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 animate-pulse"
                                    onClick={handleNextLevel}
                                >
                                    Финальный уровень →
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
                                {levelCompleted ? 'Выполнено ✓' : 'Развернуть DAO'}
                            </button>
                        )}
                    </div>

                    <div className="p-4">
                        <div className="text-2xl font-semibold">
                            🏛️ Задача #4: DAO — Совет защитников
                        </div>
                        <div className="mt-2 text-lg">
                            Создайте децентрализованную автономную организацию с взвешенным голосованием по токенам.
                        </div>

                        {/* Сообщение о завершении */}
                        {levelCompleted && (
                            <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded">
                                <div className="font-semibold text-green-300">🎉 Уровень пройден!</div>
                                <div className="text-green-200">
                                    Превосходно! Вы создали работающую DAO с взвешенным голосованием. 
                                    {hasNext ? " Финальное испытание ждёт вас!" : " Все уровни завершены!"}
                                </div>
                            </div>
                        )}

                        {/* Панель DAO */}
                        <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600 rounded">
                            <div className="font-semibold text-blue-300">Состояние DefenderDAO:</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div>
                                    <div className="text-sm font-medium">👥 Участники ({dao.members.length}):</div>
                                    {dao.members.map((member, idx) => (
                                        <div key={idx} className={`text-xs p-2 rounded mt-1 ${
                                            member.voted ? 'bg-green-800/30 border border-green-600/30' : 'bg-gray-800/50'
                                        }`}>
                                            <div>{member.address}</div>
                                            <div>Токенов: {member.tokens}</div>
                                            <div className={member.voted ? 'text-green-300' : 'text-gray-400'}>
                                                {member.voted ? '✅ Проголосовал' : '⏳ Ожидает'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="text-sm font-medium">📋 Предложения:</div>
                                    {dao.proposals.map((proposal) => (
                                        <div key={proposal.id} className={`text-xs p-2 rounded mt-1 ${
                                            proposal.executed 
                                                ? 'bg-green-800/30 border border-green-600/30' 
                                                : proposal.votesFor > 0 || proposal.votesAgainst > 0
                                                    ? 'bg-yellow-800/30 border border-yellow-600/30'
                                                    : 'bg-gray-800/30 border border-gray-600/30'
                                        }`}>
                                            <div className="font-medium">#{proposal.id}</div>
                                            <div>{proposal.description}</div>
                                            <div>За: {proposal.votesFor} | Против: {proposal.votesAgainst}</div>
                                            <div className={proposal.executed ? 'text-green-300' : 'text-gray-400'}>
                                                {proposal.executed ? '✅ Выполнено' : '⏳ Ожидает'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Подсказки для реализации */}
                        {!levelCompleted && (
                            <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded">
                                <div className="font-semibold text-yellow-300">💡 Подсказки для реализации:</div>
                                <div className="text-yellow-200 text-sm space-y-1 mt-2">
                                    <div>• Создайте struct Proposal: description, votesFor, votesAgainst, deadline, executed</div>
                                    <div>• В createProposal(): proposals.push(Proposal(...)), proposalCount++</div>
                                    <div>• В vote(): require(!hasVoted[proposalId][msg.sender]), проверить deadline</div>
                                    <div>• Взвешенное голосование: votesFor += tokenBalance[msg.sender]</div>
                                    <div>• В executeProposal(): проверить block.timestamp {'>'} deadline</div>
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