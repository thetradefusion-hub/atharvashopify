#!/usr/bin/env node
/**
 * Build Shopify import CSV from the Vidyadeep 42-page catalogue PDF
 * (parsed via Firecrawl → curated into vaidyadeep-pdf-products.json).
 *
 * Usage:  node scripts/build-vaidyadeep-pdf-csv.mjs
 * Output: scripts/vaidyadeep-pdf-shopify-import.csv
 *
 * Same CSV columns as scripts/build-vaidyadeep-csv.mjs.
 * Prices marked 0 need manual update in Shopify (PDF has no clear MRP for most SKUs).
 * Products that match vaidyadeepayurveda.com keep scraped price + image URLs.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "vaidyadeep-pdf-products.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

function esc(v) {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const headers = [
  "Handle",
  "Title",
  "Body (HTML)",
  "Vendor",
  "Type",
  "Tags",
  "Published",
  "Option1 Name",
  "Option1 Value",
  "Variant SKU",
  "Variant Grams",
  "Variant Inventory Tracker",
  "Variant Inventory Qty",
  "Variant Inventory Policy",
  "Variant Fulfillment Service",
  "Variant Price",
  "Variant Compare At Price",
  "Variant Requires Shipping",
  "Variant Taxable",
  "Image Src",
  "Image Position",
  "Image Alt Text",
  "Gift Card",
  "SEO Title",
  "SEO Description",
  "Status",
];

const rows = [headers.join(",")];
let withImages = 0;
let withPrice = 0;

for (const p of data.products) {
  const imgs = (p.imageUrls || []).filter(Boolean);
  if (imgs.length) withImages++;
  if (p.price && Number(p.price) > 0) withPrice++;
  const body = p.descriptionHtml || `<p>${p.description || ""}</p>`;
  const n = Math.max(imgs.length, 1);
  for (let i = 0; i < n; i++) {
    const first = i === 0;
    const price = Number(p.price || 0);
    const compare = p.compareAtPrice != null ? Number(p.compareAtPrice) : null;
    rows.push(
      [
        esc(p.handle),
        esc(first ? p.title : ""),
        esc(first ? body : ""),
        esc(first ? p.vendor || "Vaidyadeep Ayurveda" : ""),
        esc(first ? p.productType || "" : ""),
        esc(first ? (p.tags || []).join(", ") : ""),
        esc(first ? "TRUE" : ""),
        esc(first ? "Title" : ""),
        esc(first ? "Default Title" : ""),
        esc(first ? p.sku || "" : ""),
        esc(first ? "0" : ""),
        esc(first ? "shopify" : ""),
        esc(first ? String(p.inventoryQuantity ?? 50) : ""),
        esc(first ? "deny" : ""),
        esc(first ? "manual" : ""),
        esc(first ? price.toFixed(2) : ""),
        esc(first && compare != null && compare > 0 ? compare.toFixed(2) : ""),
        esc(first ? "TRUE" : ""),
        esc(first ? "TRUE" : ""),
        esc(imgs[i] || ""),
        esc(imgs[i] ? String(i + 1) : ""),
        esc(imgs[i] ? p.title : ""),
        esc(first ? "FALSE" : ""),
        esc(first ? p.title : ""),
        esc(first ? p.description || "" : ""),
        esc(first ? (p.price && Number(p.price) > 0 ? "active" : "draft") : ""),
      ].join(","),
    );
  }
}

const out = path.join(__dirname, "vaidyadeep-pdf-shopify-import.csv");
fs.writeFileSync(out, rows.join("\n"), "utf-8");
console.log(`\n✓ Wrote ${out}`);
console.log(`  Products : ${data.products.length}`);
console.log(`  CSV rows : ${rows.length - 1}`);
console.log(`  With price: ${withPrice} (rest draft @ ₹0 — set MRP in admin)`);
console.log(`  With images: ${withImages}\n`);
