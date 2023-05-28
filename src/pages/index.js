import { Inter } from 'next/font/google';
import { Fragment } from 'react';
import Main from '../components/Main';
import Layout from '@/components/Layout';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <Fragment>
      <Main />
    </Fragment>
  );
}
