// ============================================
// PRICING CALCULATION SERVICE
// ============================================

export interface PriceCalculationInput {
  widthMm: number;
  heightMm: number;
  panelCount: number;
  quantity: number;
  pricePerM2: number;
  colorSurchargePct: number;
  glassSurchargePct: number;
  accessoryPrices: { price: number; quantity: number }[];
  panelSurchargeRule?: { value: number; minPanels: number };
  minimumArea?: number;
}

export interface PriceBreakdown {
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

/**
 * Calculate the full price breakdown for a quote item.
 *
 * Rules:
 * - area_m2 = width_mm * height_mm / 1,000,000
 * - If minimumArea is set and area_m2 < minimumArea, use minimumArea
 * - precio_base = pricePerM2 * area_m2 (after minimum area adjustment)
 * - recargo_color = precio_base * (colorSurchargePct / 100)
 * - recargo_vidrio = precio_base * (glassSurchargePct / 100)
 * - recargo_hojas = precio_base * (panelSurchargePct / 100) * (panelCount - 1) if panelCount > 1
 * - accesorios = sum of (accessory.price * accessory.quantity)
 * - subtotal = precio_base + recargo_color + recargo_vidrio + recargo_hojas + accesorios
 * - iva = subtotal * 0.19
 * - total = subtotal + iva
 * - unitTotal = total / quantity
 */
export function calculatePrice(input: PriceCalculationInput): PriceBreakdown {
  const {
    widthMm,
    heightMm,
    panelCount,
    quantity,
    pricePerM2,
    colorSurchargePct,
    glassSurchargePct,
    accessoryPrices,
    panelSurchargeRule,
    minimumArea,
  } = input;

  // Calculate area in m²
  let areaM2 = (widthMm * heightMm) / 1_000_000;

  // Apply minimum area rule
  if (minimumArea !== undefined && areaM2 < minimumArea) {
    areaM2 = minimumArea;
  }

  // Base price
  const basePrice = pricePerM2 * areaM2;

  // Color surcharge
  const colorSurcharge = basePrice * (colorSurchargePct / 100);

  // Glass surcharge
  const glassSurcharge = basePrice * (glassSurchargePct / 100);

  // Panel surcharge: only applies when panelCount > 1
  let panelSurcharge = 0;
  if (panelCount > 1 && panelSurchargeRule && panelCount >= panelSurchargeRule.minPanels) {
    panelSurcharge = basePrice * (panelSurchargeRule.value / 100) * (panelCount - 1);
  }

  // Accessories total (per unit)
  const accessoriesTotal = accessoryPrices.reduce(
    (sum, acc) => sum + acc.price * acc.quantity,
    0
  );

  // Per-unit subtotal
  const unitSubtotal = basePrice + colorSurcharge + glassSurcharge + panelSurcharge + accessoriesTotal;

  // Total subtotal for all units
  const subtotal = unitSubtotal * quantity;

  // Tax (IVA 19%)
  const tax = subtotal * 0.19;

  // Total
  const total = subtotal + tax;

  // Unit total (price per single unit)
  const unitTotal = quantity > 0 ? total / quantity : 0;

  return {
    areaM2: Math.round(areaM2 * 10000) / 10000, // 4 decimal places
    basePrice: Math.round(basePrice),
    colorSurcharge: Math.round(colorSurcharge),
    glassSurcharge: Math.round(glassSurcharge),
    panelSurcharge: Math.round(panelSurcharge),
    accessoriesTotal: Math.round(accessoriesTotal),
    subtotal: Math.round(subtotal),
    tax: Math.round(tax),
    total: Math.round(total),
    unitTotal: Math.round(unitTotal),
  };
}

/**
 * Generate price breakdown records for storage in QuoteItemPriceBreakdown table.
 * These provide a human-readable breakdown of each charge.
 */
export function generateBreakdownRecords(
  breakdown: PriceBreakdown,
  input: PriceCalculationInput
): { concept: string; label: string; amount: number; percentage: number | null; sortOrder: number }[] {
  const records: { concept: string; label: string; amount: number; percentage: number | null; sortOrder: number }[] = [];

  // Base price
  records.push({
    concept: 'base_price',
    label: `Precio base (${input.widthMm}×${input.heightMm}mm = ${breakdown.areaM2} m²)`,
    amount: breakdown.basePrice,
    percentage: null,
    sortOrder: 1,
  });

  // Color surcharge
  if (input.colorSurchargePct > 0) {
    records.push({
      concept: 'color_surcharge',
      label: `Recargo color (${input.colorSurchargePct}%)`,
      amount: breakdown.colorSurcharge,
      percentage: input.colorSurchargePct,
      sortOrder: 2,
    });
  }

  // Glass surcharge
  if (input.glassSurchargePct > 0) {
    records.push({
      concept: 'glass_surcharge',
      label: `Recargo vidrio (${input.glassSurchargePct}%)`,
      amount: breakdown.glassSurcharge,
      percentage: input.glassSurchargePct,
      sortOrder: 3,
    });
  }

  // Panel surcharge
  if (breakdown.panelSurcharge > 0 && input.panelSurchargeRule) {
    records.push({
      concept: 'panel_surcharge',
      label: `Recargo hojas adicionales (${input.panelSurchargeRule.value}% × ${input.panelCount - 1} hoja${input.panelCount - 1 > 1 ? 's' : ''})`,
      amount: breakdown.panelSurcharge,
      percentage: input.panelSurchargeRule.value,
      sortOrder: 4,
    });
  }

  // Accessories
  if (breakdown.accessoriesTotal > 0) {
    records.push({
      concept: 'accessories',
      label: 'Accesorios',
      amount: breakdown.accessoriesTotal,
      percentage: null,
      sortOrder: 5,
    });
  }

  // Subtotal
  records.push({
    concept: 'subtotal',
    label: 'Subtotal',
    amount: breakdown.subtotal,
    percentage: null,
    sortOrder: 6,
  });

  // Tax
  records.push({
    concept: 'tax',
    label: 'IVA (19%)',
    amount: breakdown.tax,
    percentage: 19,
    sortOrder: 7,
  });

  // Total
  records.push({
    concept: 'total',
    label: `Total (${input.quantity} unidad${input.quantity > 1 ? 'es' : ''})`,
    amount: breakdown.total,
    percentage: null,
    sortOrder: 8,
  });

  return records;
}
