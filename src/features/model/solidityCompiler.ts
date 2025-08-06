'use client';

import { Compiler } from '@remix-project/remix-solidity';

// Define our own types based on standard Solidity compiler interface
export interface SolcInput {
  language: 'Solidity';
  sources: Record<string, { content: string }>;
  settings: {
    outputSelection: Record<string, Record<string, string[]>>;
    optimizer?: {
      enabled: boolean;
      runs: number;
    };
    evmVersion?: string;
    libraries?: Record<string, Record<string, string>>;
  };
}

export interface SolcOutput {
  contracts?: Record<string, Record<string, ContractInfo>>;
  errors?: SolError[];
  sources?: Record<string, { id: number; ast: unknown }>;
}

export interface SolError {
  message: string;
  severity?: 'error' | 'warning' | 'info';
  type?: string;
  component?: string;
  formattedMessage?: string;
  sourceLocation?: {
    file: string;
    start: number;
    end: number;
  };
}

export interface CompilationResult {
  success: boolean;
  contracts?: Record<string, Record<string, ContractInfo>>;
  errors?: SolError[];
  warnings?: SolError[];
  bytecode?: string;
  abi?: ContractABI[];
  metadata?: ContractMetadata;
}

export interface ContractInfo {
  abi: ContractABI[];
  evm: {
    bytecode: {
      object: string;
      linkReferences?: Record<string, unknown>;
    };
    deployedBytecode: {
      object: string;
      linkReferences?: Record<string, unknown>;
    };
    methodIdentifiers?: Record<string, string>;
  };
  metadata: string;
}

export interface ContractABI {
  type: 'function' | 'constructor' | 'receive' | 'fallback' | 'event' | 'error';
  name?: string;
  inputs?: ABIInput[];
  outputs?: ABIOutput[];
  stateMutability?: 'pure' | 'view' | 'nonpayable' | 'payable';
  anonymous?: boolean;
}

export interface ABIInput {
  name: string;
  type: string;
  internalType?: string;
  indexed?: boolean;
}

export interface ABIOutput {
  name: string;
  type: string;
  internalType?: string;
}

export interface ContractMetadata {
  compiler: {
    version: string;
  };
  language: string;
  output: {
    abi: ContractABI[];
    devdoc?: Record<string, unknown>;
    userdoc?: Record<string, unknown>;
  };
  settings: {
    compilationTarget: Record<string, string>;
    evmVersion?: string;
    libraries?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    optimizer?: {
      enabled: boolean;
      runs: number;
    };
    remappings?: string[];
  };
  sources: Record<string, {
    keccak256: string;
    license?: string;
    urls: string[];
  }>;
  version: number;
}

export interface SolidityFile {
  name: string;
  content: string;
}

export interface EthersProvider {
  getSigner: () => Promise<EthersSigner>;
}

export interface EthersSigner {
  getAddress: () => Promise<string>;
  signMessage: (message: string) => Promise<string>;
}

export interface DeployedContract {
  address: string;
  waitForDeployment: () => Promise<DeployedContract>;
  deploymentTransaction: () => {
    hash: string;
  };
}

export interface DeploymentResult {
  contract?: DeployedContract;
  address?: string;
  transactionHash?: string;
  error?: string;
  compilationResult?: CompilationResult;
}

export class SolidityCompilerService {
  private compiler: Compiler;
  private isInitialized = false;

