// fetch-prices.js
const fs = require("fs");

const apiKey = "8R4voOJHFLcxte3GhBMNKjSmkpQRO7k8bsR6TypaOS5O-cKdzK";
if (!apiKey) {
  console.error("Missing API_KEY env var");
  process.exit(1);
}

const url = `https://skins-table.com/api_v2/items?apikey=${apiKey}&app=730&site=YOUPIN898`;

async function getData() {
  try {
    const res = await fetch(url, {
      headers: {
        "accept": "application/json",
        "Referer": "https://skins-table.com/api_v2/apidoc/"
      }
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} - ${text}`);
    }

    const data = JSON.parse(text);

    if (!data.items || typeof data.items !== "object") {
      throw new Error("Invalid API response: missing 'items'");
    }

    const transformed = {};
    for (const [key, val] of Object.entries(data.items)) {
      // warunki: count > 12 i price >= 70
      if (typeof val.c === "number" && typeof val.p === "number" && val.c > 12 && val.p >= 70) {
        transformed[key] = { price: val.p, count: val.c };
      }
    }

    const outDir = "out";
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    const payload = { items: transformed };
    fs.writeFileSync("prices.json", JSON.stringify(payload, null, 2), "utf8");
    fs.writeFileSync(`${outDir}/prices.json`, JSON.stringify(payload, null, 2), "utf8");

    console.log(`Saved ${Object.keys(transformed).length} items -> ${outDir}/prices.json`);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

getData();
