// const id: number = await this.#getCoinMarketCapTokenId(symbol);

// const url: string = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${id}`;
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.COIN_MARKET_CAP_API_KEY;

export async function getTokenPrice(symbol: string): Promise<number> {
  const id: number = await getCoinMarketCapTokenId(symbol);
  const url: string = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${id}`;

  const res = await axios.get(url, {
    headers: {
      "X-CMC_PRO_API_KEY": API_KEY,
    },
  });

  const price = res.data.data[id].quote.USD.price.toFixed(6);
  return parseFloat(price);
}

async function getCoinMarketCapTokenId(symbol: string): Promise<number> {
  const url: string = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?symbol=${symbol}`;

  return axios
    .get(url, {
      headers: {
        "X-CMC_PRO_API_KEY": API_KEY,
      },
    })
    .then((res) => res.data.data)
    .then((data: []) => {
      if (data && data.length > 0) {
        const token: any = data.find((token: any) => token.symbol === symbol);
        const tokenId: number = token?.id;
        return Promise.resolve(tokenId);
      } else {
        return Promise.reject(
          new Error(`Failed to get token id for symbol: ${symbol}`)
        );
      }
    })
    .catch((error) => {
      return Promise.reject(
        new Error(
          `Failed to get token id for symbol: ${symbol} error: ${error}`
        )
      );
    });
}

