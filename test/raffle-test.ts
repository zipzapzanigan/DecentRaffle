import { ethers, deployments } from "hardhat";
import { Contract, Signer } from "ethers";
import { expect } from "chai";
import { createRaffle } from "./create_raffle";
import { Deployment } from "hardhat-deploy/dist/types";
const RAFFLE_ADMIN = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("RAFFLE_ADMIN")
);
const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
describe("Testing Deployed Raffle Contract", () => {
  const ticketPrice = ethers.utils.parseEther(".00001");
  let raffleContract: Contract;
  let RaffleDeployment: Deployment;
  let deployer: Signer;
  let accounts: Signer[];
  const winnerCount = 3;

  before("resetting contract interface", async () => {
    [deployer, ...accounts] = await ethers.getSigners();
    RaffleDeployment = await deployments.get("Raffler");
    raffleContract = new ethers.Contract(
      RaffleDeployment.address,
      RaffleDeployment.abi,
      deployer
    );
  });

  it("Deploying address should have all roles by default", async function () {
    const deployerAddress = await deployer.getAddress();
    expect(
      await raffleContract.hasRole(RAFFLE_ADMIN, deployerAddress)
    ).to.equal(true);
    expect(
      await raffleContract.hasRole(DEFAULT_ADMIN_ROLE, deployerAddress)
    ).to.equal(true);
  });

  it("Other addresses should not have any roles by default", async function () {
    for (const account of accounts) {
      const address = await account.getAddress();
      expect(await raffleContract.hasRole(RAFFLE_ADMIN, address)).to.equal(
        false
      );
      expect(
        await raffleContract.hasRole(DEFAULT_ADMIN_ROLE, address)
      ).to.equal(false);
    }
  });

  it("Deployer can grant and revoke roles", async () => {
    // granting and revoking roles sometimes needs extra time to complete if the network is slow
    const address = await accounts[1].getAddress();
    let result = true;
    while (result) {
      await raffleContract.revokeRole(RAFFLE_ADMIN, address);
      // await new Promise((resolve) => setTimeout(resolve, 100));
      result = await raffleContract.hasRole(RAFFLE_ADMIN, address);
    }
    expect(result).to.equal(false);
    console.log("\trole RAFFLE_ADMIN revoked", result);
    await raffleContract.grantRole(RAFFLE_ADMIN, address);
    while (!result) {
      result = await raffleContract.hasRole(RAFFLE_ADMIN, address);
      // await new Promise((resolve) => setTimeout(resolve, 100));
    }
    console.log("\trole RAFFLE_ADMIN granted", result);
    expect(result).to.equal(true);
    await raffleContract.revokeRole(RAFFLE_ADMIN, address);
    while (result) {
      result = await raffleContract.hasRole(RAFFLE_ADMIN, address);
      // await new Promise((resolve) => setTimeout(resolve, 100));
    }
    console.log("\trole RAFFLE_ADMIN revoked", result);
    expect(result).to.equal(false);
  });

  it("Non authorized accounts cannot create a new raffle", async () => {
    const unauthorizedRaffleContract = new ethers.Contract(
      RaffleDeployment.address,
      RaffleDeployment.abi,
      accounts[2]
    );
    try {
      await createRaffle(
        unauthorizedRaffleContract,
        ticketPrice,
        "unauthorized raffle",
        winnerCount
      );
    } catch (result: any) {
      const errorstring = result.error.toString();
      expect(
        errorstring.startsWith("ProviderError: execution reverted:")
      ).to.equal(true);
    }
  });

  it("Deployer is authorized to create a new raffle with correct id", async () => {
    // check if raffle id is 1 more after creating raffle compared to before
    const initialRaffleCount = (
      await raffleContract.getAccountRaffles(deployer.getAddress())
    ).length;
    const raffle = await createRaffle(
      raffleContract,
      ticketPrice,
      "test raffle",
      winnerCount
    );
    expect(raffle.id.toNumber()).to.equal(initialRaffleCount + 1);
    expect(await raffleContract.getRaffleOpen(raffle.id)).to.equal(true);
  });

  it("Can enter raffle 3 times each with 10 accounts", async () => {
    const [deployer, ...accounts] = await ethers.getSigners();
    const raffles = await raffleContract.getAccountRaffles(
      await deployer.getAddress()
    );
    const raffle = raffles[raffles.length - 1]; // get the ID of the last raffle
    const ticketCount = 3;
    const accountCount = 10;
    await Promise.all(
      accounts.slice(0, accountCount).map(async (account) => {
        const tx = await raffleContract
          .connect(account)
          .enter(raffle.id, ticketCount, {
            value: ticketPrice.mul(ticketCount),
          });
        return tx.wait();
      })
    ).then(async () => {
      // console.log(results);
      const entries = await raffleContract.getEntries(raffle.id);
      expect(entries.length).to.equal(ticketCount * accountCount);
    });
  });

  it("Unauthorized accounts cannot close the last raffle", async () => {
    const unauthorizedRaffleContract = new ethers.Contract(
      RaffleDeployment.address,
      RaffleDeployment.abi,
      accounts[2]
    );
    const raffles = await unauthorizedRaffleContract.getAccountRaffles(
      await deployer.getAddress()
    );
    const raffle = raffles[raffles.length - 1]; // get the last raffle

    // expect(await raffleContract.getRaffleOpen(raffle.id)).to.equal(true);
    try {
      const tx = await unauthorizedRaffleContract.close(raffle.id, {
        value: ethers.utils.parseEther(".001"),
      });
      await tx.wait();
    } catch (result: any) {
      expect(
        result.error.toString().startsWith("ProviderError: execution reverted")
      ).to.equal(true);
    }
  });

  it("Authorized accounts can close the last raffle", async () => {
    const raffles = await raffleContract.getAccountRaffles(
      await deployer.getAddress()
    );
    const raffle = raffles[raffles.length - 1]; // get the last raffle

    expect(await raffleContract.getRaffleOpen(raffle.id)).to.equal(true);
    const tx = await raffleContract.close(raffle.id, {
      value: ethers.utils.parseEther(".001"),
    });
    await tx.wait();
    expect(await raffleContract.getRaffleOpen(raffle.id)).to.equal(false);
  });

  it("Anyone can check the winners", async () => {
    let raffles = await raffleContract.getAccountRaffles(deployer.getAddress());
    let raffle = raffles[raffles.length - 1]; // get the last raffle
    let airnodeReplied = false;
    console.log("\tawaiting airnode reply (may take up to 90s)");

    while (!airnodeReplied) {
      raffles = await raffleContract.getAccountRaffles(deployer.getAddress());
      raffle = raffles[raffles.length - 1]; // get the last raffle
      airnodeReplied = await raffle.airnodeSuccess;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const winners = await raffleContract.getWinners(raffle.id);
    console.log(winners);
    expect(winners.length).to.equal(5);
  });
});
