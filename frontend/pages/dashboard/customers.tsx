import React, { useState, useEffect } from 'react';
import { FaUsers, FaPlus, FaSearch, FaFilter, FaEye, FaEdit, FaPhone, FaEnvelope, FaWhatsapp, FaCar, FaCalendar, FaDollarSign, FaChartLine, FaUserPlus, FaFileAlt, FaCheckCircle, FaTimes } from 'react-icons/fa';
import AddCustomerForm from '../../components/AddCustomerForm';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  source: string;
  status: string;
  priority: string;
  assignedTo?: string;
  interestedCars: string[];
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  location?: string;
  notes?: string;
  inquiries: Inquiry[];
  createdAt: string;
  lastContact?: string;
  nextFollowUp?: string;
}

interface Inquiry {
  id: string;
  carId?: string;
  carDetails?: string;
  message: string;
  type: string; // GENERAL, PRICE_REQUEST, FINANCE_INQUIRY, TRADE_IN, TEST_DRIVE
  status: string; // NEW, RESPONDED, FOLLOW_UP, CONVERTED, CLOSED
  createdAt: string;
  respondedAt?: string;
  response?: string;
}

interface Car {
  id: string;
  stockNo: string;
  make: string;
  model: string;
  year: number;
  priceUsd: number;
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState<Car[]>([]);

  // Load customers and mock data
  useEffect(() => {
    loadCustomers();
    loadCars();
  }, []);

  const loadCars = async () => {
    const fallbackCars = [
      { id: '1', stockNo: 'CAR001', make: 'Toyota', model: 'Camry', year: 2020, priceUsd: 15000 },
      { id: '2', stockNo: 'CAR002', make: 'Honda', model: 'Civic', year: 2019, priceUsd: 12000 }
    ];
    try {
      const res = await fetch('/api/cars');
      if (res.ok) {
        const data = await res.json();
        setCars(data.cars || data || fallbackCars);
      } else {
        setCars(fallbackCars);
      }
    } catch (error) {
      console.error('Failed to load cars:', error);
      setCars(fallbackCars);
    }
  };

