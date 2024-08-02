// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.0;

import {IERC20} from 'interfaces/IERC20.sol';

/**
 * @title TokenBalances
 *
 * @dev This contract is not meant to be deployed. Instead, use a static call with the
 * deployment bytecode as payload.
 *
 * @notice The purpose of this contract is to provide a mechanism for performing batch request
 * for fetching the balances of multiple tokens and ether held by an address.
 *
 */
contract TokenBalances {
  /// @notice Returns the balance of the target contract for the specified tokens and ether
  /// @param _targetAddress The target contract address to query balances
  /// @param _tokenAddresses The token addresses
  constructor(address _targetAddress, address[] memory _tokenAddresses) {
    uint256 length = _tokenAddresses.length;

    // one additional element for the ether balance
    uint256[] memory returnData = new uint256[](length + 1);

    uint256 i; //saves gas as default is 0
    while (i < length) {
      IERC20 token = IERC20(_tokenAddresses[i]);

      uint256 balance = token.balanceOf(_targetAddress);
      returnData[i] = balance;

      unchecked {
        ++i;
      }
    }
    returnData[i] = _targetAddress.balance;

    // encode return data
    bytes memory data = abi.encode(returnData);

    // force constructor return via assembly
    assembly {
      // Return from the start of the data (discarding the original data address)
      // up to the end of the memory used
      let dataStart := add(data, 32) // abi.encode adds an additional offset
      return(dataStart, sub(msize(), dataStart))
    }
  }
}
