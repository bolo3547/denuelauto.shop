import React from 'react';
import { Check } from 'lucide-react';

export default function FeaturesGrid(){
  const features = [
    { title: 'Reserve by USSD', text: 'Reserve with a short USSD code and secure your car instantly.' },
    { title: 'Transparent CIF', text: 'CIF costs and duty breakdowns are clear and fair.' },
    { title: 'Verified stock', text: 'We verify cars and documents before they appear on site.' },
    { title: 'Branches in Zambia', text: 'Physical branches across Lusaka and provincial centres.' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map(f => (
        <div key={f.title} className="bg-card p-6 rounded-2xl border shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-full text-primary"><Check /></div>
            <div>
              <h4 className="font-semibold">{f.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{f.text}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
