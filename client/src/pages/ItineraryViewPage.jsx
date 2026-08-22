import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Map, DollarSign, Edit, CalendarDays } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import tripService from '../services/tripService';
import styles from './ItineraryViewPage.module.css';

const ItineraryViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('itinerary');

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        const data = await tripService.getTripById(id);
        setTrip(data);
      } catch (error) {
        console.error('Failed to load trip', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTrip();
  }, [id]);

  if (loading) return <PageShell><Loader text="Loading trip details..." /></PageShell>;
  if (!trip) return <PageShell><div className={styles.error}>Trip not found</div></PageShell>;

  return (
    <PageShell>
      <div className={styles.hero} style={{ backgroundImage: `url(${trip.coverImage || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80'})` }}>
        <div className={styles.heroOverlay}>
          <div className={styles.heroContent}>
            <h1 className={styles.tripName}>{trip.name}</h1>
            <div className={styles.tripMeta}>
              <span className={styles.metaItem}><CalendarIcon size={16} /> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
              <span className={styles.metaItem}><DollarSign size={16} /> Budget: ${trip.totalBudget}</span>
            </div>
          </div>
          <div className={styles.heroActions}>
            <Button variant="outline" onClick={() => navigate(`/trips/${trip._id}/calendar`)} className={styles.actionBtn}>
              <CalendarDays size={16} /> Calendar View
            </Button>
            <Button variant="accent" onClick={() => navigate(`/trips/${trip._id}/edit`)}>
              <Edit size={16} /> Edit Itinerary
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'itinerary' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('itinerary')}
        >
          Day-wise Itinerary
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'budget' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('budget')}
        >
          Budget Breakdown
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'itinerary' ? (
          <div className={styles.itinerarySection}>
            {trip.stops && trip.stops.length > 0 ? (
              trip.stops.map((stop, index) => (
                <Card key={stop._id || index} className={styles.dayCard}>
                  <div className={styles.dayHeader}>
                    <h3 className={styles.dayTitle}>
                      <Map size={20} className={styles.dayIcon} />
                      {stop.city?.name || 'Stop'}
                    </h3>
                    <span className={styles.dayDates}>
                      {stop.startDate && new Date(stop.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.activitiesList}>
                    {stop.activities && stop.activities.length > 0 ? (
                      stop.activities.map(act => (
                        <div key={act._id} className={styles.activityItem}>
                          <div className={styles.activityTime}>TBD</div>
                          <div className={styles.activityDetails}>
                            <h4 className={styles.activityName}>{act.name}</h4>
                            {act.price && <span className={styles.activityPrice}>${act.price}</span>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={styles.emptyText}>No activities scheduled for this stop.</p>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className={styles.emptyCard}>
                <p>No stops added to this itinerary yet.</p>
                <Button variant="primary" onClick={() => navigate(`/trips/${trip._id}/edit`)}>Add Stops</Button>
              </Card>
            )}
          </div>
        ) : (
          <div className={styles.budgetSection}>
            <Card className={styles.budgetSummaryCard}>
              <h3 className={styles.cardTitle}>Budget Summary</h3>
              <div className={styles.budgetStats}>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Total Budget</span>
                  <span className={styles.statValue}>${trip.totalBudget || 0}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Estimated Cost</span>
                  <span className={`${styles.statValue} ${styles.warning}`}>$0 (TBD)</span>
                </div>
              </div>
              <p className={styles.emptyText}>Detailed budget breakdown will be available as you add expenses.</p>
            </Card>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default ItineraryViewPage;
