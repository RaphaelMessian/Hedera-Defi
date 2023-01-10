//SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;
pragma abicoder v2;

import "../common/safe-HTS/HederaResponseCodes.sol";
import "../common/IERC20.sol";
import "../common/safe-HTS/SafeHTS.sol";

contract testEventHTS {

    IERC20 public testToken;

    function initialize(address _testToken) external {
        require(_testToken != address(0), "stakingToken != address(0)");
        SafeHTS.safeAssociateToken(_testToken, address(this));
        testToken = IERC20(_testToken);
    }

    function transferFromSafeHTS(uint _amount) public {
        SafeHTS.safeTransferToken(address(testToken), msg.sender, address(this), int64(uint64(_amount)));
    }

    function transferFromERC(uint _amount) public {
        // IERC20(testToken).transfer(msg.sender, _amount);
         SafeHTS.safeTransferToken(address(testToken), address(this), msg.sender, int64(uint64(_amount)));
    }

    function approveFromSafeHTS(uint _amount) public {
        SafeHTS.safeApprove(address(testToken), msg.sender, _amount);
        //SafeHTS.safeAllowance(address(testToken), msg.sender, address(this));
        SafeHTS.safeAssociateToken(address(testToken), msg.sender);
        SafeHTS.safeTransferToken(address(testToken), address(this), msg.sender, int64(uint64(_amount)));
    }

    function approveFromERC(uint _amount) public {
        IERC20(testToken).approve(msg.sender, _amount);
        SafeHTS.safeAssociateToken(address(testToken), msg.sender);
        IERC20(testToken).transfer(msg.sender, _amount);
    }

    function allowanceFromSafeHTS(uint _amount) public {
        SafeHTS.safeApprove(address(testToken), msg.sender, _amount);
        SafeHTS.safeAllowance(address(testToken), msg.sender, address(this));
    }

    function allowanceFromERC20(uint _amount) public {
         IERC20(testToken).approve(msg.sender, _amount);
         IERC20(testToken).allowance(address(this), msg.sender);
    }

}