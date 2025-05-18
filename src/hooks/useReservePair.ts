/* hooks/useReservePair.ts */
import { doc, runTransaction, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';

/**
 * Tenta reservar 1 vaga para o usuário (e-mail) naquela dupla.
 * Se já existir seleção para o e-mail, lança erro.
 */
export async function reservePair(
  email: string,
  pairId: string
) {
  const userSelRef = doc(db, 'selections', email);
  const pairRef    = doc(db, 'mentorPairs', pairId);

  await runTransaction(db, async tx => {
    // 1. bloqueia se já existe doc de seleção
    const selSnap = await tx.get(userSelRef);
    if (selSnap.exists()) throw new Error('Você já escolheu seus padrinhos.');

    // 2. decrementa vaga
    const pairSnap = await tx.get(pairRef);
    const slots = pairSnap.data()!.availableSlots;
    if (slots <= 0) throw new Error('Sem vagas.');

    tx.update(pairRef, { availableSlots: slots - 1 });
    tx.set(userSelRef, { pairId, at: Date.now() });
  });
}
