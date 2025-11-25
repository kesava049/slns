'use client';

import { IndianRupee, FileText, Users, Package } from 'lucide-react';

const stats = [
  {
    name: 'Total Revenue',
    value: '₹4,95,300',
    icon: IndianRupee,
    change: '+12.5%',
    changeType: 'positive',
  },
  {
    name: 'Total Invoices',
    value: '24',
    icon: FileText,
    change: '+3',
    changeType: 'positive',
  },
  {
    name: 'Active Customers',
    value: '18',
    icon: Users,
    change: '+2',
    changeType: 'positive',
  },
  {
    name: 'Products',
    value: '15',
    icon: Package,
    change: '+5',
    changeType: 'positive',
  },
];

const recentInvoices = [
  {
    id: '20/25-26',
    customer: 'SRI VENKATESWARA CENTRING SUPPILERS',
    date: '24-09-2025',
    amount: 49530,
    status: 'Paid',
  },
  {
    id: '19/25-26',
    customer: 'ABC CONSTRUCTION',
    date: '20-09-2025',
    amount: 35000,
    status: 'Pending',
  },
  {
    id: '18/25-26',
    customer: 'XYZ BUILDERS',
    date: '15-09-2025',
    amount: 52000,
    status: 'Paid',
  },
];

export default function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to SLNS Billing Software</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-2">{stat.change} from last month</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Recent Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {invoice.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {invoice.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{invoice.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
