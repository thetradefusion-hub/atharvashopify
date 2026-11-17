#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, "vaidyadeep-products.json"), "utf-8"),
);

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

for (const p of data.products) {
  const imgs = p.imageUrls || [];
  const body = p.descriptionHtml || p.description || "";
  const n = Math.max(imgs.length, 1);
  for (let i = 0; i < n; i++) {
    const first = i === 0;
    rows.push(
      [
        esc(p.handle),
        esc(first ? p.title : ""),
        esc(first ? body : ""),
        esc(first ? p.vendor || "" : ""),
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
        esc(first ? Number(p.price).toFixed(2) : ""),
        esc(first && p.compareAtPrice ? Number(p.compareAtPrice).toFixed(2) : ""),
        esc(first ? "TRUE" : ""),
        esc(first ? "TRUE" : ""),
        esc(imgs[i] || ""),
        esc(imgs[i] ? String(i + 1) : ""),
        esc(imgs[i] ? p.title : ""),
        esc(first ? "FALSE" : ""),
        esc(first ? p.title : ""),
        esc(first ? p.description || "" : ""),
        esc(first ? "active" : ""),
      ].join(","),
    );
  }
}

const out = path.join(__dirname, "vaidyadeep-shopify-import.csv");
fs.writeFileSync(out, rows.join("\n"), "utf-8");
console.log(`Wrote ${out} (${rows.length - 1} data rows)`);
