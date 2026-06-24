import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateQuoteNumber } from '@/lib/quoteNumber';

// ============================================
// POST /api/quotes/[id]/duplicate — Duplicate a quote
// ============================================

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the original quote with all its items and relations
    const originalQuote = await db.quote.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            accessories: true,
            priceBreakdowns: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!originalQuote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Generate a new quote number
    const newQuoteNumber = await generateQuoteNumber();

    // Calculate expiry date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create the duplicated quote in a transaction
    const duplicatedQuote = await db.$transaction(async (tx) => {
      // Create the new quote
      const newQuote = await tx.quote.create({
        data: {
          quoteNumber: newQuoteNumber,
          status: 'draft',
          clientName: originalQuote.clientName,
          clientEmail: originalQuote.clientEmail,
          clientPhone: originalQuote.clientPhone,
          notes: originalQuote.notes,
          totalSubtotal: originalQuote.totalSubtotal,
          totalTax: originalQuote.totalTax,
          totalAmount: originalQuote.totalAmount,
          currency: originalQuote.currency,
          expiresAt,
        },
      });

      // Duplicate each item
      for (const item of originalQuote.items) {
        const newItem = await tx.quoteItem.create({
          data: {
            quoteId: newQuote.id,
            productTypeId: item.productTypeId,
            productLineId: item.productLineId,
            glassOptionId: item.glassOptionId,
            colorId: item.colorId,
            widthMm: item.widthMm,
            heightMm: item.heightMm,
            panelCount: item.panelCount,
            quantity: item.quantity,
            observations: item.observations,
            profilesTotal: item.profilesTotal,
            glassTotal: item.glassTotal,
            accessoriesTotal: item.accessoriesTotal,
            laborTotal: item.laborTotal,
            subtotal: item.subtotal,
            marginAmount: item.marginAmount,
            preTotal: item.preTotal,
            tax: item.tax,
            total: item.total,
          },
        });

        // Duplicate accessories
        for (const acc of item.accessories) {
          await tx.quoteItemAccessory.create({
            data: {
              quoteItemId: newItem.id,
              accessoryId: acc.accessoryId,
              quantity: acc.quantity,
              unitPrice: acc.unitPrice,
              totalPrice: acc.totalPrice,
            },
          });
        }

        // Duplicate price breakdowns
        for (const bd of item.priceBreakdowns) {
          await tx.quoteItemPriceBreakdown.create({
            data: {
              quoteItemId: newItem.id,
              concept: bd.concept,
              label: bd.label,
              amount: bd.amount,
              percentage: bd.percentage,
              sortOrder: bd.sortOrder,
            },
          });
        }
      }

      // Return the full duplicated quote
      return await tx.quote.findUnique({
        where: { id: newQuote.id },
        include: {
          items: {
            include: {
              productType: {
                select: { id: true, name: true, code: true, icon: true },
              },
              productLine: {
                select: { id: true, name: true, code: true, marginPct: true, marginPctCafe: true },
              },
              glassOption: {
                select: { id: true, name: true, code: true, description: true },
              },
              color: {
                select: { id: true, name: true, code: true, hexValue: true, surchargePct: true, isRAL: true },
              },
              accessories: {
                include: {
                  accessory: {
                    select: { id: true, name: true, code: true, price: true, priceCafe: true, unit: true },
                  },
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
    });

    return NextResponse.json(duplicatedQuote, { status: 201 });
  } catch (error) {
    console.error('Error duplicating quote:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate quote' },
      { status: 500 }
    );
  }
}
