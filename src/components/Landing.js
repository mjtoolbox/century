import React from 'react';
import { useState, useEffect } from 'react';
import { attributes } from '../content/home.md';

const Home = () => {
  const [title, setTitle] = useState('CENTURY KUMDO');
  let { landing } = attributes;

  useEffect(() => {
    const id = setInterval(() => {
      console.log('Title is ' + title);
      if (title === 'CENTURY KUMDO') {
        setTitle('CENTURY KENDO');
        console.log('Set KENDO');
      } else if (title === 'CENTURY KENDO') {
        setTitle('CENTURY KUMDO');
        console.log('Set KUMDO');
      }
    }, 5000);
    return () => clearInterval(id);
  }, [title]);

  return (
    <div className="hero min-h-screen bg-[url('../../public/kendo.jpg')]">
      <div className='hero-overlay bg-opacity-60'></div>
      <div className='hero-content text-center text-neutral-content'>
        <div className='max-w-md'>
          <h1 className='mb-5 text-5xl font-bold'>{title}</h1>
          <p className='mb-5'>{landing.subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
