import { useGameStore } from "./useGameStore";
import { useConsole } from "./useConsole";

export function run() {
    const { setPlayerRunning, setPlayerDead } = useGameStore.getState();
    setPlayerRunning(true);
    setPlayerDead(false);
}

export function spawnCactus() {
    const { setCompleted, setIsCactusSpawned } = useGameStore.getState();
    setCompleted(false);
    setIsCactusSpawned(true);
}

export function complete() {
    const {
        setPlayerJumping,
        setCompleted,
        setIsCactusSpawned
    } = useGameStore.getState();

    setPlayerJumping(true);
    setCompleted(true);

    setTimeout(() => {
        setPlayerJumping(false);
        setIsCactusSpawned(false);
    }, 1200);
}

export function die() {
    const { setPlayerDead, setPlayerRunning } = useGameStore.getState();
    const { addLog } = useConsole.getState();
    
    setPlayerDead(true);
    addLog('💀 Игрок погиб! Код содержит критические ошибки.');
    
    setTimeout(() => {
        setPlayerRunning(false);
    }, 1000);
}
