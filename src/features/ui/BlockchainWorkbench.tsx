'use client';

import React, { useState, useMemo } from 'react';
import { Editor } from '@monaco-editor/react';
import { SolidityCompilerService } from '../model/solidityCompilerMock';
import { useWeb3Context, useContractInteraction } from '../model/Web3Provider';

const SIMPLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    uint256 private storedData;
    
    event DataStored(uint256 data);
    
    constructor(uint256 _initialData) {
        storedData = _initialData;
    }
    
    function set(uint256 _data) public {
        storedData = _data;
        emit DataStored(_data);
    }
    
    function get() public view returns (uint256) {
        return storedData;
    }
}`;

const ERC20_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1000000 * 10**decimals());
    }
}`;

export default function BlockchainWorkbench() {
  const [code, setCode] = useState(SIMPLE_CONTRACT);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [compilationResult, setCompilationResult] = useState<any>(null);
  const [deployedContract, setDeployedContract] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('simple-storage');
  const [constructorArgs, setConstructorArgs] = useState('42');
  const [interactionFunction, setInteractionFunction] = useState('');
  const [functionArgs, setFunctionArgs] = useState('');
  const [functionResult, setFunctionResult] = useState('');

  const compiler = useMemo(() => new SolidityCompilerService(), []);
  const { deployContract, callContract, readContract } = useContractInteraction();
  
  const { 
    isConnected, 
    account, 
    network, 
    error: web3Error, 
    connect, 
    clearError 
  } = useWeb3Context();

  const templates = [
    { id: 'simple-storage', name: 'Simple Storage', code: SIMPLE_CONTRACT },
    { id: 'erc20-token', name: 'ERC20 Token', code: ERC20_CONTRACT },
  ];

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setCode(template.code);
      setCompilationResult(null);
      setDeployedContract(null);
      setFunctionResult('');
    }
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    try {
      const result = await compiler.compile([{ name: 'Contract.sol', content: code }]);
      setCompilationResult(result);
    } catch (error) {
      console.error('Compilation error:', error);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDeploy = async () => {
    if (!compilationResult?.success || !isConnected) return;
    
    setIsDeploying(true);
    try {
      // For demo purposes, we'll use a mock deployment
      // In real implementation, you'd use the actual contract bytecode and ABI
      const mockResult = {
        contractAddress: '0x' + Math.random().toString(16).substr(2, 40),
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        contractName: selectedTemplate,
        abi: [
          {
            "inputs": [{"name": "x", "type": "uint256"}],
            "name": "set",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "get",
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
          }
        ]
      };
      
      setDeployedContract(mockResult);
      
      setTimeout(() => {
        setIsDeploying(false);
      }, 2000);
    } catch (error) {
      console.error('Deployment error:', error);
      setIsDeploying(false);
    }
  };

  const handleFunctionCall = async () => {
    if (!deployedContract || !interactionFunction) return;
    
    try {
      // Mock function call for demo
      let result = '';
      if (interactionFunction === 'get') {
        result = Math.floor(Math.random() * 1000).toString();
      } else if (interactionFunction === 'set' && functionArgs) {
        result = `Transaction sent: 0x${Math.random().toString(16).substr(2, 64)}`;
      }
      setFunctionResult(result);
    } catch (error) {
      console.error('Function call error:', error);
      setFunctionResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">🌐 Blockchain Workbench</h1>
          <p className="text-gray-400">
            Полная среда разработки смарт-контрактов с компиляцией и развертыванием
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Editor Panel */}
          <div className="xl:col-span-2 space-y-4">
            {/* Web3 Status */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    {isConnected ? (
                      <div>
                        <div className="font-medium text-green-400">
                          Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
                        </div>
                        {network && <div className="text-sm text-gray-400">Network: {network.name}</div>}
                      </div>
                    ) : (
                      <div className="font-medium text-red-400">Кошелек не подключен</div>
                    )}
                  </div>
                </div>
                {!isConnected && (
                  <button
                    onClick={connect}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Подключить MetaMask
                  </button>
                )}
              </div>
              {web3Error && (
                <div className="mt-2 p-2 bg-red-900/50 text-red-200 rounded text-sm flex justify-between items-center">
                  {web3Error}
                  <button onClick={clearError} className="text-red-300 hover:text-white ml-2">×</button>
                </div>
              )}
            </div>

            {/* Template Selection */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium">Шаблон:</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Code Editor */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <div className="text-sm font-medium">Contract.sol</div>
              </div>
              <Editor
                height="500px"
                defaultLanguage="solidity"
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  wordWrap: 'on',
                }}
              />
            </div>

            {/* Actions */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={handleCompile}
                  disabled={isCompiling}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  {isCompiling ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <span>⚙️</span>
                  )}
                  {isCompiling ? 'Компиляция...' : 'Скомпилировать'}
                </button>
                
                <button
                  onClick={handleDeploy}
                  disabled={!compilationResult?.success || !isConnected || isDeploying}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  {isDeploying ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <span>🚀</span>
                  )}
                  {isDeploying ? 'Развертывание...' : 'Развернуть'}
                </button>

                {selectedTemplate === 'simple-storage' && (
                  <input
                    type="text"
                    placeholder="Constructor args (e.g., 42)"
                    value={constructorArgs}
                    onChange={(e) => setConstructorArgs(e.target.value)}
                    className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-4">
            {/* Compilation Results */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-blue-400">📋 Результаты</h3>
              
              {compilationResult && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">Компиляция:</span>
                    <span className={`w-2 h-2 rounded-full ${compilationResult.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </div>
                  {compilationResult.success ? (
                    <div className="text-green-400 text-sm">✓ Успешно скомпилировано</div>
                  ) : (
                    <div className="text-red-400 text-sm">✗ Ошибка компиляции</div>
                  )}
                </div>
              )}

              {deployedContract && (
                <div className="mb-4 p-3 bg-green-900/20 border border-green-500/30 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">Развертывание:</span>
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  </div>
                  <div className="text-green-400 text-sm mb-2">✓ Контракт развернут</div>
                  <div className="text-gray-300 text-xs space-y-1">
                    <div><strong>Адрес:</strong> {deployedContract.contractAddress}</div>
                    <div><strong>TX Hash:</strong> {deployedContract.transactionHash}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Contract Interaction */}
            {deployedContract && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-purple-400">🔧 Взаимодействие</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Функция:</label>
                    <select
                      value={interactionFunction}
                      onChange={(e) => setInteractionFunction(e.target.value)}
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">Выберите функцию</option>
                      <option value="get">get() - читать данные</option>
                      <option value="set">set(uint256) - записать данные</option>
                    </select>
                  </div>

                  {interactionFunction === 'set' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Аргументы:</label>
                      <input
                        type="text"
                        placeholder="Введите значение (например, 123)"
                        value={functionArgs}
                        onChange={(e) => setFunctionArgs(e.target.value)}
                        className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleFunctionCall}
                    disabled={!interactionFunction}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Выполнить
                  </button>

                  {functionResult && (
                    <div className="p-3 bg-gray-700 rounded">
                      <div className="text-sm font-medium mb-1">Результат:</div>
                      <div className="text-green-400 text-sm font-mono">{functionResult}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tutorial */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-yellow-400">💡 Справка</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <div>1. Выберите шаблон или напишите код</div>
                <div>2. Нажмите "Скомпилировать"</div>
                <div>3. Подключите MetaMask</div>
                <div>4. Разверните контракт</div>
                <div>5. Взаимодействуйте с контрактом</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
