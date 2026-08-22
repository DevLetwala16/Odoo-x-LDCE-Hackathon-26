import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import FilterBar from '../components/common/FilterBar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import tripService from '../services/tripService';
import styles from './CalendarPage.module.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 1)); // Default Jan 2024 matching wireframe
  const [trips, setTrips] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await tripService.getTrips({});
        const tripList = res?.trips || res?.data?.trips || res || [];
        setTrips(tripList);
      } catch (err) {
        console.error('Failed to load trips for calendar:', err);
      }
    };
    fetchTrips();
  }, []);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Generate calendar grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Mock / real highlighted trips matching Screen 11 wireframe
  const tripHighlights = [
    { title: 'PARIS TRIP', startDay: 10, endDay: 14, color: 'var(--color-primary)' },
    { title: 'ROME EXPLORATION', startDay: 16, endDay: 22, color: 'var(--color-accent)' },
    { title: 'TOKYO GETAWAY', startDay: 24, endDay: 28, color: 'var(--color-success)' },
  ];

  return (
    <PageShell 
      sectionLabel="Screen 11" 
      title="Calendar View Screen"
      subtitle="Visualized day-by-day scheduling for your trips and activities."
    >
      <div className={styles.container}>
        {/* Screen 11 Controls: Search bar | Group by | Filter | Sort by */}
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
              const matchingTrips = tripHighlights.filter(
                t => dayNumber >= t.startDay && dayNumber <= t.endDay
              );

              return (
                <div key={dayNumber} className={styles.dayCell}>
                  <span className={styles.dayNumber}>{dayNumber}</span>
                  <div className={styles.dayEvents}>
                    {matchingTrips.map((t, idx) => (
                      <div 
                        key={idx} 
                        className={styles.tripBadge}
                        style={{ backgroundColor: t.color }}
                      >
                        {dayNumber === t.startDay ? `${t.title} ${t.startDay}-${t.endDay}` : '•'}
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
