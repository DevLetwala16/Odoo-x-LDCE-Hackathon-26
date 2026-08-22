import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Plus, ArrowRight, DollarSign } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import FilterBar from '../components/common/FilterBar';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import tripService from '../services/tripService';
import { getTripStatus } from '../utils/tripStatus';
import styles from './MyTripsPage.module.css';

const MyTripsPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [sortBy, setSortBy] = useState('startDate');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const res = await tripService.getTrips({});
        const tripList = res?.trips || res?.data?.trips || res || [];
        setTrips(tripList);
      } catch (error) {
        console.error('Failed to fetch trips:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const filteredTrips = trips.filter(trip => 
    trip.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    (trip.description && trip.description.toLowerCase().includes(searchValue.toLowerCase()))
  );

  // Group trips into 3 categories matching Wireframe Screen 6:
  const ongoingTrips = filteredTrips.filter(t => getTripStatus(t.startDate, t.endDate) === 'ongoing');
  const upcomingTrips = filteredTrips.filter(t => getTripStatus(t.startDate, t.endDate) === 'upcoming');
  const completedTrips = filteredTrips.filter(t => getTripStatus(t.startDate, t.endDate) === 'completed');

  const renderTripCard = (trip, statusVariant) => (
    <Card 
      key={trip._id} 
      hoverable 
      className={styles.horizontalTripCard} 
      onClick={() => navigate(`/trips/${trip._id}`)}
    >
      <div 
        className={styles.tripImage} 
        style={{ 
          backgroundImage: `url(${trip.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=400'})` 
        }}
      />
      <div className={styles.tripOverview}>
        <div className={styles.tripHeaderRow}>
          <h3 className={styles.tripTitle}>{trip.name}</h3>
          <Badge variant={statusVariant}>
            {getTripStatus(trip.startDate, trip.endDate).toUpperCase()}
          </Badge>
        </div>

        <p className={styles.tripShortOverview}>
          {trip.description || 'Short Overview of the Trip — Personalized itinerary with stops and activities.'}
        </p>

        <div className={styles.tripMetaRow}>
          <span className={styles.metaItem}>
            <Calendar size={14} /> 
            {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
          </span>
          <span className={styles.metaItem}>
            <DollarSign size={14} /> Budget: ₹{trip.totalBudget || 0}
          </span>
          <span className={styles.metaItem}>
            <MapPin size={14} /> {trip.stops?.length || 0} Sections
          </span>
        </div>
      </div>
      <div className={styles.viewAction}>
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/trips/${trip._id}`); }}>
          View Itinerary <ArrowRight size={14} />
        </Button>
      </div>
    </Card>
  );

  return (
    <PageShell title="User Trip Listing">
      <div className={styles.container}>
        {/* Top Header & CTA */}
        <div className={styles.topHeader}>
          <div>
            <h1 className={styles.pageHeading}>User Trip Listing</h1>
            <p className={styles.pageSubheading}>Track your ongoing, upcoming, and completed travel plans</p>
          </div>
          <Button variant="accent" onClick={() => navigate('/trips/new')}>
            <Plus size={16} /> Plan a New Trip
          </Button>
        </div>

        {/* FilterBar (Wireframe Screen 6) */}
        <FilterBar 
          searchValue={searchValue}
          onSearch={setSearchValue}
          placeholder="Search your trips by name or destination..."
          sortOptions={[
            { label: 'Start Date (Upcoming)', value: 'startDate' },
            { label: 'Trip Name (A-Z)', value: 'name' },
            { label: 'Budget', value: 'totalBudget' },
          ]}
          sortValue={sortBy}
          onSort={setSortBy}
        />

        {loading ? (
          <Loader text="Loading your trips..." />
        ) : (
          <div className={styles.categoriesContainer}>
            {/* ── Category 1: Ongoing (Wireframe Screen 6) ── */}
            <section className={styles.categorySection}>
              <div className={styles.categoryHeader}>
                <h2 className={styles.categoryTitle}>Ongoing</h2>
                <span className={styles.countBadge}>{ongoingTrips.length}</span>
              </div>
              <div className={styles.tripsList}>
                {ongoingTrips.length > 0 ? (
                  ongoingTrips.map(trip => renderTripCard(trip, 'accent'))
                ) : (
                  <div className={styles.emptyCategory}>No ongoing trips at the moment.</div>
                )}
              </div>
            </section>

            {/* ── Category 2: Upcoming (Wireframe Screen 6) ── */}
            <section className={styles.categorySection}>
              <div className={styles.categoryHeader}>
                <h2 className={styles.categoryTitle}>Upcoming</h2>
                <span className={styles.countBadge}>{upcomingTrips.length}</span>
              </div>
              <div className={styles.tripsList}>
                {upcomingTrips.length > 0 ? (
                  upcomingTrips.map(trip => renderTripCard(trip, 'primary'))
                ) : (
                  <div className={styles.emptyCategory}>No upcoming trips planned yet.</div>
                )}
              </div>
            </section>

            {/* ── Category 3: Completed (Wireframe Screen 6) ── */}
            <section className={styles.categorySection}>
              <div className={styles.categoryHeader}>
                <h2 className={styles.categoryTitle}>Completed</h2>
                <span className={styles.countBadge}>{completedTrips.length}</span>
              </div>
              <div className={styles.tripsList}>
                {completedTrips.length > 0 ? (
                  completedTrips.map(trip => renderTripCard(trip, 'success'))
                ) : (
                  <div className={styles.emptyCategory}>No completed past trips found.</div>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default MyTripsPage;
