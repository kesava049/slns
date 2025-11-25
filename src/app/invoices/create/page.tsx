'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateInvoicePDF } from '@/lib/generateInvoicePDF';

// Mock data
const mockCustomers = [
  {
    id: '1',
    name: 'SRI VENKATESWARA CENTRING SUPPILERS WORKS',
    address: 'MVV HARMONY, FLAT NO:204-3-80/12, YENDADA, VISAKHAPATNAM',
    state: 'ANDHRA PRADESH',
    stateCode: '37',
    gstin: '37BTIPP0332G1ZS',
  },
  {
    id: '2',
    name: 'ABC CONSTRUCTION',
    address: 'Plot No. 45, Industrial Area, Secunderabad',
    state: 'TELANGANA',
    stateCode: '36',
    gstin: '36ABCDE1234F1Z5',
  },
];

const mockProducts = [
  { id: '1', name: 'MS CENTRING SHEETS', hsnCode: '7308', rate: 73, uom: 'Kgs' },
  { id: '2', name: 'VERTICAL PIPES', hsnCode: '7308', rate: 75, uom: 'Kgs' },
  { id: '3', name: 'LEDGER PIPES', hsnCode: '7308', rate: 75, uom: 'Kgs' },
  { id: '4', name: 'U JACK', hsnCode: '7308', rate: 150, uom: 'Pcs' },
  { id: '5', name: 'BASE JACK', hsnCode: '7308', rate: 150, uom: 'Pcs' },
];

const COMPANY_STATE_CODE = '36'; // Telangana
const GST_RATE = 18; // 18% GST

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

interface InvoiceItem {
  productId: string;
  name: string;
  hsnCode: string;
  quantity: number;
  rate: number;
  uom: string;
  amount: number;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [paymentMode, setPaymentMode] = useState('CREDIT');

