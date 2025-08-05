import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayerProfile, GameSession, SkinType } from '@/entities/achievement/types';
import { achievements } from '@/entities/achievement/model/achievements';

interface ExtendedGameStore {
    // Базовое состояние игры
    playerRunning: boolean;
    playerDead: boolean;
    playerJumping: boolean;
    completed: boolean;
    isCactusSpawned: boolean;
    
    // Новые игровые состояния
    currentLevel: number;
    gameSession: GameSession | null;
    collectedItems: string[];
    activeBonuses: string[];
    
    // Профиль игрока
    playerProfile: PlayerProfile | null;
    
    // Визуальные настройки
    currentSkin: SkinType;
    particlesEnabled: boolean;
    
    // Действия для базового состояния
    setPlayerRunning: (running: boolean) => void;
    setPlayerDead: (dead: boolean) => void;
    setPlayerJumping: (jumping: boolean) => void;
    setCompleted: (completed: boolean) => void;
    setIsCactusSpawned: (spawned: boolean) => void;
    
    // Новые действия
    setCurrentLevel: (level: number) => void;
    startGameSession: (levelId: number) => void;
    endGameSession: (success: boolean, codeQuality: 'poor' | 'good' | 'excellent') => void;
    collectItem: (itemId: string) => void;
    activateBonus: (bonusId: string, duration: number) => void;
    
    // Профиль и достижения
    initializePlayer: (name: string) => void;
    updatePlayerStats: (levelId: number, stars: number, time: number) => void;
    unlockAchievement: (achievementId: string) => void;
    changeSkin: (skin: SkinType) => void;
    
    // Настройки
    toggleSound: () => void;
    toggleMusic: () => void;
    toggleAnimations: () => void;
    checkAchievements: () => void;
}

const initialPlayerProfile = (name: string): PlayerProfile => ({
    name,
    avatar: 'default',
    stats: {
        totalXP: 0,
        level: 1,
        completedLevels: [],
        starsEarned: {},
        bestTimes: {},
        totalPlayTime: 0,
        achievements: achievements.map(a => ({ ...a, unlocked: false }))
    },
    preferences: {
        soundEnabled: true,
        musicEnabled: true,
        animationsEnabled: true
    }
});

