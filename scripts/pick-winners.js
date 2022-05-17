// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const { getRaffleContract, getRRPContract } = require("./utils");

async function main() {
  const rafflerContract = await getRaffleContract();
  const airnodeRrp = await getRRPContract();
  const { raffleId } = require("../deployed-raffle.json");
  const receipt = await rafflerContract.close(raffleId, {
    value: ethers.utils.parseEther(".001"),
  });
  const requestId = await new Promise(resolve =>
    ethers.provider.once(receipt.hash, tx => {
      const parsedLog = airnodeRrp.interface.parseLog(tx.logs[0]);
      resolve(parsedLog.args.requestId);
    })
  );
  console.log(`Request ID: ${requestId}`);
  console.log(`Waiting for request to be processed...`);
  await new Promise(resolve =>
    ethers.provider.once(
      airnodeRrp.filters.FulfilledRequest(null, requestId),
      resolve
    )
  );

  console.log("Winners Picked!");
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
