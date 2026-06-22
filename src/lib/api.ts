const API_BASE = '/api';

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
  pricePerM2: number;
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
  surchargePct: number;
  isActive: boolean;
  sortOrder: number;
}

export interface Accessory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  price: number;
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
  accessories: Accessory[];
  productLineAccessories: ProductLineAccessory[];
  pricingRules: PricingRule[];
}

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
  basePrice: number;
  colorSurcharge: number;
  glassSurcharge: number;
  panelSurcharge: number;
  accessoriesTotal: number;
  subtotal: number;
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

// ─── Client-side price estimation (mirrors backend calculation) ───

export interface ClientPriceEstimate {
  areaM2: number;
  basePrice: number;
  colorSurcharge: number;
  glassSurcharge: number;
  panelSurcharge: number;
  accessoriesTotal: number;
  subtotal: number;
  tax: number;
  total: number;
  unitTotal: number;
}

export function estimatePrice(params: {
  widthMm: number;
  heightMm: number;
  panelCount: number;
  quantity: number;
  pricePerM2: number;
  colorSurchargePct: number;
  glassSurchargePct: number;
  accessoryPrices: { price: number; quantity: number }[];
  panelSurchargePct?: number;
  minimumArea?: number;
}): ClientPriceEstimate {
  const {
    widthMm,
    heightMm,
    panelCount,
    quantity,
    pricePerM2,
    colorSurchargePct,
    glassSurchargePct,
    accessoryPrices,
    panelSurchargePct = 8,
    minimumArea = 0.5,
  } = params;

  let areaM2 = (widthMm * heightMm) / 1_000_000;
  if (areaM2 < minimumArea) areaM2 = minimumArea;

  // Per-unit calculations
  const basePrice = pricePerM2 * areaM2;
  const colorSurcharge = basePrice * (colorSurchargePct / 100);
  const glassSurcharge = basePrice * (glassSurchargePct / 100);
  const panelSurcharge = panelCount > 1 ? basePrice * (panelSurchargePct / 100) * (panelCount - 1) : 0;
  const accessoriesTotal = accessoryPrices.reduce((sum, a) => sum + a.price * a.quantity, 0);
  const unitSubtotal = basePrice + colorSurcharge + glassSurcharge + panelSurcharge + accessoriesTotal;

  // Total for all units
  const subtotal = unitSubtotal * quantity;
  const tax = subtotal * 0.19;
  const total = subtotal + tax;
  const unitTotal = quantity > 0 ? total / quantity : total;

  return { areaM2, basePrice, colorSurcharge, glassSurcharge, panelSurcharge, accessoriesTotal, subtotal, tax, total, unitTotal };
}
