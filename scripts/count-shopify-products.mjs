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
const storefrontToken = env.VITE_SHOPIFY_STOREFRONT_TOKEN;
const ver = env.VITE_SHOPIFY_API_VERSION || "2025-07";

async function adminCount() {
  const query = `
    {
      shop { name }
      productsCount { count }
    }
  `;
  const r = await fetch(`https://${domain}/admin/api/${ver}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken,
    },
    body: JSON.stringify({ query }),
  });
  const j = await r.json();
  if (j.errors || j.data?.productsCount == null) {
    // Fallback: paginate Admin REST / GraphQL edges
    let count = 0;
    let cursor = null;
    let hasNext = true;
    let shop = null;
    const byStatus = {};
    while (hasNext) {
      const q = `
        query ($cursor: String) {
          shop { name }
          products(first: 100, after: $cursor) {
            edges { node { id title status } }
            pageInfo { hasNextPage endCursor }
          }
        }
      `;
      const res = await fetch(`https://${domain}/admin/api/${ver}/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": adminToken,
        },
        body: JSON.stringify({ query: q, variables: { cursor } }),
      });
      const data = await res.json();
      if (data.errors) return { ok: false, errors: data.errors };
      shop = data.data.shop.name;
      const edges = data.data.products.edges;
      count += edges.length;
      for (const e of edges) {
        byStatus[e.node.status] = (byStatus[e.node.status] || 0) + 1;
      }
      hasNext = data.data.products.pageInfo.hasNextPage;
      cursor = data.data.products.pageInfo.endCursor;
    }
    return { ok: true, shop, count, byStatus };
  }
  return {
    ok: true,
    shop: j.data?.shop?.name,
    count: j.data?.productsCount?.count,
    raw: j,
  };
}

async function storefrontPublishedCount() {
  let count = 0;
  let cursor = null;
  let hasNext = true;
  let shop = null;
  const titles = [];
  while (hasNext) {
    const query = `
      query ($cursor: String) {
        shop { name }
        products(first: 100, after: $cursor) {
          edges { cursor node { title handle } }
          pageInfo { hasNextPage endCursor }
        }
      }
    `;
    const r = await fetch(`https://${domain}/api/${ver}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontToken,
      },
      body: JSON.stringify({ query, variables: { cursor } }),
    });
    const j = await r.json();
    if (j.errors) return { ok: false, errors: j.errors };
    shop = j.data.shop.name;
    const edges = j.data.products.edges;
    count += edges.length;
    if (titles.length < 5) titles.push(...edges.map((e) => e.node.title).slice(0, 5 - titles.length));
    hasNext = j.data.products.pageInfo.hasNextPage;
    cursor = j.data.products.pageInfo.endCursor;
  }
  return { ok: true, shop, count, sampleTitles: titles };
}

const admin = await adminCount();
const storefront = await storefrontPublishedCount();
console.log(JSON.stringify({ domain, admin, storefront }, null, 2));
