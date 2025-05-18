import React from 'react';
import { MentorPair } from '../types';
import { CheckCircle, ExternalLink } from 'lucide-react';

interface PairingSuccessProps {
  mentorPair: MentorPair;
  onReset: () => void;
}

const PairingSuccess: React.FC<PairingSuccessProps> = ({ mentorPair, onReset }) => {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
      <div className="mb-6 text-green-500 flex justify-center">
        <CheckCircle className="h-16 w-16" />
      </div>
      
      <h2 className="text-2xl font-bold text-blue-900 mb-4">
        Parabéns!
      </h2>
      
      <p className="text-gray-700 mb-6">
        Você selecionou com sucesso a dupla de padrinhos:{" "}
        <span className="font-semibold">{mentorPair.pair[0].name}</span> e{" "}
        <span className="font-semibold">{mentorPair.pair[1].name}</span>
      </p>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <p className="text-blue-800 mb-2">
          Clique no botão abaixo para entrar no grupo do WhatsApp:
        </p>
        
        <a
          href={mentorPair.pair[0].whatsappLink.startsWith('http') 
            ? mentorPair.pair[0].whatsappLink 
            : `https://chat.whatsapp.com/${mentorPair.pair[1].whatsappLink}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          Entrar no Grupo <ExternalLink className="ml-2 h-4 w-4" />
        </a>
      </div>
      
      <p className="text-sm text-gray-500 mb-4">
        Um email de confirmação foi enviado para seu endereço de email.
      </p>
      
      <button
        onClick={onReset}
        className="text-blue-800 hover:underline text-sm"
      >
        Voltar ao início
      </button>
    </div>
  );
};

export default PairingSuccess;