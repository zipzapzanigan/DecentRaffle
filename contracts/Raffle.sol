// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Raffler {
    using Counters for Counters.Counter;
    Counters.Counter private _ids;

    mapping(uint256 => Raffle) public raffles;

    struct Raffle {
        uint256 id;
        uint256 price;
        address winner;
        address[] entries;
        bool open;
        uint256 balance;
        address owner;
    }

    constructor() {
        console.log("Deployed!");
    }

    function create(uint256 _price) public {
        _ids.increment();
        Raffle memory raffle = Raffle(
            _ids.current(),
            _price,
            address(0),
            new address[](0),
            true,
            0,
            msg.sender
        );
        raffles[raffle.id] = raffle;
    }

    function enter(uint256 _raffleId, uint256 entryCount) public payable {
        Raffle storage raffle = raffles[_raffleId];
        require(raffle.open, "Raffle is closed");
        require(entryCount >= 1, "Entry count must be at least 1");
        require(
            msg.value == raffle.price * entryCount,
            "Entry price does not match"
        );
        raffle.balance += msg.value;
        for (uint256 i = 0; i < entryCount; i++) {
            raffle.entries.push(msg.sender);
        }
    }

    function pickWinner(uint256 _raffleId, uint256 randomNumber) public {
        Raffle storage raffle = raffles[_raffleId];
        require(raffle.open, "Raffle is closed");
        require(raffle.entries.length > 0, "No entries");
        uint256 winnerIndex = randomNumber % raffle.entries.length;
        raffle.winner = raffle.entries[winnerIndex];
        raffle.open = false;
        // Transfer balance to owner
        payable(raffle.owner).transfer(raffle.balance);
    }

    function getEntriesLength(uint256 _raffleId) public view returns (uint256) {
        Raffle memory raffle = raffles[_raffleId];
        return raffle.entries.length;
    }
}
