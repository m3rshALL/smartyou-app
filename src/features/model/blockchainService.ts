'use client';

interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, handler: (accounts: string[]) => void) => void;
    removeListener: (event: string, handler: (accounts: string[]) => void) => void;
  };
}

export interface Network {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const SUPPORTED_NETWORKS: Record<number, Network> = {
  1337: {
    chainId: 1337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: 'http://localhost:8545',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },
  11155111: {
    chainId: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    }
  },
  80001: {
    chainId: 80001,
    name: 'Polygon Mumbai',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  }
};

export interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

export class BlockchainService {
  private provider: EthereumProvider | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = window.ethereum;
    }
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && Boolean(window.ethereum?.isMetaMask);
  }

  // Connect to MetaMask
  async connectWallet(): Promise<{ 
    accounts: string[]; 
    chainId: number; 
    provider: EthereumProvider;
  }> {
    if (!this.provider) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Request account access
      const accounts = await this.provider.request({
        method: 'eth_requestAccounts',
      }) as string[];

      // Get current chain ID
      const chainId = await this.provider.request({
        method: 'eth_chainId',
      }) as string;

      return {
        accounts,
        chainId: parseInt(chainId, 16),
        provider: this.provider
      };
    } catch (error) {
      throw new Error(`Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get current account
  async getCurrentAccount(): Promise<string | null> {
    if (!this.provider) return null;

    try {
      const accounts = await this.provider.request({
        method: 'eth_accounts',
      }) as string[];

      return accounts[0] || null;
    } catch (error) {
      console.error('Failed to get current account:', error);
      return null;
    }
  }

  // Get current chain ID
  async getCurrentChainId(): Promise<number | null> {
    if (!this.provider) return null;

    try {
      const chainId = await this.provider.request({
        method: 'eth_chainId',
      }) as string;

      return parseInt(chainId, 16);
    } catch (error) {
      console.error('Failed to get chain ID:', error);
      return null;
    }
  }

  // Switch to a different network
  async switchNetwork(chainId: number): Promise<void> {
    if (!this.provider) {
      throw new Error('MetaMask is not installed');
    }

    const network = SUPPORTED_NETWORKS[chainId];
    if (!network) {
      throw new Error(`Unsupported network: ${chainId}`);
    }

    try {
      // Try to switch to the network
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await this.provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${chainId.toString(16)}`,
                chainName: network.name,
                rpcUrls: [network.rpcUrl],
                blockExplorerUrls: [network.blockExplorer],
                nativeCurrency: network.nativeCurrency,
              },
            ],
          });
        } catch (addError) {
          throw new Error(`Failed to add network: ${addError instanceof Error ? addError.message : 'Unknown error'}`);
        }
      } else {
        throw new Error(`Failed to switch network: ${switchError.message}`);
      }
    }
  }

  // Add event listeners
  onAccountsChanged(handler: (accounts: string[]) => void): void {
    if (this.provider) {
      this.provider.on('accountsChanged', handler);
    }
  }

  onChainChanged(handler: (chainId: number) => void): void {
    if (this.provider) {
      this.provider.on('chainChanged', (chainId: string) => {
        handler(parseInt(chainId, 16));
      });
    }
  }

  // Remove event listeners
  removeAccountsChangedListener(handler: (accounts: string[]) => void): void {
    if (this.provider) {
      this.provider.removeListener('accountsChanged', handler);
    }
  }

  removeChainChangedListener(handler: (chainId: number) => void): void {
    if (this.provider) {
      this.provider.removeListener('chainChanged', (chainId: string) => {
        handler(parseInt(chainId, 16));
      });
    }
  }

  // Get network info
  getNetworkInfo(chainId: number): Network | null {
    return SUPPORTED_NETWORKS[chainId] || null;
  }

  // Format address for display
  formatAddress(address: string, length: number = 6): string {
    if (!address) return '';
    return `${address.slice(0, length)}...${address.slice(-4)}`;
  }

  // Check if address is valid
  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Get transaction link
  getTransactionLink(txHash: string, chainId: number): string {
    const network = this.getNetworkInfo(chainId);
    if (!network) return '';
    return `${network.blockExplorer}/tx/${txHash}`;
  }

  // Get address link
  getAddressLink(address: string, chainId: number): string {
    const network = this.getNetworkInfo(chainId);
    if (!network) return '';
    return `${network.blockExplorer}/address/${address}`;
  }

  // Request test tokens (for testnets)
  async requestTestTokens(chainId: number): Promise<void> {
    const faucetUrls: Record<number, string> = {
      11155111: 'https://sepoliafaucet.com/',
      80001: 'https://faucet.polygon.technology/',
    };

    const faucetUrl = faucetUrls[chainId];
    if (!faucetUrl) {
      throw new Error('No faucet available for this network');
    }

    // Open faucet in new window
    window.open(faucetUrl, '_blank');
  }
}

// Singleton instance
let blockchainService: BlockchainService | null = null;

export function getBlockchainService(): BlockchainService {
  if (!blockchainService) {
    blockchainService = new BlockchainService();
  }
  return blockchainService;
}

// Hook for React components
export function useBlockchain() {
  const service = getBlockchainService();
  
  return {
    isMetaMaskInstalled: service.isMetaMaskInstalled(),
    connectWallet: service.connectWallet.bind(service),
    getCurrentAccount: service.getCurrentAccount.bind(service),
    getCurrentChainId: service.getCurrentChainId.bind(service),
    switchNetwork: service.switchNetwork.bind(service),
    onAccountsChanged: service.onAccountsChanged.bind(service),
    onChainChanged: service.onChainChanged.bind(service),
    removeAccountsChangedListener: service.removeAccountsChangedListener.bind(service),
    removeChainChangedListener: service.removeChainChangedListener.bind(service),
    getNetworkInfo: service.getNetworkInfo.bind(service),
    formatAddress: service.formatAddress.bind(service),
    isValidAddress: service.isValidAddress.bind(service),
    getTransactionLink: service.getTransactionLink.bind(service),
    getAddressLink: service.getAddressLink.bind(service),
    requestTestTokens: service.requestTestTokens.bind(service),
    supportedNetworks: SUPPORTED_NETWORKS
  };
}
