// Mock buyer portal data
export function getBuyerPortalData() {
  return {
    orders: [
      { id: 'ORD001', car: 'Toyota Hilux', status: 'Processing', amount: 18000 },
      { id: 'ORD002', car: 'Mazda CX-5', status: 'Shipped', amount: 22000 },
    ],
    documents: [
      { name: 'ID Card.pdf', status: 'Verified' },
      { name: 'Proof of Address.pdf', status: 'Pending' },
    ],
    chat: [
      { from: 'Agent', message: 'Your order is being processed.' },
      { from: 'You', message: 'Thank you!' },
    ],
    payments: [
      { orderId: 'ORD001', status: 'Paid', amount: 18000 },
      { orderId: 'ORD002', status: 'Pending', amount: 22000 },
    ],
  };
}