  constructor() {
    // Create compiler without direct solc import
    this.compiler = new Compiler();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Use the correct method signature for loading compiler version
      await this.compiler.loadVersion(
        'https://binaries.soliditylang.org/bin/soljson-v0.8.26+commit.8a97fa7a.js',
        () => {} // callback
      );
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Solidity compiler:', error);
      throw error;
    }
  }

  async compile(files: SolidityFile[], contractName?: string): Promise<CompilationResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Prepare input for Solidity compiler
      const sources: Record<string, { content: string }> = {};
      
      files.forEach(file => {
        sources[file.name] = { content: file.content };
      });

      const input: SolcInput = {
        language: 'Solidity',
        sources,
        settings: {
          outputSelection: {
            '*': {
              '*': [
                'abi',
                'evm.bytecode',
                'evm.deployedBytecode',
                'evm.methodIdentifiers',
                'metadata'
              ],
              '': ['ast']
            }
          },
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      };

      const result = await new Promise<SolcOutput>((resolve, reject) => {
        // Use the correct compile method signature
        this.compiler.compile(input, (error: Error | null, result: SolcOutput) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      // Process compilation result
      const errors = result.errors?.filter((e: SolError) => e.severity === 'error') || [];
      const warnings = result.errors?.filter((e: SolError) => e.severity === 'warning') || [];
      
      if (errors.length > 0) {
        return {
          success: false,
          errors,
          warnings
        };
      }

      // Extract contract information
      const contracts = result.contracts || {};
      const firstFile = Object.keys(contracts)[0];
      const firstContract = firstFile ? Object.keys(contracts[firstFile])[0] : '';
      
      let selectedContract;
      if (contractName && firstFile) {
        selectedContract = contracts[firstFile][contractName];
      } else if (firstFile && firstContract) {
        selectedContract = contracts[firstFile][firstContract];
      }

      return {
        success: true,
        contracts,
        warnings,
        bytecode: selectedContract?.evm?.bytecode?.object,
        abi: selectedContract?.abi,
        metadata: selectedContract?.metadata ? JSON.parse(selectedContract.metadata) : undefined
      };

    } catch (error) {
      console.error('Compilation error:', error);
      return {
        success: false,
        errors: [{ message: error instanceof Error ? error.message : 'Unknown compilation error' }],
        warnings: []
      };
    }
  }

  async compileAndDeploy(
    files: SolidityFile[], 
    contractName: string,
    constructorArgs: unknown[] = [],
    provider?: EthersProvider
  ): Promise<DeploymentResult> {
    try {
      // First compile the contract
      const compilationResult = await this.compile(files, contractName);
      
      if (!compilationResult.success) {
        return { 
          error: 'Compilation failed', 
          compilationResult 
        };
      }

      if (!compilationResult.bytecode || !compilationResult.abi) {
        return { 
          error: 'No bytecode or ABI generated', 
          compilationResult 
        };
      }

      // Deploy using ethers if provider is available
      if (provider && typeof window !== 'undefined') {
        try {
          const { ethers } = await import('ethers');
          
          const signer = await provider.getSigner();
          const factory = new ethers.ContractFactory(
            compilationResult.abi,
            compilationResult.bytecode,
            signer
          );

          const contract = await factory.deploy(...constructorArgs);
          const deployed = await contract.waitForDeployment();
          const deploymentTx = contract.deploymentTransaction();

          return {
            contract: deployed as unknown as DeployedContract,
            address: await deployed.getAddress(),
            transactionHash: deploymentTx?.hash || '',
            compilationResult
          };
        } catch (ethersError) {
          return {
            error: `Deployment failed: ${ethersError instanceof Error ? ethersError.message : 'Unknown error'}`,
            compilationResult
          };
        }
      }

      return {
        error: 'No provider available for deployment',
        compilationResult
      };

    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Deployment failed',
        compilationResult: await this.compile(files, contractName)
      };
    }
  }

  // Generate sample contract templates
  getContractTemplates(): Record<string, string> {
    return {
      'SimpleStorage.sol': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleStorage
 * @dev Store & retrieve value in a variable
 */
contract SimpleStorage {
    uint256 private storedData;
    
    event DataStored(uint256 data);
    
    constructor(uint256 _initialValue) {
        storedData = _initialValue;
    }
    
    /**
     * @dev Store value in variable
     * @param x value to store
     */
    function set(uint256 x) public {
        storedData = x;
        emit DataStored(x);
    }
    
    /**
     * @dev Return value 
     * @return value of 'storedData'
     */
    function get() public view returns (uint256) {
        return storedData;
    }
}`,

      'Token.sol': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyToken
 * @dev Simple ERC20 Token example with minting capability
 */
contract MyToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1 million tokens
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds maximum");
        _mint(msg.sender, initialSupply);
    }
    
    /**
     * @dev Mint tokens to specified address (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens from caller's account
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}`,

      'Voting.sol': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Voting
 * @dev Implements voting process with delegation
 */
contract Voting {
    struct Voter {
        uint weight;
        bool voted;
        address delegate;
        uint vote;
    }
    
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }
    
    address public chairperson;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    
    event VoteCast(address indexed voter, uint proposal);
    event ProposalAdded(uint indexed proposalId, bytes32 name);
    
    /**
     * @dev Create a new ballot to choose one of proposalNames
     * @param proposalNames names of proposals
     */
    constructor(bytes32[] memory proposalNames) {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
            emit ProposalAdded(i, proposalNames[i]);
        }
    }
    
    /**
     * @dev Give voter the right to vote on this ballot
     * @param voter address of voter
     */
    function giveRightToVote(address voter) external {
        require(msg.sender == chairperson, "Only chairperson can give right to vote");
        require(!voters[voter].voted, "The voter already voted");
        require(voters[voter].weight == 0);
        voters[voter].weight = 1;
    }
    
    /**
     * @dev Delegate your vote to the voter to
     * @param to address to delegate vote to
     */
    function delegate(address to) external {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "You already voted");
        require(to != msg.sender, "Self-delegation is disallowed");
        
        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;
            require(to != msg.sender, "Found loop in delegation");
        }
        
        sender.voted = true;
        sender.delegate = to;
        Voter storage delegate_ = voters[to];
        if (delegate_.voted) {
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            delegate_.weight += sender.weight;
        }
    }
    
    /**
     * @dev Give your vote to proposal
     * @param proposal index of proposal in the proposals array
     */
    function vote(uint proposal) external {
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "Has no right to vote");
        require(!sender.voted, "Already voted");
        sender.voted = true;
        sender.vote = proposal;
        
        proposals[proposal].voteCount += sender.weight;
        emit VoteCast(msg.sender, proposal);
    }
    
    /**
     * @dev Computes the winning proposal
     * @return winningProposal_ index of winning proposal
     */
    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }
    
    /**
     * @dev Get name of winning proposal
     * @return winnerName_ name of winning proposal
     */
    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
    
    /**
     * @dev Get total number of proposals
     * @return count number of proposals
     */
    function getProposalCount() external view returns (uint count) {
        return proposals.length;
    }
}`,

      'NFT.sol': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MyNFT
 * @dev Simple NFT contract with minting capability
 */
contract MyNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    uint256 public maxSupply;
    uint256 public mintPrice;
    
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 _maxSupply,
        uint256 _mintPrice
    ) ERC721(name, symbol) Ownable(msg.sender) {
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
    }
    
    /**
     * @dev Mint NFT to specified address
     * @param to Address to mint NFT to
     * @param tokenURI URI for token metadata
     */
    function safeMint(address to, string memory tokenURI) public payable {
        require(_tokenIdCounter.current() < maxSupply, "Max supply reached");
        require(msg.value >= mintPrice || msg.sender == owner(), "Insufficient payment");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        emit NFTMinted(to, tokenId, tokenURI);
    }
    
    /**
     * @dev Get total number of minted tokens
     * @return current total supply
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Set mint price (only owner)
     * @param _newPrice new mint price
     */
    function setMintPrice(uint256 _newPrice) external onlyOwner {
        mintPrice = _newPrice;
    }
    
    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}`
    };
  }
}

