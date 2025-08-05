'use client';

import { useEffect } from 'react';
import { useCompletedLevels } from '@/features/model/useLevels';
import { useRouter } from 'next/navigation';

export default function Certificate() {
    const { completedLevels } = useCompletedLevels();
    const router = useRouter();

    useEffect(() => {
        if (completedLevels < 5) {
            router.push('/levels/');
        }
    }, [completedLevels]);

    if (completedLevels < 5) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white text-black p-8 rounded-lg shadow-2xl">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4 text-purple-800">СЕРТИФИКАТ</h1>
                    <h2 className="text-2xl mb-8 text-gray-700">о прохождении курса Solidity</h2>
                    
                    <div className="border-4 border-purple-200 p-8 mb-8">
                        <div className="text-lg mb-4">Настоящим подтверждается, что</div>
                        <div className="text-3xl font-bold mb-4 text-purple-800">Smart You Student</div>
                        <div className="text-lg mb-4">успешно завершил обучающий курс</div>
                        <div className="text-2xl font-bold mb-4">&quot;Smart You: Путь к мастерству Solidity&quot;</div>
                        <div className="text-lg">и получил звание <strong>&quot;Страж блокчейна&quot;</strong></div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-600">
                        <div>Дата: {new Date().toLocaleDateString()}</div>
                        <div>ID: SMY-{Date.now()}</div>
                    </div>
                </div>
                
                <div className="text-center mt-8">
                    <button
                        onClick={() => router.push('/levels/')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mr-4"
                    >
                        Вернуться к уровням
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Распечатать
                    </button>
                </div>
            </div>
        </div>
    );
}