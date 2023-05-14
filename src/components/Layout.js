import React, { Fragment } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Main from './Main';
import About from './About';
import Schedule from './Schedule';
import Landing from './Landing';

const Layout = () => {
  return (
    <Fragment>
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
