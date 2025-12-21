import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function generateReceipt(paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error('Payment not found');

  if (!payment.proformaId) throw new Error('Payment does not have a proformaId');
  const proforma = await prisma.proformaInvoice.findUnique({ where: { id: payment.proformaId } });
  if (!proforma) throw new Error('Proforma not found');

  const html = `
  <html>
    <head><meta charset="utf-8" /></head>
    <body>
      <h1>Receipt</h1>
      <p>Payment ID: ${payment.id}</p>
      <p>Proforma ID: ${payment.proformaId}</p>
      <p>Amount: ${payment.amount} ${payment.currency}</p>
      <p>Date: ${payment.createdAt}</p>
    </body>
  </html>
  `;

  const dir = path.join(process.cwd(), 'prints');
  await fs.mkdir(dir, { recursive: true });

  const filePath = path.join(dir, `${payment.id}.html`);
  await fs.writeFile(filePath, html, 'utf8');

  // In production we'd generate a real PDF via a headless browser and upload to S3
  return { url: `/prints/${payment.id}.html`, path: filePath };
}
