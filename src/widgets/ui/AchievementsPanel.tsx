'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useExtendedGameStore } from '@/features/model/useExtendedGameStore';
import { Achievement } from '@/entities/achievement/types';
import Widget from '@/shared/ui/Widget';

interface AchievementCardProps {
    achievement: Achievement;
    isUnlocked: boolean;
}

function AchievementCard({ achievement, isUnlocked }: AchievementCardProps) {
    return (
        <motion.div
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                isUnlocked
                    ? 'border-yellow-400 bg-yellow-900/20 shadow-lg shadow-yellow-400/20'
                    : 'border-gray-600 bg-gray-900/20'
            }`}
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center gap-3">
                <div className={`text-3xl ${isUnlocked ? 'grayscale-0' : 'grayscale'}`}>
                    {achievement.icon}
                </div>
                <div className="flex-1">
                    <h3 className={`font-bold ${isUnlocked ? 'text-yellow-300' : 'text-gray-400'}`}>
                        {achievement.name}
                    </h3>
                    <p className={`text-sm ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                        {achievement.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                            isUnlocked 
                                ? 'bg-yellow-600 text-yellow-100' 
                                : 'bg-gray-600 text-gray-300'
                        }`}>
                            +{achievement.xpReward} XP
                        </span>
                        {isUnlocked && achievement.unlockedAt && (
                            <span className="text-xs text-gray-400">
                                Получено: {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
                {isUnlocked && (
                    <motion.div
                        className="text-green-400"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        ✓
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

export default function AchievementsPanel() {
    const { playerProfile } = useExtendedGameStore();

    if (!playerProfile) {
        return (
            <Widget title="Достижения" icon="🏆">
                <div className="text-center text-gray-400 py-8">
                    Войдите в игру, чтобы увидеть достижения
                </div>
            </Widget>
        );
    }

    const achievements = playerProfile.stats.achievements;
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalXP = achievements
        .filter(a => a.unlocked)
        .reduce((sum, a) => sum + a.xpReward, 0);

    return (
        <Widget 
            title="Достижения" 
            icon="🏆"
            className="max-h-[600px] overflow-y-auto"
        >
            <div className="space-y-4">
                {/* Статистика */}
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-lg border border-purple-500/30">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-purple-300">Прогресс достижений</h3>
                            <p className="text-purple-200">
                                {unlockedCount} из {achievements.length} разблокировано
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-yellow-400">
                                {totalXP} XP
                            </div>
                            <div className="text-sm text-gray-400">
                                из достижений
                            </div>
                        </div>
                    </div>
                    
                    {/* Прогресс-бар */}
                    <div className="mt-3 bg-gray-700 rounded-full h-2">
                        <motion.div
                            className="bg-gradient-to-r from-purple-500 to-yellow-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                        />
                    </div>
                </div>

                {/* Список достижений */}
                <div className="space-y-3">
                    <AnimatePresence>
                        {achievements.map((achievement, index) => (
                            <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <AchievementCard
                                    achievement={achievement}
                                    isUnlocked={achievement.unlocked}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Уведомление о новых достижениях */}
                <AnimatePresence>
                    <motion.div
                        className="text-center text-gray-400 text-sm mt-6 p-3 border border-dashed border-gray-600 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        💡 Проходите уровни и решайте задачи, чтобы получить новые достижения!
                    </motion.div>
                </AnimatePresence>
            </div>
        </Widget>
    );
}
