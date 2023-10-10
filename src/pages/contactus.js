import React from 'react';
import {AppContext} from '@/components/AppContext';
import { attributes } from '../content/home.md';

const ContactUs = () => {
  let { contactus } = attributes;

  return (
    <div className='bg-base-100 py-8'>
      <div className='text-3xl font-bold text-center m-10' id='gallery'>
        {/* {language === 'en' ? props.schedule.title : props.schedule.ktitle} */}
        {contactus.title}
      </div>
      <div className='flex justify-evenly flex-wrap' id='schedule'>
        <div className='mx-9 my-8 min-h-min'>
          <div className='card w-96 bg-base-100 shadow-xl'>
            <div className='card-body'>
              <h1 className='card-title font-bold'>LANGLEY</h1>
              <div className='text-lg '>Monday: 7pm - 9pm</div>
              <div className='text-lg '>Wednesday: 7pm - 9pm</div>
              <h3 className='text-xl mt-3 '>Address: </h3>
              <div className='text-lg '>{contactus.place2}</div>
              <div className='text-lg '>{contactus.add2}</div>
            </div>
          </div>
        </div>
        <div className='mx-9 my-8 min-h-min'>
          <div className='card w-96 bg-base-100 shadow-xl'>
            <div className='card-body'>
              <h1 className='card-title font-bold'>COQUITLAM</h1>
              <p className='text-lg '>Friday: 7:30pm - 9pm</p>
              <p className='text-lg text-red-500'>{contactus.msg} </p>
              <h3 className='text-xl mt-3 '>Address: </h3>
              <div className='text-lg '>{contactus.place1}</div>
              <div className='text-lg '>{contactus.add1}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
