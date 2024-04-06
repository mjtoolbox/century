import React, { useEffect, useRef, useCallback } from 'react';
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import pool from '../utils/postgres';

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
  const events = JSON.parse(serializedData);
  for (let i = 0; i < events.length; i++) {
    let start = events[i].start_date;
    let end = events[i].end_date;
    var dateParts = start.split('-');
    var edateParts = end.split('-');
    events[i].start = new Date(
      dateParts[0],
      dateParts[1] - 1,
      dateParts[2].substr(0, 2),
      dateParts[2].substr(3, 2),
      dateParts[2].substr(6, 2),
      dateParts[2].substr(9, 2)
    );
    events[i].end = new Date(
      edateParts[0],
      edateParts[1] - 1,
      edateParts[2].substr(0, 2),
      edateParts[2].substr(3, 2),
      edateParts[2].substr(6, 2),
      edateParts[2].substr(9, 2)
    );
  }
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

  const eventStyleGetter = (event) => {
    // console.log(event);

    var style = {
      backgroundColor: event.color,
      borderRadius: '0px',
      //opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
      bold: 'true',
    };
    return {
      style: style,
    };
  };

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
    console.error('Error fetching data:', error);
    return {
      props: {
        serializedData: [],
      },
    };
  }
}

export default CustomCalendar;
