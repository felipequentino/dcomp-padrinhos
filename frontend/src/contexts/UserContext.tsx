import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FreshmanUser, Course } from '../types';
import { saveToLocalStorage, getFromLocalStorage } from '../utils/auth';

interface UserContextType {
  user: FreshmanUser;
  setFreshmanIdentity: (data: Pick<FreshmanUser, 'matricula' | 'name' | 'phone' | 'termsAccepted'>) => void;
  setCourse: (course: Course | undefined) => void;
  clearFreshman: () => void;
  /** Pronto para escolher curso / duplas */
  identityComplete: boolean;
}

const defaultUser: FreshmanUser = {
  matricula: '',
  name: '',
  phone: '',
  termsAccepted: false,
};

const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setFreshmanIdentity: () => {},
  setCourse: () => {},
  clearFreshman: () => {},
  identityComplete: false,
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FreshmanUser>(() =>
    getFromLocalStorage<FreshmanUser>('freshmanUser', defaultUser),
  );

  useEffect(() => {
    saveToLocalStorage('freshmanUser', user);
  }, [user]);

  const identityComplete =
    Boolean(user.matricula.trim()) &&
    Boolean(user.name.trim()) &&
    Boolean(user.phone.trim()) &&
    user.termsAccepted;

  const setFreshmanIdentity = (data: Pick<FreshmanUser, 'matricula' | 'name' | 'phone' | 'termsAccepted'>) => {
    setUser((prev) => ({ ...prev, ...data, course: undefined }));
  };

  const setCourse = (course: Course | undefined) => {
    setUser((prev) => ({ ...prev, course }));
  };

  const clearFreshman = () => {
    setUser(defaultUser);
    localStorage.removeItem('freshmanUser');
  };

  return (
    <UserContext.Provider
      value={{ user, setFreshmanIdentity, setCourse, clearFreshman, identityComplete }}
    >
      {children}
    </UserContext.Provider>
  );
};
