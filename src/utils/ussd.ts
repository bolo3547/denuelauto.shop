import { UssdSession } from '@prisma/client';

export function maskMsisdn(msisdn: string) {
  if (!msisdn) return '';
  return msisdn.replace(/(\+?\d{3})(\d+)(\d{3})/, (s, p1, p2, p3) => `${p1}****${p3}`);
}

export function buildMenu(lines: string[], page = 1, perPage = 6) {
  // Concatenate lines into a CON payload, ensure <=160 chars per page
  const start = (page - 1) * perPage;
  const pageLines = lines.slice(start, start + perPage);
  const text = pageLines.join('\n');
  return `CON ${text}`;
}

export function endMessage(message: string) {
  return `END ${message}`;
}

export function parseTouchInput(text: string) {
  // Africa's Talking sends joined choices like '1*2*1000'; input is the last segment
  if (!text) return '';
  const parts = text.split('*');
  return parts[parts.length - 1].trim();
}
