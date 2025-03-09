
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
 apiKey: "AIzaSyAG_Dana0TYqmGwPe8POYQD-2zJlrdDl94",
  authDomain: "inventory-a2e9c.firebaseapp.com",
  projectId: "inventory-a2e9c",
  storageBucket: "inventory-a2e9c.firebasestorage.app",
  messagingSenderId: "1051159319734",
  appId: "1:1051159319734:web:22761b8755493820350217",
  measurementId: "G-9L3KCEW0BQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
