import { Contract } from "ethers";
import { deriveSponsorWalletAddress } from "@api3/airnode-admin";

const setQrngRequestParameters = async (
  sponsorAddress: string,
  qrngContract: Contract
) => {
  const apiData = {
    // ANU Quantum Random Numbers
    airnode: "0x9d3C147cA16DB954873A498e0af5852AB39139f2",
    xpub: "xpub6DXSDTZBd4aPVXnv6Q3SmnGUweFv6j24SK77W4qrSFuhGgi666awUiXakjXruUSCDQhhctVG7AQt67gMdaRAsDnDXv23bBRKsMWvRzo6kbf",
    endpointIdUint256:
      "0xfb6d017bb87991b7495f563db3c8cf59ff87b09781947bb1e417006ad7f55a78",
    endpointIdUint256Array:
      "0x27cc2713e7f968e4e86ed274a051a5c8aaee9cca66946f23af6f29ecea9704c3",
  };

  const sponsorWalletAddress = await deriveSponsorWalletAddress(
    apiData.xpub,
    apiData.airnode,
    sponsorAddress
  );

  // Set the parameters that will be used to make Airnode requests
  await qrngContract.setRequestParameters(
    apiData.airnode,
    apiData.endpointIdUint256,
    apiData.endpointIdUint256Array,
    sponsorWalletAddress
  );
  // console.log("Setting request parameters...");
  // await new Promise<void>((resolve) =>
  //   // once(receipt.hash, () => {
  //     resolve
  //   // })
  // );
  // console.log("Request parameters set");
};

export { setQrngRequestParameters };

export default () => {};
