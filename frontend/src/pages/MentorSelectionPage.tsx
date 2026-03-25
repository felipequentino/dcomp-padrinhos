import React, { useEffect, useState } from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';

import { useUser } from '../contexts/UserContext';
import { useMentors } from '../contexts/MentorContext';

import PairingSuccess from '../components/PairingSuccess';
import MentorCard from '../components/MentorCard';
import SiteFooter from '../components/SiteFooter';

import type { MentorPair } from '../types';
import { registerFreshmanSelection } from '../lib/api';

interface ItemProps {
  pair: MentorPair;
  onSelect: (pair: MentorPair) => void;
}

const MentorPairItem: React.FC<ItemProps> = ({ pair, onSelect }) => (
  <MentorCard mentorPair={pair} slots={pair.availableSlots} onClick={() => onSelect(pair)} />
);

const MentorSelectionPage: React.FC = () => {
  const { user, setCourse, clearFreshman } = useUser();
  const { mentorPairs, loadMentors, loading, error } = useMentors();

  const [pendingPair, setPendingPair] = useState<MentorPair | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{
    pair: MentorPair;
    mentorAWhatsapp: string;
    mentorBWhatsapp: string;
  } | null>(null);

  useEffect(() => {
    if (!user.course) return;
    void loadMentors(user.course);
    const t = window.setInterval(() => {
      void loadMentors(user.course!);
    }, 10000);
    return () => window.clearInterval(t);
  }, [user.course, loadMentors]);

  const handleGoBack = () => setCourse(undefined);

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 py-12 px-4 flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1">
          <PairingSuccess
            mentorPair={done.pair}
            mentorAWhatsapp={done.mentorAWhatsapp}
            mentorBWhatsapp={done.mentorBWhatsapp}
            onReset={() => {
              setDone(null);
              clearFreshman();
            }}
          />
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 relative">
      <header className="py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleGoBack}
            className="text-white hover:text-blue-200 transition-colors mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Escolha de Padrinhos</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white text-sm max-w-[140px] truncate hidden sm:inline" title={user.name}>
            {user.name}
          </span>
          <button
            type="button"
            onClick={clearFreshman}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Duplas de Padrinhos – {user.course}</h2>
          <p className="text-gray-600">
            Escolha uma dupla com base nas suas afinidades. Cada dupla pode acolher no máximo quatro calouros. As vagas
            são atualizadas automaticamente.
          </p>
          {loading && <p className="text-sm text-blue-800 mt-2">Carregando…</p>}
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        <div className="grid grid-cols-1 gap-8">
          {mentorPairs.map((pair) => (
            <MentorPairItem key={pair.id} pair={pair} onSelect={(p) => setPendingPair(p)} />
          ))}
        </div>

        {mentorPairs.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-white text-lg">
              Não há duplas disponíveis para este curso no momento (ou todas as vagas foram preenchidas).
            </p>
          </div>
        )}
      </main>

      {pendingPair && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Confirmar escolha</h3>
            <p className="mb-6">Você quer escolher essa dupla para ser seus padrinhos?</p>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                onClick={() => setPendingPair(null)}
                disabled={busy}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-800 transition-colors disabled:opacity-60"
                disabled={busy}
                onClick={async () => {
                  if (!user.course) return;
                  setBusy(true);
                  try {
                    const res = await registerFreshmanSelection({
                      freshman_matricula: user.matricula,
                      name: user.name,
                      phone: user.phone,
                      course: user.course,
                      terms_accepted: true,
                      pair_id: pendingPair.id,
                    });
                    setDone({
                      pair: pendingPair,
                      mentorAWhatsapp: res.mentor_a_whatsapp,
                      mentorBWhatsapp: res.mentor_b_whatsapp,
                    });
                    setPendingPair(null);
                  } catch (e: unknown) {
                    alert(e instanceof Error ? e.message : 'Erro ao reservar vaga.');
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
};

export default MentorSelectionPage;
