'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

// Mock data
const mockCustomers = [
  {
    id: '1',
    name: 'SRI VENKATESWARA CENTRING SUPPILERS WORKS',
    address: 'MVV HARMONY, FLAT NO:204-3-80/12, YENDADA, VISAKHAPATNAM',
    state: 'ANDHRA PRADESH',
    stateCode: '37',
    gstin: '37BTIPP0332G1ZS',
    mobile: '9876543210',
    email: 'sri.venkateswara@example.com',
  },
  {
    id: '2',
    name: 'ABC CONSTRUCTION',
    address: 'Plot No. 45, Industrial Area, Secunderabad',
    state: 'TELANGANA',
    stateCode: '36',
    gstin: '36ABCDE1234F1Z5',
    mobile: '9123456789',
    email: 'abc.construction@example.com',
  },
];

const indianStates = [
  { name: 'ANDHRA PRADESH', code: '37' },
  { name: 'TELANGANA', code: '36' },
  { name: 'KARNATAKA', code: '29' },
  { name: 'TAMIL NADU', code: '33' },
  { name: 'MAHARASHTRA', code: '27' },
  { name: 'DELHI', code: '07' },
  // Add more states as needed
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState(mockCustomers);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    state: '',
    stateCode: '',
    gstin: '',
    mobile: '',
    email: '',
  });

  const handleAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      address: '',
      state: '',
      stateCode: '',
      gstin: '',
      mobile: '',
      email: '',
    });
    setShowModal(true);
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  const handleStateChange = (stateName: string) => {
    const state = indianStates.find((s) => s.name === stateName);
    setFormData({
      ...formData,
      state: stateName,
      stateCode: state?.code || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCustomer) {
      // Update existing customer
      setCustomers(
        customers.map((c) => (c.id === editingCustomer.id ? { ...c, ...formData } : c))
      );
    } else {
      // Add new customer
      const newCustomer = {
        id: (customers.length + 1).toString(),
        ...formData,
      };
      setCustomers([...customers, newCustomer]);
    }

    setShowModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-2">Manage your customer database</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                GSTIN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                State
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mobile
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                  <div className="text-sm text-gray-500">{customer.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {customer.gstin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {customer.state}
                  <span className="text-gray-400 ml-2">({customer.stateCode})</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {customer.mobile}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full m-4">
            <h2 className="text-2xl font-bold mb-6">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select State</option>
                    {indianStates.map((state) => (
                      <option key={state.code} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State Code *
                  </label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={formData.stateCode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GSTIN
                </label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCustomer ? 'Update' : 'Add'} Customer
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
