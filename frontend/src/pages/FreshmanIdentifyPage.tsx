import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import {
  normalizeCalouroMatricula,
  normalizeCalouroName,
  validateCalouroMatricula,
  validateCalouroName,
  validateCalouroPhone,
} from '../utils/freshmanValidation';
import SiteFooter from '../components/SiteFooter';
import SiteBrand from '../components/SiteBrand';

const FreshmanIdentifyPage: React.FC = () => {
  const { setFreshmanIdentity } = useUser();
  const [matricula, setMatricula] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [terms, setTerms] = useState(false);
  const [err, setErr] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    const m = normalizeCalouroMatricula(matricula);
    const nameNorm = normalizeCalouroName(name);

    const errMat = validateCalouroMatricula(m);
    if (errMat) {
      setErr(errMat);
      return;
    }
    const errName = validateCalouroName(nameNorm);
    if (errName) {
      setErr(errName);
      return;
    }
    const errPhone = validateCalouroPhone(phone);
    if (errPhone) {
      setErr(errPhone);
      return;
    }
    if (!terms) {
      setErr('É necessário aceitar os termos para continuar.');
      return;
    }
    setFreshmanIdentity({
      matricula: m,
      name: nameNorm,
      phone: phone.trim(),
      termsAccepted: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl px-4">
        <SiteBrand
          title="Escolha de Padrinhos"
          subtitle="Departamento de Computação • UFS — calouros dos cursos de computação"
        />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Identificação</h3>
          <p className="text-sm text-gray-600 mb-6">
            Antes de escolher sua dupla de padrinhos, confirme seus dados. Eles serão enviados aos
            padrinhos quando você confirmar a escolha.
          </p>
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Matrícula</label>
              <input
                className="mt-1 border p-2 w-full rounded"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value.replace(/\D/g, ''))}
                placeholder="202600059820"
                inputMode="numeric"
                autoComplete="username"
                maxLength={32}
                required
              />
              <p className="mt-1 text-xs text-gray-500">12 dígitos, começando com 2026.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome completo</label>
              <input
                className="mt-1 border p-2 w-full rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome e sobrenome"
                autoComplete="name"
                maxLength={512}
                required
              />
              <p className="mt-1 text-xs text-gray-500">Nome e sobrenome, sem números.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone / WhatsApp</label>
              <input
                className="mt-1 border p-2 w-full rounded"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(79) 99999-9999 ou 5579999999999"
                inputMode="tel"
                autoComplete="tel"
                maxLength={32}
                required
              />
              <p className="mt-1 text-xs text-gray-500">DDD + número (10 ou 11 dígitos) ou com 55 no início.</p>
            </div>
            <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
              />
              <span>
                Declaro que as informações acima são verdadeiras, que sou calouro(a) de um dos cursos de
                computação do DCOMP (CC, EC, SI ou IA) e que desejo participar do programa de apadrinhamento.
              </span>
            </label>
            {err && <p className="text-red-600 text-sm">{err}</p>}
            <button
              type="submit"
              className="bg-blue-800 text-white w-full py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Continuar
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-blue-100">
          É <strong>padrinho ou madrinha</strong>?{' '}
          <Link to="/padrinho" className="underline font-medium hover:text-white">
            Acesse o cadastro de padrinhos
          </Link>
        </p>
      </div>

      <SiteFooter />
    </div>
  );
};

export default FreshmanIdentifyPage;
