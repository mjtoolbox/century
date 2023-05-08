import { Inter } from 'next/font/google';
import { Fragment } from 'react';
import Layout from '../components/Layout';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <Fragment>
      <Layout />
    </Fragment>
  );
}
