"use client";
import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { trackEvent } from "../utils/analytics";
import SiteHeader from "./SiteHeader";

const DemoModal = dynamic(() => import("./DemoModal"), { ssr: false });
import ProfessionalFooter from "./ProfessionalFooter";

// Branding types
interface BrandingSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  logoLightUrl: string;
  logoDarkUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  heroTitle: string;
  heroSubtitle: string;
}

interface CustomerReview {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatarUrl: string;
  isActive: boolean;
}

type PricingPlan = {
  name: string;
  priceMonthly: string;
  priceYearly: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
};

type FeatureCard = { title: string; desc: string; icon: string };

type SectionFeature = { heading: string; items: FeatureCard[] };

type Testimonial = { name: string; role: string; quote: string };

type FAQ = { q: string; a: string };

// Default branding values
const defaultBranding: BrandingSettings = {
  siteName: 'Denuel Auto',
  tagline: 'Your Trusted Car Dealership Partner',
  logoUrl: '',
  logoLightUrl: '',
  logoDarkUrl: '',
  faviconUrl: '',
  primaryColor: '#1E40AF',
  secondaryColor: '#FFD700',
  heroTitle: 'The Operating System for Modern Car Dealerships',
  heroSubtitle: 'Denuel Auto combines inventory, sales, finance, HR, and marketing into one platform. Collect payments (Airtel/MTN), automate approvals, and give every branch a single source of truth.'
};

const defaultReviews: CustomerReview[] = [
  { id: '1', name: "Linda K.", role: "GM, Multi-branch dealer", quote: "We cut onboarding time in half and finally see live stock across all yards.", rating: 5, avatarUrl: '', isActive: true },
  { id: '2', name: "Tapiwa M.", role: "Sales Director", quote: "Agents close faster with MoMo receipts and approval flows baked in.", rating: 5, avatarUrl: '', isActive: true },
  { id: '3', name: "Aisha N.", role: "Head of Finance", quote: "Commission and payout tracking is now automatic—no more spreadsheets.", rating: 5, avatarUrl: '', isActive: true }
];

