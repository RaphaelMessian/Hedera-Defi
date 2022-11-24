// SPDX-License-Identifier: MIT

pragma solidity ^0.8.2;
pragma abicoder v2;

contract Abc {
    address[] st;
    address[] st2;

    function add(address newValue,address newValue2) public {
        st.push(newValue);
        st2.push(newValue2);
    }

    function getSt() public view returns (address[] memory, address[] memory) {
        return (st,st2);
    }
}