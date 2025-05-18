export const isValidEmail = (e:string) => e.endsWith('@dcomp.ufs.br');


export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const saveToLocalStorage = (key: string, value: any): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored) as T;
  } catch (error) {
    return defaultValue;
  }
};

export const clearLocalStorage = (key: string): void => {
  localStorage.removeItem(key);
};

