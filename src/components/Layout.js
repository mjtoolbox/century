import React, { Fragment } from 'react';
import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Head from 'next/head';
import Main from './Main';
import { attributes } from '../content/home.md';

const Layout = ({ children }) => {
  const [title, setTitle] = useState('Century Kumdo');
  let { heading } = attributes;

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
      <Header heading={heading} />
      {children}
      <Footer />
    </Fragment>
  );
};

export default Layout;
