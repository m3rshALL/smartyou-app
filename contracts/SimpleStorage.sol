// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SimpleStorage
 * @dev Store & retrieve value in a variable for SmartYou educational platform
 */
contract SimpleStorage {
    uint256 private storedData;
    address public owner;
    
    event DataStored(uint256 indexed data, address indexed by);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor(uint256 _initialValue) {
        storedData = _initialValue;
        owner = msg.sender;
        emit DataStored(_initialValue, msg.sender);
    }
    
    /**
     * @dev Store value in variable
     * @param x value to store
     */
    function set(uint256 x) public {
        storedData = x;
        emit DataStored(x, msg.sender);
    }
    
    /**
     * @dev Return value 
     * @return value of 'storedData'
     */
    function get() public view returns (uint256) {
        return storedData;
    }
    
    /**
     * @dev Transfer ownership to a new owner (only current owner)
     * @param newOwner address of the new owner
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
    
    /**
     * @dev Set value (only owner)
     * @param x value to store
     */
    function setByOwner(uint256 x) public onlyOwner {
        storedData = x;
        emit DataStored(x, msg.sender);
    }
}
