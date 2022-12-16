// SPDX-License-Identifier: MIT

import "./IVault.sol";
import "../common/IERC20.sol";
import "prb-math/contracts/PRBMathUD60x18.sol";
import "../common/safe-HTS/SafeHTS.sol";

pragma solidity ^0.8;

contract Splitter {

    using PRBMathUD60x18 for uint256;
    IERC20 public stakingToken;

    address public owner;
    address[] public vaultAddress;

    uint tvlAllVault;
    uint tvlPerVault;
    uint percentPerVault;
    uint weightPerVault;
    uint amountPerVault;

    mapping(address =>  uint) public vaultMultiplier;
    
    constructor() {
        owner = msg.sender;
    }

    // modifier onlyOwner() {
    //     require(msg.sender == owner, "not authorized");
    //     _;
    // }

    function initialize(address _vaultAddress, uint _multiplier, address _stakingToken) external {
        vaultAddress.push(_vaultAddress);
        vaultMultiplier[_vaultAddress] = _multiplier;
        stakingToken = IERC20(_stakingToken);
    }

    function addNewVault(address _vaultAddress, uint _multiplier) external {
        vaultAddress.push(_vaultAddress);
        vaultMultiplier[_vaultAddress] = _multiplier;
    }

    function deposit() external returns(uint weight){
        for(uint i=0; i < vaultAddress.length; i++){
            address vault = vaultAddress[i];
            tvlPerVault = IERC20(stakingToken).balanceOf(vault);
            percentPerVault = tvlPerVault*vaultMultiplier[vault];
            weightPerVault = percentPerVault.div(tvlAllVault);
            //amountPerVault = _amount.mul(weightPerVault);
        }
        return weightPerVault;
        
    }

    function getVaultMultiplier(address _vault) public view returns (uint){
        return vaultMultiplier[_vault];
    }

    function getTvlPerVault(address _vault) public view returns (uint){
        return IERC20(stakingToken).balanceOf(_vault);
    }

    function getTvlAllVault() public returns (uint){
         for(uint i=0; i < vaultAddress.length; i++){
            tvlAllVault = 0;
            address vault = vaultAddress[i];
            tvlPerVault = IERC20(stakingToken).balanceOf(vault);
            percentPerVault = tvlPerVault*vaultMultiplier[vault];
            tvlAllVault += percentPerVault;
        }
        return tvlAllVault;
    }

}