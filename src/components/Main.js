import React, { Fragment } from 'react';

const Main = () => {
  return (
    <Fragment>
      <div className='carousel w-full'>
        <div id='item1' className='carousel-item w-full'>
          <img src='/sample1.jpg' className='w-full' />
        </div>
        <div id='item2' className='carousel-item w-full'>
          <img src='/sample2.jpg' className='w-full' />
        </div>
        <div id='item3' className='carousel-item w-full'>
          <img src='/sample3.jpg' className='w-full' />
        </div>
      </div>

      <div className='flex justify-center w-full py-2 gap-2'>
        <a href='#item1' className='btn btn-xs'>
          1
        </a>
        <a href='#item2' className='btn btn-xs'>
          2
        </a>
        <a href='#item3' className='btn btn-xs'>
          3
        </a>
      </div>
    </Fragment>
  );
};

export default Main;
