import React from 'react';
import AppContext from '@/components/AppContext';
import { useState, useEffect, useContext } from 'react';
import { attributes } from '../content/home.md';

const AboutDetail = () => {
  const { language, setLanguage } = useContext(AppContext);

  let { aboutDetail } = attributes;

  return (
    <div className='bg-base-100 py-8'>
      <h1 className='text-center text-2xl font-bold pb-5'>
        {language === 'en' ? aboutDetail.title : aboutDetail.ktitle}
      </h1>
      <div className='container mx-auto '>
        <div className='px-4'>
          {language === 'en'
            ? aboutDetail.description
            : aboutDetail.kdescription}
        </div>
      </div>
    </div>
  );
};

export default AboutDetail;
