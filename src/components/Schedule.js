import React from 'react';

const Schedule = () => {
  return (
    <div className='hero h-48 bg-base-200'>
      <div className='hero-content flex-row sm:flex-row'>
        <div className='basis-1/2 min-h-min'>
          <h1 className='text-base font-bold'>LANGLEY</h1>
          <p className='py-6'>Monday: 7pm - 9pm</p>
          <p className='py-6'>Wednesday: 7pm - 9pm</p>
        </div>
        <div className='basis-1/2 min-h-min'>
          <h1 className='text-base font-bold'>About Century Kumdo Club</h1>
          <p className='py-6'>Friday: 7:30pm - 9pm</p>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
