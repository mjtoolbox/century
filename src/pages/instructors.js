import React from 'react';
import {AppContext} from '@/components/AppContext';
import { attributes } from '../content/home.md';
import { useState, useEffect, useContext } from 'react';

const Instructors = () => {
  const { language, setLanguage } = useContext(AppContext);
  let { instructors } = attributes;

  return (
    <div className='bg-base-100 py-8'>
      <h1 className='text-center text-2xl font-bold'>
        {language === 'en' ? instructors.title : instructors.ktitle}
      </h1>
      <div className='grid grid-flow-row justify-items-center'>
        <div className='container mx-auto'>
          <ul className='list-disc list-inside text-left pl-20'>
            <li className='py-1'>
              {language === 'en' ? instructors.li1 : instructors.kli1}
            </li>
            <li className='py-1'>
              {language === 'en' ? instructors.li2 : instructors.kli2}
            </li>
            <li className='py-1'>
              {language === 'en' ? instructors.li3 : instructors.kli3}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Instructors;
