import React, { Fragment } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Main from './Main';
import About from './About';

const Layout = () => {
  return (
    <Fragment>
      <Navbar />
      <Main />
      <About />
      <Footer />
    </Fragment>
  );
};

export default Layout;
