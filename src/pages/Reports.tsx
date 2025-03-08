
import React, { useState, useMemo } from "react";
import Layout from "@/components/Layout";
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
import { Download, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { format, subDays, parseISO, startOfDay, endOfDay } from "date-fns";

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
    }, {} as Record<string, number>);
    
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
    const dateMap: Record<string, number> = {};
    
    // Initialize all dates with zero
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), i);
      const formattedDate = format(date, "yyyy-MM-dd");
      dateMap[formattedDate] = 0;
    }
    
    // Fill in actual sales data
    filteredSales.forEach((sale) => {
      const saleDate = format(parseISO(sale.date), "yyyy-MM-dd");
      if (dateMap[saleDate] !== undefined) {
        dateMap[saleDate] += sale.totalAmount;
      }
    });
    
    // Convert to array for chart
    return Object.entries(dateMap)
      .map(([date, amount]) => ({
        date: format(parseISO(date), "MMM dd"),
        amount,
      }))
      .reverse();
  }, [filteredSales, timeRange]);
  
  // Prepare data for category distribution chart
  const categoryData = useMemo(() => {
    const categories = filteredSales.reduce((acc, sale) => {
      const product = inventory.find((p) => p.id === sale.productId);
      const category = product?.category || "Unknown";
      acc[category] = (acc[category] || 0) + sale.totalAmount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredSales, inventory]);
  
  // Export report to CSV
  const exportReportToCSV = () => {
    // Create CSV content for sales data within the range
    const headers = ["Date", "Product", "Category", "Quantity", "Unit Price", "Total Amount"];
    const csvContent = [
      headers.join(","),
      ...filteredSales.map((sale) => {
        const product = inventory.find((p) => p.id === sale.productId);
        return [
          format(parseISO(sale.date), "yyyy-MM-dd"),
          sale.productName,
          product?.category || "Unknown",
          sale.quantity,
          sale.unitPrice,
          sale.totalAmount,
        ].join(",");
      }),
    ].join("\n");
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_report_${format(new Date(), "yyyy-MM-dd")}.csv`);
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
            <h1 className="text-2xl font-bold text-gray-800">Sales Reports</h1>
            <p className="text-gray-600">
              Analytics and reports for {format(startDate, "MMM dd, yyyy")} to{" "}
              {format(endDate, "MMM dd, yyyy")}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Select
              value={timeRange}
              onValueChange={setTimeRange}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={exportReportToCSV}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
        
        {/* Summary metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Sales</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    ₹{salesMetrics.totalSales.toLocaleString()}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Items Sold</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {salesMetrics.totalItems.toLocaleString()} units
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg mr-4">
                  <TrendingDown className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Average Order Value</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    ₹{salesMetrics.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Report tabs */}
        <Tabs defaultValue="trend">
          <TabsList className="mb-6">
            <TabsTrigger value="trend">Sales Trend</TabsTrigger>
            <TabsTrigger value="category">Category Analysis</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
          </TabsList>
          
          {/* Sales trend chart */}
          <TabsContent value="trend">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Sales']}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        name="Sales Amount"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Category analysis */}
          <TabsContent value="category">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Sales']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Top products */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesMetrics.topSellingProducts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [value, 'Quantity Sold']}
                        />
                        <Bar dataKey="quantity" fill="#3b82f6" name="Quantity Sold" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity Sold</TableHead>
                          <TableHead>Total Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesMetrics.topSellingProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.quantity}</TableCell>
                            <TableCell>₹{product.value.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;
