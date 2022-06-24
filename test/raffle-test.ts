import { Contract, ContractFactory } from "ethers";
import { expect } from "chai";
import { ethers, deployments } from "hardhat";
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

  const createRaffleTest = async () => {
    // check if raffle id is 1 more after creating raffle compared to before
    const initialRaffleCount = (
      await raffleContract.getAccountRaffles(owner.getAddress())
    ).length;
    const raffle = await createRaffle(
      raffleContract,
      ticketPrice,
      "test raffle"
    );
    expect(raffle.id).to.equal(initialRaffleCount + 1);
    console.log("raffle id is", raffle.id);
  };

  const enterRaffleTest = async () => {
    const raffleId = (
      await raffleContract.getAccountRaffles(owner.getAddress())
    ).length;
    const ticketCount = 3;
    const accountCount = 10;
    await Promise.all(
      accounts.slice(0, accountCount).map(async (account) => {
        const rafflecontract = await raffleContract
          .connect(account)
          .enter(raffleId, ticketCount, {
            value: ticketPrice.mul(ticketCount),
          });
        return rafflecontract.wait();
      })
    ).then(async (results) => {
      console.log(results);
      const entries = await raffleContract.getEntries(raffleId);
      expect(entries.length).to.equal(ticketCount * accountCount);
      console.log(
        await raffleContract.getAccountRaffles(await owner.getAddress())
      );
    });
  };

  const pickWinnerTest = async () => {
    const raffleId = (
      await raffleContract.getAccountRaffles(owner.getAddress())
    ).length;
    // const randomNumbers = [];
    // for (let i = 0; i < 5; i++) {
    //   randomNumbers.push(Math.floor(Math.random() * 99999));
    // }
    // console.log(randomNumbers);
    const tx = await raffleContract.close(raffleId, {
      value: ethers.utils.parseEther(".001"),
    });
    await tx.wait();
    const winners = await raffleContract.getWinners(raffleId);
    console.log(winners);
    console.log(tx);
    expect(winners.length).to.equal(5);
  };

  const makeParamsTest = async () => {
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

  it("Creates a raffle", createRaffleTest);
  // it.skip("Create role can create new Raffle", nullfunc);
  // it.skip("Non create role cannot create new Raffle", nullfunc);
  // it.skip("Anyone can enter the raffle for a fee", nullfunc);
  // it.skip("Create role can pick a winner", nullfunc);
  // it.skip("Non create role cannot create new Raffle", nullfunc);
  it("Enters raffle", enterRaffleTest);
  it("Pick Winner", pickWinnerTest);
  // it.skip("Make Params", makeParamsTest);
});
