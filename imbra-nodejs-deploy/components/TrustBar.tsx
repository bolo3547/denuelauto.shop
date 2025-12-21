import React from 'react';

type TrustMetric = { label: string; value: string; tooltip?: string };
type Props = { metrics?: TrustMetric[]; logos?: string[] };

export default function TrustBar({ metrics = [], logos = [] }: Props) {
  const defaults: TrustMetric[] = [
    { label: 'Dealers onboarded', value: '1,200+' },
    { label: 'Cars listed', value: '32,000+' },
    { label: 'Avg faster sales', value: '30%' },
    { label: 'Export shipments', value: '3,400+' }
  ];
  const items = metrics.length ? metrics : defaults;
  const logoList = logos.length ? logos : ['/logos/logo1.svg', '/logos/logo2.svg', '/logos/logo3.svg' ];

  return (
    <div role="region" aria-roledescription="Trust bar" aria-label="Trust metrics and logos" className="w-full bg-white/80 backdrop-blur border-t border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col sm:flex-row gap-4 items-center justify-between text-sm">
        <div className="flex gap-6 items-center overflow-hidden">
          {items.map((m, idx) => (
            <div key={idx} className="flex flex-col items-center text-center px-3">
              <div className="text-lg font-bold text-[#0F3D91]">{m.value}</div>
              <div className="text-gray-600">{m.label}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-600 font-medium hidden sm:block">Trusted by</div>
          <div className="flex gap-4 items-center overflow-x-auto no-scrollbar py-1" aria-hidden="true">
            {logoList.map((l, i) => (
              <img key={i} src={l} alt="" aria-hidden="true" className="h-8 opacity-90 rounded-md bg-white/0 p-1" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
