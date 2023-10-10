import React, { Fragment, useContext, useState, useEffect } from 'react';
import Gallery from './Gallery';
import About from './About';
import Schedule from './Schedule';
import Landing from './Landing';
import { attributes } from '../content/home.md';
import {AppContext} from '@/components/AppContext';

const Main = () => {
  const [title, setTitle] = useState('Kumdo');
  let { landing, about, schedule, gallery } = attributes;

  useEffect(() => {
    const id = setInterval(() => {
      if (title === 'Kumdo') {
        setTitle('Kendo');
      } else if (title === 'Kendo') {
        setTitle('Kumdo');
      }
    }, 5000);
    return () => clearInterval(id);
  }, [title]);

  return (
    <Fragment>
      <Landing title={title} landing={landing} />
      <About title={title} about={about} />
      <Schedule schedule={schedule} />
      <Gallery gallery={gallery} />
    </Fragment>
  );
};

export default Main;
