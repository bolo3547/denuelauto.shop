import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import dns from 'dns';

const prisma = new PrismaClient();

export function generateDnsTxt(hostname: string) {
  return `denuel-ver-${crypto.randomBytes(6).toString('hex')}`;
}

export async function requestCertForHostname(hostname: string) {
  // Mock ACME: pretend cert request succeeded and return certMeta
  const certMeta = { issuedAt: new Date(), issuer: "letsencrypt", certId: `CRT-${crypto.randomBytes(6).toString('hex')}` };
  return certMeta;
}

export async function verifyDomainDnsTxt(hostname: string, expected: string) {
  return new Promise<boolean>((resolve) => {
    dns.resolveTxt(hostname, (err, records) => {
      if (err) return resolve(false);
      const flat: string[] = ([] as string[]).concat.apply([], records);
      resolve(flat.includes(expected));
    });
  });
}

export default { generateDnsTxt, requestCertForHostname, verifyDomainDnsTxt };
