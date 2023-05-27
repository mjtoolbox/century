import React from 'react';
import { useState, useEffect } from 'react';

const Home = () => {
  const [title, setTitle] = useState('CENTURY KUMDO');

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
  }, [title]);

  return (
    <div className="hero min-h-screen bg-[url('../../public/kendo.jpg')]">
      <div className='hero-overlay bg-opacity-60'></div>
      <div className='hero-content text-center text-neutral-content'>
        <div className='max-w-md'>
          <h1 className='mb-5 text-5xl font-bold'>{title}</h1>
          <p className='mb-5'>
            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
            excepturi exercitationem quasi. In deleniti eaque aut repudiandae et
            a id nisi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
