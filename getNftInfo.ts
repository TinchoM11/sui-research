const axios = require("axios");

export type NftsInfo = {
  img: string | undefined;
  name: string | undefined;
  address: string | undefined;
  tokenType?: string;
  walletAddress: string;
  chain: string;
  tokenId?: string | number;
};

export const getObjectInfoById = async (objectId: string) => {
  const url = "https://explorer-rpc.mainnet.sui.io/";

  const requestBody = {
    jsonrpc: "2.0",
    id: 3,
    method: "sui_getObject",
    params: [
      objectId,
      {
        showType: true,
        showContent: true,
        showOwner: true,
        showPreviousTransaction: true,
        showStorageRebate: true,
        showDisplay: true,
      },
    ],
  };

  try {
    const response = await axios.post(url, requestBody);
    // If it's not an NFT return null
    if (response.data.result.data.type.includes("::coin::")) return null;
    const ObjectInfo: NftsInfo = {
      img: response.data.result.data.display.data?.image_url ?? null,
      name: response.data.result.data.display.data?.name,
      address: response.data.result.data.objectId,
      walletAddress: response.data.result.data.owner.AddressOwner,
      chain: "SUI",
      tokenId: response.data.result.data.objectId,
    };
    return ObjectInfo;
  } catch (error) {
    console.error("Error en la solicitud Axios:", error);
    throw error;
  }
};

// Respuesta Axios: {
//     "jsonrpc": "2.0",
//     "result": {
//       "data": {
//         "objectId": "0x0da466e9e557ab2041d69e21c2a96682a17aac924fe11a7a2855b472763a7fa0",
//         "version": "6204827",
//         "digest": "B5HbD58WoZ38z7KhuE28zbruro92dFMyf85uAqBpNTXA",
//         "type": "0x58156e414780a5a237db71afb0d852674eff8cd98f9572104cb79afeb4ad1e9d::suinet::SUITOMAINNET",
//         "owner": {
//           "AddressOwner": "0x4855a5ac9ea7289a5dedb68bdb3effb05e32071ef0047aa02909ccff955f76ad"
//         },
//         "previousTransaction": "31o1XUqM9TVgWKSNXtQfuVbYqWHKzcHu7ShjVoDA4jsK",
//         "storageRebate": "1565600",
//         "display": {
//           "data": {
//             "description": "Quest 3 5 million sui rewards distribution.",
//             "image_url": "https://i.imgur.com/8JYWNI7.png",
//             "link": "https://5msui.xyz/",
//             "name": "Quest 3 Rewards Live"
//           },
//           "error": null
//         },
//         "content": {
//           "dataType": "moveObject",
//           "type": "0x58156e414780a5a237db71afb0d852674eff8cd98f9572104cb79afeb4ad1e9d::suinet::SUITOMAINNET",
//           "hasPublicTransfer": true,
//           "fields": {
//             "id": {
//               "id": "0x0da466e9e557ab2041d69e21c2a96682a17aac924fe11a7a2855b472763a7fa0"
//             },
//             "name": "Testnet to Mainnet Pass #89960"
//           }
//         }
//       }
//     },
//     "id": 3
//   }
