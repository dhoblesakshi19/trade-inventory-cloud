
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  BarChart, 
  Calendar, 
  Download, 
  FileText, 
  Filter, 
  PieChart, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart 
} from "lucide-react";
import Layout from "@/components/Layout";
import { useInventory } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { generateInvoicePDF, generateInvoicePDFForSales } from "@/utils/invoiceUtils";
import { exportSalesToExcel } from "@/utils/excelUtils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartPieChart, Pie, Cell } from 'recharts';

const Sales = () => {
  const { inventory, sales, recordSale } = useInventory();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  const [selectedMonth, setSelectedMonth] = useState("March");
  const [selectedYear, setSelectedYear] = useState("2025");
  
  const [formData, setFormData] = useState({
    productId: "",
    quantity: 1,
  });
  
  const selectedProduct = inventory.find((item) => item.id === formData.productId);
  const totalAmount = selectedProduct ? selectedProduct.unitPrice * formData.quantity : 0;
  
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalUnitsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const avgSaleValue = sales.length > 0 ? totalRevenue / sales.length : 0;

  const recentSales = [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const salesTrendData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 4500 },
    { name: 'May', revenue: 6000 },
    { name: 'Jun', revenue: 5500 },
    { name: 'Jul', revenue: 7000 }
  ];
  
  const categoryData = [
    { name: 'Rice', value: 40 },
    { name: 'Wheat', value: 30 },
    { name: 'Oil', value: 20 },
    { name: 'Other', value: 10 }
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
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
    generateInvoicePDFForSales(recentSales);
  };
  
  const exportSalesToExcelFile = () => {
    exportSalesToExcel(recentSales);
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Sales</h1>
            <p className="text-gray-500">View and analyze your sales data</p>
          </div>
          
          <Button className="flex items-center gap-2" onClick={exportSalesToExcelFile}>
            <Download className="w-4 h-4" />
            Export Sales
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <h3 className="font-medium">Sales Filters</h3>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="This Month">This Month</SelectItem>
                    <SelectItem value="Last Month">Last Month</SelectItem>
                    <SelectItem value="Last Quarter">Last Quarter</SelectItem>
                    <SelectItem value="This Year">This Year</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="January">January</SelectItem>
                    <SelectItem value="February">February</SelectItem>
                    <SelectItem value="March">March</SelectItem>
                    <SelectItem value="April">April</SelectItem>
                    <SelectItem value="May">May</SelectItem>
                    <SelectItem value="June">June</SelectItem>
                    <SelectItem value="July">July</SelectItem>
                    <SelectItem value="August">August</SelectItem>
                    <SelectItem value="September">September</SelectItem>
                    <SelectItem value="October">October</SelectItem>
                    <SelectItem value="November">November</SelectItem>
                    <SelectItem value="December">December</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
                <div className="p-2 bg-green-100 rounded-full">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Units Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{totalUnitsSold}</div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Avg Sale Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">₹{avgSaleValue.toLocaleString()}</div>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <BarChart className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-500" />
                <CardTitle>Sales Trend</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#6366F1" 
                    activeDot={{ r: 8 }} 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-center items-center mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span>Revenue</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-0">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-gray-500" />
                <CardTitle>Sales by Category</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartPieChart>
              </ResponsiveContainer>
              <div className="flex justify-center items-center gap-4 mt-4">
                {categoryData.map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center gap-2 text-sm text-gray-500">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <CardTitle>Recent Sales</CardTitle>
              </div>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700" 
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Sale
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Record New Sale</DialogTitle>
                    <DialogDescription>
                      Record a new product sale. This will reduce inventory quantity.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="product" className="text-sm font-medium">Product</Label>
                      <Select
                        value={formData.productId}
                        onValueChange={(value) => setFormData({ ...formData, productId: value })}
                      >
                        <SelectTrigger className="w-full">
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
                            <Label htmlFor="quantity" className="text-sm font-medium">Quantity</Label>
                            <Input
                              id="quantity"
                              type="number"
                              value={formData.quantity}
                              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                              min="1"
                              max={selectedProduct.quantity}
                              required
                              className="w-full"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Unit Price</Label>
                            <div className="flex h-10 w-full items-center rounded-md border bg-gray-50 px-3">
                              ₹{selectedProduct.unitPrice.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Total Amount</Label>
                          <div className="flex h-10 w-full items-center rounded-md border bg-gray-50 px-3 font-medium text-green-700">
                            ₹{totalAmount.toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-500 mt-2">
                          Current stock: {selectedProduct.quantity} {selectedProduct.unit}
                        </div>
                      </>
                    )}
                  </div>
                  
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleRecordSale}
                      disabled={!selectedProduct || formData.quantity < 1 || formData.quantity > (selectedProduct?.quantity || 0)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Record Sale
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSales.length > 0 ? (
                    recentSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{format(new Date(sale.date), "MMM dd, yyyy")}</TableCell>
                        <TableCell className="font-medium">{sale.productName}</TableCell>
                        <TableCell>Walk-in</TableCell>
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
                      <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                        No sales found for this period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
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
            <Button onClick={downloadInvoice} className="bg-blue-600 hover:bg-blue-700">
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
