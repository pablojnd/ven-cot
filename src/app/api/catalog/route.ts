import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/catalog
 * Returns all catalog data needed for the configurator.
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
      accessories,
      productLineAccessories,
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
      db.accessory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      db.productLineAccessory.findMany({
        where: { isActive: true },
        include: {
          productLine: { select: { id: true, name: true, code: true } },
          accessory: { select: { id: true, name: true, code: true, price: true, unit: true } },
        },
      }),
      db.pricingRule.findMany({
        where: { isActive: true },
        include: {
          productLine: { select: { id: true, name: true, code: true } },
        },
      }),
    ]);

    return NextResponse.json({
      productTypes,
      productLines,
      productTypeLines,
      colors,
      productLineColors,
      glassOptions,
      accessories,
      productLineAccessories,
      pricingRules,
    });
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch catalog data' },
      { status: 500 }
    );
  }
}
