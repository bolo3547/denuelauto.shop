import React, { useState } from 'react';
import { FaUpload, FaImage, FaVideo, FaCube, FaSave, FaTimes } from 'react-icons/fa';

interface AddCarFormProps {
  onClose: () => void;
  onSave: (carData: any) => void;
}

export default function AddCarForm({ onClose, onSave }: AddCarFormProps) {
  const [form, setForm] = useState({
    stockNo: '',
    vin: '',
    make: '',
    model: '',
    grade: '',
    year: new Date().getFullYear(),
    bodyType: '',
    transmission: 'Manual',
    drivetrain: 'FWD',
    fuelType: 'Petrol',
    engineCc: '',
    mileageKm: '',
    colorExt: '',
    colorInt: '',
    steering: 'Left',
    condition: 'used',
    priceLocalZmw: '',
    priceUsd: '',
    remarks: '',
    publishToPublic: false,
    publishToExport: false
  });

  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [vr360Images, setVr360Images] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.stockNo || !form.make || !form.model || !form.year) {
      alert('Please fill in required fields: Stock No, Make, Model, Year');
      return;
    }

    const uploadFile = async (file: File): Promise<string> => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const signRes = await fetch('/api/uploads/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ filename: file.name, contentType: file.type })
      });
      if (!signRes.ok) throw new Error('Failed to sign upload');
      const { uploadUrl, fileUrl } = await signRes.json();
      const putRes = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file });
      if (!putRes.ok) throw new Error('Upload failed');
      return fileUrl as string;
    };

    try {
      const imageUrls: string[] = [];
      for (const f of images) {
        imageUrls.push(await uploadFile(f));
      }
      const videoUrls: string[] = [];
      for (const f of videos) {
        videoUrls.push(await uploadFile(f));
      }
      const vr360Urls: string[] = [];
      for (const f of vr360Images) {
        vr360Urls.push(await uploadFile(f));
      }

      onSave({
        ...form,
        images: imageUrls,
        videos: videoUrls,
        vr360: vr360Urls
      });
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please try again.');
    }
  };

  const handleVinLookup = async () => {
    if (!form.vin || form.vin.length !== 17) {
      alert('Please enter a valid 17-character VIN');
      return;
    }

    try {
      const response = await fetch(`/api/vin-lookup?vin=${encodeURIComponent(form.vin)}`);
      const vinData = await response.json();

      if (!response.ok) {
        throw new Error(vinData.error || 'VIN lookup failed');
      }

      // Auto-fill form with VIN data
      setForm(prev => ({
        ...prev,
        make: vinData.make || prev.make,
        model: vinData.model || prev.model,
        year: vinData.year || prev.year,
        bodyType: vinData.bodyType || prev.bodyType,
        engineCc: vinData.engineCc?.toString() || prev.engineCc,
        fuelType: vinData.fuelType || prev.fuelType,
        transmission: vinData.transmission || prev.transmission,
        drivetrain: vinData.drivetrain || prev.drivetrain
      }));

      alert(`VIN decoded successfully! Confidence: ${Math.round((vinData.confidence || 0) * 100)}%`);
    } catch (error) {
      console.error('VIN lookup error:', error);
      alert('VIN lookup failed. Please check the VIN and try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Add New Car</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stock Number *</label>
              <input
                type="text"
                value={form.stockNo}
                onChange={(e) => setForm({...form, stockNo: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., CAR001"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">VIN</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.vin}
                  onChange={(e) => setForm({...form, vin: e.target.value})}
                  className="flex-1 border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Vehicle Identification Number"
                />
                <button
                  type="button"
                  onClick={handleVinLookup}
                  className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                >
                  Lookup
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Condition</label>
              <select
                value={form.condition}
                onChange={(e) => setForm({...form, condition: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="used">Used</option>
                <option value="new">New</option>
                <option value="salvage">Salvage</option>
              </select>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Make *</label>
              <input
                type="text"
                value={form.make}
                onChange={(e) => setForm({...form, make: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Toyota"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Model *</label>
              <input
                type="text"
                value={form.model}
                onChange={(e) => setForm({...form, model: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Camry"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Grade</label>
              <input
                type="text"
                value={form.grade}
                onChange={(e) => setForm({...form, grade: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="G, X, S"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Year *</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({...form, year: parseInt(e.target.value)})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                min="1990"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
          </div>

          {/* Technical Specs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Body Type</label>
              <select
                value={form.bodyType}
                onChange={(e) => setForm({...form, bodyType: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select body type</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Wagon">Wagon</option>
                <option value="Coupe">Coupe</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Transmission</label>
              <select
                value={form.transmission}
                onChange={(e) => setForm({...form, transmission: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
                <option value="CVT">CVT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fuel Type</label>
              <select
                value={form.fuelType}
                onChange={(e) => setForm({...form, fuelType: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Engine CC</label>
              <input
                type="number"
                value={form.engineCc}
                onChange={(e) => setForm({...form, engineCc: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="1800"
              />
            </div>
          </div>

          {/* Colors and Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Exterior Color</label>
              <input
                type="text"
                value={form.colorExt}
                onChange={(e) => setForm({...form, colorExt: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="White"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Interior Color</label>
              <input
                type="text"
                value={form.colorInt}
                onChange={(e) => setForm({...form, colorInt: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Steering</label>
              <select
                value={form.steering}
                onChange={(e) => setForm({...form, steering: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Left">Left Hand Drive</option>
                <option value="Right">Right Hand Drive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mileage (KM)</label>
              <input
                type="number"
                value={form.mileageKm}
                onChange={(e) => setForm({...form, mileageKm: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="50000"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price (ZMW)</label>
              <input
                type="number"
                value={form.priceLocalZmw}
                onChange={(e) => setForm({...form, priceLocalZmw: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="150000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price (USD)</label>
              <input
                type="number"
                value={form.priceUsd}
                onChange={(e) => setForm({...form, priceUsd: e.target.value})}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="7500"
              />
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Media Upload</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <FaImage className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <label className="cursor-pointer">
                  <span className="text-sm font-medium text-blue-600 hover:text-blue-500">Upload Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(Array.from(e.target.files || []))}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                {images.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">{images.length} files selected</p>
                )}
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <FaVideo className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <label className="cursor-pointer">
                  <span className="text-sm font-medium text-blue-600 hover:text-blue-500">Upload Videos</span>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={(e) => setVideos(Array.from(e.target.files || []))}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">MP4, MOV up to 50MB</p>
                {videos.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">{videos.length} files selected</p>
                )}
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <FaCube className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <label className="cursor-pointer">
                  <span className="text-sm font-medium text-blue-600 hover:text-blue-500">Upload 360° Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setVr360Images(Array.from(e.target.files || []))}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">360° panoramic images</p>
                {vr360Images.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">{vr360Images.length} files selected</p>
                )}
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <textarea
              value={form.remarks}
              onChange={(e) => setForm({...form, remarks: e.target.value})}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional notes about the vehicle..."
            />
          </div>

          {/* Publishing Options */}
          <div className="flex flex-col md:flex-row gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.publishToPublic}
                onChange={(e) => setForm({...form, publishToPublic: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm">Publish to Public Website</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.publishToExport}
                onChange={(e) => setForm({...form, publishToExport: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm">Publish to Export Portal</span>
            </label>
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
              <FaSave /> Save Car
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}