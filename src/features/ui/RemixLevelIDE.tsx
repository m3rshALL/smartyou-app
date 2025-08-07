'use client';

import { useState, useEffect, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, Code, Zap, Database, FileText, AlertCircle, CheckCircle, TrendingUp, MessageCircle, Lightbulb } from 'lucide-react';
import { useWeb3Context } from '../model/useWeb3Context';
import { useContractInteraction } from '../model/useContractInteraction';
import toast from 'react-hot-toast';
import Widget from '@/shared/ui/Widget';
import LevelView from '@/shared/ui/LevelView';
import { useLevelTransition } from '../model/levelTransition';

// Contract templates for different levels
const CONTRACT_TEMPLATES = {
  level1: `// Уровень 1: Безопасность смарт-контрактов
pragma solidity ^0.8.0;

contract SecureWallet {
    mapping(address => uint256) private balances;
    address private owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
    
    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
}`,
  
  level2: `// Уровень 2: Система голосования
pragma solidity ^0.8.0;

contract VotingSystem {
    struct Candidate {
        string name;
        uint256 voteCount;
    }
    
    mapping(address => bool) public hasVoted;
    Candidate[] public candidates;
    address public owner;
    
    event VoteCast(address voter, uint256 candidateId);
    
    constructor() {
        owner = msg.sender;
        candidates.push(Candidate("Alice", 0));
        candidates.push(Candidate("Bob", 0));
        candidates.push(Candidate("Charlie", 0));
    }
    
    function vote(uint256 candidateId) public {
        require(!hasVoted[msg.sender], "Already voted");
        require(candidateId < candidates.length, "Invalid candidate");
        
        hasVoted[msg.sender] = true;
        candidates[candidateId].voteCount++;
        
        emit VoteCast(msg.sender, candidateId);
    }
    
    function getCandidate(uint256 candidateId) public view returns (string memory, uint256) {
        require(candidateId < candidates.length, "Invalid candidate");
        return (candidates[candidateId].name, candidates[candidateId].voteCount);
    }
    
    function getCandidateCount() public view returns (uint256) {
        return candidates.length;
    }
}`,

  level3: `// Уровень 3: Рынок магических артефактов
pragma solidity ^0.8.0;

contract MagicMarket {
    struct Item {
        string name;
        uint256 price;
        address owner;
        bool available;
    }
    
    mapping(uint256 => Item) public items;
    uint256 public itemCount;
    
    event ItemPurchased(uint256 itemId, address buyer, uint256 price);
    event ItemListed(uint256 itemId, string name, uint256 price);
    
    constructor() {
        createItem("Магический меч", 100 ether);
        createItem("Зелье исцеления", 50 ether);
        createItem("Кольцо невидимости", 200 ether);
    }
    
    function createItem(string memory name, uint256 price) public {
        itemCount++;
        items[itemCount] = Item(name, price, address(this), true);
        emit ItemListed(itemCount, name, price);
    }
    
    function purchase(uint256 itemId) public payable {
        require(itemId <= itemCount && itemId > 0, "Item does not exist");
        require(items[itemId].available, "Item not available");
        require(msg.value >= items[itemId].price, "Insufficient payment");
        
        items[itemId].owner = msg.sender;
        items[itemId].available = false;
        
        emit ItemPurchased(itemId, msg.sender, items[itemId].price);
    }
    
    function getItem(uint256 itemId) public view returns (string memory name, uint256 price, address owner, bool available) {
        require(itemId <= itemCount && itemId > 0, "Item does not exist");
        Item memory item = items[itemId];
        return (item.name, item.price, item.owner, item.available);
    }
}`,

  level4: `// Уровень 4: DAO (Децентрализованная автономная организация)
pragma solidity ^0.8.0;

contract CyberDAO {
    struct Proposal {
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    mapping(address => uint256) public shares;
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    uint256 public totalShares;
    address public owner;
    
    event SharesPurchased(address buyer, uint256 amount);
    event ProposalCreated(uint256 proposalId, string description);
    event Voted(uint256 proposalId, address voter, bool support);
    event ProposalExecuted(uint256 proposalId);
    
    constructor() {
        owner = msg.sender;
        shares[owner] = 100;
        totalShares = 100;
    }
    
    function buyShares() public payable {
        uint256 newShares = msg.value * 100; // 1 ETH = 100 shares
        shares[msg.sender] += newShares;
        totalShares += newShares;
        emit SharesPurchased(msg.sender, newShares);
    }
    
    function createProposal(string memory description) public {
        require(shares[msg.sender] >= 10, "Minimum 10 shares required");
        proposalCount++;
        Proposal storage newProposal = proposals[proposalCount];
        newProposal.description = description;
        newProposal.deadline = block.timestamp + 1 days;
        emit ProposalCreated(proposalCount, description);
    }
    
    function vote(uint256 proposalId, bool support) public {
        require(proposalId <= proposalCount && proposalId > 0, "Invalid proposal");
        require(shares[msg.sender] > 0, "No voting rights");
        require(!proposals[proposalId].hasVoted[msg.sender], "Already voted");
        require(block.timestamp <= proposals[proposalId].deadline, "Voting period ended");
        
        proposals[proposalId].hasVoted[msg.sender] = true;
        
        if (support) {
            proposals[proposalId].votesFor += shares[msg.sender];
        } else {
            proposals[proposalId].votesAgainst += shares[msg.sender];
        }
        
        emit Voted(proposalId, msg.sender, support);
    }
    
    function executeProposal(uint256 proposalId) public {
        require(proposalId <= proposalCount && proposalId > 0, "Invalid proposal");
        require(block.timestamp > proposals[proposalId].deadline, "Voting still active");
        require(!proposals[proposalId].executed, "Already executed");
        require(proposals[proposalId].votesFor > proposals[proposalId].votesAgainst, "Proposal rejected");
        
        proposals[proposalId].executed = true;
        emit ProposalExecuted(proposalId);
    }
}`,

  level5: `// Уровень 5: Защита от реентранси атак
pragma solidity ^0.8.0;

contract SecureBank {
    mapping(address => uint256) private balances;
    bool private locked;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }
    
    function deposit() public payable {
        require(msg.value > 0, "Must deposit something");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    function withdraw(uint256 amount) public nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // Checks-Effects-Interactions pattern
        balances[msg.sender] -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
    
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}`
};

