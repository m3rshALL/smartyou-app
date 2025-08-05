import { create } from 'zustand';

type GameStore = {
    playerRunning: boolean;
    setPlayerRunning: (running: boolean) => void;

    playerDead: boolean;
    setPlayerDead: (dead: boolean) => void;

    playerJumping: boolean;
    setPlayerJumping: (jumping: boolean) => void;

    completed: boolean;
    setCompleted: (completed: boolean) => void;

    isCactusSpawned: boolean;
    setIsCactusSpawned: (spawned: boolean) => void;
};

export const useGameStore = create<GameStore>((set) => ({
    playerRunning: false,
    setPlayerRunning: (running) => set({ playerRunning: running }),

    playerDead: false,
    setPlayerDead: (dead) => set({ playerDead: dead }),

    playerJumping: false,
    setPlayerJumping: (jumping) => set({ playerJumping: jumping }),

    completed: false,
    setCompleted: (completed) => set({ completed }),

    isCactusSpawned: false,
    setIsCactusSpawned: (spawned) => set({ isCactusSpawned: spawned }),
}));
