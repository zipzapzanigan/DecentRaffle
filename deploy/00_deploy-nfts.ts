import { ethers, getChainId, deployments } from "hardhat";
import { AirnodeRrpAddresses, AirnodeRrpV0Factory } from "@api3/airnode-protocol";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
// eslint-disable-next-line node/no-unpublished-import
import * as airnodeAdmin from "@api3/airnode-admin";
import apis from "../data/apis.json";

export const deployNFTs: DeployFunction = async (
  hre: HardhatRuntimeEnvironment
) => {
  const chainId = parseInt(await getChainId());

  const _name = 'BuffBees';
  const _symbol = 'BFB';
  const Factory = await ethers.getContractFactory("BuffBees");
  const contract = await Factory.deploy(_airnodeRrp, _name, _symbol);
  await contract.deployed();

  console.log("BuffBees deployed to:", contract.address);

};

module.exports = deployNFTs;
module.exports.tags = ["nft"];
