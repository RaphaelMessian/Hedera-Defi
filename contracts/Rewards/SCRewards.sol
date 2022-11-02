// SPDX-License-Identifier: MIT

pragma solidity ^0.8;

import "../common/hedera/HederaTokenService.sol";
import "../common/hedera/HederaResponseCodes.sol";
import "../common/IERC20.sol";

contract scReward is HederaTokenService {

    IERC20 public stakingToken;
    IERC20  public rewardsToken;

    address public owner;

    struct UserInfo {
        uint num_shares;
        uint last_claimed_amount;
    }

    uint256 public totalTokens;
    uint256 public totalRewards;

    struct UserContributor {
        UserInfo userInfo;
    }

    UserInfo userInfo;

    uint public reward;
    uint perShareRewards;

    mapping (address => UserInfo) public userContribution;

    function addAccount(uint _numTokens) public {
        userInfo = UserInfo(_numTokens, 0);
        userContribution[msg.sender] = userInfo;
        totalTokens += _numTokens;
    }

    function addReward(uint _amount) public {
        uint256 factor = 1e12;
        perShareRewards = ((_amount*factor) / totalTokens) % factor;
        totalRewards += perShareRewards;
    }
    
    function claimReward(address addr) public returns (uint){
        reward = (totalRewards - userContribution[addr].last_claimed_amount) * userContribution[addr].num_shares;
        userContribution[addr].last_claimed_amount = totalRewards;
        return reward;
    }

    function transfer(address a, address b, uint _amount) public {
        uint rewardA = claimReward(a);
        uint rewardB = claimReward(b);
        userContribution[a].num_shares -= _amount;
        userContribution[b].num_shares += _amount;
    }
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