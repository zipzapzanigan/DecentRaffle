import { ethers, deployments } from "hardhat";

const closeRaffle = async () => {
  const [owner] = await ethers.getSigners();
  const raffleDeployment = await deployments.get("Raffler");
  const raffleContract = new ethers.Contract(
    raffleDeployment.address,
    raffleDeployment.abi,
    owner
  );
  await raffleContract.connect(await owner.getAddress());
  const raffle = await raffleContract.getAccountRaffles(
    await owner.getAddress()
  );

  if (raffle.length > 0) {
    const receipt = await raffleContract.close(raffle[0].id.toNumber());
    console.log(receipt);
  } else {
    console.log("no existing raffles found");
  }
};

export default closeRaffle;
