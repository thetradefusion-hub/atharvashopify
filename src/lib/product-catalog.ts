import type { ShopifyProduct } from "@/lib/shopify";
import {
  fetchShopifyProductByHandle,
  storefrontApiRequest,
  STOREFRONT_PRODUCTS_QUERY,
} from "@/lib/shopify";

/** Shopify product handle — include legacy + CSV import variants for lookup resilience. */
export type ProductHandle = string;

export type CatalogProduct = {
  label: string;
  /** First matching published product is used on the storefront. */
  handles: ProductHandle[];
};

export type CatalogSection = {
  id: string;
  title: string;
  tagline: string;
  emoji: string;
  desc: string;
  collectionHandle: string;
  products: CatalogProduct[];
  accent: "primary" | "yellow" | "orange" | "green";
};

/**
 * Live catalogue handles on nbabhd-xj (Vaidyadeep seed / import).
 * Keep DARDGO aliases last so old stores still resolve if those products exist.
 */
const H = {
  keshtune: [
    "keshtune-ayurvedic-hair-oil",
    "dardgo-ayurvedic-hair-oil",
    "dardgo-ayurvedic-hair-oil-for-hair-fall-dandruff-hair-growth-100-natural-non-sticky-15-herb-nour",
  ],
  kumkumadi: ["kumkumadi-glow-face-oil"],
  balbuddhi: ["balbuddhi-swarnaprashan"],
  shilajit: ["himalayan-shilajit-gold-plus-resin"],
  // PDF catalogue handles (show once imported / seeded)
  dermadeepSyrup: ["dermadeep-syrup"],
  dermadeepOil: ["dermadeep-oil"],
  deepFungal: ["deep-fungal-capsules"],
  deepStoneTab: ["deep-stone-tablet"],
  deepStoneSyr: ["deep-stone-syrup"],
  deepCardioCap: ["deep-cardio-capsules"],
  deepCardioSyr: ["deep-cardio-syrup"],
  deepSwans: ["deep-swans-capsules"],
  deepCough: ["deep-cough-syrup"],
  deepThyroid: ["deep-thyroid-tablet"],
  deepImmunity: ["deep-immunity-capsules"],
  mindProfiters: ["mind-profiters-syrup"],
  deepHairCap: ["deep-hair-capsules"],
  arshCap: ["arsh-deep-capsules"],
  arshSyr: ["arsh-deep-syrup"],
  arshOint: ["arsh-deep-ointment"],
  deepSlim: ["deep-slim-capsules"],
  deepBone: ["deep-bone-tablet"],
  vednaSyr: ["vedna-mukt-plus-syrup"],
  vednaGold: ["vedna-mukt-gold-capsules"],
  vednaCap: ["vedna-mukt-capsules"],
  vednaOil: ["vedna-mukt-oil"],
  streeSyr: ["deep-stree-syrup"],
  streeCap: ["deep-stree-capsules"],
  pcos: ["deep-pcos-capsules"],
  deepLax: ["deep-lax"],
  deepDigest: ["deep-digest-syrup"],
  livDs: ["deep-liv-ds-capsules"],
  livSyr: ["deep-liv-syrup"],
  neuro: ["deep-neuro-capsules"],
  diabSyr: ["diabetone-ds-syrup"],
  diabCap: ["diabetone-ds-capsules"],
  urjasCap: ["urjas-deep-gold-plus-capsules"],
  urjasOil: ["urjas-deep-oil"],
  urjasSyr: ["urjas-deep-syrup"],
  // Legacy DARDGO (ignored if not on store)
  painOil: [
    "dardgo-herbal-pain-relief-massage-oil-supports-muscle-relaxation-care",
    "dardgo-herbal-pain-relief-massage-oil",
  ],
  rollOn: [
    "dardgo-ayurvedic-pain-relief-roll-on-joint-muscle-support-60-ml",
    "dardgo-ayurvedic-pain-relief-roll-on",
  ],
} as const;

/** Homepage hero grid + first showcase block */
export const CUSTOMER_FAVOURITES: CatalogProduct[] = [
  { label: "Keshtune Hair Oil", handles: [...H.keshtune] },
  { label: "Kumkumadi Face Oil", handles: [...H.kumkumadi] },
  { label: "Balbuddhi Swarnaprashan", handles: [...H.balbuddhi] },
  { label: "Shilajit Gold Plus", handles: [...H.shilajit] },
  { label: "Deep Immunity", handles: [...H.deepImmunity] },
  { label: "Vedna Mukt Oil", handles: [...H.vednaOil] },
  { label: "Dermadeep Syrup", handles: [...H.dermadeepSyrup] },
  { label: "Diabetone DS", handles: [...H.diabSyr] },
];

