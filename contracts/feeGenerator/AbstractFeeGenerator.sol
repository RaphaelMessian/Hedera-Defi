//SPDX-License-Identifier: Unlicense
pragma solidity >=0.5.0 <0.9.0;
pragma experimental ABIEncoderV2;

import "../common/hedera/HederaResponseCodes.sol";
import "../common/IBaseHTS.sol";
import "./ILPToken.sol";

abstract contract AbstractFeeGenerator is HederaResponseCodes {
    IBaseHTS  internal tokenService;
    ILPToken internal lpTokenContract;

    struct FeeTokenInfo {
        address tokenAddress;
        int64 tokenQty;
    }

    struct FeeToken {
        FeeTokenInfo feeToken;
    }

    address internal dexToken;

    address internal creator;

    mapping (address => FeeToken) feeToken;

    function associateToken(address account,  address _token) internal virtual returns(int);
    function transferToken(address _token, address sender, address receiver, int64 amount) internal virtual returns(int);

    function initializeContract(address _dexToken, IBaseHTS _tokenService) external {
         // instantiate the list of keys we'll use for token create
         dexToken = _dexToken;
         tokenService = _tokenService;
    }

    function swapDexToken() external {

    }


}
