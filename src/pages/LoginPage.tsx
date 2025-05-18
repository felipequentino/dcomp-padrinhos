import React from 'react';
import AuthVerification from '../components/AuthVerification';
import { useUser } from '../contexts/UserContext';
import { GraduationCap } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { setEmail } = useUser();
  
  const handleVerified = (email: string) => {
    setEmail(email);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <AuthVerification onVerified={handleVerified} />
        </div>
        <p className="mt-4 text-center text-sm text-blue-100">
          Use seu email acadêmico para autenticar-se no sistema.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;