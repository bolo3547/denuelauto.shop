"use client";
import React, { useState } from 'react';
import { useTenantRegistrationWizard } from '@/hooks/useTenantRegistrationWizard';

export default function TenantRegistrationPage() {
  const wizard = useTenantRegistrationWizard();
  const { currentStep, nextStep, prevStep, business, operations, branding, pricing, payment, breakdown, setBusiness, setOperations, setBranding, setPricing, setPayment } = wizard;
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);
    if (!payment.acceptTerms) {
      setSubmitError('Please accept the Terms & Conditions.');
      return;
    }
    if (payment.paymentMethod === 'momo' && !payment.paymentProofUrl) {
      setSubmitError('Please paste a payment proof URL for mobile money.');
      return;
    }
    setSubmitting(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const url = `${base}/api/register/tenant/submit`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Some backends require tenant context; default to a staging tenant if none is needed.
          'x-tenant-id': process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID || 'staging',
        },
        body: JSON.stringify({ business, operations, branding, pricing, payment }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || 'Failed to submit registration');
      }
      setSubmitSuccess('Registration submitted! An invoice has been generated.');
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit registration');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Register Your Dealership</h1>
      <p className="text-sm text-gray-600 mb-6">Guided sign-up with instant pricing. Secure and tenant-aware.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Stepper */}
          <div className="flex items-center gap-2 text-sm">
            {[1,2,3,4,5].map(step => (
              <div key={step} className={`px-3 py-1 rounded ${currentStep===step? 'bg-blue-600 text-white':'bg-gray-200'}`}>Step {step}</div>
            ))}
          </div>

          {/* Steps */}
          {currentStep === 1 && (
            <section className="space-y-3">
              <h2 className="font-medium">Step 1: Business & Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className="input" placeholder="Business name" value={business.businessName} onChange={e=>setBusiness({...business,businessName:e.target.value})} />
                <input className="input" placeholder="Country" value={business.country} onChange={e=>setBusiness({...business,country:e.target.value})} />
                <input className="input" placeholder="City / Port" value={business.city} onChange={e=>setBusiness({...business,city:e.target.value})} />
                <select className="input" value={business.businessType} onChange={e=>setBusiness({...business,businessType:e.target.value as any})}>
                  <option value="dealer">Dealer</option>
                  <option value="broker">Broker</option>
                  <option value="exporter">Exporter</option>
                  <option value="auction">Auction</option>
                </select>
                <input className="input" placeholder="Website (optional)" value={business.website||''} onChange={e=>setBusiness({...business,website:e.target.value})} />
                <input className="input" placeholder="Primary contact name" value={business.contactName} onChange={e=>setBusiness({...business,contactName:e.target.value})} />
                <input className="input" placeholder="Primary contact email" value={business.contactEmail} onChange={e=>setBusiness({...business,contactEmail:e.target.value})} />
                <input className="input" placeholder="Primary contact phone" value={business.contactPhone} onChange={e=>setBusiness({...business,contactPhone:e.target.value})} />
              </div>
              <div className="flex gap-2">
                <button className="btn" onClick={nextStep}>Save & Continue</button>
              </div>
            </section>
          )}

          {currentStep === 2 && (
            <section className="space-y-3">
              <h2 className="font-medium">Step 2: Operational Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select className="input" value={operations.expectedListings} onChange={e=>setOperations({...operations, expectedListings: parseInt(e.target.value)})}>
                  <option value={20}>1-20</option>
                  <option value={100}>21-100</option>
                  <option value={500}>101-500</option>
                  <option value={501}>500+</option>
                </select>
                <input className="input" placeholder="Expected monthly sales" type="number" value={operations.expectedSales||''} onChange={e=>setOperations({...operations, expectedSales: parseInt(e.target.value)||undefined})} />
                <select className="input" value={operations.staffCount} onChange={e=>setOperations({...operations, staffCount: parseInt(e.target.value)})}>
                  <option value={5}>1-5</option>
                  <option value={20}>6-20</option>
                  <option value={50}>21-50</option>
                  <option value={51}>50+</option>
                </select>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={operations.multiBranch} onChange={e=>setOperations({...operations, multiBranch: e.target.checked})} />
                  Multi-branch?
                </label>
                {operations.multiBranch && (
                  <input className="input" placeholder="Number of branches" type="number" value={operations.branchCount} onChange={e=>setOperations({...operations, branchCount: parseInt(e.target.value)||1})} />
                )}
                <div className="col-span-2 grid grid-cols-2 gap-2">
                  {Object.entries(operations.requiredModules).map(([key, val]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input type="checkbox" checked={val} onChange={e=>setOperations({...operations, requiredModules: {...operations.requiredModules, [key]: e.target.checked}})} />
                      {labelForModule(key)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={prevStep}>Back</button>
                <button className="btn" onClick={nextStep}>Save & Continue</button>
              </div>
            </section>
          )}

          {currentStep === 3 && (
            <section className="space-y-3">
              <h2 className="font-medium">Step 3: Theme & Branding</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select className="input" value={branding.themePreset} onChange={e=>setBranding({...branding, themePreset: e.target.value as any})}>
                  <option value="BEFORWARD">BEFORWARD</option>
                  <option value="SBT">SBT</option>
                  <option value="AUTOCOM">AUTOCOM</option>
                </select>
                <input className="input" placeholder="Logo URL (or upload)" value={branding.logoUrl||''} onChange={e=>setBranding({...branding, logoUrl: e.target.value})} />
                <input className="input" type="color" value={branding.primaryColor||'#FF7900'} onChange={e=>setBranding({...branding, primaryColor: e.target.value})} />
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={prevStep}>Back</button>
                <button className="btn" onClick={nextStep}>Save & Continue</button>
              </div>
            </section>
          )}

          {currentStep === 4 && (
            <section className="space-y-3">
              <h2 className="font-medium">Step 4: Pricing Preview & Discounts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select className="input" value={pricing.billingCycle} onChange={e=>setPricing({...pricing, billingCycle: e.target.value as any})}>
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual (10% off)</option>
                </select>
                <input className="input" placeholder="Promo code" value={pricing.promoCode||''} onChange={e=>setPricing({...pricing, promoCode: e.target.value})} />
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={pricing.trialRequested} onChange={e=>setPricing({...pricing, trialRequested: e.target.checked})} />
                  Request 30-day free trial (if eligible)
                </label>
              </div>
              <div>
                <h3 className="font-medium mb-2">Breakdown</h3>
                <ul className="text-sm bg-gray-50 rounded p-3">
                  {breakdown.lines.map((line,i)=> (
                    <li key={i} className="flex justify-between py-1">
                      <span>{line.label}</span>
                      <span>{formatCurrency(line.amountMinor)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 text-sm">
                  <div>Estimated monthly total: <strong>{formatCurrency(breakdown.totalMinor)}</strong></div>
                  <div>Estimated annual total (with discount): <strong>{formatCurrency(breakdown.annualTotalMinor)}</strong></div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={prevStep}>Back</button>
                <button className="btn" onClick={nextStep}>Continue to Payment</button>
              </div>
            </section>
          )}

          {currentStep === 5 && (
            <section className="space-y-3">
              <h2 className="font-medium">Step 5: Payment & Confirm</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select className="input" value={payment.paymentMethod} onChange={e=>setPayment({...payment, paymentMethod: e.target.value as any})}>
                  <option value="momo">Manual Mobile Money</option>
                  <option value="bank">Bank Transfer (manual proof)</option>
                  <option value="card">Online Card Payment</option>
                </select>
                {payment.paymentMethod==='momo' && (
                  <>
                    <select className="input" value={payment.momoProvider||'airtel'} onChange={e=>setPayment({...payment, momoProvider: e.target.value as any})}>
                      <option value="airtel">Airtel</option>
                      <option value="mtn">MTN</option>
                    </select>
                    <div className="text-xs text-gray-600">Pay to HQ payout number: <strong>0973914432</strong></div>
                    <input className="input" placeholder="Payment proof URL" value={payment.paymentProofUrl||''} onChange={e=>setPayment({...payment, paymentProofUrl: e.target.value})} />
                  </>
                )}
                {payment.paymentMethod==='card' && (
                  <div className="text-xs text-gray-600">You will be redirected to our secure payment partner to complete the card payment after submitting this form.</div>
                )}
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={payment.acceptTerms} onChange={e=>setPayment({...payment, acceptTerms: e.target.checked})} />
                  I accept the Terms & Conditions
                </label>
              </div>
              {submitError && <div className="text-sm text-red-600">{submitError}</div>}
              {submitSuccess && <div className="text-sm text-green-600">{submitSuccess}</div>}
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={prevStep}>Back</button>
                <button className="btn" disabled={!payment.acceptTerms || submitting} onClick={handleSubmit}>
                  {submitting ? 'Submitting...' : 'Confirm & Submit'}
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Right column: preview */}
        <aside className="md:col-span-1">
          <div className="sticky top-4 space-y-4">
            <div className="p-3 border rounded">
              <h3 className="font-medium mb-2">Theme Preview</h3>
              <div className="h-24 rounded" style={{background: branding.primaryColor||'#FF7900'}}></div>
              {branding.logoUrl && <img src={branding.logoUrl} alt="Logo" className="mt-2 h-10 object-contain" />}
            </div>
            <div className="p-3 border rounded">
              <h3 className="font-medium">Live Pricing</h3>
              <div className="text-sm">Tier: <strong>{breakdown.tier}</strong></div>
              <div className="text-sm">Monthly total: <strong>{formatCurrency(breakdown.totalMinor)}</strong></div>
              <div className="text-sm">Annual total: <strong>{formatCurrency(breakdown.annualTotalMinor)}</strong></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function formatCurrency(minor: number) {
  const major = minor/100;
  return `ZMW ${major.toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}`;
}

function labelForModule(key: string) {
  switch (key) {
    case 'cifCalculator': return 'CIF calculator';
    case 'onlinePayments': return 'Online payments';
    case 'whatsappIntegration': return 'WhatsApp integration';
    case 'customerAccounts': return 'Customer accounts';
    case 'apiAccess': return 'API access';
    case 'multiWarehouse': return 'Multi-warehouse';
    default: return key;
  }
}
