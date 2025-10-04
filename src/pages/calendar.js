import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
// import pool from '../utils/postgres';
import pool from '../utils/vercelpostgres';

moment.locale('en-ca');
//momentLocalizer(moment);

const localizer = momentLocalizer(moment);

//color blue #6495ED (langley), green #8FBC8F (coquitlam), red #DC143C (holiday), gray #2F4F4F (special event), pink #FF1493 (new Coq)

const styles = {
  container: {
    width: '80wh',
    height: '60vh',
    margin: '2em',
  },
};

const CustomCalendar = ({ serializedData }) => {
  // Parse events only when serializedData changes
  const events = useMemo(() => {
    const parsedEvents = JSON.parse(serializedData).map((event) => {
      const startDateParts = event.start_date.split('-');
      const endDateParts = event.end_date.split('-');
      return {
        ...event,
        start: new Date(
          startDateParts[0],
          startDateParts[1] - 1,
          startDateParts[2].substr(0, 2),
          startDateParts[2].substr(3, 2),
          startDateParts[2].substr(6, 2),
          startDateParts[2].substr(9, 2)
        ),
        end: new Date(
          endDateParts[0],
          endDateParts[1] - 1,
          endDateParts[2].substr(0, 2),
          endDateParts[2].substr(3, 2),
          endDateParts[2].substr(6, 2),
          endDateParts[2].substr(9, 2)
        ),
      };
    });
    return parsedEvents;
  }, [serializedData]);
  // console.log('Updated events:', events);

  const clickRef = useRef(null);

  useEffect(() => {
    /**
     * What Is This?
     * This is to prevent a memory leak, in the off chance that you
     * teardown your interface prior to the timed method being called.
     */
    return () => {
      window.clearTimeout(clickRef?.current);
    };
  }, []);

  const onSelectEvent = useCallback((calEvent) => {
    /**
     * Here we are waiting 250 milliseconds (use what you want) prior to firing
     * our method. Why? Because both 'click' and 'doubleClick'
     * would fire, in the event of a 'doubleClick'. By doing
     * this, the 'click' handler is overridden by the 'doubleClick'
     * action.
     */
    window.clearTimeout(clickRef?.current);
    clickRef.current = window.setTimeout(() => {
      window.alert(calEvent.detail + ' ' + calEvent.time_duration);
    }, 250);
  }, []);

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.color || '#6495ED', // Fallback color
      borderRadius: '4px',
      color: 'white',
      border: '1px solid #fff',
      fontWeight: 'bold',
    },
  });

  return (
    <div style={styles.container}>
      <BigCalendar
        selectable={true}
        popup={false}
        localizer={localizer}
        events={events}
        defaultView={Views.MONTH}
        views={[Views.MONTH]}
        defaultDate={new Date()}
        resourceIdAccessor='resourceId'
        resourceTitleAccessor='resourceTitle'
        style={{ fontSize: 9 }}
        onSelectEvent={onSelectEvent}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
};

export async function getServerSideProps() {
  try {
    const nonSerializableData = await pool.query(
      "SELECT * FROM event where start_date >= date_trunc('month', current_timestamp) - interval '1 month' ORDER BY start_date"
    );

    const serializedData = JSON.stringify(nonSerializableData.rows);

    return {
      props: {
        serializedData,
      },
    };
  } catch (error) {
    console.error('Error fetching data in getServerSideProps:', error?.stack || error);
    return {
      props: {
        // The page expects a JSON string; return an empty array serialized to maintain shape
        serializedData: JSON.stringify([]),
      },
    };
  }
}

export default CustomCalendar;
