import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';

interface MonacoEditorProps {
    onContractDeployed?: () => void;
    defaultValue?: string;
    height?: string;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({ 
    onContractDeployed, 
    defaultValue = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    // Начните программировать здесь
}`, 
    height = "500px" 
}) => {
    const [code, setCode] = useState(defaultValue);
    const [isCompiling, setIsCompiling] = useState(false);
    const [compilationResult, setCompilationResult] = useState<string>('');

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            setCode(value);
        }
    };

    const compileContract = async () => {
        setIsCompiling(true);
        setCompilationResult('');

        try {
            // Симуляция компиляции
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Простая проверка синтаксиса
            if (code.includes('pragma solidity') && code.includes('contract')) {
                setCompilationResult('✅ Контракт успешно скомпилирован!');
                if (onContractDeployed) {
                    setTimeout(() => {
                        onContractDeployed();
                    }, 500);
                }
            } else {
                setCompilationResult('❌ Ошибка: Отсутствует pragma или contract');
            }
        } catch (error) {
            setCompilationResult('❌ Ошибка компиляции: ' + String(error));
        } finally {
            setIsCompiling(false);
        }
    };

    return (
        <div className="space-y-4">
            <Editor
                height={height}
                defaultLanguage="sol"
                value={code}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                }}
            />
            
            <div className="flex gap-3">
                <button
                    onClick={compileContract}
                    disabled={isCompiling}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors"
                >
                    {isCompiling ? '⏳ Компиляция...' : '🔨 Скомпилировать'}
                </button>
                
                <button
                    onClick={compileContract}
                    disabled={isCompiling}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50 transition-colors"
                >
                    {isCompiling ? '⏳ Развертывание...' : '🚀 Развернуть'}
                </button>
            </div>

            {compilationResult && (
                <div className={`p-3 rounded-lg ${
                    compilationResult.includes('✅') 
                        ? 'bg-green-900/30 border border-green-500/50 text-green-300'
                        : 'bg-red-900/30 border border-red-500/50 text-red-300'
                }`}>
                    {compilationResult}
                </div>
            )}
        </div>
    );
};

export default MonacoEditor;
