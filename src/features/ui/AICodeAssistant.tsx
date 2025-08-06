'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, Bot, User, X, Minimize2, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AICodeAssistantProps {
  currentCode?: string;
  onCodeSuggestion?: (code: string) => void;
  className?: string;
}

const SYSTEM_PROMPT = `Вы - AI-ассистент для разработки смарт-контрактов на Solidity. 

Ваши возможности:
- Объяснение концепций Solidity и блокчейна
- Анализ кода и поиск ошибок
- Предложение улучшений безопасности
- Генерация кода по описанию
- Помощь с интеграцией OpenZeppelin
- Объяснение паттернов смарт-контрактов

Отвечайте кратко и по существу. Всегда включайте примеры кода где это уместно.
Используйте русский язык для объяснений.`;

export default function AICodeAssistant({ 
  currentCode, 
  onCodeSuggestion, 
  className = '' 
}: AICodeAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Имитация AI-ответа (в реальном проекте здесь был бы вызов OpenAI API)
      const response = await generateAIResponse(userMessage.content, currentCode);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Assistant error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка при обработке вашего запроса. Попробуйте еще раз.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (userInput: string, code?: string): Promise<string> => {
    // Имитация интеллектуального ответа на основе ключевых слов
    const input = userInput.toLowerCase();
    
    // Анализ кода
    if (input.includes('анализ') || input.includes('проверь') || input.includes('ошибк')) {
      if (code) {
        return analyzeCode(code);
      }
      return "Пожалуйста, предоставьте код для анализа. Я могу проверить безопасность, оптимизацию и найти потенциальные ошибки.";
    }
    
    // Вопросы о безопасности
    if (input.includes('безопасност') || input.includes('уязвим') || input.includes('хак')) {
      return `## 🔐 Основные принципы безопасности Solidity

**Ключевые уязвимости:**
- **Reentrancy** - используйте \`ReentrancyGuard\`
- **Integer Overflow** - используйте SafeMath или Solidity ^0.8.0
- **Access Control** - правильно настройте модификаторы

**Пример защиты:**
\`\`\`solidity
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SecureContract is ReentrancyGuard {
    mapping(address => uint256) public balances;
    
    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds");
        
        balances[msg.sender] = 0; // State change first
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
\`\`\``;
    }
    
    // Вопросы о gas оптимизации
    if (input.includes('газ') || input.includes('оптимиз') || input.includes('стоимость')) {
      return `## ⛽ Оптимизация газа

**Основные техники:**
1. **Используйте \`uint256\`** вместо меньших типов
2. **Packed structs** для экономии storage
3. **Кеширование** переменных состояния
4. **Events вместо storage** для логов

**Пример оптимизации:**
\`\`\`solidity
// ❌ Неэффективно
contract Bad {
    uint8 a; uint8 b; uint8 c; // 3 storage slots
}

// ✅ Эффективно  
contract Good {
    uint8 a; uint8 b; uint8 c; // 1 storage slot
    // Добавляем padding до 256 бит
}
\`\`\``;
    }
    
    // Вопросы об OpenZeppelin
    if (input.includes('openzeppelin') || input.includes('открый') || input.includes('библиотек')) {
      return `## 📚 OpenZeppelin Contracts

**Популярные контракты:**
- **ERC20** - стандартные токены
- **ERC721** - NFT
- **Ownable** - управление доступом  
- **Pausable** - остановка функций
- **ReentrancyGuard** - защита от реентрантности

**Пример использования:**
\`\`\`solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor() ERC20("MyToken", "MTK") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**decimals());
    }
}
\`\`\``;
    }
    
    // Вопросы о DeFi
    if (input.includes('defi') || input.includes('стейкинг') || input.includes('ликвидност')) {
      return `## 💰 DeFi Паттерны

**Основные концепции:**
- **Staking** - блокировка токенов для наград
- **Yield Farming** - заработок на предоставлении ликвидности
- **Flash Loans** - мгновенные займы без залога
- **AMM** - автоматические маркет-мейкеры

**Простой стейкинг контракт:**
\`\`\`solidity
contract SimpleStaking {
    mapping(address => uint256) public stakes;
    mapping(address => uint256) public rewards;
    
    function stake(uint256 amount) external {
        // Transfer tokens
        // Update stakes
        // Calculate rewards
    }
}
\`\`\``;
    }
    
    // Общие вопросы
    return `## 🤖 AI Code Assistant

Я готов помочь вам с:
- **Анализом кода** - проверкой ошибок и уязвимостей
- **Оптимизацией газа** - советами по экономии 
- **Паттернами Solidity** - лучшими практиками
- **OpenZeppelin** - использованием библиотек
- **DeFi концепциями** - стейкинг, токены, AMM

**Попробуйте спросить:**
- "Проверь мой код на ошибки"
- "Как оптимизировать газ?"
- "Объясни безопасность контрактов"
- "Как создать токен ERC20?"

Чем могу помочь? 🚀`;
  };

  const analyzeCode = (code: string): string => {
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Базовый анализ кода
    if (!code.includes('pragma solidity')) {
      issues.push('Отсутствует pragma директива');
    }
    
    if (!code.includes('SPDX-License-Identifier')) {
      issues.push('Отсутствует лицензия SPDX');
    }
    
    if (code.includes('msg.sender') && !code.includes('require(')) {
      suggestions.push('Рассмотрите добавление проверок доступа с require()');
    }
    
    if (code.includes('transfer') && !code.includes('ReentrancyGuard')) {
      suggestions.push('Для переводов средств рекомендуется использовать ReentrancyGuard');
    }
    
    if (code.includes('uint ') && !code.includes('uint256')) {
      suggestions.push('Рекомендуется использовать uint256 вместо uint для экономии газа');
    }

    let result = '## 🔍 Анализ кода\n\n';
    
    if (issues.length > 0) {
      result += '**❌ Найденные проблемы:**\n';
      issues.forEach(issue => {
        result += `- ${issue}\n`;
      });
      result += '\n';
    }
    
    if (suggestions.length > 0) {
      result += '**💡 Рекомендации:**\n';
      suggestions.forEach(suggestion => {
        result += `- ${suggestion}\n`;
      });
      result += '\n';
    }
    
    if (issues.length === 0 && suggestions.length === 0) {
      result += '**✅ Код выглядит хорошо!** Основные проверки пройдены.\n\n';
      result += 'Для более детального анализа рекомендую:\n';
      result += '- Запустить тесты\n';
      result += '- Проверить с помощью Slither\n';
      result += '- Провести аудит безопасности\n';
    }
    
    return result;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50 ${className}`}
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <div className={`bg-gray-900 border border-gray-700 rounded-lg shadow-2xl transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg">
          <div className="flex items-center gap-3">
            <Bot size={20} className="text-white" />
            <h3 className="font-semibold text-white">AI Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white/80 hover:text-white transition-colors"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[480px]">
              {messages.length === 0 && (
                <div className="text-center text-gray-400">
                  <Bot size={48} className="mx-auto mb-4 text-gray-600" />
                  <p className="text-sm">
                    Привет! Я AI-ассистент для Solidity.<br />
                    Задавайте вопросы о коде, безопасности и оптимизации!
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-100 border border-gray-700'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <ReactMarkdown
                        components={{
                          code({ inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                className="rounded mt-2"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className="bg-gray-700 px-1 py-0.5 rounded text-xs" {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      message.content
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={16} className="text-gray-300" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-blue-400" />
                    <span className="text-sm text-gray-400">Думаю...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Спросите о коде, безопасности или оптимизации..."
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
