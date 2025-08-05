'use client';

import { motion } from 'framer-motion';
import { useExtendedGameStore } from '@/features/model/useExtendedGameStore';
import { SkinType } from '@/entities/achievement/types';
import Widget from '@/shared/ui/Widget';

const skins: { id: SkinType; name: string; description: string; icon: string; unlocked: boolean }[] = [
    {
        id: 'default',
        name: 'Обычный программист',
        description: 'Классический вид игрока',
        icon: '👨‍💻',
        unlocked: true
    },
    {
        id: 'banker',
        name: 'Банкир',
        description: 'Разблокируется после прохождения 1 уровня',
        icon: '🏦',
        unlocked: false
    },
    {
        id: 'politician',
        name: 'Политик',
        description: 'Разблокируется после прохождения 2 уровня',
        icon: '🗳️',
        unlocked: false
    },
    {
        id: 'mage',
        name: 'Маг',
        description: 'Разблокируется после прохождения 3 уровня',
        icon: '🧙‍♂️',
        unlocked: false
    },
    {
        id: 'cyborg',
        name: 'Киборг',
        description: 'Разблокируется после прохождения 4 уровня',
        icon: '🤖',
        unlocked: false
    },
    {
        id: 'hacker',
        name: 'Хакер',
        description: 'Разблокируется после прохождения 5 уровня',
        icon: '👨‍💻',
        unlocked: false
    }
];

export default function GameSettings() {
    const {
        playerProfile,
        currentSkin,
        changeSkin,
        toggleSound,
        toggleMusic,
        toggleAnimations
    } = useExtendedGameStore();

    if (!playerProfile) {
        return (
            <Widget title="Настройки игры" icon="⚙️">
                <div className="text-center text-gray-400 py-8">
                    Войдите в игру, чтобы получить доступ к настройкам
                </div>
            </Widget>
        );
    }

    const completedLevels = playerProfile.stats.completedLevels;
    
    // Обновляем доступность скинов на основе пройденных уровней
    const availableSkins = skins.map(skin => ({
        ...skin,
        unlocked: skin.id === 'default' || 
                 (skin.id === 'banker' && completedLevels.includes(1)) ||
                 (skin.id === 'politician' && completedLevels.includes(2)) ||
                 (skin.id === 'mage' && completedLevels.includes(3)) ||
                 (skin.id === 'cyborg' && completedLevels.includes(4)) ||
                 (skin.id === 'hacker' && completedLevels.includes(5))
    }));

    return (
        <Widget 
            title="Настройки игры" 
            icon="⚙️"
            className="max-h-[600px] overflow-y-auto"
        >
            <div className="space-y-6">
                {/* Профиль игрока */}
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-4 rounded-lg border border-blue-500/30">
                    <h3 className="text-lg font-bold text-blue-300 mb-2">Профиль игрока</h3>
                    <div className="flex items-center gap-4">
                        <div className="text-4xl">
                            {availableSkins.find(s => s.id === currentSkin)?.icon || '👨‍💻'}
                        </div>
                        <div>
                            <div className="font-bold text-white">{playerProfile.name}</div>
                            <div className="text-gray-300">Уровень {playerProfile.stats.level}</div>
                            <div className="text-gray-400">{playerProfile.stats.totalXP} XP</div>
                        </div>
                    </div>
                </div>

                {/* Аудио настройки */}
                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-300">Звук и музыка</h3>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="text-xl">🔊</div>
                            <span>Звуковые эффекты</span>
                        </div>
                        <button
                            onClick={toggleSound}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                playerProfile.preferences.soundEnabled ? 'bg-blue-600' : 'bg-gray-600'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    playerProfile.preferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="text-xl">🎵</div>
                            <span>Фоновая музыка</span>
                        </div>
                        <button
                            onClick={toggleMusic}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                playerProfile.preferences.musicEnabled ? 'bg-blue-600' : 'bg-gray-600'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    playerProfile.preferences.musicEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="text-xl">✨</div>
                            <span>Анимации и эффекты</span>
                        </div>
                        <button
                            onClick={toggleAnimations}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                playerProfile.preferences.animationsEnabled ? 'bg-blue-600' : 'bg-gray-600'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    playerProfile.preferences.animationsEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Выбор скина */}
                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-gray-300">Персонализация</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                        {availableSkins.map((skin) => (
                            <motion.button
                                key={skin.id}
                                onClick={() => skin.unlocked && changeSkin(skin.id)}
                                disabled={!skin.unlocked}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                    currentSkin === skin.id
                                        ? 'border-blue-500 bg-blue-900/30'
                                        : skin.unlocked
                                        ? 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                                        : 'border-gray-700 bg-gray-900/30 opacity-50 cursor-not-allowed'
                                }`}
                                whileHover={skin.unlocked ? { scale: 1.02 } : {}}
                                whileTap={skin.unlocked ? { scale: 0.98 } : {}}
                            >
                                <div className="text-center">
                                    <div className={`text-2xl mb-1 ${!skin.unlocked ? 'grayscale' : ''}`}>
                                        {skin.icon}
                                    </div>
                                    <div className={`font-semibold text-sm ${
                                        currentSkin === skin.id ? 'text-blue-300' : 
                                        skin.unlocked ? 'text-gray-300' : 'text-gray-500'
                                    }`}>
                                        {skin.name}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {skin.description}
                                    </div>
                                    {!skin.unlocked && (
                                        <div className="text-xs text-red-400 mt-1">
                                            🔒 Заблокировано
                                        </div>
                                    )}
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </Widget>
    );
}
