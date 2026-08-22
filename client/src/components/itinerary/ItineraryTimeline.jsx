import React from 'react';
import styles from './ItineraryTimeline.module.css';

const ItineraryTimeline = ({ stops = [], activeDay, onSelectDay }) => {
  // Generate days based on stops arrival/departure dates
  const days = [];
  stops.forEach((stop, stopIndex) => {
    if (!stop.arrivalDate || !stop.departureDate) return;
    
    let current = new Date(stop.arrivalDate);
    const end = new Date(stop.departureDate);
    
    while (current <= end) {
      days.push({
        date: new Date(current),
        stop: stop,
        stopIndex,
        activityCount: stop.activities?.length || 0 // Assuming simplified distribution
      });
      current.setDate(current.getDate() + 1);
    }
  });

  return (
    <div className={styles.timeline}>
      {days.length === 0 ? (
        <div className={styles.empty}>No dates scheduled yet</div>
      ) : (
        days.map((day, idx) => {
          const isActive = activeDay === idx;
          const dayNumber = idx + 1;
          
          return (
            <div 
              key={idx} 
              className={`${styles.dayItem} ${isActive ? styles.active : ''}`}
              onClick={() => onSelectDay(idx)}
            >
              <div className={styles.lineIndicator}>
                <div className={styles.dot}></div>
              </div>
              
              <div className={styles.dayContent}>
                <div className={styles.dayHeader}>
                  <span className={styles.dayTitle}>Day {dayNumber}</span>
                  <span className={styles.date}>{day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className={styles.city}>{day.stop.city?.name || day.stop.title}</div>
                {day.activityCount > 0 && (
                  <div className={styles.activityBadge}>{day.activityCount} activities</div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ItineraryTimeline;
