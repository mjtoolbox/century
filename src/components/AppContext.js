import React, { useState, createContext, useContext, useEffect } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { auth } from '../firebase';
import Layout from './Layout';
import { usePathname } from 'next/navigation';

const myauth = auth;
export const AppContext = createContext();

export const useAuthContext = () => useContext(AppContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('kr');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(myauth, (user) => {
      if (user) {
        console.log('setting user: ', user.uid);
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AppContext.Provider
      value={{ isAuthenticated: !!user, user, language, setLanguage }}
    >
      {children}
    </AppContext.Provider>
  );
};
