import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const privateKey = process.env.PRIVATE_KEY || "";
const ropstenRPC = process.env.RPC_ROPSTEN || "";
const rinkebyRPC = process.env.RPC_RINKEBY || "";
const mumbaiRPC = process.env.RPC_MUMBAI || "";
const etherscanKey = process.env.ETHERSCAN_KEY || "";

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: ropstenRPC,
      accounts: [privateKey],
    },
    rinkeby: {
      url: rinkebyRPC,
      accounts: [privateKey],
    },
    matic: {
      url: mumbaiRPC,
      accounts: [privateKey],
    },
    hardhat: {
      forking: {
        url: rinkebyRPC,
      },
    },
  },
  etherscan: {
    apiKey: etherscanKey,
  },
};

export default config;