// Singleton instance
let compilerInstance: SolidityCompilerService | null = null;

export function getSolidityCompiler(): SolidityCompilerService {
  if (!compilerInstance) {
    compilerInstance = new SolidityCompilerService();
  }
  return compilerInstance;
}

  // Generate sample contract templates
  getContractTemplates(): Record<string, string> {
    return {
      'SimpleStorage.sol': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleStorage
 * @dev Store & retrieve value in a variable
 */
contract SimpleStorage {
    uint256 private storedData;
    
    event DataStored(uint256 data);
    
    constructor(uint256 _initialValue) {
        storedData = _initialValue;
    }
    
    /**
     * @dev Store value in variable
     * @param x value to store
     */
    function set(uint256 x) public {
        storedData = x;
        emit DataStored(x);
    }
    
    /**
     * @dev Return value 
     * @return value of 'storedData'
     */
    function get() public view returns (uint256) {
        return storedData;
    }
}`,

      'Token.sol': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyToken
 * @dev Simple ERC20 Token example with minting capability
 */
contract MyToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1 million tokens
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds maximum");
        _mint(msg.sender, initialSupply);
    }
    
    /**
     * @dev Mint tokens to specified address (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens from caller's account
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}`,

      'Voting.sol': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Voting
 * @dev Implements voting process with delegation
 */
contract Voting {
    struct Voter {
        uint weight;
        bool voted;
        address delegate;
        uint vote;
    }
    
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }
    
    address public chairperson;
    mapping(address => Voter) public voters;
    Proposal[] public proposals;
    
    event VoteCast(address indexed voter, uint proposal);
    event ProposalAdded(uint indexed proposalId, bytes32 name);
    
    /**
     * @dev Create a new ballot to choose one of proposalNames
     * @param proposalNames names of proposals
     */
    constructor(bytes32[] memory proposalNames) {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
        
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
            emit ProposalAdded(i, proposalNames[i]);
        }
    }
    
    /**
     * @dev Give voter the right to vote on this ballot
     * @param voter address of voter
     */
    function giveRightToVote(address voter) external {
        require(msg.sender == chairperson, "Only chairperson can give right to vote");
        require(!voters[voter].voted, "The voter already voted");
        require(voters[voter].weight == 0);
        voters[voter].weight = 1;
    }
    
    /**
     * @dev Delegate your vote to the voter to
     * @param to address to delegate vote to
     */
    function delegate(address to) external {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "You already voted");
        require(to != msg.sender, "Self-delegation is disallowed");
        
        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;
            require(to != msg.sender, "Found loop in delegation");
        }
        
        sender.voted = true;
        sender.delegate = to;
        Voter storage delegate_ = voters[to];
        if (delegate_.voted) {
            proposals[delegate_.vote].voteCount += sender.weight;
        } else {
            delegate_.weight += sender.weight;
        }
    }
    
    /**
     * @dev Give your vote to proposal
     * @param proposal index of proposal in the proposals array
     */
    function vote(uint proposal) external {
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "Has no right to vote");
        require(!sender.voted, "Already voted");
        sender.voted = true;
        sender.vote = proposal;
        
        proposals[proposal].voteCount += sender.weight;
        emit VoteCast(msg.sender, proposal);
    }
    
    /**
     * @dev Computes the winning proposal
     * @return winningProposal_ index of winning proposal
     */
    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }
    
    /**
     * @dev Get name of winning proposal
     * @return winnerName_ name of winning proposal
     */
    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
    
    /**
     * @dev Get total number of proposals
     * @return count number of proposals
     */
    function getProposalCount() external view returns (uint count) {
        return proposals.length;
    }
}`,

      'NFT.sol': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MyNFT
 * @dev Simple NFT contract with minting capability
 */
contract MyNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    uint256 public maxSupply;
    uint256 public mintPrice;
    
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 _maxSupply,
        uint256 _mintPrice
    ) ERC721(name, symbol) Ownable(msg.sender) {
        maxSupply = _maxSupply;
        mintPrice = _mintPrice;
    }
    
    /**
     * @dev Mint NFT to specified address
     * @param to Address to mint NFT to
     * @param tokenURI URI for token metadata
     */
    function safeMint(address to, string memory tokenURI) public payable {
        require(_tokenIdCounter.current() < maxSupply, "Max supply reached");
        require(msg.value >= mintPrice || msg.sender == owner(), "Insufficient payment");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        emit NFTMinted(to, tokenId, tokenURI);
    }
    
    /**
     * @dev Get total number of minted tokens
     * @return current total supply
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Set mint price (only owner)
     * @param _newPrice new mint price
     */
    function setMintPrice(uint256 _newPrice) external onlyOwner {
        mintPrice = _newPrice;
    }
    
    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}`
    };
  }
}

// Singleton instance
let compilerInstance: SolidityCompilerService | null = null;

export function getSolidityCompiler(): SolidityCompilerService {
  if (!compilerInstance) {
    compilerInstance = new SolidityCompilerService();
  }
  return compilerInstance;
}
