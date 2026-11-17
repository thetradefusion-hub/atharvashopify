#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Seed Vaidyadeep products (Firecrawl scrape → Shopify Admin API).
 * Usage: node scripts/seed-vaidyadeep.mjs
 *
 * Requires SHOPIFY_ADMIN_TOKEN with write_products + read_products
 * (+ write_publications recommended) on nbabhd-xj.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function loadEnvFile(file, override = false) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf-8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (override || !(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(path.join(repoRoot, ".env"), false);
loadEnvFile(path.join(repoRoot, ".env.local"), true);

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || process.env.VITE_SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION =
  process.env.SHOPIFY_API_VERSION || process.env.VITE_SHOPIFY_API_VERSION || "2025-07";

if (!STORE_DOMAIN || !ADMIN_TOKEN) {
  console.error("Missing SHOPIFY_STORE_DOMAIN + SHOPIFY_ADMIN_TOKEN in .env.local");
  process.exit(1);
}

const ADMIN_GRAPHQL_URL = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`;
const ADMIN_REST_URL = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function logStep(step, msg) {
  const ts = new Date().toISOString().split("T")[1].split(".")[0];
  console.log(`[${ts}] ${step.padEnd(10)} ${msg}`);
}

async function adminGraphql(query, variables = {}) {
  const res = await fetch(ADMIN_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Admin GraphQL ${res.status}: ${text.slice(0, 600)}`);
  const json = JSON.parse(text);
  if (json.errors) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  return json.data;
}

async function adminRest(method, endpoint, body) {
  const res = await fetch(`${ADMIN_REST_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Admin REST ${method} ${endpoint} → ${res.status}: ${text.slice(0, 600)}`);
  }
  return text ? JSON.parse(text) : {};
}

