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
    id: 0,
    title: 'Langley 7-9pm',
    start: new Date(2023, 9, 16, 19, 0, 0),
    end: new Date(2023, 9, 16, 21, 0, 0),
    resourceId: 1,
  },
  {
    id: 1,
    title: 'MS training',
    allDay: true,
    start: new Date(2018, 0, 29, 14, 0, 0),
    end: new Date(2018, 0, 29, 16, 30, 0),
    resourceId: 2,
  },
  {
    id: 2,
    title: 'Team lead meeting',
    start: new Date(2018, 0, 29, 8, 30, 0),
    end: new Date(2018, 0, 29, 12, 30, 0),
    resourceId: 3,
  },
  {
    id: 11,
    title: 'Birthday Party',
    start: new Date(2018, 0, 30, 7, 0, 0),
    end: new Date(2018, 0, 30, 10, 30, 0),
    resourceId: 4,
  },
];

const resourceMap = [
  { resourceId: 1, resourceTitle: '7:00-9:00pm' },
  { resourceId: 2, resourceTitle: 'Training room' },
  { resourceId: 3, resourceTitle: 'Meeting room 1' },
  { resourceId: 4, resourceTitle: 'Meeting room 2' },
];

const styles = {
  container: {
    width: '80wh',
    height: '60vh',
    margin: '2em',
  },
};

export default function CustomCalendar() {
  return (
    <div style={styles.container}>
      <BigCalendar
        selectable={false}
        localizer={localizer}
        events={events}
        defaultView={Views.MONTH}
        views={[Views.MONTH]}
        defaultDate={new Date()}
        resources={resourceMap}
        resourceIdAccessor='resourceId'
        resourceTitleAccessor='resourceTitle'
      />
    </div>
  );
}
