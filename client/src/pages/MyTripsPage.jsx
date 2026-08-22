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
import { getTripCoverImage } from '../utils/tripCover';
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

  const ongoingTrips = filteredTrips.filter(t => getTripStatus(t.startDate, t.endDate) === 'ongoing');
  const upcomingTrips = filteredTrips.filter(t => getTripStatus(t.startDate, t.endDate) === 'upcoming');
  const completedTrips = filteredTrips.filter(t => getTripStatus(t.startDate, t.endDate) === 'completed');

  const totalStops = trips.reduce((sum, t) => sum + (t.stops?.length || 0), 0);

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
          backgroundImage: `url(${getTripCoverImage(trip)})` 
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
            <MapPin size={14} /> {trip.stops?.length || 0} Stops
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
    <PageShell 
      sectionLabel="03 — JOURNEYS" 
      title="Trips in motion"
      subtitle="Manage your upcoming adventures, ongoing travels, and completed memories."
    >
      <div className={styles.container}>
        {/* Top Summary Stats Bar (Matching ODOO-LDCE) */}
        {!loading && (
          <div className={styles.statsBar}>
            <div className={styles.statCell}>
              <p className={styles.statNumber}>{trips.length}</p>
              <p className={styles.statLabel}>Total Trips</p>
            </div>
            <div className={styles.statCell}>
              <p className={styles.statNumber}>{totalStops}</p>
              <p className={styles.statLabel}>Cities Queued</p>
            </div>
            <div className={styles.statCell}>
              <p className={styles.statNumber}>{upcomingTrips.length}</p>
              <p className={styles.statLabel}>Upcoming Trips</p>
            </div>
          </div>
        )}

        {/* FilterBar & Search */}
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
            {/* Ongoing Section */}
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

            {/* Upcoming Section */}
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

            {/* Completed Section */}
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
