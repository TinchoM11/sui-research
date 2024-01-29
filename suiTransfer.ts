import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { isValidSuiAddress, fromHEX, toHEX } from "@mysten/sui.js/utils";
import dotenv from "dotenv";
dotenv.config();

// Address: 0x9a7791f7461bca43092f06bd93849a9fe54740f7d6f39f8bf97ac163515f4a17
const PK = process.env.TINCHO_PK_CHROME as string;

// We can connect to "mainnet", "testnet", or "devnet"
const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });

const sendSuiNative = async () => {
  const keypair = Ed25519Keypair.fromSecretKey(fromHEX(PK));
  const sender = keypair.toSuiAddress();
  console.log("Sender", sender);

  const estimatedGas = await suiClient.getReferenceGasPrice();
  console.log("Estimated Gas", estimatedGas);

  const tx = new TransactionBlock();
  tx.setSender(sender);
  await tx.build({ client: suiClient });

  // We set how much SUI we want to send (is the gas coin)
  const [coin] = tx.splitCoins(tx.gas, [100000000]);
  tx.transferObjects(
    [coin],
    "0x5380226d954d1f522835d230219efb162e8df167a7a56498976c55a72e18a477"
  );

  // Check Liveness with checkpoints
  const lastCheckpoint = await suiClient.getLatestCheckpointSequenceNumber();
  console.log("Last Checkpoint", lastCheckpoint);
  const lastCheckPointTimestamp = (
    await suiClient.getCheckpoint({ id: lastCheckpoint })
  ).timestampMs;
  console.log("Last Checkpoint Timestamp", lastCheckPointTimestamp);

  // Previous Checkpoint Timestamp
  const previousCheckpoint = Number(lastCheckpoint) - 1;
  const previousCheckpointTimestamp = (
    await suiClient.getCheckpoint({ id: previousCheckpoint.toString() })
  ).timestampMs;

  console.log("Previous Checkpoint Timestamp", previousCheckpointTimestamp);
  console.log(
    "Difference",
    Number(lastCheckPointTimestamp) - Number(previousCheckpointTimestamp)
  );

  if (
    Number(lastCheckPointTimestamp) - Number(previousCheckpointTimestamp) >
    2000
  ) {
    console.log("Not producing blocks, wait for next checkpoint");
    return;
  }

  // Send out the transaction

  return suiClient.signAndExecuteTransactionBlock({
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
};

sendSuiNative()
  .then((res) => {
    console.log("Transaction Result", JSON.stringify(res, null, 2));
  })
  .catch((err) => {
    console.log("Transaction Error", err);
  });

//   Transaction Result {
//     "digest": "ACLfYoDeQnpdfphrTx52w8Brwd8PT3LqreuWWAeGDU87",
//     "transaction": {
//       "data": {
//         "messageVersion": "v1",
//         "transaction": {
//           "kind": "ProgrammableTransaction",
//           "inputs": [
//             {
//               "type": "pure",
//               "valueType": "u64",
//               "value": "50000000"
//             },
//             {
//               "type": "pure",
//               "valueType": "address",
//               "value": "0x2b2f651080c94524ea58d73bf17b2624114494184bee564b42455bc2865b628c"
//             }
//           ],
//           "transactions": [
//             {
//               "SplitCoins": [
//                 "GasCoin",
//                 [
//                   {
//                     "Input": 0
//                   }
//                 ]
//               ]
//             },
//             {
//               "TransferObjects": [
//                 [
//                   {
//                     "NestedResult": [
//                       0,
//                       0
//                     ]
//                   }
//                 ],
//                 {
//                   "Input": 1
//                 }
//               ]
//             }
//           ]
//         },
//         "sender": "0x9a7791f7461bca43092f06bd93849a9fe54740f7d6f39f8bf97ac163515f4a17",
//         "gasData": {
//           "payment": [
//             {
//               "objectId": "0xb13b34c72268ea4620055b7827420a16723a841f05e361c6afc786729f5fb6d8",
//               "version": 835947,
//               "digest": "HfydjstLdrpCNLzG2SsATZYL8WLTdFcojWbKpojhfW8F"
//             }
//           ],
//           "owner": "0x9a7791f7461bca43092f06bd93849a9fe54740f7d6f39f8bf97ac163515f4a17",
//           "price": "1000",
//           "budget": "2988000"
//         }
//       },
//       "txSignatures": [
//         "AHGXxNr9gjS+OdCzyHX4PtpJOdf2/SsOrhKLI+8+5J1y6LzK20z8iP4TC44UVdHTWuqeJTgKSLwbzze7QTY3fwCxQoXXoYM0NdlxA6mudmuxVQQI/Z8GqHgM0VYoSSMSTQ=="
//       ]
//     },
//     "effects": {
//       "messageVersion": "v1",
//       "status": {
//         "status": "success"
//       },
//       "executedEpoch": "261",
//       "gasUsed": {
//         "computationCost": "1000000",
//         "storageCost": "1976000",
//         "storageRebate": "978120",
//         "nonRefundableStorageFee": "9880"
//       },
//       "modifiedAtVersions": [
//         {
//           "objectId": "0xb13b34c72268ea4620055b7827420a16723a841f05e361c6afc786729f5fb6d8",
//           "sequenceNumber": "835947"
//         }
//       ],
//       "transactionDigest": "ACLfYoDeQnpdfphrTx52w8Brwd8PT3LqreuWWAeGDU87",
//       "created": [
//         {
//           "owner": {
//             "AddressOwner": "0x2b2f651080c94524ea58d73bf17b2624114494184bee564b42455bc2865b628c"
//           },
//           "reference": {
//             "objectId": "0x4483dd76770d533aa1d59bc40d870fa0531169194a631b7e1125a853e70dbdc9",
//             "version": 835948,
//             "digest": "9yGva99ZXzjfaUgS1wA9m81f9nTGkWb2tHu3VDAktf3V"
//           }
//         }
//       ],
//       "mutated": [
//         {
//           "owner": {
//             "AddressOwner": "0x9a7791f7461bca43092f06bd93849a9fe54740f7d6f39f8bf97ac163515f4a17"
//           },
//           "reference": {
//             "objectId": "0xb13b34c72268ea4620055b7827420a16723a841f05e361c6afc786729f5fb6d8",
//             "version": 835948,
//             "digest": "6fHJ5hS9Qi2aeQZWZF5xK9tUgBP1PSQvHi72kEDQ9iGM"
//           }
//         }
//       ],
//       "gasObject": {
//         "owner": {
//           "AddressOwner": "0x9a7791f7461bca43092f06bd93849a9fe54740f7d6f39f8bf97ac163515f4a17"
//         },
//         "reference": {
//           "objectId": "0xb13b34c72268ea4620055b7827420a16723a841f05e361c6afc786729f5fb6d8",
//           "version": 835948,
//           "digest": "6fHJ5hS9Qi2aeQZWZF5xK9tUgBP1PSQvHi72kEDQ9iGM"
//         }
//       },
//       "dependencies": [
//         "8tMDsZZ7YbyTieQgMRYpbA9gsp2queq3DWtpaFxkxU45"
//       ]
//     },
//     "events": [],
//     "objectChanges": [
//       {
//         "type": "mutated",
//         "sender": "0x9a7791f7461bca43092f06bd93849a9fe54740f7d6f39f8bf97ac163515f4a17",
//         "owner": {
//           "AddressOwner": "0x9a7791f7461bca43092f06bd93849a9fe54740f7d6f39f8bf97ac163515f4a17"
//         },
//         "objectType": "0x2::coin::Coin<0x2::sui::SUI>",
//         "objectId": "0xb13b34c72268ea4620055b7827420a16723a841f05e361c6afc786729f5fb6d8",
//         "version": "835948",
//         "previousVersion": "835947",
//         "digest": "6fHJ5hS9Qi2aeQZWZF5xK9tUgBP1PSQvHi72kEDQ9iGM"
//       },
//       {
//         "type": "created",
//         "sender": "0x9a7791f7461bca43092f06bd93849a9fe54740f7d6f39f8bf97ac163515f4a17",
//         "owner": {
//           "AddressOwner": "0x2b2f651080c94524ea58d73bf17b2624114494184bee564b42455bc2865b628c"
//         },
//         "objectType": "0x2::coin::Coin<0x2::sui::SUI>",
//         "objectId": "0x4483dd76770d533aa1d59bc40d870fa0531169194a631b7e1125a853e70dbdc9",
//         "version": "835948",
//         "digest": "9yGva99ZXzjfaUgS1wA9m81f9nTGkWb2tHu3VDAktf3V"
//       }
//     ],
//     "balanceChanges": [
//       {
//         "owner": {
//           "AddressOwner": "0x2b2f651080c94524ea58d73bf17b2624114494184bee564b42455bc2865b628c"
//         },
//         "coinType": "0x2::sui::SUI",
//         "amount": "50000000"
//       },
//       {
//         "owner": {
//           "AddressOwner": "0x9a7791f7461bca43092f06bd93849a9fe54740f7d6f39f8bf97ac163515f4a17"
//         },
//         "coinType": "0x2::sui::SUI",
//         "amount": "-51997880"
//       }
//     ],
//     "confirmedLocalExecution": true
//   }
