// Importowanie wbudowanych modułów Node.js
const fs = require("fs");
const path = require("path");

// Klucz API - dla bezpieczeństwa lepiej jest przechowywać go w zmiennych środowiskowych
// Możesz uruchomić skrypt komendą: API_KEY="twoj_klucz" node fetch-prices.js
const apiKey = process.env.API_KEY || "8R4voOJHFLcxte3GhBMNKjSmkpQRO7k8bsR6TypaOS5O-cKdzK";

if (!apiKey) {
  console.error("Brak klucza API. Ustaw zmienną środowiskową API_KEY.");
  process.exit(1);
}

const url = `https://skins-table.com/api_v2/items?apikey=${apiKey}&app=730&site=YOUPIN898`;

async function getData() {
  console.log("Pobieranie danych z API...");
  try {
    const res = await fetch(url, {
      headers: {
        "accept": "application/json",
        "Referer": "https://skins-table.com/api_v2/apidoc/"
      }
    });

    const text = await res.text();
    if (!res.ok) {
      // Jeśli odpowiedź nie jest pomyślna, wyrzuć błąd z treścią odpowiedzi
      throw new Error(`Błąd HTTP ${res.status} - ${text}`);
    }

    const data = JSON.parse(text);

    // Sprawdzenie, czy odpowiedź API ma oczekiwaną strukturę
    if (!data.items || typeof data.items !== "object") {
      throw new Error("Nieprawidłowa odpowiedź z API: brak pola 'items' lub ma ono zły format.");
    }

    const transformed = {};
    // Iteracja po wszystkich przedmiotach z odpowiedzi
    for (const [key, val] of Object.entries(data.items)) {
      // Sprawdzenie warunków:
      // - val.c (count) to liczba i jest większa od 12
      // - val.p (price) to liczba i jest większa lub równa 70
      if (typeof val.c === "number" && typeof val.p === "number" && val.c > 12 && val.p >= 70) {
        transformed[key] = { price: val.p, count: val.c };
      }
    }

    const itemCount = Object.keys(transformed).length;

    // Przywrócenie oryginalnej struktury zapisu
    const payload = { items: transformed };
    const payloadString = JSON.stringify(payload, null, 2);

    // Użycie modułu path do stworzenia ścieżki niezależnej od systemu operacyjnego
    const outDir = path.join(__dirname, "out");
    const rootFilePath = path.join(__dirname, "prices.json");
    const outFilePath = path.join(outDir, "prices.json");

    // Sprawdzenie, czy katalog docelowy istnieje, a jeśli nie - stworzenie go
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    // Zapisanie przefiltrowanych danych do dwóch plików (w folderze głównym i w /out)
    fs.writeFileSync(rootFilePath, payloadString, "utf8");
    fs.writeFileSync(outFilePath, payloadString, "utf8");

    console.log(`\nZakończono pomyślnie!`);
    console.log(`Zapisano ${itemCount} przedmiotów w plikach:`);
    console.log(`-> ${rootFilePath}`);
    console.log(`-> ${outFilePath}`);

  } catch (err) {
    console.error("\nWystąpił błąd podczas wykonywania skryptu:", err.message);
    process.exit(1);
  }
}

// Uruchomienie funkcji
getData();

