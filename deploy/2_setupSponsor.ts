import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import apis from "../data/apis.json";
// eslint-disable-next-line node/no-unpublished-import
import { deriveSponsorWalletAddress } from "@api3/airnode-admin";

const setupSponsorWallet: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  // code here
  // We are getting the AirnodeRrp address from @api3/airnode-protocol
  // Alternatively, you can get it from the docs
  // https://docs.api3.org/airnode/latest/reference/airnode-addresses.html
  const [owner] = await ethers.getSigners();
  const raffleDeployment = await hre.deployments.get("Raffler");
  const raffleContract = new ethers.Contract(
    raffleDeployment.address,
    raffleDeployment.abi,
    owner
  );
  const apiData = apis["ANU Quantum Random Numbers"];

  const sponsorWalletAddress = await deriveSponsorWalletAddress(
    apiData.xpub,
    apiData.airnode,
    raffleContract.address
  );
  // console.log(raffleContract);
  const amountInEther = ".001";
  const value = hre.ethers.utils.parseEther(amountInEther);

  const receipt = await owner.sendTransaction({
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
  await new Promise<void>((resolve) =>
    ethers.provider.once(receipt.hash, () => {
      resolve();
    })
  );
  console.log("Request parameters set");
};

export default setupSponsorWallet;

module.exports.tags = ["setup"];
