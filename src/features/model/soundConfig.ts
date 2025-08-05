export interface SoundEffect {
    id: string;
    src: string;
    volume: number;
    loop?: boolean;
}

export interface LevelMusic {
    level: number;
    src: string;
    title: string;
    volume: number;
}

// Звуковые эффекты
export const soundEffects: SoundEffect[] = [
    {
        id: 'success',
        src: '/sounds/success.mp3',
        volume: 0.7
    },
    {
        id: 'error',
        src: '/sounds/error.mp3',
        volume: 0.5
    },
    {
        id: 'jump',
        src: '/sounds/jump.mp3',
        volume: 0.4
    },
    {
        id: 'run',
        src: '/sounds/run.mp3',
        volume: 0.3,
        loop: true
    },
    {
        id: 'collect',
        src: '/sounds/collect.mp3',
        volume: 0.6
    },
    {
        id: 'achievement',
        src: '/sounds/achievement.mp3',
        volume: 0.8
    },
    {
        id: 'death',
        src: '/sounds/death.mp3',
        volume: 0.6
    },
    {
        id: 'bonus',
        src: '/sounds/bonus.mp3',
        volume: 0.5
    }
];

// Фоновая музыка для уровней
export const levelMusic: LevelMusic[] = [
    {
        level: 1,
        src: '/music/level1-business.mp3',
        title: 'Financial District',
        volume: 0.3
    },
    {
        level: 2,
        src: '/music/level2-government.mp3',
        title: 'Democratic March',
        volume: 0.3
    },
    {
        level: 3,
        src: '/music/level3-magic.mp3',
        title: 'Mystic Forest',
        volume: 0.3
    },
    {
        level: 4,
        src: '/music/level4-cyberpunk.mp3',
        title: 'Neon Dreams',
        volume: 0.3
    },
    {
        level: 5,
        src: '/music/level5-matrix.mp3',
        title: 'Digital Realm',
        volume: 0.3
    }
];
