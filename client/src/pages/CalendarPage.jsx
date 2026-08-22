import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import FilterBar from '../components/common/FilterBar';
import Card from '../components/common/Card';
import tripService from '../services/tripService';
import calendarService from '../services/calendarService';
import styles from './CalendarPage.module.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarPage = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trips, setTrips] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoading(true);
      try {
        if (calendarService && calendarService.getCalendarTrips) {
          const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
          const res = await calendarService.getCalendarTrips(monthStr);
          if (res.success && res.data?.tripBlocks) {
            setTrips(res.data.tripBlocks);
            return;
          }
        }
        const tripsRes = await tripService.getTrips({});
        setTrips(tripsRes?.trips || tripsRes?.data?.trips || tripsRes || []);
      } catch (err) {
        console.error('Failed to load calendar trips:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendarData();
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Generate calendar grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  return (
    <PageShell 
      sectionLabel="Screen 11" 
      title="Calendar View Screen"
      subtitle="Visualized day-by-day scheduling for your trips and activities."
    >
      <div className={styles.container}>
        {/* Screen 11 Controls: Search bar | Filter */}
        <FilterBar 
          searchValue={searchValue}
          onSearch={setSearchValue}
          placeholder="Search calendar events..."
          sortOptions={[
            { label: 'Month View', value: 'month' },
            { label: 'Upcoming', value: 'upcoming' },
          ]}
        />

        <Card className={styles.calendarCard}>
          <div className={styles.calendarHeaderRow}>
            <h2 className={styles.calendarTitle}>Calendar View</h2>
            <div className={styles.monthNavigator}>
              <button onClick={handlePrevMonth} className={styles.navArrowBtn}>
                <ChevronLeft size={18} />
              </button>
              <span className={styles.monthDisplay}>
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <button onClick={handleNextMonth} className={styles.navArrowBtn}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className={styles.calendarGrid}>
            {/* Weekday headers */}
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className={styles.weekdayHeader}>
                {day}
              </div>
            ))}

            {/* Empty padding days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className={styles.emptyDayCell} />
            ))}

            {/* Month Day Cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const cellDate = new Date(currentYear, currentMonth, dayNumber);
              cellDate.setHours(0, 0, 0, 0);

              const matchingTrips = trips.filter(t => {
                const start = new Date(t.startDate);
                const end = new Date(t.endDate);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return cellDate >= start && cellDate <= end;
              });

              return (
                <div key={dayNumber} className={styles.dayCell}>
                  <span className={styles.dayNumber}>{dayNumber}</span>
                  <div className={styles.dayEvents}>
                    {matchingTrips.map((t, idx) => (
                      <div 
                        key={idx} 
                        className={styles.tripBadge}
                        onClick={() => navigate(`/trips/${t._id}`)}
                        title={`${t.name || t.title} (₹${t.totalBudget || 0})`}
                      >
                        {t.name || t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </PageShell>
  );
};

export default CalendarPage;
