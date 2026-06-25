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

export interface ClientPriceEstimate {
  areaM2: number;
  perimeterM: number;
  profilesTotal: number;
  glassTotal: number;
  accessoriesTotal: number;
  laborTotal: number;
  subtotal: number;
  marginAmount: number;
  preTotal: number;
  tax: number;
  total: number;
  unitTotal: number;
}

/**
 * Simplified client-side price estimation that mirrors the server-side Crispieri formula.
 * Uses an average profile cost approximation since the full profile calculation
 * is complex and done server-side.
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
  accessoryPrices: { price: number; priceCafe: number; code: string; quantity: number }[];
  profilePrices?: ProfilePrice[];
  laborCost?: number;
  roundingMultiple?: number;
}): ClientPriceEstimate {
  const {
    widthMm,
    heightMm,
    panelCount,
    quantity,
    productLineCode,
    productTypeCode,
    marginPct,
    marginPctCafe,
    colorCode,
    glassPricePerM2,
    accessoryPrices,
    profilePrices,
    laborCost = 20000,
    roundingMultiple = 1000,
  } = params;

  const widthM = widthMm / 1000;
  const heightM = heightMm / 1000;

  // Area calculation (minimum 0.5 m²)
  let areaM2 = (widthMm * heightMm) / 1_000_000;
  if (areaM2 < 0.5) areaM2 = 0.5;

  // Perimeter
  const perimeterM = 2 * (widthM + heightM);

  // Determine which price to use based on color
  const useCafePrice = colorCode !== 'natural' && colorCode !== 'satinado';

  // 1. Profiles total — use real profile prices from catalog if available
  let profilesTotal: number;
  if (profilePrices && profilePrices.length > 0) {
    profilesTotal = calculateProfilesFromPrices(
      profilePrices, widthM, heightM, panelCount, productTypeCode, useCafePrice
    );
  } else {
    // Fallback to simplified approximation
    const avgProfilePerM = getAvgProfileCostPerMeter(productLineCode, useCafePrice);
    const profileFactor = getProfileFactor(productTypeCode, panelCount);
    profilesTotal = perimeterM * avgProfilePerM * profileFactor;
  }

  // 2. Glass total
  const glassTotal = areaM2 * glassPricePerM2;

  // 3. Accessories total
  let accessoriesTotal = 0;
  for (const acc of accessoryPrices) {
    let unitPrice = useCafePrice ? acc.priceCafe : acc.price;
    let qty = acc.quantity;

    // Special handling for burlete and felpa (perimeter-based)
    if (acc.code === 'burlete') {
      qty = Math.ceil(perimeterM * panelCount);
    } else if (acc.code === 'felpa') {
      qty = Math.ceil(perimeterM * 1.10 * panelCount);
    }

    accessoriesTotal += qty * unitPrice;
  }

  // 4. Labor
  const laborTotal = laborCost;

  // 5. Subtotal
  const subtotal = profilesTotal + glassTotal + accessoriesTotal + laborTotal;

  // 6. Margin calculation — chain: natural/satinado (base), cafe (marginPctCafe),
  //    bronce (+10% over cafe), titanio (+10%), blanco (+10%), madera (+15%)
  let marginMultiplier: number;
  let preTotal: number;

  switch (colorCode) {
    case 'natural':
    case 'satinado':
      marginMultiplier = 1 + marginPct / 100;
      preTotal = Math.ceil(subtotal * marginMultiplier / roundingMultiple) * roundingMultiple;
      break;
    case 'cafe':
      marginMultiplier = 1 + marginPctCafe / 100;
      preTotal = Math.ceil(subtotal * marginMultiplier / roundingMultiple) * roundingMultiple;
      break;
    case 'ral':
      marginMultiplier = (1 + marginPct / 100) * (1 + 20 / 100);
      preTotal = Math.ceil(subtotal * marginMultiplier / roundingMultiple) * roundingMultiple;
      break;
    default: {
      const incMap: Record<string, number[]> = {
        bronce: [10],
        titanio: [10, 10],
        blanco: [10, 10, 10],
        madera: [10, 10, 10, 15],
      };
      const increments = incMap[colorCode];
      if (increments) {
        let chainTotal = subtotal * (1 + marginPctCafe / 100);
        chainTotal = Math.ceil(chainTotal / roundingMultiple) * roundingMultiple;
        for (const inc of increments) {
          chainTotal = chainTotal * (1 + inc / 100);
          chainTotal = Math.ceil(chainTotal / roundingMultiple) * roundingMultiple;
        }
        marginMultiplier = subtotal > 0 ? chainTotal / subtotal : 1;
        preTotal = chainTotal;
      } else {
        marginMultiplier = 1 + marginPct / 100;
        preTotal = Math.ceil(subtotal * marginMultiplier / roundingMultiple) * roundingMultiple;
      }
      break;
    }
  }

  const marginAmount = preTotal - subtotal;
  // marginMultiplier already set above

  // 8. Total for quantity
  const total = preTotal * quantity;

  // 9. IVA
  const tax = total * 0.19;

  // Unit total
  const unitTotal = quantity > 0 ? total / quantity : 0;

  return {
    areaM2: Math.round(areaM2 * 10000) / 10000,
    perimeterM: Math.round(perimeterM * 100) / 100,
    profilesTotal: Math.round(profilesTotal),
    glassTotal: Math.round(glassTotal),
    accessoriesTotal: Math.round(accessoriesTotal),
    laborTotal: Math.round(laborTotal),
    subtotal: Math.round(subtotal),
    marginAmount: Math.round(marginAmount),
    preTotal: Math.round(preTotal),
    tax: Math.round(tax),
    total: Math.round(total),
    unitTotal: Math.round(unitTotal),
  };
}

/**
 * Calculate profile costs using real profile prices from the catalog.
 * Matches the server-side calculation in pricing.ts.
 */
