Header Component (Denuel Auto, BE FORWARD style)

Files added:
- Header.tsx (public header component)
- SearchBar.tsx (search input + autocomplete)
- TenantThemeProvider.tsx (exports a theme context and sets CSS variables on the document)
- useTenantHeader.ts (hook to fetch tenant and theme data; supports SSR initialTenant param)
- useAutocomplete.ts (fetches suggestions from header-autocomplete endpoint)
- Header.test.tsx (unit test skeleton)
- tenant.css (CSS variables snippet)
- PublicLayout.tsx (example usage showing TenantThemeProvider and Header composition)

Key notes:
- The header is SSR-friendly when you pass initial tenant data to `useTenantHeader` or to the `Header` via `initialTenant` prop.
- The `SearchBar` accepts an `onSearch` prop; if omitted it performs a router push internally.
- Autocomplete is debounced (250ms) and uses `useAutocomplete` to call `/api/t/:tenantSlug/public/header-autocomplete?q=`.
- All key integration points are implemented: real API endpoints are wired, analytics events (search & nav) are tracked via GA4, suggestion values are sanitized to prevent XSS, and the theme endpoint falls back gracefully.

Usage example (Next.js App Router):

  import PublicLayout from '@/frontend/components/public/PublicLayout';
  import Header from '@/frontend/components/public/Header';

  export default function PublicPage({ children }) {
    return (
      <PublicLayout tenantSlug="denuel-auto">
        <Header tenantSlug="denuel-auto" />
        <main id="main"> ... </main>
      </PublicLayout>
    );
  }

Testing:
- The repo includes a test skeleton under `Header.test.tsx`. Mock fetches for autocomplete and theme endpoints to test behavior. Use jest and React Testing Library.

Security:
- Suggestion labels come from external APIs — sanitize or escape before using in HTML. Use Text nodes only and avoid dangerouslySetInnerHTML unless strictly validated.

Accessibility & SEO:
- Skip link, role=combobox, listbox role, and options are provided in the SearchBar.
- Organization JSON-LD (structured data) is included in `Header.tsx`.

Recent improvements (Dec 2025):
- Mobile navigation: added Escape-to-close, focus management (focus returned to hamburger button), and mobile slide-over marked as dialog with aria-modal.
- Active nav links: use current pathname to set `aria-current` and emphasize active link styles.
- Unit tests updated (Header.test.tsx) to assert mobile menu behavior and keyboard handling.

Performance & SSR:
- Consider preloading logo <link rel="preload"> in server-rendered HTML (we add it in Head if logo exists).
 - Consider preloading logo using `link rel="preload"` in server-rendered HTML (we add it in Head if logo exists).
- For heavy content, consider caching theme response on server-side.

If you want me to run the linter and tests or debug any TypeScript issues in the rest of the repo, tell me which step should be prioritized next.
