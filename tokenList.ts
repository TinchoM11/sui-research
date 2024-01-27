import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { getFaucetHost, requestSuiFromFaucetV0 } from "@mysten/sui.js/faucet";
import { BigNumber, bigNumberify } from "ethers/utils";
import { getTokenPrice } from "./getPrice";

export interface Token {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  logoURI: string;
  chain: string;
  price: number; // JUST HERE TO TEST GETTING PRICES
}

// List of Known Tokens
const SuiKnownTokenList = [
  {
    coinType: "0x2::sui::SUI", // SUI
    logoUri: "https://s2.coinmarketcap.com/static/img/coins/64x64/20947.png",
  },
  {
    coinType:
      "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN", // USDC
    logoUri: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
  },
  {
    coinType:
      "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN", // USDT
    logoUri: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
  },
  {
    coinType:
      "0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN", // WETH
    logoUri: "https://s2.coinmarketcap.com/static/img/coins/64x64/2396.png",
  },
  {
    coinType:
      "0xb7844e289a8410e50fb3ca48d69eb9cf29e27d223ef90353fe1bd8e27ff8f3f8::coin::COIN", // SOL
    logoUri: "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
  },
  {
    coinType:
      "0x1e8b532cca6569cab9f9b9ebc73f8c13885012ade714729aa3b450e0339ac766::coin::COIN", // WAVAX
    logoUri: "https://s2.coinmarketcap.com/static/img/coins/64x64/6892.png",
  },
];

const createTokenList = async () => {
  let tokensListArray: Token[] = [];
  const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });

  for (const token of SuiKnownTokenList) {
    const coinMetadata = await suiClient.getCoinMetadata({
      coinType: token.coinType,
    });
    if (coinMetadata) {
      const price = await getTokenPrice(coinMetadata.symbol); // Not needed, just testing
      tokensListArray.push({
        symbol: coinMetadata.symbol,
        name: coinMetadata.name,
        decimals: coinMetadata.decimals,
        address: token.coinType.split("::")[0],
        logoURI: token.logoUri,
        chain: "SUI",
        price: price,
      });
    }
  }
  console.log(JSON.stringify(tokensListArray, null, 2));
};

createTokenList();
