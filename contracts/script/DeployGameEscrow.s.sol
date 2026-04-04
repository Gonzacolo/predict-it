// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "../GameEscrow.sol";

interface Vm {
    function envAddress(string calldata name) external returns (address);
    function envUint(string calldata name) external returns (uint256);
    function startBroadcast() external;
    function stopBroadcast() external;
}

contract DeployGameEscrowScript {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function run() external returns (GameEscrow escrow) {
        address usdcAddress = vm.envAddress("GAME_USDC_ADDRESS");
        address owner = vm.envAddress("GAME_ESCROW_OWNER");
        uint16 houseFeeBps = uint16(vm.envUint("GAME_HOUSE_FEE_BPS"));

        vm.startBroadcast();
        escrow = new GameEscrow(usdcAddress, owner, houseFeeBps);
        vm.stopBroadcast();
    }
}
