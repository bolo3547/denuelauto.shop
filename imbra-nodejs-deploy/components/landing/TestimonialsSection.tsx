import React from 'react';
import Carousel from '../Carousel';
import CarCard from '../CarCard.index';

export default function TestimonialsSection() {

  return (
    <>
      {/* Customer Testimonials Section */}
      <section className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
        <h2 className="text-2xl font-bold text-[#0F3D91] mb-8 text-center">What Dealers Say</h2>
        <div className="flex flex-wrap gap-8 justify-center items-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col items-center text-center max-w-xs">
            <img src="/google.svg" alt="Google" className="w-8 h-8 mb-2" />
            <div className="font-bold text-[#0F3D91] mb-1">Google Reviews</div>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => <span key={i} className="text-[#FFD700] text-xl">★</span>)}
            </div>
            <div className="text-gray-700 text-sm mb-2">"Excellent platform for dealers. Fast, secure, and easy to use!"</div>
            <span className="text-xs text-gray-500">- Dealer, Lusaka</span>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col items-center text-center max-w-xs">
            <img src="/trustpilot.svg" alt="Trustpilot" className="w-8 h-8 mb-2" />
            <div className="font-bold text-[#0F3D91] mb-1">Trustpilot</div>
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => <span key={i} className="text-[#FFD700] text-xl">★</span>)}
            </div>
            <div className="text-gray-700 text-sm mb-2">"Denuel Auto helped us grow our export business. Highly recommended!"</div>
            <span className="text-xs text-gray-500">- Exporter, Nairobi</span>
          </div>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-8 animate-fade-in">
        <div className="flex flex-wrap justify-center items-center gap-8 bg-gradient-to-r from-[#FFD700]/20 to-[#0F3D91]/10 rounded-xl shadow border border-gray-100 py-6 px-8">
          <div className="flex items-center gap-2">
            <img src="/award.svg" alt="Award" className="w-8 h-8" />
            <span className="font-semibold text-[#FFD700]">DealerTech Award 2025</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="/press.svg" alt="Press" className="w-8 h-8" />
            <span className="font-semibold text-[#0F3D91]">Featured in AutoAfrica Magazine</span>
          </div>
          <div className="flex items-center gap-2">
            <img src="/certified.svg" alt="Certified" className="w-8 h-8" />
            <span className="font-semibold text-green-600">ZAMRA Certified</span>
          </div>
        </div>
      </section>
      <section className="max-w-2xl mx-auto px-6 py-12 animate-fade-in">
        <h2 className="text-2xl font-bold text-[#0F3D91] mb-4 text-center">Stay Updated</h2>
        <p className="text-gray-700 mb-6 text-center">Subscribe for tips, news, and exclusive offers for African car dealers and exporters.</p>
        <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed!'); }} className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <input type="email" placeholder="Your email address" className="w-full md:w-2/3 px-4 py-3 rounded-lg border border-gray-300 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]" required />
          <button type="submit" className="px-6 py-3 rounded-lg bg-[#FFD700] text-[#0F3D91] font-bold shadow hover:bg-[#0F3D91] hover:text-[#FFD700] transition-all duration-200">Subscribe</button>
        </form>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
        <h2 className="text-2xl font-bold text-[#0F3D91] mb-8 text-center">Latest Insights & News</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <article className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="font-bold text-lg text-[#0F3D91] mb-2">How to Export Cars from Zambia</h3>
            <p className="text-gray-700 mb-2">Learn the step-by-step process for exporting vehicles, including documentation, port selection, and CIF/FOB rules.</p>
            <a href="#" className="text-[#FFD700] font-bold hover:underline">Read more</a>
          </article>
          <article className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="font-bold text-lg text-[#0F3D91] mb-2">Top 5 Tips for Closing More Deals</h3>
            <p className="text-gray-700 mb-2">Discover proven strategies to increase your dealership's sales and improve customer satisfaction.</p>
            <a href="#" className="text-[#FFD700] font-bold hover:underline">Read more</a>
          </article>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
        <h2 className="text-2xl font-bold text-[#0F3D91] mb-8 text-center">Dealers & Exporters Across Africa</h2>
        <div className="flex flex-col items-center">
          <div className="w-full max-w-3xl aspect-[3/2] rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white flex items-center justify-center">
            {/* Simple SVG map of Africa with dealer pins */}
            <svg viewBox="0 0 600 400" className="w-full h-full">
              <image href="/africa-map.svg" x="0" y="0" width="600" height="400" />
              {/* Zambia */}
              <circle cx="320" cy="260" r="10" fill="#FFD700" stroke="#0F3D91" strokeWidth="2" />
              <text x="335" y="265" fontSize="16" fill="#0F3D91">Zambia</text>
              {/* Kenya */}
              <circle cx="420" cy="180" r="10" fill="#FFD700" stroke="#0F3D91" strokeWidth="2" />
              <text x="435" y="185" fontSize="16" fill="#0F3D91">Kenya</text>
              {/* Malawi */}
              <circle cx="370" cy="250" r="10" fill="#FFD700" stroke="#0F3D91" strokeWidth="2" />
              <text x="385" y="255" fontSize="16" fill="#0F3D91">Malawi</text>
              {/* Tanzania */}
              <circle cx="400" cy="230" r="10" fill="#FFD700" stroke="#0F3D91" strokeWidth="2" />
              <text x="415" y="235" fontSize="16" fill="#0F3D91">Tanzania</text>
            </svg>
          </div>
          <p className="mt-6 text-gray-700 text-center">Denuel Auto powers dealerships and exporters in Zambia, Kenya, Malawi, Tanzania, and more.</p>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
        <h2 className="text-2xl font-bold text-[#0F3D91] mb-8 text-center">Dealer Success Stories</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="font-bold text-lg text-[#0F3D91] mb-2">Mwale Motors: From Local to Exporter</h3>
            <p className="text-gray-700 mb-2">Mwale Motors started as a small dealership in Lusaka. After adopting Denuel Auto, they expanded to export cars to Tanzania and Kenya, using the platform's export and shipping modules.</p>
            <span className="inline-block bg-[#FFD700] text-[#0F3D91] font-bold px-3 py-1 rounded-full text-xs">+200% Export Growth</span>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="font-bold text-lg text-[#0F3D91] mb-2">Banda Auto: Closing Deals Faster</h3>
            <p className="text-gray-700 mb-2">Banda Auto in Malawi reduced their deal closing time by 50% after switching to Denuel Auto. The leads and proforma features helped streamline their sales process.</p>
            <span className="inline-block bg-[#25D366] text-white font-bold px-3 py-1 rounded-full text-xs">50% Faster Sales</span>
          </div>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
        <h2 className="text-2xl font-bold text-[#0F3D91] mb-8 text-center">See Denuel Auto in Action</h2>
        <div className="flex justify-center">
          <div className="w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-lg border border-gray-100">
            <iframe
              src="https://www.youtube.com/embed/1Q8fG0TtVAY"
              title="Denuel Auto Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-12 animate-fade-in">
        <h2 className="text-2xl font-bold text-[#0F3D91] mb-8 text-center">Featured Vehicles</h2>
        <div className="relative">
          <Carousel
            items={[
              {
                img: 'https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=400&q=80',
                name: 'Toyota Hilux',
                price: 'K320,000',
                  desc: '2022, 4WD, Diesel, Zambia Stock',
                certified: true
              },
              {
                img: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80',
                name: 'Nissan Navara',
                price: 'K295,000',
                desc: '2021, 4WD, Petrol, Malawi Stock'
              },
              {
                img: 'https://images.unsplash.com/photo-1461632830798-3adb3034e4c8?auto=format&fit=crop&w=400&q=80',
                name: 'Mazda CX-5',
                price: 'K210,000',
                desc: '2020, AWD, Petrol, Kenya Stock'
              },
              {
                img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=400&q=80',
                name: 'Isuzu D-Max',
                price: 'K250,000',
                desc: '2022, 4WD, Diesel, Tanzania Stock'
              }
            ]}
            renderItem={(car: any) => (
              <CarCard
                img={car.img}
                name={car.name}
                price={car.price}
                desc={car.desc}
                certified={car.certified}
                href="#"
              />
            )}
            interval={3500}
            ariaLabel="Featured vehicles carousel"
            showArrows={true}
            showDots={true}
          />
        </div>
      </section>
    </>
  );
}