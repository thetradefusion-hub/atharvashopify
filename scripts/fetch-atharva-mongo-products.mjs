#!/usr/bin/env node
/**
 * One-off: pull Atharva products from MongoDB Atlas → scripts/atharva-products.raw.json
 * Usage:
 *   MONGODB_URI="mongodb+srv://..." node scripts/fetch-atharva-mongo-products.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outRaw = path.join(__dirname, "atharva-products.raw.json");
const outSeed = path.join(__dirname, "atharva-products.json");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Set MONGODB_URI env var");
  process.exit(1);
}

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function money(n) {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 0) return "0.00";
  return v.toFixed(2);
}

function collectImages(doc) {
  const urls = [];
  const push = (u) => {
    if (!u || typeof u !== "string") return;
    const s = u.trim();
    if (!s || s.includes("placeholder")) return;
    if (!/^https?:\/\//i.test(s)) return;
    if (!urls.includes(s)) urls.push(s);
  };
  if (Array.isArray(doc.images)) {
    for (const img of doc.images) {
      if (typeof img === "string") push(img);
      else if (img && typeof img === "object") push(img.url || img.src || img.secure_url);
    }
  }
  push(doc.image);
  push(doc.thumbnail);
  push(doc.coverImage);
  if (Array.isArray(doc.imageUrls)) doc.imageUrls.forEach(push);
  return urls;
}

function toSeedProduct(doc) {
  const title = doc.name || doc.title || "Untitled product";
  const handle = slugify(doc.slug || title) || `product-${String(doc._id).slice(-8)}`;
  const price = money(doc.price ?? doc.sellingPrice ?? doc.salePrice ?? 0);
  const compare = doc.originalPrice ?? doc.mrp ?? doc.compareAtPrice;
  const description =
    doc.description ||
    doc.shortDescription ||
    doc.details ||
    `<p>${title}</p>`;
  const tags = [];
  if (doc.category) tags.push(String(doc.category));
  if (Array.isArray(doc.concern)) tags.push(...doc.concern.map(String));
  if (doc.productType) tags.push(String(doc.productType));
  if (doc.isBestseller) tags.push("bestseller");
  if (doc.isNew) tags.push("new");

  return {
    handle,
    title,
    bodyHtml: String(description).includes("<")
      ? String(description)
      : `<p>${String(description).replace(/\n+/g, "</p><p>")}</p>`,
    vendor: "Atharva Health Solutions",
    productType: doc.productType || doc.category || "Ayurvedic",
    tags: [...new Set(tags.filter(Boolean))],
    price,
    compareAtPrice: compare != null && Number(compare) > Number(price) ? money(compare) : undefined,
    sku: doc.sku || handle.slice(0, 40).toUpperCase(),
    imageUrls: collectImages(doc),
    collections: [
      ...(doc.category ? [slugify(doc.category)] : []),
      ...(Array.isArray(doc.concern) ? doc.concern.map((c) => slugify(c)) : []),
      "all-products",
    ].filter(Boolean),
    status: doc.isActive === false || doc.active === false ? "draft" : "active",
    sourceId: String(doc._id),
  };
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
try {
  await client.connect();
  const db = client.db();
  console.log("Connected DB:", db.databaseName);
  const cols = await db.listCollections().toArray();
  console.log(
    "Collections:",
    cols.map((c) => c.name).join(", "),
  );

  // Prefer obvious product collection names
  const preferred = ["products", "product", "Products", "catalog"];
  let productColName =
    preferred.find((n) => cols.some((c) => c.name === n)) ||
    cols.find((c) => /product/i.test(c.name))?.name;

  if (!productColName) {
    console.error("No products collection found");
    process.exit(1);
  }

  const col = db.collection(productColName);
  const total = await col.countDocuments();
  console.log(`Using collection "${productColName}" — ${total} docs`);

  const docs = await col.find({}).toArray();
  fs.writeFileSync(outRaw, JSON.stringify(docs, null, 2));
  console.log("Wrote", outRaw);

  // Sample keys
  if (docs[0]) {
    console.log("Sample keys:", Object.keys(docs[0]).join(", "));
    console.log(
      "Sample title/price/images:",
      docs[0].name || docs[0].title,
      docs[0].price,
      collectImages(docs[0]).slice(0, 2),
    );
  }

  const seed = {
    source: "mongodb:atharvahelth",
    fetchedAt: new Date().toISOString(),
    collections: [
      ...new Set(
        docs.flatMap((d) => {
          const list = [];
          if (d.category) list.push({ handle: slugify(d.category), title: String(d.category) });
          if (Array.isArray(d.concern)) {
            for (const c of d.concern) list.push({ handle: slugify(c), title: String(c) });
          }
          return list;
        }),
      ),
    ],
    products: docs.map(toSeedProduct),
  };

  // Dedupe collection entries
  const seen = new Set();
  seed.collections = seed.collections.filter((c) => {
    if (!c?.handle || seen.has(c.handle)) return false;
    seen.add(c.handle);
    return true;
  });
  seed.collections.unshift({ handle: "all-products", title: "All Products" });

  fs.writeFileSync(outSeed, JSON.stringify(seed, null, 2));
  console.log(`Wrote ${seed.products.length} products → ${outSeed}`);
  console.log(
    "With images:",
    seed.products.filter((p) => p.imageUrls.length).length,
    "/",
    seed.products.length,
  );
} finally {
  await client.close();
}
