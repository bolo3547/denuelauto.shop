"use client";
import React, { useState } from 'react';
import { getDealerMarketplaceData, DealerMarketplaceData, Listing, Auction } from '../utils/dealerMarketplaceService';

export default function DealerMarketplace() {
  const data: DealerMarketplaceData = getDealerMarketplaceData();
  const [bulkOrderQty, setBulkOrderQty] = useState<Record<string, number>>({});
  const [auctionBids, setAuctionBids] = useState<Record<string, number>>({});

  function handleBulkOrder(id: string, maxQty: number) {
    const qty = Number(bulkOrderQty[id] || 1);
    if (qty > 0 && qty <= maxQty) {
      alert(`Bulk order placed: ${qty} units for listing ${id}`);
    }
  }

  function handleAuctionBid(id: string, currentBid: number) {
    const bid = Number(auctionBids[id] || currentBid + 500);
    if (bid > currentBid) {
      alert(`Bid placed: $${bid} for auction ${id}`);
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow mt-6">
      <h3 className="font-semibold mb-2">Dealer-to-Dealer Marketplace</h3>
      <div className="mb-4">
        <h4 className="font-semibold">Bulk Listings</h4>
        <ul className="list-disc ml-6">
          {data.listings.map((listing: Listing) => (
            <li key={listing.id} className="mb-2">
              {listing.car} - <span className="font-bold">{listing.quantity} units</span> @ ${listing.price} each
              <input
                type="number"
                min={1}
                max={listing.quantity}
                value={bulkOrderQty[listing.id] || 1}
                onChange={e => setBulkOrderQty({ ...bulkOrderQty, [listing.id]: Number(e.target.value) })}
                className="ml-2 border px-2 py-1 rounded w-16"
                placeholder="Order quantity"
                title="Enter the quantity to order"
              />
              <button
                onClick={() => handleBulkOrder(listing.id, listing.quantity)}
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
              >Order</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h4 className="font-semibold">Auctions</h4>
        <ul className="list-disc ml-6">
          {data.auctions.map((auction: Auction) => (
            <li key={auction.id} className="mb-2">
              {auction.car} - Current Bid: <span className="font-bold">${auction.currentBid}</span> (Ends: {auction.ends})
              <input
                type="number"
                min={auction.currentBid + 500}
                value={auctionBids[auction.id] || auction.currentBid + 500}
                onChange={e => setAuctionBids({ ...auctionBids, [auction.id]: Number(e.target.value) })}
                className="ml-2 border px-2 py-1 rounded w-20"
                placeholder="Enter your bid"
                title="Enter your bid amount"
              />
              <button
                onClick={() => handleAuctionBid(auction.id, auction.currentBid)}
                className="ml-2 px-4 py-2 bg-green-600 text-white rounded"
              >Bid</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
