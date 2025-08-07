'use client';

import { useState } from 'react';
import Link from 'next/link';
import View from "@/shared/ui/View";
import { 
  Play, 
  Trophy,
  Users,
  Shield,
  ChevronRight,
  Zap,
  Lock,
  Code,
  Brain,
  Award,
  Target,
  Cpu,
  Eye
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
  isLocked: boolean;
  progress: number;
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
    isLocked: false,
    progress: 0,
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
    isLocked: false,
    progress: 0,
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
    isLocked: false,
    progress: 0,
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
    isLocked: false,
    progress: 0,
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
    isLocked: false,
    progress: 0,
    theme: "from-red-600 to-orange-600",
    topics: ["nonReentrant", "безопасность", "OpenZeppelin", "CEI паттерн"]
  }
];

export default function HomePage() {
  const [selectedMission, setSelectedMission] = useState<number | null>(null);
  const [playerXP] = useState(0);
  const [playerLevel] = useState(1);
  const [completedMissions] = useState(0);

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
        {/* Header - Guardian Identity */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 mb-6 px-8 py-4 bg-gray-800/50 backdrop-blur border border-cyan-500/30 rounded-2xl">
            <Shield className="w-8 h-8 text-cyan-400" />
            <span className="text-cyan-400 font-mono text-lg">СИСТЕМА АКТИВИРОВАНА</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-6 font-mono">
            🛡️ ХРАНИТЕЛЬ БЛОКЧЕЙНА
          </h1>
          <div className="max-w-4xl mx-auto bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-2xl p-8 mb-8">
            <p className="text-2xl text-cyan-100 mb-4 font-semibold">
              Добро пожаловать в SmartYou — симуляционную игру защитника сети
            </p>
            <p className="text-lg text-gray-300 mb-6">
              Ваша миссия: защитить децентрализованный мир через освоение программирования смарт-контрактов на Solidity.
              Пройдите 5 испытаний и станьте настоящим Стражем блокчейна.
            </p>
            
            {/* Player Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 border border-cyan-500/30 rounded-xl p-4 text-center">
                <Target className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{playerLevel}</div>
                <div className="text-sm text-gray-400">Уровень</div>
              </div>
              <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-4 text-center">
                <Zap className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{playerXP}</div>
                <div className="text-sm text-gray-400">XP</div>
              </div>
              <div className="bg-gray-900/50 border border-green-500/30 rounded-xl p-4 text-center">
                <Trophy className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{completedMissions}</div>
                <div className="text-sm text-gray-400">Миссии</div>
              </div>
              <div className="bg-gray-900/50 border border-yellow-500/30 rounded-xl p-4 text-center">
                <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-sm text-gray-400">Бейджи</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="mb-12">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-orange-900/30 to-yellow-900/30 backdrop-blur border border-orange-500/50 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="text-6xl">🦊</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-orange-300 mb-2">AI-Наставник готов помочь!</h3>
                <p className="text-orange-100">
                  Привет, Хранитель! Я твой персональный ассистент. Буду давать подсказки и помогать разбирать ошибки в коде.
                  Готов начать первую миссию?
                </p>
              </div>
              <div className="text-orange-400 animate-pulse">
                <Brain className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Mission Grid */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-12 text-center font-mono">
            <Code className="inline-block w-10 h-10 mr-4 text-cyan-400" />
            КАРТА МИССИЙ БЛОКЧЕЙНА
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {GAME_MISSIONS.map((mission) => (
              <div
                key={mission.id}
                className={`relative overflow-hidden bg-gradient-to-br ${mission.theme} rounded-2xl p-8 cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-2xl border border-white/10 ${
                  mission.isLocked 
                    ? 'opacity-50 cursor-not-allowed' 
                    : selectedMission === mission.id
                    ? 'ring-2 ring-cyan-400/50 shadow-cyan-500/25'
                    : 'hover:shadow-3xl hover:border-white/20'
                }`}
                onClick={() => !mission.isLocked && setSelectedMission(mission.id)}
              >
                {/* Cyberpunk grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                
                {/* Mission content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="text-6xl mb-4">{mission.icon}</div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`px-4 py-2 rounded-full text-sm border backdrop-blur-sm font-mono ${getDifficultyColor(mission.difficulty)}`}>
                        {mission.difficulty}
                      </div>
                      <div className="px-3 py-1 bg-gray-900/50 backdrop-blur text-yellow-400 text-xs rounded-full border border-yellow-500/30 font-mono">
                        +{mission.xp} XP
                      </div>
                      {mission.isLocked && (
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
                    <div className="bg-black/30 backdrop-blur rounded-lg p-4 mb-4 border border-white/10">
                      <p className="text-cyan-300 text-sm font-mono">
                        💡 Сценарий: {mission.scenario}
                      </p>
                    </div>
                    
                    {/* Topics */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {mission.topics.map((topic, index) => (
                        <span key={index} className="px-3 py-1 bg-black/40 text-cyan-300 text-xs rounded-full border border-cyan-500/30 font-mono">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-white/70 font-mono">Прогресс</span>
                      <span className="text-white/70 font-mono">{mission.progress}%</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-3 backdrop-blur-sm border border-white/10">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${mission.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Reward info */}
                  <div className="mb-6 bg-black/30 backdrop-blur rounded-lg p-4 border border-yellow-500/30">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-300 text-sm font-mono">
                        Награда: {mission.reward}
                      </span>
                    </div>
                  </div>
                  
                  <Link href={`/levels/${mission.id}`}>
                    <button
                      disabled={mission.isLocked}
                      className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg transition-all duration-300 font-mono ${
                        mission.isLocked
                          ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed backdrop-blur-sm border border-gray-600/30'
                          : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/20 hover:border-white/40'
                      }`}
                    >
                      {mission.isLocked ? (
                        <>
                          <Lock size={20} />
                          ЗАБЛОКИРОВАНО
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
            ))}
          </div>
        </div>

        {/* Navigation Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/achievements">
            <div className="bg-gray-800/50 backdrop-blur border border-yellow-500/30 rounded-xl p-8 text-center cursor-pointer transform hover:scale-105 transition-all duration-300 hover:bg-gray-700/50 hover:border-yellow-400/50">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3 font-mono">ДОСТИЖЕНИЯ</h3>
              <p className="text-gray-400">Ваши бейджи, награды и сертификаты за выполнение миссий</p>
            </div>
          </Link>

          <Link href="/leaderboard">
            <div className="bg-gray-800/50 backdrop-blur border border-purple-500/30 rounded-xl p-8 text-center cursor-pointer transform hover:scale-105 transition-all duration-300 hover:bg-gray-700/50 hover:border-purple-400/50">
              <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3 font-mono">РЕЙТИНГ ХРАНИТЕЛЕЙ</h3>
              <p className="text-gray-400">Соревнуйтесь с другими Хранителями блокчейна</p>
            </div>
          </Link>

          <Link href="/blockchain">
            <div className="bg-gray-800/50 backdrop-blur border border-cyan-500/30 rounded-xl p-8 text-center cursor-pointer transform hover:scale-105 transition-all duration-300 hover:bg-gray-700/50 hover:border-cyan-400/50">
              <Cpu className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3 font-mono">ЛАБОРАТОРИЯ</h3>
              <p className="text-gray-400">Свободная разработка и эксперименты с Solidity</p>
            </div>
          </Link>
        </div>

        {/* Final Goal */}
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-green-900/30 to-emerald-900/30 backdrop-blur border border-green-500/50 rounded-2xl p-8 text-center mb-12">
          <div className="text-6xl mb-6">🏆</div>
          <h2 className="text-3xl font-bold text-green-300 mb-4 font-mono">ФИНАЛЬНАЯ ЦЕЛЬ</h2>
          <p className="text-green-100 text-lg mb-6">
            Пройдите все 5 миссий и получите сертификат <strong>«Страж Блокчейна»</strong>
          </p>
          <div className="bg-black/30 backdrop-blur rounded-lg p-4 border border-green-500/30">
            <p className="text-green-200 font-mono">
              🎯 После получения сертификата откроется доступ к реальному тестнету Ethereum
            </p>
          </div>
        </div>

        {/* Game Features */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-8 font-mono">
            <Eye className="inline-block w-10 h-10 mr-4 text-cyan-400" />
            ОСОБЕННОСТИ ИГРЫ
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Code className="w-12 h-12" />,
                title: "Реальный Solidity",
                description: "Пишите настоящие смарт-контракты с проверкой синтаксиса"
              },
              {
                icon: <Brain className="w-12 h-12" />,
                title: "AI-Наставник", 
                description: "Персональный помощник даёт подсказки при ошибках"
              },
              {
                icon: <Shield className="w-12 h-12" />,
                title: "Симуляция атак",
                description: "Визуальная демонстрация уязвимостей и их исправление"
              },
              {
                icon: <Trophy className="w-12 h-12" />,
                title: "Система наград",
                description: "XP, бейджи, NFT и финальный сертификат"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl hover:border-cyan-500/30 transition-all">
                <div className="text-cyan-400 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 font-mono">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </View>
  );
}
