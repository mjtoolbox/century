import Layout from '@/components/Layout';
import '@/styles/globals.css';
import AppContext from '../components/AppContext';
import { useState } from 'react';

export default function App({ Component, pageProps }) {
  const [language, setLanguage] = useState('kr');

  return (
    <AppContext.Provider value={{ language, setLanguage }}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppContext.Provider>
  );
}