  // Calculations
  const [subtotal, setSubtotal] = useState(0);
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [igst, setIgst] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // Calculate totals whenever items or customer changes
  useEffect(() => {
    const sub = items.reduce((sum, item) => sum + item.amount, 0);
    setSubtotal(sub);

    // Check if same state for GST calculation
    const isSameState = selectedCustomer?.stateCode === COMPANY_STATE_CODE;

    if (isSameState) {
      // Same state: CGST + SGST
      const cgstAmount = (sub * (GST_RATE / 2)) / 100;
      const sgstAmount = (sub * (GST_RATE / 2)) / 100;
      setCgst(cgstAmount);
      setSgst(sgstAmount);
      setIgst(0);
      setGrandTotal(sub + cgstAmount + sgstAmount);
    } else {
      // Different state: IGST
      const igstAmount = (sub * GST_RATE) / 100;
      setIgst(igstAmount);
      setCgst(0);
      setSgst(0);
      setGrandTotal(sub + igstAmount);
    }
  }, [items, selectedCustomer]);

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: '',
        name: '',
        hsnCode: '',
        quantity: 0,
        rate: 0,
        uom: '',
        amount: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];

    if (field === 'productId') {
      const product = mockProducts.find((p) => p.id === value);
      if (product) {
        newItems[index] = {
          ...newItems[index],
          productId: product.id,
          name: product.name,
          hsnCode: product.hsnCode,
          rate: product.rate,
          uom: product.uom,
          amount: product.rate * newItems[index].quantity,
        };
      }
    } else if (field === 'quantity') {
      newItems[index].quantity = parseFloat(value) || 0;
      newItems[index].amount = newItems[index].rate * (parseFloat(value) || 0);
    }

    setItems(newItems);
  };

  const handleSubmit = () => {
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    if (items.length === 0 || items.some((item) => !item.productId)) {
      alert('Please add at least one valid product');
      return;
    }

    // Generate invoice number (in real app, this would come from database)
    const invoiceNumber = `${Math.floor(Math.random() * 100)}/25-26`;

    // Format date as DD-MM-YYYY
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    // Prepare invoice data
    const invoiceData = {
      invoiceNumber,
      invoiceDate: formattedDate,
      customer: {
        name: selectedCustomer.name,
        address: selectedCustomer.address,
        state: selectedCustomer.state,
        stateCode: selectedCustomer.stateCode,
        gstin: selectedCustomer.gstin,
        mobile: selectedCustomer.mobile,
      },
      deliveryAddress: deliveryAddress || selectedCustomer.address,
      destination,
      vehicleNumber,
      items: items.map(item => ({
        name: item.name,
        hsnCode: item.hsnCode,
        quantity: item.quantity,
        rate: item.rate,
        uom: item.uom,
        amount: item.amount,
      })),
      subtotal,
      cgst,
      sgst,
      igst,
      totalTax: cgst + sgst + igst,
      grandTotal,
      paymentMode,
    };

    // Generate and download PDF
    generateInvoicePDF(invoiceData, COMPANY_SETTINGS);

    // Show success message
    alert('Invoice generated successfully! PDF downloaded. (Will be saved to database)');

    // Navigate to invoices list
    setTimeout(() => {
      router.push('/invoices');
    }, 500);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
        <p className="text-sm text-gray-500 mt-1">Generate invoice with automatic GST calculation</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column - Form */}
        <div className="xl:col-span-3 space-y-5">
          {/* Customer Selection Card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Customer Information</h2>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Customer <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const customer = mockCustomers.find((c) => c.id === e.target.value);
                    setSelectedCustomer(customer);
                    setDeliveryAddress(customer?.address || '');
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">-- Select Customer --</option>
                  {mockCustomers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCustomer && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Address</p>
                      <p className="text-sm text-gray-900">{selectedCustomer.address}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">State</p>
                      <p className="text-sm text-gray-900">{selectedCustomer.state} ({selectedCustomer.stateCode})</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">GSTIN</p>
                      <p className="text-sm text-gray-900 font-mono">{selectedCustomer.gstin}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Tax Type</p>
                      <p className="text-sm font-medium text-blue-700">
                        {selectedCustomer.stateCode === COMPANY_STATE_CODE
                          ? 'CGST + SGST (9% + 9%)'
                          : 'IGST (18%)'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter delivery address"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    rows={2}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination
                    </label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="City/Location"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Number
                    </label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="XX-00-XX-0000"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section Card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900">Invoice Items</h2>
              <button
                onClick={addItem}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="p-6">
              {items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider pb-3 pr-3">Product</th>
                        <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider pb-3 px-3">HSN</th>
                        <th className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wider pb-3 px-3">Qty</th>
                        <th className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wider pb-3 px-3">UOM</th>
                        <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider pb-3 px-3">Rate</th>
                        <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider pb-3 px-3">Amount</th>
                        <th className="text-center text-xs font-semibold text-gray-600 uppercase tracking-wider pb-3 pl-3" style={{width: '50px'}}></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((item, index) => (
                        <tr key={index} className="group hover:bg-gray-50 transition-colors">
                          <td className="py-3 pr-3">
                            <select
                              value={item.productId}
                              onChange={(e) => updateItem(index, 'productId', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            >
                              <option value="">Select Product</option>
                              {mockProducts.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="text"
                              value={item.hsnCode}
                              readOnly
                              className="w-20 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-center"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              value={item.quantity || ''}
                              onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                              placeholder="0"
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="text"
                              value={item.uom}
                              readOnly
                              className="w-16 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-center"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="text"
                              value={item.rate ? `₹${item.rate.toFixed(2)}` : ''}
                              readOnly
                              className="w-24 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-right"
                            />
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-sm font-semibold text-gray-900">
                              ₹{item.amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 pl-3 text-center">
                            <button
                              onClick={() => removeItem(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No items added yet</p>
                  <p className="text-gray-400 text-xs mt-1">Click "Add Item" button to start adding products</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Summary Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 sticky top-6 overflow-hidden">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-5">
              <h2 className="text-base font-semibold text-white">Invoice Summary</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>

                {cgst > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">CGST @ 9%</span>
                      <span className="font-medium text-gray-700">₹{cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">SGST @ 9%</span>
                      <span className="font-medium text-gray-700">₹{sgst.toFixed(2)}</span>
                    </div>
                  </>
                )}

                {igst > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">IGST @ 18%</span>
                    <span className="font-medium text-gray-700">₹{igst.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">Grand Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="CREDIT">Credit</option>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK TRANSFER">Bank Transfer</option>
                </select>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!selectedCustomer || items.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-600"
              >
                <Save className="w-5 h-5" />
                Generate Invoice
              </button>

              {(!selectedCustomer || items.length === 0) && (
                <p className="text-xs text-gray-500 text-center">
                  {!selectedCustomer ? 'Please select a customer' : 'Please add at least one item'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
