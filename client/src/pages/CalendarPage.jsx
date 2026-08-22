import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft, Calendar as CalendarIcon, MapPin, Activity } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import FilterBar from '../components/common/FilterBar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import tripService from '../services/tripService';
import styles from './CalendarPage.module.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [allTrips, setAllTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (id) {
          const tripRes = await tripService.getTripById(id);
          const currentTrip = tripRes?.trip || tripRes?.data?.trip || tripRes;
          setTrip(currentTrip);
          if (currentTrip?.startDate) {
            setCurrentDate(new Date(currentTrip.startDate));
          }
        } else {
          const res = await tripService.getTrips({});
          setAllTrips(res?.trips || res?.data?.trips || res || []);
        }
      } catch (err) {
        console.error('Failed to fetch calendar data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Compute calendar days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const activeStops = trip?.stops || [];

  const getEventsForDate = (dateNum) => {
    const checkDate = new Date(year, month, dateNum);
    const events = [];

    // Check stops in current trip
    activeStops.forEach(stop => {
      const arr = new Date(stop.arrivalDate);
      const dep = new Date(stop.departureDate);
      if (checkDate >= new Date(arr.setHours(0,0,0,0)) && checkDate <= new Date(dep.setHours(23,59,59,999))) {
        events.push({
          type: 'stop',
          title: stop.city?.name || stop.title || 'Stop',
          stop
        });
      }
    });

    // Check all trips if generic calendar view
    if (!trip && allTrips.length > 0) {
      allTrips.forEach(t => {
        const s = new Date(t.startDate);
        const e = new Date(t.endDate);
        if (checkDate >= new Date(s.setHours(0,0,0,0)) && checkDate <= new Date(e.setHours(23,59,59,999))) {
          events.push({
            type: 'trip',
            title: t.name,
            trip: t
          });
        }
      });
    }

    return events;
  };

  return (
    <PageShell title="Calendar View">
      <div className={styles.container}>
        {/* Header and FilterBar (Wireframe Screen 11) */}
        <div className={styles.topBar}>
          <div>
            <h1 className={styles.title}>Calendar View</h1>
            <p className={styles.subtitle}>
              {trip ? `Viewing schedule for: ${trip.name}` : 'Overview of all scheduled travel dates'}
            </p>
          </div>
          {trip && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/trips/${trip._id}`)}>
              <ArrowLeft size={16} /> Back to Itinerary
            </Button>
          )}
        </div>

        <FilterBar 
          searchValue={searchValue}
          onSearch={setSearchValue}
          placeholder="Search calendar events..."
        />

        {loading ? (
          <Loader text="Rendering calendar..." />
        ) : (
          <div className={styles.calendarLayout}>
            {/* ── Screen 11: Interactive Month Calendar Card ── */}
            <Card className={styles.calendarCard}>
              <div className={styles.monthNavHeader}>
                <button onClick={prevMonth} className={styles.navBtn}>
                  <ChevronLeft size={20} />
                </button>
                <h2 className={styles.monthLabel}>
                  {MONTH_NAMES[month]} {year}
                </h2>
                <button onClick={nextMonth} className={styles.navBtn}>
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Day names row */}
              <div className={styles.dayNamesGrid}>
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <div key={day} className={styles.dayNameCell}>{day}</div>
                ))}
              </div>

              {/* Date cells grid */}
              <div className={styles.datesGrid}>
                {/* Empty cells before start of month */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className={styles.emptyDateCell}></div>
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dateNum = i + 1;
                  const events = getEventsForDate(dateNum);
                  const hasEvents = events.length > 0;
                  const isToday = new Date().toDateString() === new Date(year, month, dateNum).toDateString();

                  return (
                    <div 
                      key={`day-${dateNum}`}
                      className={`${styles.dateCell} ${hasEvents ? styles.hasEventsCell : ''} ${isToday ? styles.todayCell : ''}`}
                      onClick={() => setSelectedDayEvents({ date: `${MONTH_NAMES[month]} ${dateNum}, ${year}`, events })}
                    >
                      <span className={styles.dateNumber}>{dateNum}</span>
                      {hasEvents && (
                        <div className={styles.eventPills}>
                          {events.map((ev, idx) => (
                            <span key={idx} className={styles.eventPill}>
                              {ev.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Day details popover / sidebar */}
            {selectedDayEvents && (
              <Card className={styles.dayDetailsCard}>
                <h3 className={styles.dayDetailsTitle}>
                  <CalendarIcon size={18} /> Schedule for {selectedDayEvents.date}
                </h3>
                {selectedDayEvents.events.length > 0 ? (
                  <div className={styles.eventDetailsList}>
                    {selectedDayEvents.events.map((ev, i) => (
                      <div key={i} className={styles.eventDetailItem}>
                        <div className={styles.eventDetailHeader}>
                          <MapPin size={16} className={styles.eventIcon} />
                          <strong>{ev.title}</strong>
                        </div>
                        {ev.stop?.activities && ev.stop.activities.length > 0 && (
                          <div className={styles.stopActivitiesList}>
                            <p className={styles.activitiesHead}>Activities:</p>
                            {ev.stop.activities.map(a => (
                              <span key={a._id} className={styles.activityBadge}>
                                • {a.name} (₹{a.estimatedCost || 0})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noEventsText}>No activities or stops scheduled for this day.</p>
                )}
              </Card>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default CalendarPage;
