
import React, { useMemo } from "react";
import Layout from "@/components/Layout";
import { useInventory } from "@/context/InventoryContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { 
  ArrowRightIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  DollarSign,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

// Chart colors
const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

const Dashboard = () => {
  const { inventory, sales, getLowStockItems } = useInventory();
  const { user } = useAuth();

  // Calculate inventory statistics
  const totalProducts = inventory.length;
  const totalInventoryValue = inventory.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const lowStockItems = getLowStockItems();
  
  // Calculate sales statistics
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const recentSales = sales
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate revenue, expenditure and profit (placeholder values)
  const monthlyRevenue = 560000;
  const monthlyExpenditure = 1229000;
  const profit = totalSales - monthlyExpenditure;
  
  // Monthly sales data
  const monthlySalesData = [
    { name: 'Apr', value: 300000 },
    { name: 'May', value: 340000 },
    { name: 'Jun', value: 380000 },
    { name: 'Jul', value: 350000 },
    { name: 'Aug', value: 450000 },
    { name: 'Sep', value: 680000 },
  ];

  // Prepare data for category pie chart
  const categoryData = useMemo(() => {
    const categories = {
      'Grains': 55,
      'Oils': 4,
      'Sweeteners': 15,
      'Condiments': 26
    };

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }));
  }, []);

  return (
    <Layout>
      <div className="pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome to Adish Trading Inventory System</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Inventory Value</p>
                <h3 className="text-2xl font-bold mt-1">₹{totalInventoryValue.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <div className="flex items-center text-green-600 text-xs font-medium">
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                    <span>8.2%</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <h3 className="text-2xl font-bold mt-1">₹{monthlyRevenue.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <div className="flex items-center text-green-600 text-xs font-medium">
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                    <span>12.5%</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="bg-teal-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Expenditure</p>
                <h3 className="text-2xl font-bold mt-1">₹{monthlyExpenditure.toLocaleString()}</h3>
                <div className="flex items-center mt-2">
                  <div className="flex items-center text-red-600 text-xs font-medium">
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                    <span>3.1%</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Profit</p>
                <h3 className="text-2xl font-bold mt-1 text-red-600">-₹6,69,000</h3>
                <div className="flex items-center mt-2">
                  <div className="flex items-center text-red-600 text-xs font-medium">
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                    <span>24.3%</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Sales</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySalesData} margin={{ top: 5, right: 20, bottom: 25, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    fontSize={12}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Sales']}
                    contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#1e40af" 
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Inventory by Category</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend 
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity and low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <button className="text-sm text-blue-600 flex items-center">
                View All <ArrowRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="space-y-4">
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between pb-4 border-b border-gray-100"
                  >
                    <div>
                      <p className="font-medium">{sale.productName}</p>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-amber-500 mr-2"></div>
                        <p className="text-sm text-gray-500">Stock Sold • {formatDistanceToNow(new Date(sale.date), { addSuffix: true })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+₹{sale.totalAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{sale.quantity} units</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent transactions</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Low Stock Alerts</h3>
              <button className="text-sm text-blue-600 flex items-center">
                View All <ArrowRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="space-y-4">
              {lowStockItems.length > 0 ? (
                lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between pb-4 border-b border-gray-100"
                  >
                    <div className="flex items-start">
                      <div className="p-2 bg-red-100 rounded-full mr-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">SKU: {item.id.substring(0, 6).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">{item.quantity} units</p>
                      <p className="text-sm text-gray-500">Threshold: {item.threshold}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No low stock items</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