  const loadCustomers = async () => {
    const mockCustomers: Customer[] = [
        {
          id: '1',
          name: 'John Mwansa',
          email: 'john.mwansa@email.com',
          phone: '+260977123456',
          whatsapp: '+260977123456',
          source: 'WEBSITE',
          status: 'QUALIFIED',
          priority: 'HIGH',
          assignedTo: 'Sales Rep 1',
          interestedCars: ['CAR001', 'CAR002'],
          budget: { min: 10000, max: 20000, currency: 'USD' },
          location: 'Lusaka',
          notes: 'Looking for family sedan, prefers Toyota',
          inquiries: [
            {
              id: 'inq1',
              carId: 'CAR001',
              carDetails: 'Toyota Camry 2020',
              message: 'I am interested in this car. What is the final price including all costs?',
              type: 'PRICE_REQUEST',
              status: 'RESPONDED',
              createdAt: '2024-12-01T10:00:00Z',
              respondedAt: '2024-12-01T14:30:00Z',
              response: 'Thank you for your interest. The total landing cost including CIF is $18,500.'
            }
          ],
          createdAt: '2024-12-01T10:00:00Z',
          lastContact: '2024-12-03T15:30:00Z',
          nextFollowUp: '2024-12-06T10:00:00Z'
        },
        {
          id: '2',
          name: 'Mary Banda',
          email: 'mary.banda@gmail.com',
          phone: '+260966789012',
          source: 'REFERRAL',
          status: 'NEW',
          priority: 'MEDIUM',
          interestedCars: ['CAR003'],
          budget: { min: 5000, max: 12000, currency: 'USD' },
          location: 'Kitwe',
          inquiries: [
            {
              id: 'inq2',
              message: 'Do you have any Honda Civic available? Looking for automatic transmission.',
              type: 'GENERAL',
              status: 'NEW',
              createdAt: '2024-12-04T08:15:00Z'
            }
          ],
          createdAt: '2024-12-04T08:15:00Z'
        },
        {
          id: '3',
          name: 'Peter Sikwese',
          email: 'peter.sikwese@company.zm',
          phone: '+260955345678',
          whatsapp: '+260955345678',
          source: 'SOCIAL_MEDIA',
          status: 'NEGOTIATING',
          priority: 'HIGH',
          assignedTo: 'Sales Rep 2',
          interestedCars: ['CAR004'],
          budget: { min: 15000, max: 25000, currency: 'USD' },
          location: 'Ndola',
          notes: 'Fleet purchase - 3 vehicles, prefers SUVs',
          inquiries: [
            {
              id: 'inq3',
              carId: 'CAR004',
              carDetails: 'Toyota Prado 2019',
              message: 'Can you provide bulk pricing for 3 vehicles? Need delivery to Ndola.',
              type: 'PRICE_REQUEST',
              status: 'FOLLOW_UP',
              createdAt: '2024-12-02T16:20:00Z',
              respondedAt: '2024-12-02T18:45:00Z',
              response: 'We can offer 5% discount for 3+ vehicles. Delivery to Ndola included.'
            }
          ],
          createdAt: '2024-12-02T16:20:00Z',
          lastContact: '2024-12-04T11:20:00Z',
          nextFollowUp: '2024-12-05T14:00:00Z'
        }
      ];
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        const loaded = data.customers || data || mockCustomers;
        setCustomers(loaded);
        setFilteredCustomers(loaded);
      } else {
        setCustomers(mockCustomers);
        setFilteredCustomers(mockCustomers);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load customers:', error);
      setCustomers(mockCustomers);
      setFilteredCustomers(mockCustomers);
      setLoading(false);
    }
  };

  // Filter customers based on search and filters
  useEffect(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || customer.source === sourceFilter;
      const matchesPriority = priorityFilter === 'all' || customer.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesSource && matchesPriority;
    });
    
    setFilteredCustomers(filtered);
  }, [customers, searchTerm, statusFilter, sourceFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'NEW': 'bg-blue-100 text-blue-800',
      'CONTACTED': 'bg-yellow-100 text-yellow-800',
      'QUALIFIED': 'bg-green-100 text-green-800',
      'PROPOSAL_SENT': 'bg-purple-100 text-purple-800',
      'NEGOTIATING': 'bg-orange-100 text-orange-800',
      'WON': 'bg-green-200 text-green-900',
      'LOST': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'LOW': 'text-gray-500',
      'MEDIUM': 'text-yellow-500',
      'HIGH': 'text-orange-500',
      'URGENT': 'text-red-500'
    };
    return colors[priority] || 'text-gray-500';
  };

  const getSourceIcon = (source: string) => {
    const icons: { [key: string]: JSX.Element } = {
      'WEBSITE': <FaUsers className="text-blue-500" />,
      'PHONE': <FaPhone className="text-green-500" />,
      'REFERRAL': <FaUserPlus className="text-purple-500" />,
      'WALK_IN': <FaCar className="text-orange-500" />,
      'SOCIAL_MEDIA': <FaWhatsapp className="text-green-600" />
    };
    return icons[source] || <FaUsers className="text-gray-500" />;
  };

  const handleStatusChange = async (customerId: string, newStatus: string) => {
    setCustomers(customers.map(customer =>
      customer.id === customerId ? { ...customer, status: newStatus } : customer
    ));
    try {
      await fetch(`/api/customers/${customerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error('Failed to update customer status:', error);
    }
  };

  const handleAssignCustomer = async (customerId: string, salesRep: string) => {
    setCustomers(customers.map(customer =>
      customer.id === customerId ? { ...customer, assignedTo: salesRep } : customer
    ));
    try {
      await fetch(`/api/customers/${customerId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: salesRep })
      });
    } catch (error) {
      console.error('Failed to assign customer:', error);
    }
  };

  const viewCustomerDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetail(true);
  };

  const handleSaveCustomer = async (customerData: any) => {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      let newCustomer;
      if (res.ok) {
        newCustomer = await res.json();
      } else {
        newCustomer = {
        id: `${Date.now()}`,
        ...customerData,
        inquiries: customerData.initialInquiry?.message ? [
          {
            id: `inq_${Date.now()}`,
            message: customerData.initialInquiry.message,
            type: customerData.initialInquiry.type,
            status: 'NEW',
            createdAt: new Date().toISOString(),
            carId: customerData.initialInquiry.carId || null,
            carDetails: customerData.initialInquiry.carId ? 
              cars.find((car: any) => car.id === customerData.initialInquiry.carId)?.stockNo : null
          }
        ] : [],
        createdAt: new Date().toISOString()
        };
      }
      
      setCustomers([newCustomer, ...customers]);
      setShowAddCustomer(false);
    } catch (error) {
      console.error('Failed to save customer:', error);
      alert('Failed to save customer. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaUsers className="text-blue-600" />
                Customer Management
              </h1>
              <p className="text-gray-600 mt-2">Manage customer inquiries and sales pipeline</p>
            </div>
            
            <button
              onClick={() => setShowAddCustomer(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <FaPlus /> Add Customer
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
              <FaUsers className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'NEW').length}
                </p>
              </div>
              <FaFileAlt className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Qualified Leads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'QUALIFIED').length}
                </p>
              </div>
              <FaCheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Negotiations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'NEGOTIATING').length}
                </p>
              </div>
              <FaDollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customers.filter(c => c.status === 'WON').length}
                </p>
              </div>
              <FaChartLine className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="PROPOSAL_SENT">Proposal Sent</option>
              <option value="NEGOTIATING">Negotiating</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sources</option>
              <option value="WEBSITE">Website</option>
              <option value="PHONE">Phone</option>
              <option value="REFERRAL">Referral</option>
              <option value="WALK_IN">Walk-in</option>
              <option value="SOCIAL_MEDIA">Social Media</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                      Loading customers...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.location}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <FaPhone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(customer.source)}
                          <span className="text-sm text-gray-900">{customer.source}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={customer.status}
                          onChange={(e) => handleStatusChange(customer.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusColor(customer.status)}`}
                        >
                          <option value="NEW">New</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="QUALIFIED">Qualified</option>
                          <option value="PROPOSAL_SENT">Proposal Sent</option>
                          <option value="NEGOTIATING">Negotiating</option>
                          <option value="WON">Won</option>
                          <option value="LOST">Lost</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getPriorityColor(customer.priority)}`}>
                          {customer.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.budget ? (
                          <div className="text-sm text-gray-900">
                            ${customer.budget.min.toLocaleString()} - ${customer.budget.max.toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Not specified</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={customer.assignedTo || ''}
                          onChange={(e) => handleAssignCustomer(customer.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="">Unassigned</option>
                          <option value="Sales Rep 1">Sales Rep 1</option>
                          <option value="Sales Rep 2">Sales Rep 2</option>
                          <option value="Sales Manager">Sales Manager</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.lastContact ? new Date(customer.lastContact).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewCustomerDetail(customer)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowCustomerDetail(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FaEdit />
                          </button>
                          <a
                            href={`tel:${customer.phone}`}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FaPhone />
                          </a>
                          <a
                            href={`mailto:${customer.email}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEnvelope />
                          </a>
                          {customer.whatsapp && (
                            <a
                              href={`https://wa.me/${customer.whatsapp.replace('+', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-900"
                            >
                              <FaWhatsapp />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {showCustomerDetail && selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => {
            setShowCustomerDetail(false);
            setSelectedCustomer(null);
          }}
          onUpdate={(updatedCustomer) => {
            setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
          }}
        />
      )}

      {/* Add Customer Form Modal */}
      {showAddCustomer && (
        <AddCustomerForm
          onClose={() => setShowAddCustomer(false)}
          onSave={handleSaveCustomer}
          cars={cars}
        />
      )}
    </div>
  );
}

// Customer Detail Modal Component
interface CustomerDetailModalProps {
  customer: Customer;
  onClose: () => void;
  onUpdate: (customer: Customer) => void;
}

function CustomerDetailModal({ customer, onClose, onUpdate }: CustomerDetailModalProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<string>('');

  const addNote = () => {
    if (!newNote.trim()) return;
    fetch(`/api/customers/${customer.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: newNote })
    }).catch(err => console.error('Failed to add note:', err));
    onUpdate({ ...customer, notes: (customer.notes ? customer.notes + '\n' : '') + newNote });
    setNewNote('');
  };

  const respondToInquiry = (inquiryId: string) => {
    if (!newResponse.trim()) return;
    fetch(`/api/customers/${customer.id}/inquiries/${inquiryId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: newResponse })
    }).catch(err => console.error('Failed to respond to inquiry:', err));
    const updatedInquiries = customer.inquiries.map(inq =>
      inq.id === inquiryId ? { ...inq, response: newResponse, respondedAt: new Date().toISOString(), status: 'RESPONDED' } : inq
    );
    onUpdate({ ...customer, inquiries: updatedInquiries });
    setNewResponse('');
    setSelectedInquiry('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">{customer.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-6 py-3 font-medium ${activeTab === 'inquiries' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            Inquiries ({customer.inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-6 py-3 font-medium ${activeTab === 'activity' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            Activity
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FaEnvelope className="text-gray-400" />
                      <span>{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FaPhone className="text-gray-400" />
                      <span>{customer.phone}</span>
                    </div>
                    {customer.whatsapp && (
                      <div className="flex items-center gap-3">
                        <FaWhatsapp className="text-green-500" />
                        <span>{customer.whatsapp}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Customer Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600">Location:</span> {customer.location}
                    </div>
                    <div>
                      <span className="text-gray-600">Source:</span> {customer.source}
                    </div>
                    <div>
                      <span className="text-gray-600">Priority:</span> 
                      <span className={`ml-2 font-medium ${getPriorityColor(customer.priority)}`}>
                        {customer.priority}
                      </span>
                    </div>
                    {customer.budget && (
                      <div>
                        <span className="text-gray-600">Budget:</span> 
                        ${customer.budget.min.toLocaleString()} - ${customer.budget.max.toLocaleString()} {customer.budget.currency}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{customer.notes || 'No notes added yet.'}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="Add a note..."
                  />
                  <button
                    onClick={addNote}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              {customer.inquiries.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No inquiries yet.</p>
              ) : (
                customer.inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(inquiry.status)}`}>
                          {inquiry.status}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          {inquiry.type} • {new Date(inquiry.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {inquiry.carDetails && (
                        <span className="text-sm font-medium text-blue-600">{inquiry.carDetails}</span>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-gray-800">{inquiry.message}</p>
                    </div>

                    {inquiry.response && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <div className="text-sm text-gray-600 mb-1">
                          Response • {inquiry.respondedAt ? new Date(inquiry.respondedAt).toLocaleString() : ''}
                        </div>
                        <p className="text-gray-800">{inquiry.response}</p>
                      </div>
                    )}

                    {inquiry.status !== 'RESPONDED' && inquiry.status !== 'CONVERTED' && (
                      <div className="border-t pt-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={selectedInquiry === inquiry.id ? newResponse : ''}
                            onChange={(e) => {
                              setSelectedInquiry(inquiry.id);
                              setNewResponse(e.target.value);
                            }}
                            className="flex-1 border rounded px-3 py-2 text-sm"
                            placeholder="Type your response..."
                          />
                          <button
                            onClick={() => respondToInquiry(inquiry.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                          >
                            Respond
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                Activity timeline coming soon...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'LOW': 'text-gray-500',
      'MEDIUM': 'text-yellow-500',
      'HIGH': 'text-orange-500',
      'URGENT': 'text-red-500'
    };
    return colors[priority] || 'text-gray-500';
  }

  function getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'NEW': 'bg-blue-100 text-blue-800',
      'CONTACTED': 'bg-yellow-100 text-yellow-800',
      'QUALIFIED': 'bg-green-100 text-green-800',
      'PROPOSAL_SENT': 'bg-purple-100 text-purple-800',
      'NEGOTIATING': 'bg-orange-100 text-orange-800',
      'WON': 'bg-green-200 text-green-900',
      'LOST': 'bg-red-100 text-red-800',
      'RESPONDED': 'bg-green-100 text-green-800',
      'FOLLOW_UP': 'bg-yellow-100 text-yellow-800',
      'CONVERTED': 'bg-green-200 text-green-900',
      'CLOSED': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}
