import React from 'react';
import { MentorPair } from '../types';
import { CheckCircle, MessageCircle } from 'lucide-react';

interface PairingSuccessProps {
  mentorPair: MentorPair;
  mentorAWhatsapp: string;
  mentorBWhatsapp: string;
  onReset: () => void;
}

const PairingSuccess: React.FC<PairingSuccessProps> = ({
  mentorPair,
  mentorAWhatsapp,
  mentorBWhatsapp,
  onReset,
}) => {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
      <div className="mb-6 text-green-500 flex justify-center">
        <CheckCircle className="h-16 w-16" />
      </div>

      <h2 className="text-2xl font-bold text-blue-900 mb-4">Parabéns!</h2>

      <p className="text-gray-700 mb-6">
        Você selecionou a dupla: <span className="font-semibold">{mentorPair.pair[0].name}</span> e{' '}
        <span className="font-semibold">{mentorPair.pair[1].name}</span>.
      </p>

      <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left space-y-3">
        <p className="text-blue-900 font-medium flex items-center gap-2">
          <MessageCircle className="h-5 w-5 shrink-0" />
          Entre em contato com seus padrinhos:
        </p>
        <ul className="text-sm text-gray-800 space-y-2 pl-1">
          <li>
            <span className="font-semibold">{mentorPair.pair[0].name}:</span>{' '}
            <a className="text-blue-800 underline break-all" href={`https://wa.me/${mentorAWhatsapp.replace(/\D/g, '')}`}>
              {mentorAWhatsapp}
            </a>
          </li>
          <li>
            <span className="font-semibold">{mentorPair.pair[1].name}:</span>{' '}
            <a className="text-blue-800 underline break-all" href={`https://wa.me/${mentorBWhatsapp.replace(/\D/g, '')}`}>
              {mentorBWhatsapp}
            </a>
          </li>
        </ul>
        <p className="text-xs text-gray-600">
          Os padrinhos também receberam um e-mail com seus dados para entrar em contato com você.
        </p>
      </div>

      <button type="button" onClick={onReset} className="text-blue-800 hover:underline text-sm">
        Voltar ao início
      </button>
    </div>
  );
};

export default PairingSuccess;
