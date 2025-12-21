import React from "react";
import Link from "next/link";

export default function ProfessionalFooter() {
  return (
    <footer className="bg-gray-800 text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold">Denuel Auto</h3>
            <p className="mt-2 text-sm text-gray-300 max-w-sm">
              The operating system for modern car dealerships — inventory, sales, finance and people in one place.
            </p>
            <p className="mt-4 text-sm">
              <span className="font-medium">Email:</span> <a className="text-blue-300 hover:underline" href="mailto:denuelinambao@gmail.com">denuelinambao@gmail.com</a>
            </p>
            <p className="text-sm">Phone: <span className="font-medium">0973914432</span></p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-300">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/features" className="hover:text-white">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/demo" className="hover:text-white">Demo</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Resources</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-300">
              <li><Link href="/docs" className="hover:text-white">Docs</Link></li>
              <li><Link href="/support" className="hover:text-white">Support</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-white">Privacy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-white">Terms</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">Stay up to date</h4>
            <p className="mt-3 text-sm text-gray-300">Get product updates, news, and tips—no spam.</p>
            <form className="mt-4 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="footer-email" className="sr-only">Email</label>
              <input id="footer-email" type="email" placeholder="your@email.com" className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">Subscribe</button>
            </form>

            <div className="mt-6 flex items-center space-x-3">
              <a aria-label="Twitter" href="#" className="text-gray-300 hover:text-white" title="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M22 5.92c-.63.28-1.3.48-2 .57.72-.43 1.27-1.1 1.53-1.9-.67.4-1.41.68-2.2.84A3.5 3.5 0 0 0 12.2 8c0 .28.03.56.1.82C8.28 8.77 5 6.86 2.76 3.9c-.31.54-.49 1.16-.49 1.82 0 1.25.64 2.35 1.62 3-.6-.02-1.17-.18-1.66-.45v.05c0 1.74 1.24 3.2 2.9 3.53-.3.08-.61.12-.93.12-.23 0-.45-.02-.67-.06.45 1.34 1.74 2.3 3.28 2.33A7.03 7.03 0 0 1 2 18.13 9.88 9.88 0 0 0 7.29 20c7.55 0 11.68-6.55 11.68-12.23l-.01-.56c.8-.56 1.47-1.26 2-2.06-.73.33-1.52.56-2.33.66z" />
                </svg>
              </a>
              <a aria-label="LinkedIn" href="#" className="text-gray-300 hover:text-white" title="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M4.98 3.5a2.5 2.5 0 1 1-.02 0zM3 6h4v12H3zM8 6h3.6v1.7h.1c.5-.9 1.7-1.7 3.5-1.7C19.5 6 21 8 21 12.1V18h-4v-5.3c0-1.3-.5-2.1-1.7-2.1-1 0-1.5.7-1.7 1.4-.1.3-.1.6-.1.9V18H8z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-700 pt-6 text-sm text-gray-400 flex flex-col md:flex-row items(center) justify-between gap-3">
          <p>© {new Date().getFullYear()} Denuel Auto. All rights reserved.</p>
          <div className="space-x-4">
            <Link href="/legal/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-white">Terms</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
