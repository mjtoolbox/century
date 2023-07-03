import React, { Fragment } from 'react';
import Gallery from './Gallery';
import About from './About';
import Schedule from './Schedule';
import Landing from './Landing';
import { useState, useEffect } from 'react';
import { attributes } from '../content/home.md';

const Main = () => {
  const [title, setTitle] = useState('Kumdo');
  const [language, setLanguage] = useState('en');

  let { landing, about, schedule } = attributes;

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
      <Landing title={title} landing={landing} language={language} />
      <About title={title} about={about} language={language} />
      <Schedule schedule={schedule} language={language} />
      <Gallery />
    </Fragment>
  );
};

export default Main;
