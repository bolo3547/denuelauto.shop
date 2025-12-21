import React from 'react';

interface Staff {
  id: string;
  fullName: string;
  role: string;
  department: string;
  position?: string;
  email?: string;
  phone?: string;
  salary?: number;
}

interface EditStaffModalProps {
  staff: Staff | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: Staff) => void;
}

export default function EditStaffModal({ staff, isOpen, onClose, onSave }: EditStaffModalProps) {
  const [form, setForm] = React.useState<Partial<Staff>>({});

  React.useEffect(() => {
    if (staff) {
      setForm(staff);
    }
  }, [staff]);

  const handleSave = () => {
    if (!staff || !form.fullName?.trim()) return;
    onSave({ ...staff, ...form } as Staff);
    onClose();
  };

  if (!isOpen || !staff) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">Edit Staff Member</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={form.fullName || ''}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={form.role || ''}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="SALES_REP">Sales Rep</option>
              <option value="SALES_MANAGER">Sales Manager</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="SERVICE_MANAGER">Service Manager</option>
              <option value="FINANCE_MANAGER">Finance Manager</option>
              <option value="MARKETING_MANAGER">Marketing Manager</option>
              <option value="HR_MANAGER">HR Manager</option>
              <option value="IT_MANAGER">IT Manager</option>
              <option value="GENERAL_MANAGER">General Manager</option>
              <option value="CUSTOMER_SERVICE">Customer Service</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="LOT_ATTENDANT">Lot Attendant</option>
              <option value="SECURITY">Security</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <input
              type="text"
              value={form.department || ''}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Department"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Position</label>
            <input
              type="text"
              value={form.position || ''}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Position"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={form.email || ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone || ''}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Salary (ZMW)</label>
            <input
              type="number"
              value={form.salary || ''}
              onChange={(e) => setForm({ ...form, salary: Number(e.target.value) || 0 })}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Salary amount"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}