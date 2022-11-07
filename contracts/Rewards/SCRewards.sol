// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import "../common/safe-HTS/HederaResponseCodes.sol";
import "../common/IERC20.sol";
import "../common/safe-HTS/SafeHTS.sol";
import "prb-math/contracts/PRBMathUD60x18.sol";


contract SCRewards  {

    using PRBMathUD60x18 for uint256;

    IERC20 public stakingToken;
    IERC20  public rewardsToken;

    address public owner;

    struct UserInfo {
        uint num_shares;
        uint last_claimed_amount;
    }

    uint public totalTokens;
    uint public totalRewards;

    UserInfo userInfo;

    uint public reward;
    uint perShareRewards;

    mapping (address => UserInfo) public userContribution;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not authorized");
        _;
    }

    function adjustReward(address claimer) internal {
        reward = ((totalRewards - userContribution[claimer].last_claimed_amount).mul(userContribution[claimer].num_shares));
        userContribution[claimer].last_claimed_amount = totalRewards;
    }

    function initialize(address _stakingToken, address _rewardsToken) external onlyOwner{
        require(_stakingToken != address(0), "stakingToken != address(0)");
        require(_rewardsToken != address(0), "rewardsToken != address(0)");
        SafeHTS.safeAssociateToken(_stakingToken, address(this));
        SafeHTS.safeAssociateToken(_rewardsToken, address(this));
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
    }

    function addStakeAccount(address sender, uint amount) external {
        SafeHTS.safeAssociateToken(address(rewardsToken), address(msg.sender));
        SafeHTS.safeTransferToken(address(stakingToken), sender, address(this), int64(uint64(amount)));
        userInfo = UserInfo(amount, 0);
        userContribution[msg.sender] = userInfo;
        totalTokens += amount;
    }

    function addReward(uint amount) external onlyOwner {
        SafeHTS.safeTransferToken(address(rewardsToken), address(owner), address(this), int64(uint64(amount)));
        perShareRewards = amount.div(totalTokens);
        totalRewards += perShareRewards;
    }
    
    function claimReward(address claimer) external returns (uint){
        adjustReward(claimer);
        SafeHTS.safeTransferToken(address(rewardsToken), address(this), address(msg.sender), int64(uint64(reward)));
        return reward;
    }

    function transfer(address sender, address receiver, uint amount) external returns(uint){
        adjustReward(sender);
        adjustReward(receiver);
        userContribution[sender].num_shares -= amount;
        userContribution[receiver].num_shares += amount;
        return userContribution[receiver].num_shares;
    }

    function mint(uint _amount, address sender) public {
        adjustReward(sender);
        totalTokens += _amount;
        userContribution[msg.sender].num_shares += _amount;
    }

    function burn(uint _amount,  address sender) public {
        adjustReward(sender);
        totalTokens -= _amount;
        userContribution[msg.sender].num_shares -= _amount;
    }
   
}



