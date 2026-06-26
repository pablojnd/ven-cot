// ============================================
// PRICING CALCULATION SERVICE — Real Crispieri Formula
// ============================================

export interface ProfilePriceInput {
  profileName: string;
  profileCode: string;
  priceNatural: number;
  priceCafe: number;
  stripLengthM: number;
}

export interface AccessoryPriceInput {
  accessoryId?: string;
  name: string;
  code: string;
  price: number;
  priceCafe: number;
  unit: string;
  quantity: number;
}

export interface AccessoryBreakdownItem {
  accessoryId?: string;
  name: string;
  code: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface PriceCalculationInput {
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
  profilePrices: ProfilePriceInput[];
  accessoryPrices: AccessoryPriceInput[];
  laborCost: number;
  roundingMultiple: number;
  minimumAreaM2?: number;
}

export interface PriceBreakdown {
  areaM2: number;
  perimeterM: number;
  profilesTotal: number;
  glassTotal: number;
  accessoriesTotal: number;
  laborTotal: number;
  subtotal: number;
  marginAmount: number;
  marginMultiplier: number;
  preTotal: number;
  tax: number;
  total: number;
  unitTotal: number;
}

/**
 * Determine which profiles are used for a given product type and line.
 * Returns an array of { profile, metersUsed, count } objects.
 *
 * For a simple window/door:
 * - Horizontal profiles: width_m × count (depends on type)
 * - Vertical profiles: height_m × count (depends on type)
 */
function getProfileUsage(
  widthMm: number,
  heightMm: number,
  panelCount: number,
  productTypeCode: string,
  productLineCode: string,
  profilePrices: ProfilePriceInput[]
): { profile: ProfilePriceInput; metersUsed: number }[] {
  const widthM = widthMm / 1000;
  const heightM = heightMm / 1000;
  const usage: { profile: ProfilePriceInput; metersUsed: number }[] = [];

  const isLinea5000Corredera = productTypeCode === 'corredera' && productLineCode === 'linea-5000';

  for (const profile of profilePrices) {
    let metersUsed = 0;
    const name = profile.profileName.toLowerCase();
    const code = profile.profileCode.toLowerCase();

    // Línea 5000 corredera follows the Crispieri Excel profile usage exactly.
    if (isLinea5000Corredera) {
      if (name.includes('riel inferior') || name.includes('riel superior')) {
        metersUsed = widthM;
      } else if (name.includes('jamba') && !name.includes('esquinera')) {
        metersUsed = heightM * 2;
      } else if (name.includes('cabecera inferior') || name.includes('cabecera superior')) {
        metersUsed = widthM;
      } else if (name.includes('traslapo')) {
        metersUsed = heightM * Math.max(0, panelCount - 1);
      } else if (name.includes('pierna')) {
        metersUsed = heightM * panelCount;
      } else if (name.includes('palillo')) {
        metersUsed = 0;
      } else if (name.includes('tubo rectangular 30x60') || code === '30x60') {
        if (widthMm > 2000) metersUsed = widthM * 2;
      }
    } else if (productTypeCode === 'corredera') {
      // Sliding window: riel inf/sup (horizontal × panelCount), jamba (vertical × 2),
      // cabecera inf/sup (horizontal), traslapo (vertical × panelCount-1), pierna (vertical × panelCount)
      if (name.includes('riel inferior') || name.includes('riel superior')) {
        metersUsed = widthM * panelCount;
      } else if (name.includes('jamba') && !name.includes('esquinera')) {
        metersUsed = heightM * 2;
      } else if (name.includes('cabecera inferior') || name.includes('cabecera superior')) {
        metersUsed = widthM;
      } else if (name.includes('traslapo')) {
        metersUsed = heightM * Math.max(0, panelCount - 1);
      } else if (name.includes('pierna')) {
        metersUsed = heightM * panelCount;
      } else if (name.includes('palillo')) {
        metersUsed = heightM * panelCount;
      } else if (name.includes('4ª hoja') || name.includes('4a hoja')) {
        if (panelCount >= 4) metersUsed = widthM * (panelCount - 3);
      } else if (name.includes('placa aluminio')) {
        if (panelCount >= 3) metersUsed = heightM * (panelCount - 2);
      } else if (name.includes('tubo rectangular 30x60') || code === '30x60') {
        // Tubular for frame reinforcement - used horizontally on larger windows
        if (widthMm > 2000) metersUsed = widthM * 2;
      } else if (name.includes('tubo rectangular 76x25') || code === '76x25') {
        if (widthMm > 3000) metersUsed = widthM;
      }
    } else if (productTypeCode === 'abatible') {
      // Hinged window: marco (perimeter), marco hoja (perimeter of leaf), junquillo (perimeter of leaf)
      if (name.includes('marco hoja')) {
        metersUsed = 2 * (widthM + heightM) * panelCount;
      } else if (name.includes('marco') && !name.includes('hoja') && !name.includes('pilar')) {
        metersUsed = 2 * (widthM + heightM);
      } else if (name.includes('junquillo')) {
        metersUsed = 2 * (widthM + heightM) * panelCount;
      } else if (name.includes('amarre')) {
        metersUsed = panelCount * 0.5; // small pieces
      } else if (name.includes('pilar marco')) {
        metersUsed = heightM * (panelCount > 1 ? panelCount - 1 : 0);
      } else if (name.includes('tubo rectangular 30x60') || code === '30x60') {
        if (widthMm > 2000) metersUsed = widthM * 2;
      } else if (name.includes('centro puerta')) {
        metersUsed = 2 * (widthM + heightM) * panelCount;
      } else if (name.includes('pierna')) {
        metersUsed = heightM * 2;
      } else if (name.includes('angulo')) {
        metersUsed = 2 * (widthM + heightM);
      } else if (name.includes('canal')) {
        metersUsed = 2 * (widthM + heightM);
      } else if (name.includes('brazo exterior')) {
        // Not a profile, skip
        continue;
      }
    } else if (productTypeCode === 'puerta') {
      // Door: centro puerta profiles + jamba
      if (name.includes('centro puerta')) {
        metersUsed = 2 * (widthM + heightM);
      } else if (name.includes('junquillo')) {
        metersUsed = 2 * (widthM + heightM);
      } else if (name.includes('tubo') && (name.includes('40x40') || name.includes('40x100') || name.includes('40x80') || name.includes('30x60'))) {
        // Door tubes: vertical stiles + horizontal rails
        if (name.includes('40x100') || name.includes('40x80')) {
          metersUsed = heightM * 2; // vertical stiles
        } else if (name.includes('40x40')) {
          metersUsed = (widthM + heightM) * 2; // frame
        } else {
          metersUsed = 2 * (widthM + heightM);
        }
      } else if (name.includes('placa aluminio')) {
        metersUsed = widthM;
      } else if (name.includes('angulo')) {
        metersUsed = 2 * (widthM + heightM);
      } else if (name.includes('amarre')) {
        metersUsed = 4 * 0.3; // small fixings
      } else if (name.includes('quicio')) {
        continue; // Accessory, not a profile
      }
    } else if (productTypeCode === 'fijo') {
      // Fixed panel: frame profile + junquillo
      if (name.includes('tubo rectangular')) {
        metersUsed = 2 * (widthM + heightM); // frame
      } else if (name.includes('centro puerta')) {
        metersUsed = 2 * (widthM + heightM); // frame
      } else if (name.includes('junquillo')) {
        metersUsed = 2 * (widthM + heightM); // glass bead
      } else if (name.includes('placa aluminio')) {
        metersUsed = widthM;
      } else if (name.includes('tubo') && !name.includes('rectangular')) {
        // Tubo profiles without "Rectangular" (e.g. "Tubo 30x60" code R-05)
        // Used as additional frame reinforcement
        metersUsed = 2 * (widthM + heightM);
      }
    } else if (productTypeCode === 'celosia') {
      // Louvers: marco + pilar + tubular
      if (name.includes('marco') && !name.includes('pilar')) {
        metersUsed = 2 * (widthM + heightM);
      } else if (name.includes('junquillo')) {
        metersUsed = 2 * (widthM + heightM);
      } else if (name.includes('pilar marco')) {
        metersUsed = heightM * Math.max(1, Math.floor(widthM / 0.4)); // vertical louvers
      } else if (name.includes('tubo rectangular 30x60') || code === '30x60') {
        metersUsed = heightM * Math.max(1, Math.floor(widthM / 0.4));
      } else if (name.includes('tubo rectangular 76x25') || code === '76x25') {
        metersUsed = widthM * 2;
      }
    } else if (productTypeCode === 'shower-door') {
      // Shower door: riel + jamba + bastidor
      if (name.includes('riel inferior') || name.includes('riel superior')) {
        metersUsed = widthM;
      } else if (name.includes('jamba') && !name.includes('esquinera')) {
        metersUsed = heightM * 2;
      } else if (name.includes('bastidor')) {
        metersUsed = 2 * (widthM + heightM);
      } else if (name.includes('jamba esquinera')) {
        metersUsed = heightM;
      }
    }

    if (metersUsed > 0) {
      usage.push({ profile, metersUsed });
    }
  }

  return usage;
}

function roundUp(value: number, multiple: number): number {
  return Math.ceil(value / multiple) * multiple;
}

function usesCafePrice(colorCode: string): boolean {
  return colorCode !== 'natural' && colorCode !== 'satinado';
}

function calculateProfilesTotal(
  profileUsage: { profile: ProfilePriceInput; metersUsed: number }[],
  useCafePrice: boolean
): number {
  return profileUsage.reduce((total, { profile, metersUsed }) => {
    const pricePerStrip = useCafePrice ? profile.priceCafe : profile.priceNatural;
    const pricePerMeter = pricePerStrip / profile.stripLengthM;
    return total + metersUsed * pricePerMeter;
  }, 0);
}

function getAccessoryQuantity(
  code: string,
  manualQuantity: number,
  perimeterM: number,
  panelCount: number,
  productTypeCode: string,
  productLineCode: string
): number {
  const isLinea5000Corredera = productTypeCode === 'corredera' && productLineCode === 'linea-5000';

  if (isLinea5000Corredera) {
    if (code === 'burlete') return Math.ceil(perimeterM);
    if (code === 'felpa') return Math.ceil(perimeterM * 1.10);
    if (code === 'rodamiento') return panelCount * 2;
    if (code === 'pestillo') return 1;
  }

  if (code === 'burlete') return Math.ceil(perimeterM * panelCount);
  if (code === 'felpa') return Math.ceil(perimeterM * 1.10 * panelCount);

  return manualQuantity;
}

export function calculateAccessoryBreakdown(input: {
  accessoryPrices: AccessoryPriceInput[];
  widthMm: number;
  heightMm: number;
  panelCount: number;
  productTypeCode: string;
  productLineCode: string;
  colorCode: string;
}): AccessoryBreakdownItem[] {
  const perimeterM = 2 * (input.widthMm / 1000 + input.heightMm / 1000);
  const useCafeColumn = usesCafePrice(input.colorCode);

  return input.accessoryPrices.map((acc) => {
    const unitPrice = useCafeColumn ? acc.priceCafe : acc.price;
    const quantity = getAccessoryQuantity(
      acc.code,
      acc.quantity,
      perimeterM,
      input.panelCount,
      input.productTypeCode,
      input.productLineCode
    );

    return {
      accessoryId: acc.accessoryId,
      name: acc.name,
      code: acc.code,
      unitPrice,
      quantity,
      total: quantity * unitPrice,
    };
  });
}

/**
 * Calculate the full price breakdown for a quote item using the real Crispieri formula.
 *
 * Formula:
 * 1. profilesTotal = sum of (meters_used × pricePerStrip / stripLengthM) for each profile
 *    - pricePerStrip depends on color: priceNatural for natural, priceCafe for café/titanio/blanco/madera
 * 2. glassTotal = area_m2 × pricePerM2 (minimum 0.5 m²)
 * 3. accessoriesTotal = sum of (quantity × unitPrice)
 *    - unitPrice depends on color: price for natural, priceCafe for café/titanio/blanco/madera
 *    - Burlete: perimeter_m × price_per_m
 *    - Felpa: perimeter_m × 1.10 × price_per_m
 * 4. laborTotal = labor cost for the line
 * 5. subtotal = profilesTotal + glassTotal + accessoriesTotal + laborTotal
 * 6. margin/color cascade:
 *    - Natural/Satinado: CEIL(subtotalNatural × (1 + marginPct/100))
 *    - Café: CEIL(subtotalCafe × (1 + marginPctCafe/100))
 *    - Titanio: CEIL(cafeTotal × 1.10)
 *    - Blanco: CEIL(titanioTotal × 1.10)
 *    - Madera: CEIL(blancoTotal × 1.15)
 * 7. preTotal = CEILING(subtotal × marginMultiplier, roundingMultiple)
 * 8. total for quantity = preTotal × quantity
 * 9. IVA = total × 0.19 (shown separately, not included in main price)
 */
export function calculatePrice(input: PriceCalculationInput): PriceBreakdown {
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
    profilePrices,
    accessoryPrices,
    laborCost,
    roundingMultiple,
    minimumAreaM2 = 0.5,
  } = input;

