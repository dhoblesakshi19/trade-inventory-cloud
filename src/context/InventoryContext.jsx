
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";

// Sample inventory data
const INITIAL_INVENTORY = [
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
const INITIAL_SALES = [
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

const InventoryContext = createContext(undefined);

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize Firestore with sample data if empty
  const initializeFirestore = async () => {
    try {
      const inventorySnapshot = await getDocs(collection(db, "inventory"));
      const salesSnapshot = await getDocs(collection(db, "sales"));
      
      // If inventory collection is empty, seed with initial data
      if (inventorySnapshot.empty) {
        for (const item of INITIAL_INVENTORY) {
          await setDoc(doc(db, "inventory", item.id), {
            ...item,
            lastUpdated: new Date().toISOString()
          });
        }
      }
      
      // If sales collection is empty, seed with initial data
      if (salesSnapshot.empty) {
        for (const sale of INITIAL_SALES) {
          await setDoc(doc(db, "sales", sale.id), sale);
        }
      }
    } catch (error) {
      console.error("Error initializing Firestore:", error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    
    // Subscribe to inventory changes
    const unsubscribeInventory = onSnapshot(
      collection(db, "inventory"),
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setInventory(items);
      },
      (error) => {
        console.error("Error getting inventory:", error);
        toast({
          title: "Error",
          description: "Failed to load inventory data from Firestore",
          variant: "destructive",
        });
      }
    );
    
    // Subscribe to sales changes
    const unsubscribeSales = onSnapshot(
      collection(db, "sales"),
      (snapshot) => {
        const salesData = [];
        snapshot.forEach((doc) => {
          salesData.push({ id: doc.id, ...doc.data() });
        });
        setSales(salesData);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error getting sales:", error);
        toast({
          title: "Error",
          description: "Failed to load sales data from Firestore",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );
    
    // Initialize Firestore with sample data if needed
    initializeFirestore();
    
    return () => {
      unsubscribeInventory();
      unsubscribeSales();
    };
  }, [toast]);

  const addInventoryItem = async (item) => {
    try {
      const newItem = {
        ...item,
        lastUpdated: new Date().toISOString(),
      };
      
      const docRef = await addDoc(collection(db, "inventory"), newItem);
      
      toast({
        title: "Item Added",
        description: `${item.name} has been added to inventory`,
      });
    } catch (error) {
      console.error("Error adding inventory item:", error);
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      });
    }
  };

  const updateInventoryItem = async (id, updates) => {
    try {
      await updateDoc(doc(db, "inventory", id), {
        ...updates,
        lastUpdated: new Date().toISOString(),
      });
      
      toast({
        title: "Item Updated",
        description: `Inventory item has been updated`,
      });
    } catch (error) {
      console.error("Error updating inventory item:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      });
    }
  };

  const deleteInventoryItem = async (id) => {
    try {
      const itemToDelete = inventory.find(item => item.id === id);
      await deleteDoc(doc(db, "inventory", id));
      
      if (itemToDelete) {
        toast({
          title: "Item Deleted",
          description: `${itemToDelete.name} has been removed from inventory`,
        });
      }
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      toast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive",
      });
    }
  };

  const recordSale = async (saleData) => {
    try {
      // Add new sale
      const newSale = {
        ...saleData,
        date: new Date().toISOString(),
      };
      
      await addDoc(collection(db, "sales"), newSale);
      
      // Update inventory quantity
      const item = inventory.find((item) => item.id === saleData.productId);
      
      if (item) {
        const newQuantity = item.quantity - saleData.quantity;
        await updateInventoryItem(item.id, { quantity: newQuantity });
        
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
    } catch (error) {
      console.error("Error recording sale:", error);
      toast({
        title: "Error",
        description: "Failed to record sale",
        variant: "destructive",
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
