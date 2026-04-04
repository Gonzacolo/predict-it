// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "../GameEscrow.sol";

interface IERC20Approve {
    function approve(address spender, uint256 value) external returns (bool);
}

interface Vm {
    function envAddress(string calldata name) external returns (address);
    function envBool(string calldata name) external returns (bool);
    function envUint(string calldata name) external returns (uint256);
    function startBroadcast() external;
    function stopBroadcast() external;
}

contract ConfigureGameEscrowScript {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function run() external {
        GameEscrow escrow = GameEscrow(vm.envAddress("GAME_ESCROW_ADDRESS"));
        address usdcAddress = vm.envAddress("GAME_USDC_ADDRESS");
        uint256 bankrollAmount = vm.envUint("GAME_BANKROLL_AMOUNT");
        uint256 clipId = vm.envUint("GAME_DEFAULT_CLIP_ID");
        bool clipEnabled = vm.envBool("GAME_DEFAULT_CLIP_ENABLED");
        uint8 resultDirection = uint8(vm.envUint("GAME_DEFAULT_CLIP_DIRECTION"));
        uint8 resultOutcome = uint8(vm.envUint("GAME_DEFAULT_CLIP_OUTCOME"));

        vm.startBroadcast();

        if (bankrollAmount > 0) {
            IERC20Approve(usdcAddress).approve(address(escrow), bankrollAmount);
            escrow.fundBankroll(bankrollAmount);
        }

        escrow.setClip(clipId, clipEnabled, resultDirection, resultOutcome);
        vm.stopBroadcast();
    }
}
