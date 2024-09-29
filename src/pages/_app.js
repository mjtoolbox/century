import Head from 'next/head';
import Layout from '@/components/Layout';
import '@/styles/globals.css';
import {
  AppContext,
  AuthContextProvider,
  ProtectRoute,
} from '../components/AppContext';
import { useState } from 'react';
import PrivateRoute from '@/components/PrivateRoute';

export default function App({ Component, pageProps }) {
  const [language, setLanguage] = useState('kr');

  // Add your protected routes here
  const protectedRoutes = [
    '/admin',
    '/addCalendar',
    '/manageCalendar',
    '/editCalendar',
  ];

  return (
    <AuthContextProvider value={{ language, setLanguage }}>
      <PrivateRoute protectedRoutes={protectedRoutes}>
        <Layout>
          <Head>
            <link rel='manifest' href='/manifest.json' />
            <link rel='icon' href='/icons/icon-192x192.png' />
            <meta name='theme-color' content='#ffffff' />
            <meta name='mobile-web-app-capable' content='yes' />
            <meta name='apple-mobile-web-app-capable' content='yes' />
            <link rel='apple-touch-icon' href='/icons/icon-192x192.png' />
            <meta name='apple-mobile-web-app-capable' content='yes' />
            <meta
              name='apple-mobile-web-app-status-bar-style'
              content='black-translucent'
            />
          </Head>
          <Component {...pageProps} />
        </Layout>
      </PrivateRoute>
    </AuthContextProvider>
  );
}
