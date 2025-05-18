import { useEffect, useState } from 'react';
import {
  doc,
  runTransaction,
  onSnapshot,
  setDoc,
  DocumentReference,
} from 'firebase/firestore';
import { db } from '../lib/firebaseClient';

interface MentorPairDoc {
  availableSlots: number;
}

export const pairId = (names: string[]) =>
  names.map(n => n.replace(/\s+/g, '')).join('_');

export function useMentorSlots(pairKey: string, defaultValue = 5) {
  const [slots, setSlots] = useState<number>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const docRef: DocumentReference<MentorPairDoc> = doc(db, 'mentorPairs', pairKey);

    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (!snap.exists()) {
          // primeira vez? cria doc com defaultValue
          setDoc(docRef, { availableSlots: defaultValue })
            .catch(err => setError(err as Error));
          setSlots(defaultValue);
        } else {
          setSlots(snap.data().availableSlots);
        }
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return unsub;
  }, [pairKey, defaultValue]);

  const reserveSlot = async () => {
    try {
      await runTransaction(db, async (tx) => {
        const ref = doc(db, 'mentorPairs', pairKey);
        const snap = await tx.get(ref);
        const curr = snap.exists() ? snap.data()!.availableSlots : defaultValue;
        
        if (curr <= 0) {
          throw new Error('Sem vagas disponíveis');
        }
        
        tx.set(ref, { availableSlots: curr - 1 }, { merge: true });
      });
    } catch (err) {
      setError(err as Error);
      throw err; // re-throw para tratamento no componente
    }
  };

  return { slots, loading, error, reserveSlot };
}