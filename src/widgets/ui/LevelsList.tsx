'use client';

import { useRouter } from 'next/navigation';
import { useCompletedLevels } from '@/features/model/useLevels';
import Widget from '@/shared/ui/Widget';

export default function LevelsList() {
    const router = useRouter();
    const { completedLevels, canAccessLevel, goToNextLevel } = useCompletedLevels();

    const levels = [
        {
            id: 1,
            title: "Кошелёк в опасности",
            description: "Основы смарт-контрактов",
            difficulty: "Начальный",
            xp: 10,
            badge: "Новичок в коде"
        },
        {
            id: 2,
            title: "Электронное голосование",
            description: "Mapping и контроль доступа",
            difficulty: "Начально-средний",
            xp: 15,
            badge: "Защитник демократии"
        },
        {
            id: 3,
            title: "Рынок магии",
            description: "Struct и взаимодействие",
            difficulty: "Средний",
            xp: 20,
            badge: "Торговец артефактов"
        },
        {
            id: 4,
            title: "DAO — Совет защитников",
            description: "Децентрализованное управление",
            difficulty: "Средне-продвинутый",
            xp: 25,
            badge: "DAO участник"
        },
        {
            id: 5,
            title: "Испытание хакера",
            description: "Безопасность и уязвимости",
            difficulty: "Продвинутый",
            xp: 30,
            badge: "Страж блокчейна"
        }
    ];

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "Начальный": return "text-green-400";
            case "Начально-средний": return "text-yellow-400";
            case "Средний": return "text-orange-400";
            case "Средне-продвинутый": return "text-red-400";
            case "Продвинутый": return "text-purple-400";
            default: return "text-gray-400";
        }
    };

    const handleLevelClick = (levelId: number) => {
        if (canAccessLevel(levelId)) {
            router.push(`/levels/${levelId}`);
        }
    };

    const handleNextLevel = () => {
        const nextLevel = goToNextLevel();
        if (nextLevel) {
            router.push(`/levels/${nextLevel}`);
        }
    };

    return (
        <Widget
            title="Выберите уровень"
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                    <path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h480q33 0 56.5 23.5T800-800v640q0 33-23.5 56.5T720-80H240Z"/>
                </svg>
            }
        >
            <div className="space-y-4">
                {/* Прогресс */}
                <div className="mb-6 p-4 bg-blue-900/30 border border-blue-600 rounded">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Общий прогресс</span>
                        <span className="text-blue-400">{completedLevels}/5 уровней</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(completedLevels / 5) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Кнопка "Продолжить" если есть доступный следующий уровень */}
                {completedLevels > 0 && completedLevels < 5 && (
                    <div className="p-4 bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-600 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold text-green-400">🎯 Следующая миссия готова!</div>
                                <div className="text-sm text-gray-300">
                                    {levels[completedLevels] && `${levels[completedLevels].title} - ${levels[completedLevels].description}`}
                                </div>
                            </div>
                            <button
                                onClick={handleNextLevel}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors animate-pulse"
                            >
                                Продолжить →
                            </button>
                        </div>
                    </div>
                )}

                {/* Список уровней */}
                {levels.map((level) => {
                    const isAccessible = canAccessLevel(level.id);
                    const isCompleted = level.id <= completedLevels;
                    const isCurrent = level.id === completedLevels + 1;

                    return (
                        <div
                            key={level.id}
                            className={`p-4 border rounded cursor-pointer transition-all duration-200 ${
                                isAccessible 
                                    ? isCompleted 
                                        ? 'bg-green-900/30 border-green-600 hover:bg-green-900/50'
                                        : isCurrent
                                            ? 'bg-blue-900/30 border-blue-600 hover:bg-blue-900/50 ring-2 ring-blue-400'
                                            : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
                                    : 'bg-gray-900/30 border-gray-700 cursor-not-allowed opacity-50'
                            }`}
                            onClick={() => handleLevelClick(level.id)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-semibold">
                                            {level.id}. {level.title}
                                        </span>
                                        {isCompleted && <span className="text-green-400">✅</span>}
                                        {isCurrent && <span className="text-blue-400">👉</span>}
                                        {!isAccessible && <span className="text-gray-500">🔒</span>}
                                    </div>
                                    <p className="text-gray-300 mt-1">{level.description}</p>
                                    <div className="flex items-center gap-4 mt-2 text-sm">
                                        <span className={getDifficultyColor(level.difficulty)}>
                                            📊 {level.difficulty}
                                        </span>
                                        <span className="text-yellow-400">⭐ +{level.xp} XP</span>
                                        <span className="text-purple-400">🏆 {level.badge}</span>
                                    </div>
                                    
                                    {/* Показать кнопку "Играть снова" для пройденных уровней */}
                                    {isCompleted && (
                                        <div className="mt-3 pt-2 border-t border-green-600/30">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/levels/${level.id}`);
                                                }}
                                                className="text-xs text-green-400 hover:text-green-300 underline"
                                            >
                                                🔄 Играть снова
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Сообщение о завершении */}
                {completedLevels === 5 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500 rounded">
                        <div className="text-center">
                            <div className="text-2xl mb-2">🎉 ПОЗДРАВЛЯЕМ! 🎉</div>
                            <div className="text-lg font-semibold">Все уровни пройдены!</div>
                            <div className="text-purple-300 mt-2">
                                Вы успешно завершили курс Solidity и получили звание "Мастер блокчейна"
                            </div>
                            <div className="mt-4 flex justify-center gap-2">
                                <button
                                    onClick={() => router.push('/levels/1')}
                                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                                >
                                    🔄 Начать заново
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Подсказка для новичков */}
                {completedLevels === 0 && (
                    <div className="p-4 bg-yellow-900/30 border border-yellow-600 rounded">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💡</span>
                            <div>
                                <div className="font-semibold text-yellow-300">Добро пожаловать!</div>
                                <div className="text-yellow-200 text-sm mt-1">
                                    Начните своё путешествие в мир Solidity с первого уровня. 
                                    Изучайте поэтапно: код → симуляция → награды!
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Widget>
    );
}