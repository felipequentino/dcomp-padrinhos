import React, { useEffect, useState } from 'react';
import {
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
} from 'firebase/auth';
import { auth } from '../lib/firebaseClient';

const actionCodeSettings = {
  url: window.location.origin + '/login', // mesma rota onde está este componente
  handleCodeInApp: true,
};

export default function AuthVerification({
  onVerified,
}: {
  onVerified: (email: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<'input' | 'sent'>('input');
  const [error, setError] = useState('');

  const isAcademic = (e: string) => e.endsWith('@academico.ufs.br');

  /* ---------- envia link ---------- */
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAcademic(email)) {
      setError('Use um e-mail @academico.ufs.br');
      return;
    }
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setStage('sent');
    } catch (err: any) {
      setError(err.message);
    }
  };

  /* ---------- trata retorno do link ---------- */
  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return;

    const storedEmail = window.localStorage.getItem('emailForSignIn');
    if (storedEmail) {
      // Mesmo dispositivo → login automático, sem prompt
      signInWithEmailLink(auth, storedEmail, window.location.href)
        .then(() => {
          window.localStorage.removeItem('emailForSignIn');
          onVerified(storedEmail);
        })
        .catch(() => setError('Link expirado ou já usado.'));
    } else {
      // Link aberto em OUTRO dispositivo → precisamos perguntar o e-mail 1x
      const promptEmail = window.prompt(
        'Confirme seu e-mail @academico.ufs.br para concluir o login',
      );
      if (!promptEmail || !isAcademic(promptEmail)) return;

      signInWithEmailLink(auth, promptEmail, window.location.href)
        .then(() => onVerified(promptEmail))
        .catch(() => setError('Link inválido ou expirado.'));
    }
  }, []);

  /* ---------- UI ---------- */
  if (stage === 'sent')
    return (
      <p className="text-center mt-8 text-blue-900">
        Link enviado! Verifique sua caixa de entrada.
      </p>
    );

  return (
    <form onSubmit={handleSend} className="space-y-4 max-w-md mx-auto">
      <input
        type="email"
        placeholder="seu.email@academico.ufs.br"
        className="border p-2 w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button className="bg-blue-800 text-white px-4 py-2 rounded w-full">
        Enviar link de acesso
      </button>
    </form>
  );
}