  const widthM = widthMm / 1000;
  const heightM = heightMm / 1000;

  // 1. Area calculation with catalog minimum area rule.
  let areaM2 = (widthMm * heightMm) / 1_000_000;
  if (areaM2 < minimumAreaM2) areaM2 = minimumAreaM2;

  // Perimeter in meters
  const perimeterM = 2 * (widthM + heightM);

  // 2. Profiles totals: natural/base and cafe-column prices are calculated separately
  // because the Excel cascade starts derived colors from the rounded cafe total.
  const profileUsage = getProfileUsage(widthMm, heightMm, panelCount, productTypeCode, productLineCode, profilePrices);
  const profilesNaturalTotal = calculateProfilesTotal(profileUsage, false);
  const profilesCafeTotal = calculateProfilesTotal(profileUsage, true);

  // 3. Glass total
  const glassTotal = areaM2 * glassPricePerM2;

  // 4. Accessories totals
  const accessoryBase = {
    accessoryPrices,
    widthMm,
    heightMm,
    panelCount,
    productTypeCode,
    productLineCode,
  };
  const accessoriesNaturalTotal = calculateAccessoryBreakdown({
    ...accessoryBase,
    colorCode: 'natural',
  }).reduce((total, item) => total + item.total, 0);
  const accessoriesCafeTotal = calculateAccessoryBreakdown({
    ...accessoryBase,
    colorCode: 'cafe',
  }).reduce((total, item) => total + item.total, 0);

