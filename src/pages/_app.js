import Layout from '@/components/Layout';
import '@/styles/globals.css';
import { AppContext, AuthContextProvider } from '../components/AppContext';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export default function App({ Component, pageProps }) {
  const [language, setLanguage] = useState('kr');

  return (
    <AuthContextProvider value={{ language, setLanguage }}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthContextProvider>
  );
}
