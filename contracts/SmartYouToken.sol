// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title SmartYouToken
 * @dev Educational ERC20 token for the SmartYou platform
 */
contract SmartYouToken is ERC20, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1 million tokens
    uint256 public constant REWARD_PER_LEVEL = 100 * 10**18; // 100 tokens per level
    
    mapping(address => uint256) public levelsCompleted;
    mapping(address => bool) public educators;
    
    event LevelCompleted(address indexed student, uint256 level, uint256 reward);
    event EducatorAdded(address indexed educator);
    event EducatorRemoved(address indexed educator);
    
    modifier onlyEducator() {
        require(educators[msg.sender] || msg.sender == owner(), "Only educators can call this function");
        _;
    }
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds maximum");
        _mint(initialOwner, initialSupply);
    }
    
    /**
     * @dev Add an educator (only owner)
     * @param educator Address to add as educator
     */
    function addEducator(address educator) external onlyOwner {
        educators[educator] = true;
        emit EducatorAdded(educator);
    }
    
    /**
     * @dev Remove an educator (only owner)
     * @param educator Address to remove from educators
     */
    function removeEducator(address educator) external onlyOwner {
        educators[educator] = false;
        emit EducatorRemoved(educator);
    }
    
    /**
     * @dev Reward student for completing a level (only educators)
     * @param student Address of the student
     * @param level Level number completed
     */
    function rewardForLevel(address student, uint256 level) external onlyEducator {
        require(student != address(0), "Invalid student address");
        require(level > levelsCompleted[student], "Level already completed");
        require(totalSupply() + REWARD_PER_LEVEL <= MAX_SUPPLY, "Would exceed max supply");
        
        levelsCompleted[student] = level;
        _mint(student, REWARD_PER_LEVEL);
        
        emit LevelCompleted(student, level, REWARD_PER_LEVEL);
    }
    
    /**
     * @dev Bulk reward multiple students (only educators)
     * @param students Array of student addresses
     * @param levels Array of levels completed
     */
    function bulkReward(address[] calldata students, uint256[] calldata levels) external onlyEducator {
        require(students.length == levels.length, "Arrays length mismatch");
        require(students.length > 0, "Empty arrays");
        
        uint256 totalReward = students.length * REWARD_PER_LEVEL;
        require(totalSupply() + totalReward <= MAX_SUPPLY, "Would exceed max supply");
        
        for (uint256 i = 0; i < students.length; i++) {
            address student = students[i];
            uint256 level = levels[i];
            
            require(student != address(0), "Invalid student address");
            require(level > levelsCompleted[student], "Level already completed");
            
            levelsCompleted[student] = level;
            _mint(student, REWARD_PER_LEVEL);
            
            emit LevelCompleted(student, level, REWARD_PER_LEVEL);
        }
    }
    
    /**
     * @dev Emergency mint (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function emergencyMint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Burn tokens from caller's account
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Pause token transfers (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get student progress
     * @param student Address of the student
     * @return levels completed and token balance
     */
    function getStudentProgress(address student) external view returns (uint256 levels, uint256 balance) {
        return (levelsCompleted[student], balanceOf(student));
    }
    
    // Override required for Pausable
    function _update(address from, address to, uint256 value) internal virtual override whenNotPaused {
        super._update(from, to, value);
    }
}
