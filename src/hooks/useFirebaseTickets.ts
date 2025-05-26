import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAccount } from 'wagmi';
import { Ticket } from '../types';

export const useFirebaseTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();

  useEffect(() => {
    if (!address) return;

    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, where('walletAddress', '==', address));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ticket[];
      
      setTickets(ticketData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [address]);

  const addTicket = async (emojis: string[]) => {
    if (!address) return;

    const ticketData = {
      walletAddress: address,
      emojis,
      createdAt: Timestamp.now(),
      gameId: Date.now().toString(), // Esto debería venir de la lógica del juego
      isChecked: false
    };

    try {
      await addDoc(collection(db, 'tickets'), ticketData);
    } catch (error) {
      console.error('Error adding ticket:', error);
      throw error;
    }
  };

  return {
    tickets,
    loading,
    addTicket
  };
}; 