// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IClaimNFT is IERC721 {
    function getLevelsBalance(address account) external view returns (uint256 balance);
}