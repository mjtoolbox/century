import React from 'react';
import Link from 'next/link';
// import pool from '../utils/postgres';
import pool from '../utils/vercelpostgres';

import { useRouter } from 'next/navigation';

const ManageCalendar = ({ serializedData }) => {
  const router = useRouter();

  const refreshData = () => {
    router.push('/manageCalendar');
  };

  const events = JSON.parse(serializedData);

  async function handleDelete(event_id) {
    console.log('eventid', event_id);
    const response = await fetch('/api/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: event_id,
    });
    refreshData();
  }

  return (
    <div className='container my-12 mx-auto px-4 md:px-12 '>
      <div className='flex flex-row justify-center'>
        <div className='text-2xl font-bold text-center m-5'>All Events</div>
        <div className='m-6 tooltip' data-tip='Add new event'>
          <Link href='/addCalendar'>
            <svg
              className='w-6 h-6 text-gray-800 dark:text-white'
              aria-hidden='true'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 20 20'
            >
              <path
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M10 5.757v8.486M5.757 10h8.486M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
              />
            </svg>
          </Link>
        </div>
      </div>
      <div className='flex justify-center'>
        <table className='table table-auto sm:px-5'>
          <thead>
            <tr>
              <th>Date</th>
              <th className='sm:hidden hidden md:table-cell'>Title</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.event_id} className='hover bg-slate-50'>
                <th>{event.start_date.substring(0, 10)}</th>
                <td className='sm:hidden hidden md:table-cell'>
                  {event.title}
                </td>
                <td>{event.detail}</td>
                <td>
                  {/* <Link
                    className='btn btn-xs btn-warning mr-2'
                    href='/editCalendar'
                  >
                    Edit
                  </Link> */}
                  <button
                    className='btn btn-xs btn-error'
                    onClick={async () => {
                      await handleDelete(`${event.event_id}`);
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export async function getServerSideProps() {
  try {
    const nonSerializableData = await pool.query(
      'SELECT * FROM event ORDER BY start_date desc'
    );

    const serializedData = JSON.stringify(nonSerializableData.rows);

    return {
      props: {
        serializedData,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        serializedData: [],
      },
    };
  }
}

export default ManageCalendar;
