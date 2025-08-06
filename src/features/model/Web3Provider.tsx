'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useWeb3, type Web3State, type Web3Actions } from './useWeb3';

const Web3Context = createContext<(Web3State & Web3Actions) | null>(null);

export function Web3Provider({ children }: { children: ReactNode }) {
  const web3 = useWeb3();
  
  return (
    <Web3Context.Provider value={web3}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3Context() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3Context must be used within a Web3Provider');
  }
  return context;
}

// Re-export everything from useWeb3 for convenience
export * from './useWeb3';
export type { Web3State, Web3Actions };
