import React, { Fragment } from 'react';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Main from './Main';
import About from './About';
import Schedule from './Schedule';
import Landing from './Landing';
import Head from 'next/head';

const Layout = () => {
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
      <Navbar />
      <Landing />
      <About />
      <Schedule />
      <Main />
      <Footer />
    </Fragment>
  );
};

export default Layout;
