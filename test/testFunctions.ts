import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { expect } from "chai";
import { createRaffle } from "../scripts/create_raffle";

export const testCreateRaffle = async (
  signer: Signer,
  raffleContract: Contract,
  ticketPrice: BigNumber
) => {
  it("Deployer can create a new raffle with correct id", async () => {
    // check if raffle id is 1 more after creating raffle compared to before
    const initialRaffleCount = (
      await raffleContract.getAccountRaffles(signer.getAddress())
    ).length;
    const raffle = await createRaffle(raffleContract, ticketPrice, "test raffle");
    expect(raffle.id.toNumber()).to.equal(initialRaffleCount + 1);
  });
};

export const testEnterRaffle = async (
  raffleContract: Contract,
  ticketPrice: BigNumber
) => {
  const [deployer, ...accounts] = await ethers.getSigners();
  const raffles = await raffleContract.getAccountRaffles(
    await deployer.getAddress()
  );
  const raffle = raffles[raffles.length - 1]; // get the ID of the last raffle
  const ticketCount = 3;
  const accountCount = 10;
  await Promise.all(
    accounts.slice(0, accountCount).map(async (account) => {
      const rafflecontract = await raffleContract
        .connect(account)
        .enter(raffle.id, ticketCount, {
          value: ticketPrice.mul(ticketCount),
        });
      return rafflecontract.wait();
    })
  ).then(async (results) => {
    // console.log(results);
    const entries = await raffleContract.getEntries(raffle.id);
    expect(entries.length).to.equal(ticketCount * accountCount);
  });
};

export const testCloseRaffle = async (
  signer: Signer,
  raffleContract: Contract) => {
  const raffles = await raffleContract.getAccountRaffles(
    await signer.getAddress()
  );
  const raffle = raffles[raffles.length - 1]; // get the last raffle

  expect(await raffleContract.getRaffleOpen(raffle.id)).to.equal(true);
  const tx = await raffleContract.close(raffle.id, {
    value: ethers.utils.parseEther(".001"),
  });
  await tx.wait();
  expect(await raffleContract.getRaffleOpen(raffle.id)).to.equal(false);
};

export const testGetWinners = async (raffleContract: Contract) => {
  const [deployer] = await ethers.getSigners();
  let raffles = await raffleContract.getAccountRaffles(deployer.getAddress());
  let raffle = raffles[raffles.length - 1]; // get the last raffle
  var airnodeReplied = false;
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
};

export default {};
