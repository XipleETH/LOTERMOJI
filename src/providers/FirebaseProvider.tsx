import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebaseConfig';
import { User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAccount } from 'wagmi';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      // Cuando se conecta una wallet, creamos o actualizamos el documento del usuario
      const userRef = doc(db, 'users', address);
      setDoc(userRef, {
        walletAddress: address,
        lastLogin: new Date().toISOString()
      }, { merge: true });
    }
  }, [address]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
}; 