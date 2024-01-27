import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { getFaucetHost, requestSuiFromFaucetV0 } from "@mysten/sui.js/faucet";
import { BigNumber, bigNumberify } from "ethers/utils";
import { getObjectInfoById } from "./getNftInfo";

export type NftsInfo = {
  img: string | undefined;
  name: string | undefined;
  address: string | undefined;
  tokenType?: string;
  walletAddress: string;
  chain: string;
  tokenId?: string | number;
};

const getAssetsForUser = async () => {
  const suiUserAddress =
    "0xa987c410fa047b973d479555894c85208c4450ef65fd1d8d5911b46fbca83365";

  // We can connect to "mainnet", "testnet", or "devnet"
  const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });

  const objectsBalance = (
    await suiClient.getOwnedObjects({
      owner: suiUserAddress,
    })
  ).data;

  let objectsArray: NftsInfo[] = [];
  for (const object of objectsBalance) {
    const objectInfo = await getObjectInfoById(object.data!.objectId);
    if (!objectInfo) continue;
    objectsArray.push(objectInfo);
  }

  console.log("Objects Array", JSON.stringify(objectsArray, null, 2));
};

getAssetsForUser();
