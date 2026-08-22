import React, { useEffect, useState } from 'react';
import Link from 'next/link';
// import pool from '../utils/postgres';
import pool from '../utils/vercelpostgres';
import { authFetch } from '../utils/authFetch';

const ManageCalendar = ({ serializedData }) => {
  const [events, setEvents] = useState(() => JSON.parse(serializedData));
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setEvents(JSON.parse(serializedData));
    setSelectedIds([]);
  }, [serializedData]);

  const allSelected = events.length > 0 && selectedIds.length === events.length;

  const toggleOne = (event_id) => {
    setSelectedIds((prev) =>
      prev.includes(event_id)
        ? prev.filter((id) => id !== event_id)
        : [...prev, event_id]
    );
  };

  const toggleAll = () => {
    setSelectedIds(allSelected ? [] : events.map((event) => event.event_id));
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 500);
  };

  async function handleDeleteSelected() {
    if (selectedIds.length === 0 || isDeleting) return;

    const count = selectedIds.length;
    if (
      !window.confirm(
        `Delete ${count} selected event${count > 1 ? 's' : ''}?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const results = await Promise.all(
        selectedIds.map(async (event_id) => {
          const response = await authFetch('/api/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ event_id }),
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            console.error('Delete failed', event_id, err);
            return { event_id, ok: false };
          }
          return { event_id, ok: true };
        })
      );

      const deletedIds = results.filter((r) => r.ok).map((r) => r.event_id);
      const failedCount = results.length - deletedIds.length;

      if (deletedIds.length > 0) {
        setEvents((prev) =>
          prev.filter((event) => !deletedIds.includes(event.event_id))
        );
        setSelectedIds((prev) => prev.filter((id) => !deletedIds.includes(id)));
        showToast(
          `${deletedIds.length} event${deletedIds.length > 1 ? 's' : ''} deleted`
        );
      }

      if (failedCount > 0) {
        alert(`Failed to delete ${failedCount} event(s)`);
      }
    } catch (err) {
      console.error('Error calling delete API', err);
      alert('Error deleting events');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className='container my-12 mx-auto px-4 md:px-12 '>
      {toastMessage && (
        <div className='fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow z-50'>
          {toastMessage}
        </div>
      )}
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
      <div className='flex justify-center mb-3'>
        <button
          className='btn btn-sm btn-error'
          disabled={selectedIds.length === 0 || isDeleting}
          onClick={handleDeleteSelected}
        >
          {isDeleting
            ? 'Deleting...'
            : `Delete selected${
                selectedIds.length > 0 ? ` (${selectedIds.length})` : ''
              }`}
        </button>
      </div>
      <div className='flex justify-center'>
        <table className='table table-auto sm:px-5'>
          <thead>
            <tr>
              <th>
                <input
                  type='checkbox'
                  className='checkbox checkbox-sm'
                  aria-label='Select all events'
                  checked={allSelected}
                  onChange={toggleAll}
                />
              </th>
              <th>Date</th>
              <th className='sm:hidden hidden md:table-cell'>Title</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.event_id} className='hover bg-slate-50'>
                <td>
                  <input
                    type='checkbox'
                    className='checkbox checkbox-sm'
                    aria-label={`Select event ${event.title}`}
                    checked={selectedIds.includes(event.event_id)}
                    onChange={() => toggleOne(event.event_id)}
                  />
                </td>
                <th>{event.start_date.substring(0, 10)}</th>
                <td className='sm:hidden hidden md:table-cell'>
                  {event.title}
                </td>
                <td>{event.detail}</td>
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
        serializedData: JSON.stringify([]),
      },
    };
  }
}

export default ManageCalendar;
