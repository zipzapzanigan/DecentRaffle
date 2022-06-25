import { ethers } from "hardhat";
import { pRateLimit } from "p-ratelimit";

// randomly create a bunch of addresses and see if they are used.
const spawnWallet = async () => {
  const a = ethers.Wallet.createRandom();
  const balance = await ethers.provider.getBalance(a.address);
  if (!balance.isZero()) {
    console.log("WE GOT A WINNER");
    console.log(
      a.address + " " + balance + " ether  phrase:" + a.mnemonic.phrase
    );
  }
  const string =
    a.address +
    " " +
    balance.toString() +
    " ether  phrase:" +
    a.mnemonic.phrase;
  return string;
};

const limit = pRateLimit({
  interval: 1000, // 1000 ms == 1 second
  rate: 12, // 30 API calls per interval
  concurrency: 12, // no more than 10 running at once
  // maxDelay: 10000  // an API call delayed > 2 sec is rejected
});

const main = async () => {
  console.log(new Date());
  var array = []

  for (let n = 0; n < 100; n++) {
    console.log("run ", n)
    for (let i = 0; i < 50; i++) {
      array[i] = limit(spawnWallet);
    }
    const test = await Promise.all(array);
    console.log("end", test);
    console.log(new Date());
  }
};
main();
