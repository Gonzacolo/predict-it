// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "../GameEscrow.sol";
import "../MockUSDC.sol";

interface Vm {
    function prank(address msgSender) external;
    function startPrank(address msgSender) external;
    function stopPrank() external;
    function expectRevert(bytes4 revertData) external;
}

contract GameEscrowTest {
    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    uint256 private constant ONE_USDC = 1_000_000;
    uint256 private constant TEN_USDC = 10_000_000;
    uint256 private constant TWENTY_FIVE_USDC = 25_000_000;

    address private constant PLAYER = address(0xBEEF);
    address private constant OTHER = address(0xCAFE);
    address private constant RECIPIENT = address(0xD00D);

    MockUSDC private usdc;
    GameEscrow private escrow;

    function setUp() public {
        usdc = new MockUSDC();
        escrow = new GameEscrow(address(usdc), address(this), 500);

        usdc.mint(address(this), 1_000_000_000);
        usdc.mint(PLAYER, 100_000_000);
        usdc.mint(OTHER, 100_000_000);

        usdc.approve(address(escrow), type(uint256).max);

        vm.startPrank(PLAYER);
        usdc.approve(address(escrow), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(OTHER);
        usdc.approve(address(escrow), type(uint256).max);
        vm.stopPrank();

        escrow.fundBankroll(500_000_000);
        escrow.setClip(1, true, uint8(GameEscrow.Direction.Left), uint8(GameEscrow.Outcome.Goal));
        escrow.setClip(2, false, uint8(GameEscrow.Direction.Right), uint8(GameEscrow.Outcome.Miss));
    }

    function testPlaySettleAndClaimToArbitraryRecipient() public {
        uint256 quotedPayout = escrow.quotePayout(
            TEN_USDC,
            uint8(GameEscrow.Direction.Left),
            uint8(GameEscrow.Outcome.Goal),
            1
        );
        uint256 bankrollBeforeClaim = escrow.bankroll();
        uint256 ticketId =
            _playAs(PLAYER, 1, TEN_USDC, uint8(GameEscrow.Direction.Left), uint8(GameEscrow.Outcome.Goal));

        GameEscrow.Ticket memory activeTicket = escrow.getTicket(ticketId);
        _assertEq(uint256(activeTicket.status), uint256(GameEscrow.TicketStatus.Active), "ticket active");
        _assertEq(activeTicket.payout, quotedPayout, "stored payout");

        escrow.settle(ticketId);
        _assertTrue(escrow.canClaim(ticketId), "ticket claimable");

        vm.prank(PLAYER);
        escrow.claimTo(ticketId, RECIPIENT);

        GameEscrow.Ticket memory claimedTicket = escrow.getTicket(ticketId);
        _assertTrue(claimedTicket.claimed, "ticket claimed flag");
        _assertEq(uint256(claimedTicket.status), uint256(GameEscrow.TicketStatus.Claimed), "ticket claimed status");
        _assertEq(usdc.balanceOf(RECIPIENT), quotedPayout, "recipient payout");
        _assertEq(escrow.bankroll(), bankrollBeforeClaim + TEN_USDC - quotedPayout, "bankroll after claim");
    }

    function testSettleLossAddsStakeToBankroll() public {
        uint256 bankrollBefore = escrow.bankroll();
        uint256 ticketId = _playAs(
            PLAYER,
            1,
            ONE_USDC,
            uint8(GameEscrow.Direction.Right),
            uint8(GameEscrow.Outcome.Miss)
        );

        escrow.settle(ticketId);

        GameEscrow.Ticket memory ticket = escrow.getTicket(ticketId);
        _assertEq(ticket.payout, 0, "loss payout");
        _assertEq(uint256(ticket.status), uint256(GameEscrow.TicketStatus.Settled), "settled status");
        _assertEq(escrow.bankroll(), bankrollBefore + ONE_USDC, "stake absorbed into bankroll");
        _assertTrue(!escrow.canClaim(ticketId), "loss not claimable");
    }

    function testPlayRevertsWhenBankrollCannotCoverExtraLiability() public {
        GameEscrow lowLiquidityEscrow = new GameEscrow(address(usdc), address(this), 500);
        usdc.approve(address(lowLiquidityEscrow), type(uint256).max);
        lowLiquidityEscrow.fundBankroll(ONE_USDC);
        lowLiquidityEscrow.setClip(1, true, uint8(GameEscrow.Direction.Left), uint8(GameEscrow.Outcome.Goal));

        vm.prank(PLAYER);
        vm.expectRevert(GameEscrow.InsolventBankroll.selector);
        lowLiquidityEscrow.play(
            1,
            TWENTY_FIVE_USDC,
            uint8(GameEscrow.Direction.Left),
            uint8(GameEscrow.Outcome.Goal)
        );
    }

    function testClaimOnlyOwnerAndOnlyOnce() public {
        uint256 ticketId =
            _playAs(PLAYER, 1, TEN_USDC, uint8(GameEscrow.Direction.Left), uint8(GameEscrow.Outcome.Goal));
        escrow.settle(ticketId);

        vm.prank(OTHER);
        vm.expectRevert(GameEscrow.NotTicketOwner.selector);
        escrow.claimTo(ticketId, RECIPIENT);

        vm.prank(PLAYER);
        escrow.claimTo(ticketId, RECIPIENT);

        vm.prank(PLAYER);
        vm.expectRevert(GameEscrow.TicketAlreadyClaimed.selector);
        escrow.claimTo(ticketId, RECIPIENT);
    }

    function testAdminPermissions() public {
        vm.prank(PLAYER);
        vm.expectRevert(GameEscrow.Unauthorized.selector);
        escrow.setClip(3, true, uint8(GameEscrow.Direction.Left), uint8(GameEscrow.Outcome.Goal));

        vm.prank(PLAYER);
        vm.expectRevert(GameEscrow.Unauthorized.selector);
        escrow.fundBankroll(ONE_USDC);

        uint256 ticketId =
            _playAs(PLAYER, 1, ONE_USDC, uint8(GameEscrow.Direction.Left), uint8(GameEscrow.Outcome.Goal));

        vm.prank(PLAYER);
        vm.expectRevert(GameEscrow.Unauthorized.selector);
        escrow.settle(ticketId);

        vm.prank(PLAYER);
        vm.expectRevert(GameEscrow.Unauthorized.selector);
        escrow.withdrawBankroll(ONE_USDC, PLAYER);
    }

    function testPlayRevertsForUnsupportedOrDisabledClips() public {
        vm.prank(PLAYER);
        vm.expectRevert(GameEscrow.InvalidAmount.selector);
        escrow.play(1, 2 * ONE_USDC, uint8(GameEscrow.Direction.Left), uint8(GameEscrow.Outcome.Goal));

        vm.prank(PLAYER);
        vm.expectRevert(GameEscrow.ClipDisabled.selector);
        escrow.play(2, ONE_USDC, uint8(GameEscrow.Direction.Right), uint8(GameEscrow.Outcome.Miss));
    }

    function _playAs(
        address player,
        uint256 clipId,
        uint256 amount,
        uint8 direction,
        uint8 outcome
    ) internal returns (uint256 ticketId) {
        vm.prank(player);
        ticketId = escrow.play(clipId, amount, direction, outcome);
    }

    function _assertTrue(bool condition, string memory message) internal pure {
        require(condition, message);
    }

    function _assertEq(uint256 left, uint256 right, string memory message) internal pure {
        require(left == right, message);
    }
}
