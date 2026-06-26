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
  widthMm: 1470,
  heightMm: 920,
  panelCount: 2,
  quantity: 1,
  productLineCode: 'linea-5000',
  productTypeCode: 'corredera',
  marginPct: 15,
  marginPctCafe: 25,
  colorCode: 'natural',
  glassPricePerM2: 21200,
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
  test('matches the Excel base case for natural color', () => {
    const result = calculatePrice(baseInput);

    expect(result.areaM2).toBe(1.3524);
    expect(result.profilesTotal).toBe(18320);
    expect(result.glassTotal).toBe(28671);
    expect(result.accessoriesTotal).toBe(6733);
    expect(result.laborTotal).toBe(18700);
    expect(result.preTotal).toBe(84000);
    expect(result.total).toBe(84000);
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

    expect(breakdown).toHaveLength(4);
    expect(breakdown[0]).toEqual(expect.objectContaining({ code: 'burlete', unitPrice: 300 }));
    expect(breakdown[0].quantity).toBeCloseTo(6.62);
    expect(breakdown[0].totalPrice).toBeCloseTo(1986);
    expect(breakdown[1]).toEqual(expect.objectContaining({ code: 'felpa', unitPrice: 130 }));
    expect(breakdown[1].quantity).toBeCloseTo(7.282);
    expect(breakdown[1].totalPrice).toBeCloseTo(946.66);
    expect(breakdown[2]).toEqual(expect.objectContaining({ code: 'rodamiento', quantity: 4, unitPrice: 350, totalPrice: 1400 }));
    expect(breakdown[3]).toEqual(expect.objectContaining({ code: 'pestillo', quantity: 2, unitPrice: 1200, totalPrice: 2400 }));
  });

  test('matches the Excel color cascade totals', () => {
    expect(calculatePrice({ ...baseInput, colorCode: 'natural' }).total).toBe(84000);
    expect(calculatePrice({ ...baseInput, colorCode: 'cafe' }).total).toBe(94000);
    expect(calculatePrice({ ...baseInput, colorCode: 'titanio' }).total).toBe(104000);
    expect(calculatePrice({ ...baseInput, colorCode: 'blanco' }).total).toBe(115000);
    expect(calculatePrice({ ...baseInput, colorCode: 'madera' }).total).toBe(133000);
  });

  test('uses Excel labor totals only for Linea 5000 panel counts with explicit values', () => {
    expect(calculatePrice({ ...baseInput, panelCount: 3 }).laborTotal).toBe(24200);
    expect(calculatePrice({ ...baseInput, productLineCode: 'otra-linea', laborCost: 12345 }).laborTotal).toBe(12345);
  });
});

const referenceInput = {
  widthMm: 1000,
  heightMm: 1000,
  panelCount: 2,
  quantity: 1,
  productTypeCode: 'reference',
  marginPct: 0,
  marginPctCafe: 0,
  colorCode: 'natural',
  glassPricePerM2: 0,
  profilePrices: [],
  accessoryPrices: [],
  laborCost: 0,
  roundingMultiple: 1000,
  minimumAreaM2: 0,
};

const excelReferenceCases = [
  { productLineCode: 'linea-5000', colors: { natural: 84000, cafe: 94000, titanio: 104000, blanco: 115000, madera: 133000 } },
  { productLineCode: 'linea-al25', colors: { natural: 176000, cafe: 182000, titanio: 201000, blanco: 222000, madera: 245000, 'natural-termopanel': 296000, 'cafe-termopanel': 304000 } },
  { productLineCode: 'vent-abatir', colors: { natural: 50000, cafe: 67000, titanio: 74000, blanco: 82000 } },
  { productLineCode: 'doble-contacto', colors: { natural: 125000, cafe: 129000, titanio: 135000, blanco: 149000, madera: 164000 } },
  { productLineCode: 'celosias', colors: { natural: 37000, cafe: 39000, titanio: 43000 } },
  { productLineCode: 'fijo-tubular', colors: { natural: 75000, cafe: 89000, titanio: 98000, blanco: 108000, madera: 125000 } },
  { productLineCode: 'fijo-cp', colors: { natural: 49000, cafe: 64000, titanio: 71000, blanco: 79000, madera: 87000 } },
  { productLineCode: 'shower-am12', colors: { natural: 133000, cafe: 137000, titanio: 151000, blanco: 167000 } },
  { productLineCode: 'puerta-tubo', colors: { natural: 180000, cafe: 185000, titanio: 204000, blanco: 225000, madera: 259000 } },
  { productLineCode: 'cp-3060', colors: { natural: 95000, cafe: 106000, titanio: 117000, blanco: 129000 } },
  { productLineCode: 'cp-7095', colors: { natural: 66000, cafe: 69000, titanio: 76000, blanco: 84000, madera: 97000 } },
];

describe('calculatePrice Excel reference cases', () => {
  for (const { productLineCode, colors } of excelReferenceCases) {
    for (const [colorCode, expectedTotal] of Object.entries(colors)) {
      test(`${productLineCode} ${colorCode} matches Excel loaded value`, () => {
        const result = calculatePrice({
          ...referenceInput,
          productLineCode,
          colorCode,
        });

        expect(result.total).toBe(expectedTotal);
        expect(result.preTotal).toBe(expectedTotal);
      });
    }
  }
});
