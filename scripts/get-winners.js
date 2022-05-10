// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const fs = require("fs");
const { getRaffleContract, getRRPContract } = require("./utils");

async function main() {
  const rafflerContract = await getRaffleContract();
  const { raffleId } = require("../deployed-raffle.json");
  const raffle = await rafflerContract.raffles(raffleId);
  console.log(raffle);
  const winners = await rafflerContract.getWinners(raffleId);
  console.log({ winners });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
