import React from 'react';
import styles from './CalendarView.module.css';

const CalendarView = ({ trip, stops = [] }) => {
  if (!trip?.startDate || !trip?.endDate) {
    return <div className={styles.empty}>Trip dates are not set.</div>;
  }

  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const days = [];
  let current = new Date(start);

  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Find stop for a specific date
  const getStopForDate = (date) => {
    return stops.find(stop => {
      if (!stop.arrivalDate || !stop.departureDate) return false;
      const arrival = new Date(stop.arrivalDate);
      const departure = new Date(stop.departureDate);
      return date >= arrival && date <= departure;
    });
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <h3>Trip Calendar</h3>
      </div>
      <div className={styles.grid}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className={styles.dayOfWeek}>{day}</div>
        ))}
        
        {/* Empty cells for padding */}
        {Array.from({ length: start.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className={`${styles.cell} ${styles.emptyCell}`}></div>
        ))}

        {days.map((date, i) => {
          const stop = getStopForDate(date);
          const isToday = new Date().toDateString() === date.toDateString();
          
          return (
            <div key={i} className={`${styles.cell} ${isToday ? styles.today : ''}`}>
              <div className={styles.dateNumber}>{date.getDate()}</div>
              {stop && (
                <div className={styles.stopEvent}>
                  <div className={styles.eventName}>{stop.city?.name || stop.title}</div>
                  {stop.activities && stop.activities.length > 0 && (
                    <div className={styles.activityDot}></div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
