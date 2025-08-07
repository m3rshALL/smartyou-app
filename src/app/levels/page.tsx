'use client';

import { useState } from 'react';
import Link from 'next/link';
import View from '@/shared/ui/View';
import { useCompletedLevels } from '@/features/model/useLevels';
import { 
  Play, 
  Trophy,
  Shield,
  ChevronRight,
  Lock,
  Brain,
  Award,
  Target,
  CheckCircle,
  ArrowLeft,
  Home
} from 'lucide-react';

interface GameMission {
  id: number;
  title: string;
  description: string;
  scenario: string;
  difficulty: 'Начальный' | 'Начально-средний' | 'Средний' | 'Средне-продвинутый' | 'Продвинутый';
  icon: string;
  reward: string;
  badge: string;
  xp: number;
  theme: string;
  topics: string[];
}

const GAME_MISSIONS: GameMission[] = [
  {
    id: 1,
    title: "Кошелёк в опасности",
    description: "Изучите основы смарт-контрактов и защитите криптокошелёк от потери средств",
    scenario: "Персонаж не может получить доступ к своим средствам. Исправьте код контракта!",
    difficulty: 'Начальный',
    icon: "🔐",
    reward: "Значок «Новичок в коде»",
    badge: "Новичок в коде",
    xp: 10,
    theme: "from-cyan-600 to-blue-600",
    topics: ["contract", "constructor", "payable", "deposit()"]
  },
  {
    id: 2,
    title: "Электронное голосование",
    description: "Создайте систему голосования с контролем доступа и защитой от повторных голосов",
    scenario: "DAO нуждается в честной системе голосования. Обеспечьте безопасность выборов!",
    difficulty: 'Начально-средний',
    icon: "🗳️",
    reward: "Звание «Защитник демократии»",
    badge: "Защитник демократии",
    xp: 15,
    theme: "from-blue-600 to-purple-600",
    topics: ["mapping", "onlyOwner", "require", "контроль доступа"]
  },
  {
    id: 3,
    title: "Рынок магии",
    description: "Постройте торговую площадку для магических артефактов с использованием структур",
    scenario: "Торговцы не могут обменять артефакты. Создайте рабочий рынок!",
    difficulty: 'Средний',
    icon: "✨",
    reward: "NFT-артефакт в игре",
    badge: "NFT-кузнец",
    xp: 20,
    theme: "from-purple-600 to-pink-600",
    topics: ["struct", "events", "Item", "purchase()"]
  },
  {
    id: 4,
    title: "DAO — Совет защитников",
    description: "Внедрите децентрализованное управление с системой предложений и голосования",
    scenario: "Совет защитников нуждается в DAO для принятия важных решений.",
    difficulty: 'Средне-продвинутый',
    icon: "🏛️",
    reward: "NFT DAO-участника",
    badge: "DAO-мастер",
    xp: 25,
    theme: "from-pink-600 to-red-600",
    topics: ["DAO", "Proposal", "голосование по весу", "таймер"]
  },
  {
    id: 5,
    title: "Испытание хакера",
    description: "Защитите смарт-контракт от реентранси атак и других уязвимостей",
    scenario: "Хакер атакует сеть! Исправьте уязвимости и станьте Стражем блокчейна.",
    difficulty: 'Продвинутый',
    icon: "🛡️",
    reward: "Сертификат «Страж блокчейна»",
    badge: "Страж блокчейна",
    xp: 30,
    theme: "from-red-600 to-orange-600",
    topics: ["nonReentrant", "безопасность", "OpenZeppelin", "CEI паттерн"]
  }
];

