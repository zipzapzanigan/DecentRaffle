import { BigNumber, Contract, Event } from "ethers";

export const createRaffle = async (
  raffleContract: Contract,
  ticketPrice: BigNumber,
  raffleName: string,
  winnerCount: number
) => {
  const twoHours: number = 2 * 60 * 60;
  // Convert float to integer
  const now: number = Math.floor(Date.now() / 1000);
  const receipt = await raffleContract.create(
    ticketPrice,
    winnerCount,
    raffleName,
    now - twoHours, // Workaround for setting timestamp manually because of forking
    now + twoHours
  );
  const rc = await receipt.wait();
  const [raffleId] = rc.events.find(
    (event: Event) => event.event === "RaffleCreated"
  ).args;
  return raffleContract.raffles(raffleId);
};

export default createRaffle;
