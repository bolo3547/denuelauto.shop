"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FaCalculator, FaCheckCircle, FaFileAlt, FaPhone, FaWhatsapp,
  FaInfoCircle, FaShieldAlt, FaClock, FaPercent, FaMoneyBillWave
} from 'react-icons/fa';
import BeForwardHeader from './BeForwardHeader';
import BeForwardFooter from './BeForwardFooter';

interface FinancingPageProps {
  tenantSlug: string;
  tenant?: any;
  cars?: any[];
}

export default function FinancingPage({ tenantSlug, tenant, cars = [] }: FinancingPageProps) {
  const searchParams = useSearchParams();
  const carStockNo = searchParams?.get('car') ?? null;
  
  const [currency, setCurrency] = useState('ZMW');
  const [selectedCar, setSelectedCar] = useState<any>(null);
  
  // Calculator state
  const [carPrice, setCarPrice] = useState(20000);
  const [deposit, setDeposit] = useState(30);
  const [months, setMonths] = useState(36);
  const [interestRate, setInterestRate] = useState(18);

  // Application form state
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationStep, setApplicationStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: '',
    dateOfBirth: '',
    address: '',
    city: '',
    // Employment Info
    employmentStatus: '',
    employer: '',
    jobTitle: '',
    monthlyIncome: '',
    yearsEmployed: '',
    // Vehicle Info
    preferredCar: carStockNo || '',
    // Documents
    idDocument: null as File | null,
    proofOfIncome: null as File | null,
    proofOfResidence: null as File | null,
  });

  useEffect(() => {
    const savedCurrency = localStorage.getItem(`denuel:currency:${tenantSlug}`);
    if (savedCurrency) setCurrency(savedCurrency);

    // If car stock number provided, find the car
    if (carStockNo) {
      const car = SAMPLE_CARS.find(c => c.stockNo === carStockNo);
      if (car) {
        setSelectedCar(car);
        setCarPrice(car.priceUsd);
        setFormData(prev => ({ ...prev, preferredCar: carStockNo }));
      }
    }
  }, [tenantSlug, carStockNo]);

  // Calculate financing
  const depositAmount = (carPrice * deposit) / 100;
  const principal = carPrice - depositAmount;
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - principal;

  const formatPrice = (price: number) => {
    if (currency === 'ZMW') return `K${(price * 27).toLocaleString()}`;
    return `$${price.toLocaleString()}`;
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmitApplication = async () => {
    // In real app, send to API
    alert('Application submitted successfully! We will contact you within 24 hours.');
    setShowApplicationForm(false);
    setApplicationStep(1);
  };

  const financingOptions = [
    {
      name: 'Standard Financing',
      rate: '18-22%',
      term: '12-48 months',
      deposit: '30% minimum',
      features: ['Quick approval', 'Flexible terms', 'No hidden fees'],
    },
    {
      name: 'Low Deposit Option',
      rate: '20-25%',
      term: '24-60 months',
      deposit: '20% minimum',
      features: ['Lower upfront cost', 'Extended terms', 'Budget-friendly'],
    },
    {
      name: 'Premium Finance',
      rate: '15-18%',
      term: '12-36 months',
      deposit: '40% minimum',
      features: ['Lowest rates', 'Priority processing', 'VIP support'],
    },
  ];

  const requirements = [
    'Valid Zambian National Registration Card (NRC) or Passport',
    'Proof of income (3 months payslips or bank statements)',
    'Proof of residence (utility bill or lease agreement)',
    'Minimum monthly income of K5,000',
    'Employment for at least 6 months',
    'Good credit history',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <BeForwardHeader tenantSlug={tenantSlug} tenant={tenant} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Car Financing Made Easy</h1>
          <p className="text-xl text-blue-200 mb-6">
            Drive your dream car today with flexible payment plans starting from K5,000/month
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
              <FaPercent className="w-5 h-5" />
              <span>From 15% p.a.</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
              <FaClock className="w-5 h-5" />
              <span>6-60 months</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
              <FaMoneyBillWave className="w-5 h-5" />
              <span>20% min deposit</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaCalculator className="text-blue-600" />
                Installment Calculator
              </h2>

              {selectedCar && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Calculating for:</p>
                  <p className="font-semibold text-gray-900">
                    {selectedCar.make} {selectedCar.model} - Stock# {selectedCar.stockNo}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Car Price (USD)
                  </label>
                  <input
                    type="number"
                    value={carPrice}
                    onChange={(e) => setCarPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1000"
                    step="500"
                  />
                  <p className="text-sm text-gray-500 mt-1">≈ {formatPrice(carPrice)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deposit: {deposit}% ({formatPrice(depositAmount)})
                  </label>
                  <input
                    type="range"
                    value={deposit}
                    onChange={(e) => setDeposit(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    min="10"
                    max="80"
                    step="5"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10%</span>
                    <span>80%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repayment Period: {months} months ({Math.floor(months / 12)} years {months % 12} mo)
                  </label>
                  <input
                    type="range"
                    value={months}
                    onChange={(e) => setMonths(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    min="6"
                    max="60"
                    step="6"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>6 mo</span>
                    <span>60 mo</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interest Rate: {interestRate}% p.a.
                  </label>
                  <input
                    type="range"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    min="10"
                    max="30"
                    step="1"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10%</span>
                    <span>30%</span>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600">Your Estimated Monthly Payment</p>
                  <p className="text-4xl font-bold text-blue-600">{formatPrice(monthlyPayment)}</p>
                  <p className="text-sm text-gray-500">per month for {months} months</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Car Price</p>
                    <p className="font-semibold">{formatPrice(carPrice)}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Deposit</p>
                    <p className="font-semibold">{formatPrice(depositAmount)}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Total Interest</p>
                    <p className="font-semibold">{formatPrice(totalInterest)}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Total Payment</p>
                    <p className="font-semibold">{formatPrice(totalPayment + depositAmount)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply for Financing
                </button>
                <Link
                  href={`/t/${tenantSlug}/stock`}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  Browse Cars
                </Link>
              </div>
            </div>

            {/* Financing Options */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Financing Options</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {financingOptions.map((option, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${
                      idx === 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    {idx === 0 && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded mb-2 inline-block">
                        Most Popular
                      </span>
                    )}
                    <h3 className="font-semibold text-gray-900 mb-3">{option.name}</h3>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><strong>Rate:</strong> {option.rate}</p>
                      <p><strong>Term:</strong> {option.term}</p>
                      <p><strong>Deposit:</strong> {option.deposit}</p>
                    </div>
                    <ul className="space-y-1">
                      {option.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <FaCheckCircle className="w-4 h-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { step: 1, title: 'Choose Your Car', desc: 'Browse our stock and select the vehicle you want' },
                  { step: 2, title: 'Apply Online', desc: 'Fill out our simple financing application form' },
                  { step: 3, title: 'Get Approved', desc: 'Receive approval within 24-48 hours' },
                  { step: 4, title: 'Drive Away', desc: 'Pay deposit and drive your new car home' },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaFileAlt className="text-blue-600" />
                Requirements
              </h3>
              <ul className="space-y-3">
                {requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <FaCheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Support */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Our financing team is here to help you find the best option for your budget.
              </p>
              <div className="space-y-3">
                {tenant?.phone && (
                  <a
                    href={`tel:${tenant.phone}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FaPhone className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Call Us</p>
                      <p className="text-xs text-gray-500">{tenant.phone}</p>
                    </div>
                  </a>
                )}
                {tenant?.whatsapp && (
                  <a
                    href={`https://wa.me/${tenant.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Hi, I need help with car financing options.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <FaWhatsapp className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">WhatsApp</p>
                      <p className="text-xs text-gray-500">Chat with us</p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaShieldAlt className="text-blue-600" />
                Why Finance With Us
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <FaCheckCircle className="w-4 h-4 text-green-500" />
                  No hidden fees or charges
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <FaCheckCircle className="w-4 h-4 text-green-500" />
                  Competitive interest rates
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <FaCheckCircle className="w-4 h-4 text-green-500" />
                  Quick approval process
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <FaCheckCircle className="w-4 h-4 text-green-500" />
                  Flexible repayment terms
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <FaCheckCircle className="w-4 h-4 text-green-500" />
                  No early repayment penalty
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Financing Application</h2>
                <button onClick={() => setShowApplicationForm(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {['Personal Info', 'Employment', 'Documents'].map((step, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      applicationStep > idx + 1
                        ? 'bg-green-500 text-white'
                        : applicationStep === idx + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {applicationStep > idx + 1 ? '✓' : idx + 1}
                    </div>
                    {idx < 2 && <div className={`w-20 h-1 mx-2 ${applicationStep > idx + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />}
                  </div>
                ))}
              </div>

              {/* Step 1: Personal Info */}
              {applicationStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleFormChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleFormChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="+260 97 XXX XXXX"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">NRC / ID Number *</label>
                      <input
                        type="text"
                        value={formData.idNumber}
                        onChange={(e) => handleFormChange('idNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleFormChange('dateOfBirth', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Residential Address *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleFormChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleFormChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Select city</option>
                      <option value="Lusaka">Lusaka</option>
                      <option value="Ndola">Ndola</option>
                      <option value="Kitwe">Kitwe</option>
                      <option value="Livingstone">Livingstone</option>
                      <option value="Kabwe">Kabwe</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 2: Employment */}
              {applicationStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status *</label>
                    <select
                      value={formData.employmentStatus}
                      onChange={(e) => handleFormChange('employmentStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="">Select status</option>
                      <option value="employed">Employed (Full-time)</option>
                      <option value="part-time">Employed (Part-time)</option>
                      <option value="self-employed">Self-Employed</option>
                      <option value="business-owner">Business Owner</option>
                      <option value="contract">Contract Worker</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employer Name *</label>
                    <input
                      type="text"
                      value={formData.employer}
                      onChange={(e) => handleFormChange('employer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => handleFormChange('jobTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income (ZMW) *</label>
                      <input
                        type="number"
                        value={formData.monthlyIncome}
                        onChange={(e) => handleFormChange('monthlyIncome', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g. 15000"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Years Employed *</label>
                      <select
                        value={formData.yearsEmployed}
                        onChange={(e) => handleFormChange('yearsEmployed', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Select</option>
                        <option value="0-1">Less than 1 year</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5+">5+ years</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Documents */}
              {applicationStep === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <p className="text-sm text-blue-700 flex items-center gap-2">
                      <FaInfoCircle />
                      Please upload clear photos or scans of the following documents
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NRC / Passport *</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('idDocument', e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proof of Income (Payslip / Bank Statement) *</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('proofOfIncome', e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proof of Residence (Utility Bill / Lease)</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange('proofOfResidence', e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Financing Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-gray-600">Car Price:</p>
                      <p className="font-medium">{formatPrice(carPrice)}</p>
                      <p className="text-gray-600">Deposit ({deposit}%):</p>
                      <p className="font-medium">{formatPrice(depositAmount)}</p>
                      <p className="text-gray-600">Monthly Payment:</p>
                      <p className="font-medium text-blue-600">{formatPrice(monthlyPayment)}</p>
                      <p className="text-gray-600">Term:</p>
                      <p className="font-medium">{months} months</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                {applicationStep > 1 ? (
                  <button
                    onClick={() => setApplicationStep(s => s - 1)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}
                {applicationStep < 3 ? (
                  <button
                    onClick={() => setApplicationStep(s => s + 1)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitApplication}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Submit Application
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <BeForwardFooter tenantSlug={tenantSlug} tenant={tenant} />
    </div>
  );
}

// Sample cars
const SAMPLE_CARS = [
  { stockNo: 'DA-001', make: 'Toyota', model: 'Harrier', priceUsd: 18500 },
  { stockNo: 'DA-002', make: 'Honda', model: 'CR-V', priceUsd: 22000 },
  { stockNo: 'DA-005', make: 'Toyota', model: 'Land Cruiser Prado', priceUsd: 35000 },
];
