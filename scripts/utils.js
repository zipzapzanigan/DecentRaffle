const { deriveSponsorWalletAddress } = require("@api3/airnode-admin");
const airnodeProtocol = require("@api3/airnode-protocol");
require("dotenv").config();

async function getSponsorWallet() {
  const anuXpub =
    "xpub6DXSDTZBd4aPVXnv6Q3SmnGUweFv6j24SK77W4qrSFuhGgi666awUiXakjXruUSCDQhhctVG7AQt67gMdaRAsDnDXv23bBRKsMWvRzo6kbf";
  const anuAirnode = "0x9d3C147cA16DB954873A498e0af5852AB39139f2";
  const privateKey = process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey);

  const sponsorWalletAddress = await deriveSponsorWalletAddress(
    anuXpub,
    anuAirnode,
    wallet.address
  );
  return sponsorWalletAddress;
}

async function sponsorRequester(requesterAddress) {
  let { chainId } = await ethers.provider.getNetwork();
  if (chainId == 31337) chainId = 4;
  const [wallet] = await ethers.getSigners();
  const rrp = new ethers.Contract(
    airnodeProtocol.AirnodeRrpAddresses[chainId],
    airnodeProtocol.AirnodeRrpV0Factory.abi,
    wallet
  );
  const tx = await rrp.setSponsorshipStatus(requesterAddress, true);
  await tx.wait();
  console.log("Sponsored!");
}

async function getRaffleContract() {
  const rafflerAddress = require("../deployed-contract.json").address;
  const [account] = await ethers.getSigners();
  return await ethers.getContractAt("Raffler", rafflerAddress, account);
}

async function getRRPContract() {
  const { chainId } = await ethers.provider.getNetwork();
  if (chainId == 31337) chainId = 4;
  const [wallet] = await ethers.getSigners();
  return new ethers.Contract(
    airnodeProtocol.AirnodeRrpAddresses[chainId],
    airnodeProtocol.AirnodeRrpV0Factory.abi,
    wallet
  );
}

module.exports = {
  getSponsorWallet,
  sponsorRequester,
  getRaffleContract,
  getRRPContract,
};
