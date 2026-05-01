import type { Product } from "./types";

export const CATEGORY_DEFAULTS = {
  EDP: { unitsPerBox: 12, pricePerBox: 1_200_000 },
  EDT: { unitsPerBox: 12, pricePerBox: 900_000 },
  "Body Mist": { unitsPerBox: 24, pricePerBox: 720_000 },
  "Hand Body": { unitsPerBox: 24, pricePerBox: 600_000 },
  "Body Wash": { unitsPerBox: 12, pricePerBox: 540_000 },
} as const;

export const INITIAL_PRODUCTS: Product[] = [
  { code: "VCA-EDP-BP", name: "Vica EDP Blush Peony", category: "EDP", ...CATEGORY_DEFAULTS.EDP },
  { code: "VCA-EDP-VA", name: "Vica EDP Vanilla Amber", category: "EDP", ...CATEGORY_DEFAULTS.EDP },
  { code: "VCA-EDP-FM", name: "Vica EDP Fresh Marine", category: "EDP", ...CATEGORY_DEFAULTS.EDP },
  { code: "VCA-EDT-BP", name: "Vica EDT Blush Peony", category: "EDT", ...CATEGORY_DEFAULTS.EDT },
  { code: "VCA-EDT-VA", name: "Vica EDT Vanilla Amber", category: "EDT", ...CATEGORY_DEFAULTS.EDT },
  { code: "VCA-EDT-FM", name: "Vica EDT Fresh Marine", category: "EDT", ...CATEGORY_DEFAULTS.EDT },
  { code: "VCA-BM-BP", name: "Vica Body Mist Blush Peony", category: "Body Mist", ...CATEGORY_DEFAULTS["Body Mist"] },
  { code: "VCA-BM-VA", name: "Vica Body Mist Vanilla Amber", category: "Body Mist", ...CATEGORY_DEFAULTS["Body Mist"] },
  { code: "VCA-BM-FM", name: "Vica Body Mist Fresh Marine", category: "Body Mist", ...CATEGORY_DEFAULTS["Body Mist"] },
  { code: "VCA-HB-BP", name: "Vica Hand Body Blush Peony", category: "Hand Body", ...CATEGORY_DEFAULTS["Hand Body"] },
  { code: "VCA-HB-VA", name: "Vica Hand Body Vanilla Amber", category: "Hand Body", ...CATEGORY_DEFAULTS["Hand Body"] },
  { code: "VCA-HB-FM", name: "Vica Hand Body Fresh Marine", category: "Hand Body", ...CATEGORY_DEFAULTS["Hand Body"] },
  { code: "VCA-BW-BP", name: "Vica Body Wash Blush Peony", category: "Body Wash", ...CATEGORY_DEFAULTS["Body Wash"] },
  { code: "VCA-BW-VA", name: "Vica Body Wash Vanilla Amber", category: "Body Wash", ...CATEGORY_DEFAULTS["Body Wash"] },
  { code: "VCA-BW-FM", name: "Vica Body Wash Fresh Marine", category: "Body Wash", ...CATEGORY_DEFAULTS["Body Wash"] },
];
