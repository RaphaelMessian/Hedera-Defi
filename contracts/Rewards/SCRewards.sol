// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import "../common/safe-HTS/HederaResponseCodes.sol";
import "../common/IERC20.sol";
import "../common/safe-HTS/SafeHTS.sol";

contract scReward  {

    IERC20 public stakingToken;
    IERC20  public rewardsToken;

    address public owner;

    struct UserInfo {
        uint num_shares;
        uint last_claimed_amount;
    }

    uint public totalTokens;
    uint public totalRewards;

    struct UserContributor {
        UserInfo userInfo;
    }

    UserInfo userInfo;

    uint public reward;
    uint perShareRewards;

    mapping (address => UserInfo) public userContribution;

    modifier onlyOwner() {
        require(msg.sender == owner, "not authorized");
        _;
    }

    function initialize(address _stakingToken, address _rewardsToken) external onlyOwner{
        SafeHTS.safeAssociateToken(_stakingToken, address(this));
        SafeHTS.safeAssociateToken(_rewardsToken, address(this));
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
    }

    function addAccount(address sender, uint amount) external {
        SafeHTS.safeTransferToken(address(stakingToken), sender, sender, amount);
        userInfo = UserInfo(amount, 0);
        userContribution[msg.sender] = userInfo;
        totalTokens += amount;
    }

    function addReward(uint _amount) external onlyOwner{
        perShareRewards = (_amount / totalTokens)*1e18;
        totalRewards += perShareRewards;
    }
    
    function claimReward(address addr) public returns (uint){
        reward = ((totalRewards - userContribution[addr].last_claimed_amount) * userContribution[addr].num_shares)/1e18;
        userContribution[addr].last_claimed_amount = totalRewards;
        return reward;
    }

    // function transfer(address a, address b, uint _amount) public {
    //     uint rewardA = claimReward(a);
    //     uint rewardB = claimReward(b);
    //     userContribution[a].num_shares -= _amount;
    //     userContribution[b].num_shares += _amount;
    // }
    // function mint(uint _amount) public {
    //     reward = claimReward();
    //     totalTokens += _amount;
    //     userContribution[msg.sender].num_shares += _amount;
    // }
    // function burn(uint _amount) public {
    //     reward = claimReward();
    //     totalTokens -= _amount;
    //     userContribution[msg.sender].num_shares -= _amount;
    // }
}