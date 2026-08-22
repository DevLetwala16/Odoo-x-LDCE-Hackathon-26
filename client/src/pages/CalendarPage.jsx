import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import styles from './CalendarPage.module.css';

const CalendarPage = () => {
  const navigate = useNavigate();
  
  return (
    <PageShell 
      sectionLabel="08 — CALENDAR" 
      title="Month view"
      subtitle="Visualized day-by-day scheduling for your trips and activities."
    >
      <div className={styles.header}>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          ← Back to Itinerary
        </Button>
      </div>
      <Card className={styles.calendarCard}>
        <div className={styles.placeholder}>
          <h2>Calendar Integration</h2>
          <p>Visualizing scheduled activities and multi-city stops across your travel dates.</p>
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
