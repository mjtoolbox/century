import React from 'react';
import AppContext from '@/components/AppContext';
import { attributes } from '../content/home.md';

const AboutDetail = () => {
  let { aboutDetail } = attributes;

  return (
    <div className='bg-base-100 py-8'>
      <h1 className='text-center text-2xl font-bold pb-5'>
        {aboutDetail.title}
      </h1>
      <div className='container mx-auto '>
        <div className='px-4'>{aboutDetail.description}</div>
      </div>
    </div>
  );
};

export default AboutDetail;
