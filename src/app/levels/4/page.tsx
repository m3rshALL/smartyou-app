'use client';

import { useEffect, useState } from 'react';
import Widget from '@/shared/ui/Widget';
import LevelView from '@/shared/ui/LevelView';
import { useConsole } from '@/features/model/useConsole';
import { Editor } from '@monaco-editor/react';
import { complete, run, spawnCactus } from '@/features/model/gameMechanics';
import { useLevelTransition } from '@/features/model/levelTransition';
import { useRouter } from 'next/navigation';

export default function LevelFour() {
    const router = useRouter();
    const { addLog } = useConsole();
    const { completeLevel, goToNext, hasNextLevel } = useLevelTransition();

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

    const [proposals, setProposals] = useState([
        {
            id: 1,
            description: "Увеличить награды за безопасность на 20%",
            votesFor: 0,
            votesAgainst: 0,
            deadline: Date.now() + 30000, // 30 секунд
            executed: false
        }
    ]);

    const [voters] = useState([
        { name: "Алиса", tokens: 5, address: "0xAb8..." },
        { name: "Боб", tokens: 3, address: "0x4B2..." },
        { name: "Чарли", tokens: 2, address: "0x787..." }
    ]);

    const [showNextLevelButton, setShowNextLevelButton] = useState(false);
    const [levelCompleted, setLevelCompleted] = useState(false);
    const [daoActive, setDaoActive] = useState(false);

    useEffect(() => {
        // Проверяем доступ к уровню (должен быть завершен уровень 3)
        // TODO: Implement level access check if needed
        
        run();
        addLog('🏛️ Миссия: Создайте децентрализованную автономную организацию!');
        addLog('⚖️ Реализуйте взвешенное голосование по токенам');
        
        setTimeout(() => {
            spawnCactus();
        }, 1000);
    }, []);

    const checkCode = () => {
        const hasStruct = code.includes('struct Proposal') && 
                         code.includes('deadline') && 
                         code.includes('votesFor');
        const hasWeightedVoting = code.includes('tokenBalance[msg.sender]') || 
                                code.includes('tokenBalance');
        const hasTimeCheck = code.includes('block.timestamp') || 
                           code.includes('deadline');
        
        return hasStruct && hasWeightedVoting && hasTimeCheck;
    };

    const simulateDAOVoting = () => {
        addLog('🗳️ Начинается голосование в DAO...');
        
        voters.forEach((voter, index) => {
            setTimeout(() => {
                const support = Math.random() > 0.3; // 70% за, 30% против
                const weight = voter.tokens;
                
                setProposals(prev => prev.map(p => p.id === 1 ? {
                    ...p,
                    votesFor: support ? p.votesFor + weight : p.votesFor,
                    votesAgainst: !support ? p.votesAgainst + weight : p.votesAgainst
                } : p));
                
                addLog(`${support ? '✅' : '❌'} ${voter.name} голосует ${support ? 'ЗА' : 'ПРОТИВ'} (+${weight} токенов)`);
                
                if (index === voters.length - 1) {
                    setTimeout(() => {
                        addLog('⏰ Время голосования истекло!');
                        addLog('📊 Подсчёт результатов...');
                        
                        const proposal = proposals[0];
                        if (proposal.votesFor > proposal.votesAgainst) {
                            addLog('🎉 Предложение ПРИНЯТО! Выполняется...');
                        } else {
                            addLog('❌ Предложение ОТКЛОНЕНО');
                        }
                    }, 2000);
                }
            }, index * 1000);
        });
    };

    const handleCompile = () => {
        addLog('🔍 Развёртывание DAO контракта...');
        
        if (checkCode()) {
            addLog('✅ DAO контракт успешно развёрнут!');
            addLog('🎉 Совет защитников активирован!');
            setDaoActive(true);
            setLevelCompleted(true);
            
            // Завершаем уровень
            const isNewCompletion = completeLevel(4);
            
            // Показываем кнопку перехода через 2 секунды
            setTimeout(() => {
                setShowNextLevelButton(true);
                if (hasNextLevel) {
                    addLog('➡️ ФИНАЛЬНЫЙ УРОВЕНЬ "Испытание хакера" разблокирован!');
                    addLog('⚠️ Приготовьтесь к серьёзному вызову!');
                } else {
                    addLog('🎉 Поздравляем! Все уровни пройдены!');
                }
            }, 3000);
            
            simulateDAOVoting();
            complete();
        } else {
            addLog('❌ Ошибки в DAO контракте!');
            addLog('💡 Создайте struct Proposal с полями: description, votesFor, votesAgainst, deadline');
            addLog('💡 В vote() умножайте голос на tokenBalance[msg.sender]');
            addLog('💡 Проверяйте block.timestamp <= deadline');
        }
    };

    return (
        <LevelView>
            <Widget
                windowMode
                title="Уровень 4: DAO — Совет защитников"
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                        <path d="M160-120v-480l320-240 320 240v480H560v-280H400v280H160Z"/>
                    </svg>
                }
            >
                <div className="h-full w-full overflow-y-scroll relative pb-24">
                    <div className="absolute bottom-16 right-3 flex gap-2">
                        <div className={`px-3 py-1 rounded text-sm ${daoActive ? 'bg-green-600' : 'bg-indigo-600'}`}>
                            {daoActive ? '🏛️ DAO активно' : '🔒 DAO неактивно'}
                        </div>
                        
                        {/* Показываем кнопку следующего уровня или завершения */}
                        {showNextLevelButton ? (
                            hasNextLevel ? (
                                <button
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 animate-pulse"
                                    onClick={goToNext}
                                >
                                    ФИНАЛЬНЫЙ УРОВЕНЬ →
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
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                onClick={handleCompile}
                                disabled={levelCompleted}
                            >
                                {levelCompleted ? 'Выполнено ✓' : 'Активировать DAO'}
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
                                    {hasNextLevel ? " Финальное испытание ждёт вас!" : " Все уровни завершены!"}
                                </div>
                            </div>
                        )}

                        {/* Панель DAO */}
                        <div className="mt-4 space-y-3">
                            {/* Участники */}
                            <div className="p-3 bg-indigo-900/30 border border-indigo-600 rounded">
                                <div className="font-semibold text-indigo-300">Участники DAO:</div>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {voters.map((voter) => (
                                        <div key={voter.name} className="text-center">
                                            <div className="font-semibold">{voter.name}</div>
                                            <div className="text-sm">🪙 {voter.tokens} токенов</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Предложения */}
                            <div className="p-3 bg-green-900/30 border border-green-600 rounded">
                                <div className="font-semibold text-green-300">Активные предложения:</div>
                                {proposals.map((proposal) => (
                                    <div key={proposal.id} className="mt-2">
                                        <div className="font-medium">{proposal.description}</div>
                                        <div className="flex gap-4 text-sm mt-1">
                                            <span className="text-green-300">✅ ЗА: {proposal.votesFor}</span>
                                            <span className="text-red-300">❌ ПРОТИВ: {proposal.votesAgainst}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Подсказки для реализации */}
                        {!levelCompleted && (
                            <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded">
                                <div className="font-semibold text-yellow-300">💡 Подсказки для реализации DAO:</div>
                                <div className="text-yellow-200 text-sm space-y-1 mt-2">
                                    <div>• Создайте struct Proposal: description, votesFor, votesAgainst, deadline, executed</div>
                                    <div>• В createProposal(): proposals.push(Proposal(...)), proposalCount++</div>
                                    <div>• В vote(): require(!hasVoted[proposalId][msg.sender]), проверить deadline</div>
                                    <div>• Взвешенное голосование: votesFor += tokenBalance[msg.sender]</div>
                                    <div>• В executeProposal(): проверить block.timestamp &gt; deadline</div>
                                </div>
                            </div>
                        )}

                        {/* Предупреждение о финальном уровне */}
                        {showNextLevelButton && hasNextLevel && (
                            <div className="mt-4 p-3 bg-red-900/30 border border-red-600 rounded animate-pulse">
                                <div className="font-semibold text-red-300">⚠️ ВНИМАНИЕ: Финальное испытание!</div>
                                <div className="text-red-200 text-sm">
                                    Следующий уровень - это серьёзный вызов. Вам предстоит защитить контракт от реальных хакерских атак. 
                                    Приготовьтесь применить все полученные знания!
                                </div>
                            </div>
                        )}

                        <div className="mt-6 h-[400px] flex flex-col gap-4">
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