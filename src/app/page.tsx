'use client';

'use client';

import { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import View from "@/shared/ui/View";
import Container from "@/shared/ui/Container";
import Widget from "@/shared/ui/Widget";
import { Web3Provider } from "@/features/model/Web3Provider";
import AICodeAssistant from "@/features/ui/AICodeAssistant";
import AutoConnectMetaMask from "@/features/ui/AutoConnectMetaMask";
import { CONTRACT_TEMPLATES, TEMPLATE_CATEGORIES, getTemplatesByCategory } from "@/features/model/contractTemplates";
import { SolidityCompilerService } from "@/features/model/solidityCompilerMock";
import { toast, Toaster } from 'react-hot-toast';
import { 
  Play, 
  Code, 
  Rocket, 
  FileText,
  Wallet,
  Zap,
  Copy,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface CompilationResult {
  success: boolean;
  errors?: string[];
  warnings?: string[];
  bytecode?: string;
  abi?: any[];
}

interface DeploymentResult {
  contractAddress?: string;
  transactionHash?: string;
  error?: string;
}

function RemixIDEContent() {
  // States
  const [selectedTemplate, setSelectedTemplate] = useState('simple-storage');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [code, setCode] = useState(CONTRACT_TEMPLATES['simple-storage'].code);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [compilationResult, setCompilationResult] = useState<CompilationResult | null>(null);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [constructorArgs, setConstructorArgs] = useState('42');
  const [activeTab, setActiveTab] = useState<'editor' | 'deploy' | 'interact'>('editor');
  const [showSettings, setShowSettings] = useState(false);

  // Initialize compiler
  const compiler = new SolidityCompilerService();

  useEffect(() => {
    // Load template when selection changes
    const template = CONTRACT_TEMPLATES[selectedTemplate as keyof typeof CONTRACT_TEMPLATES];
    if (template) {
      setCode(template.code);
      setCompilationResult(null);
      setDeploymentResult(null);
    }
  }, [selectedTemplate]);

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Reset to first template in category
    const templates = getTemplatesByCategory(categoryId);
    if (templates.length > 0) {
      const firstTemplate = Object.entries(CONTRACT_TEMPLATES).find(
        ([_, template]) => template.name === templates[0].name
      );
      if (firstTemplate) {
        setSelectedTemplate(firstTemplate[0]);
      }
    }
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    try {
      const result = await compiler.compile([{ name: 'Contract.sol', content: code }]);
      
      const compilationResult: CompilationResult = {
        success: result.success,
        errors: result.errors,
        warnings: result.warnings,
        bytecode: result.bytecode,
        abi: result.abi
      };
      
      setCompilationResult(compilationResult);
      
      if (result.success) {
        toast.success('✅ Контракт скомпилирован успешно!');
      } else {
        toast.error('❌ Ошибки компиляции');
      }
    } catch (error) {
      console.error('Compilation error:', error);
      toast.error('Ошибка компиляции');
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDeploy = async () => {
    if (!compilationResult?.success) {
      toast.error('Сначала скомпилируйте контракт');
      return;
    }

    if (!isConnected) {
      toast.error('Подключите MetaMask кошелек');
      return;
    }

    setIsDeploying(true);
    try {
      // Mock deployment for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: DeploymentResult = {
        contractAddress: '0x' + Math.random().toString(16).substr(2, 40),
        transactionHash: '0x' + Math.random().toString(16).substr(2, 64)
      };
      
      setDeploymentResult(mockResult);
      toast.success('🚀 Контракт развернут успешно!');
      setActiveTab('interact');
    } catch (error) {
      console.error('Deployment error:', error);
      toast.error('Ошибка развертывания');
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} скопирован в буфер обмена`);
  };

  const filteredTemplates = getTemplatesByCategory(selectedCategory);

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />
      
      <AutoConnectMetaMask 
        onConnected={(account) => {
          setIsConnected(true);
          setAccount(account);
        }}
        onError={(error) => {
          console.error('MetaMask connection error:', error);
        }}
      />

      <View className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <Container className="py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 mb-4">
              🌐 SmartYou IDE
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Полнофункциональная IDE для разработки смарт-контрактов с AI-ассистентом
            </p>
            
            {/* Connection Status */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                isConnected ? 'bg-green-900/50 text-green-400 border border-green-500/50' : 'bg-red-900/50 text-red-400 border border-red-500/50'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <Wallet size={16} />
                <span className="text-sm">
                  {isConnected ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Кошелек не подключен'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-900/50 text-blue-400 border border-blue-500/50 rounded-full">
                <Zap size={16} />
                <span className="text-sm">Localhost:8545</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Templates & Categories */}
            <div className="lg:col-span-1 space-y-4">
              {/* Categories */}
              <Widget title="📂 Категории" className="bg-gray-800/50 backdrop-blur">
                <div className="space-y-2">
                  {TEMPLATE_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <span>{category.icon}</span>
                      <span className="text-sm">{category.name}</span>
                    </button>
                  ))}
                </div>
              </Widget>

              {/* Templates */}
              <Widget title="📋 Шаблоны" className="bg-gray-800/50 backdrop-blur">
                <div className="space-y-2">
                  {filteredTemplates.map((template) => {
                    const templateKey = Object.entries(CONTRACT_TEMPLATES).find(
                      ([_, t]) => t.name === template.name
                    )?.[0];
                    
                    return (
                      <button
                        key={templateKey}
                        onClick={() => templateKey && handleTemplateChange(templateKey)}
                        className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                          selectedTemplate === templateKey
                            ? 'bg-purple-600 text-white'
                            : 'hover:bg-gray-700 text-gray-300'
                        }`}
                      >
                        <span className="text-lg">{template.icon}</span>
                        <div>
                          <div className="text-sm font-medium">{template.name}</div>
                          <div className="text-xs opacity-80">{template.description}</div>
                          <div className="text-xs opacity-60 mt-1">
                            <span className="px-2 py-0.5 bg-gray-600 rounded-full">
                              {template.category}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Widget>

              {/* Quick Actions */}
              <Widget title="⚡ Быстрые действия" className="bg-gray-800/50 backdrop-blur">
                <div className="space-y-2">
                  <button
                    onClick={handleCompile}
                    disabled={isCompiling}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                  >
                    {isCompiling ? <Loader2 size={16} className="animate-spin" /> : <Code size={16} />}
                    {isCompiling ? 'Компиляция...' : 'Компилировать'}
                  </button>
                  
                  <button
                    onClick={handleDeploy}
                    disabled={!compilationResult?.success || !isConnected || isDeploying}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                  >
                    {isDeploying ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
                    {isDeploying ? 'Развертывание...' : 'Развернуть'}
                  </button>
                </div>
              </Widget>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-4">
              {/* Tabs */}
              <div className="flex items-center gap-1 bg-gray-800/50 backdrop-blur rounded-lg p-1">
                {[
                  { id: 'editor', label: 'Редактор', icon: FileText },
                  { id: 'deploy', label: 'Развертывание', icon: Rocket },
                  { id: 'interact', label: 'Взаимодействие', icon: Play },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Editor Tab */}
              {activeTab === 'editor' && (
                <Widget 
                  title={`💻 ${CONTRACT_TEMPLATES[selectedTemplate as keyof typeof CONTRACT_TEMPLATES]?.name || 'Code Editor'}`}
                  className="bg-gray-800/50 backdrop-blur"
                  windowMode
                >
                  <div style={{ height: '600px' }}>
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
                        automaticLayout: true,
                        tabSize: 2,
                        insertSpaces: true,
                        wordWrap: 'on',
                        folding: true,
                        lineNumbers: 'on',
                        renderWhitespace: 'boundary',
                      }}
                    />
                  </div>
                </Widget>
              )}

              {/* Deploy Tab */}
              {activeTab === 'deploy' && (
                <div className="space-y-4">
                  {/* Compilation Status */}
                  <Widget title="⚙️ Статус компиляции" className="bg-gray-800/50 backdrop-blur">
                    {!compilationResult ? (
                      <div className="text-center py-8 text-gray-400">
                        <Code size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Нажмите "Компилировать" для проверки кода</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className={`flex items-center gap-2 ${
                          compilationResult.success ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {compilationResult.success ? <CheckCircle size={20} /> : <XCircle size={20} />}
                          <span className="font-medium">
                            {compilationResult.success ? 'Компиляция успешна' : 'Ошибки компиляции'}
                          </span>
                        </div>

                        {compilationResult.errors && compilationResult.errors.length > 0 && (
                          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                            <h4 className="text-red-400 font-medium mb-2">❌ Ошибки:</h4>
                            {compilationResult.errors.map((error, index) => (
                              <div key={index} className="text-red-300 text-sm mb-1">{error}</div>
                            ))}
                          </div>
                        )}

                        {compilationResult.warnings && compilationResult.warnings.length > 0 && (
                          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3">
                            <h4 className="text-yellow-400 font-medium mb-2">⚠️ Предупреждения:</h4>
                            {compilationResult.warnings.map((warning, index) => (
                              <div key={index} className="text-yellow-300 text-sm mb-1">{warning}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </Widget>

                  {/* Constructor Arguments */}
                  {compilationResult?.success && (
                    <Widget title="🔧 Параметры конструктора" className="bg-gray-800/50 backdrop-blur">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Аргументы конструктора (разделенные запятой):
                          </label>
                          <input
                            type="text"
                            value={constructorArgs}
                            onChange={(e) => setConstructorArgs(e.target.value)}
                            placeholder="Например: 42, 'Hello World', true"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <p className="text-xs text-gray-400">
                          💡 Для строк используйте кавычки, для чисел - без кавычек
                        </p>
                      </div>
                    </Widget>
                  )}
                </div>
              )}

              {/* Interact Tab */}
              {activeTab === 'interact' && (
                <div className="space-y-4">
                  {!deploymentResult ? (
                    <Widget title="🚀 Развертывание" className="bg-gray-800/50 backdrop-blur">
                      <div className="text-center py-8 text-gray-400">
                        <Rocket size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Сначала разверните контракт для взаимодействия с ним</p>
                      </div>
                    </Widget>
                  ) : (
                    <>
                      {/* Deployed Contract Info */}
                      <Widget title="📋 Информация о контракте" className="bg-gray-800/50 backdrop-blur">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Адрес контракта:</span>
                            <div className="flex items-center gap-2">
                              <code className="bg-gray-700 px-2 py-1 rounded text-sm">
                                {deploymentResult.contractAddress}
                              </code>
                              <button
                                onClick={() => copyToClipboard(deploymentResult.contractAddress!, 'Адрес')}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <Copy size={16} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Транзакция:</span>
                            <div className="flex items-center gap-2">
                              <code className="bg-gray-700 px-2 py-1 rounded text-sm">
                                {deploymentResult.transactionHash?.slice(0, 10)}...
                              </code>
                              <button
                                onClick={() => copyToClipboard(deploymentResult.transactionHash!, 'Hash транзакции')}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <Copy size={16} />
                              </button>
                              <button className="text-blue-400 hover:text-blue-300 transition-colors">
                                <ExternalLink size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </Widget>

                      {/* Contract Interaction */}
                      <Widget title="🔧 Взаимодействие с контрактом" className="bg-gray-800/50 backdrop-blur">
                        <div className="text-center py-8 text-gray-400">
                          <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                          <p className="mb-2">Функции контракта будут отображены здесь</p>
                          <p className="text-sm">После интеграции с реальным компилятором</p>
                        </div>
                      </Widget>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Шаблонов', value: Object.keys(CONTRACT_TEMPLATES).length, icon: '📋' },
              { label: 'Категорий', value: TEMPLATE_CATEGORIES.length - 1, icon: '📂' },
              { label: 'Строк кода', value: code.split('\n').length, icon: '💻' },
              { label: 'Символов', value: code.length, icon: '📝' },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-lg p-4 text-center"
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </Container>

        {/* AI Assistant */}
        <AICodeAssistant 
          currentCode={code}
          onCodeSuggestion={(newCode) => {
            setCode(newCode);
            toast.success('Код обновлен AI-ассистентом!');
          }}
        />
      </View>
    </>
  );
}

export default function HomePage() {
  return (
    <Web3Provider>
      <RemixIDEContent />
    </Web3Provider>
  );
}
