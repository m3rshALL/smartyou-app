'use client';

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import Widget from "@/shared/ui/Widget";
import { useExtendedGameStore } from "../model/useExtendedGameStore";
import { useSoundManager } from "../model/useSoundManager";

// Компонент частиц для эффектов
function ParticleEffect({ type, x, y }: { type: 'collect' | 'bonus' | 'explosion', x: number, y: number }) {
    const particles = Array.from({ length: type === 'explosion' ? 12 : 6 }, (_, i) => i);
    
    return (
        <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
            {particles.map((_, i) => (
                <motion.div
                    key={i}
                    className={`absolute w-2 h-2 rounded-full ${
                        type === 'collect' ? 'bg-yellow-400' :
                        type === 'bonus' ? 'bg-blue-400' : 'bg-red-400'
                    }`}
                    initial={{ 
                        scale: 0, 
                        x: 0, 
                        y: 0,
                        opacity: 1 
                    }}
                    animate={{ 
                        scale: [0, 1, 0], 
                        x: Math.cos(i * 60) * (20 + Math.random() * 20),
                        y: Math.sin(i * 60) * (20 + Math.random() * 20),
                        opacity: [1, 1, 0]
                    }}
                    transition={{ 
                        duration: 1,
                        ease: "easeOut"
                    }}
                />
            ))}
        </div>
    );
}

