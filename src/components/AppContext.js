import React, { useState } from 'react';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { auth } from '../firebase';

const myauth = auth;
export const AppContext = React.createContext();

export const useAuthContext = () => React.useContext(AppContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [language, setLanguage] = useState('kr');

  React.useEffect(() => {
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
    <AppContext.Provider value={{ user, language, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
};
