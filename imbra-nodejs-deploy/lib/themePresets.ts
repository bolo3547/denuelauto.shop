export interface ThemePreset {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  heroTitle: string;
  heroSubtitle: string;
  brandTone: string;
  customCSS?: string;
  layout?: {
    headerStyle: 'modern' | 'classic' | 'minimal';
    cardStyle: 'rounded' | 'square' | 'shadow';
    buttonStyle: 'rounded' | 'square' | 'pill';
  };
}

export type PaletteKey = 'beforward-style' | 'beforward' | 'sbt' | 'autocom' | 'deep-blue-gold' | 'charcoal-orange' | 'white-navy';

// Legacy palette support for backward compatibility
export const legacyThemePresets: Record<PaletteKey, Record<string, string>> = {
  'beforward-style': {
    mainBgColor: '#0F172A',
    mainTextColor: '#F8FAFC',
    secondaryBgColor: '#0B1220',
    secondaryTextColor: '#CBD5E1',
    cardBgColor: '#0B1220',
    cardBorderColor: '#1F2937',
    primaryAccentColor: '#FFB020',
    secondaryAccentColor: '#14B8A6'
  },
  'beforward': {
    mainBgColor: '#FFFFFF',
    mainTextColor: '#0F172A',
    secondaryBgColor: '#FFFFFF',
    secondaryTextColor: '#0F172A',
    cardBgColor: '#FFFFFF',
    cardBorderColor: '#E6EEF8',
    primaryAccentColor: '#FF7900',
    secondaryAccentColor: '#FFB020'
  },
  'sbt': {
    mainBgColor: '#FFFFFF',
    mainTextColor: '#0F172A',
    secondaryBgColor: '#FFFFFF',
    secondaryTextColor: '#0F172A',
    cardBgColor: '#FFFFFF',
    cardBorderColor: '#E6EEF8',
    primaryAccentColor: '#D62828',
    secondaryAccentColor: '#FFFFFF'
  },
  'autocom': {
    mainBgColor: '#FFFFFF',
    mainTextColor: '#0F172A',
    secondaryBgColor: '#F8FAFC',
    secondaryTextColor: '#334155',
    cardBgColor: '#FFFFFF',
    cardBorderColor: '#E6EEF8',
    primaryAccentColor: '#0A5BCD',
    secondaryAccentColor: '#F3F4F6'
  },
  'deep-blue-gold': {
    mainBgColor: '#F8FAFC',
    mainTextColor: '#0F172A',
    secondaryBgColor: '#EEF2FF',
    secondaryTextColor: '#0F172A',
    cardBgColor: '#FFFFFF',
    cardBorderColor: '#E6EEF8',
    primaryAccentColor: '#0F3D91',
    secondaryAccentColor: '#FFD700'
  },
  'charcoal-orange': {
    mainBgColor: '#0F172A',
    mainTextColor: '#E6E7EB',
    secondaryBgColor: '#111827',
    secondaryTextColor: '#9CA3AF',
    cardBgColor: '#0B1220',
    cardBorderColor: '#1F2937',
    primaryAccentColor: '#F97316',
    secondaryAccentColor: '#FBBF24'
  },
  'white-navy': {
    mainBgColor: '#FFFFFF',
    mainTextColor: '#0F172A',
    secondaryBgColor: '#F8FAFC',
    secondaryTextColor: '#334155',
    cardBgColor: '#FFFFFF',
    cardBorderColor: '#E6EEF8',
    primaryAccentColor: '#1E3A8A',
    secondaryAccentColor: '#0EA5A4'
  },
};

