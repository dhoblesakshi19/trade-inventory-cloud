
import React, { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import BackButton from "@/components/BackButton";
import { useInventory } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  TrendingUp,
  TrendingDown,
  Zap,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { format, subDays, parseISO, startOfDay, endOfDay } from "date-fns";
import { exportSalesToExcel } from "@/utils/excelUtils";
import { generateInvoicePDFForSales } from "@/utils/invoiceUtils";

// Chart colors
const COLORS = ["#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a"];

const Reports = () => {
  const { inventory, sales } = useInventory();
  const [timeRange, setTimeRange] = useState("7days");
  
  // Calculate date range based on selected time range
  const getDateRange = () => {
    const endDate = new Date();
    let startDate;
    
    switch (timeRange) {
      case "7days":
        startDate = subDays(endDate, 7);
        break;
      case "30days":
        startDate = subDays(endDate, 30);
        break;
      case "90days":
        startDate = subDays(endDate, 90);
        break;
      default:
        startDate = subDays(endDate, 7);
    }
    
    return { startDate, endDate };
  };
  
  const { startDate, endDate } = getDateRange();
  
  // Filter sales within the selected date range
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const saleDate = parseISO(sale.date);
      return saleDate >= startOfDay(startDate) && saleDate <= endOfDay(endDate);
    });
  }, [sales, startDate, endDate]);
  
  // Calculate sales metrics
  const salesMetrics = useMemo(() => {
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalItems = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const averageOrderValue = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;
    
    // Find top selling products
    const productSales = filteredSales.reduce((acc, sale) => {
      acc[sale.productId] = (acc[sale.productId] || 0) + sale.quantity;
      return acc;
    }, {});
    
    const topSellingProducts = Object.entries(productSales)
      .map(([productId, quantity]) => {
        const product = inventory.find((p) => p.id === productId);
        return {
          id: productId,
          name: product?.name || "Unknown Product",
          quantity,
          value: filteredSales
            .filter((s) => s.productId === productId)
            .reduce((sum, s) => sum + s.totalAmount, 0),
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    return {
      totalSales,
      totalItems,
      averageOrderValue,
      topSellingProducts,
    };
  }, [filteredSales, inventory]);
  
  // Prepare data for sales trend chart
  const salesTrendData = useMemo(() => {
    const days = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90;
    const dateMap = {};
    
    // Initialize all dates in the range
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), days - 1 - i);
      const dateKey = format(date, "yyyy-MM-dd");
      dateMap[dateKey] = 0;
    }
    
    // Fill in sales data
    filteredSales.forEach((sale) => {
      const dateKey = sale.date.split("T")[0];
      if (dateMap[dateKey] !== undefined) {
        dateMap[dateKey] += sale.totalAmount;
      }
    });
    
    // Convert to chart data
    return Object.entries(dateMap).map(([date, value]) => ({
      date: format(new Date(date), "MMM dd"),
      value,
    }));
  }, [filteredSales, timeRange]);
  
  // Prepare data for category chart
  const categorySalesData = useMemo(() => {
    const categoryMap = {};
    
    filteredSales.forEach((sale) => {
      const product = inventory.find((p) => p.id === sale.productId);
      if (product) {
        const category = product.category;
        categoryMap[category] = (categoryMap[category] || 0) + sale.totalAmount;
      }
    });
    
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSales, inventory]);
  
  const exportFilteredSalesToExcel = () => {
    exportSalesToExcel(filteredSales);
  };
  
  const exportFilteredSalesToPDF = () => {
    generateInvoicePDFForSales(filteredSales);
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BackButton className="mr-4" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Sales Reports</h1>
              <p className="text-gray-600">Analyze your sales performance</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Select
              value={timeRange}
              onValueChange={(value) => setTimeRange(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={exportFilteredSalesToExcel}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>
            
            <Button variant="outline" onClick={exportFilteredSalesToPDF}>
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
        
        {/* Sales metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Sales</p>
                  <h3 className="text-2xl font-bold text-gray-900">₹{salesMetrics.totalSales.toLocaleString()}</h3>
                  <p className="text-sm text-gray-500">{filteredSales.length} transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-4">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Items Sold</p>
                  <h3 className="text-2xl font-bold text-gray-900">{salesMetrics.totalItems}</h3>
                  <p className="text-sm text-gray-500">Across all categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-4">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Average Order</p>
                  <h3 className="text-2xl font-bold text-gray-900">₹{salesMetrics.averageOrderValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
                  <p className="text-sm text-gray-500">Per transaction</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sales reports tabs */}
        <Tabs defaultValue="trends">
          <TabsList>
            <TabsTrigger value="trends">Sales Trends</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          {/* Sales Trends Tab */}
          <TabsContent value="trends">
            <Card className="border">
              <CardHeader>
                <CardTitle>Sales Trend - {timeRange === "7days" ? "Last 7 Days" : timeRange === "30days" ? "Last 30 Days" : "Last 90 Days"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Sales']} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Sales Amount"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Top Products Tab */}
          <TabsContent value="products">
            <Card className="border">
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Sales Value</TableHead>
                        <TableHead className="text-right">% of Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesMetrics.topSellingProducts.map((product, index) => (
                        <TableRow key={product.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="text-right">{product.quantity}</TableCell>
                          <TableCell className="text-right">₹{product.value.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            {salesMetrics.totalSales > 0
                              ? `${((product.value / salesMetrics.totalSales) * 100).toFixed(1)}%`
                              : "0%"}
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {salesMetrics.topSellingProducts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                            No sales data available for the selected period
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card className="border">
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySalesData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {categorySalesData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Sales']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-3">Category Breakdown</h3>
                  
                  <div className="space-y-2">
                    {categorySalesData.map((category, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span>{category.name}</span>
                            <span>₹{category.value.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${(category.value / salesMetrics.totalSales) * 100}%`,
                                backgroundColor: COLORS[index % COLORS.length] 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {categorySalesData.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No category data available for the selected period
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.slice(0, 5).map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{format(new Date(sale.date), "MMM dd, yyyy")}</TableCell>
                      <TableCell className="font-medium">{sale.productName}</TableCell>
                      <TableCell>{sale.quantity}</TableCell>
                      <TableCell className="text-right">₹{sale.totalAmount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  
                  {filteredSales.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                        No transactions found for the selected period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
