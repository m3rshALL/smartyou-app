'use client';

import React, { useEffect, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { 
  SolidityCompilerService, 
  type CompilationResult, 
  type SolidityFile, 
  type DeploymentResult 
} from '../model/solidityCompilerMock';
import { useWeb3Context, useContractInteraction } from '../model/Web3Provider';

interface SolidityIDEProps {
  initialCode?: string;
  onContractDeployed?: (result: DeploymentResult) => void;
}

export default function SolidityIDE({ 
  initialCode = '', 
  onContractDeployed 
}: SolidityIDEProps) {
  const [code, setCode] = useState(initialCode);
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [fileName, setFileName] = useState('Contract.sol');
  const [isCompiling, setIsCompiling] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  // Web3 hooks
  const { 
    isConnected, 
    account, 
    network, 
    error: web3Error, 
    connect, 
    clearError 
  } = useWeb3Context();
  
  const { deployContract } = useContractInteraction();

  // Initialize compiler
  const compiler = new SolidityCompilerService();

  // Set initial code based on template
  useEffect(() => {
    if (selectedTemplate && selectedTemplate !== '') {
      const templateCode = compiler.getTemplate(selectedTemplate);
      setCode(templateCode);
    }
  }, [selectedTemplate, compiler]);

  // Monaco editor configuration
  const handleEditorWillMount = (monaco: any) => {
    // Register Solidity language if not already registered
    if (!monaco.languages.getLanguages().some((lang: any) => lang.id === 'solidity')) {
      monaco.languages.register({ id: 'solidity' });
      
      // Set basic syntax highlighting
      monaco.languages.setMonarchTokensProvider('solidity', {
        tokenizer: {
          root: [
            [/pragma/, 'keyword'],
            [/contract/, 'keyword'],
            [/function/, 'keyword'],
            [/mapping/, 'keyword'],
            [/uint256|address|bool|string/, 'type'],
            [/public|private|internal|external/, 'keyword'],
            [/payable|view|pure/, 'keyword'],
            [/\d+/, 'number'],
            [/".*?"/, 'string'],
            [/\/\/.*/, 'comment'],
            [/\/\*[\s\S]*?\*\//, 'comment']
          ]
        }
      });

      // Add completion items
      monaco.languages.registerCompletionItemProvider('solidity', {
        provideCompletionItems: () => ({
          suggestions: [
            {
              label: 'contract',
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: 'contract ${1:ContractName} {\n\t$0\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
            },
            {
              label: 'function',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'function ${1:functionName}() public {\n\t$0\n}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
            }
          ]
        })
      });
    }
  };

  // Compile contract
  const handleCompile = async () => {
    if (!code.trim()) return;
    
    setIsCompiling(true);
    try {
      const files: SolidityFile[] = [{ name: fileName, content: code }];
      const result = await compiler.compile(files);
      setCompilationResult(result);
      setDeploymentResult(null);
    } catch (error) {
      console.error('Compilation error:', error);
      setCompilationResult({
        success: false,
        contracts: {},
        errors: [`Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      });
    } finally {
      setIsCompiling(false);
    }
  };

  // Deploy contract
  const handleDeploy = async () => {
    if (!compilationResult?.success || !isConnected) return;

    const contractNames = Object.keys(compilationResult.contracts);
    if (contractNames.length === 0) return;

    setIsDeploying(true);
    try {
      const contractName = contractNames[0];
      const contract = compilationResult.contracts[contractName];
      
      const result = await deployContract(
        contract.bytecode,
        contract.abi,
        [] // Constructor args - could be made configurable
      );

      const deploymentResult: DeploymentResult = {
        success: true,
        contractAddress: result.address,
        transactionHash: result.transactionHash,
        gasUsed: '0', // Would need to get from transaction receipt
        contractName,
        abi: contract.abi
      };

      setDeploymentResult(deploymentResult);
      onContractDeployed?.(deploymentResult);
    } catch (error) {
      console.error('Deployment error:', error);
      setDeploymentResult({
        success: false,
        error: error instanceof Error ? error.message : 'Deployment failed',
        contractName: contractNames[0],
        abi: []
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const templates = [
    { value: '', label: 'Select Template' },
    { value: 'simple-storage', label: 'Simple Storage' },
    { value: 'erc20-token', label: 'ERC20 Token' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6 border-b border-gray-700 pb-4">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">Solidity IDE</h1>
          <p className="text-gray-400">
            Write, compile, and deploy smart contracts directly in your browser
          </p>
        </div>

        {/* Web3 Connection Status */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <div className="font-semibold">
                  {isConnected ? `Connected: ${account?.slice(0, 6)}...${account?.slice(-4)}` : 'Not Connected'}
                </div>
                {isConnected && network && (
                  <div className="text-sm text-gray-400">Network: {network.name}</div>
                )}
              </div>
            </div>
            {!isConnected && (
              <button
                onClick={connect}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
          {web3Error && (
            <div className="mt-2 p-2 bg-red-900 text-red-200 rounded-lg text-sm flex justify-between items-center">
              {web3Error}
              <button 
                onClick={clearError}
                className="text-red-300 hover:text-white"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Panel */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-4">
              {/* Controls */}
              <div className="mb-4 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-400">Template:</label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="bg-gray-700 text-white px-3 py-1 rounded"
                  >
                    {templates.map(template => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-400">File:</label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="bg-gray-700 text-white px-3 py-1 rounded"
                  />
                </div>
              </div>

              {/* Editor */}
              <div className="border border-gray-700 rounded-lg overflow-hidden">
                <Editor
                  height="500px"
                  defaultLanguage="solidity"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  beforeMount={handleEditorWillMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleCompile}
                  disabled={isCompiling || !code.trim()}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    isCompiling || !code.trim()
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isCompiling ? 'Compiling...' : 'Compile'}
                </button>
                
                <button
                  onClick={handleDeploy}
                  disabled={!compilationResult?.success || !isConnected || isDeploying}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    !compilationResult?.success || !isConnected || isDeploying
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isDeploying ? 'Deploying...' : 'Deploy'}
                </button>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Results</h3>
              
              {/* Compilation Results */}
              {compilationResult && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    Compilation
                    <span className={`w-2 h-2 rounded-full ${
                      compilationResult.success ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                  </h4>
                  
                  {compilationResult.success ? (
                    <div className="text-green-400 text-sm">
                      ✓ Compilation successful
                      <div className="mt-2 text-gray-300">
                        Contracts: {Object.keys(compilationResult.contracts).join(', ')}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {compilationResult.errors?.length > 0 && (
                        <div>
                          <div className="text-red-400 text-sm font-semibold">Errors:</div>
                          {compilationResult.errors.map((error: any, index: number) => (
                            <div key={index} className="text-red-300 text-xs bg-red-900 p-2 rounded mt-1">
                              {error}
                            </div>
                          ))}
                        </div>
                      )}
                      {compilationResult.warnings?.length > 0 && (
                        <div>
                          <div className="text-yellow-400 text-sm font-semibold">Warnings:</div>
                          {compilationResult.warnings.map((warning: any, index: number) => (
                            <div key={index} className="text-yellow-300 text-xs bg-yellow-900 p-2 rounded mt-1">
                              {warning}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Deployment Results */}
              {deploymentResult && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    Deployment
                    <span className={`w-2 h-2 rounded-full ${
                      deploymentResult.success ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                  </h4>
                  
                  {deploymentResult.success ? (
                    <div className="space-y-2 text-sm">
                      <div className="text-green-400">✓ Deployment successful</div>
                      <div className="text-gray-300">
                        <div><strong>Contract:</strong> {deploymentResult.contractAddress}</div>
                        <div><strong>Transaction:</strong> {deploymentResult.transactionHash}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-300 text-sm bg-red-900 p-2 rounded">
                      {deploymentResult.error || 'Deployment failed'}
                    </div>
                  )}
                </div>
              )}

              {/* Instructions */}
              {!compilationResult && (
                <div className="text-gray-400 text-sm">
                  <div className="mb-2">Instructions:</div>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Select a template or write your contract</li>
                    <li>Click "Compile" to check for errors</li>
                    <li>Connect your wallet</li>
                    <li>Click "Deploy" to deploy to blockchain</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
