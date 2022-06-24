import { ethers, getChainId, deployments } from "hardhat";
import { AirnodeRrpAddresses, AirnodeRrpV0Factory } from "@api3/airnode-protocol";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
// eslint-disable-next-line node/no-unpublished-import
import * as airnodeAdmin from "@api3/airnode-admin";
import apis from "../data/apis.json";

export const deploy: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const chainId = parseInt(await getChainId());
  const [deployer] = await ethers.getSigners();

  await deployments
    .deploy("Raffler", {
      from: await deployer.getAddress(),
      args: [AirnodeRrpAddresses[chainId]],
      skipIfAlreadyDeployed: true,
      log: true,
    })
    .catch((error) => {
      console.log("errors: ", error);
    });

  const RaffleDeployment = await deployments.get("Raffler");
  const raffleContract = new ethers.Contract(
    RaffleDeployment.address,
    RaffleDeployment.abi,
    deployer
  );

  await raffleContract.connect(deployer);
  const apiData = apis["ANU Quantum Random Numbers"];
  const sponsorWalletAddress = await airnodeAdmin.deriveSponsorWalletAddress(
    apiData.xpub,
    apiData.airnode,
    await deployer.getAddress()
  );
  console.log("Sponsor Wallet Address: ", sponsorWalletAddress);

  const airnodeRrp = new ethers.Contract(
    AirnodeRrpAddresses[chainId],
    AirnodeRrpV0Factory.abi,
    deployer
  );
  const tx = await airnodeRrp.setSponsorshipStatus(
    RaffleDeployment.address,
    true
  );
  await tx.wait();

  const success = await raffleContract.setSponsorWallet(sponsorWalletAddress);
  console.log("sponsoring", sponsorWalletAddress, "success", success);

  const amountInEther = ".001";
  const value = ethers.utils.parseEther(amountInEther);
  const sponsorBalance = await ethers.provider.getBalance(sponsorWalletAddress);
  if (sponsorBalance < value) {
    const receipt = await deployer.sendTransaction({
      to: sponsorWalletAddress,
      value: value,
    });
    console.log(
      "sending ",
      value,
      " ether to sponsor wallet:",
      sponsorWalletAddress,
      await receipt.hash
    );
    console.log("Sponsor Wallet has been funded");
  } else {
    console.log(
      "sponsor wallet has sufficient balance:",
      // ethers.utils.parseEther(ethers.BigNumber.from(sponsorBalance)),
      ethers.utils.formatEther(sponsorBalance),
      "ether",
      sponsorWalletAddress
    );
  }
};

module.exports = deploy;
module.exports.tags = ["deploy"];
