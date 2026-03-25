import React from 'react';
import lawdLogo from '../data/img/lawd.png';
import ihLogo from '../data/img/ih.png';

const LAWD_INSTAGRAM = 'https://www.instagram.com/lawd.ufs/';
const IH_INSTAGRAM = 'https://www.instagram.com/innovationhub.ufs/';

interface SiteFooterProps {
  className?: string;
}

/**
 * Rodapé institucional: LAWD + Innovation Hub, logos e links do Instagram.
 */
const SiteFooter: React.FC<SiteFooterProps> = ({ className = '' }) => {
  return (
    <footer className={`mt-12 pb-10 px-4 sm:px-6 ${className}`}>
      <p className="text-center text-blue-100 text-sm sm:text-base mb-6 max-w-lg mx-auto leading-relaxed">
        Feito por <span className="text-white font-semibold">LAWD</span> com apoio da{' '}
        <span className="text-white font-semibold">Innovation Hub</span>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center justify-items-center max-w-2xl mx-auto">
        <a
          href={LAWD_INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/90 rounded-lg p-4 w-full max-w-xs h-28 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
        >
          <img src={lawdLogo} alt="LAWD — Liga Acadêmica de Web e Dados" className="max-h-24 max-w-full object-contain" />
        </a>
        <a
          href={IH_INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/90 rounded-lg p-4 w-full max-w-xs h-28 flex items-center justify-center hover:bg-white transition-colors shadow-sm"
        >
          <img src={ihLogo} alt="Innovation Hub UFS" className="max-h-24 max-w-full object-contain" />
        </a>
      </div>

      <p className="text-center text-sm text-blue-100 mt-8 max-w-md mx-auto">
        Siga no Instagram:{' '}
        <a
          href={LAWD_INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white font-medium underline underline-offset-2 hover:text-blue-50"
        >
          @lawd.ufs
        </a>
        {' e '}
        <a
          href={IH_INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white font-medium underline underline-offset-2 hover:text-blue-50"
        >
          @innovationhub.ufs
        </a>
        .
      </p>
    </footer>
  );
};

export default SiteFooter;