async function checkScopes() {
  const res = await fetch(`https://${STORE_DOMAIN}/admin/oauth/access_scopes.json`, {
    headers: { "X-Shopify-Access-Token": ADMIN_TOKEN },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`access_scopes ${res.status}: ${text.slice(0, 400)}`);
  const scopes = JSON.parse(text).access_scopes?.map((s) => s.handle) || [];
  const need = ["write_products", "read_products"];
  const missing = need.filter((s) => !scopes.includes(s));
  return { scopes, missing };
}

const FIND_COLLECTION = /* GraphQL */ `
  query FindCollection($handle: String!) {
    collectionByHandle(handle: $handle) { id handle title }
  }
`;
const CREATE_COLLECTION = /* GraphQL */ `
  mutation CreateCollection($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection { id handle title }
      userErrors { field message }
    }
  }
`;
const FIND_PRODUCT = /* GraphQL */ `
  query FindProduct($handle: String!) {
    productByHandle(handle: $handle) { id handle title }
  }
`;
const COLLECTION_ADD = /* GraphQL */ `
  mutation AddProducts($id: ID!, $productIds: [ID!]!) {
    collectionAddProducts(id: $id, productIds: $productIds) {
      userErrors { field message }
    }
  }
`;

async function ensureCollection(collection) {
  const existing = await adminGraphql(FIND_COLLECTION, { handle: collection.handle });
  if (existing.collectionByHandle) {
    logStep("collection", `✓ exists  ${collection.handle}`);
    return existing.collectionByHandle.id;
  }
  const data = await adminGraphql(CREATE_COLLECTION, {
    input: {
      handle: collection.handle,
      title: collection.title,
      descriptionHtml: `<p>${collection.description || ""}</p>`,
    },
  });
  const errs = data.collectionCreate.userErrors;
  if (errs.length) {
    throw new Error(`collectionCreate ${collection.handle}: ${JSON.stringify(errs)}`);
  }
  logStep("collection", `+ created ${collection.handle}`);
  return data.collectionCreate.collection.id;
}

async function ensureProduct(product) {
  const existing = await adminGraphql(FIND_PRODUCT, { handle: product.handle });
  if (existing.productByHandle) {
    logStep("product", `✓ exists  ${product.handle} — updating images/body if needed`);
    // Update existing product body + images via REST
    const numericId = existing.productByHandle.id.replace(/\D/g, "");
    const bodyHtml =
      product.descriptionHtml || `<p>${product.description || ""}</p>`;
    await adminRest("PUT", `/products/${numericId}.json`, {
      product: {
        id: Number(numericId),
        body_html: bodyHtml,
        vendor: product.vendor || "Vaidyadeep Ayurveda",
        product_type: product.productType || "Ayurvedic",
        tags: (product.tags || []).join(", "),
        images: (product.imageUrls || []).filter(Boolean).map((src) => ({ src })),
        variants: [
          {
            price: Number(product.price).toFixed(2),
            compare_at_price: product.compareAtPrice
              ? Number(product.compareAtPrice).toFixed(2)
              : null,
            sku: product.sku || undefined,
          },
        ],
      },
    });
    logStep("product", `~ updated ${product.handle}`);
    return existing.productByHandle.id;
  }

  const bodyHtml = product.descriptionHtml || `<p>${product.description || ""}</p>`;
  const restPayload = {
    product: {
      title: product.title,
      body_html: bodyHtml,
      vendor: product.vendor || "Vaidyadeep Ayurveda",
      product_type: product.productType || "Ayurvedic",
      handle: product.handle,
      tags: (product.tags || []).join(", "),
      status: "active",
      published: true,
      variants: [
        {
          price: Number(product.price).toFixed(2),
          compare_at_price: product.compareAtPrice
            ? Number(product.compareAtPrice).toFixed(2)
            : null,
          sku: product.sku || undefined,
          inventory_management: "shopify",
          inventory_quantity: product.inventoryQuantity ?? 50,
          requires_shipping: true,
          taxable: true,
        },
      ],
      images: (product.imageUrls || []).filter(Boolean).map((src) => ({ src })),
    },
  };

  const created = await adminRest("POST", "/products.json", restPayload);
  const productGid = `gid://shopify/Product/${created.product.id}`;
  logStep(
    "product",
    `+ created ${product.handle} (${created.product.images?.length || 0} images)`,
  );
  return productGid;
}

async function assignToCollections(productGid, collectionGids) {
  for (const cid of collectionGids) {
    const data = await adminGraphql(COLLECTION_ADD, {
      id: cid,
      productIds: [productGid],
    });
    const errs = data.collectionAddProducts.userErrors || [];
    if (errs.length) {
      const msg = errs.map((e) => e.message).join("; ");
      if (!/already/i.test(msg)) throw new Error(`collectionAddProducts: ${msg}`);
    }
    await sleep(250);
  }
}

async function main() {
  const argPath = process.argv[2];
  const resolved = argPath
    ? path.isAbsolute(argPath)
      ? argPath
      : path.resolve(process.cwd(), argPath)
    : path.resolve(__dirname, "vaidyadeep-products.json");
  const data = JSON.parse(fs.readFileSync(resolved, "utf-8"));

  console.log(`\n→ Seeding Vaidyadeep → ${STORE_DOMAIN}`);
  console.log(`→ Source file: ${resolved}`);
  console.log(`→ ${data.collections.length} collections, ${data.products.length} products\n`);

  const { scopes, missing } = await checkScopes();
  if (missing.length) {
    console.error("✗ SHOPIFY_ADMIN_TOKEN missing required Admin scopes:");
    console.error(`  need: ${missing.join(", ")}`);
    console.error(`  have: ${scopes.join(", ") || "(none)"}`);
    console.error(
      "\nCreate a Custom App → Admin API scopes write_products + read_products,\n" +
        "install it, paste the new shpat_ token into .env.local as SHOPIFY_ADMIN_TOKEN,\n" +
        "then re-run: npm run seed:vaidyadeep-pdf\n",
    );
    console.error(`Catalogue ready at ${resolved} — seed will use it once scopes are fixed.\n`);
    process.exit(2);
  }

  const collectionGidByHandle = {};
  for (const c of data.collections) {
    collectionGidByHandle[c.handle] = await ensureCollection(c);
    await sleep(500);
  }

  for (const p of data.products) {
    const productGid = await ensureProduct(p);
    await sleep(700);
    const collectionGids = (p.collections || [])
      .map((h) => collectionGidByHandle[h])
      .filter(Boolean);
    if (collectionGids.length) await assignToCollections(productGid, collectionGids);
  }

  console.log("\n✓ Vaidyadeep seed complete.\n");
}

main().catch((err) => {
  console.error("\n✗ Seed failed:", err.message || err);
  process.exit(1);
});
