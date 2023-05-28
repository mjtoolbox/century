import React from 'react';

const Schedule = (props) => {
  return (
    <div className='flex justify-evenly flex-wrap' id='schedule'>
      <div className='mx-9 my-8 min-h-min'>
        <div className='card w-96 bg-base-100 shadow-xl'>
          <div className='card-body'>
            <h1 className='card-title font-bold'>LANGLEY</h1>
            <div className='text-lg '>Monday: 7pm - 9pm</div>
            <div className='text-lg '>Wednesday: 7pm - 9pm</div>
            <h3 className='text-xl mt-3 '>Address: </h3>
            <div className='text-lg '>Lions Society West Langley Hall</div>
            <div className='text-lg '>9400 208 St, Langley Twp, BC V1M 2Y9</div>
          </div>
        </div>
      </div>
      <div className='mx-9 my-8 min-h-min'>
        <div className='card w-96 bg-base-100 shadow-xl'>
          <div className='card-body'>
            <h1 className='card-title font-bold'>COQUITLAM</h1>
            <p className='text-lg '>Friday: 7:30pm - 9pm</p>
            <p className='text-lg'>&nbsp; </p>
            <h3 className='text-xl mt-3 '>Address: </h3>
            <div className='text-lg '>{props.schedule.place}</div>
            <div className='text-lg '>{props.schedule.address}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