export default function DenuelAutoHome() {
  const router = useRouter();
  const [openDemo, setOpenDemo] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  
  // Branding state
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>(defaultReviews);
  const [brandingLoaded, setBrandingLoaded] = useState(false);

  // Fetch branding settings on mount
  useEffect(() => {
    const loadBranding = async () => {
      try {
        const response = await fetch('/api/super-admin/branding');
        if (response.ok) {
          const data = await response.json();
          if (data.branding) {
            setBranding(prev => ({ ...prev, ...data.branding }));
          }
          if (data.reviews && data.reviews.length > 0) {
            const activeReviews = data.reviews.filter((r: CustomerReview) => r.isActive);
            if (activeReviews.length > 0) {
              setCustomerReviews(activeReviews);
            }
          }
        }
      } catch (error) {
        console.log('Using default branding settings');
      } finally {
        setBrandingLoaded(true);
      }
    };
    loadBranding();
  }, []);

  const valueProps: FeatureCard[] = useMemo(
    () => [
      { title: "Full Car Dealership Management", desc: "One operating system for sales, service, marketing, finance, and back-office.", icon: "🚗" },
      { title: "Inventory & Lot Management", desc: "VIN-ready intake, photos, videos, statuses, and automated listings.", icon: "🗂️" },
      { title: "Customer & Sales Tracking", desc: "Leads, inquiries, negotiations, and test-drive journeys in one view.", icon: "📈" },
      { title: "Finance & Payment Automation", desc: "Receipts, invoices, MoMo (Airtel/MTN) integration, commissions, and payouts.", icon: "💳" },
      { title: "HR, Accounting, Agent Tools", desc: "Role-based access for Tenant, HR, Admin, IT, Cashier, Agents, and more.", icon: "🛠️" },
      { title: "Multi-branch Support", desc: "Run HQ + branches with isolation, shared reporting, and smart permissions.", icon: "🏢" }
    ],
    []
  );

  const sectionFeatures: SectionFeature[] = useMemo(
    () => [
      {
        heading: "Management Features",
        items: [
          { title: "Inventory Management", desc: "Unlimited vehicles with statuses and ownership flows.", icon: "📦" },
          { title: "Vehicle Registration", desc: "VIN capture, document storage, and compliance checks.", icon: "📝" },
          { title: "Listings Auto-Posting", desc: "Push to portals and social in one click.", icon: "🚀" },
          { title: "Images & Video Upload", desc: "High-quality galleries plus 360° embeds.", icon: "🎥" }
        ]
      },
      {
        heading: "Sales Features",
        items: [
          { title: "Leads & Inquiries", desc: "Unified inbox with SLA timers and smart routing.", icon: "📬" },
          { title: "Negotiation Tracking", desc: "See every offer, counter, and approval log.", icon: "🤝" },
          { title: "Test-drive Scheduling", desc: "Calendar sync, reminders, and agent assignments.", icon: "🗓️" },
          { title: "Contracts & Printing", desc: "One-click proforma, invoices, receipts, and delivery notes.", icon: "🖨️" }
        ]
      },
      {
        heading: "Finance Features",
        items: [
          { title: "Payment Tracking", desc: "Cash, bank, MoMo, and part-payments with audit trails.", icon: "💰" },
          { title: "Mobile Money", desc: "Airtel Money + MTN Money ready for fast collections.", icon: "📱" },
          { title: "Commission Tracking", desc: "Agent and sales-team earnings auto-calculated.", icon: "🎯" },
          { title: "Invoices & Receipts", desc: "Branded, numbered, and export-ready PDFs.", icon: "📄" }
        ]
      },
      {
        heading: "HR & Roles",
        items: [
          { title: "Roles & Permissions", desc: "Tenant, HR, Admin, IT, Account, Cashier, Agent with granular access.", icon: "🛡️" },
          { title: "Attendance Tracking", desc: "Shifts, presence logs, and productivity insights.", icon: "⏱️" },
          { title: "Multi-branch Controls", desc: "Separate branches, shared HQ oversight.", icon: "🌐" },
          { title: "Task & Approval Flows", desc: "Guardrails for pricing, discounts, and releases.", icon: "✅" }
        ]
      },
      {
        heading: "Analytics",
        items: [
          { title: "Sales Reports", desc: "Pipeline, closures, and margins at a glance.", icon: "📊" },
          { title: "Performance Dashboard", desc: "Month-on-month, win rates, and trends.", icon: "📆" },
          { title: "Agent Ranking", desc: "Leaderboard and payout readiness.", icon: "🏅" },
          { title: "Exports", desc: "CSV, PDF, and scheduled email briefs.", icon: "📤" }
        ]
      },
      {
        heading: "Marketing Tools",
        items: [
          { title: "Auto Social Posting", desc: "Publish to WhatsApp, Facebook, Instagram in a click.", icon: "📣" },
          { title: "Email & SMS", desc: "Smart drip campaigns with templates.", icon: "✉️" },
          { title: "AI Descriptions", desc: "Instant car write-ups, highlights, and SEO snippets.", icon: "✨" },
          { title: "Lead Capture Widgets", desc: "Embeddable forms and QR flows.", icon: "🔗" }
        ]
      }
    ],
    []
  );

  

  const pricing: PricingPlan[] = useMemo(
    () => [
      {
        name: "Starter",
        priceMonthly: "$59",
        priceYearly: "$49",
        description: "For small lots getting organized.",
        features: [
          "Up to 2 branches",
          "1,000 vehicles",
          "Lead & inquiry inbox",
          "Basic receipts & invoices",
          "Email & SMS notifications",
          "Standard support"
        ],
        cta: "Start free"
      },
      {
        name: "Pro",
        priceMonthly: "$129",
        priceYearly: "$109",
        description: "For growing dealerships that need automation.",
        features: [
          "Up to 5 branches",
          "Unlimited vehicles",
          "Finance & MoMo payments",
          "Commission tracking",
          "Analytics dashboards",
          "Priority support"
        ],
        cta: "Upgrade to Pro",
        popular: true
      },
      {
        name: "Enterprise",
        priceMonthly: "Custom",
        priceYearly: "Custom",
        description: "For national groups and exporters.",
        features: [
          "Unlimited branches",
          "Custom approvals & SSO",
          "Dedicated success manager",
          "On-site training",
          "Advanced security",
          "Custom integrations"
        ],
        cta: "Talk to us"
      }
    ],
    []
  );


  const faqs: FAQ[] = useMemo(
    () => [
      { q: `Who is ${branding.siteName} for?`, a: "Car dealerships, exporters, and multi-branch groups that want a single operating system for sales, finance, and operations." },
      { q: "Do you support multiple branches?", a: "Yes. HQ oversight with branch isolation, roles, and permissions per location." },
      { q: "How do payments work?", a: "Collect via cash, bank, Airtel Money, MTN Money, and record part-payments with audit trails." },
      { q: "Can agents get their own access?", a: "Yes. Issue role-based logins for Agents, HR, Admin, IT, Cashier, and more." },
      { q: "Do you handle commissions?", a: "Commission rules can be configured per deal, with automatic payout readiness." },
      { q: "Is there training?", a: "We provide onboarding, playbooks, and optional on-site training for Enterprise." },
      { q: "Can we export data?", a: "Yes—CSV, PDF, and scheduled email briefs for management." },
      { q: "What about inventory photos and videos?", a: "Upload HD photos, videos, 360° embeds, and auto-generate marketing-ready listings." },
      { q: "Do you integrate with marketing channels?", a: "One-click posting to WhatsApp, Facebook, Instagram, plus email/SMS campaigns." },
      { q: "How do we start?", a: "Create an account or book a demo. We will configure your branches, roles, and branding." }
    ],
    [branding.siteName]
  );

  const heroGradient = "bg-[radial-gradient(circle_at_20%_20%,#e0e7ff,transparent_35%),radial-gradient(circle_at_80%_0%,#dbeafe,transparent_30%),radial-gradient(circle_at_50%_100%,#fef3c7,transparent_35%)]";

  const priceLabel = (plan: PricingPlan) => (billing === "monthly" ? plan.priceMonthly : plan.priceYearly);

  const handleCta = (path: string, event: string) => {
    trackEvent(event);
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-[Inter]">
      <div className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-600 text-white text-sm py-2 px-4 text-center">
        Modern car dealership OS • Multi-branch • MoMo ready • Built for Africa
      </div>

      {/* Replaced inline header with central SiteHeader for improved UI/UX */}
      <SiteHeader siteName={branding.siteName} />

      <section id="hero" className={`relative overflow-hidden ${heroGradient}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Purpose-built for African dealerships</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {branding.heroTitle || 'The Operating System for Modern Car Dealerships'}
              </h1>
              <p className="text-lg sm:text-xl text-gray-700 max-w-2xl leading-relaxed">
                {branding.heroSubtitle || `${branding.siteName} combines inventory, sales, finance, HR, and marketing into one platform. Collect payments (Airtel/MTN), automate approvals, and give every branch a single source of truth.`}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleCta("/register", "hero_get_started")}
                  className="px-6 sm:px-8 py-3 rounded-xl text-white font-semibold bg-blue-700 hover:bg-blue-800 shadow-lg shadow-blue-200 transition-all"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => setOpenDemo(true)}
                  className="px-6 sm:px-8 py-3 rounded-xl border border-gray-300 text-gray-800 font-semibold bg-white hover:bg-gray-50 shadow-sm"
                >
                  Book a Demo
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex -space-x-2">
                  {["L", "T", "A", "M"].map((l) => (
                    <div key={l} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center border border-white shadow" aria-hidden>
                      {l}
                    </div>
                  ))}
                </div>
                <span>Trusted by multi-branch dealers and exporters</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-200/50 rounded-full blur-3xl" aria-hidden />
              <div className="absolute -bottom-10 -right-6 w-40 h-40 bg-yellow-200/50 rounded-full blur-3xl" aria-hidden />
              <div className="relative bg-white/90 backdrop-blur shadow-2xl rounded-2xl border border-gray-100 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Branch Overview</p>
                    <p className="text-lg font-semibold text-gray-900">HQ + 4 Branches</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">Live</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Active stock", value: "1,284" },
                    { label: "Open deals", value: "86" },
                    { label: "Pending payouts", value: "$42k" }
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-100 p-3 bg-gradient-to-br from-blue-50 to-white">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-800">Cars in motion</p>
                      <span className="text-xs text-green-600">+12%</span>
                    </div>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex justify-between"><span>Inbound</span><span>52</span></div>
                      <div className="flex justify-between"><span>Outgoing</span><span>34</span></div>
                      <div className="flex justify-between"><span>Reserved</span><span>18</span></div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-100 p-3 bg-gradient-to-br from-yellow-50 to-white">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-800">Agent performance</p>
                      <span className="text-xs text-blue-600">Live</span>
                    </div>
                    <div className="space-y-2 text-xs text-gray-700">
                      {["Mwansa", "Thandi", "Chipo"].map((a, idx) => (
                        <div key={a} className="flex items-center justify-between">
                          <span>
                            {idx + 1}. {a}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-1.5 bg-gray-200 rounded-full">
                              <div className="h-1.5 bg-blue-600 rounded-full" style={{ width: `${70 - idx * 10}%` }} />
                            </div>
                            <span>{70 - idx * 10}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 p-3 bg-white">
                  <p className="text-sm font-semibold text-gray-800 mb-3">Recent activity</p>
                  <div className="space-y-2 text-xs text-gray-700">
                    {[
                      "Invoice #2341 paid via MTN Money",
                      "Agent Thandi booked test-drive for BMW X5",
                      "Proforma sent to Export client – Lusaka",
                      "Commission ready: $420 for Mwansa"
                    ].map((item) => (
                      <div key={item} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 mt-1 rounded-full bg-blue-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace removed — moved to tenant public page */}

      <section id="why" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
            <div>
              <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Why {branding.siteName}</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Built to convert visitors into loyal buyers</h2>
              <p className="mt-3 text-gray-600 max-w-2xl">
                Every tool you need—from intake to payout—in one premium SaaS experience. Designed with the clarity of Notion, the energy of Monday.com, and the trust of leading auto marketplaces.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 bg-white shadow-sm rounded-lg border border-gray-100 text-sm text-gray-700">
                <span className="font-semibold text-blue-700">99.9%</span> uptime • MoMo-ready
              </div>
              <div className="px-4 py-2 bg-white shadow-sm rounded-lg border border-gray-100 text-sm text-gray-700">
                <span className="font-semibold text-green-700">SOC2 mindset</span> • Role-based access
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {valueProps.map((item) => (
              <div key={item.title} className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-xl mb-4">
                  <span aria-hidden>{item.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            <div className="lg:w-5/12 space-y-4">
              <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Interactive Demo</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">See your dealership in one canvas</h2>
              <p className="text-gray-600 leading-relaxed">
                A Notion-style workspace with Monday.com clarity: vehicles, agents, analytics, and activity feed—organized and ready to act. Invite your team, assign roles, and go live fast.
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setOpenDemo(true)} className="px-5 py-3 rounded-xl bg-blue-700 text-white font-semibold shadow-sm hover:bg-blue-800">
                  Launch live demo
                </button>
                <button onClick={() => handleCta("/register", "demo_start_trial")} className="px-5 py-3 rounded-xl border border-gray-300 text-gray-800 font-semibold bg-white hover:bg-gray-50">
                  Start free trial
                </button>
              </div>
            </div>
            <div className="lg:w-7/12 w-full">
              <div className="relative bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify_between px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex space-x-2" aria-hidden>
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-gray-500">{branding.siteName} · HQ Workspace</span>
                </div>
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="p-4 border-r border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">Cars</p>
                      <span className="text-xs text-gray-500">Live</span>
                    </div>
                    <div className="space-y-2 text-xs text-gray-700">
                      {[
                        "Toyota Hilux · Reserved",
                        "BMW X5 · Test-drive today",
                        "Ford Ranger · Incoming",
                        "Isuzu D-Max · On lot"
                      ].map((c) => (
                        <div key={c} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                          <span>{c}</span>
                          <span className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-700">Ready</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between"><span>Active listings</span><span className="font-semibold text-gray-900">182</span></div>
                      <div className="flex justify_between"><span>Photos uploaded</span><span className="font-semibold text-gray-900">2,314</span></div>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="rounded-xl bg-gradient-to-br from-blue-50 to-white border border-gray-100 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-800">Analytics</p>
                        <span className="text-[11px] text-green-600">+18% MoM</span>
                      </div>
                      <div className="h-24 w-full bg-gradient-to-r from-blue-200 to-blue-500 rounded-lg" aria-hidden />
                    </div>
                    <div className="rounded-xl border border-gray-100 p-3 bg-white">
                      <p className="text-sm font-semibold text-gray-800 mb-2">Recent activities</p>
                      <div className="space-y-2 text-xs text-gray-700">
                        {["MoMo payment confirmed", "Agent payout pending", "Proforma sent", "Test drive completed"].map((a) => (
                          <div key={a} className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 mt-1 rounded-full bg-blue-500" />
                            <span>{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 p-3 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-800">Agents</p>
                        <span className="text-[11px] text-blue-600">Live</span>
                      </div>
                      <div className="space-y-2 text-xs text-gray-700">
                        {["Mwansa", "Thandi", "Chipo", "Naledi"].map((agent) => (
                          <div key={agent} className="flex items-center justify_between">
                            <span>{agent}</span>
                            <span className="px-2 py-1 rounded-full bg-gray-100">Active</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Platform depth</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Everything organized like Notion, executed like Monday.com</h2>
            <p className="mt-3 text-gray-600">Six pillars—Management, Sales, Finance, HR, Analytics, Marketing—designed to convert leads and control operations.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {sectionFeatures.map((section) => (
              <div key={section.heading} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{section.heading}</h3>
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700">Included</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {section.items.map((item) => (
                    <div key={item.title} className="flex space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-lg" aria-hidden>
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Simple, transparent plans</h2>
            <p className="text-gray-600 max-w-2xl">Monthly or yearly—switch anytime. Contact Super Admin for enterprise rollouts or procurement.</p>
            <div className="flex items-center space-x-3 bg-gray-100 rounded-full px-2 py-1 text-sm font-medium">
              <button
                onClick={() => setBilling("monthly")}
                className={`px-3 py-1 rounded-full ${billing === "monthly" ? "bg-white shadow text-gray-900" : "text-gray-600"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={`px-3 py-1 rounded-full ${billing === "yearly" ? "bg-white shadow text-gray-900" : "text-gray-600"}`}
              >
                Yearly (save 15%)
              </button>
            </div>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border ${plan.popular ? "border-blue-200 shadow-xl" : "border-gray-100 shadow"} bg-white p-6 flex flex-col space-y-4`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-700">{plan.name}</p>
                    <p className="text-lg text-gray-800">{plan.description}</p>
                  </div>
                  {plan.popular && <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700">Most popular</span>}
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-gray-900">{priceLabel(plan)}</span>
                  <span className="text-sm text-gray-500">{billing === "monthly" ? "/mo" : "/mo (billed yearly)"}</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start space-x-2">
                      <span className="mt-1 w-2 h-2 rounded-full bg-blue-500" aria-hidden />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCta("/register", `pricing_${plan.name.toLowerCase()}`)}
                  className={`w-full py-3 rounded-xl font-semibold border ${plan.popular ? "bg-blue-700 text-white border-blue-700 hover:bg-blue-800" : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50"}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center text-sm text-gray-700 space-y-2">
            <p>Contact Super Admin for tailored rollout:</p>
            <p className="font-semibold text-gray-900">denuelinambao@gmail.com • 0973914432 • 0773150024</p>
          </div>
        </div>
      </section>

      <section id="resources" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Real teams shipping real results</h2>
            <p className="mt-3 text-gray-600">Built for speed, control, and confidence—trusted by growing dealer networks.</p>
          </div>
<div className="grid md:grid-cols-3 gap-6">
            {customerReviews.map((t) => (
              <div key={t.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className={`w-4 h-4 ${star <= t.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed">&quot;{t.quote}&quot;</p>
                <div className="mt-4 flex items-center gap-3">
                  {t.avatarUrl ? (
                    <Image src={t.avatarUrl} alt={t.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                      {t.name.split(' ').map(w => w[0]).join('')}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-600">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Answers for dealership teams</h2>
            <p className="mt-3 text-gray-600">Everything you need to know before rolling out {branding.siteName}.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-base font-semibold text-gray-900">{f.q}</p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Contact Super Admin</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Need help setting up tenants, payments, or support?</h2>
          <p className="text-gray-600">We onboard your branches, configure roles, and connect your payment lines.</p>
          <div className="grid sm:grid-cols-3 gap-4 text-sm font-semibold text-gray-900">
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p>Email</p>
              <p className="text-blue-700">denuelinambao@gmail.com</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p>Phone</p>
              <p>0973914432 / 0773150024</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <p>Payment line</p>
              <p className="text-blue-700">Airtel / MTN: 0973914432</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <button onClick={() => handleCta("/register", "contact_create_account")} className="px-6 py-3 rounded-xl bg-blue-700 text-white font-semibold shadow-sm hover:bg-blue-800">
              Create Account
            </button>
            <button onClick={() => setOpenDemo(true)} className="px-6 py-3 rounded-xl border border-gray-300 text-gray-800 font-semibold bg-white hover:bg-gray-50">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Launch your dealership OS today</h2>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto">Convert more buyers, control every branch, and pay teams faster— with {branding.siteName}&apos;s premium SaaS experience inspired by Notion and Monday.com.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button onClick={() => handleCta("/register", "bottom_create_account")} className="px-7 py-3 rounded-xl bg-white text-blue-800 font-semibold shadow-lg hover:bg-blue-50">
              Create Account
            </button>
            <button onClick={() => setOpenDemo(true)} className="px-7 py-3 rounded-xl border border-white/40 text-white font-semibold hover:bg-white/10">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      <ProfessionalFooter />

      <DemoModal open={openDemo} onClose={() => setOpenDemo(false)} />
    </div>
  );
}
