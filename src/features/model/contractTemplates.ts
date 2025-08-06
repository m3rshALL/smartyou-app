export const CONTRACT_TEMPLATES = {
  'simple-storage': {
    name: 'Simple Storage',
    category: 'Beginner',
    description: 'Базовое хранение и получение данных',
    icon: '💾',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleStorage
 * @dev Простой контракт для хранения и получения значений
 */
contract SimpleStorage {
    uint256 private storedData;
    
    event DataStored(uint256 data, address indexed sender);
    
    constructor(uint256 _initialData) {
        storedData = _initialData;
        emit DataStored(_initialData, msg.sender);
    }
    
    /**
     * @dev Сохранить значение
     * @param _data Значение для сохранения
     */
    function set(uint256 _data) public {
        storedData = _data;
        emit DataStored(_data, msg.sender);
    }
    
    /**
     * @dev Получить сохраненное значение
     * @return Сохраненное значение
     */
    function get() public view returns (uint256) {
        return storedData;
    }
}`
  },
  
  'erc20-token': {
    name: 'ERC20 Token',
    category: 'DeFi',
    description: 'Стандартный токен с дополнительными функциями',
    icon: '🪙',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MyToken
 * @dev ERC20 токен с функциями паузы и управления
 */
contract MyToken is ERC20, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1 миллион токенов
    
    mapping(address => bool) public blacklist;
    
    event TokensMinted(address indexed to, uint256 amount);
    event AddressBlacklisted(address indexed account);
    event AddressUnblacklisted(address indexed account);
    
    modifier notBlacklisted(address account) {
        require(!blacklist[account], "Address is blacklisted");
        _;
    }
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds max supply");
        _mint(initialOwner, initialSupply);
    }
    
    /**
     * @dev Создать новые токены (только владелец)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Добавить адрес в черный список
     */
    function addToBlacklist(address account) external onlyOwner {
        blacklist[account] = true;
        emit AddressBlacklisted(account);
    }
    
    /**
     * @dev Убрать адрес из черного списка
     */
    function removeFromBlacklist(address account) external onlyOwner {
        blacklist[account] = false;
        emit AddressUnblacklisted(account);
    }
    
    /**
     * @dev Приостановить все трансферы
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Возобновить трансферы
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Переопределяем _update для добавления проверок
    function _update(address from, address to, uint256 value) 
        internal 
        override 
        whenNotPaused 
        notBlacklisted(from)
        notBlacklisted(to)
    {
        super._update(from, to, value);
    }
}`
  },

  'simple-nft': {
    name: 'Simple NFT',
    category: 'NFT',
    description: 'Базовая коллекция NFT с metadata',
    icon: '🎨',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleNFT
 * @dev Простая коллекция NFT с возможностью минтинга
 */
contract SimpleNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public mintPrice = 0.01 ether;
    bool public mintingEnabled = true;
    
    mapping(uint256 => string) private _tokenMetadata;
    
    event NFTMinted(address indexed to, uint256 indexed tokenId, string metadataURI);
    event MintPriceUpdated(uint256 newPrice);
    event MintingToggled(bool enabled);
    
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner) {}
    
    /**
     * @dev Публичный минтинг NFT
     * @param metadataURI URI метаданных для NFT
     */
    function mint(string memory metadataURI) external payable {
        require(mintingEnabled, "Minting is disabled");
        require(_nextTokenId <= MAX_SUPPLY, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        emit NFTMinted(msg.sender, tokenId, metadataURI);
    }
    
    /**
     * @dev Минтинг владельцем (бесплатно)
     * @param to Адрес получателя
     * @param metadataURI URI метаданных
     */
    function ownerMint(address to, string memory metadataURI) external onlyOwner {
        require(_nextTokenId <= MAX_SUPPLY, "Max supply reached");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        emit NFTMinted(to, tokenId, metadataURI);
    }
    
    /**
     * @dev Установить цену минтинга
     */
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
        emit MintPriceUpdated(newPrice);
    }
    
    /**
     * @dev Включить/выключить минтинг
     */
    function toggleMinting() external onlyOwner {
        mintingEnabled = !mintingEnabled;
        emit MintingToggled(mintingEnabled);
    }
    
    /**
     * @dev Вывести средства
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Получить общее количество выпущенных токенов
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    // Переопределения для совместимости
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}`
  },

  'voting-dao': {
    name: 'Voting DAO',
    category: 'DAO',
    description: 'Простая система голосования для DAO',
    icon: '🗳️',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VotingDAO
 * @dev Простая система голосования для принятия коллективных решений
 */
contract VotingDAO {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
        bool exists;
        address proposer;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => bool) public members;
    mapping(address => uint256) public memberSince;
    
    uint256 public proposalCount;
    uint256 public memberCount;
    uint256 public constant VOTING_DURATION = 7 days;
    uint256 public constant MIN_MEMBERS_TO_PROPOSE = 1;
    
    address public admin;
    
    event ProposalCreated(uint256 indexed proposalId, string title, address indexed proposer);
    event VoteCasted(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalExecuted(uint256 indexed proposalId, bool result);
    event MemberAdded(address indexed member);
    event MemberRemoved(address indexed member);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier onlyMember() {
        require(members[msg.sender], "Only members can call this function");
        _;
    }
    
    modifier proposalExists(uint256 proposalId) {
        require(proposals[proposalId].exists, "Proposal does not exist");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        members[msg.sender] = true;
        memberSince[msg.sender] = block.timestamp;
        memberCount = 1;
    }
    
    /**
     * @dev Добавить нового участника DAO
     */
    function addMember(address newMember) external onlyAdmin {
        require(!members[newMember], "Already a member");
        require(newMember != address(0), "Invalid address");
        
        members[newMember] = true;
        memberSince[newMember] = block.timestamp;
        memberCount++;
        
        emit MemberAdded(newMember);
    }
    
    /**
     * @dev Удалить участника DAO
     */
    function removeMember(address member) external onlyAdmin {
        require(members[member], "Not a member");
        require(member != admin, "Cannot remove admin");
        
        members[member] = false;
        memberSince[member] = 0;
        memberCount--;
        
        emit MemberRemoved(member);
    }
    
    /**
     * @dev Создать новое предложение
     */
    function createProposal(
        string memory title,
        string memory description
    ) external onlyMember returns (uint256) {
        require(memberCount >= MIN_MEMBERS_TO_PROPOSE, "Not enough members");
        require(bytes(title).length > 0, "Title cannot be empty");
        
        uint256 proposalId = proposalCount++;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            title: title,
            description: description,
            votesFor: 0,
            votesAgainst: 0,
            deadline: block.timestamp + VOTING_DURATION,
            executed: false,
            exists: true,
            proposer: msg.sender
        });
        
        emit ProposalCreated(proposalId, title, msg.sender);
        return proposalId;
    }
    
    /**
     * @dev Проголосовать за предложение
     * @param proposalId ID предложения
     * @param support true для голоса "за", false для "против"
     */
    function vote(uint256 proposalId, bool support) 
        external 
        onlyMember 
        proposalExists(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp <= proposal.deadline, "Voting period ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(!proposal.executed, "Proposal already executed");
        
        hasVoted[proposalId][msg.sender] = true;
        
        if (support) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }
        
        emit VoteCasted(proposalId, msg.sender, support);
    }
    
    /**
     * @dev Исполнить предложение после окончания голосования
     */
    function executeProposal(uint256 proposalId) 
        external 
        proposalExists(proposalId) 
    {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp > proposal.deadline, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        
        proposal.executed = true;
        bool result = proposal.votesFor > proposal.votesAgainst;
        
        emit ProposalExecuted(proposalId, result);
    }
    
    /**
     * @dev Получить детали предложения
     */
    function getProposal(uint256 proposalId) 
        external 
        view 
        returns (
            string memory title,
            string memory description,
            uint256 votesFor,
            uint256 votesAgainst,
            uint256 deadline,
            bool executed,
            address proposer
        ) 
    {
        Proposal memory proposal = proposals[proposalId];
        require(proposal.exists, "Proposal does not exist");
        
        return (
            proposal.title,
            proposal.description,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.deadline,
            proposal.executed,
            proposal.proposer
        );
    }
    
    /**
     * @dev Проверить статус голосования предложения
     */
    function getVotingStatus(uint256 proposalId) 
        external 
        view 
        returns (bool isActive, bool hasPassed, uint256 timeLeft) 
    {
        Proposal memory proposal = proposals[proposalId];
        require(proposal.exists, "Proposal does not exist");
        
        isActive = block.timestamp <= proposal.deadline && !proposal.executed;
        hasPassed = proposal.votesFor > proposal.votesAgainst;
        timeLeft = proposal.deadline > block.timestamp ? proposal.deadline - block.timestamp : 0;
        
        return (isActive, hasPassed, timeLeft);
    }
}`
  },

  'defi-staking': {
    name: 'DeFi Staking',
    category: 'DeFi',
    description: 'Простой контракт стейкинга с наградами',
    icon: '💰',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SimpleStaking
 * @dev Простой контракт для стейкинга токенов с наградами
 */
contract SimpleStaking is Ownable, ReentrancyGuard {
    IERC20 public stakingToken;
    IERC20 public rewardToken;
    
    uint256 public constant REWARD_RATE = 100; // 1% в день (100 базисных пунктов)
    uint256 public constant SECONDS_PER_DAY = 86400;
    
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
    }
    
    mapping(address => StakeInfo) public stakes;
    mapping(address => uint256) public totalRewardsClaimed;
    
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event EmergencyWithdrawal(address indexed user, uint256 amount);
    
    constructor(
        address _stakingToken,
        address _rewardToken,
        address _owner
    ) Ownable(_owner) {
        require(_stakingToken != address(0), "Invalid staking token");
        require(_rewardToken != address(0), "Invalid reward token");
        
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }
    
    /**
     * @dev Застейкать токены
     * @param amount Количество токенов для стейкинга
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(stakingToken.balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Если у пользователя уже есть стейк, сначала собираем награды
        if (stakes[msg.sender].amount > 0) {
            _claimRewards();
        }
        
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].startTime = block.timestamp;
        stakes[msg.sender].lastClaimTime = block.timestamp;
        
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Снять застейканные токены
     * @param amount Количество токенов для снятия
     */
    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(stakes[msg.sender].amount >= amount, "Insufficient staked amount");
        
        // Собираем все накопленные награды
        _claimRewards();
        
        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;
        
        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit Unstaked(msg.sender, amount);
    }
    
    /**
     * @dev Забрать накопленные награды
     */
    function claimRewards() external nonReentrant {
        _claimRewards();
    }
    
    /**
     * @dev Внутренняя функция для расчета и выплаты наград
     */
    function _claimRewards() internal {
        uint256 reward = calculateReward(msg.sender);
        
        if (reward > 0) {
            require(rewardToken.balanceOf(address(this)) >= reward, "Insufficient reward tokens");
            
            stakes[msg.sender].lastClaimTime = block.timestamp;
            totalRewardsClaimed[msg.sender] += reward;
            totalRewardsDistributed += reward;
            
            require(rewardToken.transfer(msg.sender, reward), "Reward transfer failed");
            
            emit RewardClaimed(msg.sender, reward);
        }
    }
    
    /**
     * @dev Рассчитать доступные награды для пользователя
     * @param user Адрес пользователя
     * @return Количество доступных наград
     */
    function calculateReward(address user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[user];
        
        if (userStake.amount == 0) {
            return 0;
        }
        
        uint256 timeStaked = block.timestamp - userStake.lastClaimTime;
        uint256 daysStaked = timeStaked / SECONDS_PER_DAY;
        
        // Простая формула: сумма_стейка * дни * процент_в_день / 10000
        return (userStake.amount * daysStaked * REWARD_RATE) / 10000;
    }
    
    /**
     * @dev Получить информацию о стейке пользователя
     */
    function getUserStakeInfo(address user) 
        external 
        view 
        returns (
            uint256 stakedAmount,
            uint256 stakingDuration,
            uint256 availableRewards,
            uint256 totalRewards
        ) 
    {
        StakeInfo memory userStake = stakes[user];
        
        return (
            userStake.amount,
            userStake.amount > 0 ? block.timestamp - userStake.startTime : 0,
            calculateReward(user),
            totalRewardsClaimed[user]
        );
    }
    
    /**
     * @dev Экстренное снятие без наград (только владелец)
     */
    function emergencyUnstake() external nonReentrant {
        uint256 stakedAmount = stakes[msg.sender].amount;
        require(stakedAmount > 0, "No tokens staked");
        
        stakes[msg.sender].amount = 0;
        stakes[msg.sender].startTime = 0;
        stakes[msg.sender].lastClaimTime = 0;
        
        totalStaked -= stakedAmount;
        
        require(stakingToken.transfer(msg.sender, stakedAmount), "Transfer failed");
        
        emit EmergencyWithdrawal(msg.sender, stakedAmount);
    }
    
    /**
     * @dev Пополнить пул наград (только владелец)
     */
    function fundRewardPool(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(rewardToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }
    
    /**
     * @dev Получить общую статистику контракта
     */
    function getContractStats() 
        external 
        view 
        returns (
            uint256 _totalStaked,
            uint256 _totalRewardsDistributed,
            uint256 rewardPoolBalance
        ) 
    {
        return (
            totalStaked,
            totalRewardsDistributed,
            rewardToken.balanceOf(address(this))
        );
    }
}`
  },

  'multisig-wallet': {
    name: 'MultiSig Wallet',
    category: 'Security',
    description: 'Кошелек с множественными подписями',
    icon: '🔐',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MultiSigWallet
 * @dev Кошелек с множественными подписями для повышенной безопасности
 */
contract MultiSigWallet {
    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event SubmitTransaction(
        address indexed owner,
        uint256 indexed txIndex,
        address indexed to,
        uint256 value,
        bytes data
    );
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);
    
    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public numConfirmationsRequired;
    
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }
    
    // mapping from tx index => owner => bool
    mapping(uint256 => mapping(address => bool)) public isConfirmed;
    
    Transaction[] public transactions;
    
    modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }
    
    modifier txExists(uint256 _txIndex) {
        require(_txIndex < transactions.length, "tx does not exist");
        _;
    }
    
    modifier notExecuted(uint256 _txIndex) {
        require(!transactions[_txIndex].executed, "tx already executed");
        _;
    }
    
    modifier notConfirmed(uint256 _txIndex) {
        require(!isConfirmed[_txIndex][msg.sender], "tx already confirmed");
        _;
    }
    
    constructor(address[] memory _owners, uint256 _numConfirmationsRequired) {
        require(_owners.length > 0, "owners required");
        require(
            _numConfirmationsRequired > 0 &&
                _numConfirmationsRequired <= _owners.length,
            "invalid number of required confirmations"
        );
        
        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            
            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");
            
            isOwner[owner] = true;
            owners.push(owner);
        }
        
        numConfirmationsRequired = _numConfirmationsRequired;
    }
    
    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }
    
    /**
     * @dev Предложить новую транзакцию
     */
    function submitTransaction(
        address _to,
        uint256 _value,
        bytes memory _data
    ) public onlyOwner {
        uint256 txIndex = transactions.length;
        
        transactions.push(
            Transaction({
                to: _to,
                value: _value,
                data: _data,
                executed: false,
                numConfirmations: 0
            })
        );
        
        emit SubmitTransaction(msg.sender, txIndex, _to, _value, _data);
    }
    
    /**
     * @dev Подтвердить транзакцию
     */
    function confirmTransaction(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
        notConfirmed(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        transaction.numConfirmations += 1;
        isConfirmed[_txIndex][msg.sender] = true;
        
        emit ConfirmTransaction(msg.sender, _txIndex);
    }
    
    /**
     * @dev Выполнить транзакцию
     */
    function executeTransaction(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        
        require(
            transaction.numConfirmations >= numConfirmationsRequired,
            "cannot execute tx"
        );
        
        transaction.executed = true;
        
        (bool success, ) = transaction.to.call{value: transaction.value}(
            transaction.data
        );
        require(success, "tx failed");
        
        emit ExecuteTransaction(msg.sender, _txIndex);
    }
    
    /**
     * @dev Отозвать подтверждение
     */
    function revokeConfirmation(uint256 _txIndex)
        public
        onlyOwner
        txExists(_txIndex)
        notExecuted(_txIndex)
    {
        Transaction storage transaction = transactions[_txIndex];
        
        require(isConfirmed[_txIndex][msg.sender], "tx not confirmed");
        
        transaction.numConfirmations -= 1;
        isConfirmed[_txIndex][msg.sender] = false;
        
        emit RevokeConfirmation(msg.sender, _txIndex);
    }
    
    /**
     * @dev Получить владельцев кошелька
     */
    function getOwners() public view returns (address[] memory) {
        return owners;
    }
    
    /**
     * @dev Получить количество транзакций
     */
    function getTransactionCount() public view returns (uint256) {
        return transactions.length;
    }
    
    /**
     * @dev Получить детали транзакции
     */
    function getTransaction(uint256 _txIndex)
        public
        view
        returns (
            address to,
            uint256 value,
            bytes memory data,
            bool executed,
            uint256 numConfirmations
        )
    {
        Transaction storage transaction = transactions[_txIndex];
        
        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }
}`
  }
};

export const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'Все шаблоны', icon: '📋' },
  { id: 'Beginner', name: 'Начальный', icon: '🌱' },
  { id: 'DeFi', name: 'DeFi', icon: '💰' },
  { id: 'NFT', name: 'NFT', icon: '🎨' },
  { id: 'DAO', name: 'DAO', icon: '🗳️' },
  { id: 'Security', name: 'Безопасность', icon: '🔐' },
];

export function getTemplatesByCategory(category: string) {
  if (category === 'all') {
    return Object.values(CONTRACT_TEMPLATES);
  }
  return Object.values(CONTRACT_TEMPLATES).filter(template => template.category === category);
}

export function getTemplateByKey(key: string) {
  return CONTRACT_TEMPLATES[key as keyof typeof CONTRACT_TEMPLATES] || null;
}
