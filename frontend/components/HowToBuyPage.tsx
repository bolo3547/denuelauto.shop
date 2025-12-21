// components/HowToBuyPage.tsx
import React from 'react';
import { Search, Eye, MessageCircle, FileText, Truck, CreditCard, CheckCircle } from 'lucide-react';
import { TenantTheme } from '../types/dealer';

interface HowToBuyPageProps {
  tenantTheme: TenantTheme;
}

export default function HowToBuyPage({ tenantTheme }: HowToBuyPageProps) {
  function stepDescriptionForTone(stepKey: string, tone: string) {
    const d: Record<string, any> = {
      browse: {
        formal: 'Explore our curated inventory at your convenience and identify a vehicle that meets your requirements.',
        professional: 'Explore our inventory and find the perfect vehicle for your needs.',
        friendly: 'Have a look around and find a car you love — we’ll help with the rest!'
      },
      details: {
        formal: 'Examine the comprehensive specifications, photographic evidence, and relevant pricing details provided.',
        professional: 'Check detailed specifications, photos, and pricing information.',
        friendly: 'Peek at the photos and specs — we’ll walk you through anything you want to know.'
      },
      inquiry: {
        formal: 'Initiate formal correspondence via WhatsApp, email, or telephone to request clarification and negotiate terms.',
        professional: 'Contact us via WhatsApp, email, or phone to ask questions and negotiate.',
        friendly: 'Drop us a quick message on WhatsApp or email — our friendly team will reply fast!'
      },
      docs: {
        formal: 'Complete the requisite documentation and undergo the stipulated vehicle inspection and validation.',
        professional: 'Complete necessary paperwork and vehicle inspection.',
        friendly: 'We’ll handle paperwork together — simple forms to make sure everything is legit.'
      },
      payment: {
        formal: 'Remit secure payment through our designated channels and complete the transaction.',
        professional: 'Secure payment processing and transfer arrangements.',
        friendly: 'Pay securely online or by bank transfer — we’ll guide you all the way.'
      },
      delivery: {
        formal: 'Arrangements for shipment and delivery will be managed in accordance with your instructions.',
        professional: 'Vehicle preparation and delivery to your location.',
        friendly: 'We’ll ship your car to you — relaxed and hassle-free delivery!' 
      }
    };
    return d[stepKey]?.[tone] || d[stepKey]?.professional;
  }

  const tone = (tenantTheme?.brandTone || 'professional') as 'formal' | 'professional' | 'friendly';
  const steps = [
      {
      icon: Search,
      title: 'Browse & Select',
      description: stepDescriptionForTone('browse', tone),
    },
    {
      icon: Eye,
      title: 'View Details',
      description: stepDescriptionForTone('details', tone),
    },
    {
      icon: MessageCircle,
      title: 'Make Inquiry',
      description: stepDescriptionForTone('inquiry', tone),
    },
    {
      icon: FileText,
      title: 'Documentation',
      description: stepDescriptionForTone('docs', tone),
    },
    {
      icon: CreditCard,
      title: 'Payment',
      description: stepDescriptionForTone('payment', tone),
    },
    {
      icon: Truck,
      title: 'Delivery',
      description: stepDescriptionForTone('delivery', tone),
    },
  ];

  if (tenantTheme.export.enabled) {
    steps.splice(4, 0, {
      icon: CheckCircle,
      title: 'Export Clearance',
      description: 'Handle customs clearance and export documentation.',
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">How to Buy</h1>
        <p className="text-xl text-gray-600">Your complete guide to purchasing a vehicle from us</p>
      </div>

      <div className="space-y-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <step.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-grow">
              <div className="flex items-center mb-2">
                <span className="text-2xl font-bold text-gray-300 mr-4">{String(index + 1).padStart(2, '0')}</span>
                <h2 className="text-xl font-semibold">{step.title}</h2>
              </div>
              <p className="text-gray-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

        <div className="mt-12 bg-blue-50 rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
        <p className="text-gray-600 mb-6">
          Our team is here to assist you throughout the entire process. Don't hesitate to reach out with any questions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`https://wa.me/${tenantTheme.contactInfo.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {tone === 'formal' ? 'Contact Sales' : tone === 'friendly' ? 'WhatsApp Us' : 'WhatsApp Us'}
            </a>
            <a
              href={`tel:${tenantTheme.contactInfo.phone}`}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              {tone === 'formal' ? 'Call Sales' : tone === 'friendly' ? 'Call Now' : 'Call Now'}
            </a>
            <a
              href={`mailto:${tenantTheme.contactInfo.email}`}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition flex items-center justify-center"
            >
              <FileText className="w-5 h-5 mr-2" />
              {tone === 'formal' ? 'Email Sales' : tone === 'friendly' ? 'Email Us' : 'Email Us'}
            </a>
        </div>
      </div>

      {tenantTheme.export.enabled && (
        <div className="mt-8 bg-yellow-50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Export Services</h2>
          <p className="text-gray-600 mb-4">
            We specialize in international vehicle exports. Our export services include:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Customs clearance and documentation</li>
            <li>Shipping arrangements worldwide</li>
            <li>Export certification and compliance</li>
            <li>Door-to-door delivery options</li>
            <li>Import duty guidance</li>
          </ul>
        </div>
      )}
    </div>
  );
}