  // 5. Labor total
  const laborTotal = laborCost;

  // 6. Subtotals
  const naturalSubtotal = profilesNaturalTotal + glassTotal + accessoriesNaturalTotal + laborTotal;
  const cafeSubtotal = profilesCafeTotal + glassTotal + accessoriesCafeTotal + laborTotal;
  const useCafeColumn = usesCafePrice(colorCode);
  const profilesTotal = useCafeColumn ? profilesCafeTotal : profilesNaturalTotal;
  const accessoriesTotal = useCafeColumn ? accessoriesCafeTotal : accessoriesNaturalTotal;
  const subtotal = useCafeColumn ? cafeSubtotal : naturalSubtotal;

  // 7. Margin and Excel color cascade from rounded totals.
  const naturalTotal = roundUp(naturalSubtotal * (1 + marginPct / 100), roundingMultiple);
  const cafeTotal = roundUp(cafeSubtotal * (1 + marginPctCafe / 100), roundingMultiple);
  const titanioTotal = roundUp(cafeTotal * 1.10, roundingMultiple);
  const blancoTotal = roundUp(titanioTotal * 1.10, roundingMultiple);
  const maderaTotal = roundUp(blancoTotal * 1.15, roundingMultiple);

  let preTotal: number;
  if (colorCode === 'natural' || colorCode === 'satinado') {
    preTotal = naturalTotal;
  } else if (colorCode === 'cafe') {
    preTotal = cafeTotal;
  } else if (colorCode === 'titanio') {
    preTotal = titanioTotal;
  } else if (colorCode === 'blanco') {
    preTotal = blancoTotal;
  } else if (colorCode === 'madera') {
    preTotal = maderaTotal;
  } else if (colorCode === 'bronce') {
    preTotal = roundUp(cafeTotal * 1.10, roundingMultiple);
  } else if (colorCode === 'ral') {
    preTotal = roundUp(naturalTotal * 1.20, roundingMultiple);
  } else {
    preTotal = naturalTotal;
  }

