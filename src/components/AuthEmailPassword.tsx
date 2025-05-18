import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '../lib/firebaseClient';
import { isValidEmail } from '../utils/auth';

type Mode = 'login' | 'register';

interface Props {
  onAuth: (email: string) => void;  // callback após sucesso
}

const AuthEmailPassword: React.FC<Props> = ({ onAuth }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Use um e-mail @dcomp.ufs.br');
      return;
    }
    if (pass.length < 6) {
      setError('Senha deve ter ao menos 6 caracteres');
      return;
    }
    setError('');

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, pass);
      } else {
        await createUserWithEmailAndPassword(auth, email, pass);
      }
      onAuth(email);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
        {mode === 'login' ? 'Entrar' : 'Criar conta'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="seu.email@dcomp.ufs.br"
          className="border p-2 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha (mín. 6 caracteres)"
          className="border p-2 w-full"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-blue-800 text-white w-full py-2 rounded hover:bg-blue-700 transition-colors"
        >
          {mode === 'login' ? 'Entrar' : 'Registrar'}
        </button>
      </form>

      <p className="text-center text-sm mt-4">
        {mode === 'login' ? 'Não tem conta?' : 'Já possui conta?'}{' '}
        <button
          className="text-blue-800 hover:underline"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
        >
          {mode === 'login' ? 'Criar conta' : 'Entrar'}
        </button>
      </p>
    </div>
  );
};

export default AuthEmailPassword;
