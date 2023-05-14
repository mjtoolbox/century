import React from 'react';

const About = () => {
  return (
    <div className='hero h-96 bg-base-200' id='about'>
      <div className='hero-content flex-col sm:flex-row'>
        <img src='/logo.jpg' className='max-w-sm rounded-lg shadow-2xl' />
        <div>
          <h1 className='text-3xl font-bold'>About Century Kumdo Club</h1>
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
