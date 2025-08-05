'use client';

import { useCompletedLevels } from '@/features/model/useLevels';
import { useRouter } from 'next/navigation';
import Widget from '@/shared/ui/Widget';

export default function Leaderboard() {
    const { completedLevels } = useCompletedLevels();
    const router = useRouter();

    const leaders = [
        { rank: 1, name: "Вы", levels: completedLevels, xp: completedLevels * 20, badge: "🛡️ Страж блокчейна" },
        { rank: 2, name: "Alice_dev", levels: 5, xp: 100, badge: "🛡️ Страж блокчейна" },
        { rank: 3, name: "BlockchainBob", levels: 4, xp: 80, badge: "🏛️ DAO участник" },
        { rank: 4, name: "CryptoCharlie", levels: 3, xp: 60, badge: "🏪 Торговец артефактов" },
        { rank: 5, name: "SoliditySeeker", levels: 2, xp: 40, badge: "🗳️ Защитник демократии" },
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-4xl mx-auto">
                <Widget title="🏆 Таблица лидеров Smart You" icon={null}>
                    <div className="space-y-4">
                        {leaders.map((leader) => (
                            <div
                                key={leader.rank}
                                className={`p-4 rounded-lg border ${
                                    leader.name === "Вы" 
                                        ? 'bg-yellow-900/30 border-yellow-600' 
                                        : 'bg-gray-800/50 border-gray-600'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                            leader.rank === 1 ? 'bg-yellow-600' :
                                            leader.rank === 2 ? 'bg-gray-400' :
                                            leader.rank === 3 ? 'bg-orange-600' : 'bg-gray-600'
                                        }`}>
                                            {leader.rank}
                                        </div>
                                        <div>
                                            <div className="font-semibold">{leader.name}</div>
                                            <div className="text-sm text-gray-400">{leader.badge}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">{leader.levels}/5 уровней</div>
                                        <div className="text-sm text-gray-400">{leader.xp} XP</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => router.push('/levels/')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Вернуться к уровням
                        </button>
                    </div>
                </Widget>
            </div>
        </div>
    );
}