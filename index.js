import ccxt from "ccxt";
import express from "express";

const app = express();
const port = process.env.PORT || 3000;

const exchanges = {
  binance: new ccxt.binance(),
  okx: new ccxt.okx(),
};


app.get("/funding", async (req, res) => {
  let out = [];
  for (const [name, ex] of Object.entries(exchanges)) {
    const rates = await ex.fetchFundingRates();
    for (const s in rates) {
      const r = rates[s];
      out.push({
        symbol: s,
        exchange: name,
        funding: (r.fundingRate * 100).toFixed(4),
        price: r.markPrice,
        next: new Date(r.nextFundingTimestamp).toLocaleTimeString(),
      });
    }
  }
  res.json(out);
});

app.listen(port, () => console.log("backend ok"));
