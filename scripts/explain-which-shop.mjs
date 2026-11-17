import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const domain = env.VITE_SHOPIFY_STORE_DOMAIN || env.SHOPIFY_STORE_DOMAIN;
const sfToken = env.VITE_SHOPIFY_STOREFRONT_TOKEN;
const adminToken = env.SHOPIFY_ADMIN_TOKEN;
const ver = env.VITE_SHOPIFY_API_VERSION || "2025-07";

console.log("=== FROM .env.local ===");
console.log("VITE_SHOPIFY_STORE_DOMAIN:", domain);
console.log(
  "VITE_SHOPIFY_STOREFRONT_TOKEN ends:",
  sfToken ? `...${sfToken.slice(-6)} (len ${sfToken.length})` : "(missing)",
);
console.log(
  "SHOPIFY_ADMIN_TOKEN starts:",
  adminToken ? adminToken.slice(0, 6) + "..." : "(missing)",
);

const sfQuery = `{
  shop {
    name
    description
    primaryDomain { host url }
    brand { slogan shortDescription }
  }
  products(first: 3) {
    edges { node { title handle vendor } }
  }
}`;

const sfRes = await fetch(`https://${domain}/api/${ver}/graphql.json`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": sfToken,
  },
  body: JSON.stringify({ query: sfQuery }),
});
const sfJson = await sfRes.json();

console.log("\n=== WHAT SHOPIFY RETURNS FOR THAT DOMAIN+TOKEN ===");
console.log("HTTP:", sfRes.status);
console.log("Shop name:", sfJson.data?.shop?.name);
console.log("Primary domain:", sfJson.data?.shop?.primaryDomain);
console.log("Products sample:");
for (const e of sfJson.data?.products?.edges || []) {
  console.log(` - [${e.node.vendor}] ${e.node.title}`);
}
if (sfJson.errors) console.log("Errors:", JSON.stringify(sfJson.errors, null, 2));

// Check admin token scopes type
const scopeRes = await fetch(`https://${domain}/admin/oauth/access_scopes.json`, {
  headers: { "X-Shopify-Access-Token": adminToken },
});
const scopeJson = await scopeRes.json().catch(() => ({}));
const scopes = (scopeJson.access_scopes || []).map((s) => s.handle);
const isHeadlessOnly =
  scopes.length > 0 && scopes.every((s) => s.startsWith("unauthenticated_"));
console.log("\n=== TOKEN TYPE CHECK ===");
console.log("Admin token scopes count:", scopes.length);
console.log("Looks like Headless/Storefront token only?:", isHeadlessOnly);
console.log("Sample scopes:", scopes.slice(0, 5));
