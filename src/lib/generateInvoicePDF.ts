import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: any;
  }
}

interface InvoiceItem {
  name: string;
  hsnCode: string;
  quantity: number;
  rate: number;
  uom: string;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  customer: {
    name: string;
    address: string;
    city?: string;
    state: string;
    stateCode: string;
    gstin?: string;
    mobile?: string;
  };
  deliveryAddress?: string;
  destination?: string;
  vehicleNumber?: string;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  grandTotal: number;
  paymentMode: string;
}

interface CompanySettings {
  name: string;
  tradeLine?: string;
  address: string;
  email: string;
  mobile: string;
  gstin: string;
  stateCode: string;
  bankName: string;
  accountNo: string;
  branch: string;
  ifscCode: string;
}

const numberToWords = (num: number): string => {
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];

  if (num === 0) return 'ZERO';

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const remainder = Math.floor(num % 100);

  let words = '';

  if (crore > 0) {
    words += convertBelowThousand(crore) + ' CRORE ';
  }
  if (lakh > 0) {
    words += convertBelowThousand(lakh) + ' LAKH ';
  }
  if (thousand > 0) {
    words += convertBelowThousand(thousand) + ' THOUSAND ';
  }
  if (hundred > 0) {
    words += ones[hundred] + ' HUNDRED ';
  }
  if (remainder > 0) {
    if (remainder < 10) {
      words += ones[remainder];
    } else if (remainder < 20) {
      words += teens[remainder - 10];
    } else {
      words += tens[Math.floor(remainder / 10)] + ' ' + ones[remainder % 10];
    }
  }

  return words.trim() + ' RUPEES ONLY';

  function convertBelowThousand(n: number): string {
    if (n === 0) return '';

    const h = Math.floor(n / 100);
    const r = n % 100;

    let result = '';
    if (h > 0) {
      result += ones[h] + ' HUNDRED ';
    }
    if (r > 0) {
      if (r < 10) {
        result += ones[r];
      } else if (r < 20) {
        result += teens[r - 10];
      } else {
        result += tens[Math.floor(r / 10)] + ' ' + ones[r % 10];
      }
    }
    return result.trim();
  }
};

