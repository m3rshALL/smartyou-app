import { useCallback, useEffect, useRef } from 'react';
import { useExtendedGameStore } from './useExtendedGameStore';
import { soundEffects, levelMusic } from './soundConfig';

export function useSoundManager() {
    const { playerProfile, currentLevel } = useExtendedGameStore();
    const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
    const musicRef = useRef<HTMLAudioElement | null>(null);
    
    const soundEnabled = playerProfile?.preferences.soundEnabled ?? true;
    const musicEnabled = playerProfile?.preferences.musicEnabled ?? true;

    // Инициализация звуковых эффектов
    useEffect(() => {
        const audioElements: { [key: string]: HTMLAudioElement } = {};
        
        soundEffects.forEach(sound => {
            const audio = new Audio(sound.src);
            audio.volume = sound.volume;
            audio.loop = sound.loop || false;
            audioElements[sound.id] = audio;
            audioRefs.current[sound.id] = audio;
        });

        return () => {
            Object.values(audioElements).forEach(audio => {
                audio.pause();
                audio.src = '';
            });
        };
    }, []);

    // Управление фоновой музыкой
    useEffect(() => {
        if (!musicEnabled) {
            if (musicRef.current) {
                musicRef.current.pause();
            }
            return;
        }

        const currentMusic = levelMusic.find(music => music.level === currentLevel);
        if (!currentMusic) return;

        // Останавливаем предыдущую музыку
        if (musicRef.current) {
            musicRef.current.pause();
        }

        // Запускаем новую музыку
        const audio = new Audio(currentMusic.src);
        audio.volume = currentMusic.volume;
        audio.loop = true;
        musicRef.current = audio;

        audio.play().catch(error => {
            console.warn('Could not play background music:', error);
        });

        return () => {
            if (musicRef.current) {
                musicRef.current.pause();
            }
        };
    }, [currentLevel, musicEnabled]);

    // Функция воспроизведения звукового эффекта
    const playSound = useCallback((soundId: string) => {
        if (!soundEnabled) return;
        
        const audio = audioRefs.current[soundId];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(error => {
                console.warn(`Could not play sound ${soundId}:`, error);
            });
        }
    }, [soundEnabled]);

    // Функция остановки звука
    const stopSound = useCallback((soundId: string) => {
        const audio = audioRefs.current[soundId];
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }, []);

    // Функция управления громкостью
    const setVolume = useCallback((soundId: string, volume: number) => {
        const audio = audioRefs.current[soundId];
        if (audio) {
            audio.volume = Math.max(0, Math.min(1, volume));
        }
    }, []);

    return {
        playSound,
        stopSound,
        setVolume,
        soundEnabled,
        musicEnabled
    };
}
