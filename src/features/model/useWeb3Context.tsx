'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (data: unknown) => void) => void;
  removeAllListeners: (event: string) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

interface Web3ContextType {
  account: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  chainId: number | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function useWeb3Context() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3Context must be used within a Web3Provider');
  }
  return context;
}

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        }) as string[];
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          
          // Get chain ID
          const chainIdHex = await window.ethereum.request({
            method: 'eth_chainId',
          }) as string;
          setChainId(parseInt(chainIdHex, 16));
        }
      } else {
        console.log('MetaMask is not installed');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setChainId(null);
  };

  useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          }) as string[];
          
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            
            const chainIdHex = await window.ethereum.request({
              method: 'eth_chainId',
            }) as string;
            setChainId(parseInt(chainIdHex, 16));
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: unknown) => {
        const accountList = accounts as string[];
        if (accountList.length > 0) {
          setAccount(accountList[0]);
          setIsConnected(true);
        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', (chainIdHex: unknown) => {
        setChainId(parseInt(chainIdHex as string, 16));
      });
    }

    return () => {
      // Clean up listeners
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const value: Web3ContextType = {
    account,
    isConnected,
    connectWallet,
    disconnectWallet,
    chainId,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}