export const generateInvoicePDF = (invoiceData: InvoiceData, companySettings: CompanySettings) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let yPos = 10;

  // Draw main border
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Top GSTIN - Small text at top left
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`GSTIN:${companySettings.gstin}`, 12, 14);

  // Company Name - Large Bold Centered
  yPos = 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(companySettings.name, pageWidth / 2, yPos, { align: 'center' });

  // Trade Line
  yPos += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(companySettings.tradeLine || '', pageWidth / 2, yPos, { align: 'center' });

  // Address
  yPos += 4;
  doc.setFontSize(7);
  doc.text(`Office: ${companySettings.address}`, pageWidth / 2, yPos, { align: 'center' });

  // Email and Mobile
  yPos += 4;
  doc.text(`E-mail: ${companySettings.email} Mobile No: ${companySettings.mobile}`, pageWidth / 2, yPos, { align: 'center' });

  // TAX INVOICE - Bold and centered
  yPos += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', pageWidth / 2, yPos, { align: 'center' });
  yPos += 2;

  // Horizontal separator line
  doc.setLineWidth(0.3);
  doc.line(12, yPos, pageWidth - 12, yPos);
  yPos += 6;

  // Customer and Invoice Details - Two column layout in table format
  const customerTableData = [
    ['Consignee Address', 'INVOICE NO.', 'DATE'],
    [`Name : ${invoiceData.customer.name}`, invoiceData.invoiceNumber, invoiceData.invoiceDate],
    [`Address : ${invoiceData.customer.address}`, 'DELIVERY NOTE', 'MODE/TERMS OF PAYMENT'],
    [`GSTIN/UIN : ${invoiceData.customer.gstin || 'N/A'}`, '', invoiceData.paymentMode],
    [`State Name : ${invoiceData.customer.state}`, "BUYER'S ORDER NO.", 'DATE'],
    [`State Code : ${invoiceData.customer.stateCode}`, '', ''],
    [`Mobile No : ${invoiceData.customer.mobile || ''}`, 'DISPATCH DOC. NO.', 'DESTINATION'],
    ['', '', invoiceData.destination || ''],
  ];

  autoTable(doc, {
    startY: yPos,
    body: customerTableData,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 100, fontStyle: 'normal' },
      1: { cellWidth: 40, fontStyle: 'bold', halign: 'left' },
      2: { cellWidth: 42, fontStyle: 'normal', halign: 'left' },
    },
    margin: { left: 12, right: 12 },
    didParseCell: function(data: any) {
      // Make first row bold (headers)
      if (data.row.index === 0) {
        data.cell.styles.fontStyle = 'bold';
      }
      // Make the label columns bold
      if (data.column.index === 0 || data.column.index === 1) {
        if (data.row.index > 0 && data.cell.raw && data.cell.raw.toString().includes(':')) {
          data.cell.styles.fontStyle = 'normal';
        }
      }
    }
  });

  yPos = doc.lastAutoTable.finalY + 6;

  // Items Table - Clean structure
  const itemsTableData = invoiceData.items.map((item, index) => [
    (index + 1).toString(),
    item.name,
    item.hsnCode,
    item.quantity.toString(),
    item.rate.toFixed(2),
    item.uom,
    item.amount.toFixed(2),
  ]);

  // Add extra rows for spacing if needed
  const minRows = 3;
  while (itemsTableData.length < minRows) {
    itemsTableData.push(['', '', '', '', '', '', '']);
  }

  autoTable(doc, {
    startY: yPos,
    head: [['SL.NO.', 'DESCRIPTION OF GOODS/SERVICE', 'HSN/SAC', 'QUANTITY', 'RATE', 'UOM', 'AMOUNT']],
    body: itemsTableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 70 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 18, halign: 'right' },
      5: { cellWidth: 12, halign: 'center' },
      6: { cellWidth: 22, halign: 'right' },
    },
    margin: { left: 12, right: 12 },
  });

  yPos = doc.lastAutoTable.finalY;

  // Totals section - Right aligned in table
  const totalQty = invoiceData.items.reduce((sum, item) => sum + item.quantity, 0);

  const totalsData = [
    ['', '', '', '', '', 'TOTAL', '=', invoiceData.subtotal.toFixed(2)],
    ['', '', '', '', '', 'IGST', invoiceData.igst > 0 ? '18%' : '', invoiceData.igst > 0 ? invoiceData.igst.toFixed(2) : '-'],
    ['', '', '', '', '', 'CGST', invoiceData.cgst > 0 ? '' : '', invoiceData.cgst > 0 ? invoiceData.cgst.toFixed(2) : '-'],
    ['', '', '', '', '', 'SGST', invoiceData.sgst > 0 ? '' : '', invoiceData.sgst > 0 ? invoiceData.sgst.toFixed(2) : '-'],
    ['', '', '', '', '', 'HAMALI', '', ''],
  ];

  autoTable(doc, {
    startY: yPos,
    body: totalsData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 70 },
      2: { cellWidth: 18 },
      3: { cellWidth: 20 },
      4: { cellWidth: 18 },
      5: { cellWidth: 12, fontStyle: 'bold', halign: 'right' },
      6: { cellWidth: 10, halign: 'center' },
      7: { cellWidth: 22, halign: 'right' },
    },
    margin: { left: 12, right: 12 },
  });

  yPos = doc.lastAutoTable.finalY;

  // Grand Total Row
  const grandTotalData = [[
    'GRAND TOTAL INVOICE AMOUNT :',
    '',
    `${totalQty.toFixed(0)}${invoiceData.items[0]?.uom || 'Kgs'}`,
    '',
    '',
    '',
    '',
    invoiceData.grandTotal.toFixed(2)
  ]];

  autoTable(doc, {
    startY: yPos,
    body: grandTotalData,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 2,
      fontStyle: 'bold',
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 70 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 20 },
      4: { cellWidth: 18 },
      5: { cellWidth: 12 },
      6: { cellWidth: 10 },
      7: { cellWidth: 22, halign: 'right' },
    },
    margin: { left: 12, right: 12 },
  });

  yPos = doc.lastAutoTable.finalY + 4;

  // Grand Total in Words
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('GRAND TOTAL INVOICE AMOUNT (IN WORDS)', 12, yPos);
  yPos += 4;
  doc.setFont('helvetica', 'normal');
  doc.text(numberToWords(invoiceData.grandTotal), 12, yPos);
  yPos += 6;

  // Tax Breakdown Table
  const taxTableHead = [
    [
      { content: 'HSN/SAC', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: 'TAXABLE VALUE', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
      { content: 'INTEGRATED TAX', colSpan: 2, styles: { halign: 'center' } },
      { content: 'STATE TAX', colSpan: 2, styles: { halign: 'center' } },
      { content: 'TAX AMOUNT', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
    ],
    [
      '',
      '',
      { content: 'RATE', styles: { halign: 'center' } },
      { content: 'AMOUNT', styles: { halign: 'center' } },
      { content: 'RATE', styles: { halign: 'center' } },
      { content: 'AMOUNT', styles: { halign: 'center' } },
      ''
    ]
  ];

  const taxTableData = [[
    invoiceData.items[0]?.hsnCode || '7308',
    invoiceData.subtotal.toFixed(2),
    invoiceData.igst > 0 ? '18%' : '-',
    invoiceData.igst > 0 ? invoiceData.igst.toFixed(2) : '-',
    invoiceData.cgst > 0 ? '' : '-',
    invoiceData.cgst > 0 ? invoiceData.cgst.toFixed(2) : '-',
    invoiceData.totalTax.toFixed(2),
  ]];

  autoTable(doc, {
    startY: yPos,
    head: taxTableHead,
    body: taxTableData,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      halign: 'center',
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },
    columnStyles: {
      1: { halign: 'right' },
      3: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
    },
    margin: { left: 12, right: 12 },
  });

  yPos = doc.lastAutoTable.finalY;

  // Total row for tax table
  autoTable(doc, {
    startY: yPos,
    body: [['TOTAL', invoiceData.subtotal.toFixed(2), '', '', '', '', invoiceData.totalTax.toFixed(2)]],
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      halign: 'center',
      fontStyle: 'bold',
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    columnStyles: {
      1: { halign: 'right' },
      6: { halign: 'right' },
    },
    margin: { left: 12, right: 12 },
  });

  yPos = doc.lastAutoTable.finalY + 4;

  // Tax Amount in Words
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX AMOUNT (IN WORDS)', 12, yPos);
  yPos += 4;
  doc.setFont('helvetica', 'normal');
  doc.text(numberToWords(invoiceData.totalTax), 12, yPos);
  yPos += 5;

  // Declaration
  doc.setFont('helvetica', 'bold');
  doc.text('DECLARATION', 12, yPos);
  yPos += 4;
  doc.setFont('helvetica', 'normal');
  doc.text('We declare that all particulars in this invoice are true and correct', 12, yPos);
  yPos += 6;

  // Bank Details and Authorized Signatory - Two columns
  const bankY = yPos;
  doc.setFont('helvetica', 'bold');
  doc.text("company's Bank Details", 12, yPos);
  yPos += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(`NAME : ${companySettings.name}`, 12, yPos);
  yPos += 3.5;
  doc.text(`A/C NO: ${companySettings.accountNo}`, 12, yPos);
  yPos += 3.5;
  doc.text(`BANK : ${companySettings.bankName}`, 12, yPos);
  yPos += 3.5;
  doc.text(`BRANCH : ${companySettings.branch}`, 12, yPos);
  yPos += 3.5;
  doc.text(`IFSC CODE : ${companySettings.ifscCode}`, 12, yPos);

  // Authorized Signatory - Right side
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('AUTHORISED SIGNATORY', pageWidth - 14, bankY, { align: 'right' });

  // Footer
  const footerY = pageHeight - 12;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text('THIS IS A COMPUTER GENERATED INVOICE', pageWidth / 2, footerY, { align: 'center' });

  // Save PDF
  const fileName = `Invoice_${invoiceData.invoiceNumber.replace(/\//g, '_')}.pdf`;
  doc.save(fileName);
};
