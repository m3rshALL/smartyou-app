'use client';

import { useEffect, useState } from 'react';
import Widget from '@/shared/ui/Widget';
import LevelView from '@/shared/ui/LevelView';
import { useConsole } from '@/features/model/useConsole';
import { useCompletedLevels } from '@/features/model/useLevels';
import { Editor } from '@monaco-editor/react';
import { complete, run, spawnCactus } from '@/features/model/gameMechanics';
import { useRouter } from 'next/navigation';

export default function LevelTwo() {
    const router = useRouter();
    const { addLog } = useConsole();
    const { setCompletedLevels, completedLevels } = useCompletedLevels();

    const [code, setCode] = useState<string>(`// Создайте систему голосования DAO
pragma solidity ^0.8.0;

contract Voting {
    address public owner;
    mapping(address => bool) public hasVoted;
    mapping(string => uint256) public votes;
    
    string[] public candidates;
    
    constructor() {
        owner = msg.sender;
        candidates = ["Alice", "Bob", "Charlie"];
    }
    
    // TODO: Добавьте модификатор onlyRegistered 
    
    function vote(string memory candidate) public {
        // TODO: Проверьте, что пользователь не голосовал
        // TODO: Отметьте, что пользователь проголосовал
        votes[candidate]++;
    }
    
    function getVotes(string memory candidate) public view returns (uint256) {
        return votes[candidate];
    }
}`);

    const [votingResults, setVotingResults] = useState<Record<string, number>>({
        Alice: 0,
        Bob: 0,
        Charlie: 0
    });
    const [voters, setVoters] = useState<string[]>([]);

    useEffect(() => {
        if (completedLevels < 1) {
            router.push('/levels/');
            return;
        }

        run();
        addLog('🗳️ Миссия: Создайте безопасную систему голосования!');
        addLog('⚠️ Внимание: нужно предотвратить повторное голосование');
        
        setTimeout(() => {
            spawnCactus();
        }, 1000);
    }, [completedLevels]);

    if (completedLevels < 1) {
        return <></>;
    }

    const checkCode = () => {
        const hasRequire = code.includes('require(!hasVoted[msg.sender]') || 
                            code.includes('require(hasVoted[msg.sender] == false');
        const hasVotedUpdate = code.includes('hasVoted[msg.sender] = true');
        
        return hasRequire && hasVotedUpdate;
    };

    const processVote = (voter: string, candidate: string) => {
        if (voters.includes(voter)) {
            addLog(`❌ ${voter} пытается голосовать повторно!`);
        } else {
            setVoters(prev => [...prev, voter]);
            setVotingResults(prev => ({
                ...prev,
                [candidate]: prev[candidate] + 1
            }));
            addLog(`✅ ${voter} проголосовал за ${candidate}`);
        }
    };

    const scheduleVote = (voter: string, index: number, candidates: string[]) => {
        setTimeout(() => {
            const candidate = candidates[Math.floor(Math.random() * candidates.length)];
            processVote(voter, candidate);
        }, index * 1000);
    };

    const simulateVoting = () => {
        const testVoters = ["Пётр", "Анна", "Максим"];
        const candidates = ["Alice", "Bob", "Charlie"];
        
        testVoters.forEach((voter, index) => {
            scheduleVote(voter, index, candidates);
        });
    };

    const handleCompile = () => {
        addLog('🔍 Компиляция контракта голосования...');
        
        if (checkCode()) {
            addLog('✅ Контракт успешно скомпилирован!');
            addLog('🎉 Система голосования защищена от злоупотреблений!');
            
            // Обновляем прогресс
            if (completedLevels < 2) {
                setCompletedLevels(2);
                addLog('🏆 Получено звание: "Защитник демократии"');
                addLog('🔓 Разблокирован режим "Учебное DAO"');
            }
            
            simulateVoting();
            complete();
        } else {
            addLog('❌ В коде есть уязвимости безопасности!');
            addLog('💡 Добавьте проверку require(!hasVoted[msg.sender], "Already voted")');
            addLog('💡 Не забудьте установить hasVoted[msg.sender] = true');
        }
    };

    return (
        <LevelView>
            <Widget
                windowMode
                title="Уровень 2: Электронное голосование"
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                        <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
                    </svg>
                }
            >
                <div className="h-full w-full overflow-y-scroll relative pb-24">
                    <div className="absolute bottom-16 right-3">
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={handleCompile}
                        >
                            Запустить голосование
                        </button>
                    </div>

                    <div className="p-4">
                        <div className="text-2xl font-semibold">
                            🗳️ Задача #2: Электронное голосование
                        </div>
                        <div className="mt-2 text-lg">
                            Создайте безопасную систему голосования, которая предотвращает повторное голосование.
                        </div>

                        {/* Результаты голосования */}
                        <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600 rounded">
                            <div className="font-semibold text-blue-300">Результаты голосования:</div>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {Object.entries(votingResults).map(([candidate, votes]) => (
                                    <div key={candidate} className="text-center">
                                        <div className="font-semibold">{candidate}</div>
                                        <div className="text-blue-200">{votes} голосов</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 h-[500px] flex flex-col gap-4">
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