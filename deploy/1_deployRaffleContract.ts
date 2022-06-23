import { ethers, getChainId, deployments } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { AirnodeRrpAddresses } from "@api3/airnode-protocol";
// import { fail } from "assert";
const deployRaffleContract: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  // We are getting the AirnodeRrp address from @api3/airnode-protocol
  // Alternatively, you can get it from the docs
  // https://docs.api3.org/airnode/latest/reference/airnode-addresses.html
  const chainId = await getChainId();
  const sponsorWallet = "0x8844CEF45EA0D410948B2c01753aAae8f86d0842";
  const [owner] = await ethers.getSigners();

  const rafflerContract = await deployments
    .deploy("Raffler", {
      args: [AirnodeRrpAddresses[parseInt(chainId)], sponsorWallet],
      from: await owner.getAddress(),
      log: true,
      skipIfAlreadyDeployed: true,
    })
    .catch((error) => {
      console.log("errrors: ", error);
    });
  if (rafflerContract === undefined) {
    return;
  }
  console.log(`Deployed rafflerContract at ${rafflerContract.address}`);

  await new Promise<void>((resolve) =>
    ethers.provider.once(rafflerContract.address, () => {
      resolve();
    })
  );
  console.log("Request parameters set");
};

export default deployRaffleContract;
module.exports.tags = ["deploy"];
