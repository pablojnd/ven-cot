---
Task ID: 1-6
Agent: Main Agent
Task: Build complete CRISPIERI quotation system

Work Log:
- Created Prisma schema with 14+ tables: ProductLine, ProductType, ProductTypeLine, Color, ProductLineColor, GlassOption, Accessory, ProductLineAccessory, Material, HardwareItem, PricingRule, Quote, QuoteItem, QuoteItemAccessory, QuoteItemPriceBreakdown
- Ran db:push to create the SQLite database
- Created seed script with: 4 product types, 3 product lines, 7 colors, 4 glass options, 4 accessories, 2 materials, 4 hardware items, 12 pricing rules
- Built API routes: GET /api/catalog, POST/GET /api/quotes, GET/PUT/DELETE /api/quotes/[id], PUT /api/quotes/[id]/status, POST /api/quotes/[id]/duplicate
- Built pricing service with server-side calculation (area, base price, color/glass/panel surcharges, accessories, IVA 19%)
- Built quote number generator (COT-YYYYMMDD-XXXX format)
- Created API service layer with types and client-side price estimation function
- Created Zustand store (useQuoteStore) with full state management, catalog loading, price recalculation, quote submission, draft save/load
- Built all frontend components: AppHeader, ProductTypeSelector, LineSelector, DimensionInputs, ColorSelector, GlassSelector, AccessoriesSelector, QuantityNotes, ReviewStep, WindowPreview (SVG), QuoteSummary
- Built main page layout with 2/3 + 1/3 column layout, progress bar, responsive design
- Fixed quantity multiplier in pricing calculation (per-unit subtotal × quantity)
- Added Sonner toast notifications for quote generation and draft saving
- Added mobile hamburger menu navigation

Stage Summary:
- Full-stack quotation system for windows and doors
- Professional UI with dark teal (#0D5C63) color palette
- Dynamic SVG preview that changes based on product type, panel count, and color
- Client-side price estimation with real-time updates
- Server-side price recalculation for official quote generation
- All 8 configuration steps working with auto-selection
- Responsive design with mobile navigation
- Database normalized and ready for growth
