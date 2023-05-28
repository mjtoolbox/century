import React, { Fragment } from 'react';
import Gallery from './Gallery';
import About from './About';
import Schedule from './Schedule';
import Landing from './Landing';

const Main = () => {
  return (
    <Fragment>
      <Landing />
      <About />
      <Schedule />
      <Gallery />
    </Fragment>
  );
};

export default Main;