function calculateProfilesFromPrices(
  profilePrices: ProfilePrice[],
  widthM: number,
  heightM: number,
  panelCount: number,
  productTypeCode: string,
  useCafePrice: boolean
): number {
  let total = 0;

  for (const profile of profilePrices) {
    const pricePerM = (useCafePrice ? profile.priceCafe : profile.priceNatural) / profile.stripLengthM;
    const name = profile.profileName.toLowerCase();

    // Determine how many meters of this profile are needed
    // This matches the server-side logic in pricing.ts
    let meters = 0;

    if (productTypeCode === 'corredera') {
      // Sliding window
      if (name.includes('riel inferior') || name.includes('riel superior')) {
        meters = widthM * panelCount;
      } else if (name.includes('jamba') && !name.includes('esquinera')) {
        meters = heightM * 2;
      } else if (name.includes('cabecera inferior') || name.includes('cabecera superior')) {
        meters = widthM;
      } else if (name.includes('traslapo')) {
        meters = heightM * Math.max(0, panelCount - 1);
      } else if (name.includes('pierna')) {
        meters = heightM * panelCount;
      } else if (name.includes('palillo')) {
        meters = heightM * panelCount;
      } else if (name.includes('4ª hoja') || name.includes('4a hoja') || name.includes('perfil 4a')) {
        if (panelCount >= 4) meters = widthM * (panelCount - 3);
      } else if (name.includes('placa aluminio') || name.includes('placa ')) {
        if (panelCount >= 3) meters = heightM * (panelCount - 2);
      } else if (name.includes('tubo rectangular')) {
        meters = (widthM + heightM) * 0.5;
      } else if (name.includes('tubo') && !name.includes('rectangular')) {
        meters = heightM;
      } else {
        meters = (widthM + heightM) * 0.3;
      }
    } else if (productTypeCode === 'celosia') {
      // Louvers
      if (name.includes('marco')) {
        meters = 2 * (widthM + heightM);
      } else if (name.includes('junquillo')) {
        meters = 2 * (widthM + heightM);
      } else if (name.includes('pilar')) {
        meters = heightM * panelCount;
      } else if (name.includes('tubo')) {
        meters = widthM * panelCount * 0.3;
      } else {
        meters = (widthM + heightM) * 0.3;
      }
    } else if (productTypeCode === 'abatible') {
      // Hinged / projecting windows
      if (name.includes('marco')) {
        meters = 2 * (widthM + heightM);
      } else if (name.includes('centro p') || name.includes('cpuerta') || name.includes('hoja')) {
        meters = 2 * (widthM + heightM) * panelCount * 0.5;
      } else if (name.includes('junquillo')) {
        meters = 2 * (widthM + heightM) * panelCount * 0.5;
      } else if (name.includes('tubo')) {
        meters = (widthM + heightM) * 0.3;
      } else if (name.includes('amarre') || name.includes('angulo') || name.includes('canal')) {
        meters = (widthM + heightM) * 0.3;
      } else {
        meters = (widthM + heightM) * 0.2;
      }
    } else if (productTypeCode === 'puerta') {
      // Doors
      if (name.includes('tubo 40x40') || name.includes('centro p')) {
        meters = 2 * heightM;
      } else if (name.includes('tubo 40x100') || name.includes('tubo 40x80')) {
        meters = 2 * heightM;
      } else if (name.includes('tubo 30x60') || name.includes('tubo') && name.includes('30x60')) {
        meters = widthM;
      } else if (name.includes('junquillo')) {
        meters = 2 * (widthM + heightM) * 0.5;
      } else if (name.includes('placa')) {
        meters = widthM * heightM;
      } else if (name.includes('amarre') || name.includes('angulo') || name.includes('l 25')) {
        meters = heightM * 2;
      } else {
        meters = (widthM + heightM) * 0.3;
      }
    } else if (productTypeCode === 'fijo') {
      // Fixed panels
      if (name.includes('tubo') || name.includes('centro p')) {
        meters = 2 * (widthM + heightM);
      } else if (name.includes('junquillo')) {
        meters = 2 * (widthM + heightM);
      } else if (name.includes('placa')) {
        meters = widthM * 0.5;
      } else {
        meters = (widthM + heightM) * 0.3;
      }
    } else if (productTypeCode === 'shower-door') {
      // Shower doors
      if (name.includes('riel inferior') || name.includes('riel superior')) {
        meters = widthM * panelCount;
      } else if (name.includes('jamba') && !name.includes('esquinera')) {
        meters = heightM * 2;
      } else if (name.includes('bastidor')) {
        meters = heightM * panelCount;
      } else if (name.includes('jamba esquinera')) {
        meters = widthM * 2;
      } else {
        meters = (widthM + heightM) * 0.3;
      }
    } else {
      meters = (widthM + heightM) * 0.3;
    }

    total += meters * pricePerM;
  }

  return total;
}

