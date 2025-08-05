export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    level: number;
    unlocked: boolean;
    unlockedAt?: Date;
    xpReward: number;
}

export interface PlayerStats {
    totalXP: number;
    level: number;
    completedLevels: number[];
    starsEarned: { [levelId: number]: number };
    bestTimes: { [levelId: number]: number };
    totalPlayTime: number;
    achievements: Achievement[];
}

export interface GameSession {
    levelId: number;
    startTime: number;
    attempts: number;
    hintsUsed: number;
    codeQuality: 'poor' | 'good' | 'excellent';
}

export type SkinType = 'default' | 'banker' | 'politician' | 'mage' | 'cyborg' | 'hacker';

export interface PlayerProfile {
    name: string;
    avatar: SkinType;
    stats: PlayerStats;
    preferences: {
        soundEnabled: boolean;
        musicEnabled: boolean;
        animationsEnabled: boolean;
    };
}
