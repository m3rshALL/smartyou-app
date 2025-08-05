import { Achievement } from "../types";

export const achievements: Achievement[] = [
    {
        id: "first_steps",
        name: "Первые шаги в блокчейне",
        description: "Завершите первый уровень и восстановите кошелёк",
        icon: "🥉",
        level: 1,
        unlocked: false,
        xpReward: 100
    },
    {
        id: "democratic_ninja",
        name: "Демократический код-ниндзя",
        description: "Создайте надёжную систему голосования",
        icon: "🗳️",
        level: 2,
        unlocked: false,
        xpReward: 150
    },
    {
        id: "magic_master",
        name: "Мастер магических контрактов",
        description: "Постройте волшебный рынок артефактов",
        icon: "🔮",
        level: 3,
        unlocked: false,
        xpReward: 200
    },
    {
        id: "dao_architect",
        name: "DAO-архитектор",
        description: "Создайте децентрализованную автономную организацию",
        icon: "🏛️",
        level: 4,
        unlocked: false,
        xpReward: 300
    },
    {
        id: "legendary_hacker",
        name: "Легендарный хакер",
        description: "Пройдите финальное испытание безопасности",
        icon: "👑",
        level: 5,
        unlocked: false,
        xpReward: 500
    },
    {
        id: "speed_runner",
        name: "Спидраннер",
        description: "Завершите любой уровень менее чем за 2 минуты",
        icon: "⚡",
        level: 0,
        unlocked: false,
        xpReward: 100
    },
    {
        id: "perfectionist",
        name: "Перфекционист",
        description: "Получите 3 звезды на всех уровнях",
        icon: "⭐",
        level: 0,
        unlocked: false,
        xpReward: 400
    },
    {
        id: "no_hints",
        name: "Самостоятельный ученик",
        description: "Пройдите уровень без использования подсказок",
        icon: "🧠",
        level: 0,
        unlocked: false,
        xpReward: 75
    }
];
