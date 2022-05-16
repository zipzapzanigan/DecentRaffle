// SPDX-License-Identifier: UNLICENSED
/*
   ___  ___ _  _  ___ 
  / _ \| _ \ \| |/ __|
 | (_) |   / .` | (_ |
  \__\_\_|_\_|\_|\___|
                      
*/
/// @title Raffle Contract as PoC for using QRNGs
/// @notice This contract is not secure. Do not use it in production. Refer to
/// the contract for more information.
/// @dev See README.md for more information.
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@api3/airnode-protocol/contracts/rrp/requesters/RrpRequesterV0.sol";

contract Raffler is RrpRequesterV0 {
    using Counters for Counters.Counter;
    Counters.Counter private _ids;

    event RaffleCreated(uint256 _raffleId);

    mapping(uint256 => Raffle) public raffles;
    mapping(address => uint256[]) public accountRaffles;

    // To store pending Airnode requests
    mapping(bytes32 => bool) public pendingRequestIds;
    mapping(bytes32 => uint256) private requestIdToRaffleId;

    // These variables can also be declared as `constant`/`immutable`.
    // However, this would mean that they would not be updatable.
    // Since it is impossible to ensure that a particular Airnode will be
    // indefinitely available, you are recommended to always implement a way
    // to update these parameters.
    address public airnodeRrpAddress;
    address public sponsor;
    address public sponsorWallet;
    address public ANUairnodeAddress =
        0x9d3C147cA16DB954873A498e0af5852AB39139f2;
    bytes32 public endpointId =
        0x27cc2713e7f968e4e86ed274a051a5c8aaee9cca66946f23af6f29ecea9704c3;

    struct Raffle {
        uint256 id;
        string title;
        uint256 price;
        uint256 winnerCount;
        address[] winners;
        address[] entries;
        bool open;
        uint256 startTime;
        uint256 endTime;
        uint256 balance;
        address owner;
        bool airnodeSuccess;
    }

    /// @param _airnodeRrpAddress Airnode RRP contract address (https://docs.api3.org/airnode/v0.6/reference/airnode-addresses.html)
    /// @param _sponsorWallet Sponsor Wallet address (https://docs.api3.org/airnode/v0.6/concepts/sponsor.html#derive-a-sponsor-wallet)
    constructor(address _airnodeRrpAddress, address _sponsorWallet)
        RrpRequesterV0(_airnodeRrpAddress)
    {
        airnodeRrpAddress = _airnodeRrpAddress;
        sponsorWallet = _sponsorWallet;
        sponsor = msg.sender;
    }

    /// @notice Create a new raffle
    /// @param _price The price to enter the raffle
    /// @param _winnerCount The number of winners to be selected
    function create(
        uint256 _price,
        uint16 _winnerCount,
        string memory _title,
        uint256 _startTime,
        uint256 _endTime
    ) public {
        require(_winnerCount > 0, "Winner count must be greater than 0");
        _ids.increment();
        Raffle memory raffle = Raffle(
            _ids.current(),
            _title,
            _price,
            _winnerCount,
            new address[](0),
            new address[](0),
            true,
            _startTime,
            _endTime,
            0,
            msg.sender,
            false
        );
        raffles[raffle.id] = raffle;
        accountRaffles[msg.sender].push(raffle.id);
        emit RaffleCreated(raffle.id);
    }

    /// @notice Enter a raffle
    /// @dev To enter more than one entry, send the price * entryCount in
    /// the transaction.
    /// @param _raffleId The raffle id to enter
    /// @param entryCount The number of entries to enter
    function enter(uint256 _raffleId, uint256 entryCount) public payable {
        Raffle storage raffle = raffles[_raffleId];
        require(raffle.open, "Raffle is closed");
        require(entryCount >= 1, "Entry count must be at least 1");
        require(
            block.timestamp >= raffle.startTime &&
                block.timestamp <= raffle.endTime,
            "Raffle is closed"
        );
        require(
            msg.value == raffle.price * entryCount,
            "Entry price does not match"
        );
        raffle.balance += msg.value;
        for (uint256 i = 0; i < entryCount; i++) {
            raffle.entries.push(msg.sender);
        }
    }

    /// @notice Close a raffle
    /// @dev Called by the raffle owner when the raffle is over.
    /// This function will close the raffle to new entries and will
    /// call Airnode for randomness.
    /// @dev send at least .001 ether to fund the sponsor wallet
    /// @param _raffleId The raffle id to close
    function close(uint256 _raffleId) public payable {
        Raffle storage raffle = raffles[_raffleId];
        require(
            msg.sender == raffle.owner,
            "Only raffle owner can pick winners"
        );
        require(raffle.open, "Raffle is closed");

        // Top up the Sponsor Wallet
        require(
            msg.value >= .001 ether,
            "Please send some funds to the sponsor wallet"
        );
        payable(sponsorWallet).transfer(msg.value);

        if (raffle.entries.length == 0) {
            raffle.open = false;
            return;
        }
        require(
            raffle.entries.length >= raffle.winnerCount,
            "Not enough entries"
        );

        bytes32 requestId = airnodeRrp.makeFullRequest(
            ANUairnodeAddress,
            endpointId,
            sponsor,
            sponsorWallet,
            address(this),
            this.pickWinners.selector,
            abi.encode(bytes32("1u"), bytes32("size"), raffle.winnerCount)
        );
        pendingRequestIds[requestId] = true;
        requestIdToRaffleId[requestId] = _raffleId;
        raffle.open = false;
    }

    /// @notice Randomness returned by Airnode is used to choose winners
    /// @dev Only callable by Airnode.
    function pickWinners(bytes32 requestId, bytes calldata data)
        external
        onlyAirnodeRrp
    {
        require(pendingRequestIds[requestId], "No such request made");
        delete pendingRequestIds[requestId];
        Raffle storage raffle = raffles[requestIdToRaffleId[requestId]];
        require(!raffle.airnodeSuccess, "Winners already picked");

        uint256[] memory randomNumbers = abi.decode(data, (uint256[])); // array of random numbers returned by Airnode
        for (uint256 i = 0; i < randomNumbers.length; i++) {
            uint256 winnerIndex = randomNumbers[i] % raffle.entries.length;
            raffle.winners.push(raffle.entries[winnerIndex]);
            delete raffle.entries[winnerIndex];
        }
        raffle.airnodeSuccess = true;
        payable(raffle.owner).transfer(raffle.balance);
    }

    /// @notice Get the raffle entries
    /// @param _raffleId The raffle id to get the entries of
    function getEntries(uint256 _raffleId)
        public
        view
        returns (address[] memory)
    {
        return raffles[_raffleId].entries;
    }

    /// @notice Get the raffle winners
    /// @param _raffleId The raffle id to get the winners of
    function getWinners(uint256 _raffleId)
        public
        view
        returns (address[] memory)
    {
        return raffles[_raffleId].winners;
    }

    function isWinner(uint256 _raffleId, address _address)
        public
        view
        returns (bool)
    {
        for (uint256 i = 0; i < raffles[_raffleId].winners.length; i++) {
            if (raffles[_raffleId].winners[i] == _address) {
                return true;
            }
        }
        return false;
    }

    function getAccountRaffles(address _account)
        public
        view
        returns (uint256[] memory)
    {
        return accountRaffles[_account];
    }
}