export const useExtendedGameStore = create<ExtendedGameStore>()(
    persist(
        (set, get) => ({
            // Базовое состояние
            playerRunning: false,
            playerDead: false,
            playerJumping: false,
            completed: false,
            isCactusSpawned: false,
            
            // Новое состояние
            currentLevel: 1,
            gameSession: null,
            collectedItems: [],
            activeBonuses: [],
            playerProfile: null,
            currentSkin: 'default',
            particlesEnabled: true,
            
            // Базовые действия
            setPlayerRunning: (running) => set({ playerRunning: running }),
            setPlayerDead: (dead) => set({ playerDead: dead }),
            setPlayerJumping: (jumping) => set({ playerJumping: jumping }),
            setCompleted: (completed) => set({ completed }),
            setIsCactusSpawned: (spawned) => set({ isCactusSpawned: spawned }),
            
            // Новые действия
            setCurrentLevel: (level) => set({ currentLevel: level }),
            
            startGameSession: (levelId) => set({
                gameSession: {
                    levelId,
                    startTime: Date.now(),
                    attempts: 0,
                    hintsUsed: 0,
                    codeQuality: 'poor'
                }
            }),
            
            endGameSession: (success, codeQuality) => {
                const { gameSession, playerProfile } = get();
                if (!gameSession || !playerProfile) return;
                
                const playTime = Date.now() - gameSession.startTime;
                const updatedProfile = {
                    ...playerProfile,
                    stats: {
                        ...playerProfile.stats,
                        totalPlayTime: playerProfile.stats.totalPlayTime + playTime
                    }
                };
                
                set({ 
                    gameSession: { ...gameSession, codeQuality },
                    playerProfile: updatedProfile 
                });
            },
            
            collectItem: (itemId) => set(state => ({
                collectedItems: [...state.collectedItems, itemId]
            })),
            
            activateBonus: (bonusId, duration) => {
                set(state => ({
                    activeBonuses: [...state.activeBonuses, bonusId]
                }));
                
                setTimeout(() => {
                    set(state => ({
                        activeBonuses: state.activeBonuses.filter(id => id !== bonusId)
                    }));
                }, duration);
            },
            
            initializePlayer: (name) => set({
                playerProfile: initialPlayerProfile(name)
            }),
            
            updatePlayerStats: (levelId, stars, time) => {
                const { playerProfile } = get();
                if (!playerProfile) return;
                
                const isNewLevel = !playerProfile.stats.completedLevels.includes(levelId);
                const xpGain = stars * 50 + (isNewLevel ? 100 : 0);
                
                const updatedStats = {
                    ...playerProfile.stats,
                    totalXP: playerProfile.stats.totalXP + xpGain,
                    completedLevels: isNewLevel 
                        ? [...playerProfile.stats.completedLevels, levelId]
                        : playerProfile.stats.completedLevels,
                    starsEarned: {
                        ...playerProfile.stats.starsEarned,
                        [levelId]: Math.max(playerProfile.stats.starsEarned[levelId] || 0, stars)
                    },
                    bestTimes: {
                        ...playerProfile.stats.bestTimes,
                        [levelId]: Math.min(playerProfile.stats.bestTimes[levelId] || Infinity, time)
                    }
                };
                
                // Вычисляем новый уровень игрока
                const newLevel = Math.floor(updatedStats.totalXP / 500) + 1;
                updatedStats.level = newLevel;
                
                set({
                    playerProfile: {
                        ...playerProfile,
                        stats: updatedStats
                    }
                });
                
                // Проверяем достижения
                get().checkAchievements();
            },
            
            unlockAchievement: (achievementId) => {
                const { playerProfile } = get();
                if (!playerProfile) return;
                
                const achievement = playerProfile.stats.achievements.find(a => a.id === achievementId);
                if (!achievement || achievement.unlocked) return;
                
                const updatedAchievements = playerProfile.stats.achievements.map(a =>
                    a.id === achievementId 
                        ? { ...a, unlocked: true, unlockedAt: new Date() }
                        : a
                );
                
                const updatedStats = {
                    ...playerProfile.stats,
                    achievements: updatedAchievements,
                    totalXP: playerProfile.stats.totalXP + achievement.xpReward
                };
                
                set({
                    playerProfile: {
                        ...playerProfile,
                        stats: updatedStats
                    }
                });
            },
            
            changeSkin: (skin) => set({ 
                currentSkin: skin,
                playerProfile: get().playerProfile 
                    ? { ...get().playerProfile!, avatar: skin }
                    : null
            }),
            
            toggleSound: () => {
                const { playerProfile } = get();
                if (!playerProfile) return;
                
                set({
                    playerProfile: {
                        ...playerProfile,
                        preferences: {
                            ...playerProfile.preferences,
                            soundEnabled: !playerProfile.preferences.soundEnabled
                        }
                    }
                });
            },
            
            toggleMusic: () => {
                const { playerProfile } = get();
                if (!playerProfile) return;
                
                set({
                    playerProfile: {
                        ...playerProfile,
                        preferences: {
                            ...playerProfile.preferences,
                            musicEnabled: !playerProfile.preferences.musicEnabled
                        }
                    }
                });
            },
            
            toggleAnimations: () => {
                const { playerProfile } = get();
                if (!playerProfile) return;
                
                set({
                    playerProfile: {
                        ...playerProfile,
                        preferences: {
                            ...playerProfile.preferences,
                            animationsEnabled: !playerProfile.preferences.animationsEnabled
                        }
                    }
                });
            },
            
            checkAchievements: () => {
                const { playerProfile } = get();
                if (!playerProfile) return;
                
                const stats = playerProfile.stats;
                
                // Проверяем достижения за уровни
                stats.completedLevels.forEach(levelId => {
                    const achievementId = achievements.find(a => a.level === levelId)?.id;
                    if (achievementId) {
                        get().unlockAchievement(achievementId);
                    }
                });
                
                // Проверяем специальные достижения
                const allStars = Object.values(stats.starsEarned);
                if (allStars.length === 5 && allStars.every(stars => stars === 3)) {
                    get().unlockAchievement('perfectionist');
                }
                
                const fastTimes = Object.values(stats.bestTimes);
                if (fastTimes.some(time => time < 120000)) { // 2 минуты
                    get().unlockAchievement('speed_runner');
                }
            }
        }),
        {
            name: 'smartyou-game-storage',
            partialize: (state) => ({
                playerProfile: state.playerProfile,
                currentSkin: state.currentSkin,
                currentLevel: state.currentLevel
            })
        }
    )
);