export const CATALOG_SECTIONS: CatalogSection[] = [
  {
    id: "wellness-oil-balm",
    title: "Wellness Oil & Balm",
    tagline: "Massage oils and roll-ons for everyday comfort and relaxation.",
    emoji: "💧",
    desc: "Oils & roll-ons",
    collectionHandle: "wellness-oil-balm",
    accent: "primary",
    products: [
      { label: "Keshtune Hair Oil", handles: [...H.keshtune] },
      { label: "Vedna Mukt Oil", handles: [...H.vednaOil] },
      { label: "Dermadeep Oil", handles: [...H.dermadeepOil] },
      { label: "Pain Relief Oil", handles: [...H.painOil] },
      { label: "Roll On", handles: [...H.rollOn] },
    ],
  },
  {
    id: "joint-mobility",
    title: "Joint & Mobility Care",
    tagline: "Tablet and oil support for joint comfort and mobility routines.",
    emoji: "🦴",
    desc: "Joint & bone care",
    collectionHandle: "joint-mobility",
    accent: "yellow",
    products: [
      { label: "Vedna Mukt Plus Syrup", handles: [...H.vednaSyr] },
      { label: "Vedna Mukt Gold", handles: [...H.vednaGold] },
      { label: "Vedna Mukt Capsules", handles: [...H.vednaCap] },
      { label: "Deep Bone Tablet", handles: [...H.deepBone] },
      { label: "Vedna Mukt Oil", handles: [...H.vednaOil] },
    ],
  },
  {
    id: "immunity-wellness",
    title: "Immunity & Wellness",
    tagline: "Classical formulations for vitality, kids’ immunity, and daily balance.",
    emoji: "🛡️",
    desc: "Immunity & vitality",
    collectionHandle: "immunity-wellness",
    accent: "green",
    products: [
      { label: "Balbuddhi Swarnaprashan", handles: [...H.balbuddhi] },
      { label: "Deep Immunity", handles: [...H.deepImmunity] },
      { label: "Shilajit Gold Plus", handles: [...H.shilajit] },
      { label: "Mind Profiters", handles: [...H.mindProfiters] },
      { label: "Urjas Deep Capsules", handles: [...H.urjasCap] },
    ],
  },
  {
    id: "digestive-wellness",
    title: "Digestive Wellness",
    tagline: "Herbal support for digestion, gut comfort, and metabolic balance.",
    emoji: "🌿",
    desc: "Digestive care",
    collectionHandle: "digestive-wellness",
    accent: "primary",
    products: [
      { label: "Deep Digest Syrup", handles: [...H.deepDigest] },
      { label: "Deep-Lax", handles: [...H.deepLax] },
      { label: "Deep Liv DS", handles: [...H.livDs] },
      { label: "Deep Liv Syrup", handles: [...H.livSyr] },
    ],
  },
  {
    id: "beauty-personal-care",
    title: "Beauty & Personal Care",
    tagline: "Skin, hair, and daily personal care from botanical Ayurveda.",
    emoji: "✨",
    desc: "Beauty range",
    collectionHandle: "beauty-personal-care",
    accent: "orange",
    products: [
      { label: "Kumkumadi Face Oil", handles: [...H.kumkumadi] },
      { label: "Keshtune Hair Oil", handles: [...H.keshtune] },
      { label: "Deep Hair Capsules", handles: [...H.deepHairCap] },
      { label: "Dermadeep Syrup", handles: [...H.dermadeepSyrup] },
      { label: "Dermadeep Oil", handles: [...H.dermadeepOil] },
    ],
  },
  {
    id: "health-wellness-support",
    title: "Health & Wellness Support",
    tagline: "Targeted support for sugar balance, heart, kidney, and respiratory comfort.",
    emoji: "💚",
    desc: "Health support",
    collectionHandle: "health-wellness-support",
    accent: "orange",
    products: [
      { label: "Diabetone DS Syrup", handles: [...H.diabSyr] },
      { label: "Diabetone DS Capsules", handles: [...H.diabCap] },
      { label: "Deep Cardio Capsules", handles: [...H.deepCardioCap] },
      { label: "Deep Stone Tablet", handles: [...H.deepStoneTab] },
      { label: "Deep Cough Syrup", handles: [...H.deepCough] },
      { label: "Deep Swans Capsules", handles: [...H.deepSwans] },
    ],
  },
];

