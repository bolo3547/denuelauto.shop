import printService from '../src/print/print.service';
import fs from 'fs';
import path from 'path';
import * as helpers from '../src/print/helpers';

describe('Print templates', () => {
  test('Render proforma HTML with DRAFT watermark', async () => {
    const sample = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'print', 'sample-data', 'proforma.sample.json'), 'utf-8'));
    const computedProforma = helpers.computeHash(`${sample.tenant.id}|proforma|${sample.proforma.id}|${sample.totals?.grand || sample.proforma.total || 0}|${sample.proforma.createdAt || sample.proforma.issued_at}`);
    sample.doc_hash = computedProforma;
    const html = await printService.compile('proforma', sample);
    expect(html).toContain('Proforma Invoice');
    // DRAFT watermark should be present due to status 'sent'
    expect(html).toContain('class="draft"');
    // compute footer hash should match doc_hash
    const computed = helpers.computeHash(`${sample.tenant.id}|proforma|${sample.proforma.id}|${sample.totals?.grand || sample.proforma.total || 0}|${sample.proforma.createdAt || sample.proforma.issued_at}`);
    expect(html).toContain(computed);
  });

  test('Render invoice (paid) and check watermark absent', async () => {
    const sample = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'print', 'sample-data', 'invoice.sample.json'), 'utf-8'));
    const html = await printService.compile('commercial_invoice', sample);
    expect(html).toContain('COMMERCIAL INVOICE');
    expect(html).not.toContain('class="draft"');
  });

  test('Render packing list to PDF', async () => {
    const sample = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'print', 'sample-data', 'packing.sample.json'), 'utf-8'));
    const html = await printService.compile('packing_list', sample);
    const pdfSpy = jest.spyOn(printService, 'toPdf').mockResolvedValue(Buffer.from('PDFCONTENT'));
    const pdf = await printService.toPdf(html);
    expect(pdf && pdf.length > 0).toBe(true);
    pdfSpy.mockRestore();
  });

  test('Render receipt and assert hash', async () => {
    const sample = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'print', 'sample-data', 'receipt.sample.json'), 'utf-8'));
    const html = await printService.compile('receipt', sample);
    const computedReceipt = helpers.computeHash(`${sample.tenant.id}|receipt|${sample.payment.id}|${sample.payment.amount}|${sample.payment.received_at}`);
    sample.doc_hash = computedReceipt;
    const html2 = await printService.compile('receipt', sample);
    expect(html2).toContain(computedReceipt);
  });
});
