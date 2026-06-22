# Task 3 - Backend API Development

## Agent: Backend Developer

## Summary
Built the complete backend for the CRISPIERI window/door quotation system, including pricing calculation service, quote number generator, and all API routes.

## Files Created

### 1. Pricing Service (`src/lib/pricing.ts`)
- `calculatePrice()` — Full price breakdown calculation with rules:
  - Area calculation from mm dimensions (with minimum area rule)
  - Base price = pricePerM2 × area
  - Color surcharge as percentage of base price
  - Glass surcharge as percentage of base price
  - Panel surcharge for multi-panel items (base × surcharge% × (panelCount-1))
  - Accessories total (price × quantity for each)
  - Subtotal, IVA (19%), total, unitTotal
- `generateBreakdownRecords()` — Creates human-readable breakdown records for DB storage

### 2. Quote Number Generator (`src/lib/quoteNumber.ts`)
- `generateQuoteNumber()` — Sequential format COT-YYYYMMDD-XXXX
- Queries DB for latest quote number of the day to determine next sequence

### 3. API Routes

#### GET `/api/catalog` (`src/app/api/catalog/route.ts`)
- Returns all catalog data in parallel: productTypes, productLines, productTypeLines, colors, productLineColors, glassOptions, accessories, productLineAccessories, pricingRules

#### POST `/api/quotes` (`src/app/api/quotes/route.ts`)
- Zod validation for dimensions (400-4000mm width, 400-3000mm height), panel count, quantity
- Server-side price recalculation using pricing service
- Transaction-based creation of quote with items, accessories, and breakdowns
- 30-day expiry date

#### GET `/api/quotes` (`src/app/api/quotes/route.ts`)
- Pagination support (page, limit params)
- Status filtering

#### GET `/api/quotes/[id]` (`src/app/api/quotes/[id]/route.ts`)
- Full quote detail with items, product info, accessories, price breakdowns

#### DELETE `/api/quotes/[id]` (`src/app/api/quotes/[id]/route.ts`)
- Soft delete by setting status to "cancelled"

#### PUT `/api/quotes/[id]/status` (`src/app/api/quotes/[id]/status/route.ts`)
- Validated state machine transitions:
  - draft → sent, cancelled
  - sent → approved, rejected, expired, cancelled
  - approved → cancelled
  - Any → cancelled

#### POST `/api/quotes/[id]/duplicate` (`src/app/api/quotes/[id]/duplicate/route.ts`)
- Deep copy of quote with new quote number and draft status
- Copies items, accessories, and price breakdowns

## Testing Results
All APIs tested successfully:
- Catalog returns all 4 product types, 3 lines, 7 colors, 4 glass options, 4 accessories, 12 pricing rules
- Quote creation with single and multi-item quotes
- Price calculations verified (base price, color/glass/panel surcharges, minimum area rule, IVA)
- Status transitions work correctly with validation
- Invalid transitions properly rejected
- Duplicate creates new quote with same data but new number
- Soft delete works
- Zod validation catches invalid dimensions and quantities
- ESLint passes with no errors

## Database
- SQLite database already seeded with catalog data
- No schema changes needed (schema was already set up by previous agent)