// Enhanced theme presets with full customization
export const themePresets: Record<string, ThemePreset> = {
  beforward: {
    name: 'Professional Blue',
    primaryColor: '#1E40AF',
    secondaryColor: '#64748B',
    accentColor: '#F59E0B',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Poppins, sans-serif',
    heroTitle: 'Premium Japanese Used Cars',
    heroSubtitle: 'Quality vehicles from Japan with guaranteed reliability',
    brandTone: 'Professional',
    layout: {
      headerStyle: 'modern',
      cardStyle: 'rounded',
      buttonStyle: 'rounded'
    },
    customCSS: `
      .hero-section {
        background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%);
      }
      .car-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 25px rgba(30, 64, 175, 0.15);
      }
      .btn-primary {
        background: linear-gradient(45deg, #F59E0B, #F97316);
        border: none;
        color: white;
      }
    `
  },
  
  sbtjapan: {
    name: 'SBT Japan',
    primaryColor: '#DC2626',
    secondaryColor: '#374151',
    accentColor: '#059669',
    backgroundColor: '#F9FAFB',
    textColor: '#111827',
    fontFamily: 'Roboto, sans-serif',
    heroTitle: 'Authentic Japanese Vehicles',
    heroSubtitle: 'Direct from Japan auctions with transparent pricing',
    brandTone: 'Trustworthy',
    layout: {
      headerStyle: 'classic',
      cardStyle: 'shadow',
      buttonStyle: 'square'
    },
    customCSS: `
      .hero-section {
        background: linear-gradient(120deg, #DC2626 0%, #B91C1C 50%, #991B1B 100%);
      }
      .car-card {
        border: 2px solid #E5E7EB;
        transition: all 0.3s ease;
      }
      .car-card:hover {
        border-color: #DC2626;
        box-shadow: 0 8px 24px rgba(220, 38, 38, 0.12);
      }
    `
  },
  
  autocom: {
    name: 'AUTOCOM Japan',
    primaryColor: '#7C3AED',
    secondaryColor: '#6B7280',
    accentColor: '#EF4444',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Poppins, sans-serif',
    heroTitle: 'Luxury Car Collection',
    heroSubtitle: 'Premium automotive experience with worldwide shipping',
    brandTone: 'Luxury',
    layout: {
      headerStyle: 'minimal',
      cardStyle: 'rounded',
      buttonStyle: 'pill'
    },
    customCSS: `
      .hero-section {
        background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 25%, #A78BFA 50%, #C4B5FD 100%);
      }
      .car-card {
        background: linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%);
        border: 1px solid rgba(124, 58, 237, 0.1);
        border-radius: 16px;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .car-card:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 40px rgba(124, 58, 237, 0.15);
      }
    `
  },

  modern: {
    name: 'Modern Dark',
    primaryColor: '#0F172A',
    secondaryColor: '#64748B',
    accentColor: '#06B6D4',
    backgroundColor: '#1E293B',
    textColor: '#F1F5F9',
    fontFamily: 'Inter, sans-serif',
    heroTitle: 'Future of Automotive',
    heroSubtitle: 'Experience the next generation of car buying',
    brandTone: 'Innovative',
    layout: {
      headerStyle: 'modern',
      cardStyle: 'rounded',
      buttonStyle: 'rounded'
    },
    customCSS: `
      .hero-section {
        background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%);
      }
      .car-card {
        background: rgba(51, 65, 85, 0.6);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(6, 182, 212, 0.2);
        border-radius: 12px;
      }
    `
  },

  classic: {
    name: 'Classic Elegant',
    primaryColor: '#92400E',
    secondaryColor: '#78716C',
    accentColor: '#B45309',
    backgroundColor: '#FEF7ED',
    textColor: '#1C1917',
    fontFamily: 'Playfair Display, serif',
    heroTitle: 'Timeless Automotive Excellence',
    heroSubtitle: 'Where tradition meets quality in every vehicle',
    brandTone: 'Elegant',
    layout: {
      headerStyle: 'classic',
      cardStyle: 'square',
      buttonStyle: 'square'
    },
    customCSS: `
      .hero-section {
        background: linear-gradient(135deg, #FEF7ED 0%, #FED7AA 50%, #FDBA74 100%);
      }
      .car-card {
        background: #FFFFFF;
        border: 2px solid #D6D3D1;
        transition: all 0.4s ease;
      }
    `
  }
};

export const fontOptions = [
  { name: 'Inter', value: 'Inter, sans-serif', category: 'Sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif', category: 'Sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif', category: 'Sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif', category: 'Sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif', category: 'Sans-serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif', category: 'Serif' },
  { name: 'Merriweather', value: 'Merriweather, serif', category: 'Serif' }
];

export const brandToneOptions = [
  { name: 'Professional', value: 'Professional', description: 'Clean, trustworthy, business-focused' },
  { name: 'Luxury', value: 'Luxury', description: 'Premium, sophisticated, high-end' },
  { name: 'Friendly', value: 'Friendly', description: 'Approachable, warm, community-focused' },
  { name: 'Innovative', value: 'Innovative', description: 'Modern, tech-forward, cutting-edge' },
  { name: 'Trustworthy', value: 'Trustworthy', description: 'Reliable, honest, transparent' },
  { name: 'Elegant', value: 'Elegant', description: 'Refined, classic, timeless' }
];

export function applyTheme(theme: any) {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  // Apply CSS custom properties
  root.style.setProperty('--color-primary', theme.primaryColor);
  root.style.setProperty('--color-secondary', theme.secondaryColor);
  root.style.setProperty('--color-accent', theme.accentColor);
  root.style.setProperty('--color-background', theme.backgroundColor);
  root.style.setProperty('--color-text', theme.textColor);
  root.style.setProperty('--font-family', theme.fontFamily);
  
  // Apply custom CSS if provided
  if (theme.customCSS) {
    let styleElement = document.getElementById('custom-theme-css');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'custom-theme-css';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = theme.customCSS;
  }
}

export function removeTheme() {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  const customStyles = document.getElementById('custom-theme-css');
  
  // Remove CSS custom properties
  root.style.removeProperty('--color-primary');
  root.style.removeProperty('--color-secondary');
  root.style.removeProperty('--color-accent');
  root.style.removeProperty('--color-background');
  root.style.removeProperty('--color-text');
  root.style.removeProperty('--font-family');
  
  // Remove custom CSS
  if (customStyles) {
    customStyles.remove();
  }
}
