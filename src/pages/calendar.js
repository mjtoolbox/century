import React, { useEffect, useRef, useCallback } from 'react';
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
} from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('en-ca');
//momentLocalizer(moment);

const localizer = momentLocalizer(moment);

const events = [
  {
    title: 'Langley 7-9pm',
    start: new Date(2023, 9, 16, 19, 0, 0),
    end: new Date(2023, 9, 16, 21, 0, 0),
    type: 1,
  },
  {
    title: 'Coq Harbour View 7:30-9pm',
    allDay: true,
    start: new Date(2023, 9, 20, 19, 30, 0),
    end: new Date(2023, 9, 20, 21, 0, 0),
    type: 2,
  },
];

const styles = {
  container: {
    width: '80wh',
    height: '60vh',
    margin: '2em',
  },
};

export default function CustomCalendar() {
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
      window.alert(calEvent.title);
    }, 250);
  }, []);

  const eventStyleGetter = (event) => {
    console.log(event);
    // var backgroundColor = '#' + event.hexColor;
    if (event.type === 1) {
      var color = 'red';
    }
    var style = {
      backgroundColor: color,
      borderRadius: '0px',
      opacity: 0.8,
      color: 'black',
      border: '0px',
      display: 'block',
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
}
