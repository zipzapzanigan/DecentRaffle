const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Raffle", function () {
  let RaffleContract, raffleContract, address1, address2;

  it("Deploys", async function () {
    [address1, address2] = await ethers.getSigners();
    RaffleContract = await ethers.getContractFactory("Raffler");
    raffleContract = await RaffleContract.deploy(
      "0xa0AD79D995DdeeB18a14eAef56A549A04e3Aa1Bd",
      "0x0000000000000000000000000000000000000000"
    );
    await raffleContract.deployed();
  });

  it("Creates a raffle", async function () {
    const receipt = await raffleContract.create(
      ethers.utils.parseEther(".0001"),
      5
    );
    const rc = await receipt.wait();
    const [raffleId] = rc.events.find(
      (event) => event.event === "RaffleCreated"
    ).args;
    const raffle = await raffleContract.raffles(raffleId);
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

  it.skip("Pick Winner", async function () {
    let accountBalance = await address1.getBalance();
    let randomNumbers = [];
    for (let i = 0; i < 5; i++) {
      randomNumbers.push(Math.floor(Math.random() * 99999));
    }
    console.log(randomNumbers);
    const tx = await raffleContract.pickWinners(1, randomNumbers);
    await tx.wait();
    accountBalance = await address1.getBalance();
    const winners = await raffleContract.getWinners(1);
    expect(winners.length).to.equal(5);
    console.log(winners);
  });

  it.skip("Make Params", async function () {
    const { encode } = require("@api3/airnode-abi");
    const parameters = [
      { type: "string", name: "_path", value: "0,1,2,3,4" },
      {
        type: "string",
        name: "_type",
        value: "uint256,uint256,uint256,uint256,uint256",
      },
      { type: "uint256", name: "size", value: "5" },
    ];
    const encodedData = encode(parameters);

    const params = await raffleContract.getParams(5);
    expect(params).to.equal(encodedData);
  });
});
