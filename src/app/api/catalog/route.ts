import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const hiddenProductLineCodes = new Set(['linea-7000', 'linea-8000']);
const hiddenProductLineNames = new Set(['Linea 7000', 'Línea 7000', 'Linea 8000', 'Línea 8000']);

/**
 * GET /api/catalog
 * Returns all catalog data needed for the configurator.
 * Now includes productLineGlass, profilePrices for real Crispieri pricing.
 */
export async function GET() {
  try {
    const [
      productTypes,
      productLines,
      productTypeLines,
      colors,
      productLineColors,
      glassOptions,
      productLineGlass,
      accessories,
      productLineAccessories,
      profilePrices,
      pricingRules,
    ] = await Promise.all([
      db.productType.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      db.productLine.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      db.productTypeLine.findMany({
        where: { isActive: true },
        include: {
          productType: { select: { id: true, name: true, code: true } },
          productLine: { select: { id: true, name: true, code: true } },
        },
      }),
      db.color.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      db.productLineColor.findMany({
        where: { isActive: true },
        include: {
          productLine: { select: { id: true, name: true, code: true } },
          color: { select: { id: true, name: true, code: true, hexValue: true, surchargePct: true, isRAL: true } },
        },
      }),
      db.glassOption.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      db.productLineGlass.findMany({
        where: { isActive: true },
        include: {
          productLine: { select: { id: true, name: true, code: true } },
          glassOption: { select: { id: true, name: true, code: true, description: true } },
        },
      }),
      db.accessory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      db.productLineAccessory.findMany({
        where: { isActive: true },
        include: {
          productLine: { select: { id: true, name: true, code: true } },
          accessory: { select: { id: true, name: true, code: true, price: true, priceCafe: true, unit: true } },
        },
      }),
      db.profilePrice.findMany({
        where: { isActive: true },
        orderBy: [{ productLineId: 'asc' }, { sortOrder: 'asc' }],
        include: {
          productLine: { select: { id: true, name: true, code: true } },
        },
      }),
      db.pricingRule.findMany({
        where: { isActive: true },
        include: {
          productLine: { select: { id: true, name: true, code: true } },
        },
      }),
    ]);

    const visibleProductLines = productLines.filter(
      (line) => !hiddenProductLineCodes.has(line.code) && !hiddenProductLineNames.has(line.name)
    );
    const visibleProductLineIds = new Set(visibleProductLines.map((line) => line.id));

    return NextResponse.json({
      productTypes,
      productLines: visibleProductLines,
      productTypeLines: productTypeLines.filter((item) => visibleProductLineIds.has(item.productLineId)),
      colors,
      productLineColors: productLineColors.filter((item) => visibleProductLineIds.has(item.productLineId)),
      glassOptions,
      productLineGlass: productLineGlass.filter((item) => visibleProductLineIds.has(item.productLineId)),
      accessories,
      productLineAccessories: productLineAccessories.filter((item) => visibleProductLineIds.has(item.productLineId)),
      profilePrices: profilePrices.filter((item) => visibleProductLineIds.has(item.productLineId)),
      pricingRules: pricingRules.filter((item) => visibleProductLineIds.has(item.productLineId)),
    });
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch catalog data' },
      { status: 500 }
    );
  }
}
