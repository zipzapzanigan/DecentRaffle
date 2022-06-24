import { ethers, deployments } from "hardhat";
import { Contract, ContractFactory, Signer, BigNumber } from "ethers";
import { expect } from "chai";
import { createRaffle } from "../scripts/create_raffle";
import { encode } from "@api3/airnode-abi";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Raffle", function () {
  const sponsorWallet = "0x8844CEF45EA0D410948B2c01753aAae8f86d0842";
  const ticketPrice = ethers.utils.parseEther(".00001");
  const deployedAddress: string = "0xE841729307C6F5140e9Bc7f30FE97DfC30443dB0";
  let raffleContract: Contract;
  // eslint-disable-next-line camelcase
  let RaffleContract: ContractFactory;
  let chainId: number;
  let owner: SignerWithAddress;
  let accounts: SignerWithAddress[];
  let raffleId: number = 12;

  const testCreateRaffle = async () => {
    // check if raffle id is 1 more after creating raffle compared to before
    const initialRaffleCount = (
      await raffleContract.getAccountRaffles(owner.getAddress())
    ).length;
    const raffle = await createRaffle(
      raffleContract,
      ticketPrice,
      "test raffle"
    );
    expect(raffle.id.toNumber()).to.equal(initialRaffleCount + 1);
  };

  const testEnterRaffle = async () => {
    const raffles = await raffleContract.getAccountRaffles(
      await owner.getAddress()
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

  const testCloseRaffle = async () => {
    const raffles = await raffleContract.getAccountRaffles(
      await owner.getAddress()
    );
    const raffle = raffles[raffles.length - 1]; // get the last raffle

    expect(await raffleContract.getRaffleOpen(raffle.id)).to.equal(true);
    const tx = await raffleContract.close(raffle.id, {
      value: ethers.utils.parseEther(".001"),
    });
    await tx.wait();
    expect(await raffleContract.getRaffleOpen(raffle.id)).to.equal(false);
  };

  const testGetWinners = async () => {
    let raffles = await raffleContract.getAccountRaffles(owner.getAddress());
    let raffle = raffles[raffles.length - 1]; // get the last raffle
    // const randomNumbers = [];
    // for (let i = 0; i < 5; i++) {
    //   randomNumbers.push(Math.floor(Math.random() * 99999));
    // }
    // console.log(randomNumbers);

    var airnodeReplied = false;
    console.log("\twaiting for airnode to reply");

    while (!airnodeReplied) {
      raffles = await raffleContract.getAccountRaffles(owner.getAddress());
      raffle = raffles[raffles.length - 1]; // get the last raffle
      airnodeReplied = await raffle.airnodeSuccess;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const winners = await raffleContract.getWinners(raffle.id);
    console.log(raffle);
    console.log(winners);
    // console.log(winners.length);
    expect(winners.length).to.equal(5);
  };

  before("deploying contract", async () => {
    // if we want to deploy the raffle contract once for multiple tests,
    // we can set deployedAddress, so it will reuse the deployment
    [owner, ...accounts] = await ethers.getSigners();
    console.log("owner address", await owner.getAddress());
    chainId = await ethers.provider.getNetwork().then((n) => n.chainId);
    // raffleContract = await getDeployedContract();
    const RaffleDeployment = await deployments.get("Raffler");
    raffleContract = new ethers.Contract(
      RaffleDeployment.address,
      RaffleDeployment.abi,
      owner
    );
  });

  it("Can create a new raffle with correct id", testCreateRaffle);
  it("Can enter raffle 3 times each with 10 accounts", testEnterRaffle);
  it("Can close the last raffle", testCloseRaffle);
  it("Can read the winners - takes a minute to return", testGetWinners);
  // it.skip("Create role can create new Raffle", nullfunc);
  // it.skip("Non create role cannot create new Raffle", nullfunc);
  // it.skip("Anyone can enter the raffle for a fee", nullfunc);
  // it.skip("Create role can pick a winner", nullfunc);
  // it.skip("Non create role cannot create new Raffle", nullfunc);
  // it.skip("Make Params", makeParamsTest);
});
