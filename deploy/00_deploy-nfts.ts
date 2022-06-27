import { ethers, deployments } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

export const deployNFTs: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const _name = "ClaimNFT";
  const _symbol = "CNFT";

  const [deployer] = await ethers.getSigners();

  await deployments
    .deploy("ClaimNFT", {
      from: await deployer.getAddress(),
      args: [],
      skipIfAlreadyDeployed: true,
      log: true,
    })
    .catch((error) => {
      console.log("errors: ", error);
    });

  const ClaimNFTDeployment = await deployments.get("ClaimNFT");
  const claimNFTContract = new ethers.Contract(
    ClaimNFTDeployment.address,
    ClaimNFTDeployment.abi,
    deployer
  );

  await claimNFTContract.connect(deployer);

  console.log(_name + "deployed to:", claimNFTContract.address);
};

module.exports = deployNFTs;
module.exports.tags = ["nft"];
