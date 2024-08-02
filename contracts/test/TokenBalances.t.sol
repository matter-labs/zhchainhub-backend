// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.0;

import {TokenBalances} from 'contracts/TokenBalances.sol';
import {Test} from 'forge-std/Test.sol';
import {IERC20} from 'interfaces/IERC20.sol';

contract TokenBalancesTest is Test {
  address internal _target = makeAddr('target');
  IERC20 internal _tokenA = IERC20(makeAddr('tokenA'));
  IERC20 internal _tokenB = IERC20(makeAddr('tokenB'));
  uint256 internal _initialBalanceA = 100;
  uint256 internal _initialBalanceB = 200;
  address internal _deploymentAddress;
  address[] internal _emptyArray;

  function setUp() public {
    //based on the CREATE2 opcode's address derivation formula and Claude-AI chatting
    _deploymentAddress =
      address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xd6), bytes1(0x94), address(this), bytes1(0x01))))));
  }

  function test_fetchingTokenData() public {
    vm.deal(_target, 10 ether);
    vm.mockCall(address(_tokenA), abi.encodeWithSelector(IERC20.balanceOf.selector), abi.encode(_initialBalanceA));
    vm.mockCall(address(_tokenB), abi.encodeWithSelector(IERC20.balanceOf.selector), abi.encode(_initialBalanceB));
    address[] memory tokenAddresses = new address[](2);
    tokenAddresses[0] = address(_tokenA);
    tokenAddresses[1] = address(_tokenB);

    bytes memory creationCode = _getBytecode(_target, tokenAddresses);

    // We're using vm.etch to place the creation code at a deterministic address.
    vm.etch(_deploymentAddress, creationCode);

    // simulate deployment
    (bool success, bytes memory result) = _deploymentAddress.call('');

    require(success, 'Deployment simulation failed');

    uint256[] memory balances = abi.decode(result, (uint256[]));

    assertEq(balances.length, 3, 'Incorrect number of balances returned');
    assertEq(balances[0], _initialBalanceA, 'Incorrect balance for tokenA');
    assertEq(balances[1], _initialBalanceB, 'Incorrect balance for tokenB');
    assertEq(balances[2], 10 ether, 'Incorrect ether balance');
  }

  function test_fetchingEmptyTokenArray() public {
    vm.deal(_target, 10 ether);

    bytes memory creationCode = _getBytecode(_target, _emptyArray);

    // We're using vm.etch to place the creation code at a deterministic address.
    vm.etch(_deploymentAddress, creationCode);

    // simulate deployment
    (bool success, bytes memory result) = _deploymentAddress.call('');

    require(success, 'Deployment simulation failed');

    uint256[] memory balances = abi.decode(result, (uint256[]));

    assertEq(balances.length, 1, 'Incorrect number of balances returned');
    assertEq(balances[0], 10 ether, 'Incorrect ether balance');
  }

  function test_revertWithNonERC20Token() public {
    address nonERC20 = address(0x123); // Some address that's not an ERC20 token

    address[] memory tokenAddresses = new address[](3);
    tokenAddresses[0] = address(_tokenA);
    tokenAddresses[1] = nonERC20;
    tokenAddresses[2] = address(_tokenB);

    // Mock calls for valid ERC20 tokens
    vm.mockCall(
      address(_tokenA), abi.encodeWithSelector(IERC20.balanceOf.selector, _target), abi.encode(_initialBalanceA)
    );
    vm.mockCall(
      address(_tokenB), abi.encodeWithSelector(IERC20.balanceOf.selector, _target), abi.encode(_initialBalanceB)
    );

    bytes memory creationCode = _getBytecode(_target, _emptyArray);

    // We're using vm.etch to place the creation code at a deterministic address.
    vm.etch(_deploymentAddress, creationCode);

    // Expect the call to revert
    vm.expectRevert();
    (bool success,) = _deploymentAddress.call('');

    require(!success, 'Deployment should have reverted');
  }

  function _getBytecode(address target, address[] memory _tokenAddresses) internal pure returns (bytes memory) {
    bytes memory bytecode = abi.encodePacked(type(TokenBalances).creationCode);
    return abi.encodePacked(bytecode, abi.encode(target, _tokenAddresses));
  }
}
