'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBlockchainService, type Network } from './blockchainService';

// Type definitions for Ethereum provider
export interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener: (event: string, listener: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
  isConnected?: () => boolean;
}

// Contract ABI types
export type ContractABI = Array<{
  type: string;
  name?: string;
  inputs?: Array<{ name: string; type: string }>;
  outputs?: Array<{ name: string; type: string }>;
  stateMutability?: string;
}>;

export interface Web3State {
  isConnected: boolean;
  isConnecting: boolean;
  account: string | null;
  chainId: number | null;
  network: Network | null;
  balance: string | null;
  provider: EthereumProvider | null;
  error: string | null;
  isMetaMaskInstalled: boolean;
}

export interface Web3Actions {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  requestTestTokens: (chainId: number) => Promise<void>;
  refreshBalance: () => Promise<void>;
  clearError: () => void;
}

const initialState: Web3State = {
  isConnected: false,
  isConnecting: false,
  account: null,
  chainId: null,
  network: null,
  balance: null,
  provider: null,
  error: null,
  isMetaMaskInstalled: false,
};

export function useWeb3(): Web3State & Web3Actions {
  const [state, setState] = useState<Web3State>(initialState);
  const blockchainService = getBlockchainService();

  // Initialize MetaMask detection
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isMetaMaskInstalled: blockchainService.isMetaMaskInstalled()
    }));
  }, [blockchainService]);

  // Get balance for current account
  const getBalance = useCallback(async (account: string, provider: EthereumProvider | null): Promise<string> => {
    try {
      if (!provider || !account) return '0';
      
      const { ethers } = await import('ethers');
      const ethersProvider = new ethers.BrowserProvider({
        request: provider.request.bind(provider)
      });
      const balance = await ethersProvider.getBalance(account);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }, []);

  // Connect to wallet
  const connect = useCallback(async () => {
    if (!blockchainService.isMetaMaskInstalled()) {
      setState(prev => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask to continue.'
      }));
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const { accounts, chainId, provider } = await blockchainService.connectWallet();
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      const network = blockchainService.getNetworkInfo(chainId);
      const balance = await getBalance(account, provider);

      setState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        account,
        chainId,
        network,
        balance,
        provider,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet'
      }));
    }
  }, [blockchainService, getBalance]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setState({
      ...initialState,
      isMetaMaskInstalled: blockchainService.isMetaMaskInstalled()
    });
  }, [blockchainService]);

  // Switch network
  const switchNetwork = useCallback(async (targetChainId: number) => {
    setState(prev => ({ ...prev, error: null }));

    try {
      await blockchainService.switchNetwork(targetChainId);
      
      const network = blockchainService.getNetworkInfo(targetChainId);
      const balance = state.account && state.provider 
        ? await getBalance(state.account, state.provider) 
        : null;

      setState(prev => ({
        ...prev,
        chainId: targetChainId,
        network,
        balance
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to switch network'
      }));
    }
  }, [blockchainService, state.account, state.provider, getBalance]);

  // Request test tokens
  const requestTestTokens = useCallback(async (chainId: number) => {
    setState(prev => ({ ...prev, error: null }));

    try {
      await blockchainService.requestTestTokens(chainId);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to request test tokens'
      }));
    }
  }, [blockchainService]);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!state.account || !state.provider) return;

    try {
      const balance = await getBalance(state.account, state.provider);
      setState(prev => ({ ...prev, balance }));
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  }, [state.account, state.provider, getBalance]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    switchNetwork,
    requestTestTokens,
    refreshBalance,
    clearError
  };
}

// Helper hook for contract interactions
export function useContractInteraction() {
  const { provider, account } = useWeb3();

  const deployContract = useCallback(async (
    bytecode: string,
    abi: ContractABI,
    constructorArgs: unknown[] = []
  ) => {
    if (!provider || !account) {
      throw new Error('Wallet not connected');
    }

    const { ethers } = await import('ethers');
    const ethersProvider = new ethers.BrowserProvider({
      request: provider.request.bind(provider)
    });
    const signer = await ethersProvider.getSigner();
    
    const factory = new ethers.ContractFactory(abi, bytecode, signer);
    const contract = await factory.deploy(...constructorArgs);
    
    return {
      contract: await contract.waitForDeployment(),
      address: await contract.getAddress(),
      transactionHash: contract.deploymentTransaction()?.hash || ''
    };
  }, [provider, account]);

  const callContract = useCallback(async (
    contractAddress: string,
    abi: ContractABI,
    functionName: string,
    args: unknown[] = []
  ) => {
    if (!provider || !account) {
      throw new Error('Wallet not connected');
    }

    const { ethers } = await import('ethers');
    const ethersProvider = new ethers.BrowserProvider({
      request: provider.request.bind(provider)
    });
    const signer = await ethersProvider.getSigner();
    
    const contract = new ethers.Contract(contractAddress, abi, signer);
    return await contract[functionName](...args);
  }, [provider, account]);

  const readContract = useCallback(async (
    contractAddress: string,
    abi: ContractABI,
    functionName: string,
    args: unknown[] = []
  ) => {
    if (!provider) {
      throw new Error('Provider not available');
    }

    const { ethers } = await import('ethers');
    const ethersProvider = new ethers.BrowserProvider({
      request: provider.request.bind(provider)
    });
    
    const contract = new ethers.Contract(contractAddress, abi, ethersProvider);
    return await contract[functionName](...args);
  }, [provider]);

  return {
    deployContract,
    callContract,
    readContract,
    provider,
    account
  };
}
