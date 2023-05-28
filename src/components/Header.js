import React from 'react';
import { useState, useEffect } from 'react';

const Header = (props) => {
  const [title, setTitle] = useState('Kumdo');

  useEffect(() => {
    const id = setInterval(() => {
      if (title === 'Kumdo') {
        setTitle('Kendo');
      } else if (title === 'Kendo') {
        setTitle('Kumdo');
      }
    }, 5000);
    return () => clearInterval(id);
  }, [title]);
  return (
    <div className='navbar bg-base-100'>
      <div className='navbar-start'>
        <div className='dropdown'>
          <label tabIndex={0} className='btn btn-ghost lg:hidden'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M4 6h16M4 12h8m-8 6h16'
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className='menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52'
          >
            <li>
              <a href='#about'>{props.heading.menu1}</a>
            </li>
            <li>
              <a href='#schedule'>{props.heading.menu2}</a>
            </li>
            <li>
              <a href='#gallery'>{props.heading.menu3}</a>
            </li>
          </ul>
        </div>
        <a className='btn btn-ghost normal-case text-xl'>
          {props.heading.heading1} {title} {props.heading.heading2}
        </a>
      </div>
      <div className='navbar-end hidden lg:flex'>
        <ul className='menu menu-horizontal px-1'>
          <li>
            <a href='#about'>{props.heading.menu1}</a>
          </li>
          <li>
            <a href='#schedule'>{props.heading.menu2}</a>
          </li>
          <li>
            <a href='#gallery'>{props.heading.menu3}</a>
          </li>
        </ul>
      </div>
      <div className='navbar-end'>
        <a className='btn btn-sm mr-3'>{props.heading.login}</a>

        <label className='swap swap-flip text-9xl'>
          <input type='checkbox' />
          <div className='swap-off'>
            <img className='h-6 w-6 ' src='/korea.png' />
          </div>
          <div className='swap-on'>
            <img className='h-6 w-6 ' src='/canada.png' />
          </div>
        </label>
      </div>
    </div>
  );
};

export default Header;
