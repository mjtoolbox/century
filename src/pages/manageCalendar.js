import React from 'react';
import Link from 'next/link';
import pool from '../utils/postgres';

const ManageCalendar = ({ serializedData }) => {
  const events = JSON.parse(serializedData);

  // async function handleDelete(event_id) {
  //   console.log('eventid', event_id);
  //   const result = await pool.query(
  //     'SELECT * FROM event ORDER WHERE event_id =?',
  //     event_id
  //   );
  //   console.log(result);
  // }

  return (
    <div className='container my-12 mx-auto px-4 md:px-12 '>
      <div className='w-full flex justify-center'>
        <table className='table table-auto'>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Title</th>
              <th>Description</th>
              <th>Duration</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.event_id} className='hover bg-slate-50'>
                <th>{event.event_id}</th>
                <th>{event.start_date.substring(0, 10)}</th>
                <td>{event.title}</td>
                <td>{event.detail}</td>
                <td>{event.time_duration}</td>
                <td>
                  <btn
                    className='btn btn-sm btn-error'
                    onClick={async () => {
                      await handleDelete(`${event.event_id}`);
                    }}
                  >
                    Delete
                  </btn>
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
      'SELECT * FROM event ORDER BY start_date'
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
