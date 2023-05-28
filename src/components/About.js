import React from 'react';
import { useState, useEffect } from 'react';

const About = (props) => {
  // const [title, setTitle] = useState('Kumdo');

  // useEffect(() => {
  //   const id = setInterval(() => {
  //     if (title === 'Kumdo') {
  //       setTitle('Kendo');
  //     } else if (title === 'Kendo') {
  //       setTitle('Kumdo');
  //     }
  //   }, 5000);
  //   return () => clearInterval(id);
  // }, [title]);

  return (
    <div className='hero h-96 bg-base-200' id='about'>
      <div className='hero-content flex-col sm:flex-row'>
        <img src='/logo.jpg' className='max-w-sm rounded-lg shadow-2xl' />
        <div>
          <h1 className='text-3xl font-bold tracking-wide'>
            {props.about.heading1} {props.title} {props.about.heading2}
          </h1>
          <p className='py-6'>{props.about.description}</p>
        </div>
      </div>
    </div>
  );
};

export default About;
