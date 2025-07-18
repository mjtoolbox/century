import React, { Fragment, useEffect, useContext } from 'react';
import { AppContext } from '@/components/AppContext';
const Gallery = (props) => {
  const { language, setLanguage } = useContext(AppContext);

  return (
    <Fragment>
      <div className='text-4xl font-bold text-center m-12' id='gallery'>
        {language === 'en' ? props.gallery.title : props.gallery.ktitle}
      </div>
      <div className='carousel w-full'>
        <div id='slide9' className='carousel-item relative w-full'>
          <img src='/sample9.jpg' className='w-full' />
          <div className='absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2'>
            <a href='#slide6' className='btn btn-circle'>
              ❮
            </a>
            <a href='#slide8' className='btn btn-circle'>
              ❯
            </a>
          </div>
        </div>
        <div id='slide8' className='carousel-item relative w-full'>
          <img src='/sample8.jpg' className='w-full' />
          <div className='absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2'>
            <a href='#slide9' className='btn btn-circle'>
              ❮
            </a>
            <a href='#slide7' className='btn btn-circle'>
              ❯
            </a>
          </div>
        </div>

        <div id='slide7' className='carousel-item relative w-full'>
          <img src='/sample7.jpg' className='w-full' />
          <div className='absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2'>
            <a href='#slide8' className='btn btn-circle'>
              ❮
            </a>
            <a href='#slide2' className='btn btn-circle'>
              ❯
            </a>
          </div>
        </div>

        <div id='slide2' className='carousel-item relative w-full'>
          <img src='/sample2.jpg' className='w-full' />
          <div className='absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2'>
            <a href='#slide7' className='btn btn-circle'>
              ❮
            </a>
            <a href='#slide3' className='btn btn-circle'>
              ❯
            </a>
          </div>
        </div>

        <div id='slide3' className='carousel-item relative w-full'>
          <img src='/sample3.jpg' className='w-full' />
          <div className='absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2'>
            <a href='#slide2' className='btn btn-circle'>
              ❮
            </a>
            <a href='#slide4' className='btn btn-circle'>
              ❯
            </a>
          </div>
        </div>
        <div id='slide4' className='carousel-item relative w-full'>
          <img src='/sample4.jpg' className='w-full' />
          <div className='absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2'>
            <a href='#slide3' className='btn btn-circle'>
              ❮
            </a>
            <a href='#slide5' className='btn btn-circle'>
              ❯
            </a>
          </div>
        </div>
        <div id='slide5' className='carousel-item relative w-full'>
          <img src='/sample5.jpg' className='w-full' />
          <div className='absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2'>
            <a href='#slide4' className='btn btn-circle'>
              ❮
            </a>
            <a href='#slide6' className='btn btn-circle'>
              ❯
            </a>
          </div>
        </div>
        <div id='slide6' className='carousel-item relative w-full'>
          <img src='/sample6.jpg' className='w-full' />
          <div className='absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2'>
            <a href='#slide5' className='btn btn-circle'>
              ❮
            </a>
            <a href='#slide9' className='btn btn-circle'>
              ❯
            </a>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Gallery;
