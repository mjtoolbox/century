import React, { Fragment } from 'react';
import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import Head from 'next/head';
import Main from './Main';
import { attributes } from '../content/home.md';
import { krattributes } from '../content/homekr.md';

const Layout = ({ children }) => {
  const [title, setTitle] = useState('Century Kumdo');
  const [language, setLanguage] = useState('en');

  let { heading } = attributes;

  // if (language === 'en') {
  //   heading = attributes;
  // } else if (language === 'kr') {
  //   heading = krattributes;
  // }

  const handleLanguageToggle = (checked) => {
    if (checked) {
      console.log('checked now kr');
      setLanguage('kr');
    } else {
      console.log('unchecked now en');
      setLanguage('en');
    }
  };

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
      <Header
        heading={heading}
        // krheading={krheading}
        language={language}
        handleLanguageToggle={handleLanguageToggle}
      />
      {children}
      <Footer />
    </Fragment>
  );
};

export default Layout;
