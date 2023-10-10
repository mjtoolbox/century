import React from 'react';
import {AppContext} from '@/components/AppContext';
import { useState, useEffect, useContext } from 'react';
import { attributes } from '../content/home.md';

const Membership = () => {
  const { language, setLanguage } = useContext(AppContext);

  let { membership } = attributes;

  return (
    <div className='bg-base-100 py-8'>
      <h1 className='text-center text-2xl font-bold'>
        {language === 'en' ? membership.title : membership.ktitle}
      </h1>
      <div className='grid grid-flow-row justify-items-center'>
        <div className='container mx-auto'>
          <ul className='list-disc list-inside text-left pl-4 '>
            <li className='py-1'>
              {language === 'en' ? membership.li1 : membership.kli1}
            </li>
            <li className='py-1'>
              {language === 'en' ? membership.li2 : membership.kli2}
            </li>
            <li className='py-1'>
              {language === 'en' ? membership.li3 : membership.kli3}
            </li>
            <li className='py-1'>
              {language === 'en' ? membership.li4 : membership.kli4}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Membership;
