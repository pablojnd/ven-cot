import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================
// GET /api/quotes/[id] — Get full quote detail
// ============================================

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const quote = await db.quote.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            productType: {
              select: { id: true, name: true, code: true, icon: true },
            },
            productLine: {
              select: { id: true, name: true, code: true, pricePerM2: true },
            },
            glassOption: {
              select: { id: true, name: true, code: true, surchargePct: true },
            },
            color: {
              select: { id: true, name: true, code: true, hexValue: true, surchargePct: true, isRAL: true },
            },
            accessories: {
              include: {
                accessory: {
                  select: { id: true, name: true, code: true, price: true, unit: true },
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

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/quotes/[id] — Soft delete (set status to cancelled)
// ============================================

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const quote = await db.quote.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    if (quote.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Quote is already cancelled' },
        { status: 400 }
      );
    }

    const updatedQuote = await db.quote.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json(updatedQuote);
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json(
      { error: 'Failed to delete quote' },
      { status: 500 }
    );
  }
}
