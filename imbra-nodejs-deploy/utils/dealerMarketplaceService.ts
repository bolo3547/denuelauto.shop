// Mock dealer marketplace data
export type Listing = { id: string; car: string; quantity: number; price: number };
export type Auction = { id: string; car: string; currentBid: number; ends: string };
export type DealerMarketplaceData = { listings: Listing[]; auctions: Auction[] };

export function getDealerMarketplaceData(): DealerMarketplaceData {
  return {
    listings: [
      { id: 'DLR001', car: 'Toyota Land Cruiser', quantity: 5, price: 45000 },
      { id: 'DLR002', car: 'Nissan Navara', quantity: 10, price: 32000 },
    ],
    auctions: [
      { id: 'AUC001', car: 'Ford Ranger', currentBid: 28000, ends: '2025-12-01' },
      { id: 'AUC002', car: 'Isuzu D-Max', currentBid: 25000, ends: '2025-12-03' },
    ],
  };
}
