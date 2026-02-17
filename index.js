let CACHE = [];
let LAST_UPDATE = 0;
const CACHE_TTL = 60 * 1000; // 1 хв


import ccxt from "ccxt";
import express from "express";

const app = express();
const port = process.env.PORT || 3000;

const exchanges = {
  binance: new ccxt.binance(),
  okx: new ccxt.okx(),
};


app.get("/funding", async (req, res) => {
  const now = Date.now();

  if (now - LAST_UPDATE < CACHE_TTL && CACHE.length) {
    return res.json(CACHE);
  }

  let out = [];

  for (const [name, ex] of Object.entries(exchanges)) {
    try {
      const rates = await ex.fetchFundingRates();
      for (const s in rates) {
        const r = rates[s];
        out.push({
          symbol: s,
          exchange: name,
          funding: (r.fundingRate * 100).toFixed(4),
          next: new Date(r.nextFundingTimestamp).toLocaleTimeString(),
        });
      }
    } catch (e) {
      console.log(name, "skipped");
    }
  }

  CACHE = out;
  LAST_UPDATE = now;

  res.json(out);
});



app.listen(port, () => console.log("backend ok"));
