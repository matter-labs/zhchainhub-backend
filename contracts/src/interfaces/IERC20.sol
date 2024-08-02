// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.0;

interface IERC20 {
  /**
   * @dev Returns the value of tokens owned by `account`.
   */
  function balanceOf(address account) external view returns (uint256);
}
