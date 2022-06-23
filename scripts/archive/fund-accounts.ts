import { ethers } from "hardhat";

const valueinether = "0.0025";

const fundAccounts = async (valueinether: string) => {
  // let owner: Signer;
  // let accounts: Signer[];
  const [owner, ...accounts] = await ethers.getSigners();

  for (let i = 0; i < accounts.length; i++) {
    const params = {
      to: await accounts[i].getAddress(),
      value: ethers.utils.parseUnits(valueinether, "ether").toHexString(),
    };
    console.log(params);
    const txHash = await owner.sendTransaction(params);
    console.log("transactionHash is " + txHash.hash);
  }
};

console.log("about to send", valueinether, " each to 19 addresses");

fundAccounts(valueinether);
