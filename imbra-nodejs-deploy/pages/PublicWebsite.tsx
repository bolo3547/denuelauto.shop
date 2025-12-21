import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { 
  FaCar, FaSearch, FaWhatsapp, FaPhone, FaEnvelope, 
  FaMapMarkerAlt, FaStar, FaShieldAlt, FaCertificate, FaLock,
  FaGlobe, FaFacebook, FaTwitter, FaInstagram, FaLinkedin,
  FaUsers, FaAward, FaTruck, FaHandshake, FaChevronRight,
  FaPlay, FaChartLine, FaBars, FaTimes
} from 'react-icons/fa';
import DealerLocator from '../components/DealerLocator';
import CarHistoryReport from '../components/CarHistoryReport';
import PublicCarBrowse from '../components/PublicCarBrowse';
import PublicHeader from '../components/public/PublicHeader';
import PublicHero from '../components/public/PublicHero';
import { SearchFilters } from '../components/public/searchTypes';
import CurrencyConverter from '../components/public/CurrencyConverter';
import ShippingCalculator from '../components/public/ShippingCalculator';
import CarReservation from '../components/CarReservation';
import PublicLeftSidebar from '../components/public/PublicLeftSidebar';
import PublicRightSidebar from '../components/public/PublicRightSidebar';
import PublicFooter from '../components/public/PublicFooter';
import PromoCarousel from '../components/public/PromoCarousel';
import Testimonials from '../components/testimonials';
import Faq from '../components/faq';
import NewsletterSignup from '../components/NewsletterSignup';
import WhatsAppButton from '../components/WhatsAppButton';
import BestSellers from '../components/public/BestSellers';
import RecentlyViewedCars from '../components/public/RecentlyViewedCars';
import CompareCarsTool from '../components/public/CompareCarsTool';
import StockNumberSearch from '../components/public/StockNumberSearch';
import CountryPortSelector from '../components/public/CountryPortSelector';
import LiveChatSupport from '../components/public/LiveChatSupport';
import SpecialOffersBanner from '../components/public/SpecialOffersBanner';
import FinanceCalculator from '../components/public/FinanceCalculator';
import FAQHelpCenter from '../components/public/FAQHelpCenter';
import MobileAppPromo from '../components/public/MobileAppPromo';
import VideoTestimonials from '../components/public/VideoTestimonials';
import ShippingTracker from '../components/public/ShippingTracker';
import SocialProofWidgets from '../components/public/SocialProofWidgets';
import SavedSearchesAlerts from '../components/public/SavedSearchesAlerts';
import { makeApiUrl } from '@/lib/config/api';
import DealerRatingsReviews from '../components/public/DealerRatingsReviews';
import AdvancedFilters from '../components/public/AdvancedFilters';
import EnhancedSearch from '../components/public/EnhancedSearch';
import BEForwardSearchFilters from '../components/public/BEForwardSearchFilters';
import BFPointsSystem from '../components/public/BFPointsSystem';
import StockDashboard from '../components/public/StockDashboard';
import FeaturedSections from '../components/public/FeaturedSections';
import BuyerAuth from '../components/BuyerAuth';
import HeaderAutosuggest from '../components/HeaderAutosuggest';
import CarDetailModal from '../components/public/CarDetailModal';
import WishlistModal from '../components/public/WishlistModal';
import UserDashboard from '../components/public/UserDashboard';
import { t, availableLocales } from '../lib/i18n';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  stats?: {
    totalCars: number;
    happyCustomers: number;
    yearsInBusiness: number;
    countriesServed: number;
  };
}

interface PublicWebsiteProps {
  tenantSlug: string;
}

// Professional blue theme data constants
const bfMakes = [
  'TOYOTA', 'NISSAN', 'HONDA', 'MAZDA', 'MITSUBISHI', 'SUBARU', 'SUZUKI',
  'ISUZU', 'DAIHATSU', 'HINO', 'LEXUS', 'MERCEDES-BENZ', 'BMW', 'VOLKSWAGEN',
  'AUDI', 'PEUGEOT', 'FORD', 'VOLVO', 'LAND ROVER', 'JAGUAR', 'JEEP',
  'CHEVROLET', 'HYUNDAI', 'KIA', 'SSANGYONG', 'RENAULT SAMSUNG'
];

const bfPriceRanges = [
  'Under $500', '$500 - $1,000', '$1,000 - $1,500', '$1,500 - $2,000',
  '$2,000 - $2,500', '$2,500 - $4,000', 'Over $4,000'
];

const bfTypes = [
  'SUV', 'Sedan', 'Truck', 'Pick up', 'Van', 'Bus', 'Mini Van', 'Hatchback',
  'Coupe', 'Convertible', 'Wagon', 'Mini Bus', 'Machinery', 'Forklift', 'Tractor', 'Motorcycle'
];

