import React, { Fragment, useState, useEffect } from 'react';
import Datepicker from 'react-tailwindcss-datepicker';

const EditSchedule = () => {
  const [inputBox, setInputBox] = useState(false);
  const [title, setTitle] = useState('Langley Langley Lions Society');
  const [description, setDescription] = useState(
    'Lions Society West Langley Hall'
  );
  const [date, setDate] = useState();
  const [time, setTime] = useState('7-9pm');
  const [color, setColor] = useState('#6495ED');

  const handleTitle = (e) => {
    setTitle(e.target.value);
    if (title === 'Langley Langley Lions Society') {
      setColor('#6495ED');
      setTime('7-9pm');
      setDescription('Lions Society West Langley Hall');
    } else if (title === 'coq Harbour View') {
      setColor('#8FBC8F');
      setTime('7:30-9pm');
      setDescription('Coquitlam Harbour View Elementary');
    } else if (title === 'Coq Lord Baden-Powell') {
      setColor('#006400');
      setTime('7:30-9pm');
      setDescription('Coquitlam Lord Baden-Powell Elementary');
    } else if (title === 'Holiday') {
      setColor('#DC143C');
      setTime('all day');
      setDescription('Write name of the holiday here');
    } else {
      setColor('#2F4F4F');
      setTime('all day');
      setDescription('Write event detail here');
    }
  };

  const handleDateChange = (newValue) => {
    setDate(newValue);
  };

  const handleTime = (e) => {
    setTime(e.target.value);
  };

  const handleColor = (e) => {
    setColor(e.target.value);
  };

  useEffect(() => {
    console.log(title, date, time, color);
    if (title === 'Other') {
      setInputBox(true);
    } else {
      setInputBox(false);
    }

    if (title === 'Langley Langley Lions Society') {
      setColor('#6495ED');
      setTime('7-9pm');
      setDescription('Lions Society West Langley Hall');
    } else if (title === 'coq Harbour View') {
      setColor('#8FBC8F');
      setTime('7:30-9pm');
      setDescription('Coquitlam Harbour View Elementary');
    } else if (title === 'Coq Lord Baden-Powell') {
      setColor('#006400');
      setTime('7:30-9pm');
      setDescription('Coquitlam Lord Baden-Powell Elementary');
    } else if (title === 'Holiday') {
      setColor('#DC143C');
      setTime('all day');
      setDescription('Write name of the holiday here');
    } else {
      setColor('#2F4F4F');
      setTime('all day');
      setDescription('Write event detail here');
    }
    // Whatever else we want to do after the state has been updated.
  }, [title, time, color]);

  return (
    <div className='container my-12 mx-auto px-4 md:px-12 '>
      <htmlForm className='w-full max-w-md'>
        <div className='flex flex-wrap -mx-3 mb-6'>
          <div className='w-full md:w-1/2 px-3 mb-6 md:mb-0'>
            <label
              className='block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'
              htmlFor='grid-title'
            >
              Title
            </label>
            <div className='inline-block relative w-64'>
              <select
                className='block appearance-none w-full bg-gray-100 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500'
                onChange={handleTitle}
                defaultValue='Langley Langley Lions Society'
                id='grid-title'
              >
                <option value='Langley Langley Lions Society'>
                  Langley Lions Society
                </option>
                <option value='coq Harbour View'>Coq Harbour View</option>
                <option value='Coq Lord Baden-Powell'>
                  Coq Lord Baden-Powell
                </option>
                <option value='Holiday'>Holiday</option>
                <option value='Other'>Other</option>
              </select>
              <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                <svg
                  className='fill-current h-4 w-4'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                >
                  <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                </svg>
              </div>
            </div>
            {inputBox ? (
              <Fragment>
                <input
                  className='appearance-none block w-full bg-gray-100 text-gray-700 border border-red-500 rounded mt-6 py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white'
                  id='grid-titile'
                  type='text'
                  placeholder='Other Event name'
                />
                <p className='text-red-500 text-xs italic'>
                  Fill out name of event
                </p>
              </Fragment>
            ) : null}
          </div>
          <div className='w-full md:w-1/2 px-3'>
            <label
              className='block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'
              htmlFor='grid-description'
            >
              Description (max 50 char)
            </label>
            <input
              className='appearance-none block w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500'
              id='grid-description'
              type='text'
              placeholder='Event detail and Address'
              defaultValue={description}
            />
          </div>
        </div>

        <div className='flex flex-wrap -mx-3 mb-2'>
          <div className='w-full md:w-1/3 px-3 mb-6 md:mb-0'>
            <label
              className='block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'
              htmlFor='grid-date'
            >
              Date
            </label>
            <Datepicker
              inputClassName='appearance-none w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500'
              value={date}
              asSingle={true}
              useRange={false}
              onChange={handleDateChange}
            />
          </div>
          <div className='w-full md:w-1/3 px-3 mb-6 md:mb-0'>
            <label
              className='block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'
              htmlFor='grid-time'
            >
              Time
            </label>
            <div className='relative'>
              <select
                className='block appearance-none w-full bg-gray-100 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500'
                id='grid-time'
                onChange={handleTime}
                value={time}
              >
                <option value='7-9pm'>7-9pm</option>
                <option value='7:30-9pm'>7:30-9pm</option>
                <option value='all day'>all day</option>
              </select>
              <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700'>
                <svg
                  className='fill-current h-4 w-4'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                >
                  <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                </svg>
              </div>
            </div>
          </div>
          <div className='w-full md:w-1/3 px-3 mb-6 md:mb-0'>
            <label
              className='block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2'
              htmlFor='grid-color'
            >
              Color (Holiday: Red, Event: Black)
            </label>
            <select
              className='block appearance-none w-full bg-gray-100 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500'
              id='grid-color'
              onChange={handleColor}
              value={color}
            >
              <option value='#6495ED'>Blue</option>
              <option value='#8FBC8F'>Green</option>
              <option value='#006400'>Dark Green</option>
              <option value='#DC143C'>Red</option>
              <option value='#2F4F4F'>Black</option>
            </select>
          </div>
        </div>
      </htmlForm>
      <button className='btn btn-neutral mt-6'>Neutral</button>
    </div>
  );
};

export default EditSchedule;
