// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const fs = require("fs");
const { getRaffleContract } = require("./utils");

async function main() {
  const rafflerContract = await getRaffleContract();
  const { raffleId } = require("../deployed-raffle.json");
  const tx = await rafflerContract.enter(raffleId, 3, {
    value: ethers.utils.parseEther(".00003"),
  });
  await tx.wait();
  console.log("Entered Raffle");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
