import { Inter } from 'next/font/google';
import { Fragment } from 'react';
import Main from '../components/Main';

const inter = Inter({ subsets: ['latin'] });

function Home() {
  return (
    <Fragment>
      <Main />
    </Fragment>
  );
}

export default Home;
