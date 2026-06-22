import { db } from '@/lib/db';

/**
 * Generate a unique quote number in the format: COT-YYYYMMDD-XXXX
 * where XXXX is a sequential number for that date.
 *
 * Example: COT-20260622-0001
 */
export async function generateQuoteNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, '0') +
    String(today.getDate()).padStart(2, '0');

  const prefix = `COT-${dateStr}-`;

  // Find the latest quote number for today
  const latestQuote = await db.quote.findFirst({
    where: {
      quoteNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      quoteNumber: 'desc',
    },
    select: {
      quoteNumber: true,
    },
  });

  let sequence = 1;

  if (latestQuote) {
    const lastSequence = parseInt(latestQuote.quoteNumber.slice(-4), 10);
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }

  const sequenceStr = String(sequence).padStart(4, '0');
  return `${prefix}${sequenceStr}`;
}
