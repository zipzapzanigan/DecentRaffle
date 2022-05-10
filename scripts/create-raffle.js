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
  const createTx = await rafflerContract.create(
    ethers.utils.parseEther(".00001"),
    2
  );
  const rc = await createTx.wait();
  const [raffleId] = rc.events.find(
    event => event.event === "RaffleCreated"
  ).args;
  console.log(`Created Raffle (ID: ${raffleId})`);

  fs.writeFileSync(
    "deployed-raffle.json",
    JSON.stringify({
      raffleId: `${raffleId}`,
    })
  );
  console.log(
    `https://${ethers.provider.network.name}.etherscan.io/address/${rafflerContract.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
