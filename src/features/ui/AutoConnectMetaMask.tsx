'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface AutoConnectMetaMaskProps {
  onConnected?: (account: string) => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function AutoConnectMetaMask({ onConnected, onError }: AutoConnectMetaMaskProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [shouldAutoConnect, setShouldAutoConnect] = useState(false);

  useEffect(() => {
    // Проверяем, было ли уже подключение в этой сессии
    const wasConnected = sessionStorage.getItem('metamask_auto_connected');
    const userDeniedConnection = localStorage.getItem('metamask_user_denied');
    
    if (!userDeniedConnection && !wasConnected) {
      setShouldAutoConnect(true);
    }
  }, []);

  useEffect(() => {
    if (shouldAutoConnect && typeof window !== 'undefined' && window.ethereum) {
      const timer = setTimeout(() => {
        attemptAutoConnect();
      }, 1000); // Задержка для лучшего UX

      return () => clearTimeout(timer);
    }
  }, [shouldAutoConnect]);

  const attemptAutoConnect = async () => {
    if (isConnecting || !window.ethereum) return;

    setIsConnecting(true);
    
    try {
      // Проверяем, есть ли уже подключенные аккаунты
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });

      if (accounts.length > 0) {
        // Уже подключено
        sessionStorage.setItem('metamask_auto_connected', 'true');
        onConnected?.(accounts[0]);
        return;
      }

      // Показываем ненавязчивое уведомление о возможности подключения
      const toastId = toast(
        (t) => (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                🦊
              </div>
              <div>
                <div className="font-medium text-gray-900">MetaMask</div>
                <div className="text-sm text-gray-600">Подключить кошелек?</div>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  connectMetaMask();
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Да
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  localStorage.setItem('metamask_user_denied', 'true');
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded text-sm transition-colors"
              >
                Нет
              </button>
            </div>
          </div>
        ),
        {
          duration: 8000,
          position: 'top-right',
        }
      );

    } catch (error) {
      console.error('Auto-connect error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectMetaMask = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        sessionStorage.setItem('metamask_auto_connected', 'true');
        localStorage.removeItem('metamask_user_denied'); // Убираем флаг отказа
        
        toast.success(
          <div className="flex items-center gap-2">
            <span>🎉</span>
            <div>
              <div className="font-medium">MetaMask подключен!</div>
              <div className="text-sm text-gray-600">{accounts[0].slice(0, 6)}...{accounts[0].slice(-4)}</div>
            </div>
          </div>
        );

        onConnected?.(accounts[0]);

        // Проверяем сеть
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const expectedChainId = '0x7a69'; // 31337 в hex (localhost)
        
        if (chainId !== expectedChainId) {
          // Предлагаем добавить/переключить на локальную сеть
          setTimeout(() => {
            toast(
              (t) => (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      ⚠️
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Неверная сеть</div>
                      <div className="text-sm text-gray-600">Переключить на Localhost?</div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        switchToLocalNetwork();
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Переключить
                    </button>
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded text-sm transition-colors"
                    >
                      Позже
                    </button>
                  </div>
                </div>
              ),
              { duration: 10000 }
            );
          }, 1500);
        }
      }
    } catch (error: any) {
      console.error('MetaMask connection error:', error);
      
      let errorMessage = 'Ошибка подключения MetaMask';
      
      if (error.code === 4001) {
        errorMessage = 'Подключение отклонено пользователем';
        localStorage.setItem('metamask_user_denied', 'true');
      } else if (error.code === -32002) {
        errorMessage = 'Запрос уже отправлен. Проверьте MetaMask.';
      }

      toast.error(errorMessage);
      onError?.(errorMessage);
    }
  };

  const switchToLocalNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }], // 31337 в hex
      });
      
      toast.success('Сеть переключена на Localhost!');
    } catch (error: any) {
      if (error.code === 4902) {
        // Сеть не добавлена, добавляем её
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x7a69',
                chainName: 'Localhost 8545',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['http://127.0.0.1:8545'],
                blockExplorerUrls: null,
              },
            ],
          });
          
          toast.success('Localhost сеть добавлена и активирована!');
        } catch (addError) {
          console.error('Error adding network:', addError);
          toast.error('Не удалось добавить локальную сеть');
        }
      } else {
        console.error('Error switching network:', error);
        toast.error('Не удалось переключить сеть');
      }
    }
  };

  // Этот компонент не рендерит ничего видимого
  return null;
}
