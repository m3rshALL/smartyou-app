'use client';

import { useEffect } from 'react';
import Container from '@/shared/ui/Container';
import Header from '@/shared/ui/Header';
import AchievementsPanel from '@/widgets/ui/AchievementsPanel';
import GameSettings from '@/widgets/ui/GameSettings';
import { useExtendedGameStore } from '@/features/model/useExtendedGameStore';

export default function AchievementsPage() {
    const { playerProfile, initializePlayer } = useExtendedGameStore();

    useEffect(() => {
        // Инициализируем профиль игрока, если его нет
        if (!playerProfile) {
            // Получаем имя из cookies (как в middleware)
            const name = document.cookie
                .split('; ')
                .find(row => row.startsWith('name='))
                ?.split('=')[1];
            
            if (name) {
                initializePlayer(decodeURIComponent(name));
            }
        }
    }, [playerProfile, initializePlayer]);

    if (!playerProfile) {
        return (
            <Container>
                <Header />
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold mb-2">Доступ ограничен</h1>
                    <p className="text-gray-400">
                        Необходимо войти в игру для просмотра достижений
                    </p>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <Header />
            <div className="py-6">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">🏆 Достижения и Настройки</h1>
                    <p className="text-gray-400">
                        Отслеживайте свой прогресс и настраивайте игровой опыт
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AchievementsPanel />
                    <GameSettings />
                </div>

                {/* Статистика игрока */}
                <div className="mt-8 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4 text-center">📊 Статистика игрока</h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400">
                                {playerProfile.stats.level}
                            </div>
                            <div className="text-gray-400">Уровень</div>
                        </div>
                        
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-400">
                                {playerProfile.stats.totalXP}
                            </div>
                            <div className="text-gray-400">Опыт</div>
                        </div>
                        
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-400">
                                {playerProfile.stats.completedLevels.length}
                            </div>
                            <div className="text-gray-400">Пройдено уровней</div>
                        </div>
                        
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-400">
                                {Object.values(playerProfile.stats.starsEarned).reduce((sum, stars) => sum + stars, 0)}
                            </div>
                            <div className="text-gray-400">Звёзд</div>
                        </div>
                        
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-400">
                                {playerProfile.stats.achievements.filter(a => a.unlocked).length}
                            </div>
                            <div className="text-gray-400">Достижений</div>
                        </div>
                        
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-400">
                                {Math.floor(playerProfile.stats.totalPlayTime / 60000)}
                            </div>
                            <div className="text-gray-400">Минут игры</div>
                        </div>
                        
                        <div className="text-center">
                            <div className="text-3xl font-bold text-cyan-400">
                                {Object.keys(playerProfile.stats.bestTimes).length}
                            </div>
                            <div className="text-gray-400">Рекордов</div>
                        </div>
                        
                        <div className="text-center">
                            <div className="text-3xl font-bold text-pink-400">
                                {Math.round((playerProfile.stats.completedLevels.length / 5) * 100)}%
                            </div>
                            <div className="text-gray-400">Прогресс</div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
}
