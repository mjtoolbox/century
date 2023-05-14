import React from 'react';

const Schedule = () => {
  return (
    <div className='container'>
      <div className='flex-row grid grid-cols-2 gap-60'>
        <div className='mx-9 my-8 min-h-min'>
          <h1 className='text-2xl font-bold'>LANGLEY</h1>
          <div className='text-lg leading-loose'>Monday: 7pm - 9pm</div>
          <div className='text-lg leading-loose'>Wednesday: 7pm - 9pm</div>
        </div>
        <div className='mx-9 my-8 min-h-min'>
          <h1 className='text-2xl font-bold'>COQUITLAM</h1>
          <p className='text-lg leading-loose'>Friday: 7:30pm - 9pm</p>
        </div>
      </div>

      <div className='flex-row grid grid-cols-2 gap-60'>
        <div className='mx-9 mb-8 min-h-min'>
          <h1 className='text-xl font-bold'>Address: </h1>
          <div className='text-lg leading-loose'>
            Lions Society West Langley Hall
          </div>
          <div className='text-lg leading-loose'>
            9400 208 St, Langley Twp, BC V1M 2Y9
          </div>
        </div>
        <div className='mx-9 mb-8 min-h-min'>
          <h1 className='text-xl font-bold'>Address:</h1>
          <div className='text-lg leading-loose'>Harbour View Elementary</div>
          <div className='text-lg leading-loose'>
            960 Lillian St, Coquitlam, BC V3J 5C7
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
