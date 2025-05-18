import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Course } from '../types';
import { saveToLocalStorage, getFromLocalStorage } from '../utils/auth';

interface UserContextType {
  user: User;
  setEmail: (email: string) => void;
  setCourse: (course: Course) => void;
  logout: () => void;
}

const defaultUser: User = {
  email: '',
  authenticated: false,
};

const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setEmail: () => {},
  setCourse: () => {},
  logout: () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => 
    getFromLocalStorage<User>('user', defaultUser)
  );

  useEffect(() => {
    saveToLocalStorage('user', user);
  }, [user]);

  const setEmail = (email: string) => {
    setUser(prev => ({ ...prev, email, authenticated: true }));
  };

  const setCourse = (course: Course) => {
    setUser(prev => ({ ...prev, course }));
  };

  const logout = () => {
    setUser(defaultUser);
  };

  return (
    <UserContext.Provider value={{ user, setEmail, setCourse, logout }}>
      {children}
    </UserContext.Provider>
  );
};