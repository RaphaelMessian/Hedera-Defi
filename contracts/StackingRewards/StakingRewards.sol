// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "../common/hedera/HederaTokenService.sol";
import "../common/IBaseHTS.sol";
import "../common/hedera/HederaResponseCodes.sol";

contract StakingRewards is HederaTokenService {

    IBaseHTS tokenService;

    IERC20 public stakingToken;
    IERC20  public rewardsToken;

    address public owner;

    // Duration of rewards to be paid out (in seconds)
    uint public duration;
    // Timestamp of when the rewards finish
    uint public finishAt;
    // Minimum of last updated time and reward finish time
    uint public updatedAt;
    // Reward to be paid out per second
    uint public rewardRate;
    // Sum of (reward rate * dt * 1e18 / total supply)
    uint public rewardPerTokenStored;
    // User address => rewardPerTokenStored
    mapping(address => uint) public userRewardPerTokenPaid;
    // User address => rewards to be claimed
    mapping(address => uint) public rewards;

    // Total staked
    uint public totalSupply;
    // User address => staked amount
    mapping(address => uint) public balanceOf;

    constructor(address _stakingToken, address _rewardToken) {
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardToken);
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not authorized");
        _;
    }

    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        updatedAt = lastTimeRewardApplicable();

        if (_account != address(0)) {
            rewards[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        }

        _;
    }

    function getRewardBalanceUser(address _user) external view  returns(int) {
        return int(rewardsToken.balanceOf(_user));
    }

    function getRewardTokenAddress() external view returns(address) {
        return address(rewardsToken);
    }

    function getRewardTokenCount() external view  returns(int) {
        return int(rewardsToken.totalSupply());
    }

    function lastTimeRewardApplicable() public view returns (uint) {
        return _min(finishAt, block.timestamp);
    }

    function rewardPerToken() public view returns (uint) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }

        return
            rewardPerTokenStored +
            (rewardRate * (lastTimeRewardApplicable() - updatedAt) * 1e18) /
            totalSupply;
    }

    function initialize() external onlyOwner{
        int responseAssociateStaking = HederaTokenService.associateToken(address(this), address(stakingToken));
        if (responseAssociateStaking != HederaResponseCodes.SUCCESS) {
            revert ("Associate Failed");
        }
        int responseAssociateReward = HederaTokenService.associateToken(address(this), address(rewardsToken));
        if (responseAssociateReward != HederaResponseCodes.SUCCESS) {
            revert ("Associate Failed");
        }
    }

    function stake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "amount = 0");
        int responseTransfert = HederaTokenService.transferToken(address(stakingToken), msg.sender, address(this), int64(uint64(amount)));
        if (responseTransfert != HederaResponseCodes.SUCCESS) {
            revert ("Transfer Failed");
        }
        balanceOf[msg.sender] += amount;
        totalSupply += amount;
    }

    function withdraw(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "amount = 0");
        int responseTransfert = HederaTokenService.transferToken(address(stakingToken), address(this), msg.sender, int64(uint64(amount)));
        if (responseTransfert != HederaResponseCodes.SUCCESS) {
            revert ("Transfer Failed");
        }
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
    }

    function earned(address _account) public view returns (uint256) {
        return
            ((balanceOf[_account] *
                (rewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18) +
            rewards[_account];
    }

    function getReward() external updateReward(msg.sender) {
        uint reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            int responseTransfert = HederaTokenService.transferToken(address(rewardsToken), address(this), msg.sender, int64(uint64(reward)));
            if (responseTransfert != HederaResponseCodes.SUCCESS) {
                revert ("Transfer Failed");
            }   
        }
    }

    function setRewardsDuration(uint _duration, uint reward) external onlyOwner {
        int responseTransfert = HederaTokenService.transferToken(address(rewardsToken), msg.sender, address(this), int64(uint64(reward)));
            if (responseTransfert != HederaResponseCodes.SUCCESS) {
                revert ("Transfer Failed");
            }   
        require(finishAt < block.timestamp, "reward duration not finished");
        duration = _duration;
    }

    function notifyRewardAmount(uint _amount)
        external
        updateReward(address(0))
    {
        if (block.timestamp >= finishAt) {
            rewardRate = _amount / duration;
        } else {
            uint remainingRewards = (finishAt - block.timestamp) * rewardRate;
            rewardRate = (_amount + remainingRewards) / duration;
        }

        require(rewardRate > 0, "reward rate = 0");
        require(
            rewardRate * duration <= rewardsToken.balanceOf(address(this)),
            "reward amount > balance"
        );

        finishAt = block.timestamp + duration;
        updatedAt = block.timestamp;
    }

    function _min(uint x, uint y) private pure returns (uint) {
        return x <= y ? x : y;
    }
}

interface IERC20 {
    function totalSupply() external view returns (uint);

    function balanceOf(address account) external view returns (uint);

    function transfer(address recipient, uint amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint);

    function approve(address spender, uint amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);
}
