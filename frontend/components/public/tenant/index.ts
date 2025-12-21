// Barrel export for tenant theme utilities
export {
  default as TenantThemeProvider,
  useTenantTheme,
  useTenantColors,
  useTenantSupport,
  useTenantSEO,
  DEFAULT_BEFORWARD_COLORS,
  DEFAULT_TENANT_SETTINGS,
  THEME_PRESETS,
} from './TenantThemeProvider';

export type {
  TenantColors,
  TenantSupport,
  TenantLocation,
  TenantSEO,
  TenantHomepageConfig,
  PromoBucket,
  TenantPublicSettings,
} from './TenantThemeProvider';