interface RemixLevelIDEProps {
  levelNumber: number;
  title: string;
  description: string;
  initialCode?: string;
  hints?: string[];
  onSuccess?: () => void;
  successMessage?: string;
}

interface AbiItem {
  inputs?: { name: string; type: string }[];
  name?: string;
  outputs?: { name: string; type: string }[];
  stateMutability?: string;
  type: string;
}

interface CompileError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface CompileResult {
  success: boolean;
  bytecode?: string;
  abi?: AbiItem[];
  errors?: CompileError[];
  warnings?: CompileError[];
}

interface DeployedContract {
  address: string;
  abi: AbiItem[];
  deployed: boolean;
}

export default function RemixLevelIDE({ 
  levelNumber, 
  title, 
  description, 
  initialCode, 
  hints = [], 
  onSuccess,
  successMessage 
}: RemixLevelIDEProps) {
  const [code, setCode] = useState(initialCode || CONTRACT_TEMPLATES[`level${levelNumber}` as keyof typeof CONTRACT_TEMPLATES] || '');
  const [activeTab, setActiveTab] = useState<'editor' | 'deploy' | 'interact' | 'ai'>('editor');
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedContract, setDeployedContract] = useState<DeployedContract | null>(null);
  const [contractStats, setContractStats] = useState({
    compilations: 0,
    deployments: 0,
    interactions: 0,
    gasUsed: 0
  });
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const { goToNext, hasNextLevel } = useLevelTransition();
  
  const { account, isConnected, connectWallet } = useWeb3Context();
  useContractInteraction(); // Hook for future use
  
  const editorRef = useRef<unknown>(null);

  useEffect(() => {
    // Auto-connect MetaMask when component mounts
    if (!isConnected) {
      connectWallet();
    }
  }, [isConnected, connectWallet]);

  // Mock compilation for demo purposes
  const handleCompile = async () => {
    setIsCompiling(true);
    setContractStats(prev => ({ ...prev, compilations: prev.compilations + 1 }));
    
    try {
      // Simulate compilation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simple validation
      const hasContract = code.includes('contract ');
      const hasPragma = code.includes('pragma solidity');
      const hasFunction = code.includes('function ');
      
      if (!hasPragma) {
        setCompileResult({
          success: false,
          errors: [{ line: 1, column: 1, message: 'Missing pragma solidity directive', severity: 'error' }]
        });
        toast.error('Compilation failed: Missing pragma directive');
        return;
      }

      if (!hasContract) {
        setCompileResult({
          success: false,
          errors: [{ line: 1, column: 1, message: 'No contract definition found', severity: 'error' }]
        });
        toast.error('Compilation failed: No contract found');
        return;
      }

      // Mock successful compilation
      setCompileResult({
        success: true,
        bytecode: '0x608060405234801561001057600080fd5b50...',
        abi: [
          {
            inputs: [],
            name: 'deposit',
            outputs: [],
            stateMutability: 'payable',
            type: 'function'
          }
        ],
        warnings: hasFunction ? [] : [
          { line: 10, column: 5, message: 'Contract should have at least one function', severity: 'warning' }
        ]
      });

      toast.success('Compilation successful!');
      
      // Check level-specific success conditions
      checkLevelSuccess();
      
    } catch {
      toast.error('Compilation failed');
      setCompileResult({
        success: false,
        errors: [{ line: 1, column: 1, message: 'Compilation error', severity: 'error' }]
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const checkLevelSuccess = () => {
    let success = false;
    
    switch (levelNumber) {
      case 1:
        success = code.includes('onlyOwner') && code.includes('require');
        break;
      case 2:
        success = code.includes('hasVoted') && code.includes('emit VoteCast');
        break;
      case 3:
        success = code.includes('struct Item') && code.includes('emit ItemPurchased');
        break;
      case 4:
        success = code.includes('shares[msg.sender]') && code.includes('deadline');
        break;
      case 5:
        success = code.includes('nonReentrant') || (code.includes('balances[msg.sender] -= amount') && 
                 code.indexOf('balances[msg.sender] -= amount') < code.indexOf('call{value: amount}'));
        break;
    }
    
    if (success && !levelCompleted) {
      setLevelCompleted(true);
      onSuccess?.();
      toast.success(successMessage || 'Level completed!');
    }
  };

  const handleDeploy = async () => {
    if (!compileResult?.success) {
      toast.error('Please compile the contract first');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsDeploying(true);
    setContractStats(prev => ({ ...prev, deployments: prev.deployments + 1, gasUsed: prev.gasUsed + 21000 }));

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockContract: DeployedContract = {
        address: `0x${Math.random().toString(16).slice(2, 42)}`,
        abi: compileResult.abi || [],
        deployed: true
      };
      
      setDeployedContract(mockContract);
      toast.success(`Contract deployed at ${mockContract.address}`);
      
    } catch {
      toast.error('Deployment failed');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleAIQuestion = async () => {
    if (!aiQuestion.trim()) return;
    
    setAiResponse('Analyzing your question...');
    
    // Mock AI responses based on common questions
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const responses: Record<string, string> = {
      'modifier': 'Модификаторы в Solidity - это переиспользуемые блоки кода для проверки условий. Например: modifier onlyOwner() { require(msg.sender == owner); _; }',
      'require': 'require() используется для проверки условий. Если условие false, транзакция отменяется: require(condition, "Error message")',
      'mapping': 'mapping - это хеш-таблица в Solidity: mapping(address => uint256) public balances;',
      'event': 'События позволяют логировать данные в блокчейне: event Transfer(address from, address to, uint256 value);',
      'struct': 'Структуры позволяют группировать данные: struct Person { string name; uint256 age; }',
      'payable': 'payable функции могут принимать ETH: function deposit() public payable { ... }',
      'security': 'Основы безопасности: используйте require для проверок, паттерн Checks-Effects-Interactions, избегайте переполнений'
    };
    
    const keyword = Object.keys(responses).find(key => 
      aiQuestion.toLowerCase().includes(key)
    );
    
    setAiResponse(keyword 
      ? responses[keyword]
      : 'Для получения помощи, спросите о: modifier, require, mapping, event, struct, payable, security'
    );
  };

  const handleNextLevel = () => {
    if (hasNextLevel(levelNumber)) {
      goToNext(levelNumber);
    }
  };

  return (
    <LevelView>
      <Widget
        windowMode
        title={title}
        icon={<Code className="w-5 h-5" />}
      >
        <div className="h-full flex flex-col">
          {/* Remix-style header */}
          <div className="border-b border-gray-700 bg-gray-800">
            <div className="flex items-center justify-between p-2">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1 text-sm rounded ${activeTab === 'editor' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  <FileText className="w-4 h-4 inline mr-1" />
                  Editor
                </button>
                <button
                  onClick={() => setActiveTab('deploy')}
                  className={`px-3 py-1 text-sm rounded ${activeTab === 'deploy' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  <Zap className="w-4 h-4 inline mr-1" />
                  Deploy
                </button>
                <button
                  onClick={() => setActiveTab('interact')}
                  className={`px-3 py-1 text-sm rounded ${activeTab === 'interact' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  <Database className="w-4 h-4 inline mr-1" />
                  Interact
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`px-3 py-1 text-sm rounded ${activeTab === 'ai' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  AI Assistant
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`px-2 py-1 rounded text-xs ${isConnected ? 'bg-green-600' : 'bg-red-600'}`}>
                  {isConnected ? `Connected: ${account?.slice(0, 6)}...` : 'Disconnected'}
                </div>
                {levelCompleted && hasNextLevel(levelNumber) && (
                  <button
                    onClick={handleNextLevel}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 animate-pulse"
                  >
                    Next Level →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex">
            {/* Left panel - Editor or other tabs */}
            <div className="flex-1 flex flex-col">
              {activeTab === 'editor' && (
                <div className="flex-1 relative">
                  <Editor
                    language="solidity"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: 'on',
                      automaticLayout: true,
                      scrollBeyondLastLine: false
                    }}
                    onMount={(editor) => {
                      editorRef.current = editor;
                    }}
                  />
                  
                  {/* Compilation errors/warnings - плавающая панель */}
                  {compileResult && (
                    <div className="absolute bottom-0 left-0 right-0 max-h-24 border-t border-gray-700 bg-gray-900/95 backdrop-blur-sm p-2 overflow-y-auto">
                      <div className="text-sm">
                        {compileResult.success ? (
                          <div className="text-green-400 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Compilation successful
                          </div>
                        ) : (
                          <div className="text-red-400 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Compilation failed
                          </div>
                        )}
                        
                        {compileResult.errors?.map((error, idx) => (
                          <div key={idx} className="text-red-400 text-xs mt-1">
                            Line {error.line}: {error.message}
                          </div>
                        ))}
                        
                        {compileResult.warnings?.map((warning, idx) => (
                          <div key={idx} className="text-yellow-400 text-xs mt-1">
                            Line {warning.line}: {warning.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'deploy' && (
                <div className="flex-1 p-4 overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-4">Deploy Contract</h3>
                  
                  <div className="space-y-4">
                    <button
                      onClick={handleCompile}
                      disabled={isCompiling}
                      className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      {isCompiling ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Compiling...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Compile
                        </>
                      )}
                    </button>

                    {compileResult?.success && (
                      <button
                        onClick={handleDeploy}
                        disabled={isDeploying || !isConnected}
                        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                      >
                        {isDeploying ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Deploying...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Deploy
                          </>
                        )}
                      </button>
                    )}

                    {deployedContract && (
                      <div className="p-3 bg-green-900/30 border border-green-600 rounded">
                        <div className="text-green-300 font-semibold">Contract Deployed!</div>
                        <div className="text-sm text-green-200 break-all">
                          Address: {deployedContract.address}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'interact' && (
                <div className="flex-1 p-4 overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-4">Contract Interaction</h3>
                  
                  {deployedContract ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-900/30 border border-blue-600 rounded">
                        <div className="text-blue-300 font-semibold">Contract Functions</div>
                        <div className="mt-2 space-y-2">
                          {deployedContract.abi?.filter((item: AbiItem) => item.type === 'function').map((func: AbiItem, idx: number) => (
                            <button
                              key={idx}
                              className="block w-full text-left px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
                              onClick={() => {
                                setContractStats(prev => ({ ...prev, interactions: prev.interactions + 1 }));
                                toast.success(`Called ${func.name}()`);
                              }}
                            >
                              {func.name}()
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400">Deploy a contract first to interact with it.</div>
                  )}
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="flex-1 p-4 overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    AI Code Assistant
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <textarea
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        placeholder="Ask a question about Solidity code..."
                        className="w-full h-20 p-3 bg-gray-800 border border-gray-600 rounded resize-none"
                      />
                      <button
                        onClick={handleAIQuestion}
                        className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center"
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Ask AI
                      </button>
                    </div>
                    
                    {aiResponse && (
                      <div className="p-3 bg-purple-900/30 border border-purple-600 rounded">
                        <div className="text-purple-300 font-semibold">AI Response:</div>
                        <div className="text-purple-200 mt-2">{aiResponse}</div>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-400">
                      <div className="font-semibold">Quick help topics:</div>
                      <div className="mt-1 space-x-2">
                        {['modifier', 'require', 'mapping', 'event', 'struct', 'security'].map(topic => (
                          <button
                            key={topic}
                            onClick={() => {
                              setAiQuestion(`What is ${topic} in Solidity?`);
                              handleAIQuestion();
                            }}
                            className="text-blue-400 hover:underline"
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right panel - Stats and hints */}
            <div className="w-80 border-l border-gray-700 bg-gray-800">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Level Info</h3>
                <div className="text-sm text-gray-300 mb-4">{description}</div>
                
                {/* Statistics */}
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    <span className="font-semibold">Statistics</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>Compilations: {contractStats.compilations}</div>
                    <div>Deployments: {contractStats.deployments}</div>
                    <div>Interactions: {contractStats.interactions}</div>
                    <div>Gas Used: {contractStats.gasUsed.toLocaleString()}</div>
                  </div>
                </div>

                {/* Hints */}
                {hints.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center mb-2 text-yellow-400 hover:text-yellow-300"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      <span className="font-semibold">Hints ({hints.length})</span>
                    </button>
                    {showHints && (
                      <div className="space-y-2">
                        {hints.map((hint, idx) => (
                          <div key={idx} className="text-sm text-yellow-300 bg-yellow-900/20 p-2 rounded">
                            {hint}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Level completion status */}
                {levelCompleted && (
                  <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded">
                    <div className="flex items-center text-green-300">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <span className="font-semibold">Level Completed!</span>
                    </div>
                    <div className="text-sm text-green-200 mt-1">
                      {successMessage || 'Great job! You can proceed to the next level.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Bottom right button */}
          <div className="absolute bottom-4 right-4">
            <button
              onClick={handleCompile}
              disabled={isCompiling}
              className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isCompiling ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isCompiling ? 'Compiling...' : 'Compile & Run'}
            </button>
          </div>
        </div>
      </Widget>
    </LevelView>
  );
}
