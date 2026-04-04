// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract GameEscrow {
    error Unauthorized();
    error InvalidAmount();
    error InvalidHouseFeeBps();
    error InvalidDirection();
    error InvalidOutcome();
    error InvalidRecipient();
    error ContractPaused();
    error UnknownClip();
    error ClipDisabled();
    error InsolventBankroll();
    error TicketNotActive();
    error TicketNotSettled();
    error TicketAlreadyClaimed();
    error NotTicketOwner();
    error TransferFailed();

    enum Direction {
        Left,
        Right
    }

    enum Outcome {
        Goal,
        Miss
    }

    enum TicketStatus {
        None,
        Active,
        Settled,
        Claimed
    }

    struct ClipConfig {
        bool enabled;
        uint8 resultDirection;
        uint8 resultOutcome;
    }

    struct Ticket {
        address player;
        uint256 clipId;
        uint256 amount;
        uint8 direction;
        uint8 outcome;
        TicketStatus status;
        uint256 payout;
        bool claimed;
    }

    uint256 public constant PRICE_SCALE = 1_000_000;
    uint256 public constant LEFT_PRICE = 380_000;
    uint256 public constant RIGHT_PRICE = 620_000;
    uint256 public constant GOAL_PRICE = 780_000;
    uint256 public constant MISS_PRICE = 220_000;
    uint256 public constant WAGER_1 = 1_000_000;
    uint256 public constant WAGER_10 = 10_000_000;
    uint256 public constant WAGER_25 = 25_000_000;

    IERC20 public immutable usdc;
    address public owner;
    uint16 public houseFeeBps;
    uint256 public bankroll;
    uint256 public reservedBankroll;
    uint256 public nextTicketId = 1;
    bool public paused;

    mapping(uint256 => ClipConfig) private clips;
    mapping(uint256 => bool) private clipConfigured;
    mapping(uint256 => Ticket) private tickets;
    mapping(uint256 => uint256) private ticketReservedBankroll;

    event BankrollFunded(address indexed caller, uint256 amount, uint256 bankroll);
    event BankrollWithdrawn(address indexed caller, address indexed to, uint256 amount, uint256 bankroll);
    event ClipSet(uint256 indexed clipId, bool enabled, uint8 resultDirection, uint8 resultOutcome);
    event HouseFeeUpdated(uint16 previousFeeBps, uint16 nextFeeBps);
    event Paused(address indexed caller);
    event Unpaused(address indexed caller);
    event TicketCreated(
        uint256 indexed ticketId,
        address indexed player,
        uint256 indexed clipId,
        uint256 amount,
        uint8 direction,
        uint8 outcome,
        uint256 payout
    );
    event TicketSettled(uint256 indexed ticketId, address indexed player, uint256 payout);
    event TicketClaimed(
        uint256 indexed ticketId,
        address indexed player,
        address indexed recipient,
        uint256 payout
    );

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    constructor(address usdcAddress, address initialOwner, uint16 initialHouseFeeBps) {
        if (usdcAddress == address(0) || initialOwner == address(0)) {
            revert InvalidRecipient();
        }
        if (initialHouseFeeBps > 10_000) revert InvalidHouseFeeBps();

        usdc = IERC20(usdcAddress);
        owner = initialOwner;
        houseFeeBps = initialHouseFeeBps;
    }

    function fundBankroll(uint256 amount) external onlyOwner whenNotPaused {
        if (amount == 0) revert InvalidAmount();
        _safeTransferFrom(msg.sender, address(this), amount);
        bankroll += amount;
        emit BankrollFunded(msg.sender, amount, bankroll);
    }

    function withdrawBankroll(uint256 amount, address to) external onlyOwner whenNotPaused {
        if (to == address(0)) revert InvalidRecipient();
        if (amount == 0) revert InvalidAmount();
        if (amount > availableBankroll()) revert InsolventBankroll();

        bankroll -= amount;
        _safeTransfer(to, amount);
        emit BankrollWithdrawn(msg.sender, to, amount, bankroll);
    }

    function setClip(
        uint256 clipId,
        bool enabled,
        uint8 resultDirection,
        uint8 resultOutcome
    ) external onlyOwner {
        _validateDirection(resultDirection);
        _validateOutcome(resultOutcome);

        clips[clipId] = ClipConfig({
            enabled: enabled,
            resultDirection: resultDirection,
            resultOutcome: resultOutcome
        });
        clipConfigured[clipId] = true;

        emit ClipSet(clipId, enabled, resultDirection, resultOutcome);
    }

    function setHouseFeeBps(uint16 bps) external onlyOwner {
        if (bps > 10_000) revert InvalidHouseFeeBps();

        uint16 previous = houseFeeBps;
        houseFeeBps = bps;
        emit HouseFeeUpdated(previous, bps);
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    function play(
        uint256 clipId,
        uint256 amount,
        uint8 direction,
        uint8 outcome
    ) external whenNotPaused returns (uint256 ticketId) {
        if (!_isSupportedWager(amount)) revert InvalidAmount();
        _validateDirection(direction);
        _validateOutcome(outcome);

        ClipConfig memory clip = _getPlayableClip(clipId);
        uint256 payout = _quotePayout(amount, direction, outcome, clip);
        uint256 bankrollReservation = payout > amount ? payout - amount : 0;

        if (bankrollReservation > availableBankroll()) revert InsolventBankroll();

        _safeTransferFrom(msg.sender, address(this), amount);

        ticketId = nextTicketId++;
        tickets[ticketId] = Ticket({
            player: msg.sender,
            clipId: clipId,
            amount: amount,
            direction: direction,
            outcome: outcome,
            status: TicketStatus.Active,
            payout: payout,
            claimed: false
        });
        ticketReservedBankroll[ticketId] = bankrollReservation;
        reservedBankroll += bankrollReservation;

        emit TicketCreated(ticketId, msg.sender, clipId, amount, direction, outcome, payout);
    }

    function settle(uint256 ticketId) external onlyOwner whenNotPaused {
        Ticket storage ticket = tickets[ticketId];
        if (ticket.status != TicketStatus.Active) revert TicketNotActive();

        ticket.status = TicketStatus.Settled;

        if (ticket.payout == 0) {
            reservedBankroll -= ticketReservedBankroll[ticketId];
            ticketReservedBankroll[ticketId] = 0;
            bankroll += ticket.amount;
        }

        emit TicketSettled(ticketId, ticket.player, ticket.payout);
    }

    function claimTo(uint256 ticketId, address recipient) external whenNotPaused {
        if (recipient == address(0)) revert InvalidRecipient();

        Ticket storage ticket = tickets[ticketId];
        if (ticket.player != msg.sender) revert NotTicketOwner();
        if (ticket.claimed) revert TicketAlreadyClaimed();
        if (ticket.status != TicketStatus.Settled) revert TicketNotSettled();
        if (ticket.payout == 0) revert TicketNotSettled();

        uint256 bankrollReservation = ticketReservedBankroll[ticketId];
        reservedBankroll -= bankrollReservation;
        ticketReservedBankroll[ticketId] = 0;

        ticket.claimed = true;
        ticket.status = TicketStatus.Claimed;
        bankroll = bankroll + ticket.amount - ticket.payout;

        _safeTransfer(recipient, ticket.payout);

        emit TicketClaimed(ticketId, ticket.player, recipient, ticket.payout);
    }

    function quotePayout(
        uint256 amount,
        uint8 direction,
        uint8 outcome,
        uint256 clipId
    ) external view returns (uint256) {
        _validateDirection(direction);
        _validateOutcome(outcome);
        if (!clipConfigured[clipId]) revert UnknownClip();

        return _quotePayout(amount, direction, outcome, clips[clipId]);
    }

    function getTicket(uint256 ticketId) external view returns (Ticket memory) {
        return tickets[ticketId];
    }

    function getClip(uint256 clipId) external view returns (ClipConfig memory) {
        return clips[clipId];
    }

    function canClaim(uint256 ticketId) external view returns (bool) {
        Ticket memory ticket = tickets[ticketId];
        return ticket.status == TicketStatus.Settled && ticket.payout > 0 && !ticket.claimed;
    }

    function availableBankroll() public view returns (uint256) {
        return bankroll - reservedBankroll;
    }

    function getTicketReservedBankroll(uint256 ticketId) external view returns (uint256) {
        return ticketReservedBankroll[ticketId];
    }

    function _quotePayout(
        uint256 amount,
        uint8 direction,
        uint8 outcome,
        ClipConfig memory clip
    ) internal view returns (uint256) {
        uint256 directionBet = amount / 2;
        uint256 outcomeBet = amount - directionBet;
        uint256 gross;

        if (direction == clip.resultDirection) {
            gross += (directionBet * PRICE_SCALE) / _directionPrice(direction);
        }

        if (outcome == clip.resultOutcome) {
            gross += (outcomeBet * PRICE_SCALE) / _outcomePrice(outcome);
        }

        uint256 fee = (gross * houseFeeBps) / 10_000;
        return gross - fee;
    }

    function _getPlayableClip(uint256 clipId) internal view returns (ClipConfig memory clip) {
        if (!clipConfigured[clipId]) revert UnknownClip();

        clip = clips[clipId];
        if (!clip.enabled) revert ClipDisabled();
    }

    function _directionPrice(uint8 direction) internal pure returns (uint256) {
        return direction == uint8(Direction.Left) ? LEFT_PRICE : RIGHT_PRICE;
    }

    function _outcomePrice(uint8 outcome) internal pure returns (uint256) {
        return outcome == uint8(Outcome.Goal) ? GOAL_PRICE : MISS_PRICE;
    }

    function _validateDirection(uint8 direction) internal pure {
        if (direction > uint8(Direction.Right)) revert InvalidDirection();
    }

    function _validateOutcome(uint8 outcome) internal pure {
        if (outcome > uint8(Outcome.Miss)) revert InvalidOutcome();
    }

    function _isSupportedWager(uint256 amount) internal pure returns (bool) {
        return amount == WAGER_1 || amount == WAGER_10 || amount == WAGER_25;
    }

    function _safeTransfer(address to, uint256 amount) internal {
        bool ok = usdc.transfer(to, amount);
        if (!ok) revert TransferFailed();
    }

    function _safeTransferFrom(address from, address to, uint256 amount) internal {
        bool ok = usdc.transferFrom(from, to, amount);
        if (!ok) revert TransferFailed();
    }
}
