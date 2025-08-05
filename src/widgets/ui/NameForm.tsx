import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useRef } from "react";

function NameForm() {
    const router = useRouter()

    const nameRef = useRef<HTMLInputElement>(null);

    const handleStart = () => {
        if (nameRef.current?.value) {
            Cookies.set("name", nameRef.current.value, { expires: 7 });
            router.push("/levels");
        }
    };

    return (
        <div className="p-4 flex flex-col items-center text-center py-12">
            <div className="text-2xl font-semibold">
                Выберите себе имя!
            </div>
            <div className="text-subtext mt-1">
                Заполните поле ниже, чтобы начать игру.
            </div>

            <input
                type="text"
                className="w-72 mt-12 py-3 px-6 rounded-2xl bg-light outline-none"
                placeholder="Ваше имя"
                ref={nameRef}
            />

            <button
                className="mt-12 px-8 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-800 cursor-pointer"
                onClick={handleStart}
            >
                Начать игру
            </button>
        </div>
    );
}

export default NameForm;