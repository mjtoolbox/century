import Image from 'next/image';
import { Inter } from 'next/font/google';
import { Fragment } from 'react';
import Layout from '@/components/layout';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <Fragment>
      <Layout />
    </Fragment>
  );
}
