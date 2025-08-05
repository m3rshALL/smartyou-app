import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useExtendedGameStore } from "@/features/model/useExtendedGameStore";

function NameForm() {
    const router = useRouter();
    const { initializePlayer } = useExtendedGameStore();

    const nameRef = useRef<HTMLInputElement>(null);

    const handleStart = () => {
        if (nameRef.current?.value) {
            const playerName = nameRef.current.value;
            
            // Сохраняем имя в cookies для совместимости
            Cookies.set("name", playerName, { expires: 7 });
            
            // Инициализируем профиль игрока в новой системе
            initializePlayer(playerName);
            
            router.push("/levels");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleStart();
        }
    };

    return (
        <div className="p-4 flex flex-col items-center text-center py-12">
            <div className="text-2xl font-semibold">
                Добро пожаловать в SmartYou!
            </div>
            <div className="text-subtext mt-1">
                Изучите Solidity через захватывающие задания и мини-игры.
            </div>

            <input
                type="text"
                className="w-72 mt-12 py-3 px-6 rounded-2xl bg-light outline-none"
                placeholder="Введите ваше имя"
                ref={nameRef}
                onKeyPress={handleKeyPress}
                maxLength={20}
            />

            <button
                className="mt-12 px-8 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-800 cursor-pointer transition-colors"
                onClick={handleStart}
            >
                🚀 Начать обучение
            </button>
            
            <div className="mt-6 text-sm text-gray-400">
                <div>🎯 5 увлекательных уровней</div>
                <div>🏆 Система достижений и XP</div>
                <div>🎮 Интерактивные мини-игры</div>
            </div>
        </div>
    );
}

export default NameForm;