import { describe, expect, test } from 'bun:test';
import { calculateAccessoryBreakdown, calculatePrice } from './pricing';

const linea5000Profiles = [
  ['Riel Inferior', '5001', 8408, 9861],
  ['Riel Superior', '5002', 9914, 11628],
  ['Jamba', '5003', 9574, 11229],
  ['Cabecera Inferior', '5004', 10765, 12626],
  ['Cabecera Superior', '5005', 8918, 10460],
  ['Traslapo', '5006', 9331, 10944],
  ['Pierna', '5007', 10473, 12284],
  ['Palillo', '7005', 10498, 12312],
  ['Tubo Rectangular 30x60', '30x60', 17132, 20093],
].map(([profileName, profileCode, priceNatural, priceCafe], sortOrder) => ({
  profileName: String(profileName),
  profileCode: String(profileCode),
  priceNatural: Number(priceNatural),
  priceCafe: Number(priceCafe),
  stripLengthM: 6,
  sortOrder,
}));

const baseInput = {
  widthMm: 1200,
  heightMm: 1500,
  panelCount: 2,
  quantity: 1,
  productLineCode: 'linea-5000',
  productTypeCode: 'corredera',
  marginPct: 15,
  marginPctCafe: 25,
  colorCode: 'natural',
  glassPricePerM2: 15900,
  profilePrices: linea5000Profiles,
  accessoryPrices: [
    { name: 'Burlete', code: 'burlete', price: 300, priceCafe: 150, unit: 'metro', quantity: 1 },
    { name: 'Felpa', code: 'felpa', price: 130, priceCafe: 140, unit: 'metro', quantity: 1 },
    { name: 'Rodamiento', code: 'rodamiento', price: 350, priceCafe: 350, unit: 'par', quantity: 1 },
    { name: 'Pestillo', code: 'pestillo', price: 1200, priceCafe: 1400, unit: 'unidad', quantity: 1 },
  ],
  laborCost: 17000,
  roundingMultiple: 1000,
};

describe('calculatePrice for Ventana Corredera Linea 5000', () => {
  test('uses Excel profile meters without duplicating rieles or adding palillo', () => {
    const result = calculatePrice(baseInput);

    expect(result.areaM2).toBe(1.8);
    expect(result.profilesTotal).toBe(19957);
    expect(result.glassTotal).toBe(28620);
    expect(result.accessoriesTotal).toBe(5180);
    expect(result.laborTotal).toBe(17000);
    expect(result.subtotal).toBe(70757);
    expect(result.preTotal).toBe(82000);
    expect(result.total).toBe(82000);
  });

  test('calculates Linea 5000 accessory quantities from product rules', () => {
    const breakdown = calculateAccessoryBreakdown({
      accessoryPrices: baseInput.accessoryPrices,
      widthMm: baseInput.widthMm,
      heightMm: baseInput.heightMm,
      panelCount: baseInput.panelCount,
      productTypeCode: baseInput.productTypeCode,
      productLineCode: baseInput.productLineCode,
      colorCode: baseInput.colorCode,
    });

    expect(breakdown).toEqual([
      expect.objectContaining({ code: 'burlete', quantity: 6, unitPrice: 300, total: 1800 }),
      expect.objectContaining({ code: 'felpa', quantity: 6, unitPrice: 130, total: 780 }),
      expect.objectContaining({ code: 'rodamiento', quantity: 4, unitPrice: 350, total: 1400 }),
      expect.objectContaining({ code: 'pestillo', quantity: 1, unitPrice: 1200, total: 1200 }),
    ]);
  });

  test('calculates cafe with cafe subtotal and margin', () => {
    const result = calculatePrice({ ...baseInput, colorCode: 'cafe' });

    expect(result.accessoriesTotal).toBe(4540);
    expect(result.subtotal).toBe(73568);
    expect(result.preTotal).toBe(92000);
    expect(result.total).toBe(92000);
  });

  test('calculates titanio from rounded cafe total plus one 10 percent step', () => {
    const result = calculatePrice({ ...baseInput, colorCode: 'titanio' });

    expect(result.subtotal).toBe(73568);
    expect(result.preTotal).toBe(102000);
    expect(result.total).toBe(102000);
  });

  test('calculates blanco and madera from rounded cascade totals', () => {
    expect(calculatePrice({ ...baseInput, colorCode: 'blanco' }).total).toBe(113000);
    expect(calculatePrice({ ...baseInput, colorCode: 'madera' }).total).toBe(130000);
  });
});
