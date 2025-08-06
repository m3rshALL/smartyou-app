'use client';

import { useState, useEffect } from 'react';
import View from "@/shared/ui/View";
import Container from "@/shared/ui/Container";
import Widget from "@/shared/ui/Widget";
import SolidityIDE from "@/features/ui/SimpleBlockchainIDE";
import { Web3Provider } from "@/features/model/Web3Provider";
import type { DeploymentResult } from "@/features/model/solidityCompilerMock";

function BlockchainPageContent() {
  const [deployedContracts, setDeployedContracts] = useState<DeploymentResult[]>([]);
  const [showTutorial, setShowTutorial] = useState(true);

  const handleContractDeployed = (result: DeploymentResult) => {
    if (result.contractAddress) {
      setDeployedContracts(prev => [...prev, result]);
    }
  };

  const tutorialSteps = [
    {
      title: "🚀 Добро пожаловать в Blockchain IDE!",
      content: "Здесь вы можете изучать Solidity, компилировать и разворачивать смарт-контракты прямо в браузере."
    },
    {
      title: "📝 Шаг 1: Выберите шаблон",
      content: "Используйте выпадающий список для выбора готового шаблона контракта (SimpleStorage, Token, Voting, NFT)."
    },
    {
      title: "⚙️ Шаг 2: Скомпилируйте код",
      content: "Нажмите кнопку 'Compile' для компиляции вашего Solidity кода. Проверьте результаты в нижней панели."
    },
    {
      title: "🔗 Шаг 3: Подключите кошелек",
      content: "Нажмите 'Connect Wallet' для подключения MetaMask. Это необходимо для развертывания контрактов."
    },
    {
      title: "🚀 Шаг 4: Разверните контракт",
      content: "После успешной компиляции введите аргументы конструктора (если нужны) и нажмите 'Deploy'."
    }
  ];

  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);

  useEffect(() => {
    // Auto-advance tutorial
    const interval = showTutorial ? setInterval(() => {
      setCurrentTutorialStep(prev => {
        if (prev >= tutorialSteps.length - 1) {
          setShowTutorial(false);
          return 0;
        }
        return prev + 1;
      });
    }, 4000) : undefined;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showTutorial, tutorialSteps.length]);

  return (
    <View className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Container className="py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            🌐 Blockchain IDE
          </h1>
          <p className="text-xl text-purple-200 mb-6">
            Изучайте Solidity и разрабатывайте смарт-контракты
          </p>
          
          {/* Tutorial Toggle */}
          <button
            onClick={() => setShowTutorial(!showTutorial)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {showTutorial ? 'Скрыть обучение' : 'Показать обучение'}
          </button>
        </div>

        {/* Tutorial Panel */}
        {showTutorial && (
          <Widget
            className="mb-6"
            title="📚 Обучение"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                <path d="M480-120 200-272v-240L40-600l440-240 440 240v320h-80v-276l-80 44v240L480-120Zm0-332 274-148-274-148-274 148 274 148Zm0 241 200-108v-151L480-360 280-470v151l200 108Zm0-241Zm0 90Zm0 0Z"/>
              </svg>
            }
          >
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {tutorialSteps[currentTutorialStep]?.title}
                </h3>
                <div className="text-sm text-gray-600">
                  {currentTutorialStep + 1} / {tutorialSteps.length}
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                {tutorialSteps[currentTutorialStep]?.content}
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentTutorialStep + 1) / tutorialSteps.length) * 100}%` }}
                />
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setCurrentTutorialStep(Math.max(0, currentTutorialStep - 1))}
                  disabled={currentTutorialStep === 0}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  ← Назад
                </button>
                <button
                  onClick={() => {
                    if (currentTutorialStep < tutorialSteps.length - 1) {
                      setCurrentTutorialStep(currentTutorialStep + 1);
                    } else {
                      setShowTutorial(false);
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  {currentTutorialStep < tutorialSteps.length - 1 ? 'Далее →' : 'Готово ✓'}
                </button>
              </div>
            </div>
          </Widget>
        )}

        {/* Main IDE */}
        <Widget
          className="mb-6"
          title="💻 Solidity IDE"
          windowMode
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
              <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H160v400Zm40-80h200v-80H200v80Zm240-120h200v-80H440v80Zm-240 0h200v-80H200v80Zm480-120H480v-80h200v80Zm-280 0H200v-80h200v80Z"/>
            </svg>
          }
        >
          <SolidityIDE />
        </Widget>

        {/* Deployed Contracts */}
        {deployedContracts.length > 0 && (
          <Widget
            title="🎯 Развернутые контракты"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                <path d="M440-183v-274L200-596v274l240 139Zm80 0l240-139v-274L520-457v274Zm-40-343 237-137-237-137-237 137 237 137ZM160-252q-19-11-29.5-29T120-321v-318q0-22 10.5-40t29.5-29l280-161q19-11 40-11t40 11l280 161q19 11 29.5 29t10.5 40v318q0 22-10.5 40T800-252L520-91q-19 11-40 11t-40-11L160-252Zm320-228Z"/>
              </svg>
            }
          >
            <div className="space-y-4">
              {deployedContracts.map((contract, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-800">Контракт #{index + 1}</h4>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Развернут
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <strong>Адрес:</strong> 
                      <code className="bg-gray-100 px-1 rounded ml-1 text-xs">
                        {contract.contractAddress || contract.address}
                      </code>
                    </div>
                    <div>
                      <strong>Транзакция:</strong>
                      <code className="bg-gray-100 px-1 rounded ml-1 text-xs">
                        {contract.transactionHash}
                      </code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Widget>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {[
            {
              title: "🔧 Компилятор Remix",
              description: "Полнофункциональный компилятор Solidity от Remix IDE",
              color: "from-blue-500 to-cyan-500"
            },
            {
              title: "🚀 Развертывание",
              description: "Разворачивайте контракты в тестовых сетях через MetaMask",
              color: "from-green-500 to-emerald-500"
            },
            {
              title: "📚 Шаблоны",
              description: "Готовые шаблоны: ERC20, ERC721, Voting и другие",
              color: "from-purple-500 to-pink-500"
            },
            {
              title: "🎯 Интерактивность",
              description: "Подсветка синтаксиса и автодополнение кода",
              color: "from-orange-500 to-red-500"
            }
          ].map((feature, index) => (
            <Widget
              key={index}
              title={feature.title}
              className="h-48"
            >
              <div className={`h-full bg-gradient-to-br ${feature.color} rounded-lg p-4 text-white flex flex-col justify-between`}>
                <p className="text-sm opacity-90">
                  {feature.description}
                </p>
                <div className="text-right text-xs opacity-75">
                  SmartYou Platform
                </div>
              </div>
            </Widget>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-center mt-8">
          <Widget className="inline-flex">
            <div className="flex space-x-4 p-4">
              <a
                href="/levels"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
                </svg>
                К уровням
              </a>
              <a
                href="/achievements"
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Достижения
              </a>
            </div>
          </Widget>
        </div>
      </Container>
    </View>
  );
}

export default function BlockchainPage() {
  return (
    <Web3Provider>
      <BlockchainPageContent />
    </Web3Provider>
  );
}