const SECTION_BY_HANDLE = new Map(
  CATALOG_SECTIONS.map((s) => [s.collectionHandle, s] as const),
);

export function getCatalogSectionByHandle(handle: string): CatalogSection | undefined {
  return SECTION_BY_HANDLE.get(handle);
}

export function isCatalogCollectionHandle(handle: string): boolean {
  return SECTION_BY_HANDLE.has(handle);
}

export function sectionAllHandles(section: CatalogSection): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of section.products) {
    for (const h of p.handles) {
      if (!seen.has(h)) {
        seen.add(h);
        out.push(h);
      }
    }
  }
  return out;
}

export function favouritesAllHandles(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of CUSTOMER_FAVOURITES) {
    for (const h of p.handles) {
      if (!seen.has(h)) {
        seen.add(h);
        out.push(h);
      }
    }
  }
  return out;
}

export function handlesToStorefrontQuery(handles: string[]): string {
  return handles.map((h) => `handle:${h}`).join(" OR ");
}

/** Resolve one catalog row — tries each handle until a published product is found. */
async function fetchCatalogProductEntry(item: CatalogProduct): Promise<ShopifyProduct | null> {
  for (const handle of item.handles) {
    const product = await fetchShopifyProductByHandle(handle);
    if (product) return product;
  }
  return null;
}

/** Fetch any published products from the storefront (fallback when handles miss). */
export async function fetchAnyStorefrontProducts(first = 12): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, {
    first,
    query: null,
    sortKey: "BEST_SELLING",
    reverse: false,
  });
  const edges = data?.data?.products?.edges as Array<{ node: ShopifyProduct["node"] }> | undefined;
  if (!edges?.length) return [];
  return edges.map((e) => ({ node: e.node }));
}

/** Fetch products and preserve catalog order (one card per catalog product entry). */
export async function fetchCatalogProducts(
  catalogProducts: CatalogProduct[],
  maxTotal = 24,
  options?: { fallbackToStore?: boolean },
): Promise<ShopifyProduct[]> {
  const slice = catalogProducts.slice(0, maxTotal);
  const results = await Promise.all(slice.map((item) => fetchCatalogProductEntry(item)));
  const found = results.filter((p): p is ShopifyProduct => p !== null);
  if (found.length > 0 || options?.fallbackToStore === false) return found;
  return fetchAnyStorefrontProducts(maxTotal);
}

/** Fetch many handles in order (for collection pages). */
export async function fetchProductsByHandles(handles: string[]): Promise<ShopifyProduct[]> {
  const unique = [...new Set(handles)];
  const pairs = await Promise.all(
    unique.map(async (h) => [h, await fetchShopifyProductByHandle(h)] as const),
  );
  const byHandle = new Map(pairs.filter(([, p]) => p).map(([h, p]) => [h, p!]));
  const result: ShopifyProduct[] = [];
  const usedIds = new Set<string>();
  for (const h of handles) {
    const product = byHandle.get(h);
    if (product && !usedIds.has(product.node.id)) {
      usedIds.add(product.node.id);
      result.push(product);
    }
  }
  return result;
}

export const COLLECTION_PAGE_TITLES: Record<string, string> = {
  "customer-favourites": "Customer Favourites",
  "wellness-oil-balm": "Wellness Oil & Balm",
  "joint-mobility": "Joint & Mobility Care",
  "immunity-wellness": "Immunity & Wellness",
  "digestive-wellness": "Digestive Wellness",
  "beauty-personal-care": "Beauty & Personal Care",
  "health-wellness-support": "Health & Wellness Support",
  "pain-relief-oils": "Wellness Oil & Balm",
  "ayurvedic-tablets": "Joint & Mobility Care",
  "ayurvedic-halwa": "Immunity & Wellness",
  "ayurvedic-powder": "Digestive & Health Powders",
  "ayurvedic-beauty": "Beauty & Personal Care",
  "ayurvedic-capsules": "Health & Wellness Support",
};
