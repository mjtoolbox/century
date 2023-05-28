import React from 'react';
import { useState, useEffect } from 'react';

const Home = (props) => {
  return (
    <div className="hero min-h-screen bg-[url('../../public/kendo.jpg')]">
      <div className='hero-overlay bg-opacity-60'></div>
      <div className='hero-content text-center text-neutral-content'>
        <div className='max-w-md'>
          <h1 className='mb-5 text-5xl font-bold uppercase'>CENTURY {props.title}</h1>
          <p className='mb-5'>{props.landing.subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