export default function PublicWebsite({ tenantSlug }: PublicWebsiteProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showAuth, setShowAuth] = useState(false);
  const [buyer, setBuyer] = useState<any>(null);
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [showCarDetailModal, setShowCarDetailModal] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [showWishlistModal, setShowWishlistModal] = useState(false);

  const loadTenant = useCallback(async () => {
    setLoading(true);
    try {
      // First try to get from localStorage (for newly registered tenant)
      const storedTenant = localStorage.getItem('tenantData');
      const storedSlug = localStorage.getItem('tenantSlug');
      
      if (storedTenant && storedSlug === tenantSlug) {
        const parsedTenant = JSON.parse(storedTenant);
        const tenantData: Tenant = {
          id: parsedTenant.id || '1',
          name: parsedTenant.name,
          slug: tenantSlug,
          description: `Welcome to ${parsedTenant.name}! Your trusted partner for quality vehicles.`,
          logo: parsedTenant.theme?.logo || '/api/placeholder/200/80',
          banner: '/api/placeholder/1200/400',
          contactEmail: parsedTenant.email || 'info@dealership.com',
          contactPhone: '+1-800-CAR-DEAL',
          website: `https://${tenantSlug}.denuelauto.com`,
          address: '123 Auto Street',
          city: 'Your City',
          country: parsedTenant.country || 'Zambia',
          socialMedia: {
            facebook: '#',
            instagram: '#',
            twitter: '#'
          },
          stats: {
            totalCars: 0,
            happyCustomers: 0,
            yearsInBusiness: 1,
            countriesServed: 1
          }
        };
        setTenant(tenantData);
        setLoading(false);
        return;
      }

      // Try to fetch from API
      try {
        const res = await fetch(makeApiUrl(`/api/tenants/slug/${tenantSlug}`));
        if (res.ok) {
          const data = await res.json();
          const tenantData: Tenant = {
            id: data.id,
            name: data.name,
            slug: data.slug || tenantSlug,
            description: data.description || `Welcome to ${data.name}! Your trusted partner for quality vehicles.`,
            logo: data.logo || data.theme?.logo || '/api/placeholder/200/80',
            banner: data.banner || '/api/placeholder/1200/400',
            contactEmail: data.contactEmail || data.email || 'info@dealership.com',
            contactPhone: data.contactPhone || data.phone || '+1-800-CAR-DEAL',
            website: data.website || `https://${tenantSlug}.denuelauto.com`,
            address: data.address || '123 Auto Street',
            city: data.city || 'Your City',
            country: data.country || 'Zambia',
            socialMedia: data.socialMedia || {},
            stats: data.stats || {
              totalCars: 0,
              happyCustomers: 0,
              yearsInBusiness: 1,
              countriesServed: 1
            }
          };
          setTenant(tenantData);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using fallback');
      }

      // Fallback mock data if nothing else works
      const mockTenant: Tenant = {
        id: '1',
        name: 'Demo Dealership',
        slug: tenantSlug,
        description: 'Your trusted partner for quality vehicles. We specialize in reliable, well-maintained cars.',
        logo: '/api/placeholder/200/80',
        banner: '/api/placeholder/1200/400',
        contactEmail: 'info@dealership.com',
        contactPhone: '+1-800-CAR-DEAL',
        website: `https://${tenantSlug}.denuelauto.com`,
        address: '123 Auto Street',
        city: 'Your City',
        country: 'Zambia',
        socialMedia: {
          facebook: '#',
          instagram: '#',
          twitter: '#'
        },
        stats: {
          totalCars: 50,
          happyCustomers: 200,
          yearsInBusiness: 5,
          countriesServed: 3
        }
      };
      
      setTenant(mockTenant);
    } catch (error) {
      console.error('Error loading tenant:', error);
    } finally {
      setLoading(false);
    }
  }, [tenantSlug]);

  const checkAuthStatus = useCallback(() => {
    const token = localStorage.getItem('buyerToken');
    const buyerData = localStorage.getItem('buyerData');
    
    if (token && buyerData) {
      try {
        setBuyer(JSON.parse(buyerData));
      } catch (error) {
        localStorage.removeItem('buyerToken');
        localStorage.removeItem('buyerData');
      }
    }
  }, []);

  useEffect(() => {
    loadTenant();
    checkAuthStatus();
  }, [loadTenant, checkAuthStatus]);

  const handleCarClick = (car: any) => {
    setSelectedCar(car);
    setShowCarDetailModal(true);
  };

  const handleCloseCarDetailModal = () => {
    setShowCarDetailModal(false);
    setSelectedCar(null);
  };

  const handleAddToFavorites = (car: any) => {
    setFavorites(prev => {
      const isAlreadyFavorite = prev.some(fav => fav.id === car.id);
      if (isAlreadyFavorite) {
        return prev.filter(fav => fav.id !== car.id);
      } else {
        return [...prev, car];
      }
    });
  };

  // Public cars state + pagination
  const [_carsLoading, setCarsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, _setLimit] = useState(12);
  const [totalCarsCount, setTotalCarsCount] = useState<number | null>(null);
  // Locale & currency
  const [locale, setLocale] = useState<'en' | 'ja'>('en');
  const [currency, setCurrency] = useState<'USD' | 'JPY'>('USD');
  const [usdToJpy, setUsdToJpy] = useState<number | null>(null);
  // Filters
  const [keyword, setKeyword] = useState<string>('');
  const [filterMake, setFilterMake] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterMinPriceUsd, setFilterMinPriceUsd] = useState<number | null>(null);
  const [filterMaxPriceUsd, setFilterMaxPriceUsd] = useState<number | null>(null);
  // Advanced filters
  const [filterYearMin, setFilterYearMin] = useState<number | null>(null);
  const [filterYearMax, setFilterYearMax] = useState<number | null>(null);
  const [filterMinMileage, setFilterMinMileage] = useState<number | null>(null);
  const [filterMaxMileage, setFilterMaxMileage] = useState<number | null>(null);
  const [filterTransmission, setFilterTransmission] = useState<string | null>(null);
  const [filterFuelType, setFilterFuelType] = useState<string | null>(null);
  const [filterColor, setFilterColor] = useState<string | null>(null);
  const [filterSortBy, setFilterSortBy] = useState<string>('createdAt');
  const [filterSortOrder, setFilterSortOrder] = useState<'asc' | 'desc'>('desc');

  // Hero filters
  const [heroFilters, setHeroFilters] = useState<Partial<SearchFilters>>({});

  const applyHeroFilters = () => {
    // Map hero filters into page filters
    setFilterMake(heroFilters.make ?? null);
    setFilterType(heroFilters.bodyType ?? null);
    setFilterMinPriceUsd(heroFilters.priceMin ? Number(heroFilters.priceMin) : null);
    setFilterMaxPriceUsd(heroFilters.priceMax ? Number(heroFilters.priceMax) : null);
    setFilterYearMin(heroFilters.yearMin ? Number(heroFilters.yearMin) : null);
    setFilterYearMax(heroFilters.yearMax ? Number(heroFilters.yearMax) : null);
    setFilterFuelType(heroFilters.fuelType ?? null);
    // If there are any other filters to map, add here
  };

  const fetchCars = useCallback(async () => {
    setCarsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (filterMake) params.set('make', filterMake);
      if (filterType) params.set('type', filterType);
      if (keyword) params.set('q', keyword);
      if (filterMinPriceUsd !== null) params.set('minPriceUsd', String(filterMinPriceUsd));
      if (filterMaxPriceUsd !== null) params.set('maxPriceUsd', String(filterMaxPriceUsd));
      if (filterYearMin !== null) params.set('yearMin', String(filterYearMin));
      if (filterYearMax !== null) params.set('yearMax', String(filterYearMax));
      if (filterMinMileage !== null) params.set('minMileage', String(filterMinMileage));
      if (filterMaxMileage !== null) params.set('maxMileage', String(filterMaxMileage));
      if (filterTransmission) params.set('transmission', String(filterTransmission));
      if (filterFuelType) params.set('fuelType', String(filterFuelType));
      if (filterColor) params.set('colors', String(filterColor));
      if (filterSortBy) params.set('sortBy', String(filterSortBy));
      if (filterSortOrder) params.set('sortOrder', String(filterSortOrder));

      const res = await fetch(makeApiUrl(`/t/${tenantSlug}/public/cars?${params.toString()}`));
      if (res.ok) {
        const data = await res.json();
        // Expecting paginated response { items, total, page, limit }
        if (Array.isArray(data)) {
          setTotalCarsCount(data.length);
        } else if (data.items) {
          setTotalCarsCount(typeof data.total === 'number' ? data.total : data.items.length);
        } else {
          setTotalCarsCount(0);
        }
      } else {
        // fallback
        setTotalCarsCount(4);
      }
    } catch (err) {
      console.warn('Failed to fetch public cars, using sample data', err);
      setTotalCarsCount(4);
    } finally {
      setCarsLoading(false);
    }
  }, [tenantSlug, page, limit, filterMake, filterType, keyword, filterMinPriceUsd, filterMaxPriceUsd]);

  // Fetch FX rate for tenant (USD -> JPY) if available
  const fetchFx = useCallback(async () => {
    try {
      const res = await fetch(makeApiUrl(`/t/${tenantSlug}/public/fx`));
      if (res.ok) {
        const data = await res.json();
        // expect { fx: { usd_to_zmw, usd_to_jpy ... } }
        const fx = data.fx || {};
        if (fx.usd_to_jpy) setUsdToJpy(Number(fx.usd_to_jpy));
        else if (fx.jpy_rate) setUsdToJpy(Number(fx.jpy_rate));
      }
    } catch (err) {
      // ignore, fallback to null
    }
  }, [tenantSlug]);

  useEffect(() => {
    if (tenantSlug) fetchFx();
  }, [tenantSlug, fetchFx]);

  useEffect(() => {
    // fetch cars when tenantSlug or fetchCars dependencies change
    if (tenantSlug) fetchCars();
  }, [tenantSlug, fetchCars]);

  // Professional blue theme placeholder data for public website
  const [bfMakes, setBfMakes] = useState<Array<{name:string,count:number}>>([]);
  const bfPriceRanges = ['Under $500', '$500 - $1,000', '$1,000 - $1,500', '$1,500 - $2,000', '$2,000 - $2,500', '$2,500 - $4,000', 'Over $4,000'];
  const [bfTypes, setBfTypes] = useState<Array<{type:string,count:number}>>([]);
  const [showPriceInJpy, setShowPriceInJpy] = useState(false);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const headerSearchRef = React.useRef<HTMLInputElement | null>(null);

  // fetch aggregates for make/type/price buckets

  const focusHeaderSearch = () => {
    const el = headerSearchRef.current;
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const fetchAggregates = useCallback(async () => {
    try {
      const res = await fetch(makeApiUrl(`/t/${tenantSlug}/public/aggregates`));
      if (res.ok) {
        const data = await res.json();
        setBfMakes(data.makes || []);
        setBfTypes(data.types || []);
        // if priceBuckets present, we could map them — but we keep bfPriceRanges as labels
      }
    } catch (err) {
      // ignore, keep placeholders empty
    }
  }, [tenantSlug]);

  useEffect(() => { if (tenantSlug) fetchAggregates(); }, [tenantSlug, fetchAggregates]);

  // sticky compact header on scroll
  useEffect(() => {
    const onScroll = () => setIsHeaderCompact(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // keyboard shortcut to focus search (/)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/') {
        const el = headerSearchRef.current;
        if (el) {
          e.preventDefault();
          el.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // sampleCars removed — PublicCarBrowse handles listing; we keep fallback totals instead

  const handleAuthSuccess = (buyerData: any) => {
    setBuyer(buyerData);
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('buyerToken');
    localStorage.removeItem('buyerData');
    setBuyer(null);
  };

  const scrollToSection = (sectionId: string) => {
    setCurrentSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dealership...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dealership Not Found</h1>
          <p className="text-gray-600">The requested dealership could not be found.</p>
        </div>
      </div>
    );
  }

  if (showAuth) {
    return (
      <BuyerAuth
        mode={authMode}
        onSuccess={handleAuthSuccess}
        onModeChange={setAuthMode}
        tenantSlug={tenantSlug}
      />
    );
  }

  if (currentSection === 'browse') {
    return (
      <div>
        <PublicHeader tenant={tenant} buyer={buyer} currentSection={currentSection} setCurrentSection={setCurrentSection} showAuth={showAuth} setShowAuth={setShowAuth} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} handleLogout={handleLogout} scrollToSection={scrollToSection} locale={locale} setLocale={setLocale} currency={currency} setCurrency={setCurrency} favoritesCount={favorites.length} onOpenWishlist={() => setShowWishlistModal(true)} onOpenSearch={focusHeaderSearch} keyword={keyword} setKeyword={setKeyword} onSearch={() => setPage(1)} />
        <PublicCarBrowse
          tenantSlug={tenantSlug}
          buyerId={buyer?.id}
          onCarSelect={handleCarClick}
          externalFilters={{
            search: keyword,
            make: filterMake ?? '',
            bodyType: filterType ?? '',
            priceMin: filterMinPriceUsd ? String(filterMinPriceUsd) : '',
            priceMax: filterMaxPriceUsd ? String(filterMaxPriceUsd) : '',
            yearMin: filterYearMin ? String(filterYearMin) : '',
            yearMax: filterYearMax ? String(filterYearMax) : '',
            minMileage: filterMinMileage ? String(filterMinMileage) : '',
            maxMileage: filterMaxMileage ? String(filterMaxMileage) : '',
            transmission: filterTransmission ?? '',
            fuelType: filterFuelType ?? '',
            color: filterColor ?? '',
            sortBy: filterSortBy,
            sortOrder: filterSortOrder
          }}
        />
      </div>
    );
  }

  if (currentSection === 'dashboard') {
    return (
      <UserDashboard
        buyer={buyer}
        onLogout={handleLogout}
        favorites={favorites}
        onRemoveFromFavorites={(carId) => {
          setFavorites(prev => prev.filter(fav => fav.id !== carId));
        }}
        onCarClick={handleCarClick}
        recentSearches={[]} // TODO: Implement recent searches
        onClearRecentSearches={() => {}} // TODO: Implement clear recent searches
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{tenant.name} | Buy Used & New Cars</title>
        <meta name="description" content={tenant.description} />
        <meta property="og:title" content={`${tenant.name} | Used & New Cars`} />
        <meta property="og:description" content={tenant.description} />
        <meta property="og:image" content={tenant.logo || tenant.banner} />
      </Head>
        <PublicHeader
          tenant={tenant}
          buyer={buyer}
          locale={locale}
          setLocale={setLocale}
          currency={currency}
          setCurrency={setCurrency}
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
          showAuth={showAuth}
          setShowAuth={setShowAuth}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          handleLogout={handleLogout}
          scrollToSection={scrollToSection}
          favoritesCount={favorites.length}
          onOpenWishlist={() => setShowWishlistModal(true)}
          onOpenSearch={focusHeaderSearch}
          keyword={keyword}
          setKeyword={setKeyword}
          onSearch={() => setPage(1)}
        />

      {/* Trust Indicators Section */}
        {/* Promo strip */}
        <PromoCarousel />

        <SpecialOffersBanner />

        <MobileAppPromo />

        <div className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-8 py-4 flex flex-wrap gap-8 justify-center text-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-full"><FaShieldAlt className="text-blue-600" /></div>
              <div>
                <div className="font-semibold">Inspected Vehicles</div>
                <div className="text-gray-500 text-xs">Detailed inspection reports</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-full"><FaTruck className="text-blue-600" /></div>
              <div>
                <div className="font-semibold">Worldwide Shipping</div>
                <div className="text-gray-500 text-xs">Door-to-door options available</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-full"><FaCertificate className="text-blue-600" /></div>
              <div>
                <div className="font-semibold">Warranty Options</div>
                <div className="text-gray-500 text-xs">Optional protection plans</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-full"><FaLock className="text-blue-600" /></div>
              <div>
                <div className="font-semibold">Secure Payment</div>
                <div className="text-gray-500 text-xs">Safe & encrypted checkout</div>
              </div>
            </div>
          </div>
        </div>

      <PublicHero
        banner={tenant?.banner}
        title={`Find your next car at ${tenant?.name}`}
        keyword={keyword}
        setKeyword={(s) => { setKeyword(s); }}
        onSearch={() => { applyHeroFilters(); setPage(1); setCurrentSection('browse'); }}
        filters={heroFilters}
        onFiltersChange={setHeroFilters}
      />

      {/* Promotions & Special Offers */}
      <section className="py-12 bg-gradient-to-r from-yellow-400 to-orange-500">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Special Offers & Promotions</h2>
            <p className="text-yellow-100">Don't miss out on these limited-time deals!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-lg text-center">
              <div className="text-3xl mb-2">🚚</div>
              <h3 className="font-semibold text-lg mb-2">Free Shipping</h3>
              <p className="text-gray-600 text-sm">On orders over $5,000 to select ports</p>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Learn More</button>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-lg text-center">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold text-lg mb-2">Cash Back</h3>
              <p className="text-gray-600 text-sm">Get up to 2% cash back on your purchase</p>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Claim Now</button>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-lg text-center">
              <div className="text-3xl mb-2">🔧</div>
              <h3 className="font-semibold text-lg mb-2">Extended Warranty</h3>
              <p className="text-gray-600 text-sm">3-year warranty on all vehicles</p>
              <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Get Warranty</button>
            </div>
          </div>
        </div>
      </section>

      {/* Deals Section */}
      <section id="deals" className="py-20 bg-red-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-red-600 mb-6">🔥 Hot Deals</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">Limited time offers on premium Japanese vehicles. Save thousands on certified, inspected cars with full warranty coverage.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Sample deal cards */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-l-4 border-red-500 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-bold">50% OFF</span>
                <span className="text-red-600 font-bold text-sm">Limited Time</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Toyota Prado 2018</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">Excellent condition, low mileage, full service history</p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-sm">Only 45,000 km mileage</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-sm">2-year warranty included</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-sm">Free shipping worldwide</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold text-red-600">$8,500</span>
                  <span className="text-gray-500 line-through ml-3 text-lg">$17,000</span>
                </div>
                <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 text-lg font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-400">View Deal</button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-l-4 border-red-500 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-bold">30% OFF</span>
                <span className="text-red-600 font-bold text-sm">Flash Sale</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Honda CR-V 2019</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">One owner, full service history, premium SUV</p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-sm">Only 32,000 km mileage</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-sm">Single owner vehicle</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-sm">All maintenance records</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold text-red-600">$12,250</span>
                  <span className="text-gray-500 line-through ml-3 text-lg">$17,500</span>
                </div>
                <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 text-lg font-semibold shadow-lg hover:shadow-xl">View Deal</button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border-l-4 border-red-500 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-bold">40% OFF</span>
                <span className="text-red-600 font-bold text-sm">Clearance</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Nissan Patrol 2017</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">Powerful SUV with 4x4 capability, perfect for adventure</p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-sm">4x4 all-wheel drive</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-sm">Diesel engine, fuel efficient</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-sm">Off-road ready</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold text-red-600">$15,000</span>
                  <span className="text-gray-500 line-through ml-3 text-lg">$25,000</span>
                </div>
                <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 text-lg font-semibold shadow-lg hover:shadow-xl">View Deal</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Today Special Section */}
      <section id="specials" className="py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-blue-600 mb-6">⭐ Today's Special</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">Exclusive daily offers on handpicked vehicles. These deals won't last long - act fast to secure your dream car at unbeatable prices.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-12 border-l-8 border-blue-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-6 py-3 rounded-bl-2xl font-bold text-lg">
              🔥 Limited Time Only
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <h3 className="text-4xl font-bold text-gray-800 mb-4">Mitsubishi Pajero 2020</h3>
                  <p className="text-xl text-gray-600 leading-relaxed">Premium SUV with exceptional performance and reliability. Perfect for family adventures and long journeys.</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-lg">Only 28,000 km mileage</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-lg">Full service history available</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-lg">3-year extended warranty</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-lg">Free worldwide shipping</span>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div>
                    <span className="text-5xl font-bold text-blue-600">$18,900</span>
                    <div className="text-gray-500 line-through text-2xl">$26,500</div>
                  </div>
                  <div className="bg-green-100 text-green-800 px-6 py-3 rounded-full font-bold text-lg">
                    Save $7,600
                  </div>
                </div>
                <div className="flex gap-8">
                  <button className="bg-blue-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:bg-blue-700 transition-all duration-300 text-lg sm:text-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Claim This Deal
                  </button>
                  <button className="border-2 border-blue-600 text-blue-600 px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:bg-blue-50 transition-all duration-300 text-lg sm:text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300">
                    View Details
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl p-8 shadow-inner">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🚗</div>
                    <p className="text-blue-800 font-semibold text-lg">Premium Japanese Quality</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                  FEATURED
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clearance Section */}
      <section id="clearance" className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">⚡ CLEARANCE SALE</h2>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">Last chance to save big on clearance vehicles. These deals are disappearing fast - don't miss your opportunity to own premium Japanese vehicles at unbeatable prices.</p>
            <div className="mt-8 flex justify-center gap-4">
              <div className="bg-red-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                🔥 Up to 70% OFF
              </div>
              <div className="bg-yellow-500 text-black px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                ⏰ Limited Stock
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-300 shadow-2xl border border-gray-600">
              <div className="text-6xl mb-6">🚙</div>
              <h3 className="text-3xl font-bold mb-4">SUVs</h3>
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">Premium SUVs with advanced features</p>
              <div className="text-4xl font-bold text-red-400 mb-6">Up to 60% OFF</div>
                <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full focus:outline-none focus:ring-2 focus:ring-red-400">
                Browse SUVs
              </button>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-300 shadow-2xl border border-gray-600">
              <div className="text-6xl mb-6">🚐</div>
              <h3 className="text-3xl font-bold mb-4">Vans</h3>
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">Spacious family and commercial vans</p>
              <div className="text-4xl font-bold text-red-400 mb-6">Up to 50% OFF</div>
                <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full focus:outline-none focus:ring-2 focus:ring-red-400">
                Browse Vans
              </button>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-300 shadow-2xl border border-gray-600">
              <div className="text-6xl mb-6">🚛</div>
              <h3 className="text-3xl font-bold mb-4">Trucks</h3>
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">Heavy-duty trucks for work and play</p>
              <div className="text-4xl font-bold text-red-400 mb-6">Up to 45% OFF</div>
                <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full focus:outline-none focus:ring-2 focus:ring-red-400">
                Browse Trucks
              </button>
            </div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-8 text-center hover:transform hover:scale-105 transition-all duration-300 shadow-2xl border border-gray-600">
              <div className="text-6xl mb-6">🏍️</div>
              <h3 className="text-3xl font-bold mb-4">Motorcycles</h3>
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">Sport and touring motorcycles</p>
              <div className="text-4xl font-bold text-red-400 mb-6">Up to 40% OFF</div>
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full">
                Browse Motorcycles
              </button>
            </div>
          </div>
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-red-600 to-yellow-500 text-white px-12 py-6 rounded-2xl inline-block shadow-2xl">
              <p className="text-2xl font-bold">⏰ Sale Ends Soon - Limited Stock Available!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Section (Professional blue theme) */}
      <section id="marketplace" className="py-24 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-blue-600 mb-6">🚗 Find Your Perfect Car</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">Browse our extensive inventory of quality Japanese used cars. Each vehicle is carefully inspected and comes with comprehensive warranty coverage.</p>
            <div className="mt-8 flex justify-center gap-8">
              <div className="bg-blue-100 text-blue-800 px-6 py-3 rounded-full font-semibold text-lg">
                ✓ Certified Quality
              </div>
              <div className="bg-green-100 text-green-800 px-6 py-3 rounded-full font-semibold text-lg">
                ✓ Full Warranty
              </div>
              <div className="bg-purple-100 text-purple-800 px-6 py-3 rounded-full font-semibold text-lg">
                ✓ Global Shipping
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Left Sidebar - Filters */}
            <aside className="col-span-12 lg:col-span-3">
              <div className="space-y-4">
                <StockNumberSearch onSearch={(stockNo) => { setKeyword(stockNo); setPage(1); }} />
                <CountryPortSelector onSelect={(country, port, cost) => console.log(`Selected ${country}, ${port}, cost: $${cost}`)} />
                <SavedSearchesAlerts />
                <BEForwardSearchFilters
                  initialFilters={{
                    keyword: keyword || '',
                    make: filterMake || '',
                    bodyType: filterType || '',
                    priceMin: filterMinPriceUsd ? String(filterMinPriceUsd) : '',
                    priceMax: filterMaxPriceUsd ? String(filterMaxPriceUsd) : ''
                  }}
                  onFiltersChange={(filters) => {
                    setKeyword(filters.keyword || '');
                    setFilterMake(filters.make || null);
                    setFilterType(filters.bodyType || null); // bodyType -> page filterType
                    setFilterMinPriceUsd(filters.priceMin ? Number(filters.priceMin) : null);
                    setFilterMaxPriceUsd(filters.priceMax ? Number(filters.priceMax) : null);
                    setPage(1);
                  }}
                  tenantSlug={tenantSlug}
                />
                <StockDashboard tenantSlug={tenantSlug} />
                <PublicLeftSidebar
                  bfMakes={bfMakes}
                  bfPriceRanges={bfPriceRanges}
                  bfTypes={bfTypes}
                  filterMake={filterMake}
                  filterType={filterType}
                  setFilterMake={setFilterMake}
                  setFilterType={setFilterType}
                  setFilterMinPriceUsd={setFilterMinPriceUsd}
                  setFilterMaxPriceUsd={setFilterMaxPriceUsd}
                  setPage={setPage}
                  keyword={keyword}
                  setKeyword={setKeyword}
                  showPriceInJpy={showPriceInJpy}
                  setShowPriceInJpy={setShowPriceInJpy}
                />
              </div>
            </aside>

            {/* Main Content - Car Listings */}
            <main className="col-span-12 lg:col-span-6">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Available Cars</h3>
                  <div className="text-sm text-gray-600">
                    Showing {Math.min((page - 1) * limit + 1, totalCarsCount || 0)} - {Math.min(page * limit, totalCarsCount || 0)} of {totalCarsCount?.toLocaleString() || '0'} results
                  </div>
                </div>

                {/* Sort and view options */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <label htmlFor="sort-select" className="sr-only">Sort by</label>
                    <select id="sort-select" value={filterSortBy} onChange={(e) => { setFilterSortBy(e.target.value); setPage(1); }} className="border border-gray-300 rounded px-3 py-2 text-sm" aria-label="Sort car listings">
                      <option value="updatedAt">Newest First</option>
                      <option value="price">Price: Low to High</option>
                      <option value="year">Year: Newest First</option>
                      <option value="mileage">Mileage: Low to High</option>
                    </select>
                    <button onClick={() => setFilterSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} className="border border-gray-300 rounded px-3 py-2 text-sm hover:bg-gray-50">
                      {filterSortOrder === 'desc' ? '↓' : '↑'}
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    View: Grid
                  </div>
                </div>
              </div>

              {/* Use the full browse component here so users see advanced selects and filters */}
              <PublicCarBrowse
                tenantSlug={tenantSlug}
                buyerId={buyer?.id}
                externalFilters={{
                  search: keyword,
                  make: filterMake ?? '',
                  bodyType: filterType ?? '',
                  priceMin: filterMinPriceUsd !== null ? String(filterMinPriceUsd) : '',
                  priceMax: filterMaxPriceUsd !== null ? String(filterMaxPriceUsd) : ''
                }}
              />
            </main>

            {/* Right Sidebar - Points & Features */}
            <aside className="col-span-12 lg:col-span-3">
              <div className="space-y-4">
                <SocialProofWidgets />
                <FinanceCalculator />
                <BFPointsSystem buyer={buyer} tenantSlug={tenantSlug} />
                <PublicRightSidebar buyer={buyer} />

                {/* Trust badges */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <h4 className="font-semibold text-gray-900 mb-4">Why Choose Us?</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaShieldAlt className="text-blue-600 text-sm" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Inspected Vehicles</div>
                        <div className="text-xs text-gray-600">Detailed reports</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaTruck className="text-blue-600 text-sm" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Worldwide Shipping</div>
                        <div className="text-xs text-gray-600">Door-to-door service</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaCertificate className="text-blue-600 text-sm" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">Warranty Options</div>
                        <div className="text-xs text-gray-600">Optional protection</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Featured Sections (Professional blue theme) */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <FeaturedSections
            tenantSlug={tenantSlug}
            onCarSelect={(car) => {
              setSelectedCar(car);
              setShowCarDetailModal(true);
            }}
          />
        </div>
      </section>

      {/* Recently Viewed Cars Section */}
      <RecentlyViewedCars />

      {/* Compare Cars Tool Section */}
      <CompareCarsTool />

      {/* FAQ Help Center Section */}
      <FAQHelpCenter />

      {/* Video Testimonials Section */}
      <VideoTestimonials />

      {/* Shipping Tracker Section */}
      <ShippingTracker />

      {/* Dealer Ratings & Reviews Section */}
      <DealerRatingsReviews />

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Why Choose {tenant?.name}?
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                With over {tenant.stats?.yearsInBusiness} years of experience in the Japanese used car export business, 
                we have established ourselves as a trusted partner for customers worldwide. Our commitment to quality, 
                transparency, and customer satisfaction sets us apart.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaShieldAlt className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Quality Assurance</h3>
                    <p className="text-gray-600">Every vehicle undergoes thorough inspection and comes with detailed reports.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaCertificate className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Certified Export</h3>
                    <p className="text-gray-600">All necessary documentation and certificates for international shipping.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaHandshake className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Trusted Service</h3>
                    <p className="text-gray-600">Transparent pricing, reliable shipping, and excellent customer support.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="/api/placeholder/600/400"
                alt="About Us"
                className="rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-blue-600 bg-opacity-20 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">🏆 Why Choose {tenant?.name}?</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              With over {tenant.stats?.yearsInBusiness} years of experience in the Japanese used car export business,
              we have established ourselves as a trusted partner for customers worldwide. Our commitment to quality,
              transparency, and customer satisfaction sets us apart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl border hover:shadow-3xl transition-all duration-300 hover:transform hover:-translate-y-2 border-l-8 border-l-blue-500">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-8 mx-auto">
                <FaSearch className="text-blue-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-center">Vehicle Sourcing</h3>
              <p className="text-gray-600 text-lg leading-relaxed text-center">
                We help you find the perfect vehicle that matches your requirements and budget from our extensive network.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl border hover:shadow-3xl transition-all duration-300 hover:transform hover:-translate-y-2 border-l-8 border-l-green-500">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-8 mx-auto">
                <FaCertificate className="text-green-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-center">Documentation</h3>
              <p className="text-gray-600 text-lg leading-relaxed text-center">
                Complete handling of all export documentation, certificates, and customs paperwork for hassle-free import.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl border hover:shadow-3xl transition-all duration-300 hover:transform hover:-translate-y-2 border-l-8 border-l-purple-500">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mb-8 mx-auto">
                <FaTruck className="text-purple-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-center">Shipping & Logistics</h3>
              <p className="text-gray-600 text-lg leading-relaxed text-center">
                Reliable shipping services to your port of choice with full tracking and insurance coverage.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl border hover:shadow-3xl transition-all duration-300 hover:transform hover:-translate-y-2 border-l-8 border-l-red-500">
              <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mb-8 mx-auto">
                <FaShieldAlt className="text-red-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-center">Quality Inspection</h3>
              <p className="text-gray-600 text-lg leading-relaxed text-center">
                Thorough pre-shipment inspection with detailed reports and high-quality photos of your vehicle.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl border hover:shadow-3xl transition-all duration-300 hover:transform hover:-translate-y-2 border-l-8 border-l-yellow-500">
              <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mb-8 mx-auto">
                <FaUsers className="text-yellow-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-center">Customer Support</h3>
              <p className="text-gray-600 text-lg leading-relaxed text-center">
                24/7 customer support throughout your purchase journey and after-sales service.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl border hover:shadow-3xl transition-all duration-300 hover:transform hover:-translate-y-2 border-l-8 border-l-indigo-500">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mb-8 mx-auto">
                <FaChartLine className="text-indigo-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-center">Market Analysis</h3>
              <p className="text-gray-600 text-lg leading-relaxed text-center">
                Regular market insights and price analysis to help you make informed purchasing decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-6xl mx-auto text-center px-8">
          <div className="mb-8">
            <div className="text-7xl mb-6">🚗</div>
            <h2 className="text-5xl font-bold mb-8">Ready to Find Your Perfect Car?</h2>
            <p className="text-2xl mb-12 text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Browse our extensive inventory of quality Japanese used cars and start your journey today.
              Join thousands of satisfied customers worldwide.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center mb-12">
            <button
              onClick={() => setCurrentSection('browse')}
              className="bg-white text-blue-600 px-6 py-3 sm:px-12 sm:py-5 rounded-2xl text-lg sm:text-2xl font-bold hover:bg-gray-100 hover:transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl hover:shadow-3xl"
            >
              <FaCar className="text-3xl" /> Browse Cars Now
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="bg-transparent border-3 border-white text-white px-6 py-3 sm:px-12 sm:py-5 rounded-2xl text-lg sm:text-2xl font-bold hover:bg-white hover:text-blue-600 transition-all duration-300 hover:transform hover:scale-105 shadow-2xl hover:shadow-3xl"
            >
              Get in Touch
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
              <div className="text-4xl font-bold text-yellow-400 mb-2">10,000+</div>
              <div className="text-xl">Cars Sold Worldwide</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
              <div className="text-4xl font-bold text-green-400 mb-2">50+</div>
              <div className="text-xl">Countries Served</div>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
              <div className="text-4xl font-bold text-red-400 mb-2">24/7</div>
              <div className="text-xl">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ready to start your car buying journey? Contact us today for personalized assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaMapMarkerAlt className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Our Location</h3>
                    <p className="text-gray-600">
                      {tenant?.address}<br />
                      {tenant?.city}, {tenant?.country}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaPhone className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Phone</h3>
                    <p className="text-gray-600">{tenant?.contactPhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaEnvelope className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Email</h3>
                    <p className="text-gray-600">{tenant?.contactEmail}</p>
                  </div>
                </div>

                {tenant.socialMedia && (
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FaGlobe className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Follow Us</h3>
                      <div className="flex gap-3">
                        {tenant.socialMedia.facebook && (
                          <a href={tenant.socialMedia.facebook} className="text-blue-600 hover:text-blue-800" title="Facebook">
                            <FaFacebook size={24} />
                          </a>
                        )}
                        {tenant.socialMedia.twitter && (
                          <a href={tenant.socialMedia.twitter} className="text-blue-600 hover:text-blue-800" title="Twitter">
                            <FaTwitter size={24} />
                          </a>
                        )}
                        {tenant.socialMedia.instagram && (
                          <a href={tenant.socialMedia.instagram} className="text-blue-600 hover:text-blue-800" title="Instagram">
                            <FaInstagram size={24} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-6">Send us a Message</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                <textarea
                  placeholder="Your Message"
                  rows={5}
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials, FAQ & Newsletter - Professional blue theme */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">What our customers say</h2>
            <Testimonials />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Stay in the loop</h2>
            <NewsletterSignup />
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">FAQ</h3>
              <Faq />
            </div>
          </div>
        </div>
      </section>

      {/* Tools & Calculators Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Tools & Resources</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Use our free tools to plan your purchase, calculate costs, and make informed decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <CurrencyConverter />
            <ShippingCalculator />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <DealerLocator tenant={tenant} />
            <CarHistoryReport />
          </div>

          <div className="max-w-4xl mx-auto">
            <CarReservation carName="Sample Toyota Corolla 2018" />
          </div>
        </div>
      </section>

      <WhatsAppButton />
      <LiveChatSupport />
      <PublicFooter tenant={tenant} />

      {/* Car Detail Modal */}
      <CarDetailModal
        car={selectedCar}
        isOpen={showCarDetailModal}
        onClose={handleCloseCarDetailModal}
        onAddToFavorites={handleAddToFavorites}
        isFavorite={selectedCar ? favorites.some(fav => fav.id === selectedCar.id) : false}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={showWishlistModal}
        onClose={() => setShowWishlistModal(false)}
        favorites={favorites}
        onRemoveFromFavorites={(carId) => {
          setFavorites(prev => prev.filter(fav => fav.id !== carId));
        }}
        onCarClick={handleCarClick}
      />
    </div>
  );
}