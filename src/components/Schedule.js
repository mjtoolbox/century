import React, { Fragment, useEffect, useContext } from 'react';
import AppContext from '@/pages/AppContext';
const Schedule = (props) => {
  const { language, setLanguage } = useContext(AppContext);

  return (
    <Fragment>
      <div className='text-3xl font-bold text-center m-10' id='gallery'>
        {language === 'en' ? props.schedule.title : props.schedule.ktitle}
      </div>
      <div className='flex justify-evenly flex-wrap' id='schedule'>
        <div className='mx-9 my-8 min-h-min'>
          <div className='card w-96 bg-base-100 shadow-xl'>
            <div className='card-body'>
              <h1 className='card-title font-bold'>LANGLEY</h1>
              <div className='text-lg '>Monday: 7pm - 9pm</div>
              <div className='text-lg '>Wednesday: 7pm - 9pm</div>
              <h3 className='text-xl mt-3 '>Address: </h3>
              <div className='text-lg '>Lions Society West Langley Hall</div>
              <div className='text-lg '>
                9400 208 St, Langley Twp, BC V1M 2Y9
              </div>
            </div>
          </div>
        </div>
        <div className='mx-9 my-8 min-h-min'>
          <div className='card w-96 bg-base-100 shadow-xl'>
            <div className='card-body'>
              <h1 className='card-title font-bold'>COQUITLAM</h1>
              <p className='text-lg '>Friday: 7:30pm - 9pm</p>
              <p className='text-lg text-red-500'>{props.schedule.msg} </p>
              <h3 className='text-xl mt-3 '>Address: </h3>
              <div className='text-lg '>{props.schedule.place}</div>
              <div className='text-lg '>{props.schedule.address}</div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Schedule;
