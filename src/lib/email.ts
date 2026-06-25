import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = 'cotizaciones@crispieri.cl';
const COMPANY_EMAIL = 'contacto@crispieri.cl';

function formatCurrency(amount: number): string {
  return '$' + Math.round(amount).toLocaleString('es-CL');
}

function buildClientEmailHtml(quote: {
  quoteNumber: string;
  clientName: string | null;
  totalSubtotal: number;
  totalTax: number;
  totalAmount: number;
  items: {
    quantity: number;
    productType: { name: string };
    productLine: { name: string };
    widthMm: number;
    heightMm: number;
    panelCount: number;
    color?: { name: string } | null;
    glassOption: { name: string };
    total: number;
    observations?: string | null;
  }[];
}): string {
  const rows = quote.items.map(
    (item) => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border:1px solid #ddd">${item.productType.name}</td>
        <td style="padding:8px;border:1px solid #ddd">${item.productLine.name}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${(item.widthMm / 1000).toFixed(2)} × ${(item.heightMm / 1000).toFixed(2)}m</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.panelCount}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.color?.name || 'Natural'}</td>
        <td style="padding:8px;border:1px solid #ddd">${item.glassOption.name}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:right">${formatCurrency(item.total)}</td>
      </tr>`
  ).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f5f5f5">
  <div style="max-width:700px;margin:auto;padding:20px">
    <div style="background:#0D5C63;color:#fff;padding:24px;border-radius:12px 12px 0 0;text-align:center">
      <h1 style="margin:0;font-size:22px">Crispieri — Cotización</h1>
      <p style="margin:6px 0 0;opacity:0.85">N° ${quote.quoteNumber}</p>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px">
      <p style="color:#333">Estimado/a ${quote.clientName || 'cliente'},</p>
      <p style="color:#555">Gracias por solicitar su cotización. Adjuntamos el detalle de los productos solicitados.</p>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px">
        <thead>
          <tr style="background:#f0f0f0">
            <th style="padding:8px;border:1px solid #ddd;text-align:center">Cant</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left">Tipo</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left">Línea</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:center">Dimensión</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:center">Hojas</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:center">Color</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:left">Vidrio</th>
            <th style="padding:8px;border:1px solid #ddd;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>

      <div style="border-top:2px solid #0D5C63;padding-top:12px;margin-top:12px;text-align:right;font-size:14px">
        <p><strong>Subtotal neto:</strong> ${formatCurrency(quote.totalSubtotal)}</p>
        <p><strong>IVA (19%):</strong> ${formatCurrency(quote.totalTax)}</p>
        <p style="font-size:18px;color:#0D5C63"><strong>Total estimado:</strong> ${formatCurrency(quote.totalAmount)}</p>
      </div>

      <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
      <p style="font-size:12px;color:#999;text-align:center">
        Crispieri — Ventanas y Puertas de Aluminio<br>
        Contacto: ${COMPANY_EMAIL}
      </p>
    </div>
  </div>
</body>
</html>`;
}

function buildCompanyEmailHtml(quote: {
  quoteNumber: string;
  clientName: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  totalAmount: number;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;margin:0;padding:0;background:#f5f5f5">
  <div style="max-width:600px;margin:auto;padding:20px">
    <div style="background:#0D5C63;color:#fff;padding:20px;border-radius:12px 12px 0 0;text-align:center">
      <h2 style="margin:0;font-size:20px">📋 Nueva Cotización Generada</h2>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px">
      <p><strong>N° Cotización:</strong> ${quote.quoteNumber}</p>
      <p><strong>Cliente:</strong> ${quote.clientName || 'Sin nombre'}</p>
      <p><strong>Teléfono:</strong> ${quote.clientPhone ? '+569 ' + quote.clientPhone : 'No registrado'}</p>
      <p><strong>Email:</strong> ${quote.clientEmail || 'No registrado'}</p>
      <p><strong>Total estimado:</strong> ${formatCurrency(quote.totalAmount)}</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendQuoteEmails(quote: {
  id: string;
  quoteNumber: string;
  clientName: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  totalSubtotal: number;
  totalTax: number;
  totalAmount: number;
  items: {
    quantity: number;
    productType: { name: string };
    productLine: { name: string };
    widthMm: number;
    heightMm: number;
    panelCount: number;
    color?: { name: string } | null;
    glassOption: { name: string };
    total: number;
    observations?: string | null;
  }[];
}) {
  if (!resend) return;

  const promises: Promise<unknown>[] = [];

  // Send to company
  promises.push(
    resend.emails.send({
      from: FROM_EMAIL,
      to: COMPANY_EMAIL,
      subject: `Nueva cotización ${quote.quoteNumber} — ${quote.clientName || 'Sin nombre'}`,
      html: buildCompanyEmailHtml(quote),
    })
  );

  // Send to client if they have an email
  if (quote.clientEmail) {
    promises.push(
      resend.emails.send({
        from: FROM_EMAIL,
        to: quote.clientEmail,
        subject: `Tu cotización Crispieri — N° ${quote.quoteNumber}`,
        html: buildClientEmailHtml(quote),
      })
    );
  }

  await Promise.allSettled(promises);
}
