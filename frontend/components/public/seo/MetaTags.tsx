
interface MetaTagsProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  siteName?: string;
  type?: 'website' | 'article' | 'product';
  locale?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterSite?: string;
  noIndex?: boolean;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

// Generate meta tags for SEO (use in Next.js metadata export)
export function generateMetaTags({
  title,
  description,
  url,
  image,
  siteName,
  type = 'website',
  locale = 'en_US',
  twitterCard = 'summary_large_image',
  twitterSite,
  noIndex = false,
  keywords,
  author,
  publishedTime,
  modifiedTime,
}: MetaTagsProps) {
  const metadata: Record<string, any> = {
    title,
    description,
    ...(keywords && { keywords: keywords.join(', ') }),
    ...(author && { author }),
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    openGraph: {
      title,
      description,
      url,
      siteName,
      type,
      locale,
      ...(image && {
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      }),
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      ...(image && { images: [image] }),
      ...(twitterSite && { site: twitterSite }),
    },
    alternates: {
      canonical: url,
    },
  };

  return metadata;
}

// Vehicle-specific meta tags
export function generateVehicleMetaTags({
  make,
  model,
  year,
  price,
  currency,
  stockNo,
  mileage,
  tenantName,
  url,
  image,
  description,
}: {
  make: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  stockNo: string;
  mileage: string;
  tenantName: string;
  url: string;
  image?: string;
  description?: string;
}) {
  const title = `${year} ${make} ${model} for Sale | ${tenantName}`;
  const desc = description || 
    `Buy this ${year} ${make} ${model} with ${mileage} for ${currency} ${price.toLocaleString()}. Stock #${stockNo}. Quality used cars from ${tenantName}.`;

  return generateMetaTags({
    title,
    description: desc,
    url,
    image,
    siteName: tenantName,
    type: 'product',
    keywords: [
      make,
      model,
      `${year} ${make}`,
      `${make} ${model}`,
      `used ${make}`,
      `buy ${make}`,
      'used cars',
      'car dealer',
      stockNo,
    ],
  });
}

// Search/listing page meta tags
export function generateListingMetaTags({
  tenantName,
  url,
  filters,
  totalCount,
  image,
}: {
  tenantName: string;
  url: string;
  filters: Record<string, string | undefined>;
  totalCount: number;
  image?: string;
}) {
  const filterParts: string[] = [];
  
  if (filters.make) filterParts.push(filters.make);
  if (filters.model) filterParts.push(filters.model);
  if (filters.bodyType) filterParts.push(filters.bodyType);
  if (filters.minYear && filters.maxYear) {
    filterParts.push(`${filters.minYear}-${filters.maxYear}`);
  } else if (filters.minYear) {
    filterParts.push(`${filters.minYear}+`);
  }

  const filterString = filterParts.length > 0 ? filterParts.join(' ') + ' ' : '';
  const title = `${filterString}Used Cars for Sale | ${tenantName}`;
  const description = `Browse ${totalCount.toLocaleString()} ${filterString.toLowerCase()}used cars available at ${tenantName}. Quality vehicles with competitive prices and worldwide shipping.`;

  return generateMetaTags({
    title,
    description,
    url,
    image,
    siteName: tenantName,
    type: 'website',
    keywords: [
      'used cars',
      'cars for sale',
      'buy car',
      'auto dealer',
      ...(filters.make ? [filters.make, `${filters.make} for sale`] : []),
      ...(filters.model ? [filters.model] : []),
      ...(filters.bodyType ? [filters.bodyType, `used ${filters.bodyType}`] : []),
    ],
  });
}

// Export for use in Next.js metadata
export default {
  generateMetaTags,
  generateVehicleMetaTags,
  generateListingMetaTags,
};
