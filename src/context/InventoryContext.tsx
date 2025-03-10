
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";
import { InventoryItem, SalesTransaction, SaleData } from "@/types/inventory.types";
import { 
  initializeFirestore, 
  subscribeToInventory, 
  subscribeToSales,
  addInventoryItemToFirestore,
  updateInventoryItemInFirestore,
  deleteInventoryItemFromFirestore,
  recordSaleInFirestore
} from "@/services/firestore.service";

interface InventoryContextType {
  inventory: InventoryItem[];
  sales: SalesTransaction[];
  isLoading: boolean;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => Promise<void>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  recordSale: (saleData: SaleData) => Promise<void>;
  getLowStockItems: () => InventoryItem[];
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<SalesTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    setIsLoading(true);
    
    // Subscribe to inventory changes
    const unsubscribeInventory = subscribeToInventory(
      (items) => {
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
    const unsubscribeSales = subscribeToSales(
      (salesData) => {
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

  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => {
    try {
      await addInventoryItemToFirestore(item);
      
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

  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      await updateInventoryItemInFirestore(id, updates);
      
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

  const deleteInventoryItem = async (id: string) => {
    try {
      const itemToDelete = inventory.find(item => item.id === id);
      await deleteInventoryItemFromFirestore(id);
      
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

  const recordSale = async (saleData: SaleData) => {
    try {
      // Add new sale
      await recordSaleInFirestore(saleData);
      
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
