import { calculatePrice, type PriceBreakdown } from './pricing';

const API_BASE = '/api';

// ============================================
// CATALOG TYPES — Real Crispieri Data
// ============================================

export interface ProductType {
  id: string;
  name: string;
  code: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductLine {
  id: string;
  name: string;
  code: string;
  description: string | null;
  marginPct: number;
  marginPctCafe: number;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductTypeLine {
  id: string;
  productTypeId: string;
  productLineId: string;
  isActive: boolean;
}

export interface Color {
  id: string;
  name: string;
  code: string;
  hexValue: string | null;
  surchargePct: number;
  isRAL: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductLineColor {
  id: string;
  productLineId: string;
  colorId: string;
  isActive: boolean;
}

export interface GlassOption {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductLineGlass {
  id: string;
  productLineId: string;
  glassOptionId: string;
  pricePerM2: number;
  isActive: boolean;
}

export interface Accessory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  price: number;
  priceCafe: number;
  unit: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductLineAccessory {
  id: string;
  productLineId: string;
  accessoryId: string;
  isActive: boolean;
}

export interface ProfilePrice {
  id: string;
  productLineId: string;
  profileName: string;
  profileCode: string;
  priceNatural: number;
  priceCafe: number;
  stripLengthM: number;
  isActive: boolean;
  sortOrder: number;
}

export interface PricingRule {
  id: string;
  productLineId: string;
  name: string;
  ruleType: string;
  value: number;
  unit: string | null;
  minPanels: number | null;
  maxPanels: number | null;
  isActive: boolean;
}

export interface CatalogData {
  productTypes: ProductType[];
  productLines: ProductLine[];
  productTypeLines: ProductTypeLine[];
  colors: Color[];
  productLineColors: ProductLineColor[];
  glassOptions: GlassOption[];
  productLineGlass: ProductLineGlass[];
  accessories: Accessory[];
  productLineAccessories: ProductLineAccessory[];
  profilePrices: ProfilePrice[];
  pricingRules: PricingRule[];
}

// ============================================
// QUOTE TYPES
// ============================================

export interface QuoteItemInput {
  productTypeId: string;
  productLineId: string;
  glassOptionId: string;
  colorId?: string;
  widthMm: number;
  heightMm: number;
  panelCount: number;
  quantity: number;
  observations?: string;
  accessories: { accessoryId: string; quantity: number }[];
}

export interface CreateQuoteInput {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  notes?: string;
  items: QuoteItemInput[];
}

export interface QuoteItemAccessoryResponse {
  id: string;
  accessoryId: string;
  accessory: Accessory;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface QuoteItemPriceBreakdownResponse {
  id: string;
  concept: string;
  label: string;
  amount: number;
  percentage: number | null;
  sortOrder: number;
}

export interface QuoteItemResponse {
  id: string;
  productTypeId: string;
  productLineId: string;
  glassOptionId: string;
  colorId: string | null;
  widthMm: number;
  heightMm: number;
  panelCount: number;
  quantity: number;
  observations: string | null;
  profilesTotal: number;
  glassTotal: number;
  accessoriesTotal: number;
  laborTotal: number;
  subtotal: number;
  marginAmount: number;
  preTotal: number;
  tax: number;
  total: number;
  productType: ProductType;
  productLine: ProductLine;
  glassOption: GlassOption;
  color: Color | null;
  accessories: QuoteItemAccessoryResponse[];
  priceBreakdowns: QuoteItemPriceBreakdownResponse[];
}

export interface QuoteResponse {
  id: string;
  quoteNumber: string;
  status: string;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  notes: string | null;
  totalSubtotal: number;
  totalTax: number;
  totalAmount: number;
  currency: string;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: QuoteItemResponse[];
}

// ============================================
// API FUNCTIONS
// ============================================

export async function fetchCatalog(): Promise<CatalogData> {
  const res = await fetch(`${API_BASE}/catalog`);
  if (!res.ok) throw new Error('Failed to fetch catalog');
  return res.json();
}

export async function createQuote(data: CreateQuoteInput): Promise<QuoteResponse> {
  const res = await fetch(`${API_BASE}/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Failed to create quote');
  }
  return res.json();
}

export async function fetchQuotes(params?: { page?: number; limit?: number; status?: string }): Promise<{ quotes: QuoteResponse[]; total: number; page: number; totalPages: number }> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.status) searchParams.set('status', params.status);
  
  const res = await fetch(`${API_BASE}/quotes?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch quotes');
  return res.json();
}

export async function fetchQuote(id: string): Promise<QuoteResponse> {
  const res = await fetch(`${API_BASE}/quotes/${id}`);
  if (!res.ok) throw new Error('Failed to fetch quote');
  return res.json();
}

export async function updateQuoteStatus(id: string, status: string): Promise<QuoteResponse> {
  const res = await fetch(`${API_BASE}/quotes/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update quote status');
  return res.json();
}

export async function duplicateQuote(id: string): Promise<QuoteResponse> {
  const res = await fetch(`${API_BASE}/quotes/${id}/duplicate`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to duplicate quote');
  return res.json();
}

export async function deleteQuote(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/quotes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete quote');
}

// ============================================
// CLIENT-SIDE PRICE ESTIMATION (Simplified Crispieri Formula)
// ============================================

export type ClientPriceEstimate = PriceBreakdown;

/**
 * Client-side price estimation using the same Crispieri formula as quote creation.
 */
export function estimatePrice(params: {
  widthMm: number;
  heightMm: number;
  panelCount: number;
  quantity: number;
  productLineCode: string;
  productTypeCode: string;
  marginPct: number;
  marginPctCafe: number;
  colorCode: string;
  glassPricePerM2: number;
  accessoryPrices: { name?: string; price: number; priceCafe: number; code: string; unit?: string; quantity: number }[];
  profilePrices?: ProfilePrice[];
  laborCost?: number;
  roundingMultiple?: number;
  minimumAreaM2?: number;
}): ClientPriceEstimate {
  return calculatePrice({
    widthMm: params.widthMm,
    heightMm: params.heightMm,
    panelCount: params.panelCount,
    quantity: params.quantity,
    productLineCode: params.productLineCode,
    productTypeCode: params.productTypeCode,
    marginPct: params.marginPct,
    marginPctCafe: params.marginPctCafe,
    colorCode: params.colorCode,
    glassPricePerM2: params.glassPricePerM2,
    profilePrices: params.profilePrices ?? [],
    accessoryPrices: params.accessoryPrices.map((acc) => ({
      name: acc.name ?? acc.code,
      code: acc.code,
      price: acc.price,
      priceCafe: acc.priceCafe,
      unit: acc.unit ?? 'unidad',
      quantity: acc.quantity,
    })),
    laborCost: params.laborCost ?? 20000,
    roundingMultiple: params.roundingMultiple ?? 1000,
    minimumAreaM2: params.minimumAreaM2,
  });
}

// ============================================
// CATALOG HELPER FUNCTIONS
// ============================================

/**
 * Get available glass options for a given product line.
 */
export function getAvailableGlassOptions(catalog: CatalogData, productLineId: string): GlassOption[] {
  const glassIds = catalog.productLineGlass
    .filter(plg => plg.productLineId === productLineId)
    .map(plg => plg.glassOptionId);
  return catalog.glassOptions
    .filter(g => glassIds.includes(g.id))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get glass price per m² for a given product line and glass option.
 */
export function getGlassPrice(catalog: CatalogData, productLineId: string, glassOptionId: string): number {
  const plg = catalog.productLineGlass.find(
    plg => plg.productLineId === productLineId && plg.glassOptionId === glassOptionId
  );
  return plg?.pricePerM2 ?? 0;
}

/**
 * Get available colors for a given product line.
 */
export function getAvailableColors(catalog: CatalogData, productLineId: string): Color[] {
  const colorIds = catalog.productLineColors
    .filter(plc => plc.productLineId === productLineId)
    .map(plc => plc.colorId);
  return catalog.colors
    .filter(c => colorIds.includes(c.id))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get available accessories for a given product line.
 */
export function getAvailableAccessories(catalog: CatalogData, productLineId: string): Accessory[] {
  const accIds = catalog.productLineAccessories
    .filter(pla => pla.productLineId === productLineId)
    .map(pla => pla.accessoryId);
  return catalog.accessories
    .filter(a => accIds.includes(a.id))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Get profile prices for a given product line.
 */
export function getProfilePrices(catalog: CatalogData, productLineId: string): ProfilePrice[] {
  return catalog.profilePrices.filter(pp => pp.productLineId === productLineId);
}

/**
 * Get the rounding multiple for a given product line.
 */
export function getRoundingMultiple(catalog: CatalogData, productLineId: string): number {
  const rule = catalog.pricingRules.find(
    r => r.productLineId === productLineId && r.ruleType === 'rounding_multiple'
  );
  return rule?.value ?? 1000;
}

/**
 * Get the labor cost for a given product line (from pricing rules, fallback to 20000).
 */
export function getLaborCost(catalog: CatalogData, productLineId: string): number {
  const rule = catalog.pricingRules.find(
    r => r.productLineId === productLineId && r.ruleType === 'labor_cost'
  );
  return rule?.value ?? 20000;
}

/**
 * Get the minimum billable area for a given product line.
 */
export function getMinimumArea(catalog: CatalogData, productLineId: string): number {
  const rule = catalog.pricingRules.find(
    r => r.productLineId === productLineId && r.ruleType === 'minimum_area'
  );
  return rule?.value ?? 0.5;
}
