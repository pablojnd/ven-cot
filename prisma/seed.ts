import { db } from '../src/lib/db';

async function main() {
  console.log('🌱 Seeding real Crispieri data...');

  // ═══════════════════════════════════════════
  // PRODUCT TYPES (categories of products)
  // ═══════════════════════════════════════════
  const corredera = await db.productType.create({ data: { name: 'Ventana Corredera', code: 'corredera', description: 'Ventana corredera de aluminio', icon: 'sliding', sortOrder: 1 } });
  const abatible = await db.productType.create({ data: { name: 'Ventana Abatible', code: 'abatible', description: 'Ventana abatible / proyectante', icon: 'hinged', sortOrder: 2 } });
  const puerta = await db.productType.create({ data: { name: 'Puerta', code: 'puerta', description: 'Puerta de aluminio', icon: 'door', sortOrder: 3 } });
  const fijo = await db.productType.create({ data: { name: 'Fijo', code: 'fijo', description: 'Panel fijo de aluminio', icon: 'fixed', sortOrder: 4 } });
  const celosia = await db.productType.create({ data: { name: 'Celosía', code: 'celosia', description: 'Celosía de aluminio', icon: 'louvers', sortOrder: 5 } });
  const shower = await db.productType.create({ data: { name: 'Shower Door', code: 'shower-door', description: 'Puerta de ducha', icon: 'shower', sortOrder: 6 } });

  // ═══════════════════════════════════════════
  // PRODUCT LINES (real Crispieri lines)
  // ═══════════════════════════════════════════
  const l5000 = await db.productLine.create({ data: { name: 'Línea 5000', code: 'linea-5000', description: 'Línea 5000 corredera estándar', marginPct: 15, marginPctCafe: 25, sortOrder: 1 } });
  const l7000 = await db.productLine.create({ data: { name: 'Línea 7000', code: 'linea-7000', description: 'Línea 7000 corredera premium', marginPct: 80, marginPctCafe: 80, sortOrder: 2 } });
  const l8000 = await db.productLine.create({ data: { name: 'Línea 8000', code: 'linea-8000', description: 'Línea 8000 con termopanel', marginPct: 10, marginPctCafe: 10, sortOrder: 3 } });
  const brazoExt = await db.productLine.create({ data: { name: 'Ventana Brazo Ext.', code: 'brazo-ext', description: 'Ventana con brazo exterior', marginPct: 15, marginPctCafe: 15, sortOrder: 4 } });
  const ventAbatir = await db.productLine.create({ data: { name: 'Ventana de Abatir', code: 'vent-abatir', description: 'Ventana de abatir', marginPct: 40, marginPctCafe: 80, sortOrder: 5 } });
  const cp7095 = await db.productLine.create({ data: { name: 'Centro Puerta 7095/5034', code: 'cp-7095', description: 'Fijo con centro de puerta 7095/5034', marginPct: 30, marginPctCafe: 30, sortOrder: 6 } });
  const cp3060 = await db.productLine.create({ data: { name: 'Centro Puerta 30x60/40x80', code: 'cp-3060', description: 'Centro puerta tubular 30x60 o 40x80', marginPct: 20, marginPctCafe: 30, sortOrder: 7 } });
  const puertaTubo = await db.productLine.create({ data: { name: 'Puerta Tubo 40x40/40x100', code: 'puerta-tubo', description: 'Puerta tubo 40x40 o 40x100', marginPct: 20, marginPctCafe: 20, sortOrder: 8 } });
  const fijoTub = await db.productLine.create({ data: { name: 'Fijo Tubular Rectangular', code: 'fijo-tubular', description: 'Fijo con tubular rectangular', marginPct: 40, marginPctCafe: 40, sortOrder: 9 } });
  const fijoCP = await db.productLine.create({ data: { name: 'Fijo con Centro de Puerta', code: 'fijo-cp', description: 'Fijo con centro de puerta', marginPct: 40, marginPctCafe: 80, sortOrder: 10 } });
  const celosias = await db.productLine.create({ data: { name: 'Celosías', code: 'celosias', description: 'Celosías de aluminio', marginPct: 50, marginPctCafe: 50, sortOrder: 11 } });
  const showerDoor = await db.productLine.create({ data: { name: 'Shower Door AM-12', code: 'shower-am12', description: 'Shower Door línea AM-12 ALUMCO', marginPct: 10, marginPctCafe: 10, sortOrder: 12 } });

  const allLines = [l5000, l7000, l8000, brazoExt, ventAbatir, cp7095, cp3060, puertaTubo, fijoTub, fijoCP, celosias, showerDoor];

  // ═══════════════════════════════════════════
  // PRODUCT TYPE ↔ LINE associations
  // ═══════════════════════════════════════════
  // Correderas: Línea 5000, 7000, 8000
  for (const l of [l5000, l7000, l8000]) {
    await db.productTypeLine.create({ data: { productTypeId: corredera.id, productLineId: l.id } });
  }
  // Abatibles: Brazo Ext, Ventana Abatir
  for (const l of [brazoExt, ventAbatir]) {
    await db.productTypeLine.create({ data: { productTypeId: abatible.id, productLineId: l.id } });
  }
  // Puertas: Centro Puerta 7095, 30x60, Puerta Tubo
  for (const l of [cp7095, cp3060, puertaTubo]) {
    await db.productTypeLine.create({ data: { productTypeId: puerta.id, productLineId: l.id } });
  }
  // Fijos: Fijo Tubular, Fijo CP
  for (const l of [fijoTub, fijoCP]) {
    await db.productTypeLine.create({ data: { productTypeId: fijo.id, productLineId: l.id } });
  }
  // Celosías
  await db.productTypeLine.create({ data: { productTypeId: celosia.id, productLineId: celosias.id } });
  // Shower Door
  await db.productTypeLine.create({ data: { productTypeId: shower.id, productLineId: showerDoor.id } });

  // ═══════════════════════════════════════════
  // COLORS (real Crispieri colors with surcharges)
  // ═══════════════════════════════════════════
  const natural = await db.color.create({ data: { name: 'Natural', code: 'natural', hexValue: '#C0C0C0', surchargePct: 0, sortOrder: 1 } });
  const cafe = await db.color.create({ data: { name: 'Café', code: 'cafe', hexValue: '#5C3317', surchargePct: 0, sortOrder: 2 } }); // Base price column D
  const titanio = await db.color.create({ data: { name: 'Titanio', code: 'titanio', hexValue: '#4A4A4A', surchargePct: 10, sortOrder: 3 } });
  const blanco = await db.color.create({ data: { name: 'Blanco', code: 'blanco', hexValue: '#FFFFFF', surchargePct: 10, sortOrder: 4 } });
  const madera = await db.color.create({ data: { name: 'Madera', code: 'madera', hexValue: '#8B6914', surchargePct: 15, sortOrder: 5 } });
  const personalizado = await db.color.create({ data: { name: 'Personalizado RAL', code: 'ral', hexValue: '#888888', surchargePct: 20, isRAL: true, sortOrder: 6 } });

  const allColors = [natural, cafe, titanio, blanco, madera, personalizado];

  // Associate colors with lines (varies by line)
  // Most lines have: natural, café, titanio, blanco
  // Some also have: madera
  // Línea 7000 and Celosías: only natural, café, titanio
  for (const l of allLines) {
    // All lines have natural and café
    await db.productLineColor.create({ data: { productLineId: l.id, colorId: natural.id } });
    await db.productLineColor.create({ data: { productLineId: l.id, colorId: cafe.id } });
    
    // Most lines have titanio (not Línea 7000 and Celosías in some cases, but we include for simplicity)
    await db.productLineColor.create({ data: { productLineId: l.id, colorId: titanio.id } });

    // Most lines have blanco (not Línea 7000, Celosías)
    if (![l7000.id, celosias.id].includes(l.id)) {
      await db.productLineColor.create({ data: { productLineId: l.id, colorId: blanco.id } });
    }

    // Some lines have madera
    if ([l5000.id, l8000.id, cp7095.id, puertaTubo.id, fijoTub.id, fijoCP.id].includes(l.id)) {
      await db.productLineColor.create({ data: { productLineId: l.id, colorId: madera.id } });
    }

    // All lines can have personalizado
    await db.productLineColor.create({ data: { productLineId: l.id, colorId: personalizado.id } });
  }

  // ═══════════════════════════════════════════
  // GLASS OPTIONS (real Crispieri glass types)
  // ═══════════════════════════════════════════
  const gDoble = await db.glassOption.create({ data: { name: 'Doble Incoloro', code: 'doble-inc', description: 'Doble vidrio incoloro', sortOrder: 1 } });
  const gTriple = await db.glassOption.create({ data: { name: 'Triple Incoloro', code: 'triple-inc', description: 'Triple vidrio incoloro', sortOrder: 2 } });
  const gVitrea = await db.glassOption.create({ data: { name: 'Vitrea Incolora', code: 'vitrea-inc', description: 'Vitrea incolora', sortOrder: 3 } });
  const gBronc4 = await db.glassOption.create({ data: { name: 'Bronce 4mm', code: 'bronc-4mm', description: 'Vidrio bronce 4mm', sortOrder: 4 } });
  const gBronc5 = await db.glassOption.create({ data: { name: 'Bronce 5mm', code: 'bronc-5mm', description: 'Vidrio bronce 5mm', sortOrder: 5 } });
  const gBronc6 = await db.glassOption.create({ data: { name: 'Bronce 6mm', code: 'bronc-6mm', description: 'Vidrio bronce 6mm', sortOrder: 6 } });
  const gCatedral = await db.glassOption.create({ data: { name: 'Catedral', code: 'catedral', description: 'Vidrio catedral', sortOrder: 7 } });
  const gCatColor = await db.glassOption.create({ data: { name: 'Catedral Color', code: 'cat-color', description: 'Vidrio catedral color', sortOrder: 8 } });
  const gStopSol = await db.glassOption.create({ data: { name: 'Stop Sol 4mm', code: 'stop-sol', description: 'Vidrio reflectivo Stop Sol', sortOrder: 9 } });
  const gSolarCool = await db.glassOption.create({ data: { name: 'Solar Cool 5mm', code: 'solar-cool', description: 'Vidrio Solar Cool', sortOrder: 10 } });
  const gInast6 = await db.glassOption.create({ data: { name: 'Inastillable 6.4mm', code: 'inast-6mm', description: 'Vidrio inastillable 6.4mm', sortOrder: 11 } });
  const gInast8 = await db.glassOption.create({ data: { name: 'Inastillable 8.4mm', code: 'inast-8mm', description: 'Vidrio inastillable 8.4mm', sortOrder: 12 } });
  const gCrInc6 = await db.glassOption.create({ data: { name: 'Cristal Incoloro 6mm', code: 'cr-inc-6mm', description: 'Cristal incoloro 6mm', sortOrder: 13 } });
  const gTermopanel = await db.glassOption.create({ data: { name: 'Termopanel', code: 'termopanel', description: 'Termopanel con cámara de aire', sortOrder: 14 } });
  const gReflex = await db.glassOption.create({ data: { name: 'Reflex Bronce 4mm', code: 'reflex-bronc', description: 'Vidrio reflex bronce 4mm', sortOrder: 15 } });
  const gInc4 = await db.glassOption.create({ data: { name: 'Incoloro 4mm', code: 'inc-4mm', description: 'Vidrio incoloro 4mm', sortOrder: 16 } });
  const gInc5 = await db.glassOption.create({ data: { name: 'Incoloro 5mm', code: 'inc-5mm', description: 'Vidrio incoloro 5mm', sortOrder: 17 } });
  const gInc6 = await db.glassOption.create({ data: { name: 'Incoloro 6mm', code: 'inc-6mm', description: 'Vidrio incoloro 6mm', sortOrder: 18 } });

  // ═══════════════════════════════════════════
  // GLASS PRICES PER PRODUCT LINE (per m²)
  // ═══════════════════════════════════════════
  // Línea 5000 glass prices
  const l5kGlass = [
    [gDoble, 15900], [gTriple, 21200], [gCatedral, 18900], [gBronc4, 23320],
    [gCatColor, 23330], [gStopSol, 31520],
  ];
  for (const [g, p] of l5kGlass) {
    await db.productLineGlass.create({ data: { productLineId: l5000.id, glassOptionId: g.id, pricePerM2: p } });
  }

  // Línea 7000 glass prices (lower — these are per m² for this line)
  const l7kGlass = [
    [gDoble, 5500], [gTriple, 7250], [gVitrea, 9000], [gBronc4, 8250],
    [gBronc5, 10125], [gCatedral, 6875], [gCatColor, 10560], [gCrInc6, 11000],
    [gSolarCool, 15750],
  ];
  for (const [g, p] of l7kGlass) {
    await db.productLineGlass.create({ data: { productLineId: l7000.id, glassOptionId: g.id, pricePerM2: p } });
  }

  // Línea 8000 glass prices
  const l8kGlass = [
    [gTriple, 21200], [gVitrea, 26500], [gCrInc6, 31800], [gBronc4, 23320],
    [gBronc5, 29150], [gBronc6, 34980], [gCatedral, 18900], [gCatColor, 23330],
    [gSolarCool, 35810], [gInast6, 60230], [gTermopanel, 39600],
  ];
  for (const [g, p] of l8kGlass) {
    await db.productLineGlass.create({ data: { productLineId: l8000.id, glassOptionId: g.id, pricePerM2: p } });
  }

  // Ventana con Brazo Ext. glass prices
  const bxtGlass = [
    [gDoble, 17020], [gTriple, 22690], [gVitrea, 28360], [gCatedral, 20790],
    [gCatColor, 25670], [gBronc4, 25660], [gBronc5, 32070], [gReflex, 34680],
    [gInast6, 66260],
  ];
  for (const [g, p] of bxtGlass) {
    await db.productLineGlass.create({ data: { productLineId: brazoExt.id, glassOptionId: g.id, pricePerM2: p } });
  }

  // Ventana de Abatir glass prices
  const vabGlass = [
    [gDoble, 15900], [gTriple, 21200], [gVitrea, 26500], [gCatedral, 18900],
    [gCatColor, 23330], [gBronc4, 23320], [gBronc5, 29150],
  ];
  for (const [g, p] of vabGlass) {
    await db.productLineGlass.create({ data: { productLineId: ventAbatir.id, glassOptionId: g.id, pricePerM2: p } });
  }

  // Centro Puerta 7095/5034 glass prices
  const cp70Glass = [
    [gDoble, 15900], [gTriple, 21200], [gVitrea, 26500], [gBronc4, 23320],
    [gBronc5, 29150], [gCatedral, 18900], [gCatColor, 23330],
  ];
  for (const [g, p] of cp70Glass) {
    await db.productLineGlass.create({ data: { productLineId: cp7095.id, glassOptionId: g.id, pricePerM2: p } });
  }

  // Centro Puerta 30x60 glass
  const cp30Glass = [
    [gCrInc6, 19500], // Cristal 10mm
  ];
  for (const [g, p] of cp30Glass) {
    await db.productLineGlass.create({ data: { productLineId: cp3060.id, glassOptionId: g.id, pricePerM2: p } });
  }
  // Also add standard glass options for cp3060
  for (const [g, p] of cp70Glass) {
    await db.productLineGlass.create({ data: { productLineId: cp3060.id, glassOptionId: g.id, pricePerM2: p } });
  }

  // Puerta Tubo glass prices
  const ptGlass = [
    [gDoble, 15900], [gTriple, 21200], [gVitrea, 26500], [gBronc4, 23320],
    [gBronc5, 29150], [gCatedral, 18900], [gCatColor, 23330], [gCrInc6, 31800],
    [gInast6, 60230], [gSolarCool, 35810],
  ];
  for (const [g, p] of ptGlass) {
    await db.productLineGlass.create({ data: { productLineId: puertaTubo.id, glassOptionId: g.id, pricePerM2: p } });
  }

  // Fijo Tubular glass prices
  const ftGlass = [
    [gInc4, 22690], [gInc5, 28360], [gInc6, 34030], [gBronc4, 25660],
    [gBronc5, 32070], [gBronc6, 38480], [gCatedral, 20790], [gCatColor, 25670],
    [gSolarCool, 39400], [gInast6, 66260], [gInast8, 88430],
  ];
  for (const [g, p] of ftGlass) {
    await db.productLineGlass.create({ data: { productLineId: fijoTub.id, glassOptionId: g.id, pricePerM2: p } });
  }

  // Fijo con Centro de Puerta glass prices
  const fcpGlass = [
    [gDoble, 15900], [gTriple, 21200], [gVitrea, 26500], [gBronc4, 23320],
    [gBronc5, 29150], [gCatedral, 18900], [gCatColor, 23330], [gStopSol, 34680],
    [gInast6, 60230],
  ];
  for (const [g, p] of fcpGlass) {
    await db.productLineGlass.create({ data: { productLineId: fijoCP.id, glassOptionId: g.id, pricePerM2: p } });
  }

  // Celosías glass prices
  const celGlass = [
    [gDoble, 15900], [gTriple, 21200], [gVitrea, 26500], [gBronc4, 23320],
    [gBronc5, 29150], [gCatedral, 18900], [gCatColor, 23330], [gCrInc6, 31800],
  ];
  for (const [g, p] of celGlass) {
    await db.productLineGlass.create({ data: { productLineId: celosias.id, glassOptionId: g.id, pricePerM2: p } });
  }

  // Shower Door glass prices (uses acrílicos and special)
  const sdGlass = [
    [gInc4, 20200], [gBronc4, 25660], [gBronc5, 32070],
  ];
  for (const [g, p] of sdGlass) {
    await db.productLineGlass.create({ data: { productLineId: showerDoor.id, glassOptionId: g.id, pricePerM2: p } });
  }

  // ═══════════════════════════════════════════
  // ACCESSORIES (real Crispieri accessories with prices)
  // ═══════════════════════════════════════════
  const accBurlete = await db.accessory.create({ data: { name: 'Burlete', code: 'burlete', description: 'Burlete para sellado', price: 300, priceCafe: 300, unit: 'metro', sortOrder: 1 } });
  const accFelpa = await db.accessory.create({ data: { name: 'Felpa', code: 'felpa', description: 'Felpa para corredera (+10% holgura)', price: 130, priceCafe: 140, unit: 'metro', sortOrder: 2 } });
  const accRodamiento = await db.accessory.create({ data: { name: 'Rodamiento', code: 'rodamiento', description: 'Rodamiento para corredera', price: 350, priceCafe: 350, unit: 'par', sortOrder: 3 } });
  const accPestillo = await db.accessory.create({ data: { name: 'Pestillo', code: 'pestillo', description: 'Pestillo de seguridad', price: 1200, priceCafe: 1400, unit: 'unidad', sortOrder: 4 } });
  const accBisagra = await db.accessory.create({ data: { name: 'Bisagra', code: 'bisagra', description: 'Bisagra para abatir', price: 630, priceCafe: 830, unit: 'par', sortOrder: 5 } });
  const accManilla = await db.accessory.create({ data: { name: 'Manilla', code: 'manilla', description: 'Manilla para ventana', price: 2630, priceCafe: 2880, unit: 'unidad', sortOrder: 6 } });
  const accBrazoExt = await db.accessory.create({ data: { name: 'Brazo Exterior', code: 'brazo-ext', description: 'Brazo exterior para proyectante', price: 5700, priceCafe: 5700, unit: 'unidad', sortOrder: 7 } });
  const accQuicio = await db.accessory.create({ data: { name: 'Quicio Scanavini', code: 'quicio', description: 'Quicio Scanavini para puerta', price: 27000, priceCafe: 27000, unit: 'par', sortOrder: 8 } });
  const accAmarre = await db.accessory.create({ data: { name: 'Amarre', code: 'amarre', description: 'Amarre angular', price: 500, priceCafe: 500, unit: 'unidad', sortOrder: 9 } });
  const accSilicona = await db.accessory.create({ data: { name: 'Silicona', code: 'silicona', description: 'Silicona sellante', price: 1300, priceCafe: 1950, unit: 'unidad', sortOrder: 10 } });
  const accTarugo = await db.accessory.create({ data: { name: 'Tarugo/Tornillo', code: 'tarugo-tornillo', description: 'Tarugos y tornillos de fijación', price: 1500, priceCafe: 1500, unit: 'juego', sortOrder: 11 } });
  const accTTRS = await db.accessory.create({ data: { name: 'T.T.R.S.', code: 'ttrs', description: 'Tornillo, tarugo, roldana, separador', price: 1000, priceCafe: 1000, unit: 'juego', sortOrder: 12 } });

  // Associate accessories with lines
  // Línea 5000: burlete, felpa, rodamiento, pestillo
  for (const a of [accBurlete, accFelpa, accRodamiento, accPestillo]) {
    await db.productLineAccessory.create({ data: { productLineId: l5000.id, accessoryId: a.id } });
  }
  // Línea 7000: burlete, felpa, rodamiento, pestillo
  for (const a of [accBurlete, accFelpa, accRodamiento, accPestillo]) {
    await db.productLineAccessory.create({ data: { productLineId: l7000.id, accessoryId: a.id } });
  }
  // Línea 8000: burlete, felpa, rodamiento, pestillo
  for (const a of [accBurlete, accFelpa, accRodamiento, accPestillo]) {
    await db.productLineAccessory.create({ data: { productLineId: l8000.id, accessoryId: a.id } });
  }
  // Brazo Ext: felpa, manilla, brazo exterior, amarre
  for (const a of [accFelpa, accManilla, accBrazoExt, accAmarre]) {
    await db.productLineAccessory.create({ data: { productLineId: brazoExt.id, accessoryId: a.id } });
  }
  // Ventana Abatir: burlete, felpa, pestillo, bisagra, brazo ext
  for (const a of [accBurlete, accFelpa, accPestillo, accBisagra, accBrazoExt]) {
    await db.productLineAccessory.create({ data: { productLineId: ventAbatir.id, accessoryId: a.id } });
  }
  // CP 7095: felpa, bisagra, TTRS
  for (const a of [accFelpa, accBisagra, accTTRS]) {
    await db.productLineAccessory.create({ data: { productLineId: cp7095.id, accessoryId: a.id } });
  }
  // CP 30x60: quicio, TTRS
  for (const a of [accQuicio, accTTRS]) {
    await db.productLineAccessory.create({ data: { productLineId: cp3060.id, accessoryId: a.id } });
  }
  // Puerta Tubo: TTRS
  await db.productLineAccessory.create({ data: { productLineId: puertaTubo.id, accessoryId: accTTRS.id } });
  // Fijo Tubular: silicona, tarugo
  for (const a of [accSilicona, accTarugo]) {
    await db.productLineAccessory.create({ data: { productLineId: fijoTub.id, accessoryId: a.id } });
  }
  // Fijo CP: silicona, tarugo
  for (const a of [accSilicona, accTarugo]) {
    await db.productLineAccessory.create({ data: { productLineId: fijoCP.id, accessoryId: a.id } });
  }
  // Celosías: escuadras
  // Shower Door: burlete, rodamiento
  for (const a of [accBurlete, accRodamiento]) {
    await db.productLineAccessory.create({ data: { productLineId: showerDoor.id, accessoryId: a.id } });
  }

  // ═══════════════════════════════════════════
  // PROFILE PRICES (real aluminum profile prices)
  // ═══════════════════════════════════════════
  // Línea 5000 profiles
  const l5kProfiles = [
    ['Riel Inferior', '5001', 8408, 9861],
    ['Riel Superior', '5002', 9914, 11628],
    ['Jamba', '5003', 9574, 11229],
    ['Cabecera Inferior', '5004', 10765, 12626],
    ['Cabecera Superior', '5005', 8918, 10460],
    ['Traslapo', '5006', 9331, 10944],
    ['Pierna', '5007', 10473, 12284],
    ['Palillo', '7005', 10498, 12312],
    ['Tubo Rectangular 30x60', '30x60', 17132, 20093],
  ];
  for (const [name, code, nat, caf] of l5kProfiles) {
    await db.profilePrice.create({ data: { productLineId: l5000.id, profileName: name, profileCode: code, priceNatural: nat, priceCafe: caf, stripLengthM: 6 } });
  }

  // Línea 7000 profiles
  const l7kProfiles = [
    ['Riel Inferior', '7001', 11275, 13224],
    ['Riel Superior', '7002', 14167, 16616],
    ['Jamba', '7003', 10303, 12084],
    ['Cabecera Inferior', '7004', 13705, 16074],
    ['Cabecera Superior', '7005', 10498, 12312],
    ['Traslapo', '7006', 11810, 13851],
    ['Pierna', '7007', 11154, 13082],
    ['Palillo', '7005', 10498, 12312],
    ['Perfil 4ª Hoja', '7009', 6099, 7154],
    ['Placa Aluminio', '5859', 14500, 17100],
    ['Tubo Rectangular 30x60', '30x60', 17978, 21150],
    ['Tubo Rectangular 76x25', '76x25', 20273, 23850],
  ];
  for (const [name, code, nat, caf] of l7kProfiles) {
    await db.profilePrice.create({ data: { productLineId: l7000.id, profileName: name, profileCode: code, priceNatural: nat, priceCafe: caf, stripLengthM: 6 } });
  }

  // Línea 8000 profiles
  const l8kProfiles = [
    ['Riel Inferior', '8001', 30540, 32990],
    ['Riel Superior', '8002', 31300, 33800],
    ['Jamba', '8003', 23290, 25160],
    ['Cabecera Inferior', '8004', 28560, 30860],
    ['Cabecera Superior', '8005', 20190, 21800],
    ['Traslapo', '8006', 24780, 26760],
    ['Pierna', '8007', 24210, 26150],
    ['Palillo', '8013', 22370, 24170],
    ['Perfil 4ª Hoja', '8017', 5030, 5900],
    ['Placa Aluminio', '5859', 21150, 22850],
    ['Tubo Rectangular 30x60', '30x60', 28420, 30690],
    ['Tubo Rectangular 76x25', '76x25', 28590, 30880],
  ];
  for (const [name, code, nat, caf] of l8kProfiles) {
    await db.profilePrice.create({ data: { productLineId: l8000.id, profileName: name, profileCode: code, priceNatural: nat, priceCafe: caf, stripLengthM: 6 } });
  }

  // Ventana Brazo Ext. profiles
  const bxtProfiles = [
    ['Marco', '3201', 10830, 13918.72],
    ['Marco Hoja', '3202', 17070, 21938.36],
    ['Junquillo', '3203', 5400, 6940.08],
    ['Amarre', 'A-09', 500, 500],
    ['Tubo Rectangular 30x60', '30x60', 23670, 30420.68],
    ['Pilar Marco', '3204', 20160, 25909.63],
  ];
  for (const [name, code, nat, caf] of bxtProfiles) {
    await db.profilePrice.create({ data: { productLineId: brazoExt.id, profileName: name, profileCode: code, priceNatural: nat, priceCafe: caf, stripLengthM: 6 } });
  }

  // Ventana de Abatir profiles
  const vabProfiles = [
    ['Pierna', '5007', 11500, 12930],
    ['Centro Puerta', '7659', 9540, 11223],
    ['Junquillo', '5687', 2372, 2790],
    ['Amarre', 'A-O9', 330, 389],
    ['Tubo Rectangular 30x60', '30x60', 17978, 21150],
    ['Angulo 25x12', '25x12', 2958, 3480],
    ['Canal U 20x12', '20x12', 3902, 4590],
  ];
  for (const [name, code, nat, caf] of vabProfiles) {
    await db.profilePrice.create({ data: { productLineId: ventAbatir.id, profileName: name, profileCode: code, priceNatural: nat, priceCafe: caf, stripLengthM: 6 } });
  }

  // Centro Puerta 7095/5034 profiles
  const cp70Profiles = [
    ['Centro Puerta 7095', '7095', 18600, 20090],
    ['Centro Puerta 5034', '5034', 24800, 26090],
    ['Junquillo 10x10', '5009', 3410, 3690],
  ];
  for (const [name, code, nat, caf] of cp70Profiles) {
    await db.profilePrice.create({ data: { productLineId: cp7095.id, profileName: name, profileCode: code, priceNatural: nat, priceCafe: caf, stripLengthM: 6 } });
  }

  // Centro Puerta 30x60/40x80 profiles
  const cp30Profiles = [
    ['Centro Puerta 30x60', '30x60', 17135, 20100],
    ['Centro Puerta 40x80', '40x80', 23040, 27020],
    ['Junquillo 10x10', '5029', 4205, 4950],
  ];
  for (const [name, code, nat, caf] of cp30Profiles) {
    await db.profilePrice.create({ data: { productLineId: cp3060.id, profileName: name, profileCode: code, priceNatural: nat, priceCafe: caf, stripLengthM: 6 } });
  }

  // Puerta Tubo 40x40/40x100 profiles
  const ptProfiles = [
    ['Tubo 40x40', 'C-05', 25590, 27640],
    ['Tubo 40x100', 'R-07', 51820, 55970],
    ['Tubo 40x80', 'R-06', 39640, 42820],
    ['Tubo 30x60', 'R-05', 28420, 30690],
    ['Placa Aluminio', '5869', 21150, 22850],
    ['Angulo 25x12', '5007', 2958, 3480],
    ['Junquillo 10x10', '5009', 3410, 3690],
    ['Amarre', '5066', 42840, 42840],
  ];
  for (const [name, code, nat, caf] of ptProfiles) {
    await db.profilePrice.create({ data: { productLineId: puertaTubo.id, profileName: name, profileCode: code, priceNatural: nat, priceCafe: caf, stripLengthM: 6 } });
  }

  // Fijo Tubular Rectangular profiles
  const ftProfiles = [
    ['Tubo Rectangular 30x60', '30x60', 19971, 25645],
    ['Tubo Rectangular 40x80', '40x80', 25485, 43760],
    ['Junquillo 10x10', '5051', 2819, 3306],
    ['Junquillo 20x12', '5029', 4204, 4931],
    ['Tubo 30x60', 'R-05', 19971, 20093],
    ['Placa Aluminio', '67', 30000, 30000],
  ];
  for (const [name, code, nat, caf] of ftProfiles) {
    await db.profilePrice.create({ data: { productLineId: fijoTub.id, profileName: name, profileCode: code, priceNatural: nat, priceCafe: caf, stripLengthM: 6 } });
  }

  // Fijo con Centro de Puerta profiles
  const fcpProfiles = [
    ['Centro Puerta 7095', '7095', 10473, 11040],
    ['Centro Puerta 5034', '5034', 14382, 16920],
    ['Junquillo 10x10', '5009', 2627, 3090],
    ['Junquillo 20x12', '5098', 3902, 4590],
    ['Tubo 30x60', 'R-05', 17978, 21150],
  ];
  for (const [name, code, nat, caf] of fcpProfiles) {
    await db.profilePrice.create({ data: { productLineId: fijoCP.id, profileName: name, profileCode: code, priceNatural: nat, priceCafe: caf, stripLengthM: 6 } });
  }

  // Celosías profiles
  const celProfiles = [
    ['Marco', '3201', 7752, 9092],
    ['Junquillo', '3203', 3669, 4304],
    ['Pilar Marco', '3204', 13851, 16245],
    ['Tubo Rectangular 30x60', '30x60', 17978, 21150],
    ['Tubo Rectangular 76x25', '76x25', 20273, 23850],
  ];
  for (const [name, code, nat, caf] of celProfiles) {
    await db.profilePrice.create({ data: { productLineId: celosias.id, profileName: name, profileCode: code, priceNatural: nat, priceCafe: caf, stripLengthM: 6 } });
  }

  // Shower Door AM-12 profiles
  const sdProfiles = [
    ['Riel Inferior', '1207', 18110, 19560],
    ['Jamba', '1202', 13270, 14350],
    ['Riel Superior', '1203', 30090, 32500],
    ['Bastidor', '1204', 11130, 12040],
    ['Jamba Esquinera', 'SD04', 26030, 28120],
  ];
  for (const [name, code, nat, caf] of sdProfiles) {
    await db.profilePrice.create({ data: { productLineId: showerDoor.id, profileName: name, profileCode: code, priceNatural: nat, priceCafe: caf, stripLengthM: 6 } });
  }

  // ═══════════════════════════════════════════
  // PRICING RULES
  // ═══════════════════════════════════════════
  for (const l of allLines) {
    await db.pricingRule.create({ data: { productLineId: l.id, name: 'Área mínima de cotización', ruleType: 'minimum_area', value: 0.5, unit: 'm2' } });
    await db.pricingRule.create({ data: { productLineId: l.id, name: 'Ancho máximo', ruleType: 'max_dimension_width', value: 4000, unit: 'mm' } });
    await db.pricingRule.create({ data: { productLineId: l.id, name: 'Alto máximo', ruleType: 'max_dimension_height', value: 3000, unit: 'mm' } });
    await db.pricingRule.create({ data: { productLineId: l.id, name: 'Redondeo a múltiplo de', ruleType: 'rounding_multiple', value: 1000, unit: 'CLP' } });
  }

  console.log('✅ Seed completed successfully!');
  console.log(`  - 6 product types`);
  console.log(`  - 12 product lines with real Crispieri margins`);
  console.log(`  - 6 colors with real surcharges`);
  console.log(`  - 18 glass options`);
  console.log(`  - Glass prices per line (${12}+ line-glass combos)`);
  console.log(`  - 12 accessories with natural/café prices`);
  console.log(`  - Profile prices for all 12 lines`);
  console.log(`  - 48 pricing rules`);
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await db.$disconnect();
    process.exit(1);
  });
