import React from 'react';
import { useState, useEffect, useContext } from 'react';
import {AppContext} from '@/components/AppContext';

const About = (props) => {
  const { language, setLanguage } = useContext(AppContext);
  var engtext =
    props.about.heading1 + ' ' + props.title + ' ' + props.about.heading2;

  return (
    <div className='hero h-fit bg-base-200' id='about'>
      <div className='hero-content flex-col sm:flex-row'>
        <img src='/logo.jpg' className='max-w-sm rounded-lg shadow-2xl' />
        <div>
          <h1 className='text-3xl font-bold tracking-wide'>
            {language === 'en' ? engtext : props.about.kheading}
          </h1>
          <p className='py-6'>
            {language === 'en'
              ? props.about.description
              : props.about.kdescription}
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
