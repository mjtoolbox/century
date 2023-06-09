import React, { Fragment } from 'react';
import { useState, useEffect, useContext } from 'react';
import Header from './Header';
import Footer from './Footer';
import Head from 'next/head';
import Main from './Main';
import { attributes } from '../content/home.md';
import AppContext from '@/components/AppContext';

const Layout = ({ children }) => {
  const [title, setTitle] = useState('Century Kumdo');
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
      <Header heading={heading} />
      {children}
      <Footer />
    </Fragment>
  );
};

export default Layout;
