// Public Website Components - Main Export
// Re-export all public-facing components for easy imports

// Layout Components
export { default as PublicLayout } from './layout/PublicLayout';
export { default as PublicHeader } from './layout/PublicHeader';
export { default as PublicFooter } from './layout/PublicFooter';
export { default as FloatingWidgets } from './layout/FloatingWidgets';
export { default as Breadcrumbs } from './layout/Breadcrumbs';

// Tenant Theme
export { default as TenantThemeProvider, useTenantTheme } from './tenant/TenantThemeProvider';
export type {
  TenantPublicSettings,
  TenantColors,
  TenantSupport,
  TenantLocation,
  TenantSEO,
  TenantHomepageConfig,
  PromoBucket,
} from './tenant/TenantThemeProvider';

// Home Page Components
export { default as PublicHomePage } from './home/PublicHomePage';

// Home Page Sections
export { default as PromoBucketsGrid } from './home/sections/PromoBucketsGrid';
export { default as ShopByMake } from './home/sections/ShopByMake';
export { default as ShopByBodyType } from './home/sections/ShopByBodyType';
export { default as RecentlyViewedCars } from './home/sections/RecentlyViewedCars';
export { default as WhyChooseUs } from './home/sections/WhyChooseUs';
export { default as HowToBuySteps } from './home/sections/HowToBuySteps';
export { default as HelpCards } from './home/sections/HelpCards';
export { default as TestimonialsSection } from './home/sections/TestimonialsSection';

// Cards
export { default as CarCard } from './cards/CarCard';

// Hooks
export { useAnalytics } from './hooks/useAnalytics';

// Search Components
export { default as SearchBar } from './SearchBar';

// Legacy Components (for backward compatibility)
export { default as BeForwardHeader } from './BeForwardHeader';
export { default as BeForwardFooter } from './BeForwardFooter';
export { default as BeForwardHomePage } from './BeForwardHomePage';
