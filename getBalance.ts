import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { getFaucetHost, requestSuiFromFaucetV0 } from "@mysten/sui.js/faucet";
import { BigNumber, bigNumberify } from "ethers/utils";
import { getTokenPrice } from "./getPrice";

interface suiBalanceResponse {
  coinType: string;
  coinObjectCount: number;
  totalBalance: string;
  lockedBalance: any;
}

// FUNCTION TO GET NATIVE SUI BALANCE
const getSuiBalance = async () => {
  const suiUserAddress =
    "0x4855a5ac9ea7289a5dedb68bdb3effb05e32071ef0047aa02909ccff955f76ad";

  // We can connect to "mainnet", "testnet", or "devnet"
  const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });

  // store the JSON representation for the SUI the address owns before using faucet
  const suiBalance: suiBalanceResponse = await suiClient.getBalance({
    owner: suiUserAddress,
  });

  // Example Response
  //   {
  //     coinType: '0x2::sui::SUI',
  //     coinObjectCount: 3,
  //     totalBalance: '478786477876',
  //     lockedBalance: {}
  //   }

  // SUI HAS 9 DECIMALS
  const numberBalance = Number.parseInt(suiBalance.totalBalance) / 1000000000;
  const bigNumberBalance = new BigNumber(suiBalance.totalBalance).toHexString();

  console.log(`Balance for address ${suiUserAddress}`);
  console.log(`SUI BALANCE: ${numberBalance}`);
  console.log(`BIG NUMBER: ${bigNumberBalance}`);
};

getSuiBalance();

// FUNCTION TO GET OTHER TOKENS BALANCES (IT ALSO INCLUDES SUI, WE CAN FILTER IT)
const getAllBalances = async () => {
  const suiUserAddress =
    "0x4855a5ac9ea7289a5dedb68bdb3effb05e32071ef0047aa02909ccff955f76ad";

  // We can connect to "mainnet", "testnet", or "devnet"
  const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });

  // store the JSON representation for the SUI the address owns before using faucet
  const allBalances: suiBalanceResponse[] = await suiClient.getAllBalances({
    owner: suiUserAddress,
  });
  console.log("All Balances", JSON.stringify(allBalances, null, 2));
  let balancesArray: any = [];
  for (const balance of allBalances) {
    if (!(Number.parseInt(balance.totalBalance) > 0)) continue;
    // Get CoinMetadata
    const coinMetadata = await suiClient.getCoinMetadata({
      coinType: balance.coinType,
    });
    if (!coinMetadata) continue;
    // Coin Metadata: {
    //     decimals: 6,
    //     name: 'USD Coin',
    //     symbol: 'USDC',
    //     description: '',
    //     iconUrl: null,
    //     id: '0x4fbf84f3029bd0c0b77164b587963be957f853eccf834a67bb9ecba6ec80f189'
    //   }
    const decimals = coinMetadata!.decimals;
    const numberBalance =
      Number.parseInt(balance.totalBalance) / 10 ** decimals;
    const bigNumberBalance = new BigNumber(balance.totalBalance).toHexString();

    const price = await getTokenPrice(coinMetadata.symbol); // Not needed, just testing

    balancesArray.push({
      coinType: balance.coinType,
      name: coinMetadata!.name,
      symbol: coinMetadata!.symbol,
      tokenAddress: coinMetadata!.id,
      balance: numberBalance,
      bigNumberBalance: bigNumberBalance,
      price: price,
    });

    //   console.log(`Balance for address ${suiAddress}`);
    //   console.log(`SUI BALANCE: ${numberBalance}`);
    //   console.log(`BIG NUMBER: ${bigNumberBalance}`);
  }
  console.log(`All Balances for address ${suiUserAddress}:`, balancesArray);
};

getAllBalances();
