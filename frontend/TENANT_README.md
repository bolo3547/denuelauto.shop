# Denuel Tenant Deployed Demo (Tenant Site)

This folder contains a tenant-facing mock website template used by Denuel to host dealer websites under `/t/:slug`.

How to use locally
1. Run the frontend dev server at the workspace root's `New folder\frontend` folder

```powershell
cd "New folder\frontend"
npm install
npm run dev
```

2. Set the backend API URL and run the frontend + backend dev servers:

```powershell
# Start backend (from New folder)
cd "New folder"
npm install
npm run dev

# In another terminal start frontend
cd "New folder\frontend"
# Create a file .env.local and add the API URL
setx NEXT_PUBLIC_API_URL "http://localhost:4000" # (PowerShell)
npm install
npm run dev
```

3. Open the demo tenant site in your browser:
- `http://localhost:3000/t/sample-dealer`
- `http://localhost:3000/t/sample-dealer/public/cars` to view stock

Notes
- The UI uses mock data in `frontend/lib/tenantMock.tsx` and includes pages for:
  - `Home` -> `/t/:slug`
  - `Stock` -> `/t/:slug/public/cars`
  - `Car detail` -> `/t/:slug/public/cars/:idOrStock`
  - `Favorites` -> `/t/:slug/favorites` (stored in localStorage)
  - `Compare` -> `/t/:slug/compare` (stored in localStorage)
  - `How to buy` -> `/t/:slug/how-to-buy`
  - `Contact` -> `/t/:slug/contact`

Design
- Tenant theme object is defined in `frontend/lib/tenantMock.tsx` (logo, colors, phone, whatsapp, etc.) and is used across `DealerHeader` and `DealerFooter`.

Next steps
- Hook up real APIs for data (cars, proformas) and replace the mock data with data fetched by `slug` from the backend.
- Add more filter options (transmission, fuel, price range), sorting, and paging.
- Add server side rendering for SEO for pages like `/t/:slug`, `/t/:slug/public/cars/:id`.
