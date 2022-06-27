import { ethers, deployments } from "hardhat";
import { Contract, Signer } from "ethers";
import { expect } from "chai";
import { createRaffle } from "./create_raffle";
import { Deployment } from "hardhat-deploy/dist/types";

describe("Testing Deployed NFT Contract", () => {
  const ticketPrice = ethers.utils.parseEther(".00001");
  let claimNFTContract: Contract;
  let ClaimNFTDeployment: Deployment;
  let deployer: Signer;
  let accounts: Signer[];

  before("resetting contract interface", async () => {
    [deployer, ...accounts] = await ethers.getSigners();
    ClaimNFTDeployment = await deployments.get("ClaimNFT");
    claimNFTContract = new ethers.Contract(
      ClaimNFTDeployment.address,
      ClaimNFTDeployment.abi,
      deployer
    );
    claimNFTContract.connect(deployer);
  });

  it("addresses can mint", async function () {
    const deployerAddress = await deployer.getAddress();

    for (let account in accounts){
      claimNFTContract.connect(account);
      const preBalance = await claimNFTContract.getLevelsBalance(account);
      claimNFTContract.safeMint(account);
    };
    expect(
      await claimNFTContract.hasRole(RAFFLE_ADMIN, deployerAddress)
    ).to.equal(true);
    expect(
      await claimNFTContract.hasRole(DEFAULT_ADMIN_ROLE, deployerAddress)
    ).to.equal(true);
  });

});