// Компонент собираемых предметов
function CollectibleItem({ type, position }: { type: 'coin' | 'crystal' | 'key', position: number }) {
    const { collectItem } = useExtendedGameStore();
    const { playSound } = useSoundManager();
    const [isCollected, setIsCollected] = useState(false);
    
    const handleCollect = () => {
        if (!isCollected) {
            setIsCollected(true);
            collectItem(`${type}-${position}`);
            playSound('collect');
        }
    };

    const icons = {
        coin: '🪙',
        crystal: '💎',
        key: '🔑'
    };

    return (
        <AnimatePresence>
            {!isCollected && (
                <motion.div
                    className="absolute bottom-48 h-8 w-8 flex items-center justify-center cursor-pointer z-50"
                    style={{ right: position }}
                    initial={{ x: '100%', scale: 0 }}
                    animate={{ 
                        x: -300, 
                        scale: [0, 1.2, 1],
                        y: [0, -10, 0]
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ 
                        x: { duration: 2, ease: 'linear' },
                        scale: { duration: 0.3 },
                        y: { duration: 1, repeat: Infinity, repeatType: 'reverse' }
                    }}
                    onClick={handleCollect}
                    whileHover={{ scale: 1.3 }}
                >
                    <span className="text-2xl drop-shadow-lg">
                        {icons[type]}
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Основной компонент игры
export default function EnhancedGame() {
    const {
        playerRunning,
        playerJumping,
        playerDead,
        isCactusSpawned,
        completed,
        currentLevel,
        currentSkin,
        activeBonuses,
        particlesEnabled
    } = useExtendedGameStore();

    const { playSound, stopSound } = useSoundManager();

    const [particles, setParticles] = useState<Array<{id: string, type: 'collect' | 'bonus' | 'explosion', x: number, y: number}>>([]);
    const [collectibles, setCollectibles] = useState<Array<{type: 'coin' | 'crystal' | 'key', position: number}>>([]);

    // Звуковые эффекты для игровых действий
    useEffect(() => {
        if (playerJumping && !playerDead) {
            playSound('jump');
        }
    }, [playerJumping, playerDead, playSound]);

    useEffect(() => {
        if (playerRunning && !playerDead) {
            playSound('run');
        } else {
            stopSound('run');
        }
    }, [playerRunning, playerDead, playSound, stopSound]);

    useEffect(() => {
        if (playerDead) {
            stopSound('run');
            playSound('death');
        }
    }, [playerDead, playSound, stopSound]);

    // Генерируем собираемые предметы для текущего уровня
    useEffect(() => {
        const levelCollectibles = {
            1: [{ type: 'coin' as const, position: 150 }, { type: 'coin' as const, position: 350 }],
            2: [{ type: 'key' as const, position: 200 }],
            3: [{ type: 'crystal' as const, position: 100 }, { type: 'crystal' as const, position: 300 }],
            4: [{ type: 'crystal' as const, position: 180 }, { type: 'key' as const, position: 280 }],
            5: [{ type: 'crystal' as const, position: 120 }, { type: 'coin' as const, position: 220 }, { type: 'key' as const, position: 320 }]
        };
        
        setCollectibles(levelCollectibles[currentLevel as keyof typeof levelCollectibles] || []);
    }, [currentLevel]);

    // Функция добавления эффекта частиц
    const addParticleEffect = (type: 'collect' | 'bonus' | 'explosion', x: number, y: number) => {
        if (!particlesEnabled) return;
        
        const id = `${type}-${Date.now()}-${Math.random()}`;
        setParticles(prev => [...prev, { id, type, x, y }]);
        
        setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== id));
        }, 1000);
    };

    // Фоны для разных уровней
    const levelBackgrounds = {
        1: 'bg-gradient-to-b from-blue-400 via-blue-300 to-yellow-200', // Городской день
        2: 'bg-gradient-to-b from-purple-600 via-purple-400 to-pink-200', // Правительственный
        3: 'bg-gradient-to-b from-green-600 via-purple-500 to-blue-400', // Магический
        4: 'bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900', // Киберпанк
        5: 'bg-gradient-to-b from-black via-green-900 to-green-600' // Матрица
    };

    // Препятствия для разных уровней
    const levelObstacles = {
        1: '/cactus.png', // Заменим на банковский сейф
        2: '/cactus.png', // Заменим на избирательную урну
        3: '/cactus.png', // Заменим на магический кристалл
        4: '/cactus.png', // Заменим на голографический барьер
        5: '/cactus.png'  // Заменим на поток данных
    };

    return (
        <Widget
            className="h-[600px]"
            title={`Игровая панель - Уровень ${currentLevel}`}
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                    <path d="m272-440 208 120 208-120-168-97v137h-80v-137l-168 97Zm168-189v-17q-44-13-72-49.5T340-780q0-58 41-99t99-41q58 0 99 41t41 99q0-48-28 84.5T520-646v17l280 161q19 11 29.5 29.5T840-398v76q0 22-10.5 40.5T800-252L520-91q-19 11-40 11t-40-11L160-252q-19-11-29.5-29.5T120-322v-76q0-22 10.5-40.5T160-468l280-161Zm0 378L200-389v67l280 162 280-162v-67L520-251q-19 11-40 11t-40-11Zm40-469q25 0 42.5-17.5T540-780q0-25-17.5-42.5T480-840q-25 0-42.5 17.5T420-780q0 25 17.5 42.5T480-720Zm0 560Z" />
                </svg>
            }
            windowMode
        >
            <div className={`h-full w-full relative overflow-hidden ${levelBackgrounds[currentLevel as keyof typeof levelBackgrounds] || levelBackgrounds[1]}`}>
                
                {/* Индикатор активных бонусов */}
                <AnimatePresence>
                    {activeBonuses.length > 0 && (
                        <motion.div
                            className="absolute top-4 left-4 z-50 flex gap-2"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {activeBonuses.map((bonus) => (
                                <div
                                    key={bonus}
                                    className="px-3 py-1 bg-blue-600/80 text-white rounded-full text-sm font-semibold animate-pulse"
                                >
                                    {bonus === 'shield' ? '🛡️ Щит' : 
                                     bonus === 'speed' ? '⚡ Ускорение' : 
                                     bonus === 'slow' ? '🐌 Замедление' : bonus}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Собираемые предметы */}
                {collectibles.map((item, index) => (
                    <CollectibleItem
                        key={`${item.type}-${index}`}
                        type={item.type}
                        position={item.position}
                    />
                ))}

                {/* Игрок */}
                <AnimatePresence>
                    {playerRunning && (
                        <motion.img
                            className="absolute bottom-48 h-24 aspect-auto z-100 image-render-pixel"
                            src={currentSkin === 'default' ? '/player.png' : `/skins/${currentSkin}.png`}
                            initial={{ x: "-100%" }}
                            animate={
                                playerDead
                                    ? {
                                        x: [
                                            260, 270, 280, 290, 300, 310, 320,
                                            330, 340, 350, 360, 370, 380, 390,
                                            400, 405, 410, 415, 420
                                        ],
                                        y: [
                                            0, -5, -10, -15, -20, -25, -30,
                                            -35, -38, -40, -38, -35, -30, -20,
                                            -10, 0, 10, 30, 50
                                        ],
                                        rotate: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90]
                                    }
                                    : playerJumping
                                        ? {
                                            x: [
                                                250, 280, 310, 340, 370, 400, 430,
                                                460, 490, 520, 550, 575, 590, 600
                                            ],
                                            y: [
                                                0, -40, -75, -105, -130, -150, -160,
                                                -165, -160, -140, -110, -70, -35, 0
                                            ],
                                            opacity: 1,
                                            rotate: [0, -5, -10, -5, 0, 5, 10, 5, 0, -5, -10, -5, 0, 0]
                                        }
                                        : { 
                                            x: 250, 
                                            y: 0,
                                            rotate: 0,
                                            scale: activeBonuses.includes('shield') ? 1.1 : 1
                                        }
                            }
                            transition={{
                                x: { duration: 0.8, ease: "easeInOut" },
                                y: { duration: 0.8, ease: "easeInOut" },
                                opacity: { duration: 0.5 },
                                rotate: { duration: 0.8, ease: "easeInOut" },
                                scale: { duration: 0.3 }
                            }}
                            exit={{ opacity: 0 }}
                            onAnimationComplete={() => {
                                if (playerDead) {
                                    addParticleEffect('explosion', 420, 200);
                                }
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Щит вокруг игрока */}
                <AnimatePresence>
                    {activeBonuses.includes('shield') && playerRunning && (
                        <motion.div
                            className="absolute bottom-44 left-56 w-32 h-32 border-4 border-blue-400 rounded-full z-90"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ 
                                scale: 1, 
                                opacity: 0.6,
                                rotate: 360
                            }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                scale: { duration: 0.3 },
                                opacity: { duration: 0.3 }
                            }}
                        />
                    )}
                </AnimatePresence>

                {/* Препятствие (адаптивное для уровня) */}
                {isCactusSpawned && (
                    <motion.img
                        className="absolute bottom-48 h-24 aspect-auto right-0 image-render-pixel z-50"
                        src={levelObstacles[currentLevel as keyof typeof levelObstacles]}
                        initial={{ x: '100%' }}
                        animate={completed ? { x: -1000 } : { x: -250 }}
                        transition={{ 
                            duration: activeBonuses.includes('slow') ? 2.5 : 1.5, 
                            ease: 'easeInOut' 
                        }}
                    />
                )}

                {/* Система частиц */}
                <AnimatePresence>
                    {particles.map((particle) => (
                        <ParticleEffect
                            key={particle.id}
                            type={particle.type}
                            x={particle.x}
                            y={particle.y}
                        />
                    ))}
                </AnimatePresence>

                {/* Земля (адаптивная для уровня) */}
                <img 
                    className="absolute bottom-0 h-48 w-full image-render-pixel" 
                    src={currentLevel === 5 ? '/ground.png' : '/ground.png'} 
                    alt={`Level ${currentLevel} ground`}
                />

                {/* Информационная панель */}
                <div className="absolute top-4 right-4 bg-black/50 rounded-lg p-3 text-white">
                    <div className="text-sm">
                        <div>Уровень: {currentLevel}</div>
                        <div>Собрано: {useExtendedGameStore().collectedItems.length}</div>
                        <div>Бонусы: {activeBonuses.length}</div>
                    </div>
                </div>
            </div>
        </Widget>
    );
}
