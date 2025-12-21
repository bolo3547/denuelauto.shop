import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
(async function(){
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const tenants = await prisma.tenant.findMany();
  const urls: string[] = [];
  for(const t of tenants){
    // home, catalog
    urls.push(`${base}/t/${t.slug}`);
    urls.push(`${base}/t/${t.slug}/public/cars`);
    const cars = await prisma.car.findMany({ where: { tenantId: t.id } });
    for(const c of cars){
      urls.push(`${base}/t/${t.slug}/public/cars/${c.id}`);
      if(c.publishToExport) urls.push(`${base}/t/${t.slug}/public/export/${c.id}`);
    }
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>`;
  const dir = path.join(process.cwd(), 'frontend', 'public');
  if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive:true });
  fs.writeFileSync(path.join(dir, 'sitemap.xml'), sitemap);
  console.log('sitemap generated: ', urls.length); 
  await prisma.$disconnect();
})();
