import { describe, expect, test } from 'bun:test';
import { calculatePrice } from './pricing';

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
    expect(result.accessoriesTotal).toBe(6410);
    expect(result.laborTotal).toBe(17000);
    expect(result.subtotal).toBe(71987);
    expect(result.preTotal).toBe(83000);
    expect(result.total).toBe(83000);
  });

  test('calculates titanio from rounded cafe total plus one 10 percent step', () => {
    const result = calculatePrice({ ...baseInput, colorCode: 'titanio' });

    expect(result.subtotal).toBe(74108);
    expect(result.preTotal).toBe(103000);
    expect(result.total).toBe(103000);
  });
});
