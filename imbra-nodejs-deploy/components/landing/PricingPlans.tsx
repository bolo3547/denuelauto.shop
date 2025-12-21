import { useRouter } from 'next/navigation';
import { useLoading } from '../../context/LoadingContext';
import { trackEvent } from '../../utils/analytics';

export default function PricingPlans() {
  const router = useRouter();
  const { setLoading } = useLoading();

  const startSignup = async (plan: string) => {
    trackEvent('pricing_cta_click', { plan });
    setLoading(true);
    try {
      await router.push('/register');
    } catch (e) {
      setLoading(false);
    }
  };

  const onCardKeyDown = (e: React.KeyboardEvent, plan: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      startSignup(plan);
    }
  };

  return (
    <section role="region" aria-labelledby="pricing-heading" className="max-w-5xl mx-auto px-6 py-16 animate-fade-in">
      <h2 id="pricing-heading" className="text-2xl font-bold text-[#0F3D91] mb-8 text-center">Choose Your Plan</h2>
      <div className="grid gap-8 md:grid-cols-3">
        {/* Starter Dealer */}
        <div className="group bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:border-[#FFD700] hover:scale-105 transition-all duration-200 cursor-pointer">
          <div className="font-bold text-lg text-[#0F3D91] mb-2">Starter Dealer</div>
          <div id="starter-desc" className="text-sm text-gray-700 mb-2">For small yards and solo dealers.</div>
          <div className="text-xl font-bold text-[#FFD700] mb-2">From K1,200 / month</div>
          <div className="text-xs text-gray-500 mb-3">Up to ~50 cars in stock, 1 branch, No export module by default</div>
          <ul className="text-sm space-y-1 mb-2">
            <li className="flex items-center"><span className="text-green-500 mr-1">✓</span>Inventory & photos</li>
            <li className="flex items-center"><span className="text-green-500 mr-1">✓</span>Leads & proformas</li>
            <li className="flex items-center"><span className="text-green-500 mr-1">✓</span>Basic reporting</li>
          </ul>
          <button aria-label="Get started with Starter Dealer" aria-describedby="starter-desc" onClick={() => startSignup('Starter Dealer')} className="w-full mt-4 px-4 py-2 bg-[#0F3D91] text-white rounded-lg hover:bg-[#FFD700] hover:text-[#0F3D91] transition-all duration-200">Get Started</button>
        </div>
        {/* Growth Dealer - recommended */}
        <div className="group bg-white rounded-2xl shadow-2xl p-8 border-2 border-[#FFD700] transform scale-105">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-lg text-[#0F3D91]">Growth Dealer</div>
            <div className="text-sm bg-[#0F3D91] text-white px-3 py-1 rounded-full">Most popular</div>
          </div>
          <div id="growth-desc" className="text-sm text-gray-700 mb-2">For growing and multi-branch dealerships.</div>
          <div className="text-xl font-bold text-[#FFD700] mb-2">From K2,500 / month</div>
          <div className="text-xs text-gray-500 mb-3">Up to ~150 cars in stock, Multiple branches, Optional exporter module</div>
          <ul className="text-sm space-y-1 mb-2">
            <li className="flex items-center"><span className="text-green-500 mr-1">✓</span>Everything in Starter</li>
            <li className="flex items-center"><span className="text-green-500 mr-1">✓</span>Multi-user support</li>
            <li className="flex items-center"><span className="text-green-500 mr-1">✓</span>Agents & commissions</li>
            <li className="flex items-center"><span className="text-green-500 mr-1">✓</span>Buyer portal</li>
          </ul>
          <button aria-label="Start free trial for Growth Dealer" aria-describedby="growth-desc" onClick={() => startSignup('Growth Dealer')} className="w-full mt-4 px-4 py-2 bg-[#0F3D91] text-white rounded-lg hover:bg-[#0B2A6A] transition-all duration-200">Start free trial</button>
        </div>
        {/* Export Dealer */}
        <div className="group bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100 hover:border-[#FFD700] hover:scale-105 transition-all duration-200 cursor-pointer">
          <div className="font-bold text-lg text-[#0F3D91] mb-2">Export Dealer</div>
          <div id="export-desc" className="text-sm text-gray-700 mb-2">For full exporters using ports.</div>
          <div className="text-xl font-bold text-[#FFD700] mb-2">From K4,000 / month</div>
          <div className="text-xs text-gray-500 mb-3">Exporter YES, Ports like Dar / Durban / Walvis</div>
          <ul className="text-sm space-y-1 mb-2">
            <li className="flex items-center"><span className="text-green-500 mr-1">✓</span>Everything in Growth</li>
            <li className="flex items-center"><span className="text-green-500 mr-1">✓</span>Export & shipping (FOB/CIF)</li>
            <li className="flex items-center"><span className="text-green-500 mr-1">✓</span>Ports & CIF rules</li>
            <li className="flex items-center"><span className="text-green-500 mr-1">✓</span>Shipping documents (PI, Invoice, Packing List)</li>
          </ul>
          <button aria-label="Get started with Export Dealer" aria-describedby="export-desc" onClick={() => startSignup('Export Dealer')} className="w-full mt-4 px-4 py-2 bg-[#0F3D91] text-white rounded-lg hover:bg-[#FFD700] hover:text-[#0F3D91] transition-all duration-200">Get Started</button>
        </div>
      </div>
    </section>
  );
}