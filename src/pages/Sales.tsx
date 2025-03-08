
import React, { useState } from "react";
import Layout from "@/components/Layout";
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
import { Plus, Search, Download } from "lucide-react";
import { format } from "date-fns";

const Sales = () => {
  const { inventory, sales, recordSale } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    productId: "",
    quantity: 1,
  });
  
  // Computed value for selected product
  const selectedProduct = inventory.find((item) => item.id === formData.productId);
  const totalAmount = selectedProduct ? selectedProduct.unitPrice * formData.quantity : 0;
  
  // Filter sales based on search
  const filteredSales = sales
    .filter((sale) =>
      sale.productName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      productId: "",
      quantity: 1,
    });
  };
  
  // Handle recording a sale
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
  
  // Export sales data to CSV
  const exportSalesToCSV = () => {
    // Create CSV content
    const headers = ["Product", "Quantity", "Unit Price", "Total Amount", "Date"];
    const csvContent = [
      headers.join(","),
      ...sales.map((sale) => [
        sale.productName,
        sale.quantity,
        sale.unitPrice,
        sale.totalAmount,
        format(new Date(sale.date), "yyyy-MM-dd"),
      ].join(",")),
    ].join("\n");
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sales Management</h1>
            <p className="text-gray-600">Record and track your product sales</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={exportSalesToCSV}
            >
              <Download className="w-4 h-4 mr-2" />
              Export to CSV
            </Button>
            
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
        
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search sales by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Sales table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Amount</TableHead>
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
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    No sales records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default Sales;
