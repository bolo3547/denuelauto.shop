import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

interface Tenant {
  name: string;
  logo?: string;
}

interface PublicFooterProps {
  tenant?: Tenant;
}

const PublicFooter: React.FC<PublicFooterProps> = ({ tenant }) => {
  const tenantName = tenant?.name || 'Car Dealership';
  const tenantLogo = tenant?.logo || '/api/placeholder/140/40';

  return (
    <footer className="bg-gray-900 text-gray-200 py-16">
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-5 mb-4">
            <img src={tenantLogo} alt={tenantName} className="h-10 object-contain" />
            <h4 className="text-lg font-semibold text-gray-200">{tenantName}</h4>
          </div>
          <p className="text-sm text-gray-400">We specialize in exporting quality used cars from Japan to customers across the world. Trust, value, and transparency are the core of our services.</p>
          <div className="mt-4 text-sm text-gray-400 flex gap-4">
            <a href="#" aria-label="Facebook" className="hover:text-white"><FaFacebook size={20} /></a>
            <a href="#" aria-label="Twitter" className="hover:text-white"><FaTwitter size={20} /></a>
            <a href="#" aria-label="Instagram" className="hover:text-white"><FaInstagram size={20} /></a>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>Browse Cars</li>
            <li>Today Deals</li>
            <li>Shipping Info</li>
            <li>Help Center</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Contact</h3>
          <p className="text-sm text-gray-400">top@beforward.jp • +81 42 440 3440</p>
          <div className="mt-4 text-sm text-gray-400">
            <div>Popular Ports: Yokohama • Kobe • Nagoya</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-10 text-xs text-gray-500 text-center">© {new Date().getFullYear()} {tenantName}. All rights reserved.</div>
    </footer>
  );
};

export default PublicFooter;
