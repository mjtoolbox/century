import React, { Fragment } from 'react';
import { useState, useEffect, useContext } from 'react';
import Header from './Header';
import Footer from './Footer';
import Head from 'next/head';
import { attributes } from '../content/home.md';
import { usePathname } from 'next/navigation';

const Layout = ({ children }) => {
  const [title, setTitle] = useState('Century Kumdo');
  const pathname = usePathname();

  let { heading } = attributes;

  useEffect(() => {
    const id = setInterval(() => {
      if (title === 'Century Kumdo') {
        setTitle(heading.ktitle);
      } else {
        setTitle(heading.title);
      }
    }, 5000);
    return () => clearInterval(id);
  }, [title]);

  return (
    <Fragment>
      <Head>
        <title>{title}</title>
      </Head>
      {pathname !== '/login' && <Header heading={heading} />}
      {children}
      {pathname !== '/login' && <Footer />}
    </Fragment>
  );
};

export default Layout;
