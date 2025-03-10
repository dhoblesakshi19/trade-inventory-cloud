
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
  setDoc,
  orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { InventoryItem, SaleData, SalesTransaction } from "@/types/inventory.types";

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

export const initializeFirestore = async (): Promise<void> => {
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

export const subscribeToInventory = (onNext: (items: InventoryItem[]) => void, onError: (error: Error) => void) => {
  return onSnapshot(
    query(collection(db, "inventory"), orderBy("lastUpdated", "desc")),
    (snapshot) => {
      const items: InventoryItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as InventoryItem);
      });
      onNext(items);
    },
    onError
  );
};

export const subscribeToSales = (onNext: (sales: SalesTransaction[]) => void, onError: (error: Error) => void) => {
  return onSnapshot(
    collection(db, "sales"),
    (snapshot) => {
      const salesData: SalesTransaction[] = [];
      snapshot.forEach((doc) => {
        salesData.push({ id: doc.id, ...doc.data() } as SalesTransaction);
      });
      onNext(salesData);
    },
    onError
  );
};

export const addInventoryItemToFirestore = async (item: Omit<InventoryItem, 'id' | 'lastUpdated'>): Promise<void> => {
  const newItem = {
    ...item,
    lastUpdated: new Date().toISOString(),
  };
  
  await addDoc(collection(db, "inventory"), newItem);
};

export const updateInventoryItemInFirestore = async (id: string, updates: Partial<InventoryItem>): Promise<void> => {
  await updateDoc(doc(db, "inventory", id), {
    ...updates,
    lastUpdated: new Date().toISOString(),
  });
};

export const deleteInventoryItemFromFirestore = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "inventory", id));
};

export const recordSaleInFirestore = async (saleData: SaleData): Promise<void> => {
  const newSale = {
    ...saleData,
    date: new Date().toISOString(),
  };
  
  await addDoc(collection(db, "sales"), newSale);
};
