import React from 'react';
import { useState, useEffect } from 'react';

const About = () => {
  const [title, setTitle] = useState('Kumdo');

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
    <div className='hero h-96 bg-base-200' id='about'>
      <div className='hero-content flex-col sm:flex-row'>
        <img src='/logo.jpg' className='max-w-sm rounded-lg shadow-2xl' />
        <div>
          <h1 className='text-3xl font-bold tracking-wide'>
            About Century {title} Club
          </h1>
          <p className='py-6'>
            Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda
            excepturi exercitationem quasi. In deleniti eaque aut repudiandae et
            a id nisi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
