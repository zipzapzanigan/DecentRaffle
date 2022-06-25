import { ethers } from "hardhat";

const valueinether = "0.0025";

const fundAccounts = async (valueinether: string) => {
  // let owner: Signer;
  // let accounts: Signer[];
  const [deployer, ...accounts] = await ethers.getSigners();
  const valueinwei = ethers.utils.parseUnits(valueinether, "ether");
  const deployerbalance = await ethers.provider.getBalance(
    await deployer.getAddress()
  );
  console.log("deployer balance: ", ethers.utils.formatEther(deployerbalance));

  console.log("sending funds to accounts that have less than the threshold");

  for (let i = 0; i < accounts.length; i++) {
    const balance = await ethers.provider.getBalance(
      await accounts[i].getAddress()
    );

    if (balance.lt(valueinwei)) {
      const params = {
        to: await accounts[i].getAddress(),
        value: valueinwei,
      };
      console.log(params);
      await deployer.sendTransaction(params);
    }
    console.log(
      await accounts[i].getAddress(),
      ethers.utils.formatEther(balance)
    );
  }
};

console.log("about to send", valueinether, " each to 19 addresses");

fundAccounts(valueinether);
