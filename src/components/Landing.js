import React from 'react';
import { useState, useEffect, useContext } from 'react';
import AppContext from '@/components/AppContext';

const Home = (props) => {
  const { language, setLanguage } = useContext(AppContext);
  var title = 'CENTURY ' + props.title;

  return (
    <div className="hero min-h-screen bg-[url('../../public/kendo0.jpg')]">
      <div className='hero-overlay bg-opacity-60'></div>
      <div className='hero-content text-center text-neutral-content'>
        <div className='max-w-md'>
          <h1 className='mb-5 text-5xl font-bold uppercase'>
            {language === 'en' ? title : props.landing.ktitle}
          </h1>
          <p className='mb-5'>
            {language === 'en'
              ? props.landing.subtitle
              : props.landing.ksubtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
