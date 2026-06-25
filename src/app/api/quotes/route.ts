import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateQuoteNumber } from '@/lib/quoteNumber';
import { calculatePrice, generateBreakdownRecords } from '@/lib/pricing';
import { sendQuoteEmails } from '@/lib/email';
import { z } from 'zod';

// ============================================
// VALIDATION SCHEMAS
// ============================================

const accessoryInputSchema = z.object({
  accessoryId: z.string().min(1),
  quantity: z.number().int().min(1),
});

const quoteItemInputSchema = z.object({
  productTypeId: z.string().min(1),
  productLineId: z.string().min(1),
  glassOptionId: z.string().min(1),
  colorId: z.string().optional().nullable(),
  widthMm: z.number().int().min(400).max(4000),
  heightMm: z.number().int().min(400).max(3000),
  panelCount: z.number().int().min(1).max(10),
  quantity: z.number().int().min(1).max(100),
  observations: z.string().optional().nullable(),
  accessories: z.array(accessoryInputSchema).optional().default([]),
});

const createQuoteSchema = z.object({
  clientName: z.string().optional().nullable(),
  clientEmail: z.string().email().optional().nullable().or(z.literal('')),
  clientPhone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(quoteItemInputSchema).min(1, 'At least one item is required'),
});

// ============================================
// POST /api/quotes — Create a new quote
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = createQuoteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Generate unique quote number
    const quoteNumber = await generateQuoteNumber();

    // Calculate expiry date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create quote with items in a transaction
    const quote = await db.$transaction(async (tx) => {
      // Create the quote
      const newQuote = await tx.quote.create({
        data: {
          quoteNumber,
          status: 'draft',
          clientName: data.clientName || null,
          clientEmail: data.clientEmail || null,
          clientPhone: data.clientPhone || null,
          notes: data.notes || null,
          expiresAt,
          totalSubtotal: 0,
          totalTax: 0,
          totalAmount: 0,
        },
      });

      let totalSubtotal = 0;
      let totalTax = 0;
      let totalAmount = 0;

      // Process each item
      for (const item of data.items) {
        // Fetch product line
        const productLine = await tx.productLine.findUnique({
          where: { id: item.productLineId },
        });
        if (!productLine) {
          throw new Error(`Product line not found: ${item.productLineId}`);
        }

        // Fetch product type
        const productType = await tx.productType.findUnique({
          where: { id: item.productTypeId },
        });
        if (!productType) {
          throw new Error(`Product type not found: ${item.productTypeId}`);
        }

        // Fetch color if provided
        let colorCode = 'natural';
        if (item.colorId) {
          const color = await tx.color.findUnique({
            where: { id: item.colorId },
          });
          if (!color) {
            throw new Error(`Color not found: ${item.colorId}`);
          }
          colorCode = color.code;
        }

        // Fetch glass price from ProductLineGlass
        const productLineGlass = await tx.productLineGlass.findUnique({
          where: {
            productLineId_glassOptionId: {
              productLineId: item.productLineId,
              glassOptionId: item.glassOptionId,
            },
          },
        });
        if (!productLineGlass) {
          throw new Error(`Glass option not available for this product line: ${item.glassOptionId}`);
        }
        const glassPricePerM2 = productLineGlass.pricePerM2;

        // Fetch profile prices for this product line
        const profilePrices = await tx.profilePrice.findMany({
          where: {
            productLineId: item.productLineId,
            isActive: true,
          },
          orderBy: { sortOrder: 'asc' },
        });

        // Fetch pricing rules for this product line
        const pricingRules = await tx.pricingRule.findMany({
          where: {
            productLineId: item.productLineId,
            isActive: true,
          },
        });

        // Get rounding multiple
        const roundingRule = pricingRules.find(r => r.ruleType === 'rounding_multiple');
        const roundingMultiple = roundingRule?.value ?? 1000;

        // Get labor cost
        const laborRule = pricingRules.find(r => r.ruleType === 'labor_cost');
        const laborCost = laborRule?.value ?? 20000;

        // Fetch accessories with their prices
        const accessoryPrices: { name: string; code: string; price: number; priceCafe: number; unit: string; quantity: number }[] = [];
        for (const acc of item.accessories) {
          const accessory = await tx.accessory.findUnique({
            where: { id: acc.accessoryId },
          });
          if (!accessory) {
            throw new Error(`Accessory not found: ${acc.accessoryId}`);
          }
          accessoryPrices.push({
            name: accessory.name,
            code: accessory.code,
            price: accessory.price,
            priceCafe: accessory.priceCafe,
            unit: accessory.unit,
            quantity: acc.quantity,
          });
        }

        // Calculate pricing using real Crispieri formula
        const breakdown = calculatePrice({
          widthMm: item.widthMm,
          heightMm: item.heightMm,
          panelCount: item.panelCount,
          quantity: item.quantity,
          productLineCode: productLine.code,
          productTypeCode: productType.code,
          marginPct: productLine.marginPct,
          marginPctCafe: productLine.marginPctCafe,
          colorCode,
          glassPricePerM2,
          profilePrices: profilePrices.map(pp => ({
            profileName: pp.profileName,
            profileCode: pp.profileCode,
            priceNatural: pp.priceNatural,
            priceCafe: pp.priceCafe,
            stripLengthM: pp.stripLengthM,
          })),
          accessoryPrices,
          laborCost,
          roundingMultiple,
        });

        // Create quote item with new schema fields
        const quoteItem = await tx.quoteItem.create({
          data: {
            quoteId: newQuote.id,
            productTypeId: item.productTypeId,
            productLineId: item.productLineId,
            glassOptionId: item.glassOptionId,
            colorId: item.colorId || null,
            widthMm: item.widthMm,
            heightMm: item.heightMm,
            panelCount: item.panelCount,
            quantity: item.quantity,
            observations: item.observations || null,
            profilesTotal: breakdown.profilesTotal,
            glassTotal: breakdown.glassTotal,
            accessoriesTotal: breakdown.accessoriesTotal,
            laborTotal: breakdown.laborTotal,
            subtotal: breakdown.subtotal,
            marginAmount: breakdown.marginAmount,
            preTotal: breakdown.preTotal,
            tax: breakdown.tax,
            total: breakdown.total,
          },
        });

        // Create accessory records
        for (const acc of item.accessories) {
          const accessory = await tx.accessory.findUnique({
            where: { id: acc.accessoryId },
          });
          if (accessory) {
            const useCafePrice = colorCode !== 'natural' && colorCode !== 'satinado';
            const unitPrice = useCafePrice ? accessory.priceCafe : accessory.price;
            await tx.quoteItemAccessory.create({
              data: {
                quoteItemId: quoteItem.id,
                accessoryId: acc.accessoryId,
                quantity: acc.quantity,
                unitPrice,
                totalPrice: unitPrice * acc.quantity,
              },
            });
          }
        }

        // Create price breakdown records
        const breakdownRecords = generateBreakdownRecords(breakdown, {
          widthMm: item.widthMm,
          heightMm: item.heightMm,
          panelCount: item.panelCount,
          quantity: item.quantity,
          productLineCode: productLine.code,
          productTypeCode: productType.code,
          marginPct: productLine.marginPct,
          marginPctCafe: productLine.marginPctCafe,
          colorCode,
          glassPricePerM2,
          profilePrices: profilePrices.map(pp => ({
            profileName: pp.profileName,
            profileCode: pp.profileCode,
            priceNatural: pp.priceNatural,
            priceCafe: pp.priceCafe,
            stripLengthM: pp.stripLengthM,
          })),
          accessoryPrices,
          laborCost,
          roundingMultiple,
        });

        for (const record of breakdownRecords) {
          await tx.quoteItemPriceBreakdown.create({
            data: {
              quoteItemId: quoteItem.id,
              concept: record.concept,
              label: record.label,
              amount: record.amount,
              percentage: record.percentage,
              sortOrder: record.sortOrder,
            },
          });
        }

        // Accumulate totals (totalAmount = preTotal without IVA, as per Crispieri convention)
        totalSubtotal += breakdown.subtotal;
        totalTax += breakdown.tax;
        totalAmount += breakdown.total;
      }

      // Update quote totals
      const updatedQuote = await tx.quote.update({
        where: { id: newQuote.id },
        data: {
          totalSubtotal: Math.round(totalSubtotal),
          totalTax: Math.round(totalTax),
          totalAmount: Math.round(totalAmount),
        },
        include: {
          items: {
            include: {
              productType: true,
              productLine: true,
              glassOption: true,
              color: true,
              accessories: {
                include: {
                  accessory: true,
                },
              },
              priceBreakdowns: {
                orderBy: { sortOrder: 'asc' },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      return updatedQuote;
    });

    // Send emails asynchronously (don't block response)
    sendQuoteEmails({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      clientName: quote.clientName,
      clientPhone: quote.clientPhone,
      clientEmail: quote.clientEmail,
      totalSubtotal: quote.totalSubtotal,
      totalTax: quote.totalTax,
      totalAmount: quote.totalAmount,
      items: quote.items.map((item) => ({
        quantity: item.quantity,
        productType: item.productType,
        productLine: item.productLine,
        widthMm: item.widthMm,
        heightMm: item.heightMm,
        panelCount: item.panelCount,
        color: item.color,
        glassOption: item.glassOption,
        total: item.total,
        observations: item.observations,
      })),
    }).catch((err) => console.error('Error sending quote emails:', err));

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}

// ============================================
// GET /api/quotes — List quotes with pagination
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const status = searchParams.get('status') || undefined;

    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [quotes, total] = await Promise.all([
      db.quote.findMany({
        where,
        include: {
          items: {
            select: {
              id: true,
              productTypeId: true,
              quantity: true,
              total: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.quote.count({ where }),
    ]);

    return NextResponse.json({
      quotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error listing quotes:', error);
    return NextResponse.json(
      { error: 'Failed to list quotes' },
      { status: 500 }
    );
  }
}
