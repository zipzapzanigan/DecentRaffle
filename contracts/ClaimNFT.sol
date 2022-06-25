//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Raffle.sol";

contract ClaimNFT is ERC721, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    Raffler private raffler;
    uint256 public raffleId;

    // each token has its own level, which changes the number of raffle tickets they can claim
    uint256 public constant maxLevel = 5;
    // each level has a different weight, with higher levels providing more tickets per raffle
    uint256[] public levelWeights = [1, 1, 1, 2, 3];

    mapping(uint256 => uint256) _tokenLevels;
    mapping(address => uint256) _levelBalances;

    constructor(address _rafflerContract, uint256 _raffleId)
        ERC721("ClaimNFT", "CLM")
    {
        raffler = Raffler(_rafflerContract);
        raffleId = _raffleId;
    }
    
    /**
     * @dev Return the balance of levels from all NFTs that the owner holds
     */
    function getLevelsBalance(address account) public view returns (uint256) {
        return _levelBalances[account];
    }

    // terribly predictable random for example only
    function random() private view returns (uint8) {
        return
            uint8(
                uint256(
                    keccak256(
                        abi.encodePacked(block.timestamp + block.difficulty)
                    )
                ) % 251
            );
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _tokenLevels[tokenId] = random() % maxLevel;
        _levelBalances[to] += levelWeights[_tokenLevels[tokenId]];
        _safeMint(to, tokenId);
    }

    /**
     * @dev Overriding {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        for (uint8 i = 0; i < _tokenLevels[tokenId]; i++) {
            _levelBalances[from] -= levelWeights[i];
            _levelBalances[to] += levelWeights[i];
        }
        safeTransferFrom(from, to, tokenId, "");
    }

}
