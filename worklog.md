---
Task ID: 2-3
Agent: Main Agent
Task: Update Crispieri Cotizador with real pricing data from Excel

Work Log:
- Analyzed uploaded Excel file (desglose_formulas_presupuestos_crispieri.xlsx) with 8 sheets
- Extracted 12 real product lines with actual margin percentages (10% to 80%)
- Extracted aluminum profile prices for all lines (81 profiles total)
- Extracted glass prices per line per glass type (98 line-glass combos)
- Extracted accessories with natural/café price variants
- Identified real colors: Natural, Café, Titanio, Blanco, Madera, RAL
- Identified CEILING rounding formula (round up to $1000 multiples)
- Reset database and re-seeded with real Crispieri data
- Updated Prisma schema with marginPct, marginPctCafe, pricePerM2 per line-glass, priceCafe for accessories
- Added ProfilePrice table for aluminum profile prices
- Updated catalog API to return productLineGlass and profilePrices
- Updated pricing service with real Crispieri formula (profiles+glass+accessories+labor → margin → CEILING → IVA)
- Updated client-side estimatePrice to use actual profile prices from catalog
- Updated all frontend components: ProductTypeSelector (6 types), LineSelector (margins), ColorSelector (6 real colors), GlassSelector (per-line with prices), AccessoriesSelector (color-aware pricing)
- Fixed toast notification to show total with IVA

Stage Summary:
- 12 real Crispieri product lines (Línea 5000, 7000, 8000, Brazo Ext, Abatir, CP 7095, CP 30x60, Puerta Tubo, Fijo Tubular, Fijo CP, Celosías, Shower Door)
- Real aluminum profile prices from Excel (e.g., Riel Inferior 5001: $8,408 natural / $9,861 café)
- Real glass prices per m² (e.g., Doble Inc. in Línea 5000: $15,900/m², in Línea 7000: $5,500/m²)
- Real color surcharges: Titanio +10%, Blanco +10%, Madera +15%, RAL +20%
- CEILING rounding to $1,000 multiples
- IVA 19% shown separately
