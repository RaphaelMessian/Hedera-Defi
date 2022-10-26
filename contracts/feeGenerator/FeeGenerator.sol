//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../common/hedera/HederaResponseCodes.sol";
import "../common/IBaseHTS.sol";
import "./AbstractSwap.sol";
import "./ILPToken.sol";

contract FeeGenerator is AbstractSwap {
    
    function associateToken(address account,  address _token) internal override  virtual returns(int) {
        (bool success, bytes memory result) = address(tokenService).delegatecall(
            abi.encodeWithSelector(IBaseHTS.associateTokenPublic.selector,
            account, _token));
        return success ? abi.decode(result, (int32)) : HederaResponseCodes.UNKNOWN;
    }

    function transferToken(address _token, address sender, address receiver, int64 amount) internal override virtual returns(int) {
        (bool success, bytes memory result) = address(tokenService).delegatecall(
            abi.encodeWithSelector(IBaseHTS.transferTokenPublic.selector,
            _token, sender, receiver, amount));
        return success ? abi.decode(result, (int32)) : HederaResponseCodes.UNKNOWN;
    }
}