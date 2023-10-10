import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { AppContext, useAuthContext } from '@/components/AppContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Header = (props) => {
  const { language, setLanguage } = useContext(AppContext);
  const [title, setTitle] = useState('Kumdo');

  const handleClick = () => {
    const elem = document.activeElement;
    if (elem) {
      elem?.blur();
    }
  };

  const [isLogged, setLoggedin] = useState(false);
  const { user } = useAuthContext();
  const router = useRouter();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        setLoggedin(false);
        router.push('/');
        console.log('Signed out successfully');
      })
      .catch((error) => {
        // An error happened.
      });
  };

  // React.useEffect(() => {
  //   if (user != null) {
  //     setLoggedin(true);
  //   }
  // }, [user]);

  useEffect(() => {
    if (user != null) {
      setLoggedin(true);
    }
    const id = setInterval(() => {
      if (title === 'Kumdo') {
        setTitle('Kendo');
      } else if (title === 'Kendo') {
        setTitle('Kumdo');
      }
    }, 5000);
    return () => clearInterval(id);
  }, [title, user]);
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
            <li onClick={handleClick}>
              <Link href='/aboutdetail'>
                {language === 'en' ? props.heading.menu1 : props.heading.kmenu1}
              </Link>
            </li>
            <li onClick={handleClick}>
              <Link href='/membership'>
                {language === 'en' ? props.heading.menu5 : props.heading.kmenu5}
              </Link>
            </li>
            <li onClick={handleClick}>
              <Link href='/schedule'>
                {language === 'en' ? props.heading.menu2 : props.heading.kmenu2}
              </Link>
            </li>
            <li onClick={handleClick}>
              <Link href='/instructors'>
                {language === 'en' ? props.heading.menu8 : props.heading.kmenu8}
              </Link>
            </li>
            <li onClick={handleClick}>
              <Link href='/contactus'>
                {language === 'en' ? props.heading.menu7 : props.heading.kmenu7}
              </Link>
            </li>
          </ul>
        </div>
        <Link href='/' className='btn btn-ghost normal-case text-xl'>
          {language === 'en' ? props.heading.heading1 : props.heading.kheading1}{' '}
          {language === 'en' ? title : ''}{' '}
          {language === 'en' ? props.heading.heading2 : props.heading.kheading2}
        </Link>
      </div>
      <div className='navbar-end hidden lg:flex'>
        <ul className='menu menu-horizontal px-1'>
          <li>
            <Link href='/aboutdetail'>
              {language === 'en' ? props.heading.menu1 : props.heading.kmenu1}
            </Link>
          </li>
          <li>
            <Link href='/membership'>
              {language === 'en' ? props.heading.menu5 : props.heading.kmenu5}
            </Link>
          </li>
          <li>
            <Link href='/schedule'>
              {language === 'en' ? props.heading.menu2 : props.heading.kmenu2}
            </Link>
          </li>
          <li>
            <Link href='/instructors'>
              {language === 'en' ? props.heading.menu8 : props.heading.kmenu8}
            </Link>
          </li>
          <li>
            <Link href='/contactus'>
              {language === 'en' ? props.heading.menu7 : props.heading.kmenu7}
            </Link>
          </li>
        </ul>
      </div>
      <div className='navbar-end'>
        {!isLogged && (
          <Link href='/login' className='btn btn-sm mr-3'>
            {language === 'en' ? props.heading.login : props.heading.klogin}
          </Link>
        )}
        {isLogged && (
          <div>
            <label className='btn btn-xs btn-ghost mr-2'>{user.email}</label>
            <button
              className='btn btn-sm btn-neutral mr-2'
              onClick={handleLogout}
            >
              {language === 'en' ? props.heading.logout : props.heading.klogout}
            </button>
          </div>
        )}

        <label className='swap swap-flip text-9xl'>
          <input
            type='checkbox'
            onClick={(e) =>
              e.target.checked ? setLanguage('en') : setLanguage('kr')
            }
          />
          <div className='swap-on'>
            <img id='iconkorea' className='h-6 w-6 ' src='/korea.png' />
          </div>
          <div className='swap-off'>
            <img id='iconkorea' className='h-6 w-6 ' src='/canada.png' />
          </div>
        </label>
      </div>
    </div>
  );
};

export default Header;
