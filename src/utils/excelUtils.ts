
import * as XLSX from 'xlsx';
import { InventoryItem, SalesTransaction } from '@/types/inventory.types';
import { format } from 'date-fns';

export const exportInventoryToExcel = (inventory: InventoryItem[]) => {
  // Prepare data for export
  const data = inventory.map(item => ({
    'Product Name': item.name,
    'Category': item.category,
    'Quantity': item.quantity,
    'Unit': item.unit,
    'Unit Price (₹)': item.unitPrice,
    'Total Value (₹)': item.quantity * item.unitPrice,
    'Low Stock Threshold': item.threshold,
    'Last Updated': format(new Date(item.lastUpdated), 'yyyy-MM-dd'),
    'Notes': item.notes || ''
  }));
  
  // Set column widths
  const cols = [
    { wch: 20 }, // Product Name
    { wch: 15 }, // Category
    { wch: 10 }, // Quantity
    { wch: 8 },  // Unit
    { wch: 15 }, // Unit Price
    { wch: 15 }, // Total Value
    { wch: 15 }, // Threshold
    { wch: 15 }, // Last Updated
    { wch: 30 }, // Notes
  ];
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = cols;
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
  
  // Generate file and download
  XLSX.writeFile(workbook, `inventory_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

export const exportSalesToExcel = (sales: SalesTransaction[]) => {
  // Prepare data for export
  const data = sales.map(sale => ({
    'Date': format(new Date(sale.date), 'yyyy-MM-dd'),
    'Product': sale.productName,
    'Quantity': sale.quantity,
    'Unit Price (₹)': sale.unitPrice,
    'Total Amount (₹)': sale.totalAmount
  }));
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  const cols = [
    { wch: 15 }, // Date
    { wch: 20 }, // Product
    { wch: 10 }, // Quantity
    { wch: 15 }, // Unit Price
    { wch: 15 }, // Total Amount
  ];
  worksheet['!cols'] = cols;
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');
  
  // Generate file and download
  XLSX.writeFile(workbook, `sales_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
