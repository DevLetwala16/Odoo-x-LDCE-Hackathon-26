import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import styles from './CalendarPage.module.css';

const CalendarPage = () => {
  const navigate = useNavigate();
  // Mock calendar placeholder
  
  return (
    <PageShell title="Calendar View">
      <div className={styles.header}>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back to Itinerary
        </Button>
      </div>
      <Card className={styles.calendarCard}>
        <div className={styles.placeholder}>
          <h2>Calendar View</h2>
          <p>This is a placeholder for the calendar integration.</p>
          <div className={styles.grid}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={styles.dayHeader}>{day}</div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className={styles.dayCell}>
                {i + 1 <= 31 ? i + 1 : ''}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </PageShell>
  );
};

export default CalendarPage;
