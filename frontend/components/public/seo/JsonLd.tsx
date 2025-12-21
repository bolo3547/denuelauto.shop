import React from 'react';

// Types for structured data
export interface OrganizationSchema {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry: string;
  };
  sameAs?: string[]; // Social media links
}

export interface VehicleSchema {
  stockNo: string;
  name: string;
  description?: string;
  brand: string;
  model: string;
  vehicleModelDate: number; // Year
  mileageFromOdometer: {
    value: number;
    unitCode: 'KMT' | 'SMI';
  };
  vehicleTransmission: string;
  fuelType: string;
  color?: string;
  vehicleEngine?: {
    engineDisplacement?: string;
    fuelType?: string;
  };
  driveWheelConfiguration?: string;
  numberOfDoors?: number;
  vehicleSeatingCapacity?: number;
  vehicleInteriorColor?: string;
  offers: {
    price: number;
    priceCurrency: string;
    availability: 'InStock' | 'OutOfStock' | 'PreOrder';
    seller: {
      name: string;
      url?: string;
    };
    url: string;
  };
  image?: string[];
  url: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface LocalBusinessSchema {
  name: string;
  description?: string;
  url: string;
  phone?: string;
  email?: string;
  priceRange?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  image?: string;
}

// Organization Schema Component
export function OrganizationJsonLd({ org }: { org: OrganizationSchema }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: org.name,
    url: org.url,
    ...(org.logo && { logo: org.logo }),
    ...(org.description && { description: org.description }),
    ...(org.phone && { telephone: org.phone }),
    ...(org.email && { email: org.email }),
    ...(org.address && {
      address: {
        '@type': 'PostalAddress',
        ...org.address,
      },
    }),
    ...(org.sameAs && { sameAs: org.sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Vehicle/Product Schema Component
export function VehicleJsonLd({ vehicle }: { vehicle: VehicleSchema }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: vehicle.name,
    ...(vehicle.description && { description: vehicle.description }),
    brand: {
      '@type': 'Brand',
      name: vehicle.brand,
    },
    model: vehicle.model,
    vehicleModelDate: vehicle.vehicleModelDate,
    mileageFromOdometer: {
      '@type': 'QuantitativeValue',
      value: vehicle.mileageFromOdometer.value,
      unitCode: vehicle.mileageFromOdometer.unitCode,
    },
    vehicleTransmission: vehicle.vehicleTransmission,
    fuelType: vehicle.fuelType,
    ...(vehicle.color && { color: vehicle.color }),
    ...(vehicle.vehicleEngine && {
      vehicleEngine: {
        '@type': 'EngineSpecification',
        ...vehicle.vehicleEngine,
      },
    }),
    ...(vehicle.driveWheelConfiguration && {
      driveWheelConfiguration: vehicle.driveWheelConfiguration,
    }),
    ...(vehicle.numberOfDoors && { numberOfDoors: vehicle.numberOfDoors }),
    ...(vehicle.vehicleSeatingCapacity && {
      vehicleSeatingCapacity: vehicle.vehicleSeatingCapacity,
    }),
    ...(vehicle.vehicleInteriorColor && {
      vehicleInteriorColor: vehicle.vehicleInteriorColor,
    }),
    offers: {
      '@type': 'Offer',
      price: vehicle.offers.price,
      priceCurrency: vehicle.offers.priceCurrency,
      availability: `https://schema.org/${vehicle.offers.availability}`,
      seller: {
        '@type': 'AutoDealer',
        name: vehicle.offers.seller.name,
        ...(vehicle.offers.seller.url && { url: vehicle.offers.seller.url }),
      },
      url: vehicle.offers.url,
    },
    ...(vehicle.image && { image: vehicle.image }),
    url: vehicle.url,
    sku: vehicle.stockNo,
    identifier: vehicle.stockNo,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb Schema Component
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ Schema Component
export function FAQJsonLd({ faqs }: { faqs: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Local Business Schema Component
export function LocalBusinessJsonLd({ business }: { business: LocalBusinessSchema }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: business.name,
    ...(business.description && { description: business.description }),
    url: business.url,
    ...(business.phone && { telephone: business.phone }),
    ...(business.email && { email: business.email }),
    ...(business.priceRange && { priceRange: business.priceRange }),
    address: {
      '@type': 'PostalAddress',
      ...business.address,
    },
    ...(business.geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: business.geo.latitude,
        longitude: business.geo.longitude,
      },
    }),
    ...(business.openingHours && { openingHoursSpecification: business.openingHours }),
    ...(business.image && { image: business.image }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Search Action Schema (for sitelinks search box)
export function WebsiteSearchJsonLd({ 
  name, 
  url, 
  searchUrl 
}: { 
  name: string; 
  url: string; 
  searchUrl: string; 
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: searchUrl,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Item List Schema (for search results / category pages)
export function ItemListJsonLd({ 
  items, 
  name 
}: { 
  items: Array<{ url: string; name: string; position?: number }>; 
  name?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    ...(name && { name }),
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: item.position || index + 1,
      url: item.url,
      name: item.name,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Combined export for convenience
export const JsonLd = {
  Organization: OrganizationJsonLd,
  Vehicle: VehicleJsonLd,
  Breadcrumb: BreadcrumbJsonLd,
  FAQ: FAQJsonLd,
  LocalBusiness: LocalBusinessJsonLd,
  WebsiteSearch: WebsiteSearchJsonLd,
  ItemList: ItemListJsonLd,
};

export default JsonLd;
