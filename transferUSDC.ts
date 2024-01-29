import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { fromHEX } from "@mysten/sui.js/utils";
import dotenv from "dotenv";
dotenv.config();

const MAINNET_PK = process.env.TINCHO_PK_CHROME as string;

// We can connect to "mainnet", "testnet", or "devnet"
const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });
const recipientAddress =
  "0x5380226d954d1f522835d230219efb162e8df167a7a56498976c55a72e18a477";

export const sendToken = async () => {
  const keypair = Ed25519Keypair.fromSecretKey(fromHEX(MAINNET_PK));
  const sender = keypair.toSuiAddress();
  console.log("Sender", sender);

  const tx = new TransactionBlock();

  // We need to get all coins objects of the same type for the user
  const res = await suiClient.getCoins({
    owner: sender,
    coinType:
      "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN", // USDC
  });
  const coinObjects = res.data;
  console.log("Coin Objects", coinObjects);
  let coinToTransfer;

  if (coinObjects.length <= 1) {
    // If the user only has 1 coin, we don't need to merge
    coinToTransfer = coinObjects[0].coinObjectId;
  } else {
    // For coin 1 to total lenght (without counting objetc [0] because we will merge into this one)
    let coinsToMerge: string[] = [];
    for (let i = 1; i < coinObjects.length; i++) {
      console.log("Coin to merge", coinObjects[i]);
      coinsToMerge.push(coinObjects[i].coinObjectId);
    }
    const [mergedCoin] = tx.mergeCoins(
      coinObjects[0].coinObjectId,
      coinsToMerge
    );

    coinToTransfer = mergedCoin;
    tx.setGasBudget(1000000); // We need to set a gas budget in this case
  }

  // We split the coin into 2 coins, setting the amount to send in the 2nd param
  const [coin] = tx.splitCoins(coinObjects[0].coinObjectId, [tx.pure(130000)]);
  tx.transferObjects([coin], tx.pure(recipientAddress));

  const result = await suiClient.signAndExecuteTransactionBlock({
    signer: keypair,
    transactionBlock: tx,
    options: {
      showInput: true,
      showEffects: true,
      showEvents: true,
      showObjectChanges: true,
      showBalanceChanges: true,
    },
  });
  console.log({ result });

  // const [coin] = tx.splitCoins(tx.object("0x01288c06aa1100734ea0ac25b57e7cbd9a77e8a949c1c63b3406247816d92d82"}, [
  //     tx.pure(parsedAmount),
  //   ]);
  // tx.transferObjects([coin], tx.pure(recipientAddress));
  // const result = await signer.signAndExecuteTransactionBlock({
  //     transactionBlock: tx,
  //   });
};

sendToken();
