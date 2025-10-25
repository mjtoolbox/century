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
  const [showLangPulse, setShowLangPulse] = useState(true);

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
        console.log(error);
      });
  };

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

  // Briefly pulse the language icon on first load to hint it's interactive
  useEffect(() => {
    const t = setTimeout(() => setShowLangPulse(false), 3000);
    return () => clearTimeout(t);
  }, []);
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
              <Link href='/calendar'>
                {language === 'en' ? props.heading.menu2 : props.heading.kmenu2}
              </Link>
            </li>
            <li onClick={handleClick}>
              <Link href='/instructors'>
                {language === 'en' ? props.heading.menu8 : props.heading.kmenu8}
              </Link>
            </li>
            <li onClick={handleClick}>
              <Link href='/members'>
                {language === 'en' ? props.heading.menu10 : props.heading.kmenu10}
              </Link>
            </li>
            <li onClick={handleClick}>
              <Link href='/contactus'>
                {language === 'en' ? props.heading.menu7 : props.heading.kmenu7}
              </Link>
            </li>
            {isLogged && (
              <li onClick={handleClick}>
                <Link href='/admin'>
                  {language === 'en'
                    ? props.heading.menu9
                    : props.heading.kmenu9}
                </Link>
              </li>
            )}
          </ul>
        </div>
        <Link href='/' className='btn btn-ghost normal-case text-xl'>
          {language === 'en' ? props.heading.heading1 : props.heading.kheading1}{' '}
          {language === 'en' ? title : ''}{' '}
          {language === 'en' ? props.heading.heading2 : props.heading.kheading2}
        </Link>
      </div>
      <div className='navbar-center hidden lg:flex'>
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
            <Link href='/calendar'>
              {language === 'en' ? props.heading.menu2 : props.heading.kmenu2}
            </Link>
          </li>
          <li>
            <Link href='/instructors'>
              {language === 'en' ? props.heading.menu8 : props.heading.kmenu8}
            </Link>
          </li>
          <li>
            <Link href='/members'>
              {language === 'en' ? props.heading.menu10 : props.heading.kmenu10}
            </Link>
          </li>
          <li>
            <Link href='/contactus'>
              {language === 'en' ? props.heading.menu7 : props.heading.kmenu7}
            </Link>
          </li>
          {isLogged && (
            <li onClick={handleClick}>
              <Link href='/admin'>
                {language === 'en' ? props.heading.menu9 : props.heading.kmenu9}
              </Link>
            </li>
          )}
        </ul>
      </div>
      <div className='navbar-end'>
        <label className='swap swap-flip text-9xl mr-3'>
          <input
            type='checkbox'
            onChange={(e) =>
              e.target.checked ? setLanguage('en') : setLanguage('kr')
            }
          />
          <div
            className={`swap-on tooltip tooltip-bottom ${showLangPulse ? 'animate-pulse' : ''}`}
            data-tip='Click to Korean'
            role='button'
            tabIndex={0}
            onClick={() => setLanguage('kr')}
            onKeyDown={(e) => (e.key === 'Enter' ? setLanguage('kr') : null)}
            aria-label='Switch to Korean'
          >
            <div className='flex flex-col items-center'>
              <img
                id='iconkorea'
                className='h-6 w-6 cursor-pointer rounded-full transition-transform transform hover:scale-110 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary'
                src='/korea.png'
                alt='Korean language'
              />
              {/* Small visible label on small screens to indicate clickability */}
              <span className='text-xs mt-1 text-gray-700 sm:hidden'>한국어</span>
            </div>
            <span className='sr-only'>Switch to Korean</span>
          </div>
          <div
            className={`swap-off tooltip tooltip-bottom ${showLangPulse ? 'animate-pulse' : ''}`}
            data-tip='Click to English'
            role='button'
            tabIndex={0}
            onClick={() => setLanguage('en')}
            onKeyDown={(e) => (e.key === 'Enter' ? setLanguage('en') : null)}
            aria-label='Switch to English'
          >
            <div className='flex flex-col items-center'>
              <img
                id='iconcanada'
                className='h-6 w-6 cursor-pointer rounded-full transition-transform transform hover:scale-110 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary'
                src='/canada.png'
                alt='English language'
              />
              <span className='text-xs mt-1 text-gray-700 sm:hidden'>EN</span>
            </div>
            <span className='sr-only'>Switch to English</span>
          </div>
        </label>
        {!isLogged && (
          <Link href='/login' className='btn btn-sm '>
            {language === 'en' ? props.heading.login : props.heading.klogin}
          </Link>
        )}
        {isLogged && (
          <div>
            <div
              className='avatar placeholder mr-2 tooltip tooltip-bottom'
              data-tip={user.email}
            >
              <div className='bg-neutral text-neutral-content rounded-full w-8'>
                <span className='text-xs'>{user.email.substring(0, 2)}</span>
              </div>
            </div>
            <button
              className='btn btn-sm btn-neutral mr-2'
              onClick={handleLogout}
            >
              {language === 'en' ? props.heading.logout : props.heading.klogout}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
