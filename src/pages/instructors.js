import React from 'react';
import { attributes } from '../content/home.md';

const Instructors = () => {
  let { instructors } = attributes;

  return (
    <div className='bg-base-100 py-8'>
      <h1 className='text-center text-2xl font-bold'>{instructors.title}</h1>
      <div className='grid grid-flow-row justify-items-center'>
        <div className='container mx-auto'>
          <ul className='list-disc list-inside text-left pl-20'>
            <li className='py-1'>{instructors.li1}</li>
            <li className='py-1'>{instructors.li2}</li>
            <li className='py-1'>{instructors.li3}</li>
            <li className='py-1'>{instructors.li4}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Instructors;
