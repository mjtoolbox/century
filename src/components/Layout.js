import React, { Fragment } from 'react';
import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Head from 'next/head';
import Main from './Main';

const Layout = ({children}) => {
  const [title, setTitle] = useState('Century Kumdo');

  useEffect(() => {
    const id = setInterval(() => {
      if (title === 'Century Kumdo') {
        setTitle('센츄리 검도');
      } else {
        setTitle('Century Kumdo');
      }
    }, 5000);
    return () => clearInterval(id);
  }, [title]);

  return (
    <Fragment>
      <Head>
        <title>{title}</title>
      </Head>
      <Header />
      {children}
      <Footer />
    </Fragment>
  );
};

export default Layout;
