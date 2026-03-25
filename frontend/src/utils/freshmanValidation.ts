/** Matrícula: exatamente 12 dígitos, prefixo 2026 (ingresso 2026.1). */
export function normalizeCalouroMatricula(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function validateCalouroMatricula(digits: string): string | null {
  if (digits.length !== 12) {
    return 'A matrícula deve ter exatamente 12 dígitos (ex.: 202600059820).';
  }
  if (!digits.startsWith('2026')) {
    return 'A matrícula deve começar com 2026.';
  }
  return null;
}

/** Nome completo: pelo menos nome e sobrenome, sem números, caracteres razoáveis. */
export function normalizeCalouroName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function validateCalouroName(name: string): string | null {
  if (name.length < 4) {
    return 'Informe um nome válido.';
  }
  const parts = name.split(' ');
  if (parts.length < 2) {
    return 'Informe o nome completo (nome e sobrenome).';
  }
  for (const p of parts) {
    if (p.length < 2) {
      return 'Cada parte do nome deve ter pelo menos 2 letras.';
    }
  }
  if (/\d/.test(name)) {
    return 'O nome não deve conter números.';
  }
  // Letras latinas (incl. acentos), espaços, hífen, apóstrofo, ponto (ex.: "Maria J.")
  if (!/^[A-Za-zÀ-ÿ\u00C0-\u017F][A-Za-zÀ-ÿ\u00C0-\u017F\s'.-]*$/u.test(name)) {
    return 'Use apenas letras, espaços, hífen ou apóstrofo no nome.';
  }
  return null;
}

/**
 * Telefone/WhatsApp: Brasil sem DDI = 10 (fixo) ou 11 (celular);
 * com DDI 55 = 12 ou 13 dígitos.
 */
export function validateCalouroPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 0) {
    return 'Informe um telefone ou WhatsApp.';
  }
  if (digits.startsWith('55')) {
    if (digits.length < 12 || digits.length > 13) {
      return 'Com código do país (55), use 12 ou 13 dígitos (55 + DDD + número).';
    }
  } else if (digits.length < 10 || digits.length > 11) {
    return 'Informe DDD + número (10 ou 11 dígitos) ou inclua o 55 no início.';
  }
  return null;
}
