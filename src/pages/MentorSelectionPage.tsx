/* pages/MentorSelectionPage.tsx
 *
 * – Usa Firebase Auth para identificar o calouro (auth.currentUser!.email).
 * – Reserva a vaga via reservePair (transaction Firestore) quando confirma.
 * – Mantém a UI reativa com useMentorSlots, mas sem hooks dentro de loops
 *   no componente pai (Hook é chamado no componente‐filho MentorPairItem).
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';

import { useUser } from '../contexts/UserContext';
import { useMentors } from '../contexts/MentorContext';

import PairingSuccess from '../components/PairingSuccess';
import MentorCard from '../components/MentorCard';

import { MentorPair } from '../types';
import { pairId, useMentorSlots } from '../hooks/useMentorSlots';

import { auth } from '../lib/firebaseClient';
import { reservePair } from '../hooks/useReservePair';

/* ────────────────────────────
 * Item da lista: cada um chama useMentorSlots
 * ──────────────────────────── */
interface ItemProps {
  pair: MentorPair;
  onSelect: (pair: MentorPair) => void;
}
const MentorPairItem: React.FC<ItemProps> = ({ pair, onSelect }) => {
  const id = pairId(pair.pair.map((m) => m.name));
  const { slots, loading } = useMentorSlots(id, pair.availableSlots);

  return (
    <MentorCard
      mentorPair={pair}
      slots={loading ? pair.availableSlots : slots}
      onClick={() => onSelect(pair)}
    />
  );
};

/* ────────────────────────────
 * Página principal
 * ──────────────────────────── */
const MentorSelectionPage: React.FC = () => {
  const { user, logout, setCourse } = useUser();

  const {
    mentorPairs = [],
    selectedPair,
    selectMentorPair,
    resetSelection,
  } = useMentors();

  const [pendingPair, setPendingPair] = useState<MentorPair | null>(null);
  const [busy, setBusy] = useState(false);

  /* recarregar pares se provider limpar lista */
  useEffect(() => {
    if (mentorPairs.length === 0 && user.course) {
      /* ex.: MentorContext.loadMentors(user.course) se existir */
    }
  }, [mentorPairs.length, user.course]);

  const handleGoBack = () => setCourse(undefined);

  /* se já concluiu, tela de sucesso */
  if (selectedPair) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 py-12 px-4">
        <div className="max-w-md mx-auto">
          <PairingSuccess mentorPair={selectedPair} onReset={resetSelection} />
        </div>
      </div>
    );
  }

  /* render normal */
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 relative">
      {/* HEADER */}
      <header className="py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={handleGoBack}
            className="text-white hover:text-blue-200 transition-colors mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Escolha de Padrinhos</h1>
        </div>
        <div className="flex items-center">
          <span className="text-white mr-4">{user.email}</span>
          <button
            onClick={logout}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">
            Duplas de Padrinhos – {user.course}
          </h2>
          <p className="text-gray-600">
            Escolha uma dupla com base nas suas afinidades. Cada dupla pode
            acolher, no máximo, 5 calouros.
          </p>
        </div>

        {/* LISTA DE PARES */}
        <div className="grid grid-cols-1 gap-8">
          {mentorPairs.map((pair) => (
            <MentorPairItem
              key={pairId(pair.pair.map((m) => m.name))}
              pair={pair}
              onSelect={(p) => setPendingPair(p)}
            />
          ))}
        </div>

        {/* fallback quando não há pares */}
        {mentorPairs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white text-lg">
              Não há duplas de padrinhos disponíveis para este curso.
            </p>
          </div>
        )}
      </main>

      {/* MODAL DE CONFIRMAÇÃO */}
      {pendingPair && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Confirmar escolha</h3>
            <p className="mb-6">
              Você quer escolher essa dupla para ser seus padrinhos?
            </p>

            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                onClick={() => setPendingPair(null)}
                disabled={busy}
              >
                Cancelar
              </button>

              <button
                className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-800 transition-colors disabled:opacity-60"
                disabled={busy}
                onClick={async () => {
                  if (!auth.currentUser) {
                    alert('Faça login primeiro.');
                    return;
                  }
                  setBusy(true);
                  const id = pairId(pendingPair!.pair.map(m => m.name));
                  try {
                    /* grava no Firestore – garante 1 escolha por usuário */
                    await reservePair(auth.currentUser.email!, id);
                    /* atualiza estado local */
                    selectMentorPair(pendingPair!);
                  } catch (e:any) {
                    alert(e.message || 'Erro ao reservar vaga.');
                  } finally {
                    setBusy(false);
                    setPendingPair(null);
                  }
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorSelectionPage;
