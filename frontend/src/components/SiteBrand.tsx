import React from 'react';

interface SiteBrandProps {
  title?: string;
  subtitle?: string;
  align?: 'left' | 'center';
  compact?: boolean;
  tone?: 'light' | 'dark';
}

const SiteBrand: React.FC<SiteBrandProps> = ({
  title,
  subtitle,
  align = 'center',
  compact = false,
  tone = 'light',
}) => {
  const centered = align === 'center';
  const titleColor = tone === 'light' ? 'text-white' : 'text-blue-900';
  const subtitleColor = tone === 'light' ? 'text-blue-100' : 'text-slate-600';

  return (
    <div className={`flex flex-col gap-4 ${centered ? 'items-center text-center' : 'items-start text-left'}`}>
      <div
        className={`flex w-full flex-col gap-3 ${
          centered ? 'items-center sm:flex-row sm:justify-center' : 'items-start sm:flex-row sm:justify-start'
        }`}
      >
        <img
          src="/logo-dcomp-padrinhos.svg"
          alt="Logo DCOMP Padrinhos"
          className={compact ? 'h-[4.5rem] w-auto sm:h-[5.5rem]' : 'h-[5.5rem] w-auto sm:h-[6.5rem]'}
        />
        <img
          src="/dcomp-feliz.jpeg"
          alt="Mascote DCOMP Feliz"
          className={compact ? 'h-16 w-auto object-contain sm:h-20' : 'h-20 w-auto object-contain sm:h-24'}
        />
      </div>

      {(title || subtitle) && (
        <div className={`space-y-2 ${centered ? 'max-w-2xl' : 'max-w-xl'}`}>
          {title && <h1 className={`text-3xl font-extrabold sm:text-4xl ${titleColor}`}>{title}</h1>}
          {subtitle && <p className={`text-sm sm:text-base ${subtitleColor}`}>{subtitle}</p>}
        </div>
      )}
    </div>
  );
};

export default SiteBrand;
