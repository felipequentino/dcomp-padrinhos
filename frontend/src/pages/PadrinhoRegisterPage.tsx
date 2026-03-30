import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Upload } from 'lucide-react';
import { padrinhoLookup, padrinhoRequestOtp, padrinhoUpdateProfile, padrinhoVerifyOtp, padrinhoUploadPhoto } from '../lib/api';
import SiteFooter from '../components/SiteFooter';

type Step = 'matricula' | 'otp' | 'perfil' | 'ok';

const PadrinhoRegisterPage: React.FC = () => {
  const [step, setStep] = useState<Step>('matricula');
  const [matricula, setMatricula] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const [profile, setProfile] = useState({
    hobby: '',
    music_artist: '',
    computing_area: '',
    celebrity: '',
    dream_destination: '',
    favorite_series: '',
    personal_description: '',
    photo_url: '',
  });

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const m = matricula.replace(/\D/g, '');
      const r = await padrinhoLookup(m);
      if (!r.found || !r.nome_completo) {
        setErr('Matrícula não encontrada nas inscrições de padrinhos.');
        return;
      }
      setMatricula(m);
      setNome(r.nome_completo);
      setStep('otp');
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Erro ao consultar');
    } finally {
      setBusy(false);
    }
  };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!email.toLowerCase().endsWith('@dcomp.ufs.br')) {
      setErr('Use um e-mail @dcomp.ufs.br');
      return;
    }
    setBusy(true);
    try {
      await padrinhoRequestOtp(matricula, email.trim().toLowerCase());
      setErr('');
      alert('Código de 5 dígitos enviado para seu e-mail.');
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Erro ao enviar código');
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    const c = code.replace(/\D/g, '').slice(0, 5);
    if (c.length !== 5) {
      setErr('Digite o código de 5 dígitos.');
      return;
    }
    setBusy(true);
    try {
      const r = await padrinhoVerifyOtp(matricula, c);
      setToken(r.access_token);
      setStep('perfil');
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Código inválido');
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await padrinhoUpdateProfile(token, profile);
      setStep('ok');
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Erro ao salvar');
    } finally {
      setBusy(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr('');
    setBusy(true);
    try {
      const res = await padrinhoUploadPhoto(token, file);
      setProfile((p) => ({ ...p, photo_url: res.url }));
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Erro ao enviar foto');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 flex flex-col justify-center py-12 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center mb-6">
        <div className="mx-auto h-14 w-14 rounded-full bg-white flex items-center justify-center">
          <GraduationCap className="h-9 w-9 text-blue-800" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-white">Cadastro — Padrinho/Madrinha</h1>
        <p className="mt-2 text-sm text-blue-100">SAC DCOMP • Verificação por e-mail @dcomp.ufs.br</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg bg-white rounded-lg shadow-lg p-6">
        <p className="mb-4 text-center">
          <Link to="/" className="text-blue-800 text-sm underline">
            Voltar à página dos calouros
          </Link>
        </p>

        {step === 'matricula' && (
          <form onSubmit={lookup} className="space-y-4">
            <h2 className="font-semibold text-blue-900">1. Matrícula</h2>
            <p className="text-sm text-gray-600">Use a mesma matrícula informada no formulário de inscrição.</p>
            <input
              className="border p-2 w-full rounded"
              placeholder="Matrícula"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value.replace(/\D/g, ''))}
              inputMode="numeric"
              required
            />
            {err && <p className="text-red-600 text-sm">{err}</p>}
            <button
              type="submit"
              disabled={busy}
              className="bg-blue-800 text-white w-full py-2 rounded disabled:opacity-50"
            >
              Buscar
            </button>
          </form>
        )}

        {step === 'otp' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold text-blue-900">Olá, {nome}</h2>
              <p className="text-sm text-gray-600 mt-1">Confirme seu e-mail @dcomp.ufs.br para receber o código.</p>
            </div>
            <form onSubmit={sendOtp} className="space-y-3">
              <input
                type="email"
                className="border p-2 w-full rounded"
                placeholder="voce@dcomp.ufs.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={busy}
                className="bg-blue-700 text-white w-full py-2 rounded disabled:opacity-50"
              >
                Enviar código (5 dígitos)
              </button>
            </form>
            <form onSubmit={verify} className="space-y-3 border-t pt-4">
              <label className="text-sm font-medium text-gray-700">Código recebido por e-mail</label>
              <input
                className="border p-2 w-full rounded tracking-widest"
                placeholder="00000"
                maxLength={5}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              />
              {err && <p className="text-red-600 text-sm">{err}</p>}
              <button
                type="submit"
                disabled={busy}
                className="bg-blue-800 text-white w-full py-2 rounded disabled:opacity-50"
              >
                Verificar e continuar
              </button>
            </form>
          </div>
        )}

        {step === 'perfil' && (
          <form onSubmit={saveProfile} className="space-y-3">
            <h2 className="font-semibold text-blue-900">Complete seu perfil (aparece para os calouros)</h2>
            <p className="text-sm text-gray-600">
              Mesmas ideias do site de apadrinhamento: afinidades e descrição para os calouros te conhecerem.
            </p>
            {(
              [
                ['hobby', 'Hobby'],
                ['music_artist', 'Artista musical favorito'],
                ['computing_area', 'Área de computação preferida'],
                ['celebrity', 'Celebridade que chamaria para uma festa'],
                ['dream_destination', 'Lugar que sonha em viajar'],
                ['favorite_series', 'Série favorita'],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600">{label}</label>
                <input
                  className="border p-2 w-full rounded text-sm"
                  value={profile[key]}
                  onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600">Sua Foto</label>
              <div className="mt-1 flex items-center gap-4">
                {profile.photo_url && (
                  <img src={profile.photo_url} alt="Sua foto" className="w-12 h-12 rounded-full object-cover" />
                )}
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border text-gray-700 text-sm py-2 px-3 rounded flex items-center gap-2 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Escolher imagem</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={busy}
                  />
                </label>
              </div>
              {profile.photo_url && <p className="text-xs text-green-600 mt-1">Foto enviada com sucesso!</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Descrição pessoal</label>
              <textarea
                className="border p-2 w-full rounded text-sm min-h-[100px]"
                value={profile.personal_description}
                onChange={(e) => setProfile((p) => ({ ...p, personal_description: e.target.value }))}
              />
            </div>
            {err && <p className="text-red-600 text-sm">{err}</p>}
            <button
              type="submit"
              disabled={busy}
              className="bg-blue-800 text-white w-full py-2 rounded disabled:opacity-50"
            >
              Salvar cadastro
            </button>
          </form>
        )}

        {step === 'ok' && (
          <div className="text-center space-y-4">
            <p className="text-green-700 font-medium">Cadastro concluído.</p>
            <p className="text-sm text-gray-600">
              Aguarde a formação das duplas pela organização. Depois disso, os calouros poderão escolher as duplas no
              site.
            </p>
            <Link to="/" className="inline-block text-blue-800 underline text-sm">
              Ir para a página inicial
            </Link>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
};

export default PadrinhoRegisterPage;
