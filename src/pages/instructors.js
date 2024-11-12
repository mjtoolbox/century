import React, { useContext } from 'react';
import { AppContext } from '@/components/AppContext';
import { attributes } from '../content/home.md';

const Instructors = () => {
  const { language } = useContext(AppContext);
  const { instructors } = attributes;

  return (
    <div className='bg-gray-100 py-12 px-4'>
      <h1 className='text-center text-3xl font-bold text-gray-800 mb-10'>
        {language === 'en' ? instructors.title : instructors.ktitle}
      </h1>

      {/* Instructors grid */}
      <div className='container mx-auto grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
        {instructors.profiles.map((instructor, index) => (
          <div
            key={index}
            className='bg-white shadow-lg rounded-lg overflow-hidden transform transition duration-500 hover:scale-105'
          >
            {/* Profile Picture */}
            <div className='w-full h-90 overflow-hidden'>
              <img
                src={instructor.image}
                alt={`${instructor.name} profile`}
                className='w-full h-full object-cover object-top'
              />
            </div>

            {/* Profile Info */}
            <div className='p-6'>
              <h2 className='text-xl font-semibold text-gray-800'>
                {language === 'en' ? instructor.name : instructor.kname}
              </h2>
              <p className='text-gray-500 mt-2'>
                {language === 'en' ? instructor.bio : instructor.kbio}
              </p>
            </div>

            {/* Decorative Border or Accent Line */}
            <div className='h-1 bg-indigo-500'></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Instructors;
