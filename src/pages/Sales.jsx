
import React, { useState } from "react";
import Layout from "@/components/Layout";
import BackButton from "@/components/BackButton";
import { useInventory } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { generateInvoicePDF, generateInvoicePDFForSales } from "@/utils/invoiceUtils";
import { exportSalesToExcel } from "@/utils/excelUtils";

const Sales = () => {
  const { inventory, sales, recordSale } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    productId: "",
    quantity: 1,
  });
  
  const selectedProduct = inventory.find((item) => item.id === formData.productId);
  const totalAmount = selectedProduct ? selectedProduct.unitPrice * formData.quantity : 0;
  
  const filteredSales = sales
    .filter((sale) =>
      sale.productName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const resetForm = () => {
    setFormData({
      productId: "",
      quantity: 1,
    });
  };
  
  const handleRecordSale = () => {
    if (!selectedProduct) return;
    
    if (formData.quantity > selectedProduct.quantity) {
      alert(`Error: Not enough stock. Only ${selectedProduct.quantity} ${selectedProduct.unit} available.`);
      return;
    }
    
    recordSale({
      productId: formData.productId,
      productName: selectedProduct.name,
      quantity: formData.quantity,
      unitPrice: selectedProduct.unitPrice,
      totalAmount: totalAmount,
    });
    
    setIsAddDialogOpen(false);
    resetForm();
  };
  
  const handleViewInvoice = (sale) => {
    setSelectedSale(sale);
    setIsInvoiceDialogOpen(true);
  };
  
  const downloadInvoice = () => {
    if (selectedSale) {
      generateInvoicePDF(selectedSale);
    }
  };
  
  const exportAllSalesAsPDF = () => {
    generateInvoicePDFForSales(filteredSales);
  };
  
  const exportSalesToExcelFile = () => {
    exportSalesToExcel(filteredSales);
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center">
          <BackButton className="mr-4" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sales Management</h1>
            <p className="text-gray-600">Record and track your product sales</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search sales by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportSalesToExcelFile}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export to Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAllSalesAsPDF}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export to PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-brand-600 hover:bg-brand-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Record Sale
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record New Sale</DialogTitle>
                  <DialogDescription>
                    Record a new product sale. This will reduce inventory quantity.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="product">Product</Label>
                    <Select
                      value={formData.productId}
                      onValueChange={(value) => setFormData({ ...formData, productId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventory.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.quantity} {item.unit} available)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedProduct && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                            min="1"
                            max={selectedProduct.quantity}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Unit Price</Label>
                          <div className="p-2 border rounded-md bg-gray-50">
                            ₹{selectedProduct.unitPrice.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Total Amount</Label>
                        <div className="p-2 border rounded-md bg-gray-50 font-medium text-green-700">
                          ₹{totalAmount.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Current stock: {selectedProduct.quantity} {selectedProduct.unit}
                      </div>
                    </>
                  )}
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleRecordSale}
                    disabled={!selectedProduct || formData.quantity < 1 || formData.quantity > (selectedProduct?.quantity || 0)}
                  >
                    Record Sale
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{format(new Date(sale.date), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="font-medium">{sale.productName}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>₹{sale.unitPrice.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">₹{sale.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewInvoice(sale)}
                      >
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">View Invoice</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    No sales records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice</DialogTitle>
            <DialogDescription>
              Sales invoice details
            </DialogDescription>
          </DialogHeader>
          
          {selectedSale && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-bold">Adish Trading Company</h3>
                <p className="text-sm text-gray-500">Invoice</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Invoice #:</p>
                  <p>INV-{selectedSale.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date:</p>
                  <p>{format(new Date(selectedSale.date), "MMM dd, yyyy")}</p>
                </div>
              </div>
              
              <div className="border rounded-md p-3">
                <div className="grid grid-cols-3 gap-2 text-sm font-medium border-b pb-2">
                  <div>Product</div>
                  <div>Quantity</div>
                  <div>Amount</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm py-2">
                  <div>{selectedSale.productName}</div>
                  <div>{selectedSale.quantity}</div>
                  <div>₹{selectedSale.totalAmount.toLocaleString()}</div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm pt-2 border-t">
                  <div className="col-span-2 text-right font-medium">Subtotal:</div>
                  <div>₹{selectedSale.totalAmount.toLocaleString()}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="col-span-2 text-right font-medium">GST (18%):</div>
                  <div>₹{(selectedSale.totalAmount * 0.18).toLocaleString()}</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm font-bold">
                  <div className="col-span-2 text-right">Total:</div>
                  <div>₹{(selectedSale.totalAmount * 1.18).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={downloadInvoice}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Sales;
