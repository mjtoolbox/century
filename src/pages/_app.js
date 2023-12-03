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
          <Component {...pageProps} />
        </Layout>
      </PrivateRoute>
    </AuthContextProvider>
  );
}
