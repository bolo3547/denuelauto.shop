import { useRouter } from 'next/navigation';
import NewsletterSignup from '../NewsletterSignup';

export default function FooterSection() {
  const router = useRouter();
  return (
    <>
      <section className="relative max-w-5xl mx-auto px-6 py-24 animate-fade-in overflow-hidden">
        {/* Animated SVG background */}
        <svg className="absolute left-0 top-0 w-full h-full pointer-events-none z-0" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="300" cy="120" rx="180" ry="60" fill="#FFD700" fillOpacity="0.08">
            <animate attributeName="cx" values="300;400;300" dur="8s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="900" cy="220" rx="220" ry="80" fill="#0F3D91" fillOpacity="0.07">
            <animate attributeName="cy" values="220;180;220" dur="10s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="600" cy="350" rx="120" ry="40" fill="#3B82F6" fillOpacity="0.06">
            <animate attributeName="rx" values="120;160;120" dur="7s" repeatCount="indefinite" />
          </ellipse>
          {/* Car silhouette */}
          <g opacity="0.12">
            <path d="M200 320 Q300 280 400 320 Q500 360 600 320 Q700 280 800 320" stroke="#0F3D91" strokeWidth="8" fill="none" />
            <rect x="350" y="300" width="100" height="30" rx="15" fill="#FFD700" />
            <rect x="650" y="300" width="100" height="30" rx="15" fill="#FFD700" />
          </g>
        </svg>
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-5xl md:text-6xl leading-tight font-extrabold text-black tracking-tight mb-4">One system for your car dealership and export business.</h1>
          <p className="mt-6 text-xl text-gray-700">Manage stock, leads, proformas, payments, and shipping from one dashboard — built for Zambian and African car dealers.</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <button onClick={() => router.push('/register')} className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0F3D91] to-[#FFD700] text-white px-7 py-4 text-base font-bold shadow-lg hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-[#FFD700]">Create my dealership system</button>
            <a href="https://wa.me/260971234567?text=Hi, I want to watch the demo" target="_blank" rel="noopener" className="inline-flex items-center justify-center rounded-xl border-2 border-[#0F3D91] px-7 py-4 text-base text-[#0F3D91] font-bold bg-white hover:bg-[#F7F8FC] shadow-sm transition-all duration-200 focus:ring-2 focus:ring-[#FFD700]">Watch WhatsApp demo</a>
          </div>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
        <h2 className="text-2xl font-bold text-[#0F3D91] mb-8 text-center">Contact & Support</h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
          <a href="https://wa.me/260971234567" target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-[#25D366] text-white font-bold shadow-lg hover:scale-105 transition-all duration-200">
            <img src="/whatsapp.svg" alt="WhatsApp" className="w-6 h-6" /> WhatsApp Support
          </a>
          <a href="mailto:support@denuelauto.com" className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-[#0F3D91] text-white font-bold shadow-lg hover:scale-105 transition-all duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m8 0a4 4 0 10-8 0 4 4 0 008 0zm0 0v4m0-4V8" /></svg> Email Support
          </a>
          <a href="mailto:support@denuelauto.com" className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-[#FFD700] text-[#0F3D91] font-bold shadow-lg hover:scale-105 transition-all duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-1.414 1.414A9 9 0 105.636 18.364l1.414-1.414A7 7 0 1116.95 7.05z" /></svg> Help Center
          </a>
        </div>
        <p className="mt-8 text-center text-gray-600">We're here to help you succeed. Reach out anytime!</p>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
        <h2 className="text-2xl font-bold text-[#0F3D91] mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "Who is Denuel Auto for?",
              a: "Denuel Auto is built for car dealerships, exporters, and agents in Africa who want to manage inventory, leads, payments, and shipping from one dashboard."
            },
            {
              q: "Can I export cars with Denuel?",
              a: "Yes! Our Export Dealer plan includes full export and shipping modules, including CIF/FOB, port rules, and shipping documents."
            },
            {
              q: "Is my data secure?",
              a: "Absolutely. Denuel Auto uses SSL encryption and follows best practices for data protection."
            },
            {
              q: "How do I get support?",
              a: "You can reach our support team via WhatsApp, email, or the in-app help center."
            }
          ].map((faq, idx) => (
            <details key={idx} className="bg-white rounded-xl shadow border border-gray-100 p-6 group">
              <summary className="font-semibold text-[#0F3D91] cursor-pointer text-lg group-open:text-[#FFD700] transition-all duration-200">{faq.q}</summary>
              <div className="mt-2 text-gray-700 text-base">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-6 animate-fade-in">
        <div className="flex flex-wrap justify-center items-center gap-8 bg-white rounded-xl shadow border border-gray-100 py-4 px-6">
          <div className="flex items-center gap-2">
            <img src="/certified.svg" alt="Certified" className="w-8 h-8" />
            <span className="font-semibold text-[#0F3D91]">ZAMRA Certified</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="/award.svg" alt="Award" className="w-8 h-8" />
            <span className="font-semibold text-[#FFD700]">2025 DealerTech Award</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="/partner.svg" alt="Partner" className="w-8 h-8" />
            <span className="font-semibold text-[#0F3D91]">Partner: AutoAfrica</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="/secure.svg" alt="Secure" className="w-8 h-8" />
            <span className="font-semibold text-green-600">SSL Secured</span>
          </div>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-16 animate-fade-in">
        <h2 className="text-2xl font-bold text-[#0F3D91] mb-8 text-center">Dealers & Exporters Love Denuel</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {/* Testimonial 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-gray-100">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Dealer" className="w-16 h-16 rounded-full mb-4 border-2 border-[#FFD700]" />
            <div className="font-bold text-[#0F3D91] mb-1">John Mwale</div>
            <div className="text-sm text-gray-700 mb-2">Mwale Motors, Zambia</div>
            <blockquote className="italic text-gray-600">"Denuel made it easy to manage my stock and export cars. My team loves the buyer portal!"</blockquote>
          </div>
          {/* Testimonial 2 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-gray-100">
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Dealer" className="w-16 h-16 rounded-full mb-4 border-2 border-[#FFD700]" />
            <div className="font-bold text-[#0F3D91] mb-1">Chipo Banda</div>
            <div className="text-sm text-gray-700 mb-2">Banda Auto, Malawi</div>
            <blockquote className="italic text-gray-600">"The leads and proforma features helped us close deals faster. Highly recommended!"</blockquote>
          </div>
          {/* Testimonial 3 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-gray-100">
            <img src="https://randomuser.me/api/portraits/men/65.jpg" alt="Dealer" className="w-16 h-16 rounded-full mb-4 border-2 border-[#FFD700]" />
            <div className="font-bold text-[#0F3D91] mb-1">Peter Kamau</div>
            <div className="text-sm text-gray-700 mb-2">Kamau Exports, Kenya</div>
            <blockquote className="italic text-gray-600">"Exporting with Denuel is seamless. The system is fast, secure, and easy for my staff."</blockquote>
          </div>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-16 animate-fade-in">
        <NewsletterSignup />
      </section>
      <footer className="bg-white border-t border-gray-200 shadow-inner mt-auto py-6 animate-fade-in">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">© {new Date().getFullYear()} Denuel Auto. All rights reserved.</div>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:underline text-[#0F3D91]">Home</a>
            <a href="#login" className="hover:underline text-[#0F3D91]">Login</a>
            <a href="mailto:info@denuelauto.com" className="hover:underline text-[#0F3D91]">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
}