import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import * as helpers from './helpers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PrintService {
  templatesPath = path.join(process.cwd(), 'src', 'print', 'templates');
  cssPath = path.join(this.templatesPath, 'print.css');

  async loadTemplate(name: string) {
    const tplPath = path.join(this.templatesPath, `${name}.hbs`);
    if (!fs.existsSync(tplPath)) throw new Error('Template not found');
    return fs.readFileSync(tplPath, 'utf-8');
  }

  registerHelpers() {
    Handlebars.registerHelper('formatMoney', helpers.formatMoney as any);
    Handlebars.registerHelper('dateFmt', helpers.dateFmt as any);
    Handlebars.registerHelper('upper', helpers.upper as any);
    Handlebars.registerHelper('lower', helpers.lower as any);
    Handlebars.registerHelper('percent', helpers.percent as any);
    Handlebars.registerHelper('eq', helpers.eq as any);
    Handlebars.registerHelper('neq', helpers.neq as any);
    Handlebars.registerHelper('sum', helpers.sum as any);
    Handlebars.registerHelper('mul', helpers.mul as any);
    Handlebars.registerHelper('json', helpers.json as any);
    Handlebars.registerHelper('ifPaid', helpers.ifPaid as any);
    Handlebars.registerHelper('qrcode', (ctx: string) => {
      return '';
    });
    Handlebars.registerHelper('cifBreakdown', (fob: any, freight: any, insuranceRatePct: any, other: any) => {
      return helpers.cifBreakdown(Number(fob), Number(freight), Number(insuranceRatePct), Number(other)).rows;
    });
  }

  async compile(templateName: string, data: any, css?: string) {
    const raw = await this.loadTemplate(templateName);
    const tpl = Handlebars.compile(raw);
    this.registerHelpers();
    let cssToUse = css || fs.readFileSync(this.cssPath, 'utf-8');
    if (data?.tenant?.theme) {
      const primary = data.tenant.theme?.primary || data.tenant.theme?.primaryColor || '#0F3D91';
      const accent = data.tenant.theme?.accent || '#F4C430';
      cssToUse = cssToUse.replace(':root{', `:root{--blue:${primary};--gold:${accent};`);
    }
    if (data.pay_qr_payload) data.qr_image = await helpers.qrcode(data.pay_qr_payload);
    return tpl({ ...data, css: cssToUse });
  }

  async toPdf(html: string) {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();
    return pdf;
  }

  computeFooterHash(tenantId: string, docType: string, docId: string, total: number, issuedAt: string) {
    const str = `${tenantId}|${docType}|${docId}|${total}|${issuedAt}`;
    return helpers.computeHash(str);
  }

  async mapData(template: string, id: string) {
    switch (template) {
      case 'proforma': {
        const pf = await prisma.proformaInvoice.findUnique({ where: { id }, include: { car: true, buyer: true, agent: true } });
        if (!pf) throw new Error('Proforma not found');
        const tenant = await prisma.tenant.findUnique({ where: { id: pf.tenantId } });
        const port = await prisma.exportPort.findFirst({ where: { tenantId: pf.tenantId } });
        let pricing: any = { fob: 0, freight: 0, insurance: 0, other: [], cif: false };
        const items = (pf as any).lineItemsJson?.items || [];
        let grand = 0;
        for (const it of items) {
          if (it.name && it.amount) grand += Number(it.amount);
        }
        pricing.fob = grand;
        const totals: any = { grand };
        const payQrPayload = `${(pf as any).number}|${(pf as any).currency}|${totals.grand}`;
        const docHash = this.computeFooterHash(tenant!.id, 'proforma', pf.id, Number((pf as any).total), pf.createdAt.toISOString());
        const qr = await helpers.qrcode(payQrPayload);
        return {
          tenant,
          proforma: pf,
          car: (pf as any).car,
          buyer: (pf as any).buyer,
          agent: (pf as any).agent,
          pricing,
          totals,
          pay_qr_payload: payQrPayload,
          doc_hash: docHash,
          qr_image: qr,
          port: port || {},
        } as any;
      }
      case 'commercial_invoice': {
        const inv = await prisma.proformaInvoice.findUnique({ where: { id }, include: { car: true, buyer: true, agent: true } });
        if (!inv) throw new Error('Invoice (proforma) not found');
        const tenant = await prisma.tenant.findUnique({ where: { id: inv.tenantId } });
        const docHash = this.computeFooterHash(tenant!.id, 'commercial_invoice', inv.id, Number((inv as any).total), inv.createdAt.toISOString());
        return { tenant, invoice: inv, car: (inv as any).car, buyer: (inv as any).buyer, agent: (inv as any).agent, doc_hash: docHash };
      }
      case 'packing_list': {
        const sh = await prisma.shipment.findUnique({ where: { id }, include: { car: true, buyer: true } });
        if (!sh) throw new Error('Shipment not found');
        const tenant = await prisma.tenant.findUnique({ where: { id: sh.tenantId } });
        const docHash = this.computeFooterHash(tenant!.id, 'packing_list', sh.id, 0, sh.createdAt.toISOString());
        return { tenant, shipment: sh, car: (sh as any).car, buyer: (sh as any).buyer, doc_hash: docHash, now: new Date().toISOString() };
      }
      case 'receipt': {
        const p = await prisma.payment.findUnique({ where: { id }, include: { buyer: true } });
        if (!p) throw new Error('Payment not found');
        const tenant = await prisma.tenant.findUnique({ where: { id: p.tenantId } });
        const docHash = this.computeFooterHash(tenant!.id, 'receipt', p.id, Number((p as any).amount), p.receivedAt?.toISOString() || p.createdAt.toISOString());
        return { tenant, payment: p, payer: (p as any).buyer || {}, doc_hash: docHash };
      }
      case 'commission_statement': {
        const stmt = await prisma.commissionStatement.findUnique({ where: { id }, include: { agent: true } });
        if (!stmt) throw new Error('Statement not found');
        const tenant = await prisma.tenant.findUnique({ where: { id: stmt.tenantId } });
        // Fetch locked deals for the statement month (using lockedAt range)
        const month = stmt.month; // YYYY-MM
        const start = new Date(month + '-01');
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        const deals = await prisma.agentDeal.findMany({ where: { tenantId: stmt.tenantId, agentId: stmt.agentId, locked: true, lockedAt: { gte: start, lt: end } }, include: { car: true } as any });
        const lines = deals.map((d) => ({ locked_at: d.lockedAt, stock_no: (d as any).car?.stockNo, make: (d as any).car?.make, model: (d as any).car?.model, year: (d as any).car?.year, stage: d.stage, base_usd: Number(d.commissionAmount || 0) / (Number(d.commissionPercent) || 1) * 100 || 0, rate_pct: Number(d.commissionPercent), commission_usd: Number(d.commissionAmount || 0) }));
        const docHash = this.computeFooterHash(tenant!.id, 'commission_statement', stmt.id, Number(stmt.totalAmountUsd), stmt.createdAt.toISOString());
        return { tenant, agent: (stmt as any).agent, statement: stmt, lines, doc_hash: docHash } as any;
      }
      default:
        throw new Error('unsupported template');
    }
  }
}

export default new PrintService();
