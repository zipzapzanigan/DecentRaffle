// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat

import { Contract } from "ethers";
import fs from "fs";
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { getRaffleContract } from "./utils";
// eslint-disable-next-line node/no-missing-import
import { createRaffle } from "../raffle-tools";

async function main() {
  const raffleContract: Contract = await getRaffleContract();
  const ticketPrice = ethers.utils.parseEther(".00001");
  const raffleId = createRaffle(raffleContract, ticketPrice, "test raffle");
  console.log(`Created Raffle (ID: ${raffleId})`);

  fs.writeFileSync(
    "deployed-raffle.json",
    JSON.stringify({
      raffleId: `${raffleId}`,
    })
  );
  console.log(
    `https://${ethers.provider.network.name}.etherscan.io/address/${raffleContract.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
// main()
// eslint-disable-next-line no-process-exit
// .then(() => process.exit(0))
// .catch((error) => {
//   console.error(error);
//   // eslint-disable-next-line no-process-exit
//   process.exit(1);
// });
