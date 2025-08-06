'use client';

import React, { useState, useMemo } from 'react';
import { Editor } from '@monaco-editor/react';
import { SolidityCompilerService } from '../model/solidityCompilerMock';
import { useWeb3Context } from '../model/Web3Provider';

const SIMPLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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

export default function SimpleBlockchainIDE() {
  const [code, setCode] = useState(SIMPLE_CONTRACT);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [compilationResult, setCompilationResult] = useState<any>(null);
  const [deploymentResult, setDeploymentResult] = useState<any>(null);

  const compiler = useMemo(() => new SolidityCompilerService(), []);
  
  const { 
    isConnected, 
    account, 
    network, 
    error: web3Error, 
    connect, 
    clearError 
  } = useWeb3Context();

  const handleCompile = async () => {
    setIsCompiling(true);
    try {
      const result = await compiler.compile([{ name: 'SimpleStorage.sol', content: code }]);
      setCompilationResult(result);
    } catch (error) {
      console.error('Compilation error:', error);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDeploy = async () => {
    if (!compilationResult?.success) return;
    
    setIsDeploying(true);
    try {
      // Mock deployment for now
      const mockResult = {
        success: true,
        contractAddress: '0x' + Math.random().toString(16).substr(2, 40),
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
        contractName: 'SimpleStorage'
      };
      
      setDeploymentResult(mockResult);
      
      setTimeout(() => {
        setIsDeploying(false);
      }, 2000);
    } catch (error) {
      console.error('Deployment error:', error);
      setIsDeploying(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg overflow-hidden">
      {/* Web3 Status */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              {isConnected ? (
                <div>
                  <div className="font-medium">Connected: {account?.slice(0, 6)}...{account?.slice(-4)}</div>
                  {network && <div className="text-sm text-gray-400">Network: {network.name}</div>}
                </div>
              ) : (
                <div className="font-medium">Not Connected</div>
              )}
            </div>
          </div>
          {!isConnected && (
            <button
              onClick={connect}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Connect Wallet
            </button>
          )}
        </div>
        {web3Error && (
          <div className="mt-2 p-2 bg-red-900 text-red-200 rounded text-sm flex justify-between items-center">
            {web3Error}
            <button onClick={clearError} className="text-red-300 hover:text-white">×</button>
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="h-96">
        <Editor
          height="100%"
          defaultLanguage="solidity"
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true
          }}
        />
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={handleCompile}
            disabled={isCompiling}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isCompiling ? 'Compiling...' : 'Compile'}
          </button>
          <button
            onClick={handleDeploy}
            disabled={!compilationResult?.success || !isConnected || isDeploying}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isDeploying ? 'Deploying...' : 'Deploy'}
          </button>
        </div>

        {/* Results */}
        <div className="mt-4 space-y-3">
          {compilationResult && (
            <div className="bg-gray-700 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Compilation:</span>
                <span className={`w-2 h-2 rounded-full ${compilationResult.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </div>
              {compilationResult.success ? (
                <div className="text-green-400 text-sm">✓ Compilation successful</div>
              ) : (
                <div className="text-red-400 text-sm">✗ Compilation failed</div>
              )}
            </div>
          )}

          {deploymentResult && (
            <div className="bg-gray-700 p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Deployment:</span>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </div>
              <div className="text-green-400 text-sm">✓ Deployed successfully</div>
              <div className="text-gray-300 text-xs mt-1">
                Contract: {deploymentResult.contractAddress}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
