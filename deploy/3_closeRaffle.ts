import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import apis from "../data/apis.json";
// eslint-disable-next-line node/no-unpublished-import
import { deriveSponsorWalletAddress } from "@api3/airnode-admin";

const closeRaffle: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const [owner] = await ethers.getSigners();
  const raffleDeployment = await hre.deployments.get("Raffler");
  const raffleContract = new ethers.Contract(
    raffleDeployment.address,
    raffleDeployment.abi,
    owner
  );

  const raffle = await raffleContract.getAccountRaffles(owner.getAddress());
  const raffleId = raffle[0].id;
  // console.log("raffle is: ", raffle);
  // console.log("rafflid is: ", raffleId);
  // close raffle - raffle contract handles airnode requests
  const receipt = await raffleContract.close(raffleId.toNumber());
  console.log(receipt);
  console.log("closing raffle", raffleId.toString());
  await new Promise<void>((resolve) =>
    ethers.provider.once(receipt.hash, () => {
      resolve();
    })
  );
  console.log("Request parameters set");
};

export default closeRaffle;

module.exports.tags = ["setup"];
