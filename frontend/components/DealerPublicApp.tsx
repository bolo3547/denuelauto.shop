// components/DealerPublicApp.tsx
import React, { useState } from 'react';
import DealerLayout from './DealerLayout';
import DealerHomePage from './DealerHomePage';
import StockPage from './StockPage';
import CarDetailPage from './CarDetailPage';
import FavoritesPage from './FavoritesPage';
import HowToBuyPage from './HowToBuyPage';
import ContactPage from './ContactPage';
import { TenantTheme } from '../types/dealer';

interface DealerPublicAppProps {
  tenantTheme: TenantTheme;
  initialRoute?: string;
}

export default function DealerPublicApp({ tenantTheme, initialRoute = '/' }: DealerPublicAppProps) {
  const [currentRoute, setCurrentRoute] = useState(initialRoute);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    // In a real app, this would update the URL
  };

  const renderPage = () => {
    switch (currentRoute) {
      case '/':
        return <DealerHomePage tenantTheme={tenantTheme} navigate={navigate} />;
      case '/stock':
        return <StockPage tenantTheme={tenantTheme} navigate={navigate} />;
      case '/favorites':
        return <FavoritesPage tenantTheme={tenantTheme} navigate={navigate} />;
      case '/how-to-buy':
        return <HowToBuyPage tenantTheme={tenantTheme} />;
      case '/contact':
        return <ContactPage tenantTheme={tenantTheme} />;
      default:
        if (currentRoute.startsWith('/car/')) {
          const carId = currentRoute.split('/car/')[1];
          return <CarDetailPage carId={carId} tenantTheme={tenantTheme} navigate={navigate} />;
        }
        return <DealerHomePage tenantTheme={tenantTheme} navigate={navigate} />;
    }
  };

  return (
    <DealerLayout tenantTheme={tenantTheme} currentPage={currentRoute}>
      {renderPage()}
    </DealerLayout>
  );
}