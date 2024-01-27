import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { isValidSuiAddress, fromHEX, toHEX } from "@mysten/sui.js/utils";
import dotenv from "dotenv";
dotenv.config();

// Address: 0x9a7791f7461bca43092f06bd93849a9fe54740f7d6f39f8bf97ac163515f4a17
const TESTNET_PK = process.env.TESTNET_PK as string;

// We can connect to "mainnet", "testnet", or "devnet"
const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

const tokenTransfer = async () => {
  const keypair = Ed25519Keypair.fromSecretKey(fromHEX(TESTNET_PK));
  const sender = keypair.toSuiAddress();
  console.log("Sender", sender);

  const estimatedGas = await suiClient.getReferenceGasPrice();
  console.log("Estimated Gas", estimatedGas);

  const tx = new TransactionBlock();
  tx.setSender(sender);
  await tx.build({ client: suiClient });

  // We set how much SUI we want to send (is the gas coin)
  const [coin] = tx.splitCoins(tx.gas, [50000000]);
  tx.transferObjects(
    [coin],
    "0x2b2f651080c94524ea58d73bf17b2624114494184bee564b42455bc2865b628c"
  );

  const gasCoin = await suiClient.getObject({
    id: "0x2",
  });

  tx.setGasPayment([
    {
      digest: gasCoin.data?.digest as string,
      objectId: gasCoin.data?.objectId as string,
      version: gasCoin.data?.version as string,
    },
  ]);

  // Send out the transaction

  return suiClient.signAndExecuteTransactionBlock({
    signer: keypair,
    transactionBlock: tx,
  });
};

tokenTransfer()
  .then((res) => {
    console.log("Transaction Result", res);
  })
  .catch((err) => {
    console.log("Transaction Error", err);
  });

// async function getOjectInfo() {
//   const object = await suiClient.getObject({
//     id: "0x2",
//   });

//   console.log("Object", JSON.stringify(object, null, 2));
//   return object.data;
// }

// getOjectInfo();
