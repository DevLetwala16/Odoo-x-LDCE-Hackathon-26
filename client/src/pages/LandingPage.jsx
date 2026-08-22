import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Compass } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import FilterBar from '../components/common/FilterBar';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import cityService from '../services/cityService';
import tripService from '../services/tripService';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [cities, setCities] = useState([]);
  const [recentTrips, setRecentTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [citiesData, tripsData] = await Promise.all([
          cityService.getCities({ limit: 6, sortBy: 'popularity' }),
          tripService.getTrips({ limit: 3 })
        ]);
        setCities(citiesData || []);
        setRecentTrips(tripsData || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <PageShell>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Empowering Personalized Travel Planning</h1>
          <p className={styles.heroSubtitle}>Create custom itineraries, manage budgets, and explore the world with your AI travel companion.</p>
          <Button 
            variant="accent" 
            size="lg" 
            className={styles.ctaButton}
            onClick={() => navigate('/trips/new')}
          >
            Plan a Trip
          </Button>
        </div>
      </div>

      <div className={styles.filterSection}>
        <FilterBar 
          searchValue={searchValue}
          onSearch={setSearchValue}
          placeholder="Search destinations, activities..."
        />
      </div>

      {loading ? (
        <Loader fullScreen={false} text="Loading dashboard..." />
      ) : (
        <>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Compass className={styles.sectionIcon} /> 
                Popular Destinations
              </h2>
            </div>
            
            <div className={styles.grid}>
              {cities.length > 0 ? (
                cities.map(city => (
                  <Card key={city._id} hoverable className={styles.cityCard} onClick={() => navigate(`/search?city=${city._id}`)}>
                    <div className={styles.cityImage} style={{ backgroundImage: `url(${city.image || 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=400'})` }}>
                      <div className={styles.cityOverlay}>
                        <h3 className={styles.cityName}>{city.name}</h3>
                        <p className={styles.cityCountry}>{city.country}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className={styles.emptyText}>No destinations found.</p>
              )}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <Calendar className={styles.sectionIcon} /> 
                Recent Trips
              </h2>
            </div>
            
            {recentTrips.length > 0 ? (
              <div className={styles.tripsGrid}>
                {recentTrips.map(trip => (
                  <Card key={trip._id} hoverable className={styles.tripCard} onClick={() => navigate(`/trips/${trip._id}`)}>
                    <div className={styles.tripInfo}>
                      <h3 className={styles.tripName}>{trip.name}</h3>
                      <div className={styles.tripMeta}>
                        <Calendar size={14} /> 
                        <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className={styles.tripMeta}>
                        <MapPin size={14} /> 
                        <span>{trip.destinations?.length || 0} Destinations</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className={styles.emptyStateCard}>
                <div className={styles.emptyStateContent}>
                  <div className={styles.emptyStateIconWrapper}>
                    <MapPin size={32} />
                  </div>
                  <h3 className={styles.emptyStateTitle}>Start your first journey</h3>
                  <p className={styles.emptyStateText}>You haven't planned any trips yet. Create your first itinerary now!</p>
                  <Button variant="outline" onClick={() => navigate('/trips/new')}>
                    Create a Trip
                  </Button>
                </div>
              </Card>
            )}
          </section>
        </>
      )}
    </PageShell>
  );
};

export default LandingPage;
