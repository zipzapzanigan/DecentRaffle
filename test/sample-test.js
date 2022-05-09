const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Raffle", function () {
  let RaffleContract, raffleContract, address1, address2;
  it("Deploys", async function () {
    [address1, address2] = await ethers.getSigners();
    RaffleContract = await ethers.getContractFactory("Raffler");
    raffleContract = await RaffleContract.deploy();
    await raffleContract.deployed();
  });

  it("Creates a raffle", async function () {
    const tx = await raffleContract.create(ethers.utils.parseEther(".0001"), 5);
    await tx.wait();
    const raffle = await raffleContract.raffles(1);
    expect(raffle.id).to.equal(1);
  });

  it("Enters raffle", async function () {
    const accounts = await ethers.getSigners();
    for (account of accounts) {
      const tx = await raffleContract.connect(account).enter(1, 10, {
        value: ethers.utils.parseEther(".001"),
      });
      await tx.wait();
    }

    const entryLength = await raffleContract.getEntriesLength(1);
    expect(entryLength).to.equal(200);
  });

  it("Pick Winner", async function () {
    let accountBalance = await address1.getBalance();
    let randomNumbers = [];
    for (let i = 0; i < 5; i++) {
      randomNumbers.push(Math.floor(Math.random() * 99999));
    }
    console.log(randomNumbers);
    const tx = await raffleContract.pickWinner(1, randomNumbers);
    await tx.wait();
    accountBalance = await address1.getBalance();
    const winners = await raffleContract.getWinners(1);
    expect(winners.length).to.equal(5);
    console.log(winners);
  });
});
