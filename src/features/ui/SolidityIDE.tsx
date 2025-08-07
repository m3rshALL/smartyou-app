'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Editor } from '@monaco-editor/react';
import { 
  SolidityCompilerService, 
  type CompilationResult, 
  type SolidityFile, 
  type DeploymentResult 
} from '../model/solidityCompilerMock';

interface SolidityIDEProps {
  className?: string;
  onContractDeployed?: (result: DeploymentResult) => void;
}

export default function SolidityIDE({ className = '', onContractDeployed }: SolidityIDEProps) {
  const [code, setCode] = useState('');
  const [fileName, setFileName] = useState('SimpleStorage.sol');
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('SimpleStorage.sol');
  const [constructorArgs, setConstructorArgs] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [provider, setProvider] = useState<any>(null);

  const compiler = useMemo(() => new SolidityCompilerService(), []);

  // Initialize with default template
  useEffect(() => {
    const templates = compiler.getContractTemplates();
    setCode(templates[selectedTemplate] || templates['SimpleStorage.sol']);
  }, [selectedTemplate, compiler]);

  // Setup Monaco editor for Solidity
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorWillMount = (monaco: any) => {
    // Register Solidity language
    monaco.languages.register({ id: 'solidity' });

    // Define syntax highlighting for Solidity
    monaco.languages.setMonarchTokensProvider('solidity', {
      tokenizer: {
        root: [
          [/pragma/, 'keyword'],
          [/contract/, 'keyword'],
          [/function/, 'keyword'],
          [/constructor/, 'keyword'],
          [/modifier/, 'keyword'],
          [/event/, 'keyword'],
          [/struct/, 'keyword'],
          [/enum/, 'keyword'],
          [/mapping/, 'keyword'],
          [/address/, 'type'],
          [/uint256|uint|int|bool|string|bytes/, 'type'],
          [/public|private|internal|external/, 'keyword'],
          [/view|pure|payable|nonpayable/, 'keyword'],
          [/require|assert|revert/, 'keyword'],
          [/if|else|for|while|do|break|continue|return/, 'keyword'],
          [/import|from/, 'keyword'],
          [/\/\/.*$/, 'comment'],
          [/\/\*/, 'comment', '@comment'],
          [/".*?"/, 'string'],
          [/'.*?'/, 'string'],
          [/[0-9]+/, 'number'],
          [/0x[0-9a-fA-F]+/, 'number'],
        ],
        comment: [
          [/[^/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[/*]/, 'comment']
        ]
      }
    });

    // Add completion provider
    monaco.languages.registerCompletionItemProvider('solidity', {
      provideCompletionItems: () => ({
        suggestions: [
          {
            label: 'contract',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'contract ${1:ContractName} {\n    $0\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a new contract'
          },
          {
            label: 'function',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'function ${1:functionName}(${2:params}) ${3:visibility} ${4:mutability} ${5:returns (${6:returnType})} {\n    $0\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a new function'
          },
          {
            label: 'constructor',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'constructor(${1:params}) {\n    $0\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a constructor'
          },
          {
            label: 'require',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'require(${1:condition}, "${2:message}");',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Require statement'
          },
          {
            label: 'emit',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'emit ${1:EventName}(${2:params});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Emit an event'
          }
        ]
      })
    });
  };

  // Handle template change
  const handleTemplateChange = (templateName: string) => {
    setSelectedTemplate(templateName);
    const templates = compiler.getContractTemplates();
    setCode(templates[templateName]);
    setFileName(templateName);
    // Clear previous results
    setCompilationResult(null);
    setDeploymentResult(null);
  };

  // Compile contract
  const handleCompile = async () => {
    setIsCompiling(true);
    setCompilationResult(null);

    try {
      const files: SolidityFile[] = [{ name: fileName, content: code }];
      const result = await compiler.compile(files);
      setCompilationResult(result);
    } catch (error) {
      setCompilationResult({
        success: false,
        errors: [{ message: error instanceof Error ? error.message : 'Compilation failed' }]
      });
    } finally {
      setIsCompiling(false);
    }
  };

  // Deploy contract
  const handleDeploy = async () => {
    if (!compilationResult?.success) {
      alert('Please compile the contract first!');
      return;
    }

    setIsDeploying(true);
    setDeploymentResult(null);

    try {
      // Parse constructor arguments
      let args: unknown[] = [];
      if (constructorArgs.trim()) {
        try {
          args = JSON.parse(`[${constructorArgs}]`);
        } catch {
          // Ignore error
          throw new Error('Invalid constructor arguments. Please use JSON format: "value1", "value2"');
        }
      }

      const files: SolidityFile[] = [{ name: fileName, content: code }];
      const contractName = extractContractName(code);
      
      const result = await compiler.compileAndDeploy(files, contractName, args, provider);
      setDeploymentResult(result);
      
      if (result.contract && onContractDeployed) {
        onContractDeployed(result);
      }
    } catch (error) {
      setDeploymentResult({
        error: error instanceof Error ? error.message : 'Deployment failed'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && 'ethereum' in window) {
      try {
        const { ethers } = await import('ethers');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        setProvider(provider);
      } catch (error) {
        alert('Failed to connect to MetaMask: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    } else {
      alert('MetaMask is not installed. Please install MetaMask to deploy contracts.');
    }
  };

  // Extract contract name from code
  const extractContractName = (code: string): string => {
    const match = code.match(/contract\s+(\w+)/);
    return match ? match[1] : 'Contract';
  };

  const templates = compiler.getContractTemplates();

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.09-.21 2-.44 3-.82V4.5L12 2z"/>
                <path d="M12 2l10 5v10c0 5.55-3.84 10-9 11-1.09-.21-2-.44-3-.82V4.5L12 2z" opacity="0.6"/>
                <circle cx="9" cy="9" r="1" fill="white"/>
                <circle cx="15" cy="9" r="1" fill="white"/>
                <circle cx="9" cy="15" r="1" fill="white"/>
                <circle cx="15" cy="15" r="1" fill="white"/>
              </svg>
              Solidity IDE
            </h2>
            
            {/* Template Selector */}
            <select 
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              {Object.keys(templates).map(template => (
                <option key={template} value={template}>
                  {template}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            {!provider && (
              <button
                onClick={connectWallet}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Connect Wallet
              </button>
            )}
            
            {provider && (
              <span className="text-green-400 text-sm">🟢 Wallet Connected</span>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="h-96">
        <Editor
          value={code}
          onChange={(value) => setCode(value || '')}
          language="solidity"
          beforeMount={handleEditorWillMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            automaticLayout: true,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            folding: true,
            bracketPairColorization: { enabled: true }
          }}
        />
      </div>

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCompile}
              disabled={isCompiling}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              {isCompiling ? (
                <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="32" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              )}
              Compile
            </button>

            {compilationResult?.success && (
              <>
                <input
                  type="text"
                  placeholder="Constructor args (JSON): 42, &quot;hello&quot;"
                  value={constructorArgs}
                  onChange={(e) => setConstructorArgs(e.target.value)}
                  className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm w-64"
                />
                
                <button
                  onClick={handleDeploy}
                  disabled={isDeploying || !provider}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                  title={!provider ? "Connect wallet first" : ""}
                >
                  {isDeploying ? (
                    <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="32" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                    </svg>
                  )}
                  Deploy
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {(compilationResult || deploymentResult) && (
        <div className="bg-gray-800 border-t border-gray-700 p-4 max-h-48 overflow-y-auto">
          {/* Compilation Results */}
          {compilationResult && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center">
                {compilationResult.success ? (
                  <span className="text-green-400">✓ Compilation Successful</span>
                ) : (
                  <span className="text-red-400">✗ Compilation Failed</span>
                )}
              </h3>
              
              {compilationResult.errors && compilationResult.errors.length > 0 && (
                <div className="bg-red-900/20 border border-red-500/30 rounded p-2 mb-2">
                  <h4 className="text-red-400 text-xs font-bold mb-1">Errors:</h4>
                  {compilationResult.errors.map((error, index) => (
                    <pre key={index} className="text-red-300 text-xs whitespace-pre-wrap">
                      {error.message}
                    </pre>
                  ))}
                </div>
              )}

              {compilationResult.warnings && compilationResult.warnings.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-2 mb-2">
                  <h4 className="text-yellow-400 text-xs font-bold mb-1">Warnings:</h4>
                  {compilationResult.warnings.map((warning, index) => (
                    <pre key={index} className="text-yellow-300 text-xs whitespace-pre-wrap">
                      {warning.message}
                    </pre>
                  ))}
                </div>
              )}

              {compilationResult.success && (
                <div className="bg-green-900/20 border border-green-500/30 rounded p-2">
                  <div className="text-green-400 text-xs">
                    <strong>Bytecode:</strong> {compilationResult.bytecode ? 'Generated' : 'None'}
                  </div>
                  <div className="text-green-400 text-xs">
                    <strong>ABI:</strong> {compilationResult.abi?.length || 0} functions
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Deployment Results */}
          {deploymentResult && (
            <div>
              <h3 className="text-sm font-bold text-white mb-2 flex items-center">
                {deploymentResult.error ? (
                  <span className="text-red-400">✗ Deployment Failed</span>
                ) : (
                  <span className="text-green-400">✓ Deployment Successful</span>
                )}
              </h3>
              
              {deploymentResult.error ? (
                <div className="bg-red-900/20 border border-red-500/30 rounded p-2">
                  <pre className="text-red-300 text-xs whitespace-pre-wrap">
                    {deploymentResult.error}
                  </pre>
                </div>
              ) : (
                <div className="bg-green-900/20 border border-green-500/30 rounded p-2">
                  <div className="text-green-400 text-xs">
                    <strong>Contract Address:</strong> {deploymentResult.address}
                  </div>
                  <div className="text-green-400 text-xs">
                    <strong>Transaction Hash:</strong> {deploymentResult.transactionHash}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
