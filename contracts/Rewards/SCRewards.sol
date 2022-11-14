// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import "../common/safe-HTS/HederaResponseCodes.sol";
import "../common/IERC20.sol";
import "../common/safe-HTS/SafeHTS.sol";
import "prb-math/contracts/PRBMathUD60x18.sol";


contract SCRewards  {

    using PRBMathUD60x18 for uint256;

    IERC20 public stakingToken;

    uint public totalTokens;
    address[] tokenAddress;
    
    address public owner;

    struct UserInfo {
        uint num_shares;
        mapping(address => uint) lastClaimedAmountT;
    }

    struct RewardsInfo {
        uint amount;
        bool exist;
    }

    mapping(address =>  UserInfo) public userContribution;
    mapping (address => RewardsInfo) public rewardsAddress;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not authorized");
        _;
    }

    function initialize(address _stakingToken) external onlyOwner{
        require(_stakingToken != address(0), "stakingToken != address(0)");
        SafeHTS.safeAssociateToken(_stakingToken, address(this));
        stakingToken = IERC20(_stakingToken);
    }

    function addStakeAccount(uint _amount) external {
        require(_amount != 0, "please provide amount");
        SafeHTS.safeTransferToken(address(stakingToken), msg.sender, address(this), int64(uint64(_amount)));
        userContribution[msg.sender].num_shares = _amount;
        totalTokens += _amount;
    }

    function addReward(address _token, uint _amount) external onlyOwner {
        require(_amount != 0, "please provide amount");
        uint perShareRewards;
        perShareRewards = _amount.div(totalTokens);
        if(!rewardsAddress[_token].exist) {
            tokenAddress.push(_token);
            rewardsAddress[_token].exist = true;
            rewardsAddress[_token].amount = perShareRewards;
            SafeHTS.safeAssociateToken(_token, address(this));
            SafeHTS.safeTransferToken(address(_token), address(owner), address(this), int64(uint64(_amount)));
        } else {
            rewardsAddress[_token].amount += perShareRewards;
            SafeHTS.safeTransferToken(address(_token), address(owner), address(this), int64(uint64(_amount)));
        }     
    }
    
    function claimSpecificReward(address _token) public returns (uint){
        uint reward;
        if(userContribution[msg.sender].lastClaimedAmountT[_token] != 0){
            reward = (rewardsAddress[_token].amount - userContribution[msg.sender].lastClaimedAmountT[_token]).mul(userContribution[msg.sender].num_shares);
        } else {
            SafeHTS.safeAssociateToken(_token, address(msg.sender));
            reward = rewardsAddress[_token].amount.mul(userContribution[msg.sender].num_shares);
        }
        userContribution[msg.sender].lastClaimedAmountT[_token] = rewardsAddress[_token].amount;
        SafeHTS.safeTransferToken(address(_token), address(this), address(msg.sender), int64(uint64(reward)));
        return reward;
    }

    function claimAllReward() public returns (uint){
        uint reward;
        for(uint i; i < tokenAddress.length; i++){
            address token = tokenAddress[i];
            if(userContribution[msg.sender].lastClaimedAmountT[token] == 0) {
                SafeHTS.safeAssociateToken(token, address(msg.sender));
            }
            reward = (rewardsAddress[token].amount - userContribution[msg.sender].lastClaimedAmountT[token]).mul(userContribution[msg.sender].num_shares);
            userContribution[msg.sender].lastClaimedAmountT[token] = rewardsAddress[token].amount;
            SafeHTS.safeTransferToken(address(token), address(this), address(msg.sender), int64(uint64(reward)));
        }
        return reward;
    }
   
}



