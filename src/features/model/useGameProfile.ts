import { create } from 'zustand';

type ProfileStore = {
    name: string
    setName: (name: string) => void;
};

export const useGameProfile = create<ProfileStore>((set) => ({
    name: "",
    setName: (name) => set({ name }),
}));