/**
 * Get average profile cost per meter for a given product line.
 * These are rough approximations based on the real Crispieri profile prices.
 */
function getAvgProfileCostPerMeter(lineCode: string, useCafePrice: boolean): number {
  // Average price per meter = average price per strip / 6m
  const costs: Record<string, [number, number]> = {
    'linea-5000': [9800, 11500],
    'brazo-ext': [12000, 15000],
    'vent-abatir': [7000, 8300],
    'cp-7095': [15600, 16600],
    'cp-3060': [14800, 17400],
    'puerta-tubo': [28000, 31000],
    'fijo-tubular': [15000, 21000],
    'fijo-cp': [12000, 13600],
    'celosias': [12700, 14900],
    'shower-am12': [19700, 21300],
  };
  const [natural, cafe] = costs[lineCode] || [10000, 12000];
  return (useCafePrice ? cafe : natural) / 6;
}

/**
 * Get profile usage factor based on product type and panel count.
 * This accounts for how many profiles are needed relative to the perimeter.
 */
function getProfileFactor(productTypeCode: string, panelCount: number): number {
  switch (productTypeCode) {
    case 'corredera':
      // Frame + panel profiles, more panels = more profiles
      return 2.5 + (panelCount - 1) * 0.8;
    case 'abatible':
      // Frame + leaf profiles
      return 2 + panelCount * 0.6;
    case 'puerta':
      // Frame + door profiles
      return 2.5;
    case 'fijo':
      // Just frame + glass bead
      return 2;
    case 'celosia':
      // Frame + louver profiles (many verticals)
      return 3;
    case 'shower-door':
      // Frame + door
      return 2.5;
    default:
      return 2;
  }
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