  const marginMultiplier = subtotal > 0 ? preTotal / subtotal : 1;
  const marginAmount = preTotal - subtotal;

  // 9. Total for quantity
  const total = preTotal * quantity;

  // 10. IVA (shown separately)
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
    marginMultiplier: Math.round(marginMultiplier * 10000) / 10000,
    preTotal: Math.round(preTotal),
    tax: Math.round(tax),
    total: Math.round(total),
    unitTotal: Math.round(unitTotal),
  };
}

/**
 * Generate price breakdown records for storage in QuoteItemPriceBreakdown table.
 */
export function generateBreakdownRecords(
  breakdown: PriceBreakdown,
  input: PriceCalculationInput
): { concept: string; label: string; amount: number; percentage: number | null; sortOrder: number }[] {
  const records: { concept: string; label: string; amount: number; percentage: number | null; sortOrder: number }[] = [];

  // Profiles
  records.push({
    concept: 'profiles',
    label: `Perfiles de aluminio (${input.productLineCode})`,
    amount: breakdown.profilesTotal,
    percentage: null,
    sortOrder: 1,
  });

  // Glass
  records.push({
    concept: 'glass',
    label: `Vidrio (${breakdown.areaM2} m² × $${Math.round(input.glassPricePerM2).toLocaleString('es-CL')}/m²)`,
    amount: breakdown.glassTotal,
    percentage: null,
    sortOrder: 2,
  });

  // Accessories
  if (breakdown.accessoriesTotal > 0) {
    records.push({
      concept: 'accessories',
      label: 'Accesorios',
      amount: breakdown.accessoriesTotal,
      percentage: null,
      sortOrder: 3,
    });
  }

  // Labor
  if (breakdown.laborTotal > 0) {
    records.push({
      concept: 'labor',
      label: 'Mano de obra',
      amount: breakdown.laborTotal,
      percentage: null,
      sortOrder: 4,
    });
  }

  // Subtotal
  records.push({
    concept: 'subtotal',
    label: 'Subtotal',
    amount: breakdown.subtotal,
    percentage: null,
    sortOrder: 5,
  });

  // Margin
  records.push({
    concept: 'margin',
    label: `Margen (${input.colorCode}: ×${breakdown.marginMultiplier.toFixed(4)})`,
    amount: breakdown.marginAmount,
    percentage: null,
    sortOrder: 6,
  });

  // Pre-total (after rounding)
  records.push({
    concept: 'pre_total',
    label: `Pre-total (redondeado a ${input.roundingMultiple})`,
    amount: breakdown.preTotal,
    percentage: null,
    sortOrder: 7,
  });

  // Quantity
  if (input.quantity > 1) {
    records.push({
      concept: 'quantity',
      label: `Cantidad (×${input.quantity})`,
      amount: breakdown.total,
      percentage: null,
      sortOrder: 8,
    });
  }

  // Tax
  records.push({
    concept: 'tax',
    label: 'IVA (19%)',
    amount: breakdown.tax,
    percentage: 19,
    sortOrder: 9,
  });

  // Total
  records.push({
    concept: 'total',
    label: `Total neto ${input.quantity > 1 ? `(${input.quantity} unidades)` : ''}`,
    amount: breakdown.total,
    percentage: null,
    sortOrder: 10,
  });

  return records;
}
