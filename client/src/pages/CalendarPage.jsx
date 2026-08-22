import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import calendarService from '../services/calendarService';
import styles from './CalendarPage.module.css';

const CalendarPage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tripBlocks, setTripBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const res = await calendarService.getCalendarTrips(currentMonth);
        if (res.success) {
          setTripBlocks(res.data.tripBlocks);
        }
      } catch (error) {
        console.error('Failed to fetch calendar trips', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate calendar grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const gridCells = [];
  for (let i = 0; i < firstDay; i++) gridCells.push(null);
  for (let i = 1; i <= daysInMonth; i++) gridCells.push(new Date(year, month, i));
  while (gridCells.length % 7 !== 0) gridCells.push(null);

  return (
    <PageShell 
      sectionLabel="08 — CALENDAR" 
      title="Global Calendar"
      subtitle="Visualized day-by-day scheduling for your trips."
    >
      <div className={styles.header}>
        <div className={styles.monthControls}>
          <Button variant="outline" size="sm" onClick={handlePrevMonth}><ChevronLeft size={16} /></Button>
          <h2 className={styles.monthTitle}>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" size="sm" onClick={handleNextMonth}><ChevronRight size={16} /></Button>
        </div>
      </div>
      
      <Card className={styles.calendarCard}>
        {loading ? (
          <div className={styles.loaderContainer} style={{ padding: '40px', textAlign: 'center' }}>
            <Loader2 className={styles.spinner} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div className={styles.grid}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className={styles.dayHeader}>{day}</div>
            ))}
            {gridCells.map((date, i) => {
              const hasTrip = date && tripBlocks.some(t => {
                const start = new Date(t.startDate);
                const end = new Date(t.endDate);
                start.setHours(0,0,0,0);
                end.setHours(23,59,59,999);
                return date >= start && date <= end;
              });

              return (
                <div key={i} className={`${styles.dayCell} ${date ? styles.activeCell : ''} ${hasTrip ? styles.hasTrip : ''}`}>
                  {date ? date.getDate() : ''}
                  {hasTrip && <div className={styles.tripIndicator}></div>}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </PageShell>
  );
};

export default CalendarPage;
