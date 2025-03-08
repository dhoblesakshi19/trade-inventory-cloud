
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

// Mock users for demonstration
const MOCK_USERS = {
  admin: {
    id: "admin-1",
    name: "Admin User",
    email: "admin@adishtrading.com",
    role: "admin",
    password: "admin123",
  },
  user: {
    id: "user-1",
    name: "Staff User",
    email: "user@adishtrading.com",
    role: "user",
    password: "user123",
  },
};

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          
          if (userDoc.exists()) {
            setUser(userDoc.data());
          } else {
            // This shouldn't happen in normal flow, but just in case
            console.error("User document doesn't exist for authenticated user");
            await signOut(auth);
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Create the demo users in Firebase if they don't exist
  useEffect(() => {
    const createDemoUsers = async () => {
      try {
        // Note: In a real app, you would NOT do this.
        // This is just for demo purposes since we can't actually create users via Firebase Auth from the client side
        const adminDoc = await getDoc(doc(db, "users", "admin-1"));
        if (!adminDoc.exists()) {
          await setDoc(doc(db, "users", "admin-1"), {
            id: "admin-1",
            name: "Admin User",
            email: "admin@adishtrading.com",
            role: "admin",
          });
        }

        const userDoc = await getDoc(doc(db, "users", "user-1"));
        if (!userDoc.exists()) {
          await setDoc(doc(db, "users", "user-1"), {
            id: "user-1",
            name: "Staff User",
            email: "user@adishtrading.com",
            role: "user",
          });
        }
      } catch (error) {
        console.error("Error creating demo users:", error);
      }
    };

    createDemoUsers();
  }, []);

  const login = async (email, password, role) => {
    setIsLoading(true);
    
    try {
      // In a real app with Firebase Auth, we would use signInWithEmailAndPassword
      // Since we're using mock users for demo, we'll validate against our mock data
      const matchingUser = 
        role === "admin" && email === MOCK_USERS.admin.email && password === MOCK_USERS.admin.password 
          ? MOCK_USERS.admin
          : role === "user" && email === MOCK_USERS.user.email && password === MOCK_USERS.user.password
          ? MOCK_USERS.user
          : null;
      
      if (!matchingUser) {
        throw new Error("Invalid credentials");
      }
      
      // For demo, we're setting the user directly.
      // In a real app, this would happen through the onAuthStateChanged listener
      setUser({
        id: matchingUser.id,
        name: matchingUser.name,
        email: matchingUser.email,
        role: matchingUser.role,
      });
      
      // Save to localStorage for persistence (we'd normally rely on Firebase Auth, but for the demo)
      localStorage.setItem("user", JSON.stringify(matchingUser));
      
      toast({
        title: "Login successful",
        description: `Welcome, ${matchingUser.name}!`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    signOut(auth).then(() => {
      setUser(null);
      localStorage.removeItem("user");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    }).catch((error) => {
      console.error("Error signing out:", error);
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
