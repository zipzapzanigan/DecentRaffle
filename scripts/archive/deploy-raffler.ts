// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

import { ethers } from "hardhat";
import { getSponsorWallet, sponsorRequester, verifyContract } from "./utils";
const fs = require("fs");
const { AirnodeRrpAddresses } = require("@api3/airnode-protocol");

async function main() {
  let { chainId } = await ethers.provider.getNetwork();
  if (chainId == 31337) chainId = 4;
  const Contract = await ethers.getContractFactory("Raffler");
  const sponsorWallet = await getSponsorWallet();

  console.log("Deploying...");
  const contract = await Contract.deploy(
    AirnodeRrpAddresses[chainId],
    sponsorWallet
  );
  await contract.deployed();
  console.log(`Deployed contract: ${contract.address}`);

  fs.writeFileSync(
    "deployed-contract.json",
    JSON.stringify({
      address: contract.address,
    })
  );

  await sponsorRequester(contract.address);
  console.log("Done! Wait a few minutes before verifying the contract.");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
