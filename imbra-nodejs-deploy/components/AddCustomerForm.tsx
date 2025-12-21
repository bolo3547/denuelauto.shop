import React, { useState } from 'react';
import { FaTimes, FaSave, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaDollarSign } from 'react-icons/fa';

interface AddCustomerFormProps {
  onClose: () => void;
  onSave: (customerData: any) => void;
  cars?: Array<{
    id: string;
    stockNo: string;
    make: string;
    model: string;
    year: number;
    priceUsd: number;
  }>;
}

export default function AddCustomerForm({ onClose, onSave, cars = [] }: AddCustomerFormProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    location: '',
    source: 'WEBSITE',
    priority: 'MEDIUM',
    status: 'NEW',
    assignedToId: '',
    interestedCars: [] as string[],
    budget: {
      min: '',
      max: '',
      currency: 'USD'
    },
    notes: '',
    tags: [] as string[],
    initialInquiry: {
      message: '',
      type: 'GENERAL',
      carId: ''
    }
  });

  const [currentTag, setCurrentTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!form.name || !form.email || !form.phone) {
      alert('Please fill in required fields: Name, Email, Phone');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Phone validation (basic)
    if (form.phone.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    const customerData = {
      ...form,
      budget: (form.budget.min || form.budget.max) ? {
        min: parseFloat(form.budget.min) || 0,
        max: parseFloat(form.budget.max) || 0,
        currency: form.budget.currency
      } : null,
      whatsapp: form.whatsapp || null,
      assignedToId: form.assignedToId || null
    };

    onSave(customerData);
  };

  const addTag = () => {
    if (currentTag.trim() && !form.tags.includes(currentTag.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleInterestedCar = (carId: string) => {
    setForm(prev => ({
      ...prev,
      interestedCars: prev.interestedCars.includes(carId)
        ? prev.interestedCars.filter(id => id !== carId)
        : [...prev.interestedCars, carId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FaUser className="text-blue-600" />
            Add New Customer
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="John Mwansa"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="john.mwansa@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="+260977123456"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => setForm({...form, whatsapp: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="+260977123456"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({...form, location: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Lusaka, Zambia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm({...form, source: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="WEBSITE">Website</option>
                <option value="PHONE">Phone Call</option>
                <option value="REFERRAL">Referral</option>
                <option value="WALK_IN">Walk-in</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="IMPORT">Data Import</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({...form, priority: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Assign to Sales Rep</label>
              <select
                value={form.assignedToId}
                onChange={(e) => setForm({...form, assignedToId: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                <option value="user_1">Sales Rep 1</option>
                <option value="user_2">Sales Rep 2</option>
                <option value="user_3">Sales Manager</option>
              </select>
            </div>
          </div>

          {/* Budget Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaDollarSign className="text-green-600" />
              Budget Range
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Budget</label>
                <input
                  type="number"
                  value={form.budget.min}
                  onChange={(e) => setForm({
                    ...form,
                    budget: { ...form.budget, min: e.target.value }
                  })}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Maximum Budget</label>
                <input
                  type="number"
                  value={form.budget.max}
                  onChange={(e) => setForm({
                    ...form,
                    budget: { ...form.budget, max: e.target.value }
                  })}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="20000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select
                  value={form.budget.currency}
                  onChange={(e) => setForm({
                    ...form,
                    budget: { ...form.budget, currency: e.target.value }
                  })}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="ZMW">ZMW</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interested Cars */}
          {cars.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Interested Cars</h3>
              <div className="max-h-40 overflow-y-auto border rounded p-3">
                {cars.map((car) => (
                  <label key={car.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.interestedCars.includes(car.id)}
                      onChange={() => toggleInterestedCar(car.id)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {car.stockNo} - {car.make} {car.model} {car.year}
                      </div>
                      <div className="text-sm text-gray-600">
                        ${car.priceUsd?.toLocaleString()}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tags</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Add Tag
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Initial Inquiry */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Initial Inquiry (Optional)</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Inquiry Type</label>
                  <select
                    value={form.initialInquiry.type}
                    onChange={(e) => setForm({
                      ...form,
                      initialInquiry: { ...form.initialInquiry, type: e.target.value }
                    })}
                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GENERAL">General Inquiry</option>
                    <option value="PRICE_REQUEST">Price Request</option>
                    <option value="FINANCE_INQUIRY">Finance Inquiry</option>
                    <option value="TRADE_IN">Trade-in</option>
                    <option value="TEST_DRIVE">Test Drive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Related Car</label>
                  <select
                    value={form.initialInquiry.carId}
                    onChange={(e) => setForm({
                      ...form,
                      initialInquiry: { ...form.initialInquiry, carId: e.target.value }
                    })}
                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No specific car</option>
                    {cars.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.stockNo} - {car.make} {car.model} {car.year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Inquiry Message</label>
                <textarea
                  value={form.initialInquiry.message}
                  onChange={(e) => setForm({
                    ...form,
                    initialInquiry: { ...form.initialInquiry, message: e.target.value }
                  })}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Customer's initial inquiry or message..."
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({...form, notes: e.target.value})}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes about the customer..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <FaSave /> Add Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}