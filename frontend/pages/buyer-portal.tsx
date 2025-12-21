import React, { useState, useEffect } from 'react';
import { makeApiUrl } from '@/lib/config/api';
import {
  FaUser,
  FaHeart,
  FaSearch,
  FaFilter,
  FaStar,
  FaEye,
  FaWhatsapp,
  FaShare,
  FaShoppingCart,
  FaCog,
  FaBell,
  FaChevronRight,
  FaShieldAlt,
  FaCreditCard,
} from 'react-icons/fa';
import type { Buyer } from '@/types/buyer';

interface Car {
  id: string;
  stockNo: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  location?: string;
  images?: string[];
  isFavorited?: boolean;
  dealer: {
    name: string;
    rating: number;
    reviewCount: number;
  };
}

interface Favorite {
  id: string;
  carId: string;
  car: Car;
  notes?: string;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  car: Car;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  estimatedDelivery?: string;
}

interface BuyerFilters {
  make: string;
  priceMin: string;
  priceMax: string;
  yearMin: string;
  yearMax: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
}

export default function BuyerPortal() {
  const [activeTab, setActiveTab] = useState('browse');
  const [cars, setCars] = useState<Car[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [buyerProfile, setBuyerProfile] = useState<Buyer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<BuyerFilters>({
    make: '',
    priceMin: '',
    priceMax: '',
    yearMin: '',
    yearMax: '',
    fuelType: '',
    transmission: '',
    bodyType: ''
  });

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock buyer profile
    const mockBuyer: Buyer = {
      id: 'buyer1',
      email: 'john.customer@example.com',
      firstName: 'John',
      lastName: 'Customer',
      phone: '+260977123456',
      country: 'Zambia',
      city: 'Lusaka',
      budget: 25000,
      currency: 'USD',
      preferredMakes: ['Toyota', 'Honda', 'Mazda'],
      isActive: true
    };

    // Mock cars data
    const mockCars: Car[] = [
      {
        id: '1',
        stockNo: 'TC001',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        price: 18500,
        mileage: 45000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        bodyType: 'Sedan',
        color: 'White',
        location: 'Japan',
        images: [makeApiUrl('/api/placeholder/400/300')],
        isFavorited: true,
        dealer: {
          name: 'Premium Auto Japan',
          rating: 4.8,
          reviewCount: 234
        }
      },
      {
        id: '2',
        stockNo: 'HN002',
        make: 'Honda',
        model: 'CR-V',
        year: 2019,
        price: 22000,
        mileage: 38000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        bodyType: 'SUV',
        color: 'Black',
        location: 'Japan',
        images: [makeApiUrl('/api/placeholder/400/300')],
        isFavorited: false,
        dealer: {
          name: 'Elite Motors',
          rating: 4.6,
          reviewCount: 156
        }
      },
      {
        id: '3',
        stockNo: 'NX003',
        make: 'Lexus',
        model: 'NX300',
        year: 2021,
        price: 35000,
        mileage: 22000,
        fuelType: 'Hybrid',
        transmission: 'CVT',
        bodyType: 'SUV',
        color: 'Silver',
        location: 'Japan',
        images: [makeApiUrl('/api/placeholder/400/300')],
        isFavorited: true,
        dealer: {
          name: 'Luxury Car Centre',
          rating: 4.9,
          reviewCount: 89
        }
      }
    ];

    // Mock favorites
    const mockFavorites: Favorite[] = mockCars
      .filter(car => car.isFavorited)
      .map(car => ({
        id: `fav_${car.id}`,
        carId: car.id,
        car: car,
        notes: 'Interested in this model',
        createdAt: '2024-12-01'
      }));

    // Mock orders
    const mockOrders: Order[] = [
      {
        id: 'order1',
        orderNumber: 'ORD-001',
        car: mockCars[0],
        totalAmount: 21500, // Including shipping
        status: 'PROCESSING',
        createdAt: '2024-11-15',
        estimatedDelivery: '2024-12-20'
      }
    ];

    setBuyerProfile(mockBuyer);
    setCars(mockCars);
    setFavorites(mockFavorites);
    setOrders(mockOrders);
  };

  const handleToggleFavorite = (carId: string) => {
    setCars(prev => prev.map(car => 
      car.id === carId 
        ? { ...car, isFavorited: !car.isFavorited }
        : car
    ));
    
    setFavorites(prev => {
      const car = cars.find(c => c.id === carId);
      if (!car) return prev;
      
      const existingFav = prev.find(fav => fav.carId === carId);
      if (existingFav) {
        // Remove from favorites
        return prev.filter(fav => fav.carId !== carId);
      } else {
        // Add to favorites
        return [...prev, {
          id: `fav_${carId}`,
          carId: carId,
          car: car,
          createdAt: new Date().toISOString()
        }];
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const filteredCars = cars.filter(car => {
    const matchesSearch = !searchQuery || 
      car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.stockNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMake = !filters.make || car.make === filters.make;
    const matchesPriceMin = !filters.priceMin || car.price >= parseFloat(filters.priceMin);
    const matchesPriceMax = !filters.priceMax || car.price <= parseFloat(filters.priceMax);
    const matchesYearMin = !filters.yearMin || car.year >= parseInt(filters.yearMin);
    const matchesYearMax = !filters.yearMax || car.year <= parseInt(filters.yearMax);
    const matchesFuelType = !filters.fuelType || car.fuelType === filters.fuelType;
    const matchesTransmission = !filters.transmission || car.transmission === filters.transmission;
    const matchesBodyType = !filters.bodyType || car.bodyType === filters.bodyType;

    return matchesSearch && matchesMake && matchesPriceMin && matchesPriceMax && 
           matchesYearMin && matchesYearMax && matchesFuelType && 
           matchesTransmission && matchesBodyType;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">AutoHub</h1>
              <nav className="hidden md:flex gap-6">
                <button
                  onClick={() => setActiveTab('browse')}
                  className={`text-sm font-medium ${
                    activeTab === 'browse' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Browse Cars
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`text-sm font-medium ${
                    activeTab === 'favorites' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Favorites ({favorites.length})
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`text-sm font-medium ${
                    activeTab === 'orders' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My Orders ({orders.length})
                </button>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              {buyerProfile && (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium">{buyerProfile.firstName} {buyerProfile.lastName}</p>
                    <p className="text-xs text-gray-600">Budget: {formatCurrency(buyerProfile.budget || 0)}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
                    aria-label="View Profile"
                    title="View Profile"
                  >
                    <FaUser className="text-blue-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'browse' && (
          <BrowseCarsTab
            cars={filteredCars}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            setFilters={setFilters}
            onToggleFavorite={handleToggleFavorite}
            formatCurrency={formatCurrency}
          />
        )}
        
        {activeTab === 'favorites' && (
          <FavoritesTab
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            formatCurrency={formatCurrency}
          />
        )}
        
        {activeTab === 'orders' && (
          <OrdersTab
            orders={orders}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        )}
        
        {activeTab === 'profile' && buyerProfile && (
          <ProfileTab
            buyer={buyerProfile}
            setBuyer={setBuyerProfile}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  );
}

// Browse Cars Tab Component
interface BrowseCarsTabProps {
  cars: Car[];
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  filters: BuyerFilters;
  setFilters: React.Dispatch<React.SetStateAction<BuyerFilters>>;
  onToggleFavorite: (carId: string) => void;
  formatCurrency: (amount: number) => string;
}

function BrowseCarsTab({
  cars,
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  onToggleFavorite,
  formatCurrency,
}: BrowseCarsTabProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by make, model, or stock number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <FaFilter /> Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-6 border-t">
            <select
              value={filters.make}
              onChange={(e) => setFilters((prev: BuyerFilters) => ({ ...prev, make: e.target.value }))}
              className="border rounded-lg px-3 py-2"
              aria-label="Filter by car make"
              title="Filter by car make"
            >
              <option value="">All Makes</option>
              <option value="Toyota">Toyota</option>
              <option value="Honda">Honda</option>
              <option value="Mazda">Mazda</option>
              <option value="Lexus">Lexus</option>
              <option value="BMW">BMW</option>
            </select>

            <input
              type="number"
              placeholder="Min Price"
              value={filters.priceMin}
              onChange={(e) => setFilters((prev: BuyerFilters) => ({ ...prev, priceMin: e.target.value }))}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="number"
              placeholder="Max Price"
              value={filters.priceMax}
              onChange={(e) => setFilters((prev: BuyerFilters) => ({ ...prev, priceMax: e.target.value }))}
              className="border rounded-lg px-3 py-2"
            />

            <select
              value={filters.fuelType}
              onChange={(e) => setFilters((prev: BuyerFilters) => ({ ...prev, fuelType: e.target.value }))}
              className="border rounded-lg px-3 py-2"
              aria-label="Filter by fuel type"
              title="Filter by fuel type"
            >
              <option value="">All Fuel Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
            </select>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing {cars.length} car{cars.length !== 1 ? 's' : ''}
          {searchQuery && ` for "${searchQuery}"`}
        </p>
        
        <select
          className="border rounded-lg px-3 py-2"
          aria-label="Sort cars"
          title="Sort cars"
        >
          <option>Sort by: Price Low to High</option>
          <option>Sort by: Price High to Low</option>
          <option>Sort by: Year Newest</option>
          <option>Sort by: Year Oldest</option>
          <option>Sort by: Mileage Low to High</option>
        </select>
      </div>

      {/* Car Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cars.map((car: Car) => (
          <CarCard
            key={car.id}
            car={car}
            onToggleFavorite={onToggleFavorite}
            formatCurrency={formatCurrency}
          />
        ))}
      </div>
    </div>
  );
}

// Car Card Component
interface CarCardProps {
  car: Car;
  onToggleFavorite: (carId: string) => void;
  formatCurrency: (amount: number) => string;
}
function CarCard({ car, onToggleFavorite, formatCurrency }: CarCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Car Image */}
      <div className="relative">
        <img
          src={car.images?.[0] || makeApiUrl('/api/placeholder/300/200')}
          alt={`${car.make} ${car.model}`}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={() => onToggleFavorite(car.id)}
          className={`absolute top-3 right-3 p-2 rounded-full ${
            car.isFavorited 
              ? 'bg-red-100 text-red-600' 
              : 'bg-white text-gray-400 hover:text-red-600'
          }`}
          aria-label={car.isFavorited ? "Remove from favorites" : "Add to favorites"}
          title={car.isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <FaHeart className={car.isFavorited ? 'fill-current' : ''} />
        </button>
        
        <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
          {car.stockNo}
        </div>
      </div>

      {/* Car Details */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">
          {car.make} {car.model} {car.year}
        </h3>
        
        <div className="text-2xl font-bold text-blue-600 mb-3">
          {formatCurrency(car.price)}
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex justify-between">
            <span>Mileage:</span>
            <span>{car.mileage?.toLocaleString()} km</span>
          </div>
          <div className="flex justify-between">
            <span>Fuel:</span>
            <span>{car.fuelType}</span>
          </div>
          <div className="flex justify-between">
            <span>Transmission:</span>
            <span>{car.transmission}</span>
          </div>
          <div className="flex justify-between">
            <span>Location:</span>
            <span>{car.location}</span>
          </div>
        </div>

        {/* Dealer Info */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <FaStar className="text-yellow-400" />
            <span className="text-sm font-medium">{car.dealer.rating}</span>
          </div>
          <span className="text-sm text-gray-600">
            {car.dealer.name} ({car.dealer.reviewCount} reviews)
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
            <FaEye /> View Details
          </button>
          <button
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            aria-label="Contact via WhatsApp"
            title="Contact via WhatsApp"
          >
            <FaWhatsapp />
          </button>
          <button
            className="bg-gray-100 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-200"
            aria-label="Share"
            title="Share"
          >
            <FaShare />
          </button>
        </div>
      </div>
    </div>
  );
}

// Favorites Tab Component
interface FavoritesTabProps {
  favorites: Favorite[];
  onToggleFavorite: (carId: string) => void;
  formatCurrency: (amount: number) => string;
}
function FavoritesTab({ favorites, onToggleFavorite, formatCurrency }: FavoritesTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">My Favorites ({favorites.length})</h2>
        
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <FaHeart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600">Start browsing cars and add your favorites!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite: Favorite) => (
              <CarCard
                key={favorite.id}
                car={favorite.car}
                onToggleFavorite={onToggleFavorite}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Orders Tab Component
interface OrdersTabProps {
  orders: Order[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}
function OrdersTab({ orders, formatCurrency, formatDate }: OrdersTabProps) {
  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'PROCESSING': 'bg-purple-100 text-purple-800',
      'SHIPPED': 'bg-indigo-100 text-indigo-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">My Orders ({orders.length})</h2>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <FaShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600">Browse our inventory and place your first order!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: Order) => (
              <div key={order.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                    <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Vehicle Details</h4>
                    <p className="text-lg font-semibold">
                      {order.car.make} {order.car.model} {order.car.year}
                    </p>
                    <p className="text-gray-600">Stock: {order.car.stockNo}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Order Summary</h4>
                    <p className="text-lg font-semibold text-green-600">
                      Total: {formatCurrency(order.totalAmount)}
                    </p>
                    {order.estimatedDelivery && (
                      <p className="text-gray-600">
                        Est. Delivery: {formatDate(order.estimatedDelivery)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <FaEye /> View Details
                  </button>
                  {order.status === 'PENDING' && (
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({
  buyer,
  setBuyer,
  formatCurrency,
}: {
  buyer: Buyer;
  setBuyer: React.Dispatch<React.SetStateAction<Buyer | null>>;
  formatCurrency: (amount: number) => string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Buyer>(buyer);

  const handleSave = () => {
    setBuyer(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(buyer);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Profile Information</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaCog /> {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            {isEditing ? (
              <input
                id="firstName"
                type="text"
                value={editData.firstName}
                onChange={(e) => setEditData((prev: Buyer) => ({ ...prev, firstName: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-gray-900">{buyer.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            {isEditing ? (
              <input
                id="lastName"
                type="text"
                value={editData.lastName}
                onChange={(e) => setEditData((prev: Buyer) => ({ ...prev, lastName: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-gray-900">{buyer.lastName}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p id="email" className="text-gray-900">{buyer.email}</p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            {isEditing ? (
              <input
                id="phone"
                type="text"
                value={editData.phone || ''}
                onChange={(e) => setEditData((prev: Buyer) => ({ ...prev, phone: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-gray-900">{buyer.phone}</p>
            )}
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            {isEditing ? (
              <select
                id="country"
                value={editData.country || ''}
                onChange={(e) => setEditData((prev: Buyer) => ({ ...prev, country: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="Zambia">Zambia</option>
                <option value="Kenya">Kenya</option>
                <option value="Uganda">Uganda</option>
                <option value="Tanzania">Tanzania</option>
              </select>
            ) : (
              <p className="text-gray-900">{buyer.country}</p>
            )}
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
            {isEditing ? (
              <input
                id="budget"
                type="number"
                value={editData.budget || ''}
                onChange={(e) => setEditData((prev: Buyer) => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                className="w-full border rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-gray-900">{formatCurrency(buyer.budget || 0)}</p>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaBell className="text-blue-600" />
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <p className="text-gray-600 mb-4">Manage your notification preferences</p>
          <button className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            Configure <FaChevronRight />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaShieldAlt className="text-green-600" />
            <h3 className="font-semibold">Security</h3>
          </div>
          <p className="text-gray-600 mb-4">Update password and security settings</p>
          <button className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            Manage <FaChevronRight />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <FaCreditCard className="text-purple-600" />
            <h3 className="font-semibold">Payment Methods</h3>
          </div>
          <p className="text-gray-600 mb-4">Manage your payment options</p>
          <button className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            View <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
