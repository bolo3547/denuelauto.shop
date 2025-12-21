export type Locale = 'en' | 'ja';

const messages: Record<Locale, Record<string, string>> = {
  en: {
    browseInventory: 'Browse Our Inventory',
    contactUs: 'Contact Us Today',
    searchPlaceholder: 'Search for Used Car',
    itemsMatch: 'items match',
    viewDetails: 'View Details',
    addToFavorites: 'Add to Favorites',
    page: 'Page'
  },
  ja: {
    browseInventory: '在庫を検索する',
    contactUs: 'お問い合わせ',
    searchPlaceholder: '中古車を検索',
    itemsMatch: '件が該当します',
    viewDetails: '詳細を見る',
    addToFavorites: 'お気に入りに追加',
    page: 'ページ'
  }
};

export function t(key: string, locale: Locale = 'en'){
  return messages[locale]?.[key] || messages['en'][key] || key;
}

export function availableLocales(): Locale[] { return ['en', 'ja']; }
