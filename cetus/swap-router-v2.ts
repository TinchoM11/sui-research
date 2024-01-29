import {
  CoinProvider,
  PathProvider,
  AggregatorResult,
  TransactionUtil,
} from "@cetusprotocol/cetus-sui-clmm-sdk";
import path from "path";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { fromHEX } from "@mysten/sui.js/utils";
import { SDK } from "./config";
import dotenv from "dotenv";
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

const PK = process.env.TINCHO_PK_CHROME as string;

// We can connect to "mainnet", "testnet", or "devnet"
const suiClient = new SuiClient({ url: getFullnodeUrl("mainnet") });

const main = async () => {
  const keypair = Ed25519Keypair.fromSecretKey(fromHEX(PK));
  const sender = keypair.toSuiAddress();
  const coinMap = new Map();
  const poolMap = new Map();

  // Get all pools info
  const resp: any = await fetch(
    "https://api-sui.cetus.zone/v2/sui/pools_info",
    { method: "GET" }
  );
  const poolsInfo = await resp.json();

  if (poolsInfo.code === 200) {
    for (const pool of poolsInfo.data.lp_list) {
      if (pool.is_closed) {
        continue;
      }

      let coin_a = pool.coin_a.address;
      let coin_b = pool.coin_b.address;

      coinMap.set(coin_a, {
        address: pool.coin_a.address,
        decimals: pool.coin_a.decimals,
      });
      coinMap.set(coin_b, {
        address: pool.coin_b.address,
        decimals: pool.coin_b.decimals,
      });

      const pair = `${coin_a}-${coin_b}`;
      const pathProvider = poolMap.get(pair);
      if (pathProvider) {
        pathProvider.addressMap.set(Number(pool.fee) * 100, pool.address);
      } else {
        poolMap.set(pair, {
          base: coin_a,
          quote: coin_b,
          addressMap: new Map([[Number(pool.fee) * 100, pool.address]]),
        });
      }
    }
  }

  const coins: CoinProvider = {
    coins: Array.from(coinMap.values()),
  };
  const paths: PathProvider = {
    paths: Array.from(poolMap.values()),
  };

  SDK.Router.loadGraph(coins, paths);

  //   byAmountIn: true means fixed the amount of input, false means fixed the amount of output.
  const byAmountIn = true;
  const res = (
    await SDK.RouterV2.getBestRouter(
      "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN", // From Coin
      "0x2::sui::SUI", // to Coin
      3000000, // Amount
      byAmountIn,
      0.5, // slippage
      "" // deprecated param so can be null string
    )
  ).result as AggregatorResult;

  console.log("Aggregator result", res);

  // If find the best swap router, then send transaction.
  if (!res?.isExceed) {
    // Get all coin assets for a sender
    const allCoinAsset = await SDK.getOwnerCoinAssets(sender);
    const payload = await TransactionUtil.buildAggregatorSwapTransaction(
      SDK,
      res,
      allCoinAsset,
      "", // not needed anymore - deprecated param so can be null string
      0.5, // slippage
      sender // receiverAddress (same than sender in this case because is swap)
    );

    // Send transaction
    const tx = await suiClient.signAndExecuteTransactionBlock({
      signer: keypair,
      // @ts-ignore
      transactionBlock: payload,
    });

    console.log("Transaction", tx);
    // Transaction {
    //     digest: '35QbkoguxBDWdbVpmtPtBwAxWV7sriVAtiGwjx8bwYMk',
    //     confirmedLocalExecution: false
    //   }
  }
};

main();