export default function LevelsPage() {
  const { completedLevels, canAccessLevel } = useCompletedLevels();
  const [selectedMission, setSelectedMission] = useState<number | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Начальный': return 'text-green-400 bg-green-900/30 border-green-500/50';
      case 'Начально-средний': return 'text-cyan-400 bg-cyan-900/30 border-cyan-500/50';
      case 'Средний': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
      case 'Средне-продвинутый': return 'text-orange-400 bg-orange-900/30 border-orange-500/50';
      case 'Продвинутый': return 'text-red-400 bg-red-900/30 border-red-500/50';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500/50';
    }
  };

  return (
    <View className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Cyberpunk background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      <div className="fixed inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse delay-300"></div>
      </div>

      <div className="relative z-10 px-6 lg:px-48 xl:px-64 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl hover:bg-gray-700/50 transition-all">
                <ArrowLeft className="w-5 h-5 text-cyan-400" />
                <Home className="w-5 h-5 text-cyan-400" />
                <span className="text-cyan-400 font-mono">ГЛАВНАЯ</span>
              </button>
            </Link>
            
            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 font-mono">
                🎯 КАРТА МИССИЙ
              </h1>
              <p className="text-cyan-100 text-lg mt-2">
                Выберите миссию для продолжения обучения
              </p>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="max-w-4xl mx-auto bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white font-mono">ПРОГРЕСС ХРАНИТЕЛЯ</h2>
              <div className="text-cyan-400 font-mono">{completedLevels}/5 миссий завершено</div>
            </div>
            
            <div className="w-full bg-gray-900/50 rounded-full h-4 border border-gray-700">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-blue-500 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${(completedLevels / 5) * 100}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-900/50 border border-cyan-500/30 rounded-xl p-4 text-center">
                <Target className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{completedLevels + 1}</div>
                <div className="text-sm text-gray-400">Текущий уровень</div>
              </div>
              <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-4 text-center">
                <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{completedLevels * 15}</div>
                <div className="text-sm text-gray-400">Общий XP</div>
              </div>
              <div className="bg-gray-900/50 border border-green-500/30 rounded-xl p-4 text-center">
                <Award className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{completedLevels}</div>
                <div className="text-sm text-gray-400">Бейджи</div>
              </div>
              <div className="bg-gray-900/50 border border-yellow-500/30 rounded-xl p-4 text-center">
                <Shield className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{Math.round((completedLevels / 5) * 100)}%</div>
                <div className="text-sm text-gray-400">Готовность</div>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          {completedLevels > 0 && completedLevels < 5 && (
            <div className="max-w-4xl mx-auto bg-gradient-to-r from-green-900/30 to-emerald-900/30 backdrop-blur border border-green-500/50 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-green-300 mb-2 font-mono">🎯 СЛЕДУЮЩАЯ МИССИЯ ГОТОВА!</h3>
                  <p className="text-green-100">
                    {GAME_MISSIONS[completedLevels] && `${GAME_MISSIONS[completedLevels].title} - ${GAME_MISSIONS[completedLevels].description}`}
                  </p>
                </div>
                <Link href={`/levels/${completedLevels + 1}`}>
                  <button className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-500 transition-all transform hover:scale-105 font-mono font-bold">
                    ПРОДОЛЖИТЬ →
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Mission Grid */}
        <div className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {GAME_MISSIONS.map((mission) => {
              const isAccessible = canAccessLevel(mission.id);
              const isCompleted = mission.id <= completedLevels;
              const isCurrent = mission.id === completedLevels + 1;

              return (
                <div
                  key={mission.id}
                  className={`relative overflow-hidden bg-gradient-to-br ${mission.theme} rounded-2xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-2xl border border-white/10 ${
                    !isAccessible 
                      ? 'opacity-50 cursor-not-allowed' 
                      : selectedMission === mission.id
                      ? 'ring-2 ring-cyan-400/50 shadow-cyan-500/25'
                      : isCompleted
                      ? 'ring-2 ring-green-400/50'
                      : isCurrent
                      ? 'ring-2 ring-yellow-400/50 animate-pulse'
                      : 'hover:shadow-3xl hover:border-white/20'
                  }`}
                  onClick={() => isAccessible && setSelectedMission(mission.id)}
                >
                  {/* Cyberpunk grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                  
                  {/* Mission content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="text-6xl">{mission.icon}</div>
                        {isCompleted && <CheckCircle className="w-8 h-8 text-green-400" />}
                        {isCurrent && <Target className="w-8 h-8 text-yellow-400 animate-pulse" />}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`px-4 py-2 rounded-full text-sm border backdrop-blur-sm font-mono ${getDifficultyColor(mission.difficulty)}`}>
                          {mission.difficulty}
                        </div>
                        <div className="px-3 py-1 bg-gray-900/50 backdrop-blur text-yellow-400 text-xs rounded-full border border-yellow-500/30 font-mono">
                          +{mission.xp} XP
                        </div>
                        {!isAccessible && (
                          <div className="bg-gray-900/50 backdrop-blur-sm p-2 rounded-full border border-gray-500/30">
                            <Lock className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-3xl font-bold text-white mb-3 font-mono">
                        МИССИЯ {mission.id}
                      </h3>
                      <h4 className="text-xl font-semibold text-white/90 mb-4">
                        {mission.title}
                      </h4>
                      <p className="text-white/80 text-lg leading-relaxed mb-4">
                        {mission.description}
                      </p>
                      
                      {/* Topics */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {mission.topics.map((topic, index) => (
                          <span key={index} className="px-3 py-1 bg-black/40 text-cyan-300 text-xs rounded-full border border-cyan-500/30 font-mono">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Status */}
                    <div className="mb-6">
                      {isCompleted ? (
                        <div className="bg-green-900/30 backdrop-blur rounded-lg p-4 border border-green-500/30">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <span className="text-green-300 font-mono">МИССИЯ ЗАВЕРШЕНА</span>
                          </div>
                        </div>
                      ) : isCurrent ? (
                        <div className="bg-yellow-900/30 backdrop-blur rounded-lg p-4 border border-yellow-500/30">
                          <div className="flex items-center gap-3">
                            <Target className="w-5 h-5 text-yellow-400" />
                            <span className="text-yellow-300 font-mono">ТЕКУЩАЯ МИССИЯ</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-black/30 backdrop-blur rounded-lg p-4 border border-white/10">
                          <div className="flex items-center gap-3">
                            <Lock className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-400 font-mono">ЗАБЛОКИРОВАНО</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Link href={`/levels/${mission.id}`}>
                      <button
                        disabled={!isAccessible}
                        className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg transition-all duration-300 font-mono ${
                          !isAccessible
                            ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed backdrop-blur-sm border border-gray-600/30'
                            : isCompleted
                            ? 'bg-green-600/80 hover:bg-green-600 text-white backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 border border-green-400/50'
                            : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/20 hover:border-white/40'
                        }`}
                      >
                        {!isAccessible ? (
                          <>
                            <Lock size={20} />
                            ЗАБЛОКИРОВАНО
                          </>
                        ) : isCompleted ? (
                          <>
                            <Play size={20} />
                            ИГРАТЬ СНОВА
                            <ChevronRight size={20} />
                          </>
                        ) : (
                          <>
                            <Play size={20} />
                            НАЧАТЬ МИССИЮ
                            <ChevronRight size={20} />
                          </>
                        )}
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Completion Message */}
        {completedLevels === 5 && (
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur border border-purple-500 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-4 font-mono">ПОЗДРАВЛЯЕМ, СТРАЖ!</h2>
            <p className="text-lg text-purple-100 mb-6">
              Вы успешно завершили все миссии и получили звание &quot;Страж блокчейна&quot;!
              Теперь вы готовы к реальному тестнету Ethereum.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/">
                <button className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all transform hover:scale-105 font-mono">
                  🏠 НА ГЛАВНУЮ
                </button>
              </Link>
              <Link href="/levels/1">
                <button className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-500 transition-all transform hover:scale-105 font-mono">
                  🔄 НАЧАТЬ ЗАНОВО
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* AI Assistant Tip */}
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-orange-900/30 to-yellow-900/30 backdrop-blur border border-orange-500/50 rounded-2xl p-6 mt-8">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🦊</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-orange-300 mb-2 font-mono">AI-НАСТАВНИК</h3>
              <p className="text-orange-100">
                {completedLevels === 0 
                  ? "Добро пожаловать! Начните с первой миссии и изучайте Solidity пошагово."
                  : completedLevels < 5
                  ? "Отличная работа! Продолжайте выполнять миссии для получения новых навыков."
                  : "Поздравляю! Вы стали настоящим Стражем блокчейна!"
                }
              </p>
            </div>
            <Brain className="w-8 h-8 text-orange-400 animate-pulse" />
          </div>
        </div>
      </div>
    </View>
  );
};
