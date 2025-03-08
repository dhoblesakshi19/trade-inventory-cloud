
import React, { useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  CircleUser,
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  AlertTriangle,
} from "lucide-react";
import { useInventory } from "@/context/InventoryContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getLowStockItems } = useInventory();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  
  const lowStockItems = getLowStockItems();
  const hasLowStock = lowStockItems.length > 0;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const isAdmin = user?.role === "admin";

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5 mr-2" />,
      admin: false,
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: <Package className="w-5 h-5 mr-2" />,
      admin: false,
    },
    {
      name: "Sales",
      path: "/sales",
      icon: <ShoppingCart className="w-5 h-5 mr-2" />,
      admin: false,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChart3 className="w-5 h-5 mr-2" />,
      admin: true,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="w-5 h-5 mr-2" />,
      admin: true,
    },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`bg-brand-700 text-white overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0 md:w-16"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          {sidebarOpen && (
            <div className="font-bold text-xl">Adish Trading</div>
          )}
          <button
            onClick={toggleSidebar}
            className="text-white focus:outline-none"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="mt-4">
          {menuItems
            .filter((item) => !item.admin || isAdmin)
            .map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center py-3 px-4 hover:bg-brand-600 ${
                  location.pathname === item.path
                    ? "bg-brand-600"
                    : ""
                } ${sidebarOpen ? "" : "justify-center"}`}
              >
                {item.icon}
                {sidebarOpen && <span>{item.name}</span>}
                {!sidebarOpen && item.name === "Inventory" && hasLowStock && (
                  <div className="absolute right-0 w-2 h-2 rounded-full bg-red-500"></div>
                )}
              </Link>
            ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="text-gray-500 focus:outline-none md:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {hasLowStock && (
                <Link 
                  to="/inventory" 
                  className="relative text-red-500 hover:text-red-600"
                  title="Low stock items detected"
                >
                  <AlertTriangle className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                    {lowStockItems.length}
                  </span>
                </Link>
              )}
              
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="flex items-center space-x-2">
                <CircleUser className="w-6 h-6 text-gray-600" />
                <div className="text-sm text-gray-600">{user?.role}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
