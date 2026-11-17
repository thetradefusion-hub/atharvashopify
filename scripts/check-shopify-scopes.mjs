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

const domain = env.SHOPIFY_STORE_DOMAIN || env.VITE_SHOPIFY_STORE_DOMAIN;
const adminToken = env.SHOPIFY_ADMIN_TOKEN;
const ver = env.VITE_SHOPIFY_API_VERSION || "2025-07";

const r = await fetch(`https://${domain}/admin/oauth/access_scopes.json`, {
  headers: { "X-Shopify-Access-Token": adminToken },
});
const text = await r.text();
console.log("status", r.status);
console.log(text.slice(0, 2000));
