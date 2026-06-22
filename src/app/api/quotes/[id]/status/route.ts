import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// ============================================
// Valid status transitions:
// - draft → sent
// - sent → approved, rejected, expired
// - approved → cancelled
// - Any → cancelled
// ============================================

const VALID_TRANSITIONS: Record<string, Set<string>> = {
  draft: new Set(['sent', 'cancelled']),
  sent: new Set(['approved', 'rejected', 'expired', 'cancelled']),
  approved: new Set(['cancelled']),
  rejected: new Set(['cancelled']),
  expired: new Set(['cancelled']),
  cancelled: new Set([]),
};

const updateStatusSchema = z.object({
  status: z.enum(['draft', 'sent', 'approved', 'rejected', 'expired', 'cancelled']),
});

// ============================================
// PUT /api/quotes/[id]/status — Update quote status
// ============================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = updateStatusSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { status: newStatus } = validationResult.data;

    // Fetch current quote
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

    const currentStatus = quote.status;

    // Check if transition is valid
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];
    if (!allowedTransitions || !allowedTransitions.has(newStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status transition from "${currentStatus}" to "${newStatus}"`,
          currentStatus,
          allowedTransitions: Array.from(allowedTransitions || []),
        },
        { status: 400 }
      );
    }

    // Update status
    const updatedQuote = await db.quote.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json(updatedQuote);
  } catch (error) {
    console.error('Error updating quote status:', error);
    return NextResponse.json(
      { error: 'Failed to update quote status' },
      { status: 500 }
    );
  }
}
