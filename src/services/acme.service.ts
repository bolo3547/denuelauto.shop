import { createAcmeClient } from 'acme-client';
import { promises as fs } from 'fs';

const directoryUrl = process.env.ACME_DIRECTORY_URL || 'https://acme-v02.api.letsencrypt.org/directory';
const accountKeyPath = process.env.ACME_ACCOUNT_KEY_PATH || './keys/account.pem';
const certsDir = process.env.ACME_CERTS_DIR || './certs';

const acmeClient = createAcmeClient({
  directoryUrl,
  accountKey: async () => {
    try {
      return await fs.readFile(accountKeyPath, 'utf8');
    } catch {
      throw new Error('ACME account key not found. Please generate one.');
    }
  },
});

export const requestCertificate = async (domain: string, dnsChallenge: string) => {
  try {
    const [key, csr] = await acmeClient.createCsr({
      commonName: domain,
    });

    const certificate = await acmeClient.requestCertificate({
      csr,
      challenges: [{
        type: 'dns-01',
        token: dnsChallenge,
      }],
    });

    await fs.writeFile(`${certsDir}/${domain}.crt`, certificate);
    await fs.writeFile(`${certsDir}/${domain}.key`, key);

    return { certificate, key };
  } catch (error) {
    console.error('ACME certificate request failed:', error);
    throw error;
  }
};