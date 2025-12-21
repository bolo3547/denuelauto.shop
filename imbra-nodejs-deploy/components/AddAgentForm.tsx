import React, { useState } from 'react';
import { FaUser, FaPercent, FaTrophy, FaTimes } from 'react-icons/fa';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface AddAgentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agentData: any) => void;
  users: User[];
  loading?: boolean;
}

export default function AddAgentForm({ isOpen, onClose, onSave, users, loading = false }: AddAgentFormProps) {
  const [formData, setFormData] = useState({
    userId: '',
    baseCommission: 5.0,
    bonusCommission: 0.0,
    tier: 'BRONZE'
  });

  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.userId) {
      newErrors.userId = 'Please select a user';
    }

    if (formData.baseCommission < 0 || formData.baseCommission > 20) {
      newErrors.baseCommission = 'Base commission must be between 0% and 20%';
    }

    if (formData.bonusCommission < 0 || formData.bonusCommission > 10) {
      newErrors.bonusCommission = 'Bonus commission must be between 0% and 10%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onSave(formData);
    
    // Reset form
    setFormData({
      userId: '',
      baseCommission: 5.0,
      bonusCommission: 0.0,
      tier: 'BRONZE'
    });
    setErrors({});
  };

  const handleClose = () => {
    setFormData({
      userId: '',
      baseCommission: 5.0,
      bonusCommission: 0.0,
      tier: 'BRONZE'
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const availableUsers = users.filter(user => 
    // Filter out users who are already agents (this would come from the API)
    true // For now, show all users
  );

  const selectedUser = availableUsers.find(user => user.id === formData.userId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold">Add New Agent</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaUser className="inline mr-2" />
              Select User
            </label>
            <select
              value={formData.userId}
              onChange={(e) => handleInputChange('userId', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                errors.userId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Choose a user to make an agent...</option>
              {availableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
            {errors.userId && (
              <p className="text-red-500 text-sm mt-1">{errors.userId}</p>
            )}
          </div>

          {/* Selected User Info */}
          {selectedUser && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900">Selected User</h4>
              <p className="text-sm text-blue-700">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p className="text-sm text-blue-600">{selectedUser.email}</p>
              {selectedUser.phone && (
                <p className="text-sm text-blue-600">{selectedUser.phone}</p>
              )}
            </div>
          )}

          {/* Agent Tier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaTrophy className="inline mr-2" />
              Agent Tier
            </label>
            <select
              value={formData.tier}
              onChange={(e) => handleInputChange('tier', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="BRONZE">Bronze (Entry Level)</option>
              <option value="SILVER">Silver (Experienced)</option>
              <option value="GOLD">Gold (Senior)</option>
              <option value="PLATINUM">Platinum (Elite)</option>
            </select>
          </div>

          {/* Commission Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPercent className="inline mr-2" />
                Base Commission (%)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={formData.baseCommission}
                onChange={(e) => handleInputChange('baseCommission', parseFloat(e.target.value))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                  errors.baseCommission ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.baseCommission && (
                <p className="text-red-500 text-sm mt-1">{errors.baseCommission}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaPercent className="inline mr-2" />
                Bonus Commission (%)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formData.bonusCommission}
                onChange={(e) => handleInputChange('bonusCommission', parseFloat(e.target.value))}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                  errors.bonusCommission ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.bonusCommission && (
                <p className="text-red-500 text-sm mt-1">{errors.bonusCommission}</p>
              )}
            </div>
          </div>

          {/* Commission Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Commission Structure</h4>
            <p className="text-sm text-gray-600">
              Total Commission Rate: <span className="font-medium">
                {(formData.baseCommission + formData.bonusCommission).toFixed(1)}%
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Base commission is guaranteed on all sales. Bonus commission may be awarded based on performance.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.userId}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {loading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}