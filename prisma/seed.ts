import { db } from '../src/lib/db';

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Product Types ───
  const sliding = await db.productType.create({ data: { name: 'Ventana Corredera', code: 'corredera', description: 'Ventana corredera de aluminio', icon: 'sliding', sortOrder: 1 } });
  const hinged = await db.productType.create({ data: { name: 'Ventana Abatible', code: 'abatible', description: 'Ventana abatible de aluminio', icon: 'hinged', sortOrder: 2 } });
  const door = await db.productType.create({ data: { name: 'Puerta', code: 'puerta', description: 'Puerta de aluminio', icon: 'door', sortOrder: 3 } });
  const fixed = await db.productType.create({ data: { name: 'Fijo', code: 'fijo', description: 'Panel fijo de aluminio', icon: 'fixed', sortOrder: 4 } });

  // ─── Product Lines ───
  const line45 = await db.productLine.create({ data: { name: 'Línea 45 Estándar', code: 'linea-45', description: 'Línea económica para proyectos residenciales', pricePerM2: 185000, sortOrder: 1 } });
  const line70 = await db.productLine.create({ data: { name: 'Línea 7000 Premium', code: 'linea-7000', description: 'Línea premium con mayor aislación', pricePerM2: 245000, sortOrder: 2 } });
  const lineR90 = await db.productLine.create({ data: { name: 'Rotoplast R90', code: 'rotoplast-r90', description: 'Línea de alta prestación térmica y acústica', pricePerM2: 320000, sortOrder: 3 } });

  // ─── Product Type ↔ Line associations ───
  const allTypes = [sliding, hinged, door, fixed];
  const allLines = [line45, line70, lineR90];

  for (const pt of allTypes) {
    for (const pl of allLines) {
      await db.productTypeLine.create({ data: { productTypeId: pt.id, productLineId: pl.id } });
    }
  }

  // ─── Colors ───
  const blanco = await db.color.create({ data: { name: 'Blanco', code: 'blanco', hexValue: '#FFFFFF', surchargePct: 0, sortOrder: 1 } });
  const negro = await db.color.create({ data: { name: 'Negro', code: 'negro', hexValue: '#1A1A1A', surchargePct: 15, sortOrder: 2 } });
  const grisGrafito = await db.color.create({ data: { name: 'Gris Grafito', code: 'gris-grafito', hexValue: '#4A4A4A', surchargePct: 12, sortOrder: 3 } });
  const anodizado = await db.color.create({ data: { name: 'Anodizado Natural', code: 'anodizado-natural', hexValue: '#C0A060', surchargePct: 18, sortOrder: 4 } });
  const champagne = await db.color.create({ data: { name: 'Champagne', code: 'champagne', hexValue: '#C4A35A', surchargePct: 14, sortOrder: 5 } });
  const maderaNogal = await db.color.create({ data: { name: 'Madera Nogal', code: 'madera-nogal', hexValue: '#5C3317', surchargePct: 22, sortOrder: 6 } });
  const ral = await db.color.create({ data: { name: 'Personalizado RAL', code: 'ral-personalizado', hexValue: '#888888', surchargePct: 25, isRAL: true, sortOrder: 7 } });

  const allColors = [blanco, negro, grisGrafito, anodizado, champagne, maderaNogal, ral];

  // Associate colors with all lines
  for (const pl of allLines) {
    for (const c of allColors) {
      await db.productLineColor.create({ data: { productLineId: pl.id, colorId: c.id } });
    }
  }

  // ─── Glass Options ───
  const simple = await db.glassOption.create({ data: { name: 'Simple', code: 'simple', description: 'Vidrio simple 4mm', surchargePct: 0, sortOrder: 1 } });
  const termopanel = await db.glassOption.create({ data: { name: 'Termopanel', code: 'termopanel', description: 'Doble vidriado con cámara de aire 4+6+4mm', surchargePct: 35, sortOrder: 2 } });
  const lowE = await db.glassOption.create({ data: { name: 'Low-E', code: 'low-e', description: 'Vidrio de baja emisividad con cámara', surchargePct: 55, sortOrder: 3 } });
  const laminado = await db.glassOption.create({ data: { name: 'Laminado', code: 'laminado', description: 'Vidrio laminado de seguridad 3+3mm', surchargePct: 28, sortOrder: 4 } });

  // ─── Accessories ───
  const manilla = await db.accessory.create({ data: { name: 'Manilla premium', code: 'manilla-premium', description: 'Manilla premium de aluminio', price: 18500, unit: 'unidad', sortOrder: 1 } });
  const cierre = await db.accessory.create({ data: { name: 'Cierre de seguridad', code: 'cierre-seguridad', description: 'Cierre multipunto con llave', price: 32000, unit: 'unidad', sortOrder: 2 } });
  const mosquitero = await db.accessory.create({ data: { name: 'Mosquitero', code: 'mosquitero', description: 'Malla mosquitera retráctil', price: 25000, unit: 'unidad', sortOrder: 3 } });
  const barrotillos = await db.accessory.create({ data: { name: 'Barrotillos', code: 'barrotillos', description: 'Barrotillos de seguridad', price: 12000, unit: 'par', sortOrder: 4 } });

  const allAccessories = [manilla, cierre, mosquitero, barrotillos];

  // Associate accessories with all lines
  for (const pl of allLines) {
    for (const a of allAccessories) {
      await db.productLineAccessory.create({ data: { productLineId: pl.id, accessoryId: a.id } });
    }
  }

  // ─── Materials ───
  await db.material.create({ data: { name: 'Aluminio', code: 'aluminio', description: 'Perfil de aluminio extruido' } });
  await db.material.create({ data: { name: 'PVC', code: 'pvc', description: 'Perfil de PVC reforzado' } });

  // ─── Hardware Items ───
  await db.hardwareItem.create({ data: { name: 'Rueda corredera', code: 'rueda-corredera', description: 'Rueda para ventana corredera', price: 8500, unit: 'par' } });
  await db.hardwareItem.create({ data: { name: 'Bisagra abatible', code: 'bisagra-abatible', description: 'Bisagra para ventana abatible', price: 6500, unit: 'par' } });
  await db.hardwareItem.create({ data: { name: 'Cerradura puerta', code: 'cerradura-puerta', description: 'Cerradura embutida para puerta', price: 28000, unit: 'unidad' } });
  await db.hardwareItem.create({ data: { name: 'Juego escuadras', code: 'juego-escuadras', description: 'Escuadras de fijación', price: 4500, unit: 'juego' } });

  // ─── Pricing Rules ───
  // Panel surcharges per line
  for (const pl of allLines) {
    await db.pricingRule.create({ data: { productLineId: pl.id, name: 'Recargo por hoja adicional', ruleType: 'surcharge_per_panel', value: 8, unit: 'percentage', minPanels: 2, maxPanels: 4 } });
    await db.pricingRule.create({ data: { productLineId: pl.id, name: 'Área mínima de cotización', ruleType: 'minimum_area', value: 0.5, unit: 'm2' } });
    await db.pricingRule.create({ data: { productLineId: pl.id, name: 'Ancho máximo', ruleType: 'max_dimension_width', value: 4000, unit: 'mm' } });
    await db.pricingRule.create({ data: { productLineId: pl.id, name: 'Alto máximo', ruleType: 'max_dimension_height', value: 3000, unit: 'mm' } });
  }

  console.log('✅ Seed completed successfully!');
  console.log(`  - ${allTypes.length} product types`);
  console.log(`  - ${allLines.length} product lines`);
  console.log(`  - ${allColors.length} colors`);
  console.log(`  - 4 glass options`);
  console.log(`  - ${allAccessories.length} accessories`);
  console.log(`  - 2 materials`);
  console.log(`  - 4 hardware items`);
  console.log(`  - ${allLines.length * 4} pricing rules`);
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
