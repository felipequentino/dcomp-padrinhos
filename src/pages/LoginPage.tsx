import React from 'react';
import AuthEmailPassword from '../components/AuthEmailPassword';
import { useUser } from '../contexts/UserContext';
import { GraduationCap } from 'lucide-react';

import lawdLogo   from '../data/img/lawd.png';
import ihLogo     from '../data/img/ih.png';
import softeamLogo from '../data/img/softeam.png';

const LoginPage: React.FC = () => {
  const { setEmail } = useUser();
  const handleVerified = (email: string) => setEmail(email);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Cabeçalho */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-white flex items-center justify-center">
          <GraduationCap className="h-10 w-10 text-blue-800" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-white">
          Escolha de Padrinhos
        </h2>
        <p className="mt-2 text-sm text-blue-100">
          Departamento de Computação • Universidade Federal de Sergipe
        </p>
      </div>

      {/* Card de login */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <AuthEmailPassword onAuth={handleVerified} />
        </div>
        <p className="mt-4 text-center text-sm text-blue-100">
          Use seu e-mail acadêmico para autenticar-se no sistema.
        </p>
      </div>

      {/* Oferecimento */}
      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="backdrop-blur-sm rounded-lg py-6 px-4">
          <p className="text-center text-blue-100 font-medium mb-6">Oferecimento:</p>
          
          {/* Container para as logos com grid responsivo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center justify-items-center">
            {/* Card para cada logo */}
            <div className="bg-white/90 rounded-lg p-4 w-full h-32 flex items-center justify-center">
              <a
                href="https://www.instagram.com/lawd.ufs/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full flex items-center justify-center"
              >
                <img
                  src={lawdLogo}
                  alt="LAWD"
                  className="max-h-24 max-w-full object-contain"
                />
              </a>
            </div>
            
            <div className="bg-white/90 rounded-lg p-4 w-full h-32 flex items-center justify-center">
              <a
                href="https://www.instagram.com/innovationhub.ufs/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full flex items-center justify-center"
              >
                <img
                  src={ihLogo}
                  alt="Innovation Hub"
                  className="max-h-24 max-w-full object-contain"
                />
              </a>
            </div>
             
            <div className="bg-white/90 rounded-lg p-4 w-full h-32 flex items-center justify-center">
              <a
                href="https://www.instagram.com/softeam.ejc/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full flex items-center justify-center"
              >
                <img
                  src={softeamLogo}
                  alt="Softeam"
                  className="max-h-20 max-w-full object-contain"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
