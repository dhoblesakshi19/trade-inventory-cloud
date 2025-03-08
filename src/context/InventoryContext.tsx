
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Define inventory item types
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  threshold: number;
  lastUpdated: string;
  notes?: string;
}

// Define sales transaction
export interface SalesTransaction {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  date: string;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  sales: SalesTransaction[];
  isLoading: boolean;
  addInventoryItem: (item: Omit<InventoryItem, "id" | "lastUpdated">) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  recordSale: (sale: Omit<SalesTransaction, "id" | "date">) => void;
  getLowStockItems: () => InventoryItem[];
}

// Sample inventory data
const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "1",
    name: "Basmati Rice",
    category: "Rice",
    quantity: 500,
    unit: "kg",
    unitPrice: 75,
    threshold: 100,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Whole Wheat",
    category: "Wheat",
    quantity: 750,
    unit: "kg",
    unitPrice: 45,
    threshold: 150,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Sunflower Oil",
    category: "Oil",
    quantity: 200,
    unit: "liter",
    unitPrice: 120,
    threshold: 50,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Jasmine Rice",
    category: "Rice",
    quantity: 350,
    unit: "kg",
    unitPrice: 90,
    threshold: 100,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Olive Oil",
    category: "Oil",
    quantity: 40,
    unit: "liter",
    unitPrice: 350,
    threshold: 50,
    lastUpdated: new Date().toISOString(),
  },
];

// Sample sales data
const INITIAL_SALES: SalesTransaction[] = [
  {
    id: "s1",
    productId: "1",
    productName: "Basmati Rice",
    quantity: 50,
    unitPrice: 75,
    totalAmount: 3750,
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  },
  {
    id: "s2",
    productId: "3",
    productName: "Sunflower Oil",
    quantity: 20,
    unitPrice: 120,
    totalAmount: 2400,
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  },
  {
    id: "s3",
    productId: "2",
    productName: "Whole Wheat",
    quantity: 100,
    unitPrice: 45,
    totalAmount: 4500,
    date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
];

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<SalesTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize with mock data or load from localStorage
    const loadData = () => {
      const storedInventory = localStorage.getItem("inventory");
      const storedSales = localStorage.getItem("sales");
      
      setInventory(storedInventory ? JSON.parse(storedInventory) : INITIAL_INVENTORY);
      setSales(storedSales ? JSON.parse(storedSales) : INITIAL_SALES);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("inventory", JSON.stringify(inventory));
      localStorage.setItem("sales", JSON.stringify(sales));
    }
  }, [inventory, sales, isLoading]);

  const addInventoryItem = (item: Omit<InventoryItem, "id" | "lastUpdated">) => {
    const newItem: InventoryItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      lastUpdated: new Date().toISOString(),
    };

    setInventory((prev) => [...prev, newItem]);
    toast({
      title: "Item Added",
      description: `${item.name} has been added to inventory`,
    });
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updates, lastUpdated: new Date().toISOString() }
          : item
      )
    );
    toast({
      title: "Item Updated",
      description: `Inventory item has been updated`,
    });
  };

  const deleteInventoryItem = (id: string) => {
    const itemToDelete = inventory.find(item => item.id === id);
    setInventory((prev) => prev.filter((item) => item.id !== id));
    
    if (itemToDelete) {
      toast({
        title: "Item Deleted",
        description: `${itemToDelete.name} has been removed from inventory`,
      });
    }
  };

  const recordSale = (saleData: Omit<SalesTransaction, "id" | "date">) => {
    // Add new sale
    const newSale: SalesTransaction = {
      ...saleData,
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
    };
    
    setSales((prev) => [...prev, newSale]);
    
    // Update inventory quantity
    const item = inventory.find((item) => item.id === saleData.productId);
    
    if (item) {
      const newQuantity = item.quantity - saleData.quantity;
      updateInventoryItem(item.id, { quantity: newQuantity });
      
      // Check if below threshold after sale
      if (newQuantity <= item.threshold) {
        toast({
          title: "Low Stock Alert",
          description: `${item.name} is below the minimum threshold!`,
          variant: "destructive",
        });
      }
      
      toast({
        title: "Sale Recorded",
        description: `Sale of ${saleData.quantity} ${item.unit} of ${item.name} recorded`,
      });
    }
  };

  const getLowStockItems = () => {
    return inventory.filter((item) => item.quantity <= item.threshold);
  };

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        sales,
        isLoading,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        recordSale,
        getLowStockItems,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};
