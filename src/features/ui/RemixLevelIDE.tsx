'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from '@monaco-editor/react';
import { toast } from 'react-hot-toast';
import { 
  Code, 
  Rocket, 
  Play, 
  FileText, 
  Wallet, 
  CheckCircle, 
  AlertTriangle, 
  Zap,
  ArrowRight,
  Trophy
} from 'lucide-react';
import { useWeb3, useContractInteraction } from '@/features/model/useWeb3';
import { CONTRACT_TEMPLATES } from '@/features/model/contractTemplates';
import { useLevelTransition } from '@/features/model/levelTransition';
import { useConsole } from '@/features/model/useConsole';

interface RemixLevelIDEProps {
  levelNumber: number;
  title: string;
  description: string;
  initialCode: string;
  targetTemplate?: string;
  hints?: string[];
  successMessage?: string;
  onSuccess?: () => void;
}

interface CompilationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export default function RemixLevelIDE({
  levelNumber,
  title,
  description,
  initialCode,
  targetTemplate,
  hints = [],
  successMessage = 'Уровень успешно завершен!',
  onSuccess
}: RemixLevelIDEProps) {
  const [code, setCode] = useState(initialCode);
  const [activeTab, setActiveTab] = useState<'editor' | 'deploy' | 'interact'>('editor');
  const [isCompiling, setIsCompiling] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [compilationErrors, setCompilationErrors] = useState<CompilationError[]>([]);
  const [isCompiled, setIsCompiled] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [isLevelCompleted, setIsLevelCompleted] = useState(false);
  const [codeStats, setCodeStats] = useState({ lines: 0, chars: 0 });

  const { isConnected, account, connect } = useWeb3();
  const { deployContract, callContract, readContract } = useContractInteraction();
  const { completeLevel, goToNext, hasNextLevel } = useLevelTransition();
  const { addLog } = useConsole();

  // Обновляем статистику кода
  useEffect(() => {
    const lines = code.split('\n').length;
    const chars = code.length;
    setCodeStats({ lines, chars });
  }, [code]);

  // Проверка корректности кода (упрощенная)
  const validateCode = useCallback(() => {
    const errors: CompilationError[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      // Проверка базового синтаксиса Solidity
      if (line.includes('pragma') && !line.includes('solidity')) {
        errors.push({
          line: index + 1,
          column: 1,
          message: 'Missing solidity version in pragma statement',
          severity: 'error'
        });
      }

      if (line.includes('contract') && !line.includes('{') && !lines[index + 1]?.includes('{')) {
        errors.push({
          line: index + 1,
          column: 1,
          message: 'Contract declaration must be followed by opening brace',
          severity: 'error'
        });
      }

      if (line.includes('function') && line.includes('payable') && !line.includes('public') && !line.includes('external')) {
        errors.push({
          line: index + 1,
          column: 1,
          message: 'Payable function should have explicit visibility',
          severity: 'warning'
        });
      }

      if (line.includes('msg.value') && !line.includes('payable')) {
        errors.push({
          line: index + 1,
          column: 1,
          message: 'Using msg.value requires payable function',
          severity: 'error'
        });
      }
    });

    return errors;
  }, [code]);

  // Компиляция контракта
  const handleCompile = async () => {
    setIsCompiling(true);
    setCompilationErrors([]);
    addLog('🔨 Компилируем контракт...');

    try {
      // Имитируем задержку компиляции
      await new Promise(resolve => setTimeout(resolve, 1500));

      const errors = validateCode();
      setCompilationErrors(errors);

      const hasErrors = errors.some(e => e.severity === 'error');
      
      if (hasErrors) {
        setIsCompiled(false);
        addLog('❌ Компиляция завершилась с ошибками');
        errors.forEach(error => {
          addLog(`⚠️  Строка ${error.line}: ${error.message}`);
        });
        toast.error('Ошибки компиляции обнаружены');
      } else {
        setIsCompiled(true);
        addLog('✅ Компиляция прошла успешно!');
        toast.success('Контракт скомпилирован');
        
        // Проверяем успешность уровня
        if (checkLevelCompletion()) {
          handleLevelSuccess();
        }
      }
    } catch (error) {
      console.error('Compilation error:', error);
      addLog('❌ Ошибка компиляции');
      toast.error('Ошибка при компиляции');
    } finally {
      setIsCompiling(false);
    }
  };

  // Проверка завершения уровня
  const checkLevelCompletion = useCallback(() => {
    switch (levelNumber) {
      case 1:
        return code.includes('constructor') && code.includes('payable') && code.includes('msg.sender');
      case 2:
        return code.includes('mapping') && code.includes('require') && code.includes('event');
      case 3:
        return code.includes('_mint') && code.includes('ERC721') && code.includes('tokenId');
      case 4:
        return code.includes('vote') && code.includes('proposal') && code.includes('mapping');
      case 5:
        return code.includes('stake') && code.includes('reward') && code.includes('modifier');
      default:
        return true;
    }
  }, [code, levelNumber]);

  // Обработка успешного завершения уровня
  const handleLevelSuccess = () => {
    if (!isLevelCompleted) {
      setIsLevelCompleted(true);
      addLog(`🎉 ${successMessage}`);
      
      const isNewCompletion = completeLevel(levelNumber);
      if (isNewCompletion) {
        toast.success('Новый уровень завершен! +100 SYT');
      } else {
        toast.success('Уровень повторно завершен!');
      }
      
      onSuccess?.();
    }
  };

  // Развертывание контракта
  const handleDeploy = async () => {
    if (!isConnected) {
      toast.error('Подключите MetaMask для развертывания');
      return;
    }

    if (!isCompiled) {
      toast.error('Сначала скомпилируйте контракт');
      return;
    }

    setIsDeploying(true);
    addLog('🚀 Развертываем контракт в сеть...');

    try {
      // Здесь будет реальное развертывание через Hardhat/Ethers
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Имитируем успешное развертывание
      const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      setDeployedAddress(mockAddress);
      
      addLog(`✅ Контракт развернут по адресу: ${mockAddress}`);
      addLog(`👤 Развертыватель: ${account}`);
      toast.success('Контракт успешно развернут!');
      
      setActiveTab('interact');
    } catch (error) {
      console.error('Deployment error:', error);
      addLog('❌ Ошибка при развертывании');
      toast.error('Не удалось развернуть контракт');
    } finally {
      setIsDeploying(false);
    }
  };

  // Взаимодействие с контрактом
  const handleInteract = async () => {
    if (!deployedAddress) {
      toast.error('Сначала разверните контракт');
      return;
    }

    try {
      addLog('🔄 Взаимодействуем с контрактом...');
      // Здесь будет реальное взаимодействие с контрактом
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addLog('✅ Транзакция выполнена успешно');
      toast.success('Взаимодействие выполнено!');
    } catch (error) {
      console.error('Interaction error:', error);
      addLog('❌ Ошибка взаимодействия');
      toast.error('Ошибка при взаимодействии');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              {title}
            </h1>
            <p className="text-gray-400 mt-1">{description}</p>
          </div>
          
          {/* Wallet Status */}
          <div className="flex items-center gap-4">
            {!isConnected ? (
              <button
                onClick={connect}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
              >
                <Wallet size={18} />
                <span>Подключить MetaMask</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg">
                <CheckCircle size={18} />
                <span>Подключен: {account?.slice(0, 6)}...{account?.slice(-4)}</span>
              </div>
            )}
            
            {isLevelCompleted && (
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-600 rounded-lg">
                <Trophy size={18} />
                <span>Уровень завершен!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-700 bg-gray-800/50 backdrop-blur p-4">
          {/* Hints Section */}
          {hints.length > 0 && !isLevelCompleted && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Zap className="text-yellow-400" size={20} />
                Подсказки AI
              </h3>
              <div className="space-y-2">
                {hints.map((hint, idx) => (
                  <div key={idx} className="p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg text-sm">
                    💡 {hint}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleCompile}
              disabled={isCompiling}
              className="w-full flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Code size={18} />
              {isCompiling ? 'Компилируем...' : 'Компилировать'}
            </button>
            
            <button
              onClick={handleDeploy}
              disabled={!isCompiled || isDeploying || !isConnected}
              className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Rocket size={18} />
              {isDeploying ? 'Развертываем...' : 'Развернуть'}
            </button>
            
            {deployedAddress && (
              <button
                onClick={handleInteract}
                className="w-full flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Play size={18} />
                Взаимодействовать
              </button>
            )}
          </div>

          {/* Compilation Errors */}
          {compilationErrors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="text-red-400" size={20} />
                Ошибки компиляции
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {compilationErrors.map((error, idx) => (
                  <div key={idx} className={`p-2 rounded text-sm ${
                    error.severity === 'error' ? 'bg-red-900/30 border border-red-600' :
                    error.severity === 'warning' ? 'bg-yellow-900/30 border border-yellow-600' :
                    'bg-blue-900/30 border border-blue-600'
                  }`}>
                    <div className="font-medium">Строка {error.line}:</div>
                    <div className="text-xs opacity-80">{error.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold">{codeStats.lines}</div>
              <div className="text-xs text-gray-400">Строк</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold">{codeStats.chars}</div>
              <div className="text-xs text-gray-400">Символов</div>
            </div>
          </div>

          {/* Level Completion */}
          {isLevelCompleted && (
            <div className="mt-6 p-4 bg-green-900/30 border border-green-600 rounded-lg">
              <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
                <Trophy size={18} />
                Уровень завершен!
              </div>
              <p className="text-sm text-green-200 mb-3">
                {successMessage}
              </p>
              {hasNextLevel ? (
                <button
                  onClick={goToNext}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Следующий уровень
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={() => goToNext()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  К списку уровней
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-700 bg-gray-800/50 backdrop-blur">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-2 px-6 py-3 transition-colors ${
                activeTab === 'editor' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <FileText size={18} />
              Редактор
            </button>
            <button
              onClick={() => setActiveTab('deploy')}
              className={`flex items-center gap-2 px-6 py-3 transition-colors ${
                activeTab === 'deploy' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Rocket size={18} />
              Развертывание
            </button>
            <button
              onClick={() => setActiveTab('interact')}
              className={`flex items-center gap-2 px-6 py-3 transition-colors ${
                activeTab === 'interact' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Play size={18} />
              Взаимодействие
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            {activeTab === 'editor' && (
              <div className="h-full">
                <Editor
                  language="solidity"
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    wordWrap: 'on',
                    readOnly: false,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    folding: true,
                    lineNumbers: 'on',
                    renderWhitespace: 'selection',
                  }}
                />
              </div>
            )}

            {activeTab === 'deploy' && (
              <div className="p-6 h-full overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4">Развертывание контракта</h3>
                
                {!isConnected ? (
                  <div className="text-center py-12">
                    <Wallet size={64} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-400 mb-4">Подключите MetaMask для развертывания</p>
                    <button
                      onClick={connect}
                      className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
                    >
                      Подключить кошелек
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Статус компиляции</h4>
                      <div className={`flex items-center gap-2 ${isCompiled ? 'text-green-400' : 'text-gray-400'}`}>
                        {isCompiled ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                        {isCompiled ? 'Контракт скомпилирован' : 'Требуется компиляция'}
                      </div>
                    </div>

                    {deployedAddress && (
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Развернутый контракт</h4>
                        <div className="text-sm text-gray-300 break-all">
                          {deployedAddress}
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Сеть</h4>
                      <div className="text-sm text-gray-300">
                        Localhost (Chain ID: 31337)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'interact' && (
              <div className="p-6 h-full overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4">Взаимодействие с контрактом</h3>
                
                {!deployedAddress ? (
                  <div className="text-center py-12">
                    <Rocket size={64} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-400">Сначала разверните контракт</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Адрес контракта</h4>
                      <div className="text-sm text-gray-300 break-all mb-4">
                        {deployedAddress}
                      </div>
                      
                      <div className="space-y-3">
                        <button
                          onClick={handleInteract}
                          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                        >
                          Вызвать функцию
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
