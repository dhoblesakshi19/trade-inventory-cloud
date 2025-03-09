
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generateInvoicePDF = (sale) => {
  const doc = new jsPDF();
  
  // Add company header
  doc.setFontSize(20);
  doc.text('Adish Trading Company', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('INVOICE', 105, 30, { align: 'center' });
  
  // Add invoice details
  doc.setFontSize(10);
  doc.text(`Invoice #: INV-${sale.id}`, 15, 40);
  doc.text(`Date: ${format(new Date(sale.date), 'MMM dd, yyyy')}`, 15, 45);
  
  // Add customer section header
  doc.setFontSize(12);
  doc.text('Bill To:', 15, 55);
  
  // Add sale details
  autoTable(doc, {
    startY: 65,
    head: [['Item', 'Quantity', 'Unit Price (₹)', 'Total (₹)']],
    body: [
      [
        sale.productName,
        sale.quantity.toString(),
        sale.unitPrice.toLocaleString(),
        sale.totalAmount.toLocaleString()
      ]
    ],
  });
  
  // Add totals
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Subtotal: ₹${sale.totalAmount.toLocaleString()}`, 150, finalY, { align: 'right' });
  doc.text(`GST (18%): ₹${(sale.totalAmount * 0.18).toLocaleString()}`, 150, finalY + 5, { align: 'right' });
  doc.text(`Total: ₹${(sale.totalAmount * 1.18).toLocaleString()}`, 150, finalY + 10, { align: 'right' });
  
  // Add footer
  doc.setFontSize(10);
  doc.text('Thank you for your business!', 105, finalY + 20, { align: 'center' });
  doc.text('Adish Trading Company', 105, finalY + 25, { align: 'center' });
  
  // Save the PDF
  doc.save(`invoice_${sale.id}.pdf`);
};

export const generateInvoicePDFForSales = (sales) => {
  if (sales.length === 0) return;
  
  const doc = new jsPDF();
  
  // Add company header
  doc.setFontSize(20);
  doc.text('Adish Trading Company', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('SALES INVOICE', 105, 30, { align: 'center' });
  
  // Add invoice details
  doc.setFontSize(10);
  doc.text(`Invoice #: INV-BATCH-${Date.now()}`, 15, 40);
  doc.text(`Date: ${format(new Date(), 'MMM dd, yyyy')}`, 15, 45);
  
  // Prepare table data
  const tableBody = sales.map(sale => [
    format(new Date(sale.date), 'MMM dd, yyyy'),
    sale.productName,
    sale.quantity.toString(),
    `₹${sale.unitPrice.toLocaleString()}`,
    `₹${sale.totalAmount.toLocaleString()}`
  ]);
  
  // Add sale details
  autoTable(doc, {
    startY: 55,
    head: [['Date', 'Product', 'Quantity', 'Unit Price', 'Total']],
    body: tableBody,
  });
  
  // Add totals
  const finalY = doc.lastAutoTable.finalY + 10;
  const totalAmount = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  doc.text(`Subtotal: ₹${totalAmount.toLocaleString()}`, 150, finalY, { align: 'right' });
  doc.text(`GST (18%): ₹${(totalAmount * 0.18).toLocaleString()}`, 150, finalY + 5, { align: 'right' });
  doc.text(`Total: ₹${(totalAmount * 1.18).toLocaleString()}`, 150, finalY + 10, { align: 'right' });
  
  // Add footer
  doc.setFontSize(10);
  doc.text('Thank you for your business!', 105, finalY + 20, { align: 'center' });
  doc.text('Adish Trading Company', 105, finalY + 25, { align: 'center' });
  
  // Save the PDF
  doc.save(`sales_invoice_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
