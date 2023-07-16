import React from 'react';
import AppContext from '@/components/AppContext';
import { attributes } from '../content/home.md';

const Membership = () => {
  let { membership } = attributes;

  return (
    <div className='bg-base-100 py-8'>
      <h1 className='text-center text-2xl font-bold'>{membership.title}</h1>
      <div className='grid grid-flow-row justify-items-center'>
        <div className='container mx-auto'>
          <ul className='list-disc list-inside text-left pl-4 '>
            <li className='py-1'>{membership.li1}</li>
            <li className='py-1'>{membership.li2}</li>
            <li className='py-1'>{membership.li3}</li>
            <li className='py-1'>{membership.li4}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Membership;
