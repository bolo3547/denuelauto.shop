import { useRouter } from 'next/navigation';
import { trackEvent } from '../../utils/analytics';

const features = [
  { icon: '📸', title: 'Showcase cars that sell', text: 'High-converting listings with photo galleries and detailed specs.', link: '/admin/cars' },
  { icon: '📨', title: 'Convert leads to buyers', text: 'Auto-generate proformas and follow up with integrated messaging.', link: '/admin/print' },
  { icon: '💳', title: 'Simplify payments', text: 'Record and reconcile bank & mobile money payments in one place.', link: '/admin/print' },
  { icon: '🤝', title: 'Empower agents', text: 'Agent portals with leads, commissions and performance tracking.', link: '/t/sample-dealer/agent/dashboard' },
  { icon: '🚢', title: 'Ship with confidence', text: 'FOB/CIF calculations, port selection and shipment tracking.', link: '/t/sample-dealer/export/kenya' },
  { icon: '🧾', title: 'Buyer self-service', text: 'Buyers view proformas, upload payment proof, and track delivery.', link: '/dealer-template' },
];

export default function FeaturesGrid() {
  const router = useRouter();

  return (
    <section id="features" className="py-16 animate-fade-in">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-[#0F3D91] mb-2">What Denuel helps you do</h2>
        <p className="mt-2 text-lg text-gray-700">An all-in-one toolkit focused on faster sales, fewer errors, and simpler exports.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {features.map((f) => (
            <button
              key={f.title}
              type="button"
              aria-label={`Open ${f.title}`}
              className="group p-6 rounded-2xl border-2 border-gray-100 bg-white shadow-md hover:shadow-xl transition-all duration-200 hover:border-[#FFD700] hover:scale-105 cursor-pointer text-left"
              onClick={() => { trackEvent('feature_click', { feature: f.title }); router.push(f.link); }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F7F8FC] to-[#FFD700]/20 flex items-center justify-center text-2xl group-hover:bg-[#FFD700]/30 transition-all duration-200">{f.icon}</div>
                <div>
                  <div className="font-bold text-base text-[#0F3D91] mb-1">{f.title}</div>
                  <p className="text-sm text-gray-700 mt-1">{f.text}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}