import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyACevrWjfjPKsPrNYRWtWHOLOLNx9PwJRs",
  authDomain: "otrocorofashion-42f9b.firebaseapp.com",
  projectId: "otrocorofashion-42f9b",
  storageBucket: "otrocorofashion-42f9b.firebasestorage.app",
  messagingSenderId: "600388187700",
  appId: "1:600388187700:web:842809593872a936a67c61"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize Analytics only in browser environment
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;

