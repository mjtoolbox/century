import React, { Fragment } from 'react';
import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Head from 'next/head';
import Main from './Main';
import { attributes } from '../content/home.md';

const Layout = ({ children }) => {
  const [title, setTitle] = useState('Century Kumdo');
  const [language, setLanguage] = useState('en');

  let { heading } = attributes;

  const handleLanguageToggle = (checked) => {
    if (checked) {
      // console.log('checked now kr');
      setLanguage('kr');
    } else {
      // console.log('unchecked now en');
      setLanguage('en');
    }
  };

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
      <Header
        heading={heading}
        language={language}
        handleLanguageToggle={handleLanguageToggle}
      />
      {children}
      <Footer />
    </Fragment>
  );
};

export default Layout;
