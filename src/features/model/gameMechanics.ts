import { useExtendedGameStore } from "./useExtendedGameStore";
import { useConsole } from "./useConsole";

export function run() {
    const { setPlayerRunning, setPlayerDead } = useExtendedGameStore.getState();
    setPlayerRunning(true);
    setPlayerDead(false);
}

export function spawnCactus() {
    const { setCompleted, setIsCactusSpawned } = useExtendedGameStore.getState();
    setCompleted(false);
    setIsCactusSpawned(true);
}

export function complete() {
    const {
        setPlayerJumping,
        setCompleted,
        setIsCactusSpawned
    } = useExtendedGameStore.getState();

    setPlayerJumping(true);
    setCompleted(true);

    setTimeout(() => {
        setPlayerJumping(false);
        setIsCactusSpawned(false);
    }, 1200);
}

export function die() {
    const { setPlayerDead, setPlayerRunning } = useExtendedGameStore.getState();
    const { addLog } = useConsole.getState();
    
    setPlayerDead(true);
    addLog('💀 Игрок погиб! Код содержит критические ошибки.');
    
    setTimeout(() => {
        setPlayerRunning(false);
    }, 1000);
}

export function collectBonus(bonusType: 'shield' | 'speed' | 'slow', duration: number = 5000) {
    const { activateBonus } = useExtendedGameStore.getState();
    const { addLog } = useConsole.getState();
    
    activateBonus(bonusType, duration);
    
    const bonusMessages = {
        shield: '🛡️ Щит активирован! Вы защищены от препятствий.',
        speed: '⚡ Ускорение! Время замедлено.',
        slow: '🐌 Замедление препятствий!'
    };
    
    addLog(bonusMessages[bonusType]);
}

export function collectItem(itemType: 'coin' | 'crystal' | 'key') {
    const { collectItem: storeCollectItem, playerProfile } = useExtendedGameStore.getState();
    const { addLog } = useConsole.getState();
    
    const itemId = `${itemType}-${Date.now()}`;
    storeCollectItem(itemId);
    
    const itemMessages = {
        coin: '🪙 Монета собрана! +10 XP',
        crystal: '💎 Кристалл найден! +25 XP',
        key: '🔑 Ключ получен! Открывает секретные области.'
    };
    
    const xpRewards = {
        coin: 10,
        crystal: 25,
        key: 15
    };
    
    if (playerProfile) {
        // Добавляем опыт за собранный предмет
        const updatedProfile = {
            ...playerProfile,
            stats: {
                ...playerProfile.stats,
                totalXP: playerProfile.stats.totalXP + xpRewards[itemType]
            }
        };
        
        useExtendedGameStore.setState({ playerProfile: updatedProfile });
    }
    
    addLog(itemMessages[itemType]);
}

// Новая функция для обработки столкновений
export function handleCollision() {
    const { activeBonuses } = useExtendedGameStore.getState();
    
    // Если есть щит - игнорируем столкновение
    if (activeBonuses.includes('shield')) {
        const { addLog } = useConsole.getState();
        addLog('🛡️ Щит защитил от столкновения!');
        return false; // Не погибаем
    }
    
    // Иначе - смерть
    die();
    return true; // Погибли
}

// Функция для активации бонуса скорости
export function activateSpeedBonus() {
    collectBonus('speed', 8000);
}

// Функция для активации щита
export function activateShield() {
    collectBonus('shield', 10000);
}

// Функция для замедления времени
export function activateSlowMotion() {
    collectBonus('slow', 6000);
}
