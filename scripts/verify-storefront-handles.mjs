import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const file of [".env", ".env.local"]) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf-8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    process.env[k] = v;
  }
}

const domain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
const token = process.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
const ver = process.env.VITE_SHOPIFY_API_VERSION || "2025-07";
const handles = [
  "keshtune-ayurvedic-hair-oil",
  "kumkumadi-glow-face-oil",
  "balbuddhi-swarnaprashan",
  "himalayan-shilajit-gold-plus-resin",
];

for (const h of handles) {
  const query = `query { product(handle: "${h}") { title handle } }`;
  const r = await fetch(`https://${domain}/api/${ver}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query }),
  });
  const j = await r.json();
  console.log(h, "→", j.data?.product?.title || "NOT FOUND", j.errors || "");
}
