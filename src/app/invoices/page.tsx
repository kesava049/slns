'use client';

import { useState } from 'react';
import { Search, Download, Eye, Calendar, Filter, Plus, X, CreditCard, Banknote, Smartphone, Building2 } from 'lucide-react';
import Link from 'next/link';
import { generateInvoicePDF } from '@/lib/generateInvoicePDF';

// Mock invoices data
const mockInvoices = [
  {
    id: '1',
    invoiceNumber: '20/25-26',
    customer: 'SRI VENKATESWARA CENTRING SUPPILERS WORKS',
    date: '2025-09-24',
    subtotal: 41975,
    tax: 7555,
    total: 49530,
    paymentMode: 'CREDIT',
    status: 'Paid',
  },
  {
    id: '2',
    invoiceNumber: '19/25-26',
    customer: 'ABC CONSTRUCTION',
    date: '2025-09-20',
    subtotal: 29661,
    tax: 5339,
    total: 35000,
    paymentMode: 'CREDIT',
    status: 'Pending',
  },
  {
    id: '3',
    invoiceNumber: '18/25-26',
    customer: 'XYZ BUILDERS',
    date: '2025-09-15',
    subtotal: 44068,
    tax: 7932,
    total: 52000,
    paymentMode: 'CASH',
    status: 'Paid',
  },
  {
    id: '4',
    invoiceNumber: '17/25-26',
    customer: 'SRI VENKATESWARA CENTRING SUPPILERS WORKS',
    date: '2025-08-28',
    subtotal: 35593,
    tax: 6407,
    total: 42000,
    paymentMode: 'CREDIT',
    status: 'Paid',
  },
  {
    id: '5',
    invoiceNumber: '16/25-26',
    customer: 'DEF INFRASTRUCTURE',
    date: '2025-08-15',
    subtotal: 25424,
    tax: 4576,
    total: 30000,
    paymentMode: 'UPI',
    status: 'Paid',
  },
];

const COMPANY_SETTINGS = {
  name: 'SRI LAXMI NARASIMHA SWAMY WELDING WORKS',
  tradeLine: 'Trader: Column Boxes, Centring Boxes',
  address: 'Sy No:45, H.No:1-35-462/4, BHEL Colony, Rasoolpura, Secunderabad, Telangana',
  email: 'srikanthkittu6@gmail.com',
  mobile: '9394749715, 9989989638',
  gstin: '36ADSFS2351R1Z6',
  stateCode: '36',
  bankName: 'UNION BANK OF INDIA',
  accountNo: '050511100004632',
  branch: 'R.P ROAD, SECUNDERABAD',
  ifscCode: 'UBIN0805050',
};

// Mock customer and items data for PDF generation
const mockCustomers: any = {
  'SRI VENKATESWARA CENTRING SUPPILERS WORKS': {
    name: 'SRI VENKATESWARA CENTRING SUPPILERS WORKS',
    address: 'MVV HARMONY, FLAT NO:204-3-80/12, YENDADA, VISAKHAPATNAM, A.P',
    state: 'ANDHRA PRADESH',
    stateCode: '37',
    gstin: '37BTIPP0332G1ZS',
    mobile: '9876543210',
  },
  'ABC CONSTRUCTION': {
    name: 'ABC CONSTRUCTION',
    address: 'Plot No. 45, Industrial Area, Secunderabad',
    state: 'TELANGANA',
    stateCode: '36',
    gstin: '36ABCDE1234F1Z5',
    mobile: '9123456789',
  },
  'XYZ BUILDERS': {
    name: 'XYZ BUILDERS',
    address: 'Industrial Area, Phase 2, Hyderabad',
    state: 'TELANGANA',
    stateCode: '36',
    gstin: '36XYZAB5678C1Z9',
    mobile: '9988776655',
  },
  'DEF INFRASTRUCTURE': {
    name: 'DEF INFRASTRUCTURE',
    address: 'Construction Zone, Madhapur, Hyderabad',
    state: 'TELANGANA',
    stateCode: '36',
    gstin: '36DEFGH9012D2Z1',
    mobile: '9876501234',
  },
};

// Sample items for PDF (would come from database in real app)
const getSampleItems = (total: number) => {
  const quantity = Math.floor(total / 73);
  return [
    {
      name: 'MS CENTRING SHEETS',
      hsnCode: '7308',
      quantity,
      rate: 73,
      uom: 'Kgs',
      amount: quantity * 73,
    },
  ];
};

