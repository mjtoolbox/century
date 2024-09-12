import React, { Fragment, useState, useEffect } from 'react';
import { useFormik } from 'formik';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useRouter } from 'next/navigation';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.tz.setDefault('America/Vancouver');

const EditCalendar = () => {
  const [date, setDate] = useState();
  const router = useRouter();

  const handleOnChange = (event) => {
    console.log('Form::onChange', event.target.value);
    if (event.target.value === 'Langley Langley Lions Society') {
      formik.setFieldValue('description', 'Lions Society West Langley Hall');
      formik.setFieldValue('time', '7-9pm');
      formik.setFieldValue('color', '#6495ED');
    } else if (event.target.value === 'Coq Harbour View') {
      formik.setFieldValue('description', 'Coquitlam Harbour View Elementary');
      formik.setFieldValue('time', '7-9pm');
      formik.setFieldValue('color', '#8FBC8F');
    } else if (event.target.value === 'Coq Lord Baden-Powell') {
      formik.setFieldValue(
        'description',
        'Coquitlam Lord Baden-Powell Elementary'
      );
      formik.setFieldValue('time', '7-9pm');
      formik.setFieldValue('color', '#006400');
    } else if (event.target.value === 'Holiday') {
      formik.setFieldValue('description', 'Write name of the holiday here');
      formik.setFieldValue('time', 'all day');
      formik.setFieldValue('color', '#DC143C');
    } else if (event.target.value === 'Other') {
      formik.setFieldValue('description', 'Write event detail here');
      formik.setFieldValue('time', 'all day');
      formik.setFieldValue('color', '#2F4F4F');
    } else {
      formik.setFieldValue('time', 'all day');
    }
  };

  const formik = useFormik({
    initialValues: {
      title: 'Langley Langley Lions Society',
      description: 'Lions Society West Langley Hall',
      date: dayjs(new Date().setHours(0, 0, 0, 0)).tz(
        'America/Vancouver',
        true
      ),
      time: '7-9pm',
      color: '#6495ED',
    },
    onSubmit: async (values) => {
      //   alert(JSON.stringify(values, null, 2));
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      // Handle response if necessary
      const result = await response.json();
      console.log('res', result);
      if (result != null) {
        router.push('/calendar');
      }
    },
  });
  return (
    <div className='container my-12 mx-auto px-4 md:px-12'>
      <form onSubmit={formik.handleSubmit} onChange={handleOnChange}>
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
                onChange={formik.handleChange}
                value={formik.values.title}
                // defaultValue='Langley Langley Lions Society'
                id='title'
                name='title'
                type='text'
              >
                <option value='Langley Langley Lions Society'>
                  Langley Lions Society
                </option>
                <option value='Coq Harbour View'>Coq Harbour View</option>
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
              id='description'
              type='text'
              placeholder='Event detail and Address'
              name='description'
              onChange={formik.handleChange}
              value={formik.values.description}
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
            <DatePicker
              inputClassName='appearance-none w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500'
              id='date'
              name='date'
              type='text'
              views={['year', 'month', 'day']}
              onChange={(value) => {
                formik.setFieldValue(
                  'date',
                  dayjs(new Date(value).setHours(0, 0, 0, 0)).tz(
                    'America/Vancouver',
                    true
                  )
                );
              }}
              //onChange={formik.handleChange}
              value={formik.values.date}
              disablePast
              timezone='America/Vancouver'
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
                id='time'
                name='time'
                type='text'
                onChange={formik.handleChange}
                value={formik.values.time}
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
              id='color'
              onChange={formik.handleChange}
              value={formik.values.color}
              name='color'
              type='text'
            >
              <option value='#6495ED'>Blue</option>
              <option value='#8FBC8F'>Green</option>
              <option value='#006400'>Dark Green</option>
              <option value='#DC143C'>Red</option>
              <option value='#2F4F4F'>Black</option>
            </select>
          </div>
        </div>
        <button className='btn btn-outline btn-sm mt-6' type='submit'>
          Save
        </button>
      </form>
    </div>
  );
};
export default EditCalendar;
