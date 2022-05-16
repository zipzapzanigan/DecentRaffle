//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./Raffle.sol";

contract ExclusiveMint is ERC721Enumerable {
    Raffler private raffler;
    uint256 public raffleId;

    constructor(address _rafflerContract, uint256 _raffleId)
        ERC721("Exclusive", "AP")
    {
        raffler = Raffler(_rafflerContract);
        raffleId = _raffleId;
    }

    function mint() public payable {
        require(raffler.isWinner(raffleId, msg.sender), "You are not a winner");
        uint256 tokenId = totalSupply() + 1;
        _safeMint(msg.sender, tokenId);
    }
}
