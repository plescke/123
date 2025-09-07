const fs = require("fs");

const url = "https://skins-table.com/api_v2/items?apikey=...";

async function getData() {
  try {
    const response = await fetch(url, {
      headers: {
        "accept": "application/json",
        "accept-language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://skins-table.com/api_v2/apidoc/"
      },
      method: "GET"
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    if (!data.items || typeof data.items !== "object") {
      throw new Error("Nieprawidłowa struktura odpowiedzi API – brak pola 'items'");
    }

    const transformedItems = {};
    for (const [key, value] of Object.entries(data.items)) {
      if (value.c > 12 && value.p >= 70) {
        transformedItems[key] = {
          price: value.p,
          count: value.c
        };
      }
    }

    const result = { items: transformedItems };

    fs.writeFileSync("prices.json", JSON.stringify(result, null, 2), "utf8");

    console.log(`Zapisano ${Object.keys(transformedItems).length} przedmiotów do prices.json`);
  } catch (error) {
    console.error("Error:", error);
  }
}

getData();