export default function InvoicesPage() {
  const [invoices] = useState(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDateFrom = !dateFrom || invoice.date >= dateFrom;
    const matchesDateTo = !dateTo || invoice.date <= dateTo;
    const matchesStatus = !statusFilter || invoice.status === statusFilter;

    return matchesSearch && matchesDateFrom && matchesDateTo && matchesStatus;
  });

  const handleDownloadPDF = (invoice: any) => {
    const customer = mockCustomers[invoice.customer] || {
      name: invoice.customer,
      address: 'Not Available',
      state: 'TELANGANA',
      stateCode: '36',
      gstin: 'N/A',
      mobile: 'N/A',
    };

    const items = getSampleItems(invoice.subtotal);

    // Calculate GST based on state
    const isSameState = customer.stateCode === COMPANY_SETTINGS.stateCode;
    const cgst = isSameState ? invoice.tax / 2 : 0;
    const sgst = isSameState ? invoice.tax / 2 : 0;
    const igst = isSameState ? 0 : invoice.tax;

    // Format date as DD-MM-YYYY
    const dateObj = new Date(invoice.date);
    const formattedDate = `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;

    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: formattedDate,
      customer,
      deliveryAddress: customer.address,
      destination: customer.address.split(',')[0],
      vehicleNumber: '',
      items,
      subtotal: invoice.subtotal,
      cgst,
      sgst,
      igst,
      totalTax: invoice.tax,
      grandTotal: invoice.total,
      paymentMode: invoice.paymentMode,
    };

    generateInvoicePDF(invoiceData, COMPANY_SETTINGS);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Helper function to get payment mode icon
  const getPaymentIcon = (mode: string) => {
    switch (mode) {
      case 'CREDIT':
        return <CreditCard className="w-3.5 h-3.5" />;
      case 'CASH':
        return <Banknote className="w-3.5 h-3.5" />;
      case 'UPI':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'BANK TRANSFER':
        return <Building2 className="w-3.5 h-3.5" />;
      default:
        return <CreditCard className="w-3.5 h-3.5" />;
    }
  };

  const hasActiveFilters = searchTerm || dateFrom || dateTo || statusFilter;

  return (
    <div className="min-h-screen space-y-6">
      {/* Header with Stats Overview */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">Invoice Management</h1>
            <p className="text-blue-100 mt-2">Track and manage all your invoices</p>
          </div>
          <Link
            href="/invoices/create"
            className="flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-md"
          >
            <Plus className="w-5 h-5" />
            New Invoice
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-blue-100 text-sm font-medium">Total Amount</p>
            <p className="text-3xl font-bold mt-1">
              ₹{filteredInvoices.reduce((sum, inv) => sum + inv.total, 0).toLocaleString('en-IN')}
            </p>
            <p className="text-blue-100 text-xs mt-1">{filteredInvoices.length} invoices</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-blue-100 text-sm font-medium">Paid</p>
            <p className="text-3xl font-bold text-green-300 mt-1">
              ₹
              {filteredInvoices
                .filter((inv) => inv.status === 'Paid')
                .reduce((sum, inv) => sum + inv.total, 0)
                .toLocaleString('en-IN')}
            </p>
            <p className="text-blue-100 text-xs mt-1">
              {filteredInvoices.filter((inv) => inv.status === 'Paid').length} invoices
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-blue-100 text-sm font-medium">Pending</p>
            <p className="text-3xl font-bold text-yellow-300 mt-1">
              ₹
              {filteredInvoices
                .filter((inv) => inv.status === 'Pending')
                .reduce((sum, inv) => sum + inv.total, 0)
                .toLocaleString('en-IN')}
            </p>
            <p className="text-blue-100 text-xs mt-1">
              {filteredInvoices.filter((inv) => inv.status === 'Pending').length} invoices
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-base font-semibold text-gray-900">Filter Invoices</h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFrom('');
                  setDateTo('');
                  setStatusFilter('');
                }}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Invoice No / Customer"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                Showing {filteredInvoices.length} of {invoices.length} invoices
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Invoice No
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-blue-600">
                      #{invoice.invoiceNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {invoice.customer}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(invoice.date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-bold text-gray-900">
                      ₹{invoice.total.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {getPaymentIcon(invoice.paymentMode)}
                      {invoice.paymentMode}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                        invoice.status === 'Paid'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDownloadPDF(invoice)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm font-medium">No invoices found</p>
              <p className="text-gray-400 text-xs mt-1">
                {hasActiveFilters
                  ? 'Try adjusting your filters'
                  : 'Create your first invoice to get started'}
              </p>
              {!hasActiveFilters && (
                <Link
                  href="/invoices/create"
                  className="inline-flex items-center gap-2 mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create Invoice
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